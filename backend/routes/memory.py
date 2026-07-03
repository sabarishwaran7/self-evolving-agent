from fastapi import APIRouter, Depends, HTTPException
from backend.models import FeedbackSubmitRequest, MemoryResponse
from backend.services.auth import AuthService
from backend.services.memory import MemoryService
from backend.database import DatabaseHelper

router = APIRouter(prefix="/memory", tags=["Self-Evolving Memory"])

@router.post("/feedback")
async def submit_user_feedback(body: FeedbackSubmitRequest, user_payload: dict = Depends(AuthService.verify_token)):
    user_id = user_payload.get("sub")
    
    # 1. Log raw feedback
    feedback_doc = {
        "userId": user_id,
        "entityType": body.entityType,
        "entityId": body.entityId,
        "feedback": body.feedback,
        "rating": body.rating
    }
    await DatabaseHelper.insert("feedback", feedback_doc)
    
    # 2. Derive category based on feedback content
    category = "general"
    lower_fb = body.feedback.lower()
    if "formal" in lower_fb or "vocabulary" in lower_fb or "word" in lower_fb:
        category = "vocabulary"
    elif "math" in lower_fb or "equation" in lower_fb or "formula" in lower_fb:
        category = "equations"
    elif "format" in lower_fb or "citation" in lower_fb or "reference" in lower_fb:
        category = "formatting"
    elif "explain" in lower_fb or "detail" in lower_fb or "architecture" in lower_fb:
        category = "depth"
        
    # 3. Derive learned patterns and insert into memory collection
    learned_pattern_doc = await MemoryService.add_feedback_to_memory(
        user_id=user_id,
        category=category,
        feedback_text=body.feedback,
        rating=body.rating
    )
    
    return {
        "message": "Feedback parsed successfully. Self-evolving intelligence updated.",
        "derived_category": category,
        "learned_rule": learned_pattern_doc.get("learnedPattern")
    }

@router.get("", response_model=list)
async def get_learned_patterns(user_payload: dict = Depends(AuthService.verify_token)):
    user_id = user_payload.get("sub")
    memories = await DatabaseHelper.find("ai_memory", {"userId": user_id})
    
    formatted = []
    for m in memories:
        formatted.append({
            "id": m["_id"],
            "learnedPattern": m.get("learnedPattern", ""),
            "category": m.get("category", "general"),
            "rating": m.get("rating", 5),
            "timestamp": m.get("timestamp", "")
        })
    return formatted
