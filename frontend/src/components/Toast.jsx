import React from 'react';
import { CheckCircle2, AlertOctagon, Info, AlertTriangle, X } from 'lucide-react';

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-neon-cyan" />;
        let borderClass = 'border-neon-cyan/40 shadow-neon-cyan/5';
        let glowClass = 'text-neon-cyan';
        
        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-neon-emerald" />;
          borderClass = 'border-neon-emerald/40 shadow-neon-emerald/5';
          glowClass = 'text-neon-emerald';
        } else if (toast.type === 'error') {
          icon = <AlertOctagon className="w-5 h-5 text-neon-rose" />;
          borderClass = 'border-neon-rose/40 shadow-neon-rose/5';
          glowClass = 'text-neon-rose';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-neon-fuchsia animate-pulse" />;
          borderClass = 'border-neon-fuchsia/40 shadow-neon-fuchsia/5';
          glowClass = 'text-neon-fuchsia';
        }

        return (
          <div
            key={toast.id}
            className={`w-full flex gap-3 p-4 rounded-xl border bg-space-900/90 backdrop-blur-md shadow-lg ${borderClass} animate-float overflow-hidden relative`}
          >
            {/* Left Glowing Accent strip */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-current ${glowClass}`} />
            
            {/* Content info */}
            <div className="shrink-0 pt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white tracking-tight">{toast.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
