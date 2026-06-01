import { useState } from 'react';
import {
  ArrowLeft, Pause, Play, SkipBack, SkipForward,
  Volume2, VolumeX, Heart, Maximize2, Captions,
  Settings, X, Check, Sun, Zap, LayoutGrid,
  Gauge, MonitorSpeaker
} from 'lucide-react';
import type { Screen } from '@/types';

interface Props { onNavigate: (s: Screen) => void; }

const audioTracks = ['English (Original)', 'Spanish', 'French', 'German', 'Arabic'];
const subtitles = ['Off', 'English', 'Spanish', 'French', 'Arabic', 'Portuguese'];
const qualities = ['Auto (4K)', '4K HDR', '1080p HD', '720p', '480p', '360p'];
const speeds = ['0.25x', '0.5x', '0.75x', '1.0x', '1.25x', '1.5x', '1.75x', '2.0x'];
const aspects = ['Default', 'Fill', '4:3', '16:9', '21:9', 'Zoom'];

type Panel = 'audio' | 'subs' | 'quality' | 'speed' | 'aspect' | null;

const panelIcons: Record<NonNullable<Panel>, React.ReactNode> = {
  audio: <MonitorSpeaker size={15} />,
  subs: <Captions size={15} />,
  quality: <LayoutGrid size={15} />,
  speed: <Gauge size={15} />,
  aspect: <Maximize2 size={15} />,
};

const panelLabels: Record<NonNullable<Panel>, string> = {
  audio: 'Audio Track',
  subs: 'Subtitles',
  quality: 'Video Quality',
  speed: 'Playback Speed',
  aspect: 'Aspect Ratio',
};

function SliderBar({ value, color, width = 90 }: { value: number; color: string; width?: number }) {
  return (
    <div className="relative h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', width }}>
      <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      <div className="absolute top-1/2 rounded-full"
        style={{ width: 10, height: 10, background: '#fff', left: `${value}%`, transform: 'translate(-50%, -50%)', boxShadow: '0 1px 4px rgba(0,0,0,0.5)' }} />
    </div>
  );
}

