import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="relative mx-auto flex-shrink-0" style={{ width: 390, height: 844 }}>
      {/* Outer shell glow */}
      <div
        className="absolute inset-0 rounded-[50px]"
        style={{
          boxShadow: '0 0 0 1px #1e2838, 0 0 0 3px #0d1117, 0 0 60px rgba(14,165,233,0.08), 0 50px 100px rgba(0,0,0,0.8)',
          borderRadius: 50,
        }}
      />

      {/* Phone body */}
      <div
        className="relative overflow-hidden"
        style={{
          width: 390,
          height: 844,
          borderRadius: 50,
          background: '#000',
        }}
      >
        {/* Side buttons (decorative) */}
        <div className="absolute -left-1 top-36 rounded-l-sm" style={{ width: 3, height: 38, background: '#1a1a1a' }} />
        <div className="absolute -left-1 top-80 rounded-l-sm" style={{ width: 3, height: 28, background: '#1a1a1a' }} />
        <div className="absolute -left-1 top-96 rounded-l-sm" style={{ width: 3, height: 28, background: '#1a1a1a' }} />
        <div className="absolute -right-1 top-52 rounded-r-sm" style={{ width: 3, height: 72, background: '#1a1a1a' }} />

        {/* Screen glass */}
        <div className="absolute inset-0" style={{ borderRadius: 50 }}>
          {/* Dynamic Island */}
          <div
            className="absolute z-50 left-1/2 -translate-x-1/2"
            style={{
              top: 12,
              width: 126,
              height: 37,
              background: '#000',
              borderRadius: 20,
              zIndex: 100,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
            }}
          >
            {/* Camera dot */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full" style={{ width: 10, height: 10, background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
              <div className="absolute inset-0.5 rounded-full" style={{ background: 'rgba(14,165,233,0.15)' }} />
            </div>
          </div>

          {/* Status Bar */}
          <div
            className="absolute top-0 left-0 right-0 flex items-center justify-between z-40"
            style={{ height: 54, paddingTop: 16, paddingLeft: 28, paddingRight: 28 }}
          >
            <span className="text-xs font-bold text-white" style={{ letterSpacing: '0.02em' }}>9:41</span>
            <div className="flex items-center gap-1.5">
              {/* Signal */}
              <div className="flex gap-0.5 items-end" style={{ height: 12 }}>
                {[3, 5, 7, 10].map((h, i) => (
                  <div key={i} className="w-1 rounded-sm" style={{ height: h, background: i < 3 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }} />
                ))}
              </div>
              {/* WiFi */}
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path d="M8 10.5C8.8 10.5 9.5 9.8 9.5 9S8.8 7.5 8 7.5 6.5 8.2 6.5 9 7.2 10.5 8 10.5Z" fill="white" fillOpacity="0.9" />
                <path d="M8 5.5C9.7 5.5 11.2 6.2 12.3 7.3L13.5 6.1C12 4.6 10.1 3.7 8 3.7C5.9 3.7 4 4.6 2.5 6.1L3.7 7.3C4.8 6.2 6.3 5.5 8 5.5Z" fill="white" fillOpacity="0.9" />
                <path d="M8 1.5C11 1.5 13.7 2.8 15.5 4.9L16.7 3.7C14.6 1.4 11.5 0 8 0C4.5 0 1.4 1.4-0.7 3.7L0.5 4.9C2.3 2.8 5 1.5 8 1.5Z" fill="white" fillOpacity="0.6" />
              </svg>
              {/* Battery */}
              <div className="flex items-center gap-0.5">
                <div className="relative rounded-sm" style={{ width: 25, height: 13, border: '1.5px solid rgba(255,255,255,0.6)', padding: 1.5 }}>
                  <div className="h-full rounded-sm" style={{ width: '75%', background: 'rgba(255,255,255,0.9)' }} />
                </div>
                <div className="rounded-sm" style={{ width: 2, height: 5, background: 'rgba(255,255,255,0.5)' }} />
              </div>
            </div>
          </div>

          {/* Screen content */}
          <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 50 }}>
            {children}
          </div>

          {/* Screen glare overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: 50,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
