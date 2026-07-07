import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import init_db
from backend.routes import auth, papers, ideas, plagiarism, diagrams, notifications, memory, dashboard

app = FastAPI(
    title="Self-Evolving Multi-Agent AI Research Assistant",
    description="Futuristic AI-powered platform for academic research synthesis, document drafting, diagram creation, and plagiarism reductions.",
    version="1.0.0"
)

# Enable CORS for React Frontend integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup hook to initialize MongoDB Atlas or trigger standard In-Memory fallbacks
@app.on_event("startup")
async def startup_db_client():
    await init_db()

# Mount routers
app.include_router(auth.router, prefix="/api")
app.include_router(papers.router, prefix="/api")
app.include_router(ideas.router, prefix="/api")
app.include_router(plagiarism.router, prefix="/api")
app.include_router(diagrams.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(memory.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Self-Evolving Multi-Agent AI Research Assistant Backend API",
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
