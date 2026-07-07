import uvicorn
import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

@app.get("/api/health")
async def root():
    return {
        "status": "online",
        "service": "Self-Evolving Multi-Agent AI Research Assistant Backend API",
        "environment": settings.ENVIRONMENT
    }

# Mount the React frontend dynamically if it has been built (in production)
frontend_dist = os.path.join(os.path.dirname(__file__), "../frontend/dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Check if the requested file actually exists (e.g. vite.svg, manifest.json)
        potential_file = os.path.join(frontend_dist, full_path)
        if os.path.isfile(potential_file):
            return FileResponse(potential_file)
        # Otherwise, fallback to serving index.html for React Router to take over
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
