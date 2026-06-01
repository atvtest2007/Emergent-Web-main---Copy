import { useState } from 'react';
import { Eye, EyeOff, ChevronRight, Tv2, Wifi, Link } from 'lucide-react';
import type { Screen } from '@/types';

interface Props { onNavigate: (s: Screen) => void; }
type Tab = 'xtream' | 'm3u' | 'activation';

function TVInput({ label, placeholder, type = 'text', icon }: { label: string; placeholder: string; type?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold uppercase tracking-wider" style={{ color: '#475569', fontSize: 11 }}>{label}</label>
      <div className="relative flex items-center">
        {icon && <div className="absolute left-4" style={{ color: '#334155' }}>{icon}</div>}
        <input
          type={type} placeholder={placeholder} readOnly
          className="w-full py-3.5 rounded-2xl text-sm outline-none"
          style={{
            background: '#0d1117',
            border: '1px solid #1e2838',
            color: '#94a3b8',
            paddingLeft: icon ? 44 : 18,
            paddingRight: 18,
          }}
        />
      </div>
    </div>
  );
}

export default function TVLoginScreen({ onNavigate }: Props) {
  const [tab, setTab] = useState<Tab>('xtream');
  const [showPass, setShowPass] = useState(false);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'xtream', label: 'Xtream Codes', icon: <Wifi size={16} /> },
    { id: 'm3u', label: 'M3U URL', icon: <Link size={16} /> },
    { id: 'activation', label: 'Activation Code', icon: <Tv2 size={16} /> },
  ];

  return (
    <div className="absolute inset-0 flex" style={{ background: 'linear-gradient(135deg, #080c14 0%, #0a1628 100%)' }}>
      {/* Left panel — branding */}
      <div className="flex flex-col items-center justify-center flex-shrink-0" style={{ width: 340, background: 'rgba(14,165,233,0.04)', borderRight: '1px solid rgba(14,165,233,0.1)' }}>
        <div className="absolute pointer-events-none" style={{
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)',
          top: '50%', left: 170, transform: 'translate(-50%, -50%)',
        }} />
        <div className="flex flex-col items-center gap-5 relative">
          <div className="flex items-center justify-center rounded-3xl"
            style={{
              width: 96, height: 96,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              boxShadow: '0 0 50px rgba(14,165,233,0.5), 0 16px 40px rgba(0,0,0,0.4)',
            }}>
            <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
              <path d="M12 8L38 24L12 40V8Z" fill="white" />
              <circle cx="36" cy="12" r="5" fill="rgba(255,255,255,0.6)" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black" style={{ color: '#f8fafc', letterSpacing: '-0.5px' }}>
              Maxx<span style={{ color: '#0ea5e9' }}>Player</span>
            </h1>
            <p className="text-sm mt-1 font-medium" style={{ color: '#475569' }}>Stream Everything</p>
          </div>
          <div className="flex flex-col gap-2 mt-4 w-full px-8">
            {['4K HDR Streaming', 'Live TV & EPG', 'Movies & Series', 'Catch Up TV'].map((feat) => (
              <div key={feat} className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.1)' }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#0ea5e9' }} />
                <span className="text-sm font-medium" style={{ color: '#64748b' }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col justify-center px-12">
        <div className="max-w-lg w-full mx-auto">
          <h2 className="text-2xl font-black mb-1" style={{ color: '#f8fafc' }}>Connect Your Service</h2>
          <p className="text-sm mb-6" style={{ color: '#475569' }}>Choose your connection method to start streaming</p>

          {/* Tab selector */}
          <div className="flex rounded-2xl p-1 mb-6" style={{ background: '#0d1117', border: '1px solid #1e2838' }}>
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: tab === t.id ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'transparent',
                  color: tab === t.id ? '#fff' : '#475569',
                  boxShadow: tab === t.id ? '0 4px 14px rgba(14,165,233,0.35)' : 'none',
                }}>
                {t.icon}
                <span style={{ fontSize: 12 }}>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-4 mb-6">
            {tab === 'xtream' && (
              <>
                <TVInput label="Server URL" placeholder="http://provider.com:8080" icon={<Link size={16} />} />
                <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <TVInput label="Username" placeholder="your_username" />
                  <div className="relative">
                    <TVInput label="Password" placeholder="your_password" type={showPass ? 'text' : 'password'} />
                    <button onClick={() => setShowPass(!showPass)}
                      className="absolute right-4" style={{ color: '#475569', bottom: 14 }}>
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </>
            )}
            {tab === 'm3u' && (
              <TVInput label="M3U Playlist URL" placeholder="http://provider.com/get.php?username=...&output=m3u8" icon={<Link size={16} />} />
            )}
            {tab === 'activation' && (
              <div className="flex gap-6 items-center">
                <div className="flex flex-col items-center justify-center rounded-2xl flex-shrink-0 gap-3 p-6"
                  style={{ width: 160, background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)' }}>
                  <Tv2 size={36} style={{ color: '#0ea5e9' }} />
                  <p className="text-xs font-semibold text-center" style={{ color: '#475569' }}>
                    Visit<br /><span style={{ color: '#0ea5e9' }}>my.maxxplayer.com</span><br />to get your code
                  </p>
                </div>
                <div className="flex-1">
                  <TVInput label="Activation Code" placeholder="e.g.  ABC - 123 - XYZ" />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('playlist-select')}
              className="flex-1 py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: '#fff', boxShadow: '0 8px 28px rgba(14,165,233,0.4)' }}>
              {tab === 'activation' ? 'Activate Device' : 'Connect & Stream'}
              <ChevronRight size={20} />
            </button>
            <button className="px-6 py-3.5 rounded-2xl font-semibold text-sm"
              style={{ border: '1px solid rgba(14,165,233,0.25)', color: '#0ea5e9', background: 'rgba(14,165,233,0.05)' }}>
              Register
            </button>
          </div>

          <p className="text-center text-xs mt-4" style={{ color: '#1e2838' }}>By continuing you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  );
}
