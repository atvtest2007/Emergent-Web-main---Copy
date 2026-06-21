import axios from "axios";

// Determine the backend URL dynamically
let defaultBackendUrl = process.env.REACT_APP_BACKEND_URL;

if (!defaultBackendUrl) {
    if (window.location.protocol === "file:" || window.location.protocol.startsWith("capacitor")) {
        // Desktop / Mobile
        defaultBackendUrl = "http://127.0.0.1:8000";
    } else {
        // Browser Web App (relative/same domain)
        defaultBackendUrl = `${window.location.protocol}//${window.location.hostname}:8000`;
    }
}

// Check for runtime config overrides and LocalStorage user overrides
const runtimeOverride = window.MAXX_CONFIG?.BACKEND_URL;
const userOverride = localStorage.getItem("maxx_backend_url");

export const BACKEND_URL = userOverride || runtimeOverride || defaultBackendUrl;
export const API_BASE = `${BACKEND_URL}/api`;

export const api = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
});

api.interceptors.request.use((config) => {
    const playlistId = localStorage.getItem("maxx_active_playlist_id");
    if (playlistId) {
        config.headers["X-Playlist-ID"] = playlistId;
    }
    return config;
});

// Helpers ---------------
export const Playlists = {
    create: (payload) => api.post("/playlists", payload).then((r) => {
        if (r.data && r.data.id) {
            localStorage.setItem("maxx_active_playlist_id", r.data.id);
        }
        return r.data;
    }),
    list: () => api.get("/playlists").then((r) => r.data),
    active: () => api.get("/playlists/active").then((r) => {
        if (r.data && r.data.id) {
            localStorage.setItem("maxx_active_playlist_id", r.data.id);
        }
        return r.data;
    }),
    activate: (id) => {
        localStorage.setItem("maxx_active_playlist_id", id);
        return api.post(`/playlists/${id}/activate`).then((r) => r.data);
    },
    remove: (id) => api.delete(`/playlists/${id}`).then((r) => r.data),
    demo: () => api.post("/playlists/demo").then((r) => {
        if (r.data && r.data.id) {
            localStorage.setItem("maxx_active_playlist_id", r.data.id);
        }
        return r.data;
    }),
};

export const Account = {
    info: () => api.get("/account/info").then((r) => r.data),
};

export const Content = {
    categories: (type) => api.get(`/content/categories/${type}`).then((r) => r.data),
    streams: (type, categoryId) =>
        api
            .get(`/content/streams/${type}`, { params: categoryId ? { category_id: categoryId } : {} })
            .then((r) => r.data),
    movie: (id) => api.get(`/content/movie/${encodeURIComponent(id)}`).then((r) => r.data),
    series: (id) => api.get(`/content/series/${encodeURIComponent(id)}`).then((r) => r.data),
    epg: (streamId, limit = 12) =>
        api.get(`/content/epg/${encodeURIComponent(streamId)}`, { params: { limit } }).then((r) => r.data),
    streamUrl: (contentType, contentId, ext) =>
        api
            .get(`/content/stream-url`, { params: { content_type: contentType, content_id: contentId, ext } })
            .then((r) => r.data),
    search: (q) => api.get(`/content/search`, { params: { q } }).then((r) => r.data),
};

export const Favorites = {
    list: () => api.get("/user/favorites").then((r) => r.data),
    add: (payload) => api.post("/user/favorites", payload).then((r) => r.data),
    remove: (contentType, contentId) =>
        api.delete(`/user/favorites/${contentType}/${encodeURIComponent(contentId)}`).then((r) => r.data),
};

export const Progress = {
    list: () => api.get("/user/progress").then((r) => r.data),
    continueWatching: () => api.get("/user/continue-watching").then((r) => r.data),
    upsert: (payload) => api.post("/user/progress", payload).then((r) => r.data),
    remove: (contentType, contentId) =>
        api.delete(`/user/progress/${contentType}/${encodeURIComponent(contentId)}`).then((r) => r.data),
};

export const Settings = {
    get: () => api.get("/user/settings").then((r) => r.data),
    save: (payload) => api.put("/user/settings", payload).then((r) => r.data),
};

export const proxyUrl = (url) => `${API_BASE}/proxy/stream?url=${encodeURIComponent(url)}`;

export const Branding = {
    get: () => api.get("/branding").then((r) => r.data),
    update: (payload) => api.post("/admin/branding", payload).then((r) => r.data),
};
