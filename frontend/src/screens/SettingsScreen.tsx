import { useState } from 'react';
import { Globe, Lock, EyeOff, HardDrive, RefreshCw, Play, Bell, LogOut, ChevronRight, Shield, Tv2, X, Check, Info, Moon } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative flex-shrink-0"
      style={{
        width: 44,
        height: 26,
        borderRadius: 13,
        background: on ? 'linear-gradient(135deg, #E50914, #B80710)' : '#2A2A2A',
        transition: 'background 0.2s',
        boxShadow: on ? '0 0 10px rgba(229,9,20,0.35)' : 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  );
}

function SettingRow({
  icon: Icon, iconColor, label, value, showChevron = false, children
}: {
  icon: React.ComponentType<{ size: number; style?: React.CSSProperties }>;
  iconColor: string;
  label: string;
  value?: string;
  showChevron?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5" style={{ background: '#1A1A1A', borderTop: '1px solid #1a2030' }}>
      <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 36, height: 36, background: `${iconColor}18` }}>
        <Icon size={17} style={{ color: iconColor }} />
      </div>
      <span className="flex-1 text-sm font-medium" style={{ color: '#e2e8f0' }}>{label}</span>
      {children ? (
        children
      ) : (
        <div className="flex items-center gap-1.5">
          {value && <span className="text-xs" style={{ color: '#64748b' }}>{value}</span>}
          {showChevron && <ChevronRight size={14} style={{ color: '#334155' }} />}
        </div>
      )}
    </div>
  );
}

function SettingGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: '#475569' }}>{title}</p>
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #2A2A2A' }}>
        {children}
      </div>
    </div>
  );
}