export default function TVPlayerScreen({ onNavigate }: Props) {
  const [panel, setPanel] = useState<Panel>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState(0);
  const [selectedSub, setSelectedSub] = useState(0);
  const [selectedQ, setSelectedQ] = useState(0);
  const [selectedSpeed, setSelectedSpeed] = useState(3);
  const [selectedAspect, setSelectedAspect] = useState(0);

  const togglePanel = (p: Panel) => setPanel(panel === p ? null : p);

  const allItems: Record<NonNullable<Panel>, string[]> = {
    audio: audioTracks, subs: subtitles, quality: qualities, speed: speeds, aspect: aspects,
  };
  const allSelected: Record<NonNullable<Panel>, number> = {
    audio: selectedAudio, subs: selectedSub, quality: selectedQ, speed: selectedSpeed, aspect: selectedAspect,
  };
  const allSetters: Record<NonNullable<Panel>, (i: number) => void> = {
    audio: (i) => { setSelectedAudio(i); setPanel(null); },
    subs: (i) => { setSelectedSub(i); setPanel(null); },
    quality: (i) => { setSelectedQ(i); setPanel(null); },
    speed: (i) => { setSelectedSpeed(i); setPanel(null); },
    aspect: (i) => { setSelectedAspect(i); setPanel(null); },
  };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#000' }}>
      {/* Video */}
      <div className="relative flex-1">
        <img
          src="https://images.pexels.com/photos/7234213/pexels-photo-7234213.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&dpr=1"
          alt="Playing"
          className="w-full h-full object-cover"
          style={{ opacity: 0.6 }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 22%, transparent 50%, rgba(0,0,0,0.98) 100%)' }} />

        {/* ─── TOP BAR ─── */}
        <div className="absolute top-0 left-0 right-0 flex items-center gap-4 px-6 pt-4 pb-2">
          <button
            onClick={() => onNavigate('movie-detail')}
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 36, height: 36, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <ArrowLeft size={17} style={{ color: '#fff' }} />
          </button>
          <div className="flex-1">
            <p className="text-base font-black text-white">Dune: Part Two</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>2024 · Sci-Fi · {qualities[selectedQ]} · Dolby Atmos · {speeds[selectedSpeed]}</p>
          </div>
          {/* Top-right buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => togglePanel('quality')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black"
              style={{
                background: panel === 'quality' ? 'rgba(14,165,233,0.25)' : 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${panel === 'quality' ? 'rgba(14,165,233,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: '#0ea5e9',
              }}>
              {qualities[selectedQ].replace(' (4K)', '')}
            </button>
            {([
              { key: 'subs' as Panel, icon: <Captions size={15} />, active: selectedSub !== 0 },
              { key: 'audio' as Panel, icon: <MonitorSpeaker size={15} />, active: false },
              { key: 'speed' as Panel, icon: <Gauge size={15} />, active: selectedSpeed !== 3 },
              { key: 'aspect' as Panel, icon: <Maximize2 size={15} />, active: selectedAspect !== 0 },
            ]).map(({ key, icon, active }) => (
              <button key={key} onClick={() => togglePanel(key)}
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 32, height: 32,
                  background: panel === key ? 'rgba(14,165,233,0.25)' : 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${panel === key ? 'rgba(14,165,233,0.5)' : 'rgba(255,255,255,0.1)'}`,
                }}>
                <span style={{ color: active || panel === key ? '#0ea5e9' : '#fff' }}>{icon}</span>
              </button>
            ))}
            <button
              className="flex items-center justify-center rounded-full"
              style={{ width: 32, height: 32, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Settings size={15} style={{ color: '#fff' }} />
            </button>
          </div>
        </div>

        {/* ─── CENTER CONTROLS ─── */}
        <div className="absolute inset-0 flex items-center justify-center gap-10">
          <button className="flex items-center justify-center rounded-full"
            style={{ width: 54, height: 54, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <SkipBack size={24} style={{ color: '#fff' }} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center justify-center rounded-full"
            style={{ width: 76, height: 76, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 0 0 8px rgba(14,165,233,0.12), 0 8px 32px rgba(14,165,233,0.5)' }}>
            {isPlaying
              ? <Pause size={30} fill="white" style={{ color: 'white' }} />
              : <Play size={30} fill="white" style={{ color: 'white', marginLeft: 4 }} />}
          </button>
          <button className="flex items-center justify-center rounded-full"
            style={{ width: 54, height: 54, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <SkipForward size={24} style={{ color: '#fff' }} />
          </button>
        </div>

        {/* ─── BOTTOM CONTROLS ─── */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-4">
          {/* Seek bar */}
          <div className="mb-3">
            <div className="relative h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: '58%', background: 'rgba(255,255,255,0.18)' }} />
              <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: '38%', background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)' }}>
                <div className="absolute right-0 top-1/2 rounded-full"
                  style={{ width: 16, height: 16, background: '#fff', transform: 'translate(50%, -50%)', boxShadow: '0 0 12px rgba(14,165,233,0.9)' }} />
              </div>
              {/* Chapter markers */}
              {[20, 35, 50, 65, 80].map((p) => (
                <div key={p} className="absolute top-1/2 rounded-full pointer-events-none"
                  style={{ width: 5, height: 5, left: `${p}%`, transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.4)' }} />
              ))}
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>1:03:24</span>
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>−1:42:36</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>2:46:00</span>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            {/* Left: mute + volume + brightness + fav */}
            <div className="flex items-center gap-3">
              <button onClick={() => setMuted(!muted)}>
                {muted
                  ? <VolumeX size={20} style={{ color: 'rgba(255,255,255,0.45)' }} />
                  : <Volume2 size={20} style={{ color: '#fff' }} />}
              </button>
              <SliderBar value={muted ? 0 : 75} color="linear-gradient(90deg, #0ea5e9, #38bdf8)" width={80} />
              <Sun size={17} style={{ color: 'rgba(255,255,255,0.5)' }} />
              <SliderBar value={70} color="linear-gradient(90deg, #f59e0b, #fbbf24)" width={70} />
              <button>
                <Heart size={18} fill="#ef4444" style={{ color: '#ef4444' }} />
              </button>
            </div>

            {/* Right: aspect + speed + layout + fullscreen */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => togglePanel('aspect')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{
                  background: panel === 'aspect' ? 'rgba(14,165,233,0.2)' : 'rgba(255,255,255,0.1)',
                  color: panel === 'aspect' ? '#0ea5e9' : 'rgba(255,255,255,0.7)',
                }}>
                {aspects[selectedAspect]}
              </button>
              <button
                onClick={() => togglePanel('speed')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{
                  background: panel === 'speed' ? 'rgba(14,165,233,0.2)' : 'rgba(255,255,255,0.1)',
                  color: panel === 'speed' ? '#0ea5e9' : 'rgba(255,255,255,0.7)',
                }}>
                <Zap size={11} /> {speeds[selectedSpeed]}
              </button>
              <button style={{ color: 'rgba(255,255,255,0.6)' }}>
                <LayoutGrid size={17} />
              </button>
              <button style={{ color: 'rgba(255,255,255,0.6)' }}>
                <Maximize2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ─── SIDE DRAWER PANEL ─── */}
        {panel && (
          <div className="absolute inset-0 flex items-stretch"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={() => setPanel(null)}>
            <div className="ml-auto flex flex-col"
              style={{ width: 320, background: '#0a0e17', borderLeft: '1px solid #1e2838' }}
              onClick={(e) => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #1e2838' }}>
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center rounded-lg"
                    style={{ width: 30, height: 30, background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.25)' }}>
                    <span style={{ color: '#0ea5e9' }}>{panelIcons[panel]}</span>
                  </div>
                  <h3 className="text-base font-black" style={{ color: '#f8fafc' }}>{panelLabels[panel]}</h3>
                </div>
                <button onClick={() => setPanel(null)} className="flex items-center justify-center rounded-full"
                  style={{ width: 28, height: 28, background: '#1e2838' }}>
                  <X size={13} style={{ color: '#64748b' }} />
                </button>
              </div>

              {/* Tab switcher */}
              <div className="flex gap-1 px-4 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none', borderBottom: '1px solid #1a2030' }}>
                {(['quality', 'audio', 'subs', 'speed', 'aspect'] as NonNullable<Panel>[]).map((p) => (
                  <button key={p} onClick={() => setPanel(p)}
                    className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                    style={{
                      background: panel === p ? 'rgba(14,165,233,0.2)' : '#12161e',
                      color: panel === p ? '#0ea5e9' : '#475569',
                      border: `1px solid ${panel === p ? 'rgba(14,165,233,0.35)' : '#1e2838'}`,
                      fontSize: 10, fontWeight: 700,
                    }}>
                    <span style={{ color: panel === p ? '#0ea5e9' : '#334155' }}>{panelIcons[p]}</span>
                    {panelLabels[p].split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Items list */}
              <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1.5" style={{ scrollbarWidth: 'none' }}>
                {allItems[panel].map((item, i) => {
                  const isSelected = allSelected[panel] === i;
                  return (
                    <button key={item} onClick={() => allSetters[panel](i)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ background: isSelected ? 'rgba(14,165,233,0.12)' : '#12161e', border: `1px solid ${isSelected ? 'rgba(14,165,233,0.3)' : '#1a2030'}` }}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-semibold" style={{ color: isSelected ? '#38bdf8' : '#94a3b8' }}>{item}</span>
                        {panel === 'quality' && item.includes('4K') && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-black" style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8', fontSize: 8 }}>HDR</span>
                        )}
                        {panel === 'quality' && item.includes('1080') && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-black" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: 8 }}>HD</span>
                        )}
                        {panel === 'speed' && item === '1.0x' && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: 9 }}>Normal</span>
                        )}
                        {panel === 'subs' && item === 'Off' && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontSize: 9 }}>Disabled</span>
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

              {/* Status footer */}
              <div className="px-4 py-3" style={{ borderTop: '1px solid #1e2838' }}>
                <div className="flex flex-col gap-2 p-3 rounded-xl" style={{ background: '#12161e' }}>
                  <p className="text-xs font-black uppercase" style={{ color: '#334155', letterSpacing: '0.08em', fontSize: 9 }}>Now Playing</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { label: qualities[selectedQ], color: '#0ea5e9' },
                      { label: audioTracks[selectedAudio].split(' ')[0], color: '#22c55e' },
                      { label: speeds[selectedSpeed], color: '#f59e0b' },
                      { label: aspects[selectedAspect], color: '#64748b' },
                    ].map(({ label, color }) => (
                      <span key={label} className="text-xs px-2 py-0.5 rounded-lg font-bold"
                        style={{ background: `${color}15`, color, border: `1px solid ${color}25`, fontSize: 10 }}>
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status strip */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-2"
        style={{ background: '#080c14', borderTop: '1px solid #1e2838' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.7)' }} />
          <span className="text-xs font-semibold" style={{ color: '#64748b' }}>
            ExoPlayer · {qualities[selectedQ]} · {audioTracks[selectedAudio].split(' ')[0]} · Dolby Atmos · {speeds[selectedSpeed]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {([
            { key: 'quality' as Panel, label: qualities[selectedQ].replace(' (4K)', '') },
            { key: 'speed' as Panel, label: speeds[selectedSpeed] },
            { key: 'aspect' as Panel, label: aspects[selectedAspect] },
          ]).map(({ key, label }) => (
            <button key={key} onClick={() => togglePanel(key)}
              className="text-xs font-bold px-2.5 py-1 rounded-lg"
              style={{ background: panel === key ? 'rgba(14,165,233,0.2)' : 'rgba(14,165,233,0.08)', color: '#0ea5e9', border: `1px solid ${panel === key ? 'rgba(14,165,233,0.4)' : 'rgba(14,165,233,0.15)'}` }}>
              {label}
            </button>
          ))}
          <button className="text-xs font-bold px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#475569', border: '1px solid #1e2838' }}>
            Switch to VLC
          </button>
        </div>
      </div>
    </div>
  );
}
