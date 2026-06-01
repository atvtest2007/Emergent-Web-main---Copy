import { useState } from 'react';
import {
  ArrowLeft, Pause, Play, SkipBack, SkipForward,
  Volume2, VolumeX, Heart, Maximize2, Captions,
  Settings, X, Check, Sun, Zap, LayoutGrid, ChevronRight,
  Gauge, MonitorSpeaker
} from 'lucide-react';
import type { Screen } from '@/types';

interface Props { onNavigate: (s: Screen) => void; }

const audioTracks = ['English (Original)', 'Spanish', 'French', 'German', 'Arabic'];
const subtitles = ['Off', 'English', 'Spanish', 'French', 'Arabic', 'Portuguese'];
const qualities = ['Auto (4K)', '4K HDR', '1080p HD', '720p', '480p', '360p'];
const speeds = ['0.25x', '0.5x', '0.75x', '1.0x', '1.25x', '1.5x', '1.75x', '2.0x'];
const aspects = ['Default', 'Fill', '4:3', '16:9', '21:9', 'Zoom'];

type Panel = 'audio' | 'subs' | 'quality' | 'speed' | 'aspect' | 'more' | null;

function SliderRow({ icon, value, max = 100, color = '#fff' }: { icon: React.ReactNode; value: number; max?: number; color?: string }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2.5">
      <div style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>{icon}</div>
      <div className="relative flex-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
        <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
        <div className="absolute top-1/2 rounded-full"
          style={{ width: 12, height: 12, background: '#fff', left: `${pct}%`, transform: 'translate(-50%, -50%)', boxShadow: '0 2px 6px rgba(0,0,0,0.5)' }} />
      </div>
    </div>
  );
}

