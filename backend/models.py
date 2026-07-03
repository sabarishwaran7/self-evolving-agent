from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# Authentication schemas
class SignupRequest(BaseModel):
    email: str
    password: str
    phone: str
    displayName: str

class LoginRequest(BaseModel):
    email: str
    password: str

class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str

class TokenResponse(BaseModel):
    token: str
    refresh_token: str = ""
    userId: str
    email: str
    displayName: str
    phone: str
    preferences: Dict[str, Any]

class UpdatePreferencesRequest(BaseModel):
    preferences: Dict[str, Any]

# Research Paper schemas
class PaperGenerateRequest(BaseModel):
    title: str
    format: str = "IEEE"  # IEEE, Springer, Journal, Conference, College
    keywords: Optional[List[str]] = []
    authorName: Optional[str] = "Academic Researcher"
    authorEmail: Optional[str] = ""
    institution: Optional[str] = "AI Research Institute"
    includeFlowDiagram: bool = True
    customHeadings: Optional[str] = ""

class PaperResponse(BaseModel):
    id: str
    title: str
    format: str
    abstract: str
    sections: Dict[str, str]
    references: List[str]
    plagiarismScore: float
    status: str
    createdAt: str

# Research Idea schemas
class IdeaGenerateRequest(BaseModel):
    keywords: str
    category: Optional[str] = "Computer Science"

class IdeaDetail(BaseModel):
    title: str
    gap: str
    innovations: str
    enhancement: str
    existingComplexity: str

class IdeaResponse(BaseModel):
    id: str
    keywords: str
    ideas: List[IdeaDetail]
    createdAt: str

# Plagiarism schemas
class PlagiarismCheckRequest(BaseModel):
    content: str
    paperId: Optional[str] = None

class CopyMatch(BaseModel):
    source: str
    contentSnippet: str
    matchRatio: float

class PlagiarismReportResponse(BaseModel):
    id: str
    paperId: Optional[str] = None
    similarityPercentage: float
    copiedMatches: List[CopyMatch]
    createdAt: str

class PlagiarismRewriteRequest(BaseModel):
    content: str

class PlagiarismRewriteResponse(BaseModel):
    originalContent: str
    rewrittenContent: str
    newSimilarityPercentage: float

# Diagram schemas
class DiagramGenerateRequest(BaseModel):
    prompt: str
    diagramType: str = "flowchart"  # flowchart, sequence, architecture, class

class DiagramResponse(BaseModel):
    id: str
    prompt: str
    diagramType: str
    mermaidCode: str
    svgRepresentation: Optional[str] = None
    createdAt: str

# Notification schemas
class NotificationSendRequest(BaseModel):
    type: str  # email, whatsapp, both
    event: str  # login_success, paper_completed, plagiarism_report
    recipient: str
    subject: Optional[str] = ""
    message: str

class NotificationLog(BaseModel):
    id: str
    userId: str
    type: str
    event: str
    recipient: str
    status: str
    timestamp: str

# Memory & Feedback schemas
class FeedbackSubmitRequest(BaseModel):
    entityType: str  # paper, idea
    entityId: str
    feedback: str
    rating: int = Field(..., ge=1, le=5)

class MemoryResponse(BaseModel):
    id: str
    learnedPattern: str
    category: str
    rating: int
    timestamp: str
