# Nexus: Lead Management, Seamless.

A comprehensive lead management application built with React, featuring AI-powered lead extraction, real-time LLM interaction, and workflow automation using React Flow.

## Features

### 1. Basic Lead Management Dashboard
- **Lead Storage**: Store leads with name, email, phone, status ("New"/"Contacted"), and source ("Manual"/"Document")
- **Interactive Table**: Display leads in a responsive table format
- **Filter Toggle**: Filter leads by status (All/New/Contacted) with button toggles
- **CRUD Operations**: 
  - Add new leads manually or via AI extraction
  - Update lead status between "New" and "Contacted"
  - Delete leads with confirmation
  - Interactive buttons for each lead

### 2. Lead Creation with AI-Powered Extraction
- **Manual Entry Form**: Create leads by filling out name, email, and phone fields
- **Document Upload**: Drag-and-drop interface for PDF/Image files (JPG, PNG, BMP, TIFF, GIF, WEBP)
- **AI Extraction**: Real AI (Tesseract OCR + SpaCy NLP) extracts lead information from uploaded documents, including names from letterheads/circulars below signatures.
- **Dual Input Methods**: Support both manual entry and AI-powered document processing

### 3. Lead Interaction with Real-time LLM
- **Dynamic Interaction**: "Interact" button opens a chat-like modal for each lead
- **Real LLM Responses**: Google Gemini API provides intelligent, contextual AI responses based on lead details and conversation history.
- **Contextual Suggestions**: AI provides follow-up suggestions and lead insights.
- **Chat Interface**: Real-time conversation with the AI assistant, with proper scrolling and message display.

### 4. Workflow Designer with React Flow
- **Visual Canvas**: Interactive React Flow canvas for workflow design
- **Fixed Trigger Node**: "Lead Created" trigger node (green, always present)
- **Action Nodes**: 
  - "Send Email" nodes (blue) for email automation
  - "Update Status" nodes (orange) for status changes
- **Node Connections**: Drag-and-drop connections between nodes (up to 3 action nodes)
- **Workflow Execution**: 
  - Save workflow state in React
  - Execute workflows with logging
  - Toast notifications for user feedback
- **Colorful Styling**: Each node type has distinct colors and styling

### 5. Responsive UI with Tailwind CSS
- **Modern Design**: Clean, professional interface using Tailwind CSS
- **Responsive Layout**: Works on desktop and mobile devices
- **Component Library**: Uses shadcn/ui components for consistency
- **Interactive Elements**: Hover states, transitions, and micro-interactions

## Technology Stack

- **Frontend**: React 19.1.0 with Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Workflow**: React Flow for visual workflow design
- **Icons**: Lucide React icons
- **State Management**: React useState hooks
- **Build Tool**: Vite for fast development and building
- **Backend**: Flask (Python)
- **OCR**: Tesseract, pdf2image, Pillow
- **NLP**: SpaCy (`en_core_web_sm` model)
- **LLM**: Google Gemini API (`gemini-1.5-flash-latest`)
- **Database**: MongoDB (via PyMongo)

## Project Structure

```
mini-crm/
├── mini-crm-app/
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/            # Images and static files
│   │   ├── components/
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── CreateLeadModal.jsx # Lead creation with AI extraction
│   │   │   ├── LeadInteractionModal.jsx # LLM chat interaction
│   │   │   └── WorkflowDesigner.jsx  # React Flow workflow component
│   │   ├── App.jsx            # Main application component
│   │   ├── App.css            # Tailwind CSS styles
│   │   ├── index.css          # Global styles
│   │   └── main.jsx           # Application entry point
│   ├── index.html             # HTML template
│   ├── package.json           # Dependencies and scripts
│   ├── vite.config.js         # Vite configuration
│   └── README.md              # This file
├── ai-backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── ai.py          # AI service endpoints (OCR, LLM)
│   │   │   └── db.py          # Database connection
│   │   └── main.py            # Flask application entry point
│   ├── venv/                  # Python virtual environment
│   ├── .env                   # Environment variables (e.g., GEMINI_API_KEY)
│   └── requirements.txt       # Python dependencies
└── AI_Integration_Outline.md  # Detailed AI integration guide
```

## Installation and Setup

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
pip install google-generativeai spacy pymongo dnspython python-dotenv

# Download SpaCy English model
python -m spacy download en_core_web_sm

# Create a .env file and add your Gemini API Key
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

## Usage Guide

### Adding Leads
1. Click the "Add Lead" button in the header
2. Fill out the form manually OR upload a PDF/Image document for AI extraction
3. Click "Add Lead" to save

### Managing Leads
1. Use the filter buttons (All/New/Contacted) to view specific lead types
2. Click "Mark Contacted" or "Mark New" to update lead status
3. Click the message icon to interact with the AI about a specific lead
4. Click the trash icon to delete a lead

### Workflow Design
1. Scroll down to the "Workflow Designer with React Flow" section
2. Click "Add Send Email" or "Add Update Status" to add action nodes
3. Drag from the small circles on nodes to connect them
4. Click "Execute" to run the workflow and see results in the execution log
5. Click "Save" to save the current workflow state

### AI Interaction
1. Click the message icon next to any lead
2. Type questions about the lead in the chat interface
3. Receive AI-generated responses from Google Gemini with suggestions and insights
4. Close the modal when finished

## Features Demonstration

The application includes sample data to demonstrate all features:
- 3 pre-loaded leads with different statuses and sources
- Real AI responses for lead interaction (Gemini API)
- Real AI extraction for document processing (Tesseract + SpaCy)
- Workflow execution simulation with logging
- Toast notifications for user feedback

## Development Notes

- The AI extraction and LLM responses are now integrated with real AI services.
- React Flow provides the visual workflow designer functionality.
- Leads are persisted in a MongoDB database.
- Responsive design ensures compatibility across devices.
- Tailwind CSS provides consistent styling throughout the application.

## Future Enhancements

- Email automation integration
- Advanced workflow triggers and conditions
- User authentication and multi-tenancy
- Analytics and reporting features

## License

This project is created for demonstration purposes as part of a lead management system implementation.



