from fastapi import APIRouter, Depends
from backend.services.auth import AuthService
from backend.services.agents import MultiAgentOrchestrator
from backend.database import DatabaseHelper

router = APIRouter(prefix="/dashboard", tags=["Dashboard Statistics"])

@router.get("/metrics")
async def get_dashboard_metrics(user_payload: dict = Depends(AuthService.verify_token)):
    user_id = user_payload.get("sub")
    
    # 1. Read lists from database collections for the active user
    papers = await DatabaseHelper.find("papers", {"userId": user_id})
    ideas = await DatabaseHelper.find("generated_ideas", {"userId": user_id})
    reports = await DatabaseHelper.find("plagiarism_reports", {"userId": user_id})
    notifs = await DatabaseHelper.find("notifications", {"userId": user_id})
    memories = await DatabaseHelper.find("ai_memory", {"userId": user_id})
    
    # Calculate statistics
    total_papers = len(papers)
    total_ideas = sum(len(item.get("ideas", [])) for item in ideas)
    total_notifications = len(notifs)
    memory_count = len(memories)
    
    # Compute average plagiarism score
    plag_scores = [p.get("plagiarismScore", 0.0) for p in papers if "plagiarismScore" in p]
    avg_plagiarism = round(sum(plag_scores) / len(plag_scores), 2) if plag_scores else 0.0
    
    # Build active agent statuses
    agents_status = [
        {"name": "Research Agent", "status": "idle", "task": "Synthesizing academic topics"},
        {"name": "Idea Gen Agent", "status": "idle", "task": "Spotting research gaps"},
        {"name": "Formatting Agent", "status": "idle", "task": "Compiling IEEE and Springer structures"},
        {"name": "Diagram Agent", "status": "idle", "task": "Designing system charts"},
        {"name": "Plagiarism Agent", "status": "idle", "task": "Verifying original corpora"},
        {"name": "Rewrite Agent", "status": "idle", "task": "Optimizing duplicate strings"},
        {"name": "Notification Agent", "status": "idle", "task": "Dispatching SMS and Email files"},
        {"name": "Memory Agent", "status": "idle", "task": "Updating self-evolving feedback weights"}
    ]
    
    # Get live logs from the agent orchestrator
    logs = MultiAgentOrchestrator.get_logs()
    
    # Adjust live status based on last active log
    if logs:
        last_log = logs[-1]
        active_agent = last_log.get("agent")
        active_status = last_log.get("status")
        for ag in agents_status:
            if ag["name"] == active_agent:
                ag["status"] = "active" if active_status == "active" else "idle"
                ag["task"] = last_log.get("message")

    return {
        "statistics": {
            "papersGenerated": total_papers,
            "ideasDiscovered": total_ideas,
            "averagePlagiarism": avg_plagiarism,
            "alertsSent": total_notifications,
            "learnedRulesCount": memory_count
        },
        "agents": agents_status,
        "recentActivity": logs[::-1][:10]  # Return latest 10 logs (reversed chronological)
    }
