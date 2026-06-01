import { RefreshCw, Plus, Wifi, WifiOff, Loader, ChevronRight, CheckCircle2 } from 'lucide-react';
import { playlists } from '../../data/mockData';
import type { Screen } from '@/types';

interface Props { onNavigate: (s: Screen) => void; }

export default function TVPlaylistScreen({ onNavigate }: Props) {
  return (
    <div className="absolute inset-0 flex" style={{ background: '#080c14' }}>
      {/* Left decorative panel */}
      <div className="flex-shrink-0 flex flex-col justify-center px-10"
        style={{ width: 320, background: 'rgba(14,165,233,0.03)', borderRight: '1px solid rgba(14,165,233,0.08)' }}>
        <div className="absolute pointer-events-none" style={{
          width: 350, height: 350,
          background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)',
          top: '50%', left: 160, transform: 'translate(-50%, -50%)',
        }} />
        <div className="relative flex flex-col gap-5">
          <div className="flex items-center justify-center rounded-2xl"
            style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 0 36px rgba(14,165,233,0.4)' }}>
            <svg width="38" height="38" viewBox="0 0 48 48" fill="none">
              <path d="M12 8L38 24L12 40V8Z" fill="white" />
              <circle cx="36" cy="12" r="5" fill="rgba(255,255,255,0.6)" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-black" style={{ color: '#f8fafc', letterSpacing: '-0.5px' }}>
              Maxx<span style={{ color: '#0ea5e9' }}>Player</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: '#475569' }}>Select a playlist to continue</p>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {[
              { label: 'Live Channels', value: `${playlists.reduce((a, p) => a + p.channelCount, 0).toLocaleString()}+`, color: '#0ea5e9' },
              { label: 'Active Playlists', value: String(playlists.filter(p => p.status === 'active').length), color: '#22c55e' },
              { label: 'Connection', value: 'Secure', color: '#22c55e' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                style={{ background: '#0d1117', border: '1px solid #1a2030' }}>
                <span className="text-sm font-medium" style={{ color: '#64748b' }}>{label}</span>
                <span className="text-sm font-bold" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: playlist list */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 px-8 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 className="text-xl font-black" style={{ color: '#f8fafc' }}>My Playlists</h2>
          <p className="text-sm" style={{ color: '#475569' }}>{playlists.length} playlists configured · Select one to stream</p>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-5 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
          {playlists.map((pl) => (
            <button key={pl.id}
              onClick={() => onNavigate('home')}
              className="w-full text-left rounded-2xl p-5 group"
              style={{ background: '#0d1117', border: '1px solid #1a2030', transition: 'border-color 0.15s' }}>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center rounded-2xl flex-shrink-0"
                  style={{
                    width: 56, height: 56,
                    background: pl.status === 'active' ? 'rgba(14,165,233,0.12)' : pl.status === 'syncing' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${pl.status === 'active' ? 'rgba(14,165,233,0.25)' : pl.status === 'syncing' ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'}`,
                  }}>
                  {pl.status === 'active' && <Wifi size={24} style={{ color: '#0ea5e9' }} />}
                  {pl.status === 'syncing' && <Loader size={24} style={{ color: '#f59e0b' }} />}
                  {pl.status === 'error' && <WifiOff size={24} style={{ color: '#ef4444' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-base font-bold" style={{ color: '#f1f5f9' }}>{pl.name}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold"
                      style={{
                        background: pl.status === 'active' ? 'rgba(34,197,94,0.15)' : pl.status === 'syncing' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                        color: pl.status === 'active' ? '#22c55e' : pl.status === 'syncing' ? '#f59e0b' : '#ef4444',
                      }}>
                      {pl.status.charAt(0).toUpperCase() + pl.status.slice(1)}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase"
                      style={{ background: 'rgba(14,165,233,0.1)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.2)' }}>
                      {pl.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm" style={{ color: '#475569' }}>{pl.channelCount.toLocaleString()} channels</span>
                    <span style={{ color: '#1e2838' }}>·</span>
                    <span className="text-sm" style={{ color: '#475569' }}>Synced {pl.lastSync}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {pl.status === 'active' && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                      style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 5px rgba(34,197,94,0.8)' }} />
                      <span className="text-xs font-bold" style={{ color: '#22c55e' }}>Online</span>
                    </div>
                  )}
                  <div className="flex items-center justify-center rounded-xl"
                    style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
                    <ChevronRight size={20} style={{ color: '#fff' }} />
                  </div>
                </div>
              </div>
            </button>
          ))}

          {/* Actions row */}
          <div className="flex gap-3 mt-1">
            <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold"
              style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', color: '#0ea5e9' }}>
              <RefreshCw size={18} /> Refresh All Playlists
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold"
              style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', color: '#0ea5e9' }}>
              <Plus size={18} /> Add New Playlist
            </button>
          </div>

          {/* Portal note */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.12)' }}>
            <div className="flex items-center gap-3">
              <CheckCircle2 size={22} style={{ color: '#0ea5e9', flexShrink: 0 }} />
              <div>
                <p className="text-sm font-bold" style={{ color: '#e2e8f0' }}>Manage via Web Portal</p>
                <p className="text-sm" style={{ color: '#475569' }}>Add and manage all your playlists at <span style={{ color: '#0ea5e9' }}>my.maxxplayer.com</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
