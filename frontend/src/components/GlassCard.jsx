import React from 'react';

export default function GlassCard({ children, className = '', title, headerActions, glowColor = 'indigo' }) {
  const glowShadowMap = {
    indigo: 'hover:shadow-neon-indigo/5 border-white/5 hover:border-neon-indigo/25',
    cyan: 'hover:shadow-neon-cyan/5 border-white/5 hover:border-neon-cyan/25',
    emerald: 'hover:shadow-neon-emerald/5 border-white/5 hover:border-neon-emerald/25',
    rose: 'hover:shadow-neon-rose/5 border-white/5 hover:border-neon-rose/25',
    fuchsia: 'hover:shadow-neon-fuchsia/5 border-white/5 hover:border-neon-fuchsia/25'
  };

  const selectedGlow = glowShadowMap[glowColor] || glowShadowMap.indigo;

  return (
    <div className={`glass-panel glass-panel-hover rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden group ${selectedGlow} ${className}`}>
      {/* Background soft glowing orb */}
      <div className="absolute -top-12 -left-12 w-24 h-24 bg-gradient-to-br from-neon-indigo/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
      
      {/* Header section if title provided */}
      {title && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5 relative z-10">
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            {title}
          </h3>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}

      {/* Main card content container */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
