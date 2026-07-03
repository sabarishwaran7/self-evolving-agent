import datetime
import logging
import requests
from backend.config import settings
from backend.database import DatabaseHelper

logger = logging.getLogger("notifications")

class NotificationService:
    @staticmethod
    async def send_notification(user_id: str, n_type: str, event: str, recipient: str, message: str, subject: str = "") -> dict:
        """Dispatches WhatsApp or Email notifications via Twilio & SendGrid, falls back to rich logging."""
        status = "simulated"
        
        # 1. Handle WhatsApp notification
        if n_type in ["whatsapp", "both"]:
            if settings.IS_MOCK_TWILIO:
                logger.info(f"[SIMULATED WHATSAPP] To {recipient}: {message}")
            else:
                try:
                    # Twilio WhatsApp REST API Trigger
                    twilio_url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
                    payload = {
                        "From": settings.TWILIO_WHATSAPP_NUMBER,
                        "To": f"whatsapp:{recipient}" if not recipient.startswith("whatsapp:") else recipient,
                        "Body": message
                    }
                    auth = (settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                    res = requests.post(twilio_url, data=payload, auth=auth, timeout=5)
                    if res.status_code in [200, 201]:
                        status = "sent"
                    else:
                        status = f"twilio_error_{res.status_code}"
                        logger.error(f"Twilio API Error: {res.text}")
                except Exception as e:
                    status = f"twilio_failed_{str(e)[:20]}"
                    logger.error(f"Twilio connection failed: {e}")

        # 2. Handle Email notification
        if n_type in ["email", "both"]:
            email_status = "simulated"
            if settings.IS_MOCK_SENDGRID:
                logger.info(f"[SIMULATED EMAIL] To {recipient} [{subject}]: {message}")
            else:
                try:
                    # SendGrid Web API v3
                    sendgrid_url = "https://api.sendgrid.com/v3/mail/send"
                    headers = {
                        "Authorization": f"Bearer {settings.SENDGRID_API_KEY}",
                        "Content-Type": "application/json"
                    }
                    payload = {
                        "personalizations": [{"to": [{"email": recipient}]}],
                        "from": {"email": settings.SENDGRID_FROM_EMAIL, "name": "Self-Evolving AI Research"},
                        "subject": subject or "AI Agent Alert",
                        "content": [{"type": "text/html", "value": f"<div style='font-family:sans-serif;color:#1e293b;padding:20px;'><h2 style='color:#6366f1;'>AI Research Portal</h2><p>{message}</p><hr/><span style='font-size:12px;color:#94a3b8;'>Self-Evolving Multi-Agent Platform</span></div>"}]
                    }
                    res = requests.post(sendgrid_url, json=payload, headers=headers, timeout=5)
                    if res.status_code in [200, 202]:
                        email_status = "sent"
                    else:
                        email_status = f"sendgrid_error_{res.status_code}"
                        logger.error(f"SendGrid API Error: {res.text}")
                except Exception as e:
                    email_status = f"sendgrid_failed_{str(e)[:20]}"
                    logger.error(f"SendGrid connection failed: {e}")
            
            # Combine statuses
            if status == "simulated":
                status = email_status
            elif email_status != "sent" and "failed" in email_status:
                status += f" & {email_status}"

        # Write record to notifications database
        notify_doc = {
            "userId": user_id,
            "type": n_type,
            "event": event,
            "recipient": recipient,
            "subject": subject,
            "message": message,
            "status": status,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        
        saved = await DatabaseHelper.insert("notifications", notify_doc)
        return saved
