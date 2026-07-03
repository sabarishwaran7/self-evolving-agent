from fastapi import APIRouter, Depends
from backend.models import IdeaGenerateRequest, IdeaResponse, IdeaDetail
from backend.services.auth import AuthService
from backend.services.agents import MultiAgentOrchestrator
from backend.database import DatabaseHelper
import datetime

router = APIRouter(prefix="/ideas", tags=["Research Ideas"])

@router.post("/generate", response_model=IdeaResponse)
async def generate_ideas(body: IdeaGenerateRequest, user_payload: dict = Depends(AuthService.verify_token)):
    user_id = user_payload.get("sub")
    
    # 1. Run multi-agent idea synthesizer
    ideas_list = await MultiAgentOrchestrator.run_idea_generator_workflow(user_id, body.keywords)
    
    idea_doc = {
        "userId": user_id,
        "keywords": body.keywords,
        "ideas": ideas_list,
        "createdAt": datetime.datetime.utcnow().isoformat()
    }
    
    saved = await DatabaseHelper.insert("generated_ideas", idea_doc)
    
    # Convert list of dicts to IdeaDetail models
    details = [IdeaDetail(**item) for item in ideas_list]
    
    return IdeaResponse(
        id=saved["_id"],
        keywords=saved["keywords"],
        ideas=details,
        createdAt=saved["createdAt"]
    )

@router.get("", response_model=list)
async def get_idea_history(user_payload: dict = Depends(AuthService.verify_token)):
    user_id = user_payload.get("sub")
    history = await DatabaseHelper.find("generated_ideas", {"userId": user_id})
    
    formatted = []
    for h in history:
        formatted.append({
            "id": h["_id"],
            "keywords": h.get("keywords", ""),
            "ideas": [IdeaDetail(**item) for item in h.get("ideas", [])],
            "createdAt": h.get("createdAt", "")
        })
    return formatted
