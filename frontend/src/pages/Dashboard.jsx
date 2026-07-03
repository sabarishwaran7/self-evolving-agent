import React, { useState, useEffect } from 'react';
import { 
  FileText, Lightbulb, ShieldCheck, BellRing, BrainCircuit,
  PlusCircle, RefreshCcw, ExternalLink, Calendar
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import AgentMonitor from '../components/AgentMonitor';

export default function Dashboard({ user, onNavigate, addToast }) {
  const [metrics, setMetrics] = useState({
    papersGenerated: 0,
    ideasDiscovered: 0,
    averagePlagiarism: 0.0,
    alertsSent: 0,
    learnedRulesCount: 0
  });
  const [agents, setAgents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/dashboard/metrics', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setMetrics(data.statistics);
        setAgents(data.agents);
        setActivities(data.recentActivity);
      } else if (response.status === 401) {
        window.dispatchEvent(new Event('force-logout'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Poll logs every 6 seconds to update agent monitors in real-time
    const interval = setInterval(fetchDashboardData, 6000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Papers Compiled', value: metrics.papersGenerated, icon: FileText, color: 'indigo' },
    { label: 'Gaps Discovered', value: metrics.ideasDiscovered, icon: Lightbulb, color: 'fuchsia' },
    { label: 'Avg Plagiarism', value: `${metrics.averagePlagiarism}%`, icon: ShieldCheck, color: 'rose' },
    { label: 'Dispatched Alerts', value: metrics.alertsSent, icon: BellRing, color: 'emerald' },
    { label: 'Evolved Memories', value: metrics.learnedRulesCount, icon: BrainCircuit, color: 'cyan' }
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            AI Node Command Center
          </h1>
          <p className="text-xs text-slate-400">
            Secure connection: <span className="font-semibold text-neon-cyan">Active Tunnel</span> | Cluster synchronization complete.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-white/5 bg-space-900 hover:bg-space-800 text-slate-400 hover:text-white transition disabled:opacity-50"
            title="Reload metrics"
          >
            <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => onNavigate('generator')}
            className="px-4 py-2.5 rounded-xl font-bold bg-gradient-to-r from-neon-indigo to-neon-cyan text-white shadow-neon-indigo hover:scale-102 transition flex items-center gap-1.5 text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            Synthesize Paper
          </button>
        </div>
      </div>

      {/* Stats Counter Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <GlassCard key={s.label} glowColor={s.color} className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-space-800/80 rounded-xl flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-neon-cyan" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-widest truncate">
                  {s.label}
                </span>
                <p className="text-lg md:text-xl font-extrabold text-white tracking-tight mt-0.5">
                  {s.value}
                </p>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Active AI Agent activity terminal */}
      <AgentMonitor agents={agents} logs={activities} />

      {/* Visual vector graphs and Timelines split grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual vector neural adaptation map */}
        <GlassCard title="Self-Evolving Memory Adaptation Curve" className="lg:col-span-2" glowColor="indigo">
          <div className="h-60 flex flex-col justify-between pt-4">
            {/* Custom SVG line chart for visual elegance */}
            <div className="relative flex-1 w-full bg-space-950/40 rounded-xl border border-white/5 overflow-hidden flex items-end">
              {/* background grid */}
              <div className="absolute inset-0 bg-cosmic-grid bg-grid-size opacity-40" />
              
              <svg className="w-full h-full relative z-10" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                {/* Area under line */}
                <path 
                  d="M0 200 Q 100 120, 200 140 T 400 60 L 500 80 L 500 200 Z" 
                  fill="url(#chart-glow)"
                />
                {/* Glowing line */}
                <path 
                  d="M0 200 Q 100 120, 200 140 T 400 60 L 500 80" 
                  fill="none" 
                  stroke="url(#gradient-line)" 
                  strokeWidth="3.5"
                  className="drop-shadow-neon-cyan"
                />
                
                <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </svg>
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-3 px-1">
              <span>GEN_NODE_01</span>
              <span>NEURAL_WEIGHTS_UPDATE_04</span>
              <span>SYNAPSE_TUNNEL_FINAL</span>
            </div>
          </div>
        </GlassCard>

        {/* Timeline audit logger */}
        <GlassCard title="Recent Activity" glowColor="rose">
          <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
            {activities.length === 0 ? (
              <div className="text-slate-500 italic text-center py-10 text-xs">
                No recent compilation activities discovered.
              </div>
            ) : (
              activities.slice(0, 5).map((act, idx) => (
                <div key={idx} className="flex gap-3 border-l border-white/10 pl-3.5 relative py-1 text-xs">
                  {/* indicator bullet */}
                  <div className="absolute -left-1.5 top-2 w-3 h-3 rounded-full bg-neon-cyan border border-space-950" />
                  
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-200 leading-snug">
                      {act.message}
                    </p>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(act.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
