import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ChevronRight, Tv2, Loader2, Play, Trash2 } from 'lucide-react';
import { Playlists } from '@/lib/api';
import { toast } from 'sonner';

type Tab = 'xtream' | 'm3u' | 'activation';

function InputField({ label, placeholder, type = 'text', value, onChange }: { label: string; placeholder: string; type?: string, value?: string, onChange?: (e: any) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>{label}</label>
      <input
        type={type} placeholder={placeholder} value={value} onChange={onChange}
        className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
        style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', color: '#94a3b8' }}
      />
    </div>
  );
}


export default function LoginScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('xtream');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<any[]>([]);

  const [server, setServer] = useState("");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [m3uUrl, setM3uUrl] = useState("");

  const refreshList = async () => {
    try {
      const list = await Playlists.list();
      setSaved(list || []);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (tab === 'xtream') {
        await Playlists.create({
          type: "xtream",
          name: `${user}@${server}`,
          server_url: server.trim(),
          username: user.trim(),
          password: pass,
          auto_connect: true,
        });
      } else if (tab === 'm3u') {
        await Playlists.create({
          type: "m3u",
          name: "M3U Playlist",
          m3u_url: m3uUrl || undefined,
        });
      } else {
        toast.info("Activation not implemented yet");
        setLoading(false);
        return;
      }
      toast.success("Connected successfully");
      navigate("/home");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const activateSaved = async (id: string) => {
    await Playlists.activate(id);
    toast.success("Account switched");
    window.location.href = "/home";
  };

  const removeSaved = async (id: string) => {
    await Playlists.remove(id);
    refreshList();
  };

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
          style={{ width: 64, height: 64, background: 'linear-gradient(135deg, var(--brand-primary) 0%, #B80710 100%)', boxShadow: '0 0 24px rgba(229,9,20,0.35)' }}
        >
          <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
            <path d="M12 8L38 24L12 40V8Z" fill="white" />
            <circle cx="36" cy="12" r="5" fill="rgba(255,255,255,0.6)" />
          </svg>
        </div>
        <h1 className="text-2xl font-black" style={{ color: '#f8fafc' }}>Maxx<span style={{ color: 'var(--brand-primary)' }}>Player</span></h1>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>Sign in to start streaming</p>
      </div>

      <div className="mx-6 mb-5">
        <div className="flex rounded-2xl p-1" style={{ background: '#1A1A1A' }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: tab === t.id ? 'linear-gradient(135deg, var(--brand-primary), #B80710)' : 'transparent',
                color: tab === t.id ? '#fff' : '#64748b',
                boxShadow: tab === t.id ? '0 4px 12px rgba(229,9,20,0.3)' : 'none',
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      <div className="mx-6 flex flex-col gap-3">
        {tab === 'xtream' && (
          <>
            <InputField label="Server URL" placeholder="http://provider.com:8080" value={server} onChange={(e) => setServer(e.target.value)} />
            <InputField label="Username" placeholder="your_username" value={user} onChange={(e) => setUser(e.target.value)} />
            <div className="relative">
              <InputField label="Password" placeholder="your_password" type={showPass ? 'text' : 'password'} value={pass} onChange={(e) => setPass(e.target.value)} />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-4 bottom-3.5" style={{ color: '#475569' }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </>
        )}
        {tab === 'm3u' && <InputField label="M3U Playlist URL" placeholder="http://provider.com/playlist.m3u" value={m3uUrl} onChange={(e) => setM3uUrl(e.target.value)} />}
        {tab === 'activation' && (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="flex items-center justify-center rounded-2xl" style={{ width: 72, height: 72, background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.2)' }}>
              <Tv2 size={32} style={{ color: 'var(--brand-primary)' }} />
            </div>
            <p className="text-sm font-medium text-center" style={{ color: '#94a3b8' }}>
              Visit <span style={{ color: 'var(--brand-primary)' }}>my.maxxplayer.com</span> to get your activation code
            </p>
            <div className="w-full"><InputField label="Activation Code" placeholder="e.g. ABC-123-XYZ" /></div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-white text-base mt-2 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, var(--brand-primary) 0%, #B80710 100%)', boxShadow: '0 8px 24px rgba(229,9,20,0.35)' }}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              {tab === 'activation' ? 'Activate Device' : 'Connect & Stream'}
              <ChevronRight size={18} />
            </>
          )}
        </button>

        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px" style={{ background: '#2A2A2A' }} />
          <span className="text-xs" style={{ color: '#475569' }}>or</span>
          <div className="flex-1 h-px" style={{ background: '#2A2A2A' }} />
        </div>

        <button className="w-full py-3.5 rounded-2xl font-semibold text-sm"
          style={{ border: '1px solid rgba(229,9,20,0.25)', color: 'var(--brand-primary)', background: 'rgba(229,9,20,0.05)' }}>
          Register at my.maxxplayer.com
        </button>

        {saved.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid #2A2A2A' }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#475569' }}>Saved Accounts</div>
            <div className="space-y-2">
              {saved.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                  <div className="min-w-0 flex-1 mr-2">
                    <p className="text-sm font-semibold truncate text-white">{p.name}</p>
                    <p className="text-xs truncate" style={{ color: '#64748b' }}>{p.type.toUpperCase()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => activateSaved(p.id)} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: 'var(--brand-primary)' }}>
                      <Play size={14} className="text-white" />
                    </button>
                    <button onClick={() => removeSaved(p.id)} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <Trash2 size={14} style={{ color: '#ef4444' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <p className="text-center text-xs mt-6 mb-8" style={{ color: '#334155' }}>By continuing you agree to our Terms of Service</p>
    </div>
  );
}
