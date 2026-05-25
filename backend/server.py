"""Maxx Player — FastAPI backend."""
from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, Body, FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware
import httpx

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

mongo_url = os.environ["MONGO_URL"]
mongo = AsyncIOMotorClient(mongo_url)
db = mongo[os.environ["DB_NAME"]]

app = FastAPI(title="Maxx Player API")
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

async def get_playlist(playlist_id: str) -> dict[str, Any]:
    pl = await db.playlists.find_one({"id": playlist_id}, {"_id": 0})
    if not pl:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return pl


def xtream_from_playlist(pl: dict[str, Any]) -> XtreamClient:
    if pl["type"] != "xtream":
        raise HTTPException(status_code=400, detail="Playlist is not an Xtream account")
    return XtreamClient(pl["server_url"], pl["username"], pl["password"])


# ---------------------- Health ---------------------- #

@api.get("/")
async def root():
    return {"app": "Maxx Player", "status": "ok"}


# ---------------------- Playlist management ---------------------- #

@api.post("/playlists", response_model=Playlist)
async def create_playlist(payload: PlaylistCreate):
    pl = Playlist(**payload.model_dump())
    doc = pl.model_dump()
    # Verify Xtream credentials before saving
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
        except Exception as e:  # noqa: BLE001
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
            except Exception as e:  # noqa: BLE001
                raise HTTPException(status_code=400, detail=f"Cannot fetch M3U URL: {e}") from e
    # Deactivate other playlists
    await db.playlists.update_many({}, {"$set": {"is_active": False}})
    doc["is_active"] = True
    await db.playlists.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.get("/playlists")
async def list_playlists():
    docs = await db.playlists.find({}, {"_id": 0}).to_list(100)
    # Don't leak passwords
    for d in docs:
        if d.get("password"):
            d["password_masked"] = "•" * 8
    return docs


@api.get("/playlists/active")
async def get_active_playlist():
    pl = await db.playlists.find_one({"is_active": True}, {"_id": 0})
    if not pl:
        return None
    return pl


@api.post("/playlists/{playlist_id}/activate")
async def activate_playlist(playlist_id: str):
    pl = await get_playlist(playlist_id)
    await db.playlists.update_many({}, {"$set": {"is_active": False}})
    await db.playlists.update_one({"id": playlist_id}, {"$set": {"is_active": True}})
    return {"ok": True, "active": pl["id"]}


@api.delete("/playlists/{playlist_id}")
async def delete_playlist(playlist_id: str):
    r = await db.playlists.delete_one({"id": playlist_id})
    if r.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return {"ok": True}


# ---------------------- Demo seed ---------------------- #

@api.post("/playlists/demo")
async def create_demo_playlist():
    existing = await db.playlists.find_one({"type": "demo"}, {"_id": 0})
    if existing:
        await db.playlists.update_many({}, {"$set": {"is_active": False}})
        await db.playlists.update_one({"id": existing["id"]}, {"$set": {"is_active": True}})
        existing["is_active"] = True
        return existing
    pl = Playlist(name="Maxx Demo Library", type="demo", is_active=True)
    doc = pl.model_dump()
    await db.playlists.update_many({}, {"$set": {"is_active": False}})
    await db.playlists.insert_one(doc)
    doc.pop("_id", None)
    return doc


# ---------------------- Account info ---------------------- #

@api.get("/account/info")
async def account_info():
    pl = await db.playlists.find_one({"is_active": True}, {"_id": 0})
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
    if pl["type"] == "demo":
        return demo_account_info()
    if pl["type"] == "xtream":
        client = xtream_from_playlist(pl)
        try:
            return await client.account_info()
        except Exception as e:  # noqa: BLE001
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
    pl = await db.playlists.find_one({"is_active": True}, {"_id": 0})
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
    if pl["type"] == "demo":
        return DEMO_CATEGORIES[content_type]
    if pl["type"] == "xtream":
        client = xtream_from_playlist(pl)
        try:
            return await client.categories(content_type)
        except Exception as e:  # noqa: BLE001
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
    pl = await db.playlists.find_one({"is_active": True}, {"_id": 0})
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
    if pl["type"] == "demo":
        source = {"live": DEMO_LIVE_CHANNELS, "vod": DEMO_MOVIES, "series": DEMO_SERIES}[content_type]
        # Add playable URL helper
        return _filter_demo_by_category(source, category_id)
    if pl["type"] == "xtream":
        client = xtream_from_playlist(pl)
        try:
            data = await client.streams(content_type, category_id)
        except Exception as e:  # noqa: BLE001
            raise HTTPException(status_code=502, detail=str(e)) from e
        # Inject computed stream URL for ease of use
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
    pl = await db.playlists.find_one({"is_active": True}, {"_id": 0})
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
    pl = await db.playlists.find_one({"is_active": True}, {"_id": 0})
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
    pl = await db.playlists.find_one({"is_active": True}, {"_id": 0})
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
    if pl["type"] == "demo":
        return {"epg_listings": demo_epg(stream_id)[:limit]}
    if pl["type"] == "xtream":
        client = xtream_from_playlist(pl)
        try:
            return await client.short_epg(stream_id, limit)
        except Exception as e:  # noqa: BLE001
            raise HTTPException(status_code=502, detail=str(e)) from e
    return {"epg_listings": []}


