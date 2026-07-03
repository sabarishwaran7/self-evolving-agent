import React from 'react';
import { Cpu, ArrowRight, BookOpen, Lightbulb, ShieldCheck, Binary, Sparkles } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function LandingPage({ onNavigate, user }) {
  const features = [
    { icon: BookOpen, title: 'Paper Synthesizer', desc: 'Draft academic manuscripts in compliant IEEE, Springer, and College layouts in minutes.', color: 'indigo' },
    { icon: Lightbulb, title: 'Gap Spotter', desc: 'Brainstorm research titles, uncover competitor structures, and scan database gaps.', color: 'cyan' },
    { icon: ShieldCheck, title: 'Originality Audit', desc: 'Execute string calculations, compile reports, and trigger automated rephrasing below 10%.', color: 'emerald' },
    { icon: Binary, title: 'flowcharts Generator', desc: 'Render complex system architectures and process workflows dynamically in Mermaid canvas.', color: 'fuchsia' }
  ];

  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-16 px-4 max-w-6xl mx-auto space-y-16">
      {/* 1. Hero Grid Section */}
      <div className="text-center space-y-6 relative max-w-3xl">
        {/* Futuristic glowing badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neon-indigo/30 bg-neon-indigo/5 text-xs text-neon-cyan font-bold tracking-widest uppercase animate-float">
          <Sparkles className="w-3.5 h-3.5" />
          Autonomous Multi-Agent platform
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Self-Evolving Multi-Agent <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-neon-indigo to-neon-fuchsia glow-indigo">
            AI Research Assistant
          </span>
        </h1>
        
        <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Draft manuscripts, brainstorm unique project topics, scan plagiarism similarities, and generate flowcharts—fully guided by self-evolving AI memories that learn from your feedback.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          {user ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-neon-indigo to-neon-cyan text-white shadow-neon-indigo transition-all duration-300 hover:scale-105 flex items-center gap-2 group"
            >
              Enter Command Center
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <>
              <button
                onClick={() => onNavigate('login')}
                className="px-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-neon-indigo to-neon-cyan text-white shadow-neon-indigo transition-all duration-300 hover:scale-105 flex items-center gap-2 group"
              >
                Access Platform Gateway
                <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#features"
                className="px-6 py-3.5 rounded-xl font-bold border border-white/10 hover:border-white/20 bg-white/5 text-slate-300 hover:text-white transition-all duration-300 hover:scale-105"
              >
                Explore Modules
              </a>
            </>
          )}
        </div>
      </div>

      {/* 2. Visual Platform preview card */}
      <div className="w-full relative animate-float">
        <div className="absolute -inset-1.5 bg-gradient-to-r from-neon-indigo to-neon-cyan rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
        <GlassCard className="relative p-2 md:p-3 overflow-hidden rounded-3xl border-white/10">
          <div className="bg-space-950 rounded-2xl border border-white/5 aspect-[16/9] overflow-hidden flex flex-col items-center justify-center p-8 text-center space-y-4">
            <Cpu className="w-16 h-16 text-neon-cyan animate-pulse" />
            <h3 className="text-xl font-bold text-white tracking-tight">Interactive Simulation Nodes</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Connected across 8 primary agents including Plagiarism analyzers, ReportLab formatting services, Twilio message senders, and dynamic ChromaDB learning nodes.
            </p>
          </div>
        </GlassCard>
      </div>

      {/* 3. Features Section Grid */}
      <div id="features" className="w-full space-y-8 pt-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Integrated Core Frameworks
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            A comprehensive assembly of production tools, APIs, and micro-agent routines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <GlassCard key={feat.title} glowColor={feat.color} className="flex flex-col justify-between h-56">
                <div className="p-3 bg-space-800 rounded-xl w-12 h-12 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-neon-cyan" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-white tracking-tight">{feat.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
