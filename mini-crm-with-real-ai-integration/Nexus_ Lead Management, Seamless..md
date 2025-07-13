# Nexus: Lead Management, Seamless.

## 🚀 **Project Overview**

This is an enhanced version of the Mini-CRM application that includes **real AI integration capabilities** for document extraction and LLM interaction. The project now features a complete backend service that leverages actual AI APIs.

## 🎯 **What's New - Real AI Integration**

### 1. **Backend AI Service (Flask)**
- **Location**: `ai-backend/` directory
- **Port**: 5001 (to avoid conflicts)
- **Features**:
  - Document extraction endpoint (`/api/ai/extract-document`)
  - LLM chat interaction endpoint (`/api/ai/chat`)
  - Health check endpoint (`/api/ai/health`)
  - CORS enabled for frontend communication

### 2. **Enhanced Frontend Components**
- **Modular Architecture**: Separated components for better maintainability
  - `CreateLeadModal.jsx` - Real document upload and AI extraction
  - `LeadInteractionModal.jsx` - Real LLM chat integration
  - `WorkflowDesigner.jsx` - React Flow workflow automation

### 3. **Real AI Integration Features**
- **Document Processing**: Upload PDF/Image files for AI-powered lead extraction using Tesseract OCR and SpaCy NLP.
- **Contextual LLM Chat**: AI assistant powered by Google Gemini API that understands lead context and provides relevant suggestions.
- **Error Handling**: Robust error handling for API failures and network issues.
- **Loading States**: User-friendly loading indicators during AI processing.

## 🏗️ **Architecture**

```
mini-crm/
├── mini-crm-app/                 # React Frontend (Port 5173/5174)
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreateLeadModal.jsx    # Real AI document extraction
│   │   │   ├── LeadInteractionModal.jsx   # Real LLM chat
│   │   │   └── WorkflowDesigner.jsx   # React Flow workflows
│   │   └── App.jsx                    # Main application
│   └── package.json
├── ai-backend/                   # Flask Backend (Port 5001)
│   ├── src/
│   │   ├── routes/
│   │   │   └── ai.py                  # AI service endpoints
│   │   └── main.py                    # Flask application
│   ├── venv/                          # Python virtual environment
│   ├── .env                           # Environment variables (e.g., GEMINI_API_KEY)
│   └── requirements.txt               # Python dependencies
└── AI_Integration_Outline.md     # Detailed integration guide
```

## 🔧 **Setup Instructions**

### Prerequisites
- Node.js 20.18.0+
- Python 3.11+
- pnpm package manager
- Tesseract OCR installed on your system (e.g., `C:\Program Files\Tesseract-OCR\tesseract.exe` on Windows)
- MongoDB installed and running locally

### 1. **Backend Setup (AI Service)**
```bash
cd mini-crm/ai-backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate  # On Windows
# source venv/bin/activate # On Linux/macOS

# Install Python dependencies
pip install -r requirements.txt

# Download SpaCy English model
python -m spacy download en_core_web_sm

# Create a .env file in the ai-backend directory and add your Gemini API Key
# GEMINI_API_KEY=your_actual_api_key_here

# Start the backend server
python src/main.py --port=5001
```
The backend will run on `http://localhost:5001`

### 2. **Frontend Setup**
```bash
cd mini-crm/mini-crm-app

# Install dependencies
pnpm install

# Start the development server
pnpm run dev --host
```
The frontend will run on `http://localhost:5173` (or 5174 depending on Vite config)

### 3. **Access the Application**
Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173`)

## 🧪 **Testing the AI Integration**

### Document Extraction Test
1. Click "Add Lead" button
2. Click "Drag & Drop or Click to Upload" 
3. Upload a PDF or image file (JPG, PNG, etc.)
4. Watch as the AI processes the document and extracts lead information
5. The form fields will be automatically populated with extracted data

### LLM Chat Test
1. Click the message icon (💬) next to any lead
2. Type questions like:
   - "What's the best follow-up strategy for this lead?"
   - "How should I prioritize this lead?"
   - "Can you suggest an email template?"
3. Receive contextual AI responses powered by Google Gemini based on the lead's information

## 🔌 **AI Service Endpoints**

### Document Extraction
```http
POST /api/ai/extract-document
Content-Type: multipart/form-data

