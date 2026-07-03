from fastapi import APIRouter, Depends, HTTPException
from backend.models import DiagramGenerateRequest, DiagramResponse
from backend.services.auth import AuthService
from backend.services.diagram import DiagramService
from backend.database import DatabaseHelper

router = APIRouter(prefix="/diagrams", tags=["Diagram Generator"])

@router.post("/generate", response_model=DiagramResponse)
async def generate_diagram(body: DiagramGenerateRequest, user_payload: dict = Depends(AuthService.verify_token)):
    user_id = user_payload.get("sub")
    
    # Trigger Diagram Agent and build Mermaid codes
    diag = await DiagramService.generate_diagram(user_id, body.prompt, body.diagramType)
    
    return DiagramResponse(
        id=diag["_id"],
        prompt=diag["prompt"],
        diagramType=diag["diagramType"],
        mermaidCode=diag["mermaidCode"],
        createdAt=diag["createdAt"]
    )

@router.get("", response_model=list)
async def get_user_diagrams(user_payload: dict = Depends(AuthService.verify_token)):
    user_id = user_payload.get("sub")
    diagrams = await DatabaseHelper.find("diagrams", {"userId": user_id})
    
    formatted = []
    for d in diagrams:
        formatted.append({
            "id": d["_id"],
            "prompt": d.get("prompt", ""),
            "diagramType": d.get("diagramType", "flowchart"),
            "mermaidCode": d.get("mermaidCode", ""),
            "createdAt": d.get("createdAt", "")
        })
    return formatted
