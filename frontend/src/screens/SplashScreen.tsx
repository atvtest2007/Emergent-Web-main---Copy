import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SplashScreen() {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #0a0a0f 0%, #0d1117 50%, #0a1628 100%)' }}
    >
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 280, height: 280,
          background: 'radial-gradient(circle, rgba(229,9,20,0.12) 0%, transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        }}
      />
      <div className="relative flex flex-col items-center gap-4">
        <div
          className="flex items-center justify-center rounded-3xl"
          style={{
            width: 88, height: 88,
            background: 'linear-gradient(135deg, var(--brand-primary) 0%, #B80710 100%)',
            boxShadow: '0 0 40px rgba(229,9,20,0.4), 0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M12 8L38 24L12 40V8Z" fill="white" />
            <circle cx="36" cy="12" r="5" fill="rgba(255,255,255,0.6)" />
          </svg>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight" style={{ color: '#f8fafc' }}>
            Maxx<span style={{ color: 'var(--brand-primary)' }}>Player</span>
          </h1>
          <p className="text-sm mt-1 font-medium" style={{ color: '#64748b' }}>Stream Everything</p>
        </div>
      </div>
      <div className="absolute bottom-24 flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-full" style={{ width: 6, height: 6, background: i === 1 ? 'var(--brand-primary)' : '#1e293b', opacity: i === 1 ? 1 : 0.5 }} />
          ))}
        </div>
        <p className="text-xs font-medium" style={{ color: '#475569' }}>Loading your content...</p>
      </div>
      <p className="absolute bottom-8 text-xs" style={{ color: '#334155' }}>v1.0.0 · my.maxxplayer.com</p>
    </div>
  );
}
