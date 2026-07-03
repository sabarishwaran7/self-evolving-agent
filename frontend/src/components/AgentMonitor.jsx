import React from 'react';
import { Terminal, Cpu, CheckCircle2, ShieldAlert, RefreshCw } from 'lucide-react';
import GlassCard from './GlassCard';

export default function AgentMonitor({ agents = [], logs = [], isProcessing = false, activeTitle = '' }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-neon-cyan border-neon-cyan/40 bg-neon-cyan/5';
      case 'completed':
        return 'text-neon-emerald border-neon-emerald/40 bg-neon-emerald/5';
      case 'error':
        return 'text-neon-rose border-neon-rose/40 bg-neon-rose/5';
      default:
        return 'text-slate-500 border-white/5 bg-space-950/20';
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'active':
        return 'bg-neon-cyan animate-ping';
      case 'completed':
        return 'bg-neon-emerald';
      case 'error':
        return 'bg-neon-rose animate-bounce';
      default:
        return 'bg-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Execution Overlay if active paper compilation is running */}
      {isProcessing && (
        <div className="p-6 bg-gradient-to-r from-neon-indigo/10 via-neon-cyan/10 to-neon-fuchsia/10 rounded-2xl border border-neon-indigo/30 animate-pulse relative overflow-hidden flex flex-col md:flex-row items-center gap-5">
          <div className="p-3 bg-neon-indigo/20 rounded-2xl flex items-center justify-center animate-spin">
            <RefreshCw className="w-8 h-8 text-neon-cyan" />
          </div>
          <div className="text-center md:text-left flex-1 space-y-1">
            <h4 className="font-bold text-white tracking-tight text-lg">
              Multi-Agent Orchestrator Compiling Paper
            </h4>
            <p className="text-xs text-slate-300">
              Querying active models for: <span className="font-semibold text-neon-cyan">"{activeTitle}"</span>
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-space-900 text-slate-400">Researching</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-space-900 text-slate-400">Structuring IEEE</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-space-900 text-slate-400">Rewriting Plagiarism</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-neon-cyan tracking-widest uppercase animate-pulse">
            Processing...
          </span>
        </div>
      )}

      {/* 2. Grid list of the 8 AI Agents */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {agents.map((ag) => (
          <div
            key={ag.name}
            className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between h-28 ${getStatusColor(ag.status)}`}
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold text-white tracking-tight">{ag.name}</span>
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${getStatusDot(ag.status)}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${getStatusDot(ag.status)}`} />
              </span>
            </div>
            
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                Current Task
              </span>
              <p className="text-[11px] leading-snug truncate text-slate-300" title={ag.task}>
                {ag.task}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Terminal output window */}
      <GlassCard 
        title="Orchestration Command Terminal" 
        glowColor="cyan"
        headerActions={
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-emerald" />
            AGENT_SYS_READY
          </div>
        }
      >
        <div className="bg-black/60 rounded-xl p-4 font-mono text-xs space-y-2 border border-white/5 max-h-64 overflow-y-auto leading-relaxed shadow-inner">
          {logs.length === 0 ? (
            <div className="text-slate-500 italic py-6 text-center">
              No recent agent transactions. Initiate a request to capture live streams.
            </div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span className="text-neon-cyan shrink-0">&gt;</span>
                <span className="text-slate-500 shrink-0 select-none">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                <span className="text-neon-indigo font-bold shrink-0">
                  {log.agent}:
                </span>
                <span className={log.status === 'error' ? 'text-neon-rose' : 'text-slate-300'}>
                  {log.message}
                </span>
                {log.status === 'completed' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-neon-emerald shrink-0 mt-0.5" />
                )}
                {log.status === 'error' && (
                  <ShieldAlert className="w-3.5 h-3.5 text-neon-rose shrink-0 mt-0.5" />
                )}
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
