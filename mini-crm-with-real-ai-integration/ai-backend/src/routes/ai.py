from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import tempfile
import pytesseract
from PIL import Image
from pdf2image import convert_from_bytes
import re
import spacy
from pymongo import MongoClient
from dotenv import load_dotenv
import openai
import traceback
import io
import google.generativeai as genai

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client["crm"]
leads_collection = db["leads"]

# Load environment variables
load_dotenv()

# Load SpaCy NLP model
nlp = None
try:
    nlp = spacy.load("en_core_web_sm")
except Exception as e:
    print(f"Error loading SpaCy model: {e}")
    print("SpaCy NLP functionality will be limited.")

# Configure Tesseract path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash-latest")
else:
    model = None
    print("Warning: GEMINI_API_KEY not found in environment variables")

ai_bp = Blueprint("ai", __name__)

@ai_bp.route("/list-gemini-models", methods=["GET"])
def list_gemini_models():
    try:
        if not GEMINI_API_KEY:
            return jsonify({"error": "GEMINI_API_KEY not configured"}), 400

        genai.configure(api_key=GEMINI_API_KEY)
        models = [m.name for m in genai.list_models()]
        return jsonify({"available_models": models}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_bp.route("/extract-document", methods=["POST"])
def extract_document():
    tmp_path = None
    extracted_data = {}
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        filename = secure_filename(file.filename)
        file_extension = os.path.splitext(filename)[1].lower()

        supported_formats = [".pdf", ".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".tif", ".gif", ".webp"]
        if file_extension not in supported_formats:
            return jsonify({"error": f"Unsupported file format. Supported formats: {', '.join(supported_formats)}"}), 400

        fd, tmp_path = tempfile.mkstemp(suffix=file_extension)
        os.close(fd)
        file.save(tmp_path)

        custom_config = r"--oem 3 --psm 11"
        if file_extension == ".pdf":
            with tempfile.TemporaryDirectory() as pdf2image_temp_dir:
                images = convert_from_bytes(open(tmp_path, "rb").read(), dpi=300, output_folder=pdf2image_temp_dir)
                text = "\n".join([pytesseract.image_to_string(img, config=custom_config) for img in images])
        else:
            img = Image.open(tmp_path)
            if img.mode not in ["RGB", "L"]:
                img = img.convert("RGB")
            if img.width < 300:
                scale_factor = 300 / img.width
                new_width = int(img.width * scale_factor)
                new_height = int(img.height * scale_factor)
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            text = pytesseract.image_to_string(img, config=custom_config)

        print("\n=== OCR TEXT ===\n", text)
        print("\n--- Starting business card extraction ---\n")

        extracted_data = extract_business_card_info(text)
        print(f"\n--- Extracted Data: {extracted_data} ---\n")

        insert_result = leads_collection.insert_one(extracted_data)
        extracted_data["_id"] = str(insert_result.inserted_id)

        print("\n--- Successfully inserted into MongoDB ---\n")
        confidence_percent = extracted_data["confidence"] * 100
        return jsonify({
            "success": True,
            "data": extracted_data,
            "message": f"Document processed successfully! Confidence: {confidence_percent:.1f}%"
        })

    except Exception as e:
        print(f"Error during document extraction or insertion: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

def extract_business_card_info(text):
    name = ""
    email = ""
    phone = ""
    confidence_score = 0.0

    text = text.strip()
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    print(f"[DEBUG] Inside extract_business_card_info. Input text: {text[:100]}...")
    print(f"[DEBUG] Lines extracted: {lines}")

    email_patterns = [
        r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
        r"E-mail\s*[:\-]?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})",
        r"Email\s*[:\-]?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})"
    ]

    for pattern in email_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            email = matches[0] if isinstance(matches[0], str) else matches[0]
            confidence_score += 0.4
            print(f"[DEBUG] Email found: {email}")
            break

    phone_patterns = [
        r"Tel\s*(?:no\.?)?\s*[:\-]?\s*(\+?\d[\d\s\-\(\)]{8,}\d)",
        r"Phone\s*[:\-]?\s*(\+?\d[\d\s\-\(\)]{8,}\d)",
        r"Mobile\s*[:\-]?\s*(\+?\d[\d\s\-\(\)]{8,}\d)",
        r"Contact\s*[:\-]?\s*(\+?\d[\d\s\-\(\)]{8,}\d)",
        r"(\+?\d{1,4}[\s\-]?\(?\d{2,}\)?(?:[\s\-]?\d{2,}){2,})",
        r"(\d{10,12})",
    ]

    for pattern in phone_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        if matches:
            phone_candidate = re.sub(r"[^\d+]", "", matches[0])
            if len(phone_candidate) >= 10:
                phone = matches[0].strip()
                confidence_score += 0.35
                print(f"[DEBUG] Phone found: {phone}")
                break

    if nlp:
        doc = nlp(text)
        person_entities = [ent.text.strip() for ent in doc.ents if ent.label_ == "PERSON"]
        print(f"[DEBUG] SpaCy person entities: {person_entities}")

        valid_names = []
        for person in person_entities:
            words = person.split()
            if 2 <= len(words) <= 4 and not any(word.lower() in ["sir", "madam", "dear", "mr", "mrs", "ms", "dr", "mister", "miss"] for word in words):
                valid_names.append(person)

        print(f"[DEBUG] Valid names after filtering: {valid_names}")
        if valid_names:
            name = valid_names[0]
            confidence_score += 0.2
            print(f"[DEBUG] Name found via SpaCy: {name}")

    if not name:
        name_patterns = [
            r"^[A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3}$",
            r"([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2})\s*(?:CEO|CTO|Manager|Director|Founder|President|Sales|Marketing|Engineer)",
        ]
        for pattern in name_patterns:
            matches = re.findall(pattern, text, re.MULTILINE)
            if matches:
                name = matches[0].strip()
                confidence_score += 0.15
                print(f"[DEBUG] Name found via regex fallback: {name}")
                break

    if email and phone and name:
        confidence_score = min(0.98, confidence_score + 0.05)
    elif (email and name) or (phone and name):
        confidence_score = min(0.90, confidence_score + 0.03)
    elif email or phone or name:
        confidence_score = min(0.70, confidence_score)
    else:
        confidence_score = 0.3

    print(f"[Business Card Extraction] Name: {name}, Email: {email}, Phone: {phone}, Confidence: {confidence_score}")

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "confidence": confidence_score,
        "source": "Business Card",
        "status": "New"
    }

@ai_bp.route("/chat", methods=["POST"])
def chat_with_llm():
    try:
        data = request.get_json()
        if not data or "message" not in data:
            return jsonify({"error": "No message provided"}), 400

        user_message = data["message"]
        lead_context = data.get("lead_context", {})
        conversation_history = data.get("history", [])

        if model:
            ai_response = generate_gemini_response(user_message, lead_context, conversation_history)
        else:
            ai_response = generate_mock_response(user_message, lead_context)

        return jsonify({
            "success": True,
            "response": ai_response,
            "message": "Response generated successfully"
        })

    except Exception as e:
        print(f"Chat error: {str(e)}")
        try:
            ai_response = generate_mock_response(data.get("message", ""), data.get("lead_context", {}))
            return jsonify({
                "success": True,
                "response": ai_response,
                "message": "Response generated successfully (fallback)"
            })
        except:
            return jsonify({"error": str(e)}), 500

@ai_bp.route("/leads", methods=["GET"])
def get_all_leads():
    leads = list(leads_collection.find({}))
    for lead in leads:
        lead["_id"] = str(lead["_id"])
    return jsonify({"leads": leads})

def generate_gemini_response(user_message, lead_context, conversation_history):
    try:
        name = lead_context.get("name", "this lead")
        email = lead_context.get("email", "unknown email")
        phone = lead_context.get("phone", "unknown phone")
        status = lead_context.get("status", "unknown status")
        source = lead_context.get("source", "unknown source")

        history_text = ""
        if conversation_history:
            history_text = "\n\nPrevious conversation:\n"
            for msg in conversation_history[-5:]:
                role = "User" if msg.get("role") == "user" else "Assistant"
                history_text += f"{role}: {msg.get('content', '')}\n"

        prompt = f"""You are an AI assistant helping with CRM lead management. You're currently discussing a lead with the following details:

Lead Information:
- Name: {name}
- Email: {email}
- Phone: {phone}
- Status: {status}
- Source: {source}

{history_text}

User's current message: "{user_message}"

Please provide a helpful, professional response that:
1. Addresses the user's specific question or request
2. Uses the lead's information contextually when relevant
3. Provides actionable CRM advice when appropriate
4. Maintains a conversational and helpful tone
5. Keeps responses concise but informative (2-3 sentences max)

If the user asks for:
- "Suggest follow-up" or "follow up": Provide specific follow-up recommendations
- "Lead details": Summarize the lead's key information
- "Email template": Suggest a brief email template
- "Next steps": Recommend concrete next actions

Response:"""

        response = model.generate_content(prompt)
        return response.text.strip()

    except Exception as e:
        print(f"Gemini API error: {str(e)}")
        return generate_mock_response(user_message, lead_context)

def generate_mock_response(user_message, lead_context):
    name = lead_context.get("name", "this lead")
    email = lead_context.get("email", "unknown email")
    status = lead_context.get("status", "unknown status")

    message_lower = user_message.lower()

    if "follow up" in message_lower or "next step" in message_lower:
        return f"For {name}, I recommend sending a personalized follow-up email to {email}. Since their status is '{status}', consider offering a product demo or scheduling a consultation call."

    elif "email" in message_lower:
        return f"Here's a suggested email template for {name}:\n\nSubject: Following up on your interest\n\nHi {name},\n\nThank you for your interest in our services. I'd love to schedule a brief call to discuss how we can help your business grow.\n\nBest regards"

    elif "priority" in message_lower or "important" in message_lower:
        if status == "New":
            return f"{name} is a new lead with status '{status}'. I recommend prioritizing outreach within 24 hours to maximize conversion potential."
        else:
            return f"{name} has been contacted before. Consider reviewing previous interactions and tailoring your approach accordingly."

    elif "convert" in message_lower or "close" in message_lower:
        return f"To convert {name}, focus on understanding their pain points and demonstrating clear value. Schedule a demo, provide case studies, and address any objections they might have."

    else:
        return f"Based on {name}'s profile (email: {email}, status: {status}), I suggest maintaining regular contact and providing valuable content to build trust and move them through the sales funnel."

@ai_bp.route("/generate-email", methods=["POST"])
def generate_email():
    data = request.get_json()
    name = data.get("name", "there")
    context = data.get("context", "")
    company = data.get("company", "Nexus")
    product = data.get("product", "our AI-powered CRM solution")

    email_text = f"""
Hi {name},

I hope this message finds you well! I'm following up regarding your interest in {product}. At {company}, we're passionate about helping businesses like yours streamline operations and engage customers more effectively.

If you have any questions or would like to explore how we can tailor {product} to your needs, I'd be happy to connect.

Looking forward to hearing from you!

Best regards,  
Team Nexus
Customer Success @ {company}
    """.strip()

    return jsonify({ "email": email_text })
