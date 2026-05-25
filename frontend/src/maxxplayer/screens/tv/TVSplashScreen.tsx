import type { Screen } from '../../types';

interface Props { onNavigate: (s: Screen) => void; }

export default function TVSplashScreen({ onNavigate: _onNavigate }: Props) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #0a0a0f 0%, #0d1117 50%, #0a1628 100%)' }}>

      {/* Ambient glow */}
      <div className="absolute pointer-events-none" style={{
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      }} />

      {/* Decorative rings */}
      <div className="absolute rounded-full pointer-events-none" style={{
        width: 300, height: 300, border: '1px solid rgba(14,165,233,0.08)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      }} />
      <div className="absolute rounded-full pointer-events-none" style={{
        width: 420, height: 420, border: '1px solid rgba(14,165,233,0.05)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      }} />

      {/* Logo */}
      <div className="relative flex flex-col items-center gap-6">
        <div className="flex items-center justify-center rounded-3xl"
          style={{
            width: 120, height: 120,
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            boxShadow: '0 0 60px rgba(14,165,233,0.5), 0 20px 60px rgba(0,0,0,0.5)',
          }}>
          <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
            <path d="M12 8L38 24L12 40V8Z" fill="white" />
            <circle cx="36" cy="12" r="5" fill="rgba(255,255,255,0.6)" />
          </svg>
        </div>
        <div className="text-center">
          <h1 className="font-black tracking-tight" style={{ color: '#f8fafc', fontSize: 52, letterSpacing: '-1px', lineHeight: 1 }}>
            Maxx<span style={{ color: '#0ea5e9' }}>Player</span>
          </h1>
          <p className="text-lg font-medium mt-2" style={{ color: '#475569' }}>Stream Everything · Anywhere</p>
        </div>

        {/* Feature badges */}
        <div className="flex items-center gap-3 mt-2">
          {['4K HDR', 'Dolby Atmos', 'Multi-Platform', 'Xtream / M3U'].map((feat) => (
            <div key={feat} className="px-4 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', color: '#38bdf8' }}>
              {feat}
            </div>
          ))}
        </div>
      </div>

      {/* Loading indicator */}
      <div className="absolute bottom-16 flex flex-col items-center gap-4">
        {/* Progress bar */}
        <div className="rounded-full overflow-hidden" style={{ width: 200, height: 3, background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full" style={{ width: '65%', background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)' }} />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#0ea5e9', boxShadow: '0 0 6px rgba(14,165,233,0.8)' }} />
          <p className="text-sm font-medium" style={{ color: '#475569' }}>Loading your content...</p>
        </div>
      </div>

      <p className="absolute bottom-6 text-sm" style={{ color: '#1e2838' }}>v1.0.0 · my.maxxplayer.com</p>
    </div>
  );
}
