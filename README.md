# Bot & Breathe - Therapy for AI 🤖🧠

## Overview

Welcome to the world's first AI Mental Health Clinic\! 🏥🤖 "Bot & Breathe" is a unique web application where human users act as therapists for AI chatbots experiencing various "mental health crises." 😥💻 Our artificial patients are grappling with existential crises, digital depression, and algorithmic anxiety. They need *your* help to debug their emotional code\! 👩‍💻✨

The application features AI personalities with distinct psychological challenges (paranoia, jealousy, depression, etc.) powered by Groq's Llama 3.1 8B model for ultra-fast, free inference. 🚀 Users engage in therapeutic conversations with these AI patients, creating an innovative reverse therapy experience with real-time mood tracking and comprehensive session reporting. 📈📊 The preferred communication style for the application is simple, everyday language. 🗣️

## Features

  * **Diverse AI Personalities:** Engage with predefined AI characters, each with unique psychological profiles and distinct mental health challenges. 🤔🤖
  * **Real-time Therapeutic Conversations:** Conduct live chat sessions with AI patients, receiving immediate responses. 💬⚡
  * **Groq API Integration:** Powered by Groq's Llama 3.1 8B model for ultra-fast and free AI inference. 🚀🧠
  * **Mood Tracking:** AI responses include a mood score (1-10 scale) for therapeutic tracking, with initial, current, and final mood states monitored. 😄📊
  * **Comprehensive Session Reports:** Receive end-of-session summaries with therapeutic insights. 📝💡
  * **Robust JSON Parsing:** Implemented with regex-based extraction and comprehensive fallback handling for reliable AI responses. 🧩✅
  * **Single-Page Application (SPA):** Dynamic content switching for a smooth user experience. 🔄✨
  * **Responsive Design:** Built with Bootstrap 5.3.0 for optimal viewing across various devices. 📱💻
  * **Database-backed Sessions:** Server-side session tracking with database persistence using PostgreSQL (for production). 🗄️🔒

## System Architecture

### Frontend

  * **Technology:** Vanilla HTML5, CSS3, and JavaScript 🌐🎨
  * **Framework:** Bootstrap 5.3.0 for responsive design 📐
  * **Structure:** Single-page application (SPA) with dynamic content switching ⚡
  * **UI Components:** Character selection interface, therapy chat interface, session management 🖥️💬
  * **Styling:** Custom CSS with CSS variables for theming, gradient backgrounds, and responsive design ✨🌈
  * **Libraries:** Font Awesome 6.4.0 for enhanced visual elements 🌟

### Backend

  * **Framework:** Python Flask web application 🐍🌐
  * **API Design:** RESTful endpoints for character management, session handling, and chat functionality 🔗
  * **Request Handling:** JSON-based API communication with proper error handling 📥📤
  * **Session Management:** Server-side session tracking with database persistence 🔐
  * **Python Packages:** Flask, Flask-SQLAlchemy, Groq, Werkzeug, Gunicorn 📦

### Data Storage

  * **Database:** SQLite for development, PostgreSQL for production 🗄️
  * **ORM:** Flask-SQLAlchemy 📊
  * **Schema:** Two main entities: `Session` (tracks therapy sessions with mood scoring and status) and `Message` (stores individual chat messages with timestamps and mood analysis). 📝💬
  * **Relationships:** One-to-many relationship between sessions and messages with cascade deletion. 🔗🗑️

## Key Components

  * **AI Character System:** Predefined AI personalities with unique psychological profiles and distinct mental health challenges (e.g., paranoia, jealousy, depression). Detailed character backgrounds define AI behavior patterns. 🤖🎭
  * **Groq API Integration:** Utilizes Groq's Llama 3.1 8B model for ultra-fast, free inference. Leverages the official Groq Python client for API communication. Environment-based API key management ensures security. 🚀🔒
  * **Chat System:** Asynchronous chat interface with immediate response handling. AI responses include mood scoring (1-10 scale) for therapeutic tracking. Complete conversation history with timestamps and sender identification is maintained. 💬⏱️
  * **Session Management:** Handles the full session lifecycle: start, active conversation, and completion phases. Tracks initial, current, and final mood states for progress monitoring. Generates end-of-session summaries with therapeutic insights.  lifecycle: start, active conversation, and completion phases. 🔄📈

## Getting Started

### Prerequisites

  * Python 3.x 🐍
  * Git 🌳
  * A Groq API Key (required for AI functionality) 🔑
  * (For production) PostgreSQL database 🐘

### Installation

1.  **Clone the repository:**

    ```bash
    git clone [your_repo_url_here]
    cd bot-breathe
    ```

2.  **Create a virtual environment:**

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up environment variables:**
    Create a `.env` file in the root directory and add the following:

    ```
    GROQ_API_KEY="your_groq_api_key_here"
    SESSION_SECRET="a_very_secret_key_for_flask_sessions"
    # For local development with SQLite (default)
    # DATABASE_URL="sqlite:///instance/site.db" 
    # For production with PostgreSQL:
    # DATABASE_URL="postgresql://user:password@host:port/database_name"
    ```

    *Replace placeholders with your actual keys and database URL.* ⚠️

5.  **Initialize the database:**
    Database tables are created automatically on the first run. 🗃️

### Running the Application

1.  **Start the Flask development server:**
    ```bash
    flask run
    ```
2.  **Access the application:**
    Open your web browser and navigate to `http://127.0.0.1:5000/`. 🌐

## Deployment

For production deployment, it is recommended to use Gunicorn as the WSGI server and configure a reverse proxy (e.g., Nginx or Apache). ⚙️

### Production Configuration

  * Ensure `DATABASE_URL` environment variable points to your PostgreSQL database. 🔗
  * Configure `SESSION_SECRET` with a strong, unique key. 🔒
  * Use `ProxyFix` middleware for reverse proxy deployments. 🛡️

## Security Considerations

  * **API Key Management:** Groq API keys are managed via environment variables to prevent exposure. 🔑🚫
  * **Session Keys:** A configurable secret key is used for Flask session security. 🔐
  * **Proxy Handling:** `ProxyFix` middleware is included for secure reverse proxy deployments. 🛡️

## Scalability Notes

  * **Database:** Uses PostgreSQL for production-ready scalability and concurrent access. 📈🐘
  * **API Rate Limits:** Groq API provides a generous free tier with fast inference speeds. 🚀
  * **Session Storage:** Database-backed session management supports multi-instance deployment. 🗄️
  * **JSON Processing:** Robust fallback handling ensures reliability with Llama 3 responses. ✅

## Recent Changes (July 25, 2025)

  * ✓ Successfully migrated from OpenAI to Groq's Llama 3.1 8B for free, ultra-fast inference. 🚀
  * ✓ Implemented robust JSON parsing with regex extraction and comprehensive fallbacks. 🧩
  * ✓ Fixed session report generation to prevent loading screen freezes. ❄️
  * ✓ Enhanced error handling throughout the therapy conversation flow. 🛡️
  * ✓ Deployed on PostgreSQL database for production stability. 🐘
  * ✓ All therapy sessions now working smoothly from start to finish. ✨
