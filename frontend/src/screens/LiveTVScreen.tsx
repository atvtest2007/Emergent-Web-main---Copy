import { useState, useEffect, useMemo } from 'react';
import { Search, Grid3X3, List, Star, Play, Tv, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { Content } from '@/lib/api';

export default function LiveTVScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');

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
    if (q.trim()) {
      const ql = q.toLowerCase();
      list = list.filter((c) => (c.name || "").toLowerCase().includes(ql));
    }
    return list;
  }, [channels, cat, q]);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#030608' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#E50914]" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#030608' }}>
      {/* Header */}
      <div className="flex-shrink-0 pt-14 px-5 pb-3" style={{ background: 'linear-gradient(180deg, #141414 0%, #030608 100%)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black" style={{ color: '#f8fafc' }}>Live TV</h1>
            <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
              <span style={{ color: '#22c55e' }}>● </span>
              {channels.length} channels
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-2">
              <Search size={15} style={{ color: '#94a3b8' }} />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-white text-sm w-24 py-2 px-2"
              />
            </div>
            <button className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 38, height: 38, background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.3)' }}>
              <Grid3X3 size={17} style={{ color: '#E50914' }} />
            </button>
          </div>
        </div>
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setCat("all")}
            className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold"
            style={{
              background: cat === "all" ? 'linear-gradient(135deg, #E50914, #B80710)' : '#1A1A1A',
              color: cat === "all" ? '#fff' : '#64748b',
              border: cat === "all" ? 'none' : '1px solid #2A2A2A',
              boxShadow: cat === "all" ? '0 4px 12px rgba(229,9,20,0.3)' : 'none',
            }}
          >
            All
          </button>
          {categories.map((c) => {
            const isSelected = cat === c.category_id;
            return (
              <button
                key={c.category_id}
                onClick={() => setCat(c.category_id)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold"
                style={{
                  background: isSelected ? 'linear-gradient(135deg, #E50914, #B80710)' : '#1A1A1A',
                  color: isSelected ? '#fff' : '#64748b',
                  border: isSelected ? 'none' : '1px solid #2A2A2A',
                  boxShadow: isSelected ? '0 4px 12px rgba(229,9,20,0.3)' : 'none',
                }}
              >
                {c.category_name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort + count row */}
      <div className="flex items-center justify-between px-5 py-2.5">
        <span className="text-xs font-medium" style={{ color: '#475569' }}>{filtered.length} channels</span>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#64748b' }}>
            <List size={14} /> A–Z
          </button>
        </div>
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto pb-20 px-5 flex flex-col gap-2" style={{ scrollbarWidth: 'none' }}>
        {filtered.map((ch, idx) => (
          <button
            key={ch.stream_id}
            onClick={() => navigate(`/watch/live/${ch.stream_id}`)}
            className="group w-full text-left rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform focus:outline-none focus:ring-2 focus:ring-[#E50914]"
            style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
          >
            <div className="flex items-center gap-3 p-3 pointer-events-none">
              {/* Ch number */}
              <div className="flex-shrink-0 flex items-center justify-center rounded-xl font-bold text-xs"
                style={{ width: 28, height: 28, background: '#0d1117', color: '#475569' }}>
                {String(idx + 1).padStart(2, '0')}
              </div>

              {/* Logo */}
              <div className="flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center bg-black/40" style={{ width: 48, height: 48, border: '1px solid #2A2A2A' }}>
                {ch.stream_icon ? (
                  <img src={ch.stream_icon} alt={ch.name || "Channel"} className="w-full h-full object-contain p-1" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <Tv size={20} className="text-zinc-600" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold truncate" style={{ color: '#f1f5f9' }}>{ch.name || `Channel ${idx + 1}`}</span>
                  <span className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded-md font-semibold"
                    style={{ background: 'rgba(229,9,20,0.1)', color: '#E50914', fontSize: 9, letterSpacing: '0.03em' }}>
                    {(ch.category_name || ch.category_id || "LIVE").toUpperCase()}
                  </span>
                </div>
                {/* NOW bar */}
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#22c55e', boxShadow: '0 0 5px rgba(34,197,94,0.7)' }} />
                  <p className="text-xs truncate font-medium" style={{ color: '#94a3b8' }}>{ch.currentProgram || "Now playing..."}</p>
                </div>
                {/* NEXT bar */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Tv size={9} style={{ color: '#475569', flexShrink: 0 }} />
                  <p className="text-xs truncate" style={{ color: '#475569' }}>Next: {ch.nextProgram || "Coming up..."}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className="flex items-center justify-center rounded-full"
                  style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #E50914, #B80710)', boxShadow: '0 4px 12px rgba(229,9,20,0.35)' }}>
                  <Play size={13} fill="white" style={{ color: 'white', marginLeft: 1 }} />
                </div>
              </div>
            </div>

            {/* Progress bar for currently playing (Fallback to first item if EPG missing) */}
            {idx === 0 && (
              <div className="px-3 pb-2.5 pointer-events-none">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: '#475569' }}>Now</span>
                  <span className="text-xs font-semibold" style={{ color: '#E50914' }}>LIVE</span>
                  <span className="text-xs" style={{ color: '#475569' }}>Next</span>
                </div>
                <div className="h-1 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full relative" style={{ width: '42%', background: 'linear-gradient(90deg, #E50914, #B80710)' }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full" style={{ width: 8, height: 8, background: '#fff', boxShadow: '0 0 6px rgba(229,9,20,0.8)' }} />
                  </div>
                </div>
              </div>
            )}
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-xs text-zinc-500">
            No channels found.
          </div>
        )}
      </div>
      <BottomNav active="live-tv" />
    </div>
  );
}
