import { RefreshCw, Plus, Wifi, WifiOff, Loader, ChevronRight, CheckCircle2 } from 'lucide-react';
import { playlists } from '../data/mockData';

interface Props { onNavigate: (s: string) => void; }

export default function PlaylistScreen({ onNavigate }: Props) {
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#0a0a0f' }}>
      <div className="pt-14 px-6 pb-4" style={{ background: 'linear-gradient(180deg, #0d1117 0%, #0a0a0f 100%)' }}>
        <h2 className="text-xl font-black" style={{ color: '#f8fafc' }}>My Playlists</h2>
        <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>Select a playlist to stream</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-3">
        {playlists.map((pl) => (
          <button key={pl.id} onClick={() => onNavigate('home')}
            className="w-full text-left rounded-2xl p-4"
            style={{ background: '#12161e', border: '1px solid #1e2838' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{
                  width: 48, height: 48,
                  background: pl.status === 'active' ? 'rgba(14,165,233,0.15)' : pl.status === 'syncing' ? 'rgba(251,191,36,0.15)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${pl.status === 'active' ? 'rgba(14,165,233,0.25)' : pl.status === 'syncing' ? 'rgba(251,191,36,0.25)' : 'rgba(239,68,68,0.25)'}`,
                }}
              >
                {pl.status === 'active' && <Wifi size={20} style={{ color: '#0ea5e9' }} />}
                {pl.status === 'syncing' && <Loader size={20} style={{ color: '#f59e0b' }} />}
                {pl.status === 'error' && <WifiOff size={20} style={{ color: '#ef4444' }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold truncate" style={{ color: '#f1f5f9' }}>{pl.name}</span>
                  {pl.status === 'active' && <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>Active</span>}
                  {pl.status === 'syncing' && <span className="text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>Syncing</span>}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs" style={{ color: '#64748b' }}>{pl.channelCount.toLocaleString()} channels</span>
                  <span style={{ color: '#334155' }}>·</span>
                  <span className="text-xs" style={{ color: '#64748b' }}>{pl.lastSync}</span>
                  <span style={{ color: '#334155' }}>·</span>
                  <span className="text-xs font-medium uppercase" style={{ color: '#475569' }}>{pl.type}</span>
                </div>
              </div>
              <ChevronRight size={16} style={{ color: '#334155', flexShrink: 0 }} />
            </div>
          </button>
        ))}

        <div className="flex gap-2 mt-1">
          <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold"
            style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', color: '#0ea5e9' }}>
            <RefreshCw size={16} /> Refresh All
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold"
            style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', color: '#0ea5e9' }}>
            <Plus size={16} /> Add Playlist
          </button>
        </div>

        <div className="rounded-2xl p-4 mt-1" style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)' }}>
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} style={{ color: '#0ea5e9', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>Manage via Portal</p>
              <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Add and manage playlists at <span style={{ color: '#0ea5e9' }}>my.maxxplayer.com</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
