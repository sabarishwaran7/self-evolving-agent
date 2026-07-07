# Self-Evolving Multi-Agent AI Research Assistant
A comprehensive multi-agent system for academic paper generation and research analysis, now featuring self-evolving memory loops and professional PDF compiling.

## Project Overview
This project uses a coordinated network of specialized LLM agents (powered by Groq Llama and Mixtral models) to assist researchers in brainstorming topic directions, synthesizing fully-formatted drafts (Abstract to References), auditing similarity indices, and generating architecture diagrams. The system self-evolves by saving user reviews and adapting its generation directives over time.

## Key Features
- **Interactive Researcher Dashboard**: Clean, professional, and responsive user interface built with React 18, Tailwind CSS, and Framer Motion.
- **Advanced Paper Generation**: Synthesizes structured academic papers (Abstract, Lit Review, System Architecture, etc.) up to 5-6 pages, formatted to IEEE (two-column layout with side-by-side authors), Springer, or Standard templates.
- **Self-Evolving Memory System**: Automatically parses user critique, saves performance weights in MongoDB, and updates core prompts dynamically for future creations.
- **Originality Scan & Paraphraser**: Scans generated manuscripts for similarity using vector-based similarity tools, featuring a dual-window interactive rewriter to reduce plag ceilings below 10%.
- **Systems Architecture Visualizer**: Translates descriptive prompts into visual diagrams using Mermaid.js with a side-by-side terminal editor.
- **Alert & Notification Hub**: Real-time communication tracking dispatching Twilio SMS and SendGrid email updates.

## 📸 Screenshots

### 🖥️ Main Research Dashboard
*Main Dashboard Interface*

### 📊 AI Agent Monitor
*Agent State Visualizer*

### 📋 Professional PDF Compilation (IEEE)
*PDF Report Preview*

---

## Quick Start

### 1. Install Dependencies
```bash
# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install
