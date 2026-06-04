"""Maxx Player — FastAPI backend with PostgreSQL."""
from __future__ import annotations

import logging
import os
import uuid
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import APIRouter, Body, FastAPI, HTTPException, Query
from fastapi.responses import PlainTextResponse, StreamingResponse
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware
import httpx
import asyncpg
import subliminal
from babelfish import Language

from xtream_service import (
    DEMO_CATEGORIES,
    DEMO_LIVE_CHANNELS,
    DEMO_MOVIES,
    DEMO_SERIES,
    XtreamClient,
    demo_account_info,
    demo_epg,
    parse_m3u,
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

db_pool = None

async def init_connection(conn):
    await conn.set_type_codec(
        'jsonb',
        encoder=json.dumps,
        decoder=json.loads,
        schema='pg_catalog'
    )
    await conn.set_type_codec(
        'json',
        encoder=json.dumps,
        decoder=json.loads,
        schema='pg_catalog'
    )

@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_pool
    db_url = os.environ.get("DATABASE_URL")
    if db_url:
        db_pool = await asyncpg.create_pool(db_url, init=init_connection)
    else:
        logging.warning("DATABASE_URL is not set!")
    yield
    if db_pool:
        await db_pool.close()

app = FastAPI(title="Maxx Player API", lifespan=lifespan)
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
log = logging.getLogger("maxx")


# ---------------------- Models ---------------------- #

class Playlist(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str  # "xtream" | "m3u" | "demo"
    server_url: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    m3u_url: Optional[str] = None
    m3u_content: Optional[str] = None
    is_active: bool = True
    auto_connect: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class PlaylistCreate(BaseModel):
    name: str
    type: str
    server_url: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    m3u_url: Optional[str] = None
    m3u_content: Optional[str] = None
    auto_connect: bool = False


class FavoriteCreate(BaseModel):
    profile_id: str = "default"
    content_type: str  # live | movie | series | vod
    content_id: str
    content_data: dict[str, Any] = Field(default_factory=dict)


class ProgressUpdate(BaseModel):
    profile_id: str = "default"
    content_type: str
    content_id: str
    position: float
    duration: float
    content_data: dict[str, Any] = Field(default_factory=dict)


# ---------------------- Helpers ---------------------- #

async def get_active_playlist() -> dict[str, Any] | None:
    if not db_pool:
        return None
    async with db_pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM playlists WHERE is_active = true LIMIT 1")
        if row:
            d = dict(row)
            d["id"] = str(d["id"])
            if d.get("created_at"):
                d["created_at"] = d["created_at"].isoformat()
            return d
    return None

async def get_playlist(playlist_id: str) -> dict[str, Any]:
    if not db_pool:
        raise HTTPException(status_code=500, detail="DB not initialized")
    async with db_pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM playlists WHERE id = $1::uuid", playlist_id)
        if not row:
            raise HTTPException(status_code=404, detail="Playlist not found")
        d = dict(row)
        d["id"] = str(d["id"])
        if d.get("created_at"):
            d["created_at"] = d["created_at"].isoformat()
        return d


def xtream_from_playlist(pl: dict[str, Any]) -> XtreamClient:
    if pl["type"] != "xtream":
        raise HTTPException(status_code=400, detail="Playlist is not an Xtream account")
    return XtreamClient(pl["server_url"], pl["username"], pl["password"])


# ---------------------- Health ---------------------- #

@api.get("/")
async def root():
    return {"app": "Maxx Player", "status": "ok"}


# ---------------------- Playlist management ---------------------- #

@api.post("/playlists")
async def create_playlist(payload: PlaylistCreate):
    pl = Playlist(**payload.model_dump())
    doc = pl.model_dump()
    
    if pl.type == "xtream":
        if not (pl.server_url and pl.username and pl.password):
            raise HTTPException(status_code=400, detail="server_url, username, password required")
        try:
            client = XtreamClient(pl.server_url, pl.username, pl.password, timeout=10.0)
            info = await client.account_info()
            if not info or "user_info" not in info:
                raise HTTPException(status_code=401, detail="Invalid Xtream credentials")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Cannot reach Xtream server: {e}") from e
    elif pl.type == "m3u":
        if not (pl.m3u_url or pl.m3u_content):
            raise HTTPException(status_code=400, detail="m3u_url or m3u_content required")
        if pl.m3u_url and not pl.m3u_content:
            try:
                async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
                    r = await client.get(pl.m3u_url)
                    r.raise_for_status()
                    doc["m3u_content"] = r.text
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Cannot fetch M3U URL: {e}") from e
    
    async with db_pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute("UPDATE playlists SET is_active = false")
            doc["is_active"] = True
            await conn.execute('''
                INSERT INTO playlists (id, name, type, server_url, username, password, m3u_url, m3u_content, is_active, auto_connect)
                VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ''', doc["id"], doc["name"], doc["type"], doc.get("server_url"), doc.get("username"), doc.get("password"), doc.get("m3u_url"), doc.get("m3u_content"), doc["is_active"], doc["auto_connect"])
            
    return doc


@api.get("/playlists")
async def list_playlists():
    if not db_pool:
        return []
    async with db_pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM playlists ORDER BY created_at DESC")
        docs = []
        for r in rows:
            d = dict(r)
            d["id"] = str(d["id"])
            if d.get("created_at"):
                d["created_at"] = d["created_at"].isoformat()
            if d.get("password"):
                d["password_masked"] = "•" * 8
            docs.append(d)
        return docs


@api.get("/playlists/active")
async def get_active_playlist_endpoint():
    return await get_active_playlist()


@api.post("/playlists/{playlist_id}/activate")
async def activate_playlist(playlist_id: str):
    pl = await get_playlist(playlist_id)
    async with db_pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute("UPDATE playlists SET is_active = false")
            await conn.execute("UPDATE playlists SET is_active = true WHERE id = $1::uuid", playlist_id)
    return {"ok": True, "active": pl["id"]}


@api.delete("/playlists/{playlist_id}")
async def delete_playlist(playlist_id: str):
    async with db_pool.acquire() as conn:
        res = await conn.execute("DELETE FROM playlists WHERE id = $1::uuid", playlist_id)
        if res == "DELETE 0":
            raise HTTPException(status_code=404, detail="Playlist not found")
    return {"ok": True}


# ---------------------- Demo seed ---------------------- #

@api.post("/playlists/demo")
async def create_demo_playlist():
    async with db_pool.acquire() as conn:
        existing = await conn.fetchrow("SELECT * FROM playlists WHERE type = 'demo' LIMIT 1")
        if existing:
            eid = str(existing["id"])
            async with conn.transaction():
                await conn.execute("UPDATE playlists SET is_active = false")
                await conn.execute("UPDATE playlists SET is_active = true WHERE id = $1::uuid", eid)
            d = dict(existing)
            d["id"] = eid
            d["is_active"] = True
            if d.get("created_at"):
                d["created_at"] = d["created_at"].isoformat()
            return d
            
        pl = Playlist(name="Maxx Demo Library", type="demo", is_active=True)
        doc = pl.model_dump()
        async with conn.transaction():
            await conn.execute("UPDATE playlists SET is_active = false")
            await conn.execute('''
                INSERT INTO playlists (id, name, type, is_active)
                VALUES ($1::uuid, $2, $3, $4)
            ''', doc["id"], doc["name"], doc["type"], True)
        return doc


# ---------------------- Account info ---------------------- #

@api.get("/account/info")
async def account_info():
    pl = await get_active_playlist()
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
    if pl["type"] == "demo":
        return demo_account_info()
    if pl["type"] == "xtream":
        client = xtream_from_playlist(pl)
        try:
            return await client.account_info()
        except Exception as e:
            raise HTTPException(status_code=502, detail=str(e)) from e
    if pl["type"] == "m3u":
        items = parse_m3u(pl.get("m3u_content", "") or "")
        return {
            "user_info": {"username": pl["name"], "status": "Active", "max_connections": "1", "active_cons": "1"},
            "server_info": {"url": pl.get("m3u_url") or "local", "timezone": "UTC"},
            "channels_count": len(items),
        }
    raise HTTPException(status_code=400, detail="Unknown playlist type")


# ---------------------- Categories / Streams ---------------------- #

def _filter_demo_by_category(items: list[dict[str, Any]], category_id: Optional[str]) -> list[dict[str, Any]]:
    if not category_id or category_id == "all":
        return items
    return [it for it in items if it.get("category_id") == category_id]


@api.get("/content/categories/{content_type}")
async def get_categories(content_type: str):
    if content_type not in ("live", "vod", "series"):
        raise HTTPException(status_code=400, detail="Invalid content type")
    pl = await get_active_playlist()
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
    if pl["type"] == "demo":
        return DEMO_CATEGORIES[content_type]
    if pl["type"] == "xtream":
        client = xtream_from_playlist(pl)
        try:
            return await client.categories(content_type)
        except Exception as e:
            raise HTTPException(status_code=502, detail=str(e)) from e
    if pl["type"] == "m3u":
        items = parse_m3u(pl.get("m3u_content", "") or "")
        seen: dict[str, str] = {}
        for it in items:
            seen.setdefault(it["category_id"], it["category_name"])
        return [{"category_id": k, "category_name": v} for k, v in seen.items()]
    return []


@api.get("/content/streams/{content_type}")
async def get_streams(content_type: str, category_id: Optional[str] = None):
    if content_type not in ("live", "vod", "series"):
        raise HTTPException(status_code=400, detail="Invalid content type")
    pl = await get_active_playlist()
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
    if pl["type"] == "demo":
        source = {"live": DEMO_LIVE_CHANNELS, "vod": DEMO_MOVIES, "series": DEMO_SERIES}[content_type]
        return _filter_demo_by_category(source, category_id)
    if pl["type"] == "xtream":
        client = xtream_from_playlist(pl)
        try:
            data = await client.streams(content_type, category_id)
        except Exception as e:
            raise HTTPException(status_code=502, detail=str(e)) from e
        for it in data:
            sid = it.get("stream_id") or it.get("series_id")
            if not sid:
                continue
            if content_type == "live":
                it["stream_url"] = client.live_stream_url(sid)
            elif content_type == "vod":
                ext = it.get("container_extension") or "mp4"
                it["stream_url"] = client.vod_stream_url(sid, ext=ext)
        return data
    if pl["type"] == "m3u":
        if content_type != "live":
            return []
        items = parse_m3u(pl.get("m3u_content", "") or "")
        return _filter_demo_by_category(items, category_id)
    return []


# ---------------------- Details ---------------------- #

@api.get("/content/movie/{movie_id}")
async def get_movie_details(movie_id: str):
    pl = await get_active_playlist()
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
    if pl["type"] == "demo":
        for m in DEMO_MOVIES:
            if m["stream_id"] == movie_id:
                return m
        raise HTTPException(status_code=404, detail="Movie not found")
    if pl["type"] == "xtream":
        client = xtream_from_playlist(pl)
        info = await client.vod_info(movie_id)
        info["stream_url"] = client.vod_stream_url(movie_id)
        return info
    raise HTTPException(status_code=400, detail="Not supported for this playlist")


@api.get("/content/series/{series_id}")
async def get_series_details(series_id: str):
    pl = await get_active_playlist()
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
    if pl["type"] == "demo":
        for s in DEMO_SERIES:
            if s["series_id"] == series_id:
                return s
        raise HTTPException(status_code=404, detail="Series not found")
    if pl["type"] == "xtream":
        client = xtream_from_playlist(pl)
        info = await client.series_info(series_id)
        episodes = info.get("episodes", {}) or {}
        seasons = []
        for season_num, eps in episodes.items():
            ep_list = []
            for ep in eps:
                eid = ep.get("id")
                ep_list.append({
                    **ep,
                    "stream_url": client.series_stream_url(eid, ext=ep.get("container_extension", "mp4")),
                })
            seasons.append({"season_number": int(season_num), "episodes": ep_list})
        info["seasons"] = seasons
        return info
    raise HTTPException(status_code=400, detail="Not supported for this playlist")


# ---------------------- EPG ---------------------- #

@api.get("/content/epg/{stream_id}")
async def get_epg(stream_id: str, limit: int = 12):
    pl = await get_active_playlist()
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
    if pl["type"] == "demo":
        return {"epg_listings": demo_epg(stream_id)[:limit]}
    if pl["type"] == "xtream":
        client = xtream_from_playlist(pl)
        try:
            return await client.short_epg(stream_id, limit)
        except Exception as e:
            raise HTTPException(status_code=502, detail=str(e)) from e
    return {"epg_listings": []}


# ---------------------- Stream URL builder ---------------------- #

@api.get("/content/stream-url")
async def stream_url(content_type: str, content_id: str, ext: Optional[str] = None, start_time: Optional[str] = None, duration: Optional[int] = None):
    pl = await get_active_playlist()
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
    if pl["type"] == "demo":
        if content_type == "live" or content_type == "catchup":
            for c in DEMO_LIVE_CHANNELS:
                if c["stream_id"] == content_id:
                    return {"url": c["stream_url"]}
        if content_type == "vod":
            for m in DEMO_MOVIES:
                if m["stream_id"] == content_id:
                    return {"url": m["stream_url"]}
        if content_type == "episode":
            for s in DEMO_SERIES:
                for season in s["seasons"]:
                    for ep in season["episodes"]:
                        if ep["id"] == content_id:
                            return {"url": ep["stream_url"]}
        raise HTTPException(status_code=404, detail="Stream not found")
    if pl["type"] == "xtream":
        client = xtream_from_playlist(pl)
        if content_type == "live":
            return {"url": client.live_stream_url(content_id, ext or "m3u8")}
        if content_type == "catchup":
            if not start_time or not duration:
                raise HTTPException(status_code=400, detail="start_time and duration required for catchup")
            return {"url": client.timeshift_stream_url(content_id, start_time, duration, ext or "m3u8")}
        if content_type == "vod":
            return {"url": client.vod_stream_url(content_id, ext or "mp4")}
        if content_type == "episode":
            return {"url": client.series_stream_url(content_id, ext or "mp4")}
    if pl["type"] == "m3u":
        items = parse_m3u(pl.get("m3u_content", "") or "")
        for it in items:
            if it["stream_id"] == content_id:
                return {"url": it["stream_url"]}
    raise HTTPException(status_code=404, detail="Stream not found")


# ---------------------- Stream Proxy (CORS workaround) ---------------------- #

@api.get("/proxy/stream")
async def proxy_stream(url: str = Query(...)):
    """Reverse-proxy a remote stream/playlist to bypass CORS for the browser."""
    async def gen():
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            async with client.stream("GET", url) as r:
                r.raise_for_status()
                async for chunk in r.aiter_bytes():
                    yield chunk

    try:
        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
            head = await client.head(url)
            ct = head.headers.get("content-type", "application/octet-stream")
    except Exception:
        ct = "application/octet-stream"

    headers = {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
    }
    return StreamingResponse(gen(), media_type=ct, headers=headers)


# ---------------------- Favorites ---------------------- #

@api.get("/user/favorites")
async def list_favorites(profile_id: str = "default"):
    if not db_pool:
        return []
    async with db_pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM favorites WHERE profile_id = $1 ORDER BY added_at DESC LIMIT 500", profile_id)
        docs = []
        for r in rows:
            d = dict(r)
            d["id"] = str(d["id"])
            if d.get("added_at"):
                d["added_at"] = d["added_at"].isoformat()
            docs.append(d)
        return docs


@api.post("/user/favorites")
async def add_favorite(payload: FavoriteCreate):
    async with db_pool.acquire() as conn:
        row = await conn.fetchrow('''
            INSERT INTO favorites (profile_id, content_type, content_id, content_data)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (profile_id, content_type, content_id) DO UPDATE SET added_at = now()
            RETURNING *
        ''', payload.profile_id, payload.content_type, payload.content_id, payload.content_data)
        d = dict(row)
        d["id"] = str(d["id"])
        if d.get("added_at"):
            d["added_at"] = d["added_at"].isoformat()
        return d


@api.delete("/user/favorites/{content_type}/{content_id}")
async def remove_favorite(content_type: str, content_id: str, profile_id: str = "default"):
    async with db_pool.acquire() as conn:
        await conn.execute("DELETE FROM favorites WHERE profile_id = $1 AND content_type = $2 AND content_id = $3", profile_id, content_type, content_id)
    return {"ok": True}


# ---------------------- Watch progress / Continue Watching ---------------------- #

@api.post("/user/progress")
async def upsert_progress(payload: ProgressUpdate):
    progress = (payload.position / payload.duration) if payload.duration else 0
    async with db_pool.acquire() as conn:
        await conn.execute('''
            INSERT INTO watch_progress (profile_id, content_type, content_id, position, duration, progress, content_data)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (profile_id, content_type, content_id) DO UPDATE SET 
                position = EXCLUDED.position,
                duration = EXCLUDED.duration,
                progress = EXCLUDED.progress,
                content_data = EXCLUDED.content_data,
                last_watched_at = now()
        ''', payload.profile_id, payload.content_type, payload.content_id, payload.position, payload.duration, progress, payload.content_data)
    return {"ok": True}


@api.get("/user/progress")
async def list_progress(profile_id: str = "default"):
    if not db_pool:
        return []
    async with db_pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM watch_progress WHERE profile_id = $1 ORDER BY last_watched_at DESC LIMIT 200", profile_id)
        docs = []
        for r in rows:
            d = dict(r)
            d["id"] = str(d["id"])
            if d.get("last_watched_at"):
                d["last_watched_at"] = d["last_watched_at"].isoformat()
            docs.append(d)
        return docs


@api.get("/user/continue-watching")
async def continue_watching(profile_id: str = "default"):
    if not db_pool:
        return []
    async with db_pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM watch_progress WHERE profile_id = $1 AND progress > 0.02 AND progress < 0.95 ORDER BY last_watched_at DESC LIMIT 50", profile_id)
        docs = []
        for r in rows:
            d = dict(r)
            d["id"] = str(d["id"])
            if d.get("last_watched_at"):
                d["last_watched_at"] = d["last_watched_at"].isoformat()
            docs.append(d)
        return docs


@api.delete("/user/progress/{content_type}/{content_id}")
async def delete_progress(content_type: str, content_id: str, profile_id: str = "default"):
    async with db_pool.acquire() as conn:
        await conn.execute("DELETE FROM watch_progress WHERE profile_id = $1 AND content_type = $2 AND content_id = $3", profile_id, content_type, content_id)
    return {"ok": True}


# ---------------------- Search ---------------------- #

@api.get("/content/recommendations")
async def get_recommendations(profile_id: str = "default"):
    pl = await get_active_playlist()
    if not pl:
        return []
    if pl["type"] == "demo":
        return DEMO_MOVIES[:5] + DEMO_SERIES[:5]
    if pl["type"] == "xtream":
        client = xtream_from_playlist(pl)
        try:
            # Just return some popular/recent VODs
            vods = await client.streams("vod")
            return vods[:12] if vods else []
        except Exception:
            return []
    return []


@api.get("/content/subtitles")
async def get_subtitles(title: str, language: str = "en"):
    try:
        video = subliminal.Video.fromname(title)
        subs = subliminal.download_best_subtitles([video], {Language(language)})
        if not subs or not subs.get(video):
            raise HTTPException(status_code=404, detail="No subtitles found")
        sub = subs[video][0]
        content = sub.content.decode("utf-8", errors="ignore")
        vtt = "WEBVTT\n\n"
        for line in content.splitlines():
            if "-->" in line:
                line = line.replace(",", ".")
            vtt += line + "\n"
        return PlainTextResponse(vtt, media_type="text/vtt", headers={"Access-Control-Allow-Origin": "*"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api.get("/content/search")
async def search_content(q: str = Query(..., min_length=1), profile_id: str = "default"):
    # Log search history
    if db_pool:
        async with db_pool.acquire() as conn:
            await conn.execute("INSERT INTO search_history (profile_id, query) VALUES ($1, $2)", profile_id, q)
            
    pl = await get_active_playlist()
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
    q_lower = q.lower()
    results: dict[str, list[Any]] = {"live": [], "movies": [], "series": []}
    if pl["type"] == "demo":
        results["live"] = [c for c in DEMO_LIVE_CHANNELS if q_lower in c["name"].lower()]
        results["movies"] = [m for m in DEMO_MOVIES if q_lower in m["name"].lower() or q_lower in m.get("genre", "").lower()]
        results["series"] = [s for s in DEMO_SERIES if q_lower in s["name"].lower() or q_lower in s.get("genre", "").lower()]
    elif pl["type"] == "xtream":
        client = xtream_from_playlist(pl)
        try:
            live = await client.streams("live")
            vod = await client.streams("vod")
            series = await client.streams("series")
            results["live"] = [c for c in live if q_lower in (c.get("name", "") or "").lower()][:50]
            results["movies"] = [m for m in vod if q_lower in (m.get("name", "") or "").lower()][:50]
            results["series"] = [s for s in series if q_lower in (s.get("name", "") or "").lower()][:50]
        except Exception as e:
            raise HTTPException(status_code=502, detail=str(e)) from e
    elif pl["type"] == "m3u":
        items = parse_m3u(pl.get("m3u_content", "") or "")
        results["live"] = [c for c in items if q_lower in c["name"].lower()]
    return results


@api.get("/user/searches")
async def get_search_history(profile_id: str = "default", limit: int = 10):
    if not db_pool:
        return []
    async with db_pool.acquire() as conn:
        rows = await conn.fetch("SELECT query FROM search_history WHERE profile_id = $1 ORDER BY searched_at DESC LIMIT $2", profile_id, limit)
        # Deduplicate while preserving order
        seen = set()
        history = []
        for r in rows:
            q = r["query"]
            if q not in seen:
                seen.add(q)
                history.append(q)
        return history

@api.delete("/user/searches")
async def clear_search_history(profile_id: str = "default"):
    if not db_pool:
        return {"ok": False}
    async with db_pool.acquire() as conn:
        await conn.execute("DELETE FROM search_history WHERE profile_id = $1", profile_id)
    return {"ok": True}

# ---------------------- Settings ---------------------- #

@api.get("/user/settings")
async def get_settings(profile_id: str = "default"):
    if not db_pool:
        return {}
    async with db_pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM settings WHERE profile_id = $1", profile_id)
        if not row:
            return {
                "profile_id": profile_id,
                "preferred_player": "hls",
                "buffer_size": 30,
                "hardware_acceleration": True,
                "subtitle_language": "en",
                "audio_language": "en",
                "autoplay_next": True,
                "preview_on_hover": True,
                "analytics": False,
                "parental_pin": None,
                "locked_categories": []
            }
        return dict(row)


@api.put("/user/settings")
async def update_settings(settings: dict[str, Any] = Body(...)):
    pid = settings.get("profile_id", "default")
    async with db_pool.acquire() as conn:
        await conn.execute('''
            INSERT INTO settings (profile_id, preferred_player, buffer_size, hardware_acceleration, subtitle_language, audio_language, autoplay_next, preview_on_hover, analytics, parental_pin, locked_categories)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (profile_id) DO UPDATE SET
                preferred_player = EXCLUDED.preferred_player,
                buffer_size = EXCLUDED.buffer_size,
                hardware_acceleration = EXCLUDED.hardware_acceleration,
                subtitle_language = EXCLUDED.subtitle_language,
                audio_language = EXCLUDED.audio_language,
                autoplay_next = EXCLUDED.autoplay_next,
                preview_on_hover = EXCLUDED.preview_on_hover,
                analytics = EXCLUDED.analytics,
                parental_pin = EXCLUDED.parental_pin,
                locked_categories = EXCLUDED.locked_categories
        ''', pid, settings.get("preferred_player", "hls"), settings.get("buffer_size", 30), settings.get("hardware_acceleration", True), settings.get("subtitle_language", "en"), settings.get("audio_language", "en"), settings.get("autoplay_next", True), settings.get("preview_on_hover", True), settings.get("analytics", False), settings.get("parental_pin"), settings.get("locked_categories", []))
        
        row = await conn.fetchrow("SELECT * FROM settings WHERE profile_id = $1", pid)
        return dict(row)


# ---------------------- Mount ---------------------- #

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
