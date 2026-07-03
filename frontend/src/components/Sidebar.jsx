import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, BookOpen, Lightbulb, ShieldAlert, 
  Binary, BellRing, User, LogOut, Terminal, Cpu, Radio
} from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate, onLogout, user }) {
  const [activeAgents, setActiveAgents] = useState(8);
  const [networkPing, setNetworkPing] = useState(38);

  // Micro telemetry updates to give a "live" dynamic feeling
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkPing(Math.floor(Math.random() * 15) + 30);
      setActiveAgents(Math.random() > 0.85 ? 7 : 8);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard, glowColor: 'neon-indigo' },
    { id: 'generator', label: 'Research Generator', icon: BookOpen, glowColor: 'neon-cyan' },
    { id: 'ideas', label: 'Idea Discovery', icon: Lightbulb, glowColor: 'neon-violet' },
    { id: 'plagiarism', label: 'Originality Audit', icon: ShieldAlert, glowColor: 'neon-rose' },
    { id: 'diagrams', label: 'Flowcharts & Canvas', icon: Binary, glowColor: 'neon-fuchsia' },
    { id: 'notifications', label: 'Alert Hub', icon: BellRing, glowColor: 'neon-emerald' },
    { id: 'profile', label: 'Memory Profile', icon: User, glowColor: 'neon-indigo' }
  ];

  return (
    <aside className="w-72 bg-space-900 border-r border-white/5 flex flex-col p-4 z-20 glass-panel shadow-glass shrink-0">
      {/* Platform Title */}
      <div className="flex items-center gap-3 px-2 py-4 mb-6 border-b border-white/5">
        <div className="p-2 bg-gradient-to-tr from-neon-indigo to-neon-cyan rounded-xl shadow-neon-indigo flex items-center justify-center">
          <Cpu className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-300 tracking-tight">
            Self-Evolving AI
          </h2>
          <span className="text-[10px] text-neon-cyan font-semibold tracking-widest uppercase">
            Multi-Agent Node
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 px-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group overflow-hidden ${
                isActive 
                  ? 'bg-space-700 text-white border-l-2 border-neon-indigo shadow-neon-indigo/5' 
                  : 'text-slate-400 hover:text-white hover:bg-space-800/50'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-neon-cyan' : 'text-slate-400 group-hover:text-neon-indigo'}`} />
              <span className="relative z-10">{item.label}</span>
              
              {/* Highlight Background on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-neon-indigo/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </button>
          );
        })}
      </nav>

      {/* Live AI Node Statistics Panel */}
      <div className="mt-auto pt-4 border-t border-white/5 space-y-3.5">
        <div className="p-3.5 bg-space-950/70 border border-white/5 rounded-xl text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-neon-indigo" />
              Active Agents
            </span>
            <span className="font-bold text-slate-200">{activeAgents} / 8</span>
          </div>
          
          {/* Glowing Multi-Agent Activity meter */}
          <div className="w-full bg-space-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-neon-indigo via-neon-cyan to-neon-fuchsia h-full rounded-full transition-all duration-1000 shadow-neon-indigo" 
              style={{ width: `${(activeAgents / 8) * 100}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-neon-emerald animate-pulse" />
              Ping: {networkPing}ms
            </span>
            <span>SECURE GATEWAY</span>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="flex items-center justify-between px-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-violet to-neon-indigo flex items-center justify-center font-bold text-white shrink-0 shadow-neon-indigo/20">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate leading-none mb-1">
                {user?.displayName || 'Academic User'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {user?.email || 'guest@evolving-ai.io'}
              </p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-slate-500 hover:text-neon-rose rounded-lg hover:bg-space-800 transition-colors"
            title="Disconnect Node"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
