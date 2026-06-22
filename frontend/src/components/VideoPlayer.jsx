import React, { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Capacitor } from "@capacitor/core";
import { CapacitorVideoPlayer } from "capacitor-video-player";
import {
    Play, Pause, Volume2, VolumeX, Maximize, Minimize,
    Settings as SettingsIcon, PictureInPicture2, Rewind, FastForward,
    SkipBack, SkipForward, Subtitles, Cast, Sun, Loader2, Cpu, X, RotateCw,
    ArrowLeft, Heart
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
import { toast } from "sonner";

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
    bufferSize = 30,
    isFav = false,
    onToggleFav = null,
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
    const [rotation, setRotation] = useState(0);
    const [showBackDialog, setShowBackDialog] = useState(false);
    const [audioTracks, setAudioTracks] = useState([]);
    const [textTracks, setTextTracks] = useState([]);
    const [selectedAudio, setSelectedAudio] = useState(0);
    const [selectedSub, setSelectedSub] = useState(-1);
    const [levels, setLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(-1);
    const [autoMuted, setAutoMuted] = useState(false);
    const [forceHls, setForceHls] = useState(false);

    // -------- Auto-unmute on first interaction
    useEffect(() => {
        if (!autoMuted) return;
        const handleInteraction = () => {
            if (videoRef.current) {
                videoRef.current.muted = false;
                setIsMuted(false);
                setAutoMuted(false);
                toast.success("Audio restored!");
            }
        };
        const opts = { capture: true, once: true };
        window.addEventListener("click", handleInteraction, opts);
        window.addEventListener("touchstart", handleInteraction, opts);
        window.addEventListener("keydown", handleInteraction, opts);
        return () => {
            window.removeEventListener("click", handleInteraction, opts);
            window.removeEventListener("touchstart", handleInteraction, opts);
            window.removeEventListener("keydown", handleInteraction, opts);
        };
    }, [autoMuted]);

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

    const setupEngine = useCallback((engineId, sourceOverride) => {
        teardown();
        let source = sourceOverride || src;
        if (forceHls && !isLive && source) {
            source = source.replace(/\.mp4/gi, '.m3u8').replace(/\.mkv/gi, '.m3u8')
                           .replace(/%2Emp4/gi, '%2Em3u8').replace(/%2Emkv/gi, '%2Em3u8');
        }
        const video = videoRef.current;
        if (!video || !source) return;

        setLoading(true);
        setErrorMsg(null);

        // NATIVE CAPACITOR PLAYER (ExoPlayer on Android)
        if (Capacitor.isNativePlatform()) {
            (async () => {
                try {
                    await CapacitorVideoPlayer.initPlayer({
                        mode: "fullscreen",
                        url: source,
                        playerId: "fullscreen",
                        componentTag: "app-video-player"
                    });
                    CapacitorVideoPlayer.addListener('jeepCapVideoPlayerExit', () => {
                        if (onClose) onClose();
                    });
                } catch (e) {
                    console.error("Native player error:", e);
                    setErrorMsg("Native Android player failed to initialize.");
                    setLoading(false);
                }
            })();
            return;
        }

        const isHls = /\.m3u8(\?|$)/i.test(source);
        let effectiveEngine = engineId;
        if (effectiveEngine === "auto") {
            effectiveEngine = (isHls && Hls.isSupported()) ? "hls" : "native";
        }

        if (effectiveEngine === "hls" && isHls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: isLive,
                backBufferLength: 60,
                maxBufferLength: 120,
                maxMaxBufferLength: 600,
                maxBufferSize: 120 * 1000 * 1000,
                startLevel: -1,
                abrEwmaDefaultEstimate: 500000,
                liveSyncDurationCount: 3,
                fragLoadingTimeOut: 15000,
                levelLoadingTimeOut: 15000,
                manifestLoadingTimeOut: 15000,
                levelLoadingMaxRetry: 6,
                manifestLoadingMaxRetry: 6,
                fragLoadingRetryDelay: 1000,
                fragLoadingMaxRetry: 6,
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
                if (autoPlay) {
                    video.play().catch((err) => {
                        if (err.name === 'NotAllowedError') {
                            video.muted = true;
                            setIsMuted(true);
                            setAutoMuted(true);
                            video.play().catch(() => {});
                            toast.info("Tap anywhere on the screen to restore audio.");
                        }
                    });
                }
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
                if (isHls) {
                    vjsRef.current.src({ src: source, type: "application/x-mpegURL" });
                } else {
                    vjsRef.current.src({ src: source });
                }
                vjsRef.current.on("loadedmetadata", () => {
                    setLoading(false);
                    if (initialPosition > 0 && !isLive) video.currentTime = initialPosition;
                    if (autoPlay) {
                        video.play().catch((err) => {
                            if (err.name === 'NotAllowedError') {
                                video.muted = true;
                                setIsMuted(true);
                                setAutoMuted(true);
                                video.play().catch(() => {});
                                toast.info("Tap anywhere on the screen to restore audio.");
                            }
                        });
                    }
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
                if (autoPlay) {
                    video.play().catch((err) => {
                        if (err.name === 'NotAllowedError') {
                            video.muted = true;
                            setIsMuted(true);
                            setAutoMuted(true);
                            video.play().catch(() => {});
                            toast.info("Tap anywhere on the screen to restore audio.");
                        }
                    });
                }
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
    }, [autoPlay, initialPosition, isLive, teardown, forceHls, src]);

    useEffect(() => {
        if (!src) return;
        proxyAttemptedRef.current = false;
        setupEngine(playerEngine, src);
        return () => teardown();
    }, [src, playerEngine, forceHls, setupEngine, teardown]);

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
        const onPlaying = () => {
            setLoading(false);
            setErrorMsg(null);
        };
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

    // -------- Buffering Timeout
    useEffect(() => {
        let timeout;
        if (loading && !errorMsg) {
            timeout = setTimeout(() => {
                setErrorMsg("Stream timed out while buffering. Please try again or switch player engine.");
                setLoading(false);
            }, 10000); // 10 seconds timeout
        }
        return () => clearTimeout(timeout);
    }, [loading, errorMsg]);

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
                    v.paused ? v.play().catch(() => {}) : v.pause();
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
        v.paused ? v.play().catch(() => {}) : v.pause();
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
        if (hlsRef.current) {
            hlsRef.current.nextLevel = idx;
        }
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
            className={`player-container ${aspect} ${isFullscreen ? "fixed inset-0 w-screen h-screen z-50" : "w-full h-full"} bg-black group select-none overflow-hidden relative`}
            style={{ filter: `brightness(${brightness})` }}
            data-testid="video-player"
        >
            <video
                ref={videoRef}
                crossOrigin="anonymous"
                playsInline
                className={`absolute inset-0 w-full h-full transition-transform duration-300 ${!isPlaying && poster ? 'hidden' : ''}`}
                style={{ transform: `rotate(${rotation}deg)` }}
            />
            
            {!isPlaying && poster && (
                <img
                    src={poster}
                    alt="Poster"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
            )}

            {window.BRAND_WATERMARK && (
                <img
                    src={window.BRAND_WATERMARK}
                    alt="Watermark"
                    className="absolute top-4 right-4 z-10 opacity-60 pointer-events-none"
                    style={{ maxHeight: '60px', maxWidth: '150px' }}
                />
            )}


            {/* Click overlay just to trigger controls UI (optional, but shouldn't pause) */}
            <div
                className="absolute inset-0 z-10"
                onClick={resetHideTimer}
                onDoubleClick={toggleFs}
            />

            {/* Loading spinner */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                    <Loader2 className="w-12 h-12 animate-spin text-brand" />
                </div>
            )}

            {/* Error */}
            {errorMsg && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center z-30">
                    <div className="bg-[#121212] border border-white/10 rounded-xl p-6 max-w-sm w-full shadow-2xl">
                        <div className="text-xl font-display font-bold mb-2 text-zinc-100">Playback Failed</div>
                        <div className="text-sm text-zinc-400 mb-6">{errorMsg}</div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    proxyAttemptedRef.current = false;
                                    setupEngine(playerEngine, src);
                                }}
                                className="w-full px-4 py-3 rounded-md glass border border-white/10 hover:bg-white/10 font-semibold flex items-center justify-center gap-2 transition text-zinc-200"
                            >
                                <RotateCw className="w-4 h-4" /> Retry Playback
                            </button>
                            <button
                                data-testid="error-switch-player"
                                onClick={() => setShowSwitcher(true)}
                                className="w-full px-4 py-3 rounded-md bg-brand hover:bg-[#F40612] text-white font-semibold transition"
                            >
                                Switch Player Engine
                            </button>
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="w-full px-4 py-3 rounded-md glass border border-white/10 hover:bg-white/10 font-semibold flex items-center justify-center gap-2 transition text-zinc-200"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Go Back
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Back Navigation Dialog */}
            {showBackDialog && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center z-[60]">
                    <div className="bg-[#121212] border border-white/10 rounded-xl p-6 max-w-sm w-full shadow-2xl">
                        <div className="text-xl font-display font-bold mb-2 text-zinc-100">Exit Playback?</div>
                        <div className="text-sm text-zinc-400 mb-6">Choose how you'd like to proceed.</div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    setShowBackDialog(false);
                                    if (onClose) onClose();
                                }}
                                className="w-full px-4 py-3 rounded-md bg-brand hover:bg-[#F40612] text-white font-semibold flex items-center justify-center gap-2 transition"
                            >
                                <ArrowLeft className="w-4 h-4" /> Exit Player
                            </button>
                            <button
                                onClick={() => {
                                    setShowBackDialog(false);
                                    togglePiP();
                                }}
                                className="w-full px-4 py-3 rounded-md glass border border-white/10 hover:bg-white/10 font-semibold flex items-center justify-center gap-2 transition text-zinc-200"
                            >
                                <PictureInPicture2 className="w-4 h-4" /> Picture-in-Picture Mode
                            </button>
                            <button
                                onClick={() => setShowBackDialog(false)}
                                className="w-full px-4 py-3 rounded-md hover:bg-white/5 font-semibold transition text-zinc-400 hover:text-white"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Top bar */}
            <div className={`absolute top-0 left-0 right-0 z-20 p-4 md:px-8 md:py-6 2xl:px-16 4xl:px-32 pt-safe bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 ${(controlsVisible || !isPlaying || loading || errorMsg) ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        {onClose && (
                            <button
                                data-testid="player-close-btn"
                                onClick={() => setShowBackDialog(true)}
                                className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition shrink-0"
                                aria-label="Go back"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <div className="min-w-0">
                            <div className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-bold">
                                {isLive ? "Live Broadcast" : "Now Playing"}
                            </div>
                            <div className="font-display text-lg sm:text-xl lg:text-2xl 4xl:text-4xl font-bold truncate max-w-[60vw] md:max-w-none">{title}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isLive && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand/15 border border-brand/30">
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
            <div className={`absolute bottom-0 left-0 right-0 z-20 p-4 md:px-8 md:py-6 2xl:px-16 4xl:px-32 pb-safe bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${(controlsVisible || !isPlaying || loading || errorMsg) ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                {/* Seek bar */}
                {!isLive && (
                    <div className="mb-3">
                        <div className="relative group w-full flex items-center">
                            {/* Custom visual track */}
                            <div className="absolute left-0 right-0 h-1.5 bg-white/15 rounded-full overflow-hidden pointer-events-none">
                                <div className="absolute inset-y-0 left-0 bg-white/25 transition-all duration-150" style={{ width: `${duration ? (buffered / duration) * 100 : 0}%` }} />
                                <div className="absolute inset-y-0 left-0 bg-brand transition-all duration-150" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
                            </div>
                            
                            {/* Invisible native input for interaction */}
                            <input
                                type="range"
                                className="player-range w-full relative z-10 m-0"
                                min={0}
                                max={duration || 0}
                                step={0.1}
                                value={currentTime}
                                onChange={onSeekBarChange}
                                data-testid="player-seek"
                            />
                        </div>
                        <div className="flex justify-between text-xs 4xl:text-base text-zinc-300 mt-2 font-mono">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration - currentTime)}</span>
                        </div>
                    </div>
                )}

                <div className="flex flex-col md:flex-row items-center justify-between gap-3 w-full">
                    <div className="flex items-center justify-between w-full md:w-auto">
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                            <button onClick={togglePlay} className="w-14 h-14 md:w-12 md:h-12 4xl:w-20 4xl:h-20 rounded-full bg-brand hover:bg-[#F40612] flex items-center justify-center transition shrink-0" data-testid="player-play-pause">
                                {isPlaying ? <Pause className="w-6 h-6 md:w-5 md:h-5 4xl:w-10 4xl:h-10 fill-white" /> : <Play className="w-6 h-6 md:w-5 md:h-5 4xl:w-10 4xl:h-10 fill-white ml-0.5" />}
                            </button>
                            {!isLive && (
                                <>
                                    <button onClick={() => seek(-10)} className="w-12 h-12 md:w-10 md:h-10 4xl:w-16 4xl:h-16 rounded-full hover:bg-white/10 flex items-center justify-center shrink-0" data-testid="player-seek-back">
                                        <Rewind className="w-6 h-6 md:w-5 md:h-5 4xl:w-8 4xl:h-8" />
                                    </button>
                                    <button onClick={() => seek(10)} className="w-12 h-12 md:w-10 md:h-10 4xl:w-16 4xl:h-16 rounded-full hover:bg-white/10 flex items-center justify-center shrink-0" data-testid="player-seek-forward">
                                        <FastForward className="w-6 h-6 md:w-5 md:h-5 4xl:w-8 4xl:h-8" />
                                    </button>
                                </>
                            )}
                        </div>
                        
                        {/* Mobile right-aligned top row controls */}
                        <div className="flex md:hidden items-center gap-1 shrink-0">
                            <button onClick={toggleMute} className="w-12 h-12 rounded-full hover:bg-white/10 flex items-center justify-center shrink-0" data-testid="player-mute-mobile">
                                {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                            </button>
                            <button onClick={toggleFs} className="w-12 h-12 rounded-full hover:bg-white/10 flex items-center justify-center shrink-0" data-testid="player-fullscreen-mobile">
                                {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                            </button>
                        </div>

                        {/* Desktop volume controls */}
                        <div className="hidden md:flex items-center gap-2 ml-2">
                            <button onClick={toggleMute} className="w-10 h-10 4xl:w-16 4xl:h-16 rounded-full hover:bg-white/10 flex items-center justify-center" data-testid="player-mute">
                                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 4xl:w-8 4xl:h-8" /> : <Volume2 className="w-5 h-5 4xl:w-8 4xl:h-8" />}
                            </button>
                            <div className="w-24 4xl:w-48">
                                <Slider value={[Math.round(volume * 100)]} max={100} step={1} onValueChange={(v) => setVolume(v[0] / 100)} />
                            </div>
                        </div>
                    </div>

                    {/* Secondary controls (Wrapped on mobile to prevent hiding) */}
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 w-full md:w-auto justify-start md:justify-end pb-2 md:pb-0 shrink-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-8 h-8 sm:w-10 sm:h-10 4xl:w-16 4xl:h-16 rounded-full hover:bg-white/10 flex items-center justify-center" data-testid="player-quality">
                                    <span className="text-[9px] sm:text-[10px] 4xl:text-base font-bold tracking-wider">
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
                                <button className="w-8 h-8 sm:w-10 sm:h-10 4xl:w-16 4xl:h-16 rounded-full hover:bg-white/10 flex items-center justify-center" data-testid="player-subtitles">
                                    <Subtitles className="w-4 h-4 sm:w-5 sm:h-5 4xl:w-8 4xl:h-8" />
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
                                <button className="w-8 h-8 sm:w-10 sm:h-10 4xl:w-16 4xl:h-16 rounded-full hover:bg-white/10 flex items-center justify-center" data-testid="player-settings">
                                    <SettingsIcon className="w-4 h-4 sm:w-5 sm:h-5 4xl:w-8 4xl:h-8" />
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
                                {!isLive && (
                                    <>
                                        <DropdownMenuLabel>Audio Fix (No Sound?)</DropdownMenuLabel>
                                        <div className="px-2 pb-2">
                                            <button 
                                                onClick={() => setForceHls(!forceHls)}
                                                className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-white/10 transition text-zinc-200"
                                            >
                                                {forceHls ? "Disable Audio Fix" : "Enable Audio Fix"}
                                            </button>
                                        </div>
                                        <DropdownMenuSeparator className="bg-white/10" />
                                    </>
                                )}
                                <DropdownMenuLabel className="flex items-center gap-2">
                                    <Sun className="w-4 h-4" /> Brightness ({Math.round(brightness * 100)}%)
                                </DropdownMenuLabel>
                                <div className="px-2 pb-2">
                                    <Slider value={[Math.round(brightness * 100)]} min={40} max={150} step={5} onValueChange={(v) => setBrightness(v[0] / 100)} />
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {onToggleFav && (
                            <button onClick={onToggleFav} className="w-8 h-8 sm:w-10 sm:h-10 4xl:w-16 4xl:h-16 rounded-full hover:bg-white/10 flex items-center justify-center shrink-0" data-testid="player-favorite" title={isFav ? "Unfavorite" : "Favorite"}>
                                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 4xl:w-8 4xl:h-8 ${isFav ? "fill-[var(--brand-primary)] text-brand" : "text-zinc-100"}`} />
                            </button>
                        )}

                        <button onClick={togglePiP} className="w-8 h-8 sm:w-10 sm:h-10 4xl:w-16 4xl:h-16 rounded-full hover:bg-white/10 flex items-center justify-center shrink-0" data-testid="player-pip" title="Picture-in-Picture">
                            <PictureInPicture2 className="w-4 h-4 sm:w-5 sm:h-5 4xl:w-8 4xl:h-8" />
                        </button>

                        <button onClick={() => setRotation(r => (r + 90) % 360)} className="w-8 h-8 sm:w-10 sm:h-10 4xl:w-16 4xl:h-16 rounded-full hover:bg-white/10 flex items-center justify-center shrink-0" data-testid="player-rotate" title="Rotate Video">
                            <RotateCw className="w-4 h-4 sm:w-5 sm:h-5 4xl:w-8 4xl:h-8" />
                        </button>

                        <button onClick={tryCast} className="w-8 h-8 sm:w-10 sm:h-10 4xl:w-16 4xl:h-16 rounded-full hover:bg-white/10 flex items-center justify-center shrink-0" data-testid="player-cast" title="Cast">
                            <Cast className="w-4 h-4 sm:w-5 sm:h-5 4xl:w-8 4xl:h-8" />
                        </button>

                        <button onClick={toggleFs} className="hidden md:flex w-8 h-8 sm:w-10 sm:h-10 4xl:w-16 4xl:h-16 rounded-full hover:bg-white/10 items-center justify-center shrink-0" data-testid="player-fullscreen" title="Fullscreen">
                            {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5 4xl:w-8 4xl:h-8" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5 4xl:w-8 4xl:h-8" />}
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
