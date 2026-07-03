from fastapi import APIRouter, Depends
from backend.models import NotificationSendRequest, NotificationLog
from backend.services.auth import AuthService
from backend.services.notifications import NotificationService
from backend.database import DatabaseHelper

router = APIRouter(prefix="/notifications", tags=["Notifications Panel"])

@router.post("/send")
async def send_custom_notification(body: NotificationSendRequest, user_payload: dict = Depends(AuthService.verify_token)):
    user_id = user_payload.get("sub")
    
    # Fire off notification service dispatches
    saved = await NotificationService.send_notification(
        user_id=user_id,
        n_type=body.type,
        event=body.event,
        recipient=body.recipient,
        message=body.message,
        subject=body.subject
    )
    return {"message": "Notification dispatched", "data": saved}

@router.get("", response_model=list)
async def get_notification_history(user_payload: dict = Depends(AuthService.verify_token)):
    user_id = user_payload.get("sub")
    history = await DatabaseHelper.find("notifications", {"userId": user_id})
    
    formatted = []
    for h in history:
        formatted.append({
            "id": h["_id"],
            "userId": h.get("userId", ""),
            "type": h.get("type", "email"),
            "event": h.get("event", ""),
            "recipient": h.get("recipient", ""),
            "status": h.get("status", "sent"),
            "timestamp": h.get("timestamp", "")
        })
    return formatted