export default function SettingsScreen() {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [hwAccel, setHwAccel] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [livePlayer, setLivePlayer] = useState<'exo' | 'vlc'>('exo');
  const [moviePlayer, setMoviePlayer] = useState<'exo' | 'vlc'>('exo');

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#030608' }}>
      {/* Header */}
      <div className="flex-shrink-0 pt-14 px-5 pb-4" style={{ background: 'linear-gradient(180deg, #141414 0%, #030608 100%)' }}>
        <h1 className="text-xl font-black" style={{ color: '#f8fafc' }}>Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 px-5" style={{ scrollbarWidth: 'none' }}>
        {/* Profile card */}
        <div
          className="rounded-2xl p-4 mb-5 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, rgba(229,9,20,0.1), rgba(2,132,199,0.05))', border: '1px solid rgba(229,9,20,0.2)' }}
        >
          <div className="relative flex-shrink-0">
            <div className="flex items-center justify-center rounded-2xl font-black text-2xl"
              style={{ width: 58, height: 58, background: 'linear-gradient(135deg, #E50914, #B80710)', color: '#fff', boxShadow: '0 0 20px rgba(229,9,20,0.3)' }}>
              M
            </div>
            <div className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center"
              style={{ width: 18, height: 18, background: '#22c55e', border: '2px solid #030608' }}>
              <Check size={9} style={{ color: '#fff' }} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold" style={{ color: '#f1f5f9' }}>Maxx User</p>
            <p className="text-xs" style={{ color: '#64748b' }}>My IPTV Subscription</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
              <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>12,450 channels · Active</span>
            </div>
          </div>
          <ChevronRight size={16} style={{ color: '#334155' }} />
        </div>

        {/* General */}
        <SettingGroup title="General">
          <SettingRow icon={Globe} iconColor="#E50914" label="Language" value="English" showChevron />
          <SettingRow icon={Bell} iconColor="#22c55e" label="Notifications">
            <Toggle on={notifications} onToggle={() => setNotifications(!notifications)} />
          </SettingRow>
          <SettingRow icon={Moon} iconColor="#38bdf8" label="Dark Mode">
            <Toggle on={darkMode} onToggle={() => setDarkMode(!darkMode)} />
          </SettingRow>
        </SettingGroup>

        {/* Security */}
        <SettingGroup title="Security">
          <SettingRow icon={Lock} iconColor="#f59e0b" label="Parental Control" value="4-digit PIN" showChevron />
          <SettingRow icon={EyeOff} iconColor="#ef4444" label="Hidden Content" value="Manage" showChevron />
          <SettingRow icon={Shield} iconColor="#64748b" label="Privacy" value="Manage" showChevron />
        </SettingGroup>

        {/* Playback */}
        <SettingGroup title="Playback">
          {/* Live TV player toggle */}
          <div className="px-4 py-3.5" style={{ borderTop: '1px solid #1a2030' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#475569' }}>Live TV Player</p>
            <div className="flex gap-2">
              {(['exo', 'vlc'] as const).map((p) => (
                <button key={p} onClick={() => setLivePlayer(p)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wide"
                  style={{
                    background: livePlayer === p ? 'rgba(229,9,20,0.15)' : '#0d1117',
                    border: `1px solid ${livePlayer === p ? 'rgba(229,9,20,0.4)' : '#1a2030'}`,
                    color: livePlayer === p ? '#38bdf8' : '#475569',
                  }}>
                  {p === 'exo' ? 'ExoPlayer' : 'VLC Media'}
                </button>
              ))}
            </div>
          </div>
          {/* Movie player toggle */}
          <div className="px-4 py-3.5" style={{ borderTop: '1px solid #1a2030' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#475569' }}>Movie / Series Player</p>
            <div className="flex gap-2">
              {(['exo', 'vlc'] as const).map((p) => (
                <button key={p} onClick={() => setMoviePlayer(p)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wide"
                  style={{
                    background: moviePlayer === p ? 'rgba(229,9,20,0.15)' : '#0d1117',
                    border: `1px solid ${moviePlayer === p ? 'rgba(229,9,20,0.4)' : '#1a2030'}`,
                    color: moviePlayer === p ? '#38bdf8' : '#475569',
                  }}>
                  {p === 'exo' ? 'ExoPlayer' : 'VLC Media'}
                </button>
              ))}
            </div>
          </div>
          <SettingRow icon={Tv2} iconColor="#22c55e" label="Video Quality" value="Auto" showChevron />
          <SettingRow icon={Play} iconColor="#f59e0b" label="Autoplay Next Episode">
            <Toggle on={autoplay} onToggle={() => setAutoplay(!autoplay)} />
          </SettingRow>
          <SettingRow icon={Tv2} iconColor="#E50914" label="Hardware Acceleration">
            <Toggle on={hwAccel} onToggle={() => setHwAccel(!hwAccel)} />
          </SettingRow>
        </SettingGroup>

        {/* Data */}
        <SettingGroup title="Data & Sync">
          <SettingRow icon={HardDrive} iconColor="#f59e0b" label="Clear Cache" value="124 MB" showChevron />
          <SettingRow icon={RefreshCw} iconColor="#E50914" label="Refresh Playlists" showChevron>
            <button
              className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(229,9,20,0.1)', color: '#E50914', border: '1px solid rgba(229,9,20,0.2)' }}
            >
              Sync Now
            </button>
          </SettingRow>
        </SettingGroup>

        {/* App info card */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ border: '1px solid #2A2A2A' }}>
          <div className="p-4" style={{ background: '#0d1117' }}>
            <div className="flex items-center gap-2 mb-3">
              <Info size={15} style={{ color: '#475569' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>About</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: '#64748b' }}>App Version</span>
              <span className="text-sm font-semibold" style={{ color: '#94a3b8' }}>1.0.0 (Build 42)</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: '#64748b' }}>Portal</span>
              <span className="text-sm font-semibold" style={{ color: '#E50914' }}>my.maxxplayer.com</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#64748b' }}>Last Sync</span>
              <span className="text-sm" style={{ color: '#475569' }}>2 minutes ago</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogout(true)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm mb-2"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
        >
          <LogOut size={17} /> Logout
        </button>
      </div>

      {/* Logout modal */}
      {showLogout && (
        <div
          className="absolute inset-0 flex items-end justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
        >
          <div className="w-full rounded-t-3xl p-6" style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black" style={{ color: '#f8fafc' }}>Logout</h3>
              <button onClick={() => setShowLogout(false)} className="flex items-center justify-center rounded-full" style={{ width: 28, height: 28, background: '#2A2A2A' }}>
                <X size={14} style={{ color: '#64748b' }} />
              </button>
            </div>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: '#64748b' }}>
              Are you sure you want to logout? You will need to re-enter your credentials to access your playlists.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)} className="flex-1 py-3.5 rounded-2xl font-semibold text-sm"
                style={{ background: '#2A2A2A', color: '#94a3b8' }}>
                Cancel
              </button>
              <button onClick={() => navigate('/login')} className="flex-1 py-3.5 rounded-2xl font-semibold text-sm"
                style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="settings" />
    </div>
  );
}
