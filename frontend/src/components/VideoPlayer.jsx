import React, { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import {
    Play, Pause, Volume2, VolumeX, Maximize, Minimize,
    Settings as SettingsIcon, PictureInPicture2, Rewind, FastForward,
    SkipBack, SkipForward, Subtitles, Cast, Sun, Loader2, Cpu, X,
} from "lucide-react";
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
    DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import PlayerSwitcher from "@/components/PlayerSwitcher";
import { localPref, ASPECT_OPTIONS } from "@/lib/store";
import { proxyUrl } from "@/lib/api";

function formatTime(s) {
    if (!Number.isFinite(s)) return "0:00";
    const sign = s < 0 ? "-" : "";
    s = Math.abs(Math.floor(s));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return sign + (h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`);
}

export default function VideoPlayer({
    src,
    title,
    poster,
    isLive = false,
    autoPlay = true,
    onProgress,
    onClose,
    initialPosition = 0,
}) {
    const containerRef = useRef(null);
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const vjsRef = useRef(null);
    const hideTimerRef = useRef(null);
    const proxyAttemptedRef = useRef(false);

    const [playerEngine, setPlayerEngine] = useState(localPref.get("PREFERRED_PLAYER", "hls"));
    const [showSwitcher, setShowSwitcher] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(localPref.get("LAST_VOLUME", 0.8));
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPiP, setIsPiP] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const [speed, setSpeed] = useState(1);
    const [aspect, setAspect] = useState(localPref.get("ASPECT", "fit-contain"));
    const [brightness, setBrightness] = useState(localPref.get("BRIGHTNESS", 1));
    const [audioTracks, setAudioTracks] = useState([]);
    const [textTracks, setTextTracks] = useState([]);
    const [selectedAudio, setSelectedAudio] = useState(0);
    const [selectedSub, setSelectedSub] = useState(-1);
    const [levels, setLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(-1);

    // -------- Setup playback engine
    const teardown = useCallback(() => {
        if (hlsRef.current) {
            try { hlsRef.current.destroy(); } catch {}
            hlsRef.current = null;
        }
        if (vjsRef.current) {
            try { vjsRef.current.dispose(); } catch {}
            vjsRef.current = null;
        }
    }, []);

    const setupEngine = useCallback((engineId, source) => {
        teardown();
        const video = videoRef.current;
        if (!video) return;
        setLoading(true);
        setErrorMsg(null);

        const isHls = /\.m3u8(\?|$)/i.test(source);
        let effectiveEngine = engineId;
        if (effectiveEngine === "auto") {
            effectiveEngine = isHls && Hls.isSupported() ? "hls" : "native";
        }

        if (effectiveEngine === "hls" && isHls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: isLive,
                backBufferLength: 60,
                maxBufferLength: 30,
            });
            hlsRef.current = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setLevels(hls.levels.map((l, i) => ({ id: i, height: l.height, bitrate: l.bitrate })));
                setLoading(false);
                if (initialPosition > 0 && !isLive) {
                    video.currentTime = initialPosition;
                }
                if (autoPlay) video.play().catch(() => {});
            });
            hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => setSelectedLevel(data.level));
            hls.on(Hls.Events.ERROR, (_e, data) => {
                if (data.fatal) {
                    // Try CORS proxy fallback once
                    if (!proxyAttemptedRef.current && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        proxyAttemptedRef.current = true;
                        setupEngine(effectiveEngine, proxyUrl(source));
                        return;
                    }
                    // Auto-fallback to native
                    if (effectiveEngine !== "native") {
                        setupEngine("native", source);
                    } else {
                        setErrorMsg(`Playback error: ${data.details || data.type}`);
                    }
                }
            });
        } else if (effectiveEngine === "videojs") {
            try {
                vjsRef.current = videojs(video, {
                    controls: false,
                    autoplay: autoPlay,
                    preload: "auto",
                    fluid: false,
                    liveui: isLive,
                });
                vjsRef.current.src({ src: source, type: isHls ? "application/x-mpegURL" : "video/mp4" });
                vjsRef.current.on("loadedmetadata", () => {
                    setLoading(false);
                    if (initialPosition > 0 && !isLive) video.currentTime = initialPosition;
                    if (autoPlay) video.play().catch(() => {});
                });
                vjsRef.current.on("error", () => {
                    setupEngine("hls", source);
                });
            } catch (e) {
                setupEngine("hls", source);
            }
        } else {
            // Native
            video.src = source;
            video.load();
            const onLoaded = () => {
                setLoading(false);
                if (initialPosition > 0 && !isLive) video.currentTime = initialPosition;
                if (autoPlay) video.play().catch(() => {});
            };
            video.addEventListener("loadedmetadata", onLoaded, { once: true });
            const onErr = () => {
                if (!proxyAttemptedRef.current) {
                    proxyAttemptedRef.current = true;
                    setupEngine(effectiveEngine, proxyUrl(source));
                    return;
                }
                setErrorMsg("This stream cannot be played by the browser. Try switching engines.");
                setLoading(false);
            };
            video.addEventListener("error", onErr, { once: true });
        }
    }, [autoPlay, initialPosition, isLive, teardown]);

    useEffect(() => {
        if (!src) return;
        proxyAttemptedRef.current = false;
        setupEngine(playerEngine, src);
        return () => teardown();
    }, [src, playerEngine, setupEngine, teardown]);

    // -------- Video event listeners
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onTime = () => {
            setCurrentTime(v.currentTime);
            if (v.buffered.length > 0) {
                setBuffered(v.buffered.end(v.buffered.length - 1));
            }
            if (onProgress) onProgress(v.currentTime, v.duration);
        };
        const onDur = () => setDuration(v.duration);
        const onVol = () => {
            setVolume(v.volume);
            setIsMuted(v.muted);
        };
        const onWaiting = () => setLoading(true);
        const onPlaying = () => setLoading(false);
        const onTracksChange = () => {
            const audios = [];
            if (v.audioTracks) {
                for (let i = 0; i < v.audioTracks.length; i++) audios.push({ id: i, label: v.audioTracks[i].label || `Track ${i + 1}`, lang: v.audioTracks[i].language });
            }
            setAudioTracks(audios);
            const texts = [];
            for (let i = 0; i < v.textTracks.length; i++) texts.push({ id: i, label: v.textTracks[i].label || `Sub ${i + 1}`, lang: v.textTracks[i].language });
            setTextTracks(texts);
        };
        v.addEventListener("play", onPlay);
        v.addEventListener("pause", onPause);
        v.addEventListener("timeupdate", onTime);
        v.addEventListener("durationchange", onDur);
        v.addEventListener("volumechange", onVol);
        v.addEventListener("waiting", onWaiting);
        v.addEventListener("playing", onPlaying);
        v.addEventListener("loadedmetadata", onTracksChange);
        v.textTracks.addEventListener("change", onTracksChange);
        return () => {
            v.removeEventListener("play", onPlay);
            v.removeEventListener("pause", onPause);
            v.removeEventListener("timeupdate", onTime);
            v.removeEventListener("durationchange", onDur);
            v.removeEventListener("volumechange", onVol);
            v.removeEventListener("waiting", onWaiting);
            v.removeEventListener("playing", onPlaying);
            v.removeEventListener("loadedmetadata", onTracksChange);
            v.textTracks.removeEventListener("change", onTracksChange);
        };
    }, [onProgress]);

    // -------- Auto-hide controls
    const resetHideTimer = useCallback(() => {
        setControlsVisible(true);
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
            if (isPlaying) setControlsVisible(false);
        }, 3500);
    }, [isPlaying]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const onMove = () => resetHideTimer();
        el.addEventListener("mousemove", onMove);
        el.addEventListener("touchstart", onMove);
        resetHideTimer();
        return () => {
            el.removeEventListener("mousemove", onMove);
            el.removeEventListener("touchstart", onMove);
            clearTimeout(hideTimerRef.current);
        };
    }, [resetHideTimer]);

    // -------- Volume side effects
    useEffect(() => {
        if (videoRef.current) videoRef.current.volume = volume;
        localPref.set("LAST_VOLUME", volume);
    }, [volume]);

    useEffect(() => {
        localPref.set("ASPECT", aspect);
    }, [aspect]);

    useEffect(() => {
        localPref.set("BRIGHTNESS", brightness);
    }, [brightness]);

    // -------- Fullscreen state
    useEffect(() => {
        const onFs = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", onFs);
        return () => document.removeEventListener("fullscreenchange", onFs);
    }, []);

    // -------- Keyboard shortcuts
    useEffect(() => {
        const onKey = (e) => {
            if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
            const v = videoRef.current;
            if (!v) return;
            switch (e.key.toLowerCase()) {
                case " ":
                case "k":
                    e.preventDefault();
                    v.paused ? v.play() : v.pause();
                    break;
                case "arrowright":
                    if (!isLive) v.currentTime = Math.min(v.duration, v.currentTime + 10);
                    break;
                case "arrowleft":
                    if (!isLive) v.currentTime = Math.max(0, v.currentTime - 10);
                    break;
                case "arrowup":
                    setVolume((x) => Math.min(1, +(x + 0.05).toFixed(2)));
                    break;
                case "arrowdown":
                    setVolume((x) => Math.max(0, +(x - 0.05).toFixed(2)));
                    break;
                case "m":
                    v.muted = !v.muted;
                    break;
                case "f":
                    toggleFs();
                    break;
                case "p":
                    togglePiP();
                    break;
                default:
                    break;
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isLive]);

    // -------- Controls
    const togglePlay = () => {
        const v = videoRef.current;
        if (!v) return;
        v.paused ? v.play() : v.pause();
    };

    const toggleMute = () => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = !v.muted;
    };

    const toggleFs = async () => {
        const el = containerRef.current;
        if (!el) return;
        if (!document.fullscreenElement) {
            await el.requestFullscreen?.();
        } else {
            await document.exitFullscreen?.();
        }
    };

    const togglePiP = async () => {
        const v = videoRef.current;
        if (!v) return;
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
                setIsPiP(false);
            } else if (document.pictureInPictureEnabled) {
                await v.requestPictureInPicture();
                setIsPiP(true);
            }
        } catch {}
    };

    const seek = (sec) => {
        const v = videoRef.current;
        if (!v || isLive) return;
        v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + sec));
    };

    const setLevel = (idx) => {
        setSelectedLevel(idx);
        if (hlsRef.current) hlsRef.current.currentLevel = idx;
    };

    const setSubtitle = (idx) => {
        const v = videoRef.current;
        if (!v) return;
        for (let i = 0; i < v.textTracks.length; i++) {
            v.textTracks[i].mode = i === idx ? "showing" : "hidden";
        }
        setSelectedSub(idx);
    };

    const setAudioTrack = (idx) => {
        const v = videoRef.current;
        if (!v || !v.audioTracks) return;
        for (let i = 0; i < v.audioTracks.length; i++) {
            v.audioTracks[i].enabled = i === idx;
        }
        setSelectedAudio(idx);
        if (hlsRef.current) hlsRef.current.audioTrack = idx;
    };

    const setPlaybackRate = (s) => {
        if (videoRef.current) videoRef.current.playbackRate = s;
        setSpeed(s);
    };

    const tryCast = async () => {
        try {
            const v = videoRef.current;
            if (v && v.remote && typeof v.remote.prompt === "function") {
                await v.remote.prompt();
                return;
            }
        } catch {}
        try {
            // eslint-disable-next-line no-alert
            alert("Casting is not available in this browser. Open in a Chromium-based browser with a Cast device on the network.");
        } catch {}
    };

    const onSeekBarChange = (e) => {
        const v = videoRef.current;
        if (!v || isLive) return;
        const t = Number(e.target.value);
        v.currentTime = t;
        setCurrentTime(t);
    };

    return (
        <div
            ref={containerRef}
            className={`player-container ${aspect} ${isFullscreen ? "h-screen" : ""} relative bg-black group select-none`}
            style={{ filter: `brightness(${brightness})` }}
            data-testid="video-player"
        >
            <video
                ref={videoRef}
                poster={poster}
                playsInline
                crossOrigin="anonymous"
                className="absolute inset-0 w-full h-full"
                onClick={togglePlay}
            />

            {/* Loading spinner */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                    <Loader2 className="w-12 h-12 animate-spin text-[#E50914]" />
                </div>
            )}

            {/* Error */}
            {errorMsg && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-6 text-center">
                    <div>
                        <div className="text-lg font-semibold mb-2">Playback Failed</div>
                        <div className="text-sm text-zinc-300 mb-4">{errorMsg}</div>
                        <button
                            data-testid="error-switch-player"
                            onClick={() => setShowSwitcher(true)}
                            className="px-4 py-2 rounded-md bg-[#E50914] hover:bg-[#F40612] text-white font-semibold"
                        >
                            Switch Player Engine
                        </button>
                    </div>
                </div>
            )}

            {/* Top bar */}
            <div className={`absolute top-0 left-0 right-0 z-20 p-4 lg:p-6 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        {onClose && (
                            <button
                                data-testid="player-close-btn"
                                onClick={onClose}
                                className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition shrink-0"
                                aria-label="Close player"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                        <div className="min-w-0">
                            <div className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-bold">
                                {isLive ? "Live Broadcast" : "Now Playing"}
                            </div>
                            <div className="font-display text-xl lg:text-2xl font-bold truncate">{title}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isLive && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#E50914]/15 border border-[#E50914]/30">
                                <div className="live-dot" />
                                <span className="text-xs font-bold tracking-wider">LIVE</span>
                            </div>
                        )}
                        <button
                            data-testid="player-switch-btn"
                            onClick={() => setShowSwitcher(true)}
                            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-md glass border border-white/10 hover:bg-white/10 transition text-xs"
                        >
                            <Cpu className="w-4 h-4" />
                            {playerEngine.toUpperCase()}
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom controls */}
            <div className={`absolute bottom-0 left-0 right-0 z-20 p-4 lg:p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                {/* Seek bar */}
                {!isLive && (
                    <div className="mb-3">
                        <div className="relative h-1.5 bg-white/15 rounded-full overflow-hidden">
                            <div className="absolute inset-y-0 left-0 bg-white/25" style={{ width: `${duration ? (buffered / duration) * 100 : 0}%` }} />
                            <div className="absolute inset-y-0 left-0 bg-[#E50914]" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
                        </div>
                        <input
                            type="range"
                            className="player-range w-full -mt-3"
                            min={0}
                            max={duration || 0}
                            step={0.1}
                            value={currentTime}
                            onChange={onSeekBarChange}
                            data-testid="player-seek"
                        />
                        <div className="flex justify-between text-xs text-zinc-300 mt-1 font-mono">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration - currentTime)}</span>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-[#E50914] hover:bg-[#F40612] flex items-center justify-center transition" data-testid="player-play-pause">
                            {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
                        </button>
                        {!isLive && (
                            <>
                                <button onClick={() => seek(-10)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center" data-testid="player-seek-back">
                                    <Rewind className="w-5 h-5" />
                                </button>
                                <button onClick={() => seek(10)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center" data-testid="player-seek-forward">
                                    <FastForward className="w-5 h-5" />
                                </button>
                            </>
                        )}
                        <div className="hidden sm:flex items-center gap-2 ml-2">
                            <button onClick={toggleMute} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center" data-testid="player-mute">
                                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <div className="w-24">
                                <Slider value={[Math.round(volume * 100)]} max={100} step={1} onValueChange={(v) => setVolume(v[0] / 100)} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center" data-testid="player-quality">
                                    <span className="text-[10px] font-bold tracking-wider">
                                        {selectedLevel === -1 ? "AUTO" : `${levels[selectedLevel]?.height || ""}p`}
                                    </span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#0a0a0a] border-white/10 text-zinc-100">
                                <DropdownMenuLabel>Quality</DropdownMenuLabel>
                                <DropdownMenuRadioGroup value={String(selectedLevel)} onValueChange={(v) => setLevel(parseInt(v))}>
                                    <DropdownMenuRadioItem value="-1">Auto</DropdownMenuRadioItem>
                                    {levels.map((l) => (
                                        <DropdownMenuRadioItem key={l.id} value={String(l.id)}>
                                            {l.height}p · {Math.round(l.bitrate / 1000)} kbps
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center" data-testid="player-subtitles">
                                    <Subtitles className="w-5 h-5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#0a0a0a] border-white/10 text-zinc-100">
                                <DropdownMenuLabel>Subtitles</DropdownMenuLabel>
                                <DropdownMenuRadioGroup value={String(selectedSub)} onValueChange={(v) => setSubtitle(parseInt(v))}>
                                    <DropdownMenuRadioItem value="-1">Off</DropdownMenuRadioItem>
                                    {textTracks.map((t) => (
                                        <DropdownMenuRadioItem key={t.id} value={String(t.id)}>
                                            {t.label} {t.lang ? `(${t.lang})` : ""}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuLabel>Audio Track</DropdownMenuLabel>
                                <DropdownMenuRadioGroup value={String(selectedAudio)} onValueChange={(v) => setAudioTrack(parseInt(v))}>
                                    {audioTracks.length === 0 && <DropdownMenuRadioItem value="0">Default</DropdownMenuRadioItem>}
                                    {audioTracks.map((t) => (
                                        <DropdownMenuRadioItem key={t.id} value={String(t.id)}>
                                            {t.label} {t.lang ? `(${t.lang})` : ""}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center" data-testid="player-settings">
                                    <SettingsIcon className="w-5 h-5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#0a0a0a] border-white/10 text-zinc-100 w-64">
                                <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
                                <DropdownMenuRadioGroup value={String(speed)} onValueChange={(v) => setPlaybackRate(parseFloat(v))}>
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                                        <DropdownMenuRadioItem key={s} value={String(s)}>{s}×</DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuLabel>Aspect Ratio</DropdownMenuLabel>
                                <DropdownMenuRadioGroup value={aspect} onValueChange={setAspect}>
                                    {ASPECT_OPTIONS.map((a) => (
                                        <DropdownMenuRadioItem key={a.id} value={a.id}>{a.label}</DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuLabel className="flex items-center gap-2">
                                    <Sun className="w-4 h-4" /> Brightness ({Math.round(brightness * 100)}%)
                                </DropdownMenuLabel>
                                <div className="px-2 pb-2">
                                    <Slider value={[Math.round(brightness * 100)]} min={40} max={150} step={5} onValueChange={(v) => setBrightness(v[0] / 100)} />
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <button onClick={togglePiP} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center" data-testid="player-pip" title="Picture-in-Picture">
                            <PictureInPicture2 className="w-5 h-5" />
                        </button>

                        <button onClick={tryCast} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center" data-testid="player-cast" title="Cast">
                            <Cast className="w-5 h-5" />
                        </button>

                        <button onClick={toggleFs} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center" data-testid="player-fullscreen" title="Fullscreen">
                            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            <PlayerSwitcher
                open={showSwitcher}
                onOpenChange={setShowSwitcher}
                value={playerEngine}
                onChange={(v) => {
                    setPlayerEngine(v);
                    localPref.set("PREFERRED_PLAYER", v);
                }}
            />
        </div>
    );
}
