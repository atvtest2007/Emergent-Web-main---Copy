import { useState } from 'react';
import { Eye, EyeOff, ChevronRight, Tv2 } from 'lucide-react';

interface Props { onNavigate: (s: string) => void; }
type Tab = 'xtream' | 'm3u' | 'activation';

function InputField({ label, placeholder, type = 'text' }: { label: string; placeholder: string; type?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>{label}</label>
      <input
        type={type} placeholder={placeholder} readOnly
        className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
        style={{ background: '#12161e', border: '1px solid #1e2838', color: '#94a3b8' }}
      />
    </div>
  );
}

export default function LoginScreen({ onNavigate }: Props) {
  const [tab, setTab] = useState<Tab>('xtream');
  const [showPass, setShowPass] = useState(false);
  const tabs: { id: Tab; label: string }[] = [
    { id: 'xtream', label: 'Xtream' },
    { id: 'm3u', label: 'M3U URL' },
    { id: 'activation', label: 'Code' },
  ];
  return (
    <div className="absolute inset-0 flex flex-col overflow-y-auto" style={{ background: 'linear-gradient(160deg, #0a0a0f 0%, #0d1117 60%, #0a1628 100%)' }}>
      <div className="flex flex-col items-center pt-20 pb-6 px-6">
        <div
          className="flex items-center justify-center rounded-2xl mb-4"
          style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', boxShadow: '0 0 24px rgba(14,165,233,0.35)' }}
        >
          <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
            <path d="M12 8L38 24L12 40V8Z" fill="white" />
            <circle cx="36" cy="12" r="5" fill="rgba(255,255,255,0.6)" />
          </svg>
        </div>
        <h1 className="text-2xl font-black" style={{ color: '#f8fafc' }}>Maxx<span style={{ color: '#0ea5e9' }}>Player</span></h1>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>Sign in to start streaming</p>
      </div>

      <div className="mx-6 mb-5">
        <div className="flex rounded-2xl p-1" style={{ background: '#12161e' }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: tab === t.id ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'transparent',
                color: tab === t.id ? '#fff' : '#64748b',
                boxShadow: tab === t.id ? '0 4px 12px rgba(14,165,233,0.3)' : 'none',
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      <div className="mx-6 flex flex-col gap-3">
        {tab === 'xtream' && (
          <>
            <InputField label="Server URL" placeholder="http://provider.com:8080" />
            <InputField label="Username" placeholder="your_username" />
            <div className="relative">
              <InputField label="Password" placeholder="your_password" type={showPass ? 'text' : 'password'} />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-4 bottom-3.5" style={{ color: '#475569' }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </>
        )}
        {tab === 'm3u' && <InputField label="M3U Playlist URL" placeholder="http://provider.com/playlist.m3u" />}
        {tab === 'activation' && (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="flex items-center justify-center rounded-2xl" style={{ width: 72, height: 72, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)' }}>
              <Tv2 size={32} style={{ color: '#0ea5e9' }} />
            </div>
            <p className="text-sm font-medium text-center" style={{ color: '#94a3b8' }}>
              Visit <span style={{ color: '#0ea5e9' }}>my.maxxplayer.com</span> to get your activation code
            </p>
            <div className="w-full"><InputField label="Activation Code" placeholder="e.g. ABC-123-XYZ" /></div>
          </div>
        )}

        <button
          onClick={() => onNavigate('playlist-select')}
          className="w-full py-4 rounded-2xl font-bold text-white text-base mt-2 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', boxShadow: '0 8px 24px rgba(14,165,233,0.35)' }}
        >
          {tab === 'activation' ? 'Activate Device' : 'Connect & Stream'}
          <ChevronRight size={18} />
        </button>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px" style={{ background: '#1e2838' }} />
          <span className="text-xs" style={{ color: '#475569' }}>or</span>
          <div className="flex-1 h-px" style={{ background: '#1e2838' }} />
        </div>

        <button className="w-full py-3.5 rounded-2xl font-semibold text-sm"
          style={{ border: '1px solid rgba(14,165,233,0.25)', color: '#0ea5e9', background: 'rgba(14,165,233,0.05)' }}>
          Register at my.maxxplayer.com
        </button>
      </div>
      <p className="text-center text-xs mt-6 mb-8" style={{ color: '#334155' }}>By continuing you agree to our Terms of Service</p>
    </div>
  );
}