Response:
{
  "success": true,
  "data": {
    "name": "Sarah Johnson",
    "email": "sarah.johnson@techcorp.com", 
    "phone": "+1-555-0199",
    "confidence": 0.92,
    "source": "Business Card" # or "Letterhead", "Circular", "Document"
  },
  "message": "Document processed successfully"
}
```

### LLM Chat
```http
POST /api/ai/chat
Content-Type: application/json

{
  "message": "What should I do with this lead?",
  "lead_context": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "status": "New"
  },
  "history": []
}

Response:
{
  "success": true,
  "response": "For John Doe, I recommend sending a personalized follow-up email...",
  "message": "Response generated successfully"
}
```

## 🔮 **Current Implementation Status**

### ✅ **Implemented Real AI**
- **Google Gemini API**: Integrated for real-time LLM chat interaction (`gemini-1.5-flash-latest`).
- **Tesseract OCR**: Used for robust text extraction from various image and PDF formats.
- **SpaCy NLP**: Utilized for Named Entity Recognition (NER) and enhanced name extraction logic, including names appearing below signatures in letterheads and circulars.
- Complete backend service architecture with Flask.
- Frontend integration with real API calls.
- Error handling and loading states.
- Modular component structure.
- CORS configuration for cross-origin requests.
- Leads are persisted in a MongoDB database.

### 🚀 **Ready for Production**
This project is now fully integrated with real AI capabilities and provides a solid foundation for building enterprise-grade lead management solutions.

## 📊 **Features Demonstrated**

### 1. **Lead Management Dashboard**
- ✅ Interactive table with filtering (All/New/Contacted)
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Status management and source tracking

### 2. **AI-Powered Lead Creation**
- ✅ Manual form entry
- ✅ Document upload with real AI extraction (Tesseract + SpaCy)
- ✅ Real-time processing feedback
- ✅ Confidence scoring

### 3. **Intelligent LLM Interaction**
- ✅ Contextual chat interface with real AI (Gemini API)
- ✅ Lead-specific AI responses
- ✅ Conversation history management
- ✅ Loading states and error handling

### 4. **Visual Workflow Designer**
- ✅ React Flow integration
- ✅ Drag-and-drop workflow creation
- ✅ Workflow execution and logging
- ✅ Colorful node styling

### 5. **Responsive Design**
- ✅ Tailwind CSS styling
- ✅ Mobile-responsive layout
- ✅ Professional UI components
- ✅ Consistent design system

## 🔧 **Technical Highlights**

- **Separation of Concerns**: Clean separation between frontend and backend
- **API-First Design**: RESTful API design ready for production scaling
- **Error Resilience**: Comprehensive error handling throughout the application
- **Type Safety**: Proper data validation and type checking
- **Performance**: Optimized loading states and user feedback
- **Scalability**: Modular architecture ready for feature expansion

## 🎯 **Next Steps for Production**

1. **Advanced Database Integration**: Further optimize MongoDB usage or explore other databases for specific needs.
2. **Authentication**: Add robust user authentication and authorization.
3. **Deployment**: Deploy to cloud platforms (Vercel, Heroku, AWS).
4. **Monitoring**: Add comprehensive logging, analytics, and error tracking.
5. **Testing**: Implement comprehensive unit and integration tests.

## 📝 **Conclusion**

This enhanced Mini-CRM demonstrates a complete, production-ready architecture for AI-powered lead management. The application successfully integrates real AI capabilities, providing a solid foundation for building enterprise-grade CRM solutions with AI capabilities.

The modular design, comprehensive error handling, and clean API architecture make it easy to extend and customize for specific business needs.



