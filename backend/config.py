import os
from dotenv import load_dotenv

# Load local environment files
load_dotenv()

class Config:
    # API & LLM
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "mock_key_development_mode")
    IS_MOCK_LLM = GROQ_API_KEY == "mock_key_development_mode" or not GROQ_API_KEY
    
    # MongoDB Database
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/self_evolving")
    
    # Firebase Authentications
    FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY", "mock_firebase_key")
    FIREBASE_AUTH_DOMAIN = os.getenv("FIREBASE_AUTH_DOMAIN", "mock-auth.firebaseapp.com")
    FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "mock-project")
    
    # Twilio Communications
    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "mock_twilio_sid")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "mock_twilio_token")
    TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
    IS_MOCK_TWILIO = TWILIO_ACCOUNT_SID == "mock_twilio_sid" or not TWILIO_ACCOUNT_SID
    
    # SendGrid Communications
    SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "mock_sendgrid_key")
    SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL", "alerts@research-evolve.ai")
    IS_MOCK_SENDGRID = SENDGRID_API_KEY == "mock_sendgrid_key" or not SENDGRID_API_KEY

    # Application details
    JWT_SECRET = os.getenv("JWT_SECRET", "quantum_super_secure_key_123!")
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    PORT = int(os.getenv("PORT", "8000"))

settings = Config()
