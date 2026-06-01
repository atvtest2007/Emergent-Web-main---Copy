import React from 'react';

interface TVFrameProps {
  children: React.ReactNode;
}

export default function TVFrame({ children }: TVFrameProps) {
  return (
    <div className="relative flex-shrink-0" style={{ width: 960, height: 600 }}>
      {/* TV outer glow */}
      <div
        className="absolute"
        style={{
          inset: -2,
          borderRadius: 22,
          boxShadow: '0 0 0 1px #1e2838, 0 0 0 3px #0d1117, 0 0 80px rgba(14,165,233,0.06), 0 60px 120px rgba(0,0,0,0.9)',
        }}
      />

      {/* TV body */}
      <div
        className="relative overflow-hidden"
        style={{
          width: 960,
          height: 540,
          borderRadius: 14,
          background: '#000',
          border: '2px solid #1a2030',
        }}
      >
        {/* Screen bezel inner shadow */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            borderRadius: 12,
            boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.03), inset 0 0 40px rgba(0,0,0,0.5)',
          }}
        />

        {/* Screen content */}
        <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 12 }}>
          {children}
        </div>

        {/* Screen glare */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 40%)',
          }}
        />
      </div>

      {/* TV stand neck */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: 541,
          width: 90,
          height: 30,
          background: 'linear-gradient(180deg, #1a2030 0%, #0d1117 100%)',
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
        }}
      />

      {/* TV stand base */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: 570,
          width: 220,
          height: 18,
          background: 'linear-gradient(180deg, #1a2030 0%, #0d1117 100%)',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
      />

      {/* TV brand dot */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          bottom: 52,
          width: 8,
          height: 8,
          background: 'rgba(14,165,233,0.5)',
          boxShadow: '0 0 8px rgba(14,165,233,0.4)',
        }}
      />

      {/* Label at bottom */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5"
        style={{ bottom: 6 }}>
        <span className="text-xs font-black" style={{ color: '#334155', letterSpacing: 2, fontSize: 9 }}>MAXX</span>
        <div className="w-1 h-1 rounded-full" style={{ background: '#334155' }} />
        <span className="text-xs font-medium" style={{ color: '#1e2838', fontSize: 9 }}>ANDROID TV</span>
      </div>
    </div>
  );
}
