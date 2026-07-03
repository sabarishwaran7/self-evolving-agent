import React, { useState, useEffect } from 'react';
import { Binary, Play, HelpCircle, Code, Eye, RefreshCw, FileImage } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function DiagramGenerator({ user, addToast }) {
  const [prompt, setPrompt] = useState('');
  const [diagramType, setDiagramType] = useState('flowchart');
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom Live Editor state
  const [mermaidCode, setMermaidCode] = useState('');
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/diagrams', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setHistory(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt) return;

    setIsLoading(true);
    addToast('info', 'Diagram Agent Dispatched', 'Orchestrating layout system models...');

    try {
      const response = await fetch('/api/diagrams/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ prompt, diagramType })
      });
      const data = await response.json();
      if (response.ok) {
        setMermaidCode(data.mermaidCode);
        addToast('success', 'Diagram Generated', 'Mermaid canvas structures loaded.');
        loadHistory();
      } else {
        throw new Error(data.detail);
      }
    } catch (err) {
      addToast('error', 'Generation Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic Parser that converts Mermaid flowchart lines into pretty styled nodes for instant safe rendering
  const parseMermaidToVisualNodes = (code) => {
    if (!code) return null;
    
    const lines = code.split('\n');
    const nodes = [];
    const connections = [];
    
    lines.forEach((line) => {
      const trimmed = line.trim();
      
      // Parse Node: id[label] or id([label]) or id{label} or id([label])
      const nodeMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s*(?:\[|\(\[|\{|\(\()\s*([^\]\)\}]+)\s*(?:\]|\)\]|\}|\)\))/);
      if (nodeMatch) {
        nodes.push({ id: nodeMatch[1], label: nodeMatch[2] });
        return;
      }
      
      // Parse Connection: id1 --> id2 or id1 -->|label| id2
      const connMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s*-->\s*(?:\|([^|]+)\|)?\s*([a-zA-Z0-9_]+)/);
      if (connMatch) {
        connections.push({
          from: connMatch[1],
          label: connMatch[2] || '',
          to: connMatch[3]
        });
      }
    });

    if (nodes.length === 0) {
      // Default fallback nodes if direct matching is empty (e.g. sequence format)
      return (
        <div className="space-y-4 text-center py-10">
          <p className="text-[11px] text-slate-500 font-mono">Mermaid Sequence Diagram Code Loaded Successfully</p>
          <div className="inline-block p-4 rounded-xl border border-white/5 bg-space-950 font-mono text-[10px] text-neon-cyan leading-relaxed">
            {code}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-6 p-4">
        {/* Render parsed flowchart boxes */}
        <div className="flex flex-wrap items-center justify-center gap-5">
          {nodes.map((node) => (
            <div 
              key={node.id} 
              className="px-4 py-3 rounded-xl border border-neon-cyan/30 bg-neon-cyan/5 hover:border-neon-cyan transition-all text-xs font-bold text-white shadow-neon-cyan/5 flex flex-col items-center gap-1 min-w-[100px] text-center"
            >
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">{node.id}</span>
              <span>{node.label}</span>
            </div>
          ))}
        </div>

        {/* Render Connection pathways list */}
        {connections.length > 0 && (
          <div className="w-full space-y-2 mt-4">
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-widest text-center border-b border-white/5 pb-2 mb-2">
              System Connections Map
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-36 overflow-y-auto pr-1">
              {connections.map((conn, idx) => (
                <div key={idx} className="p-2.5 rounded-xl border border-white/5 bg-space-950/40 flex items-center justify-between text-xs text-slate-300 font-mono">
                  <span className="font-bold text-neon-indigo">{conn.from}</span>
                  <span className="text-[10px] text-slate-500 bg-space-900 px-2 py-0.5 rounded-full border border-white/5">
                    {conn.label ? `--> (${conn.label}) -->` : '-->'}
                  </span>
                  <span className="font-bold text-neon-cyan">{conn.to}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Binary className="w-8 h-8 text-neon-cyan animate-pulse" />
          AI Diagram & Flowchart Generator
        </h1>
        <p className="text-xs text-slate-400">
          Orchestrate academic flowchart structures and systems architectures in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column input panel */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard title="Layout Prompts Hub" glowColor="indigo">
            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Diagram Framework</label>
                <select
                  value={diagramType}
                  onChange={(e) => setDiagramType(e.target.value)}
                  className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition"
                >
                  <option value="flowchart">Flowchart Structure (graph TD)</option>
                  <option value="sequence">Sequence Diagram</option>
                  <option value="architecture">Architecture Layout</option>
                  <option value="class">Class Framework</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Visual Description / Brief</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Design a flowchart of my multi-agent system including user prompts, orchestrator, 4 agent loops, and database caches"
                  rows="5"
                  className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl p-4 text-slate-200 focus:outline-none placeholder:text-slate-600 transition leading-relaxed text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !prompt}
                className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-neon-indigo to-neon-cyan text-white shadow-neon-indigo hover:scale-102 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50 text-xs"
              >
                <Play className="w-4 h-4" />
                {isLoading ? 'Plotting layout grids...' : 'Compile Design Diagram'}
              </button>
            </form>
          </GlassCard>

          {/* Past compiles history */}
          <GlassCard title="Design Library" glowColor="rose">
            <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <div className="text-slate-500 text-center py-6 text-xs italic">
                  No compiled diagrams stored yet.
                </div>
              ) : (
                history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPrompt(h.prompt);
                      setMermaidCode(h.mermaidCode);
                    }}
                    className="w-full text-left p-3 rounded-xl border border-white/5 bg-space-950/40 hover:bg-space-900 transition flex items-start gap-2.5 group"
                  >
                    <Binary className="w-4 h-4 text-slate-500 group-hover:text-neon-cyan shrink-0 mt-0.5" />
                    <div className="min-w-0 text-xs">
                      <p className="font-semibold text-slate-300 truncate">{h.prompt}</p>
                      <span className="text-[10px] text-neon-cyan font-mono block mt-0.5 uppercase tracking-wider">
                        {h.diagramType}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </GlassCard>
        </div>

        {/* Dynamic side-by-side Editor & Preview Canvas */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading && (
            <div className="p-16 text-center space-y-4 rounded-2xl bg-space-900 border border-white/5 flex flex-col items-center justify-center h-[460px]">
              <RefreshCw className="w-12 h-12 text-neon-cyan animate-spin" />
              <div className="space-y-1">
                <h4 className="font-bold text-white tracking-tight text-sm">Diagram Agent active</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Formulating Mermaid code blocks, nesting coordinate indices and compiling systems maps...
                </p>
              </div>
            </div>
          )}

          {!isLoading && !mermaidCode && (
            <div className="p-16 text-center rounded-2xl bg-space-900/50 border border-white/5 flex flex-col items-center justify-center space-y-3.5 h-[460px]">
              <Binary className="w-12 h-12 text-slate-600" />
              <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                Awaiting compile prompt instructions. Create system designs and workflow models dynamically.
              </p>
            </div>
          )}

          {!isLoading && mermaidCode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[460px]">
              {/* Left Column: Interactive Code Editor */}
              <GlassCard title="Mermaid.js Code Editor" glowColor="cyan" className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 flex flex-col justify-between pt-2">
                  <textarea
                    value={mermaidCode}
                    onChange={(e) => setMermaidCode(e.target.value)}
                    className="w-full flex-1 bg-black/60 rounded-xl p-4 font-mono text-[11px] text-slate-200 border border-white/5 focus:outline-none leading-relaxed resize-none h-[310px]"
                  />
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono mt-3">
                    <Code className="w-3.5 h-3.5 text-neon-cyan" />
                    LIVE_SYNTAX_PARSER_ACTIVE
                  </div>
                </div>
              </GlassCard>

              {/* Right Column: Visual Render Preview Canvas */}
              <GlassCard title="Visual Design Canvas" glowColor="fuchsia" className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto bg-space-950/60 rounded-xl border border-white/5 flex items-center justify-center min-h-[315px]">
                  {parseMermaidToVisualNodes(mermaidCode)}
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
