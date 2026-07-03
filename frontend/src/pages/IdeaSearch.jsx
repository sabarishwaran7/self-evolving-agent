import React, { useState, useEffect } from 'react';
import { Lightbulb, Search, AlertCircle, Compass, History, Sparkles } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function IdeaSearch({ user, addToast }) {
  const [keywords, setKeywords] = useState('');
  const [category, setCategory] = useState('AIDS');
  const [isLoading, setIsLoading] = useState(false);
  const [discoveredIdeas, setDiscoveredIdeas] = useState([]);
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/ideas', {
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

  const handleDiscover = async (e) => {
    e.preventDefault();
    if (!keywords) return;

    setIsLoading(true);
    addToast('info', 'Gap Scanner Activated', 'Idea generation agent exploring academic directories...');
    
    try {
      const response = await fetch('/api/ideas/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ keywords, category })
      });
      const data = await response.json();
      if (response.ok) {
        setDiscoveredIdeas(data.ideas);
        addToast('success', 'Ideas Synthesized', 'Discovered unique avenues and competitor gaps.');
        loadHistory();
      } else {
        throw new Error(data.detail);
      }
    } catch (err) {
      addToast('error', 'Discovery Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Lightbulb className="w-8 h-8 text-neon-cyan animate-pulse" />
          Research Idea & Gap Discovery
        </h1>
        <p className="text-xs text-slate-400">
          Brainstorm unique thesis topics, map research limitations, and explore structural innovations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Keywords and Parameters entry */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard title="Discovery Parameters" glowColor="indigo">
            <form onSubmit={handleDiscover} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Academic Domain</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition"
                >
                  <option value="AIDS">AIDS (AI & Data Science)</option>
                  <option value="AIML">AIML (AI & Machine Learning)</option>
                  <option value="CSE">CSE (Computer Science & Engineering)</option>
                  <option value="ECE">ECE (Electronics & Communication)</option>
                  <option value="EEE">EEE (Electrical & Electronics)</option>
                  <option value="BIOTECH">BIOTECH (Biotechnology)</option>
                  <option value="CSBS">CSBS (Computer Science & Business Systems)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Core Keywords / Domain Focus</label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g. Distributed caching in IoT networks"
                    className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none placeholder:text-slate-600 transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-neon-indigo to-neon-cyan text-white shadow-neon-indigo hover:scale-102 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50 text-xs"
              >
                <Sparkles className="w-4 h-4" />
                {isLoading ? 'Scanning Gaps...' : 'Discover Research Directions'}
              </button>
            </form>
          </GlassCard>

          {/* Historical discovery list */}
          <GlassCard title="Search History Logs" glowColor="rose">
            <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <div className="text-slate-500 text-center py-6 text-xs italic">
                  No past discovery scans recorded.
                </div>
              ) : (
                history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setKeywords(h.keywords);
                      setDiscoveredIdeas(h.ideas);
                    }}
                    className="w-full text-left p-3 rounded-xl border border-white/5 bg-space-950/40 hover:bg-space-900 transition flex items-start gap-2.5 group"
                  >
                    <History className="w-4 h-4 text-slate-500 group-hover:text-neon-cyan shrink-0 mt-0.5" />
                    <div className="min-w-0 text-xs">
                      <p className="font-semibold text-slate-300 truncate">{h.keywords}</p>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                        {h.ideas.length} ideas mapped
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </GlassCard>
        </div>

        {/* Results layout */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading && (
            <div className="p-16 text-center space-y-4 rounded-2xl bg-space-900 border border-white/5 flex flex-col items-center justify-center">
              <Compass className="w-12 h-12 text-neon-cyan animate-spin" />
              <div className="space-y-1">
                <h4 className="font-bold text-white tracking-tight text-sm">Dispatched Idea Synthesis Agent</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Parsing academic databases to cross-reference similarity mappings and spot publication anomalies...
                </p>
              </div>
            </div>
          )}

          {!isLoading && discoveredIdeas.length === 0 && (
            <div className="p-16 text-center rounded-2xl bg-space-900/50 border border-white/5 flex flex-col items-center justify-center space-y-3.5">
              <Compass className="w-12 h-12 text-slate-600" />
              <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                Initialize keywords parameters on the side panel to draft unique, high-value thesis ideas and project maps.
              </p>
            </div>
          )}

          {!isLoading && discoveredIdeas.length > 0 && (
            <div className="space-y-6 animate-float">
              {discoveredIdeas.map((idea, idx) => (
                <GlassCard key={idx} title={idea.title} glowColor="cyan">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs pt-2">
                    <div className="space-y-3">
                      <div className="p-3 bg-space-950/60 rounded-xl border border-white/5 space-y-1">
                        <span className="text-[10px] font-bold text-neon-rose uppercase tracking-wider block">
                          Mapped Research Gap
                        </span>
                        <p className="text-slate-300 leading-relaxed font-sans">{idea.gap}</p>
                      </div>

                      <div className="p-3 bg-space-950/60 rounded-xl border border-white/5 space-y-1">
                        <span className="text-[10px] font-bold text-neon-cyan uppercase tracking-wider block">
                          Proposed Enhancements
                        </span>
                        <p className="text-slate-300 leading-relaxed font-sans">{idea.enhancement}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-space-950/60 rounded-xl border border-white/5 space-y-1">
                        <span className="text-[10px] font-bold text-neon-emerald uppercase tracking-wider block">
                          Core Innovations
                        </span>
                        <p className="text-slate-300 leading-relaxed font-sans">{idea.innovations}</p>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-space-950/60 rounded-xl border border-white/5">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Complexity Index
                          </span>
                          <span className="font-bold text-slate-200 text-xs mt-0.5 block">{idea.existingComplexity}</span>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full border border-neon-cyan/40 bg-neon-cyan/5 text-neon-cyan font-bold tracking-widest uppercase">
                          Gap Spot
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