export default function PlayerScreen({ onNavigate }: Props) {
  const [panel, setPanel] = useState<Panel>(null);
  const [muted, setMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedAudio, setSelectedAudio] = useState(0);
  const [selectedSub, setSelectedSub] = useState(0);
  const [selectedQ, setSelectedQ] = useState(0);
  const [selectedSpeed, setSelectedSpeed] = useState(3);
  const [selectedAspect, setSelectedAspect] = useState(0);

  const togglePanel = (p: Panel) => setPanel(panel === p ? null : p);

  const panelConfig: Record<NonNullable<Panel>, { title: string; items: string[]; selected: number; onSelect: (i: number) => void }> = {
    audio: { title: 'Audio Track', items: audioTracks, selected: selectedAudio, onSelect: (i) => { setSelectedAudio(i); setPanel(null); } },
    subs: { title: 'Subtitles', items: subtitles, selected: selectedSub, onSelect: (i) => { setSelectedSub(i); setPanel(null); } },
    quality: { title: 'Video Quality', items: qualities, selected: selectedQ, onSelect: (i) => { setSelectedQ(i); setPanel(null); } },
    speed: { title: 'Playback Speed', items: speeds, selected: selectedSpeed, onSelect: (i) => { setSelectedSpeed(i); setPanel(null); } },
    aspect: { title: 'Aspect Ratio', items: aspects, selected: selectedAspect, onSelect: (i) => { setSelectedAspect(i); setPanel(null); } },
    more: { title: '', items: [], selected: -1, onSelect: () => {} },
  };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#000' }}>
      {/* Video area */}
      <div className="relative flex-1">
        <img
          src="https://images.pexels.com/photos/7234213/pexels-photo-7234213.jpeg?auto=compress&cs=tinysrgb&w=700&h=500&dpr=1"
          alt="Playing"
          className="w-full h-full object-cover"
          style={{ opacity: 0.65 }}
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 22%, transparent 52%, rgba(0,0,0,0.97) 100%)'
        }} />

        {/* ─── TOP BAR ─── */}
        <div className="absolute top-0 left-0 right-0 flex items-center gap-2.5 px-4 pt-14 pb-2">
          <button
            onClick={() => onNavigate('movie-detail')}
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 36, height: 36, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <ArrowLeft size={18} style={{ color: '#fff' }} />
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-white truncate">Dune: Part Two</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>2024 · Sci-Fi · {qualities[selectedQ]}</p>
          </div>

          {/* Top-right action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => togglePanel('quality')}
              className="px-2.5 py-1 rounded-lg text-xs font-black"
              style={{
                background: panel === 'quality' ? 'rgba(14,165,233,0.3)' : 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${panel === 'quality' ? 'rgba(14,165,233,0.6)' : 'rgba(255,255,255,0.12)'}`,
                color: '#0ea5e9',
              }}
            >
              {qualities[selectedQ].replace(' (4K)', '')}
            </button>
            <button
              onClick={() => togglePanel('subs')}
              className="flex items-center justify-center rounded-full"
              style={{ width: 32, height: 32, background: panel === 'subs' ? 'rgba(14,165,233,0.3)' : 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', border: `1px solid ${panel === 'subs' ? 'rgba(14,165,233,0.5)' : 'rgba(255,255,255,0.1)'}` }}
            >
              <Captions size={15} style={{ color: selectedSub !== 0 ? '#0ea5e9' : '#fff' }} />
            </button>
            <button
              onClick={() => togglePanel('audio')}
              className="flex items-center justify-center rounded-full"
              style={{ width: 32, height: 32, background: panel === 'audio' ? 'rgba(14,165,233,0.3)' : 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', border: `1px solid ${panel === 'audio' ? 'rgba(14,165,233,0.5)' : 'rgba(255,255,255,0.1)'}` }}
            >
              <MonitorSpeaker size={15} style={{ color: '#fff' }} />
            </button>
            <button
              onClick={() => togglePanel('more')}
              className="flex items-center justify-center rounded-full"
              style={{ width: 32, height: 32, background: panel === 'more' ? 'rgba(14,165,233,0.3)' : 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', border: `1px solid ${panel === 'more' ? 'rgba(14,165,233,0.5)' : 'rgba(255,255,255,0.1)'}` }}
            >
              <Settings size={15} style={{ color: '#fff' }} />
            </button>
          </div>
        </div>

        {/* ─── SIDE SLIDERS: Volume + Brightness ─── */}
        <div className="absolute right-4 flex flex-col gap-2" style={{ top: 120, bottom: 160 }}>
          {/* Brightness */}
          <div className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Sun size={13} style={{ color: 'rgba(255,255,255,0.5)' }} />
            <div className="relative flex flex-col-reverse" style={{ width: 4, height: 80 }}>
              <div className="w-full rounded-full" style={{ background: 'rgba(255,255,255,0.15)', position: 'absolute', inset: 0 }} />
              <div className="w-full rounded-full absolute bottom-0" style={{ height: '70%', background: 'linear-gradient(0deg, #f59e0b, #fbbf24)' }} />
              <div className="absolute rounded-full" style={{ width: 10, height: 10, background: '#fff', left: -3, bottom: '70%', transform: 'translateY(50%)' }} />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8, fontWeight: 700 }}>70%</span>
          </div>

          {/* Volume */}
          <div className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Volume2 size={13} style={{ color: 'rgba(255,255,255,0.5)' }} />
            <div className="relative flex flex-col-reverse" style={{ width: 4, height: 80 }}>
              <div className="w-full rounded-full" style={{ background: 'rgba(255,255,255,0.15)', position: 'absolute', inset: 0 }} />
              <div className="w-full rounded-full absolute bottom-0" style={{ height: '85%', background: 'linear-gradient(0deg, #0ea5e9, #38bdf8)' }} />
              <div className="absolute rounded-full" style={{ width: 10, height: 10, background: '#fff', left: -3, bottom: '85%', transform: 'translateY(50%)' }} />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8, fontWeight: 700 }}>85%</span>
          </div>
        </div>

        {/* ─── CENTER TRANSPORT ─── */}
        <div className="absolute inset-0 flex items-center justify-center gap-7" style={{ paddingRight: 48 }}>
          <button className="flex items-center justify-center rounded-full"
            style={{ width: 48, height: 48, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <SkipBack size={20} style={{ color: '#fff' }} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center justify-center rounded-full"
            style={{ width: 66, height: 66, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 0 0 6px rgba(14,165,233,0.15), 0 8px 28px rgba(14,165,233,0.55)' }}>
            {isPlaying
              ? <Pause size={24} fill="white" style={{ color: 'white' }} />
              : <Play size={24} fill="white" style={{ color: 'white', marginLeft: 3 }} />}
          </button>
          <button className="flex items-center justify-center rounded-full"
            style={{ width: 48, height: 48, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <SkipForward size={20} style={{ color: '#fff' }} />
          </button>
        </div>

        {/* ─── BOTTOM CONTROLS ─── */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          {/* Seek bar */}
          <div className="mb-3">
            <div className="relative h-1.5 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.12)' }}>
              {/* Buffered */}
              <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: '60%', background: 'rgba(255,255,255,0.18)' }} />
              {/* Played */}
              <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: '38%', background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)' }}>
                <div className="absolute right-0 top-1/2 rounded-full"
                  style={{ width: 14, height: 14, background: '#fff', transform: 'translate(50%, -50%)', boxShadow: '0 0 10px rgba(14,165,233,0.8)' }} />
              </div>
              {/* Chapter dots */}
              {[18, 32, 47, 61, 75].map((p) => (
                <div key={p} className="absolute top-1/2 rounded-full pointer-events-none"
                  style={{ width: 4, height: 4, left: `${p}%`, transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.4)' }} />
              ))}
            </div>
            <div className="flex justify-between">
              <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>1:03:24</span>
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>−1:42:36</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>2:46:00</span>
            </div>
          </div>

          {/* Row 1: volume + fav + layout */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button onClick={() => setMuted(!muted)}>
                {muted
                  ? <VolumeX size={19} style={{ color: 'rgba(255,255,255,0.45)' }} />
                  : <Volume2 size={19} style={{ color: '#fff' }} />}
              </button>
              {/* Inline volume bar */}
              <div className="relative h-1 rounded-full" style={{ width: 56, background: 'rgba(255,255,255,0.15)' }}>
                <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: muted ? '0%' : '75%', background: '#fff' }} />
              </div>
              <button>
                <Heart size={18} fill="#ef4444" style={{ color: '#ef4444' }} />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Aspect */}
              <button
                onClick={() => togglePanel('aspect')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{ background: panel === 'aspect' ? 'rgba(14,165,233,0.2)' : 'rgba(255,255,255,0.1)', color: panel === 'aspect' ? '#0ea5e9' : 'rgba(255,255,255,0.7)' }}>
                {aspects[selectedAspect]}
              </button>
              {/* Speed */}
              <button
                onClick={() => togglePanel('speed')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
                style={{ background: panel === 'speed' ? 'rgba(14,165,233,0.2)' : 'rgba(255,255,255,0.1)', color: panel === 'speed' ? '#0ea5e9' : 'rgba(255,255,255,0.7)' }}>
                <Gauge size={11} />
                {speeds[selectedSpeed]}
              </button>
              <button>
                <LayoutGrid size={17} style={{ color: 'rgba(255,255,255,0.6)' }} />
              </button>
              <button>
                <Maximize2 size={17} style={{ color: 'rgba(255,255,255,0.6)' }} />
              </button>
            </div>
          </div>
        </div>

        {/* ─── SLIDE-UP PANELS ─── */}
        {panel && panel !== 'more' && (
          <div className="absolute inset-0 flex items-end"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={() => setPanel(null)}>
            <div className="w-full rounded-t-3xl"
              style={{ background: '#0d1117', border: '1px solid #1e2838', maxHeight: '60%' }}
              onClick={(e) => e.stopPropagation()}>

              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: '#1e2838' }} />
              </div>

              <div className="flex items-center justify-between px-5 py-2.5">
                <h3 className="text-base font-black" style={{ color: '#f8fafc' }}>
                  {panelConfig[panel].title}
                </h3>
                <button onClick={() => setPanel(null)} className="flex items-center justify-center rounded-full"
                  style={{ width: 28, height: 28, background: '#1e2838' }}>
                  <X size={13} style={{ color: '#64748b' }} />
                </button>
              </div>

              <div className="overflow-y-auto px-4 pb-5 flex flex-col gap-1.5" style={{ maxHeight: 240 }}>
                {panelConfig[panel].items.map((item, i) => {
                  const isSelected = panelConfig[panel].selected === i;
                  return (
                    <button key={item} onClick={() => panelConfig[panel].onSelect(i)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ background: isSelected ? 'rgba(14,165,233,0.12)' : '#12161e', border: `1px solid ${isSelected ? 'rgba(14,165,233,0.3)' : '#1a2030'}` }}>
                      <div className="flex items-center gap-3">
                        {panel === 'speed' && (
                          <div className="flex items-center justify-center rounded-lg"
                            style={{ width: 28, height: 28, background: isSelected ? 'rgba(14,165,233,0.2)' : 'rgba(255,255,255,0.05)' }}>
                            <Zap size={13} style={{ color: isSelected ? '#0ea5e9' : '#475569' }} />
                          </div>
                        )}
                        {panel === 'aspect' && (
                          <div className="flex items-center justify-center rounded-lg"
                            style={{ width: 28, height: 28, background: isSelected ? 'rgba(14,165,233,0.2)' : 'rgba(255,255,255,0.05)' }}>
                            <Maximize2 size={13} style={{ color: isSelected ? '#0ea5e9' : '#475569' }} />
                          </div>
                        )}
                        <span className="text-sm font-semibold" style={{ color: isSelected ? '#38bdf8' : '#94a3b8' }}>{item}</span>
                        {panel === 'speed' && item === '1.0x' && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: 9 }}>Normal</span>
                        )}
                      </div>
                      {isSelected && (
                        <div className="flex items-center justify-center rounded-full" style={{ width: 22, height: 22, background: '#0ea5e9' }}>
                          <Check size={11} style={{ color: '#fff' }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ─── MORE / SETTINGS PANEL ─── */}
        {panel === 'more' && (
          <div className="absolute inset-0 flex items-end"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={() => setPanel(null)}>
            <div className="w-full rounded-t-3xl"
              style={{ background: '#0d1117', border: '1px solid #1e2838' }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full" style={{ background: '#1e2838' }} />
              </div>
              <div className="flex items-center justify-between px-5 py-2.5">
                <h3 className="text-base font-black" style={{ color: '#f8fafc' }}>Player Settings</h3>
                <button onClick={() => setPanel(null)} className="flex items-center justify-center rounded-full"
                  style={{ width: 28, height: 28, background: '#1e2838' }}>
                  <X size={13} style={{ color: '#64748b' }} />
                </button>
              </div>
              <div className="px-4 pb-5 flex flex-col gap-1.5">
                {[
                  { label: 'Video Quality', value: qualities[selectedQ], panel: 'quality' as Panel, icon: <LayoutGrid size={15} /> },
                  { label: 'Audio Track', value: audioTracks[selectedAudio], panel: 'audio' as Panel, icon: <MonitorSpeaker size={15} /> },
                  { label: 'Subtitles', value: subtitles[selectedSub], panel: 'subs' as Panel, icon: <Captions size={15} /> },
                  { label: 'Playback Speed', value: speeds[selectedSpeed], panel: 'speed' as Panel, icon: <Gauge size={15} /> },
                  { label: 'Aspect Ratio', value: aspects[selectedAspect], panel: 'aspect' as Panel, icon: <Maximize2 size={15} /> },
                ].map(({ label, value, panel: targetPanel, icon }) => (
                  <button key={label} onClick={() => setPanel(targetPanel)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: '#12161e', border: '1px solid #1a2030' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center rounded-lg"
                        style={{ width: 30, height: 30, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.15)' }}>
                        <span style={{ color: '#0ea5e9' }}>{icon}</span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: '#94a3b8' }}>{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium" style={{ color: '#475569' }}>{value}</span>
                      <ChevronRight size={14} style={{ color: '#334155' }} />
                    </div>
                  </button>
                ))}

                {/* Volume & Brightness sliders */}
                <div className="mt-1 p-4 rounded-2xl flex flex-col gap-3" style={{ background: '#12161e', border: '1px solid #1a2030' }}>
                  <p className="text-xs font-black uppercase tracking-wider" style={{ color: '#334155', fontSize: 9 }}>Quick Controls</p>
                  <SliderRow icon={<Volume2 size={14} />} value={muted ? 0 : 85} color="linear-gradient(90deg, #0ea5e9, #38bdf8)" />
                  <SliderRow icon={<Sun size={14} />} value={70} color="linear-gradient(90deg, #f59e0b, #fbbf24)" />
                </div>

                {/* Player engine */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl mt-1" style={{ background: '#12161e', border: '1px solid #1a2030' }}>
                  <span className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Player Engine</span>
                  <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #1e2838' }}>
                    {['ExoPlayer', 'VLC'].map((eng, ei) => (
                      <div key={eng} className="px-3 py-1 text-xs font-bold"
                        style={{ background: ei === 0 ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#0d1117', color: ei === 0 ? '#fff' : '#475569', fontSize: 10 }}>
                        {eng}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status strip */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2"
        style={{ background: '#080c14', borderTop: '1px solid #1e2838' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.7)' }} />
          <span className="text-xs font-semibold" style={{ color: '#475569' }}>
            ExoPlayer · {qualities[selectedQ]} · {audioTracks[selectedAudio].split(' ')[0]} · {speeds[selectedSpeed]}
          </span>
        </div>
        <button className="text-xs font-bold px-2.5 py-1 rounded-lg"
          style={{ background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.2)' }}>
          VLC
        </button>
      </div>
    </div>
  );
}
