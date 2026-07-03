import asyncio
from backend.database import DatabaseHelper

async def fix():
    valid_mermaid = "graph LR\n    A[Traffic Camera] --> B{AI Vision Model}\n    B -->|Detect Vehicles| C[Traffic Management System]\n    C --> D[Adaptive Traffic Lights]\n    B -->|Identify Anomalies| E[Alert System]"
    papers = await DatabaseHelper.find("papers", {})
    for paper in papers:
        if "diagrams" in paper and paper["diagrams"]:
            for d in paper["diagrams"]:
                d["mermaidCode"] = valid_mermaid
            await DatabaseHelper.db["papers"].update_one(
                {"_id": paper["_id"]},
                {"$set": {"diagrams": paper["diagrams"]}}
            )
    print("Fixed database diagrams")

import sys
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
asyncio.run(fix())
