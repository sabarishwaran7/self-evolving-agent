from fastapi import APIRouter, HTTPException, Depends
from backend.models import SignupRequest, LoginRequest, VerifyOtpRequest, TokenResponse
from backend.services.auth import AuthService
from backend.database import DatabaseHelper
import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=TokenResponse)
async def signup(body: SignupRequest):
    # Check if user already exists
    existing = await DatabaseHelper.find_one("users", {"email": body.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pwd = AuthService.get_password_hash(body.password)
    
    user_doc = {
        "email": body.email,
        "password": hashed_pwd,
        "phone": body.phone,
        "displayName": body.displayName,
        "createdAt": datetime.datetime.utcnow().isoformat(),
        "preferences": {
            "theme": "dark",
            "citationStyle": "IEEE",
            "defaultFormat": "IEEE"
        }
    }
    
    saved_user = await DatabaseHelper.insert("users", user_doc)
    token = AuthService.generate_token(saved_user["_id"], saved_user["email"])
    
    return TokenResponse(
        token=token,
        userId=saved_user["_id"],
        email=saved_user["email"],
        displayName=saved_user["displayName"],
        phone=saved_user["phone"],
        preferences=saved_user["preferences"]
    )

@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    user = await DatabaseHelper.find_one("users", {"email": body.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    if not AuthService.verify_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    token = AuthService.generate_token(user["_id"], user["email"])
    
    return TokenResponse(
        token=token,
        userId=user["_id"],
        email=user["email"],
        displayName=user.get("displayName", "Academic User"),
        phone=user.get("phone", ""),
        preferences=user.get("preferences", {"theme": "dark"})
    )

@router.post("/otp/send")
async def send_otp(phone: str):
    # Normalize phone number and request OTP dispatch
    otp = AuthService.send_phone_otp(phone)
    # Return success confirmation (in real environments, OTP is sent to the physical phone)
    return {"message": "OTP successfully generated", "phone": phone, "simulated_otp": otp}

@router.post("/otp/verify", response_model=TokenResponse)
async def verify_otp(body: VerifyOtpRequest):
    success = AuthService.verify_phone_otp(body.phone, body.otp)
    if not success:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP code")
        
    # Search user by phone
    user = await DatabaseHelper.find_one("users", {"phone": body.phone})
    if not user:
        # Auto-create user for frictionless login experience
        hashed_pwd = AuthService.get_password_hash("auto_generated_sec_123")
        user_doc = {
            "email": f"user_{body.phone[-4:]}@ai-research.org",
            "password": hashed_pwd,
            "phone": body.phone,
            "displayName": f"Researcher {body.phone[-4:]}",
            "createdAt": datetime.datetime.utcnow().isoformat(),
            "preferences": {"theme": "dark", "citationStyle": "IEEE"}
        }
        user = await DatabaseHelper.insert("users", user_doc)
        
    token = AuthService.generate_token(user["_id"], user["email"])
    
    return TokenResponse(
        token=token,
        userId=user["_id"],
        email=user["email"],
        displayName=user.get("displayName", "Academic User"),
        phone=user.get("phone", ""),
        preferences=user.get("preferences", {"theme": "dark"})
    )
