import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || `http://${window.location.hostname}:8000`;
export const API_BASE = `${BACKEND_URL}/api`;

export const api = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
});

// Helpers ---------------
export const Playlists = {
    create: (payload) => api.post("/playlists", payload).then((r) => r.data),
    list: () => api.get("/playlists").then((r) => r.data),
    active: () => api.get("/playlists/active").then((r) => r.data),
    activate: (id) => api.post(`/playlists/${id}/activate`).then((r) => r.data),
    remove: (id) => api.delete(`/playlists/${id}`).then((r) => r.data),
    demo: () => api.post("/playlists/demo").then((r) => r.data),
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
    movie: (id) => api.get(`/content/movie/${id}`).then((r) => r.data),
    series: (id) => api.get(`/content/series/${id}`).then((r) => r.data),
    epg: (streamId, limit = 12) =>
        api.get(`/content/epg/${streamId}`, { params: { limit } }).then((r) => r.data),
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
        api.delete(`/user/favorites/${contentType}/${contentId}`).then((r) => r.data),
};

export const Progress = {
    list: () => api.get("/user/progress").then((r) => r.data),
    continueWatching: () => api.get("/user/continue-watching").then((r) => r.data),
    upsert: (payload) => api.post("/user/progress", payload).then((r) => r.data),
    remove: (contentType, contentId) =>
        api.delete(`/user/progress/${contentType}/${contentId}`).then((r) => r.data),
};

export const Settings = {
    get: () => api.get("/user/settings").then((r) => r.data),
    save: (payload) => api.put("/user/settings", payload).then((r) => r.data),
};

export const proxyUrl = (url) => `${API_BASE}/proxy/stream?url=${encodeURIComponent(url)}`;
