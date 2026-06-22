import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Content } from "@/lib/api";
import { Loader2, Radio, Play } from "lucide-react";
import { Virtuoso } from "react-virtuoso";

const HOUR_WIDTH = 220; // px per hour
const HOURS_AHEAD = 8;
const HOURS_BEHIND = 1;

function startOfHour(d = new Date()) {
    const x = new Date(d);
    x.setMinutes(0, 0, 0);
    return x;
}


const EpgRow = React.memo(({ channel, startTime, totalHours, hours, now, nowOffset }) => {
    const [progs, setProgs] = useState([]);
    
    useEffect(() => {
        let active = true;
        Content.epg(channel.stream_id, 14).then(r => {
            if (active && r && r.epg_listings) {
                setProgs(r.epg_listings);
            }
        }).catch(() => {});
        return () => { active = false; };
    }, [channel.stream_id]);

    return (
        <div className="grid border-b border-white/5 hover:bg-white/[0.02] relative" style={{ gridTemplateColumns: `220px repeat(${totalHours}, ${HOUR_WIDTH}px)` }}>
            <Link to={`/watch/live/${channel.stream_id}`} className="p-3 flex items-center gap-3 border-r border-white/10 hover:bg-white/5 transition" data-testid={`epg-channel-${channel.stream_id}`}>
                <div className="w-10 h-10 rounded bg-black/30 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {channel.stream_icon ? <img src={channel.stream_icon} alt={channel.name} className="w-full h-full object-contain p-1" /> : <Radio className="w-5 h-5 text-zinc-500" />}
                </div>
                <span className="text-sm font-semibold line-clamp-2">{channel.name}</span>
            </Link>
            <div className="relative col-span-full" style={{ gridColumn: `2 / span ${totalHours}` }}>
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${totalHours}, ${HOUR_WIDTH}px)` }}>
                    {hours.map((_, i) => <div key={i} className="border-r border-white/[0.03] h-full" />)}
                </div>
                {nowOffset >= 0 && nowOffset <= HOUR_WIDTH * totalHours && (
                    <div className="absolute top-0 bottom-0 w-px bg-brand/30 z-0 pointer-events-none" style={{ left: `${nowOffset}px` }} />
                )}
                <div className="relative h-16 flex z-10">
                    {progs.map((p) => {
                        const ps = new Date(p.start);
                        const pe = new Date(p.end);
                        const left = ((ps - startTime) / (1000 * 60 * 60)) * HOUR_WIDTH;
                        const width = ((pe - ps) / (1000 * 60 * 60)) * HOUR_WIDTH - 2;
                        if (left + width < 0 || left > HOUR_WIDTH * totalHours) return null;
                        const isLive = now >= ps && now <= pe;
                        const clampedLeft = Math.max(0, left);
                        const clampedWidth = width - Math.max(0, -left);
                        return (
                            <button
                                key={p.id}
                                className={`epg-program absolute top-2 bottom-2 rounded border text-left px-2.5 py-1 overflow-hidden ${isLive ? "live" : "bg-white/[0.03] border-white/10"}`}
                                style={{ left: `${clampedLeft}px`, width: `${Math.max(80, clampedWidth)}px` }}
                                title={`${p.title}\n${p.description}`}
                                data-testid={`program-${p.id}`}
                            >
                                <div className="text-xs font-semibold line-clamp-1">{p.title}</div>
                                <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                                    {ps.getHours().toString().padStart(2, "0")}:{ps.getMinutes().toString().padStart(2, "0")} – {pe.getHours().toString().padStart(2, "0")}:{pe.getMinutes().toString().padStart(2, "0")}
                                </div>
                                {isLive && (
                                    <div className="absolute top-1 right-1 flex items-center gap-1">
                                        <Play className="w-3 h-3 fill-[var(--brand-primary)] text-brand" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
});

export default function EPG() {
    const [loading, setLoading] = useState(true);
    const [channels, setChannels] = useState([]);
        const startTime = useMemo(() => {
        const s = startOfHour();
        s.setHours(s.getHours() - HOURS_BEHIND);
        return s;
    }, []);
    const totalHours = HOURS_BEHIND + HOURS_AHEAD;
    const hours = useMemo(() => Array.from({ length: totalHours }, (_, i) => {
        const d = new Date(startTime);
        d.setHours(d.getHours() + i);
        return d;
    }), [startTime, totalHours]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const list = await Content.streams("live");
                setChannels(list || []);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const now = new Date();
    const nowOffset = ((now - startTime) / (1000 * 60 * 60)) * HOUR_WIDTH;

    return (
        <div className="px-6 lg:px-12 py-8 pt-12" data-testid="epg-page">
            <div className="mb-6">
                <div className="text-xs tracking-[0.32em] uppercase font-bold text-brand mb-2 flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5" /> Electronic Program Guide
                </div>
                <h1 className="font-display text-5xl font-black tracking-tighter">EPG Guide</h1>
                <p className="text-zinc-400 mt-2 max-w-xl">Scroll horizontally to see upcoming shows. Tap a program to learn more.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-brand" /></div>
            ) : channels.length === 0 ? (
                <div className="text-center py-20 text-zinc-400">No channels to show.</div>
            ) : (
                <div className="rounded-md border border-white/10 bg-[#0a0a0a] overflow-hidden">
                    <div className="overflow-x-auto thin-scroll">
                        <div style={{ minWidth: `${220 + HOUR_WIDTH * totalHours}px` }}>
                            {/* Time header */}
                            <div className="grid sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10" style={{ gridTemplateColumns: `220px repeat(${totalHours}, ${HOUR_WIDTH}px)` }}>
                                <div className="p-3 text-xs uppercase tracking-wider font-bold text-zinc-400 border-r border-white/10">Channel</div>
                                {hours.map((h) => (
                                    <div key={h.toISOString()} className="p-3 text-xs font-bold text-zinc-300 border-r border-white/5">
                                        {h.getHours().toString().padStart(2, "0")}:00
                                    </div>
                                ))}
                            </div>
                            {/* Rows */}
                            <div className="relative">
                                {/* Now line */}
                                {nowOffset >= 0 && nowOffset <= HOUR_WIDTH * totalHours && (
                                    <div
                                        className="absolute top-0 bottom-0 w-px bg-brand z-10 pointer-events-none"
                                        style={{ left: `${220 + nowOffset}px` }}
                                    >
                                        <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-brand" />
                                    </div>
                                )}
                                <Virtuoso
                                    useWindowScroll
                                    totalCount={channels.length}
                                    itemContent={(index) => {
                                        const c = channels[index];
                                        return <EpgRow key={c.stream_id} channel={c} startTime={startTime} totalHours={totalHours} hours={hours} now={now} nowOffset={nowOffset} />;
                                    }}
                                />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}
