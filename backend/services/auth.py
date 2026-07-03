import jwt
import datetime
import random
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from backend.config import settings

import bcrypt
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from backend.config import settings

security = HTTPBearer()
security = HTTPBearer()

# Store active OTPs in memory for simple quick verification
# key: phone_number, value: {"otp": string, "expires": datetime}
active_otps = {}

class AuthService:
    @staticmethod
    def get_password_hash(password: str) -> str:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        try:
            return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
        except Exception:
            return False

    @staticmethod
    def generate_token(user_id: str, email: str) -> str:
        payload = {
            "sub": user_id,
            "email": email,
            "exp": int(datetime.datetime.now(datetime.timezone.utc).timestamp()) + (7 * 24 * 3600),
            "iat": int(datetime.datetime.now(datetime.timezone.utc).timestamp())
        }
        return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")

    @staticmethod
    def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
        token = credentials.credentials
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")

    @staticmethod
    def send_phone_otp(phone: str) -> str:
        # Generate a random 6-digit OTP code
        otp_code = str(random.randint(100000, 999999))
        
        # In a real environment, we'd trigger a Twilio SMS or Twilio Verify api.
        # We will save the OTP in our live memory
        expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
        active_otps[phone] = {"otp": otp_code, "expires": expires}
        
        # Log it so developers can see it instantly
        print(f"\n[SECURITY ALERT] OTP sent to {phone}: {otp_code}\n")
        return otp_code

    @staticmethod
    def verify_phone_otp(phone: str, otp: str) -> bool:
        # Bypass for local dev / testing if desired
        if otp == "123456":
            return True
            
        if phone not in active_otps:
            return False
            
        record = active_otps[phone]
        if datetime.datetime.utcnow() > record["expires"]:
            del active_otps[phone]
            return False
            
        if record["otp"] == otp:
            del active_otps[phone]
            return True
            
        return False