# ---------------------- Stream URL builder ---------------------- #

@api.get("/content/stream-url")
async def stream_url(content_type: str, content_id: str, ext: Optional[str] = None):
    pl = await db.playlists.find_one({"is_active": True}, {"_id": 0})
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
    if pl["type"] == "demo":
        # Pull from demo data
        if content_type == "live":
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

    # Probe headers
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
    docs = await db.favorites.find({"profile_id": profile_id}, {"_id": 0}).to_list(500)
    return docs


@api.post("/user/favorites")
async def add_favorite(payload: FavoriteCreate):
    existing = await db.favorites.find_one(
        {"profile_id": payload.profile_id, "content_id": payload.content_id, "content_type": payload.content_type},
        {"_id": 0},
    )
    if existing:
        return existing
    doc = {
        "id": str(uuid.uuid4()),
        "profile_id": payload.profile_id,
        "content_type": payload.content_type,
        "content_id": payload.content_id,
        "content_data": payload.content_data,
        "added_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.favorites.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.delete("/user/favorites/{content_type}/{content_id}")
async def remove_favorite(content_type: str, content_id: str, profile_id: str = "default"):
    await db.favorites.delete_one({"profile_id": profile_id, "content_type": content_type, "content_id": content_id})
    return {"ok": True}


# ---------------------- Watch progress / Continue Watching ---------------------- #

@api.post("/user/progress")
async def upsert_progress(payload: ProgressUpdate):
    doc = {
        "profile_id": payload.profile_id,
        "content_type": payload.content_type,
        "content_id": payload.content_id,
        "position": payload.position,
        "duration": payload.duration,
        "progress": (payload.position / payload.duration) if payload.duration else 0,
        "content_data": payload.content_data,
        "last_watched_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.watch_progress.update_one(
        {"profile_id": payload.profile_id, "content_type": payload.content_type, "content_id": payload.content_id},
        {"$set": doc, "$setOnInsert": {"id": str(uuid.uuid4())}},
        upsert=True,
    )
    return {"ok": True}


@api.get("/user/progress")
async def list_progress(profile_id: str = "default"):
    docs = await db.watch_progress.find({"profile_id": profile_id}, {"_id": 0}).sort("last_watched_at", -1).to_list(200)
    return docs


@api.get("/user/continue-watching")
async def continue_watching(profile_id: str = "default"):
    docs = await db.watch_progress.find(
        {"profile_id": profile_id, "progress": {"$gt": 0.02, "$lt": 0.95}},
        {"_id": 0},
    ).sort("last_watched_at", -1).to_list(50)
    return docs


@api.delete("/user/progress/{content_type}/{content_id}")
async def delete_progress(content_type: str, content_id: str, profile_id: str = "default"):
    await db.watch_progress.delete_one({"profile_id": profile_id, "content_type": content_type, "content_id": content_id})
    return {"ok": True}


# ---------------------- Search ---------------------- #

@api.get("/content/search")
async def search_content(q: str = Query(..., min_length=1)):
    pl = await db.playlists.find_one({"is_active": True}, {"_id": 0})
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
        except Exception as e:  # noqa: BLE001
            raise HTTPException(status_code=502, detail=str(e)) from e
    elif pl["type"] == "m3u":
        items = parse_m3u(pl.get("m3u_content", "") or "")
        results["live"] = [c for c in items if q_lower in c["name"].lower()]
    return results


# ---------------------- Settings ---------------------- #

@api.get("/user/settings")
async def get_settings(profile_id: str = "default"):
    s = await db.settings.find_one({"profile_id": profile_id}, {"_id": 0})
    if not s:
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
        }
    return s


@api.put("/user/settings")
async def update_settings(settings: dict[str, Any] = Body(...)):
    pid = settings.get("profile_id", "default")
    settings["profile_id"] = pid
    await db.settings.update_one({"profile_id": pid}, {"$set": settings}, upsert=True)
    s = await db.settings.find_one({"profile_id": pid}, {"_id": 0})
    return s


# ---------------------- Mount ---------------------- #

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    mongo.close()
