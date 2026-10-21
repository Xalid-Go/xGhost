import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 28, className = '', showText = false }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Iconic Geometric Stealth Ghost Mark */}
      <div 
        className="relative flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-950 p-[1px] shadow-lg shadow-emerald-500/10 border border-white/10"
        style={{ width: size, height: size }}
      >
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          {/* Stealth Ghost Body Contour */}
          <path 
            d="M16 4C10.4772 4 6 8.47715 6 14V24.5C6 25.8807 7.11929 27 8.5 27C9.36214 27 10.1557 26.5574 10.6094 25.8239L12.4414 22.8596C12.8727 22.1611 13.626 21.7344 14.4444 21.7344H17.5556C18.374 21.7344 19.1273 22.1611 19.5586 22.8596L21.3906 25.8239C21.8443 26.5574 22.6379 27 23.5 27C24.8807 27 26 25.8807 26 24.5V14C26 8.47715 21.5228 4 16 4Z" 
            fill="url(#ghost-grad)"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1.2"
          />

          {/* Glowing Eyes / Terminal Prompt Slit */}
          <rect x="10.5" y="12" width="3" height="3" rx="1.5" fill="#10B981" />
          <rect x="18.5" y="12" width="3" height="3" rx="1.5" fill="#10B981" />

          {/* Micro Terminal Prompt Signal */}
          <path 
            d="M13 18.5L15 17L13 15.5" 
            stroke="#10B981" 
            strokeWidth="1.2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            opacity="0.8"
          />
          <line 
            x1="17" 
            y1="18.5" 
            x2="19" 
            y2="18.5" 
            stroke="#10B981" 
            strokeWidth="1.2" 
            strokeLinecap="round" 
            opacity="0.8"
          />

          <defs>
            <linearGradient id="ghost-grad" x1="16" y1="4" x2="16" y2="27" gradientUnits="userSpaceOnUse">
              <stop stopColor="#27272A" />
              <stop offset="1" stopColor="#09090B" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold tracking-tight text-white text-sm">
              xGhost
            </span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
              Copilot
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 font-mono tracking-wider">
            STEALTH HUD v1.0
          </span>
        </div>
      )}
    </div>
  );
};
