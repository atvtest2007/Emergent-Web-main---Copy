import { useState, useEffect, useMemo } from 'react';
import { Play, Star, Loader2, Tv } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TVSideNav from './TVSideNav';
import { Content } from '@/lib/api';

export default function TVLiveTVScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cat, setCat] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const [c, all] = await Promise.all([
          Content.categories("live").catch(() => []),
          Content.streams("live").catch(() => []),
        ]);
        setCategories(c || []);
        setChannels(all || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = channels;
    if (cat !== "all") list = list.filter((c) => c.category_id === cat);
    return list;
  }, [channels, cat]);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#030608' }}>
        <Loader2 className="w-10 h-10 animate-spin text-brand" />
      </div>
    );
  }

  const selectedChannel = filtered.length > 0 ? filtered[0] : null;

  return (
    <div className="absolute inset-0 flex" style={{ background: '#030608' }}>
      <TVSideNav active="live-tv" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h1 className="text-xl font-black" style={{ color: '#f8fafc' }}>Live TV</h1>
            <p className="text-xs" style={{ color: '#475569' }}>
              <span style={{ color: '#22c55e' }}>● </span>{filtered.length} channels available
            </p>
          </div>
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <button tabIndex={0} onClick={() => setCat("all")}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: cat === "all" ? 'linear-gradient(135deg, var(--brand-primary), #B80710)' : '#1A1A1A',
                color: cat === "all" ? '#fff' : '#64748b',
                border: cat === "all" ? 'none' : '1px solid #2A2A2A',
              }}>
              All
            </button>
            {categories.map((c) => {
              const isSelected = cat === c.category_id;
              return (
                <button tabIndex={0} key={c.category_id}
                  onClick={() => setCat(c.category_id)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    background: isSelected ? 'linear-gradient(135deg, var(--brand-primary), #B80710)' : '#1A1A1A',
                    color: isSelected ? '#fff' : '#64748b',
                    border: isSelected ? 'none' : '1px solid #2A2A2A',
                  }}>
                  {c.category_name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Two-column layout: channel list + now playing preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Channel list */}
          <div className="flex flex-col overflow-y-auto px-4 py-3 gap-1.5" style={{ width: 420, scrollbarWidth: 'none', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
            {filtered.map((ch, idx) => (
              <button tabIndex={0} key={ch.stream_id}
                onClick={() => navigate(`/watch/live/${ch.stream_id}`)}
                className="flex items-center gap-3 p-2.5 rounded-xl w-full text-left focus:outline-none focus:ring-2 focus:ring-brand focus:bg-[#1A1A1A]"
                style={{
                  background: idx === 0 ? 'linear-gradient(135deg, rgba(229,9,20,0.15), rgba(229,9,20,0.05))' : '#1A1A1A',
                  border: `1px solid ${idx === 0 ? 'rgba(229,9,20,0.3)' : '#1a2030'}`,
                }}
              >
                <span className="flex-shrink-0 text-xs font-bold w-6 text-center" style={{ color: '#334155' }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center bg-black/40" style={{ width: 38, height: 38, border: '1px solid #2A2A2A' }}>
                  {ch.stream_icon ? (
                    <img src={ch.stream_icon} alt={ch.name || "Channel"} className="w-full h-full object-contain p-1" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <Tv size={16} className="text-zinc-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold truncate" style={{ color: idx === 0 ? '#e2e8f0' : '#94a3b8' }}>{ch.name || `Channel ${idx + 1}`}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Now Playing Preview */}
          {selectedChannel ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Preview image */}
              <div className="relative flex-shrink-0" style={{ height: 240, background: '#0a0a0a' }}>
                {selectedChannel.stream_icon ? (
                  <>
                    <img
                      src={selectedChannel.stream_icon}
                      alt={selectedChannel.name || "Channel"}
                      className="w-full h-full object-cover"
                      style={{ filter: 'blur(2px)', opacity: 0.3 }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <img
                      src={selectedChannel.stream_icon}
                      alt={selectedChannel.name || "Channel"}
                      className="absolute inset-0 w-full h-full object-contain p-4"
                      style={{ opacity: 0.9 }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Tv size={64} className="text-zinc-800" />
                  </div>
                )}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, #030608 100%)' }} />

                {/* Live badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(239,68,68,0.9)', backdropFilter: 'blur(8px)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span className="text-xs font-black text-white tracking-widest" style={{ fontSize: 10 }}>LIVE</span>
                </div>
              </div>

              {/* Channel info */}
              <div className="flex-1 px-5 py-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-lg font-black" style={{ color: '#f8fafc' }}>{selectedChannel.name || "Unnamed Channel"}</h2>
                  </div>
                </div>

                <button tabIndex={0} onClick={() => navigate(`/watch/live/${selectedChannel.stream_id}`)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm mt-4"
                  style={{ background: 'linear-gradient(135deg, var(--brand-primary), #B80710)', color: '#fff', boxShadow: '0 4px 16px rgba(229,9,20,0.4)', width: 'fit-content' }}
                >
                  <Play size={15} fill="white" /> Watch Live
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
              No channel selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
