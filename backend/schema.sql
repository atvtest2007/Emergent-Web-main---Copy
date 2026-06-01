-- MaxxPlayer Supabase (PostgreSQL) Schema

CREATE TABLE IF NOT EXISTS playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'xtream', 'm3u', 'demo'
    server_url TEXT,
    username TEXT,
    password TEXT,
    m3u_url TEXT,
    m3u_content TEXT,
    is_active BOOLEAN DEFAULT false,
    auto_connect BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id TEXT NOT NULL DEFAULT 'default',
    content_type TEXT NOT NULL, -- 'live', 'movie', 'series', 'vod'
    content_id TEXT NOT NULL,
    content_data JSONB DEFAULT '{}'::jsonb,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(profile_id, content_type, content_id)
);

CREATE TABLE IF NOT EXISTS watch_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id TEXT NOT NULL DEFAULT 'default',
    content_type TEXT NOT NULL,
    content_id TEXT NOT NULL,
    position DOUBLE PRECISION NOT NULL,
    duration DOUBLE PRECISION NOT NULL,
    progress DOUBLE PRECISION NOT NULL,
    content_data JSONB DEFAULT '{}'::jsonb,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(profile_id, content_type, content_id)
);

CREATE TABLE IF NOT EXISTS settings (
    profile_id TEXT PRIMARY KEY DEFAULT 'default',
    preferred_player TEXT DEFAULT 'hls',
    buffer_size INTEGER DEFAULT 30,
    hardware_acceleration BOOLEAN DEFAULT true,
    subtitle_language TEXT DEFAULT 'en',
    audio_language TEXT DEFAULT 'en',
    autoplay_next BOOLEAN DEFAULT true,
    preview_on_hover BOOLEAN DEFAULT true,
    analytics BOOLEAN DEFAULT false
);
