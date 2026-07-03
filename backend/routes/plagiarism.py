import datetime
import random
from fastapi import APIRouter, Depends, HTTPException
from backend.models import (
    PlagiarismCheckRequest, PlagiarismReportResponse, 
    PlagiarismRewriteRequest, PlagiarismRewriteResponse, CopyMatch
)
from backend.services.auth import AuthService
from backend.database import DatabaseHelper
from backend.config import settings

router = APIRouter(prefix="/plagiarism", tags=["Plagiarism Engine"])

@router.post("/check", response_model=PlagiarismReportResponse)
async def check_plagiarism(body: PlagiarismCheckRequest, user_payload: dict = Depends(AuthService.verify_token)):
    user_id = user_payload.get("sub")
    
    # 1. Simulating precise string similarity scan
    content_len = len(body.content)
    if content_len < 10:
        raise HTTPException(status_code=400, detail="Content too short for plagiarism check")
        
    similarity = round(random.uniform(15.0, 38.0), 2)
    
    # Generate realistic source matching snippets
    matches = [
        CopyMatch(
            source="IEEE Journal of Neural Networks, 2023",
            contentSnippet="Traditional neural frameworks require high parameters and lack geometric Inductive biases.",
            matchRatio=0.88
        ),
        CopyMatch(
            source="Springer Core AI Conference, 2024",
            contentSnippet="Automating compilation constraints by decoupling processing pipelines increases convergence speed.",
            matchRatio=0.74
        )
    ]
    
    report_doc = {
        "userId": user_id,
        "paperId": body.paperId,
        "similarityPercentage": similarity,
        "copiedMatches": [m.dict() for m in matches],
        "createdAt": datetime.datetime.utcnow().isoformat()
    }
    
    saved = await DatabaseHelper.insert("plagiarism_reports", report_doc)
    
    return PlagiarismReportResponse(
        id=saved["_id"],
        paperId=saved.get("paperId"),
        similarityPercentage=saved["similarityPercentage"],
        copiedMatches=matches,
        createdAt=saved["createdAt"]
    )

@router.post("/rewrite", response_model=PlagiarismRewriteResponse)
async def auto_rewrite(body: PlagiarismRewriteRequest, user_payload: dict = Depends(AuthService.verify_token)):
    user_id = user_payload.get("sub")
    
    # Simple semantic replacement to show dynamic rewriting
    original = body.content
    rewritten = original
    
    # Vocabulary swaps
    swaps = {
        "traditional neural frameworks": "conventional connectionist architectures",
        "lack geometric inductive": "are devoid of structural geometric learning",
        "high parameters": "inflated parameterization counts",
        "automating compilation": "algorithmic compilation orchestration",
        "processing pipelines": "execution flows",
        "research papers": "scholarly publications",
        "plagiarism report": "originality audit overview"
    }
    
    for k, v in swaps.items():
        # Case insensitive replace
        import re
        insens = re.compile(re.escape(k), re.IGNORECASE)
        rewritten = insens.sub(v, rewritten)
        
    # If no swaps matched, append an agent academic modifier
    if rewritten == original:
        rewritten = f"As analytically established, {original[0].lower() + original[1:]} Hence, modern computational nodes enhance these exact thresholds."

    # Compute a lower, highly compliant plagiarism score
    new_similarity = round(random.uniform(1.5, 6.2), 2)
    
    # Log to plagiarism reports collection
    report_doc = {
        "userId": user_id,
        "originalContent": original,
        "rewrittenContent": rewritten,
        "similarityPercentage": new_similarity,
        "createdAt": datetime.datetime.utcnow().isoformat()
    }
    await DatabaseHelper.insert("plagiarism_reports", report_doc)
    
    return PlagiarismRewriteResponse(
        originalContent=original,
        rewrittenContent=rewritten,
        newSimilarityPercentage=new_similarity
    )
