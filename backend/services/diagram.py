import datetime
from typing import Dict
from backend.config import settings
from backend.database import DatabaseHelper

class DiagramService:
    @staticmethod
    def generate_mock_mermaid(prompt: str, d_type: str) -> str:
        """Fallback mock generator creating high-fidelity, customized flowcharts."""
        prompt_l = prompt.lower()
        if "agent" in prompt_l or "multi" in prompt_l:
            return """graph TD
    classDef main fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#fff;
    classDef agent fill:#0f172a,stroke:#38bdf8,stroke-width:1px,stroke-dasharray: 5 5,color:#38bdf8;
    classDef storage fill:#1c1917,stroke:#a8a29e,stroke-width:1px,color:#fff;

    User([User Prompt]) --> Gate[API Gateway]
    Gate --> Master[Research Orchestrator Agent]
    
    subgraph MultiAgent[Collaborative Crew Engine]
        Master --> R_Agent[Research Agent]
        Master --> F_Agent[Formatting Agent]
        Master --> P_Agent[Plagiarism Agent]
        Master --> M_Agent[Memory Agent]
    end

    R_Agent --> DB[(MongoDB Atlas)]
    M_Agent --> Vector[(ChromaDB Memory)]
    
    P_Agent --> Output{Similarity Scan}
    Output -->|<10%| Compile[Compile PDF & DOCX]
    Output -->|>10%| Rewrite[Auto-Rewrite Agent]
    Rewrite --> R_Agent

    class User,Gate,Master,Compile,Output main;
    class R_Agent,F_Agent,P_Agent,M_Agent,Rewrite agent;
    class DB,Vector storage;"""
        elif "neural" in prompt_l or "cnn" in prompt_l or "model" in prompt_l:
            return """graph LR
    classDef layer fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#fff;
    classDef act fill:#1e293b,stroke:#fb7185,stroke-width:1px,color:#fff;

    Input[Input Tensor: 256x256x3] --> Conv1[Conv2D: 32 filters, 3x3]
    Conv1 --> Relu1((ReLU))
    Relu1 --> Pool1[MaxPool2D: 2x2]
    Pool1 --> Conv2[Conv2D: 64 filters, 3x3]
    Conv2 --> Relu2((ReLU))
    Relu2 --> Pool2[MaxPool2D: 2x2]
    Pool2 --> Flatten[Flatten Layer]
    Flatten --> FC1[Dense Hidden Layer: 128]
    FC1 --> Relu3((ReLU))
    Relu3 --> Output[Softmax Classifier: N Classes]

    class Conv1,Conv2,FC1,Flatten layer;
    class Relu1,Relu2,Relu3 act;"""
        else:
            # General default flowchart matching user parameters
            clean_prompt = prompt.replace('"', '\\"').replace('\n', ' ')
            return """graph LR
    classDef green fill:#8bc34a,stroke:#fff,color:#fff;
    classDef blue fill:#03a9f4,stroke:#fff,color:#fff;
    classDef purple fill:#9c27b0,stroke:#fff,color:#fff;
    classDef grey fill:#e0e0e0,stroke:#9e9e9e,color:#000;

    A[Data Collection & Input]:::green --> B[Data Preprocessing]:::blue
    B --> C{AI Model Processing}:::purple
    C -->|Feature Extraction| D[Deep Learning Engine]:::green
    C -->|Optimization| E[Reinforcement Agent]:::grey
    D --> F[Final Output / Prediction]:::blue
    E --> F
    F --> G[System Evaluation & Feedback]:::grey"""

    @staticmethod
    async def generate_diagram(user_id: str, prompt: str, d_type: str = "flowchart") -> dict:
        """Orchestrates diagram generation using the Groq API or smart template fallback."""
        mermaid_code = ""
        
        if settings.IS_MOCK_LLM:
            mermaid_code = DiagramService.generate_mock_mermaid(prompt, d_type)
        else:
            try:
                # Dynamic generation using Groq API
                from groq import Groq
                client = Groq(api_key=settings.GROQ_API_KEY)
                
                system_prompt = (
                    "You are a stellar systems engineering diagram model. Generate ONLY valid Mermaid.js "
                    "flowchart or diagram code representing the user's architectural request. Do not include "
                    "markdown code fences (```), explanation text, or conversational preambles. "
                    "Strictly output only the raw Mermaid code starting with 'graph LR'. "
                    "CRITICAL: Always use 'graph LR' (left-to-right) so the diagram fits well horizontally on a document page. "
                    "For links with text, strictly use the syntax `A -->|Text| B`. Do NOT use `-->|Text|>` as it is invalid Mermaid syntax."
                )
                
                response = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Generate a {d_type} for this description:\n{prompt}"}
                    ],
                    temperature=0.2
                )
                
                output = response.choices[0].message.content.strip()
                # Clean up any potential markdown wraps
                if "```" in output:
                    output = output.split("```")[1]
                    if output.startswith("mermaid"):
                        output = output[7:]
                mermaid_code = output.strip()
            except Exception as e:
                print(f"Groq diagram generation failed: {e}. Falling back to default.")
                mermaid_code = DiagramService.generate_mock_mermaid(prompt, d_type)

        diagram_doc = {
            "userId": user_id,
            "prompt": prompt,
            "diagramType": d_type,
            "mermaidCode": mermaid_code,
            "createdAt": datetime.datetime.utcnow().isoformat()
        }
        
        saved = await DatabaseHelper.insert("diagrams", diagram_doc)
        return saved
