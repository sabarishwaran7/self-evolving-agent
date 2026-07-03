import os
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import List, Optional
from backend.models import PaperGenerateRequest, PaperResponse
from backend.services.auth import AuthService
from backend.services.agents import MultiAgentOrchestrator
from backend.services.pdf_docx import DocumentCompilerService
from backend.services.pdf_parser import DocumentParserService
from backend.database import DatabaseHelper
import datetime

router = APIRouter(prefix="/papers", tags=["Research Papers"])

# Define temp directory for files compiled in local workspace
TEMP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "temp")
os.makedirs(TEMP_DIR, exist_ok=True)

@router.post("/generate", response_model=PaperResponse)
async def generate_paper(body: PaperGenerateRequest, user_payload: dict = Depends(AuthService.verify_token)):
    user_id = user_payload.get("sub")
    
    # 1. Orchestrate agents workflow (Research, formatting, plagiarism, diagram, rewrite, notification)
    paper_result = await MultiAgentOrchestrator.run_paper_generator_workflow(
        user_id=user_id,
        title=body.title,
        format_style=body.format,
        author=body.authorName,
        institution=body.institution,
        include_flow_diagram=body.includeFlowDiagram,
        custom_headings=body.customHeadings
    )
    
    # Add userId and insert to DB
    paper_result["userId"] = user_id
    paper_result["authorEmail"] = body.authorEmail
    saved_paper = await DatabaseHelper.insert("papers", paper_result)
    
    # 2. Pre-compile PDF & DOCX in the background cache so downloads are instantaneous
    pdf_path = os.path.join(TEMP_DIR, f"{saved_paper['_id']}.pdf")
    docx_path = os.path.join(TEMP_DIR, f"{saved_paper['_id']}.docx")
    
    DocumentCompilerService.compile_pdf(saved_paper, pdf_path)
    DocumentCompilerService.compile_docx(saved_paper, docx_path)
    
    return PaperResponse(
        id=saved_paper["_id"],
        title=saved_paper["title"],
        format=saved_paper["format"],
        abstract=saved_paper["abstract"],
        sections=saved_paper["sections"],
        references=saved_paper["references"],
        plagiarismScore=saved_paper["plagiarismScore"],
        status=saved_paper["status"],
        createdAt=saved_paper["createdAt"]
    )

@router.post("/generate/advanced", response_model=PaperResponse)
async def generate_advanced_paper(
    title: str = Form(...),
    abstract_notes: Optional[str] = Form(None),
    problem_statement: Optional[str] = Form(None),
    methodology_notes: Optional[str] = Form(None),
    reference_paper: Optional[UploadFile] = File(None),
    diagram_images: Optional[List[UploadFile]] = File(None),
    include_flow_diagram: bool = Form(True),
    custom_headings: Optional[str] = Form(None),
    user_payload: dict = Depends(AuthService.verify_token)
):
    user_id = user_payload.get("sub")
    
    reference_text = ""
    if reference_paper:
        content = await reference_paper.read()
        reference_text = DocumentParserService.extract_text_from_file(content, reference_paper.filename)
        
    diagram_info = []
    if diagram_images:
        for img in diagram_images:
            if img.filename:
                diagram_info.append(img.filename)

    paper_result = await MultiAgentOrchestrator.run_advanced_template_workflow(
        user_id=user_id,
        title=title,
        abstract_notes=abstract_notes,
        problem_statement=problem_statement,
        methodology_notes=methodology_notes,
        reference_text=reference_text,
        diagram_info=diagram_info,
        include_flow_diagram=include_flow_diagram,
        custom_headings=custom_headings
    )
    
    paper_result["userId"] = user_id
    saved_paper = await DatabaseHelper.insert("papers", paper_result)
    
    pdf_path = os.path.join(TEMP_DIR, f"{saved_paper['_id']}.pdf")
    docx_path = os.path.join(TEMP_DIR, f"{saved_paper['_id']}.docx")
    
    DocumentCompilerService.compile_pdf(saved_paper, pdf_path)
    DocumentCompilerService.compile_docx(saved_paper, docx_path)
    
    return PaperResponse(
        id=saved_paper["_id"],
        title=saved_paper["title"],
        format=saved_paper["format"],
        abstract=saved_paper["abstract"],
        sections=saved_paper["sections"],
        references=saved_paper["references"],
        plagiarismScore=saved_paper["plagiarismScore"],
        status=saved_paper["status"],
        createdAt=saved_paper["createdAt"]
    )

@router.post("/analyze-template")
async def analyze_template(
    reference_paper: UploadFile = File(...),
    user_payload: dict = Depends(AuthService.verify_token)
):
    try:
        content = await reference_paper.read()
        reference_text = DocumentParserService.extract_text_from_file(content, reference_paper.filename)
        
        sections = await MultiAgentOrchestrator.analyze_template_structure(reference_text)
        
        return {"success": True, "sections": sections}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=list)
async def get_user_papers(user_payload: dict = Depends(AuthService.verify_token)):
    user_id = user_payload.get("sub")
    papers = await DatabaseHelper.find("papers", {"userId": user_id})
    
    formatted = []
    for p in papers:
        formatted.append({
            "id": p["_id"],
            "title": p.get("title", ""),
            "format": p.get("format", "IEEE"),
            "abstract": p.get("abstract", ""),
            "sections": p.get("sections", {}),
            "references": p.get("references", []),
            "plagiarismScore": p.get("plagiarismScore", 0.0),
            "status": p.get("status", "completed"),
            "createdAt": p.get("createdAt", "")
        })
    return formatted

@router.get("/{paper_id}", response_model=PaperResponse)
async def get_paper_details(paper_id: str, user_payload: dict = Depends(AuthService.verify_token)):
    paper = await DatabaseHelper.find_one("papers", {"_id": paper_id})
    if not paper:
        raise HTTPException(status_code=404, detail="Research paper not found")
        
    return PaperResponse(
        id=paper["_id"],
        title=paper["title"],
        format=paper["format"],
        abstract=paper["abstract"],
        sections=paper["sections"],
        references=paper["references"],
        plagiarismScore=paper["plagiarismScore"],
        status=paper["status"],
        createdAt=paper["createdAt"]
    )

@router.get("/{paper_id}/download/pdf")
async def download_pdf(paper_id: str):
    # Verify paper exists
    paper = await DatabaseHelper.find_one("papers", {"_id": paper_id})
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
        
    pdf_path = os.path.join(TEMP_DIR, f"{paper_id}.pdf")
    
    # Re-compile if not exists
    if not os.path.exists(pdf_path):
        DocumentCompilerService.compile_pdf(paper, pdf_path)
        
    filename = f"{paper.get('title', 'paper').replace(' ', '_')[:30]}.pdf"
    return FileResponse(pdf_path, media_type="application/pdf", filename=filename)

@router.get("/{paper_id}/download/docx")
async def download_docx(paper_id: str):
    paper = await DatabaseHelper.find_one("papers", {"_id": paper_id})
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
        
    docx_path = os.path.join(TEMP_DIR, f"{paper_id}.docx")
    
    if not os.path.exists(docx_path):
        DocumentCompilerService.compile_docx(paper, docx_path)
        
    filename = f"{paper.get('title', 'paper').replace(' ', '_')[:30]}.docx"
    return FileResponse(docx_path, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", filename=filename)
