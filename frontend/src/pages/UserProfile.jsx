import React, { useState, useEffect } from 'react';
import { User, BrainCircuit, Sparkles, LogOut, CheckCircle, RefreshCw } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function UserProfile({ user, onUpdateUser, onLogout, addToast }) {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [citationStyle, setCitationStyle] = useState(user?.preferences?.citationStyle || 'IEEE');
  const [defaultFormat, setDefaultFormat] = useState(user?.preferences?.defaultFormat || 'IEEE');
  const [isUpdating, setIsUpdating] = useState(false);
  const [memories, setMemories] = useState([]);
  const [isMemoriesLoading, setIsMemoriesLoading] = useState(false);

  const fetchMemories = async () => {
    setIsMemoriesLoading(true);
    try {
      const response = await fetch('/api/memory', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMemories(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsMemoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleUpdate = (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    // Simulate updating preferences back into the global and local user storage
    setTimeout(() => {
      onUpdateUser({
        displayName,
        phone,
        preferences: {
          citationStyle,
          defaultFormat
        }
      });
      setIsUpdating(false);
      addToast('success', 'Preferences Updated', 'Your profile preferences were updated successfully.');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <User className="w-8 h-8 text-neon-indigo" />
          AI Node Profile Settings
        </h1>
        <p className="text-xs text-slate-400">
          Configure academic template guidelines and view learned self-evolving memories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings form */}
        <div className="lg:col-span-1">
          <GlassCard title="Profile Preferences" glowColor="indigo">
            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Academic Handle Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Dr. John Doe"
                  className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Telephone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919876543210"
                  className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Default Paper Format</label>
                <select
                  value={defaultFormat}
                  onChange={(e) => setDefaultFormat(e.target.value)}
                  className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition"
                >
                  <option value="IEEE">IEEE Transactions</option>
                  <option value="Springer">Springer Core</option>
                  <option value="Journal">Standard Journal</option>
                  <option value="College">College Thesis</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Citation Style Matrix</label>
                <select
                  value={citationStyle}
                  onChange={(e) => setCitationStyle(e.target.value)}
                  className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition"
                >
                  <option value="IEEE">IEEE Numbered Reference ([1], [2])</option>
                  <option value="APA">APA Parenthetical (Author, Year)</option>
                  <option value="Harvard">Harvard style reference</option>
                </select>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-neon-indigo to-neon-cyan text-white shadow-neon-indigo hover:scale-102 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUpdating ? 'Saving Tunings...' : 'Save Configuration Preferences'}
                </button>
                
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full py-3 rounded-xl font-bold border border-neon-rose/40 hover:bg-neon-rose/5 text-neon-rose transition flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect Security Node
                </button>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Evolving AI Memory catalogue list */}
        <div className="lg:col-span-2">
          <GlassCard 
            title="Evolving AI Memory Store" 
            glowColor="cyan"
            headerActions={
              <div className="text-[10px] font-bold text-neon-cyan uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <BrainCircuit className="w-4 h-4 animate-pulse" />
                INTELLIGENCE_LAYER_READY
              </div>
            }
          >
            <div className="space-y-4 text-xs">
              <p className="text-slate-400 leading-relaxed">
                These rules represent the compiled, derived guidelines synthesized from your past paper feedback. They are automatically injected into the Multi-Agent Crew's LLM prompt templates to continuously customize outputs to your writing tone and criteria.
              </p>

              {isMemoriesLoading && (
                <div className="p-10 text-center space-y-2 flex flex-col items-center justify-center border border-white/5 bg-space-950/40 rounded-xl">
                  <RefreshCw className="w-8 h-8 text-neon-cyan animate-spin" />
                  <span className="text-slate-500 font-mono text-[10px]">RECALLING_MEMORY_BLOCKS...</span>
                </div>
              )}

              {!isMemoriesLoading && memories.length === 0 && (
                <div className="p-10 text-center space-y-2 flex flex-col items-center justify-center border border-white/5 bg-space-950/20 rounded-xl border-dashed">
                  <BrainCircuit className="w-10 h-10 text-slate-700 animate-pulse" />
                  <p className="text-slate-500 text-[11px] max-w-xs leading-normal">
                    Memory store is currently empty. Generate a paper, submit feedback reviews, and watch the AI dynamically evolve in real time!
                  </p>
                </div>
              )}

              {!isMemoriesLoading && memories.length > 0 && (
                <div className="grid grid-cols-1 gap-4 max-h-[380px] overflow-y-auto pr-1">
                  {memories.map((mem) => (
                    <div key={mem.id} className="p-4 rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 flex items-start gap-3.5 relative overflow-hidden group">
                      {/* corner decorations */}
                      <div className="absolute right-0 top-0 p-1.5 bg-neon-cyan/10 border-l border-b border-neon-cyan/20 text-[8px] font-bold uppercase tracking-wider text-neon-cyan font-mono select-none">
                        {mem.category}
                      </div>
                      
                      <div className="p-2 bg-space-900 rounded-lg shrink-0 flex items-center justify-center">
                        <Sparkles className="w-4.5 h-4.5 text-neon-cyan" />
                      </div>
                      
                      <div className="space-y-1.5 pr-12 min-w-0">
                        <h4 className="font-bold text-slate-200 tracking-tight leading-snug">
                          Derived Instruction Parameter
                        </h4>
                        <p className="text-slate-300 leading-relaxed font-mono text-[11px] bg-black/40 p-2.5 rounded-lg border border-white/5">
                          "{mem.learnedPattern}"
                        </p>
                        <span className="text-[9px] text-slate-500 block">
                          Learned on: {new Date(mem.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
