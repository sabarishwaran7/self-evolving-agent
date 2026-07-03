import React, { useState, useEffect } from 'react';
import { BellRing, Smartphone, Mail, Send, Radio, History, RefreshCcw } from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function NotificationCenter({ user, addToast }) {
  const [recipient, setRecipient] = useState(user?.phone || '');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('both'); // email, whatsapp, both
  const [event, setEvent] = useState('login_success');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // Config Toggles
  const [whatsappToggle, setWhatsappToggle] = useState(true);
  const [emailToggle, setEmailToggle] = useState(true);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/notifications', {
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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!recipient || !message) return;

    setIsLoading(true);
    addToast('info', 'Dispatching Alert', 'Firing Twilio and SendGrid dispatch tunnels...');

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          type,
          event,
          recipient,
          subject: 'AI Research Node Security Alert',
          message
        })
      });
      const data = await response.json();
      if (response.ok) {
        addToast('success', 'Alert Dispatched', `Alert status: ${data.data.status}`);
        setMessage('');
        loadHistory();
      } else {
        throw new Error(data.detail);
      }
    } catch (err) {
      addToast('error', 'Dispatch Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <BellRing className="w-8 h-8 text-neon-emerald animate-bounce" />
          Multi-Channel Notification Hub
        </h1>
        <p className="text-xs text-slate-400">
          Orchestrate and audit Twilio WhatsApp SMS streams and SendGrid PDF document deliveries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings and Test Senders column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Channel configuration toggles */}
          <GlassCard title="Alert Channels Config" glowColor="indigo">
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-space-950/60 rounded-xl border border-white/5">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-neon-cyan" />
                  <div>
                    <p className="font-semibold text-slate-200">Twilio WhatsApp Sandbox</p>
                    <span className="text-[10px] text-slate-500">Dispatch paper alerts</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappToggle}
                  onChange={(e) => setWhatsappToggle(e.target.checked)}
                  className="w-4 h-4 text-neon-cyan focus:ring-0 accent-neon-cyan rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-space-950/60 rounded-xl border border-white/5">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-neon-violet" />
                  <div>
                    <p className="font-semibold text-slate-200">SendGrid Email Core</p>
                    <span className="text-[10px] text-slate-500">Deliver compiled PDFs</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailToggle}
                  onChange={(e) => setEmailToggle(e.target.checked)}
                  className="w-4 h-4 text-neon-cyan focus:ring-0 accent-neon-cyan rounded"
                />
              </div>
            </div>
          </GlassCard>

          {/* Quick manual alert dispatcher */}
          <GlassCard title="Quick Dispatcher" glowColor="cyan">
            <form onSubmit={handleSend} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Channel Routing</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition"
                >
                  <option value="both">Both (WhatsApp + Email)</option>
                  <option value="whatsapp">WhatsApp Sandbox</option>
                  <option value="email">SendGrid Email</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Recipient Address/Phone</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. +919876543210 or name@gmail.com"
                  className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl py-3 px-4 text-slate-200 focus:outline-none transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold block">Alert Content Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write test notification brief here..."
                  rows="3"
                  className="w-full bg-space-950/70 border border-white/5 focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/40 rounded-xl p-3 text-slate-200 focus:outline-none placeholder:text-slate-600 transition leading-relaxed text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !message}
                className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-neon-indigo to-neon-cyan text-white shadow-neon-indigo hover:scale-102 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50 text-xs"
              >
                <Send className="w-4 h-4" />
                {isLoading ? 'Dispatching Tunnels...' : 'Dispatch Alert Message'}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Real-time delivery logs table */}
        <div className="lg:col-span-2">
          <GlassCard 
            title="Notification Dispatch Audit Logs" 
            glowColor="emerald"
            headerActions={
              <button 
                onClick={loadHistory} 
                className="p-1.5 rounded-lg hover:bg-space-850 border border-white/5 transition"
              >
                <RefreshCcw className="w-3.5 h-3.5 text-slate-500 hover:text-white" />
              </button>
            }
          >
            <div className="overflow-x-auto rounded-xl border border-white/5 max-h-[460px] overflow-y-auto pr-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-space-950 text-slate-500 uppercase tracking-widest text-[9px] border-b border-white/5">
                    <th className="p-3.5 font-bold">Time</th>
                    <th className="p-3.5 font-bold">Channel</th>
                    <th className="p-3.5 font-bold">Event Type</th>
                    <th className="p-3.5 font-bold">Recipient address</th>
                    <th className="p-3.5 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-10 text-center text-slate-500 italic">
                        No notification alert dispatches audited yet.
                      </td>
                    </tr>
                  ) : (
                    history.map((h, i) => (
                      <tr key={i} className="hover:bg-space-900/30 transition-colors">
                        <td className="p-3.5 font-mono text-slate-400">
                          {new Date(h.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded border border-white/10 text-slate-300 font-mono uppercase tracking-wider text-[10px]">
                            {h.type}
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-200">
                          {h.event.replace('_', ' ')}
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono truncate max-w-[150px]">
                          {h.recipient}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                            h.status === 'sent' || h.status === 'simulated'
                              ? 'bg-neon-emerald/5 border-neon-emerald/30 text-neon-emerald'
                              : 'bg-neon-rose/5 border-neon-rose/30 text-neon-rose'
                          }`}>
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
