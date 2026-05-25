// Lightweight local store for UI preferences. Backend is source of truth for data.
const KEYS = {
    PREFERRED_PLAYER: "maxx.preferred_player",
    LAST_VOLUME: "maxx.last_volume",
    SUBTITLE_LANG: "maxx.subtitle_lang",
    AUDIO_LANG: "maxx.audio_lang",
    AUTOPLAY_NEXT: "maxx.autoplay_next",
    PREVIEW_HOVER: "maxx.preview_hover",
    ASPECT: "maxx.aspect",
    BRIGHTNESS: "maxx.brightness",
};

export const localPref = {
    get: (key, fallback) => {
        try {
            const v = localStorage.getItem(KEYS[key]);
            return v === null ? fallback : JSON.parse(v);
        } catch {
            return fallback;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(KEYS[key], JSON.stringify(value));
        } catch {
            /* noop */
        }
    },
};

export const PLAYER_OPTIONS = [
    { id: "hls", label: "HLS.js Player", desc: "Recommended — adaptive bitrate, HLS native" },
    { id: "videojs", label: "Video.js", desc: "Cross-browser engine with plugin support" },
    { id: "native", label: "Native HTML5", desc: "Lightweight, hardware-accelerated" },
    { id: "auto", label: "Auto", desc: "Choose best engine per stream automatically" },
];

export const ASPECT_OPTIONS = [
    { id: "fit-contain", label: "Original (Fit)" },
    { id: "fit-fill", label: "Stretch" },
    { id: "fit-cover", label: "Crop to Fill" },
    { id: "fit-zoom", label: "Zoom 1.15×" },
];
