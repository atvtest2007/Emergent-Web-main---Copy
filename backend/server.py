"""Maxx Player — FastAPI backend."""
from __future__ import annotations

import asyncio
import logging
import os
import sys
import uuid
import json
import hashlib
import secrets
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional
from contextlib import asynccontextmanager
from urllib.parse import urljoin, quote

from dotenv import load_dotenv
from fastapi import APIRouter, Body, FastAPI, HTTPException, Query, Request, Response, Header, Depends
from fastapi.responses import StreamingResponse
import aiosqlite
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
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

if getattr(sys, 'frozen', False):
    # Running as PyInstaller bundle
    # Store user data in %APPDATA%\Maxx Player
    app_data_path = Path(os.environ.get('APPDATA', Path.home())) / 'Maxx Player'
    app_data_path.mkdir(parents=True, exist_ok=True)
    ROOT_DIR = app_data_path
    ASSETS_DIR = Path(sys._MEIPASS)
else:
    # Running natively
    ROOT_DIR = Path(__file__).parent
    ASSETS_DIR = ROOT_DIR

_stream_cache = {}
_category_cache = {}
proxy_client: httpx.AsyncClient = None
load_dotenv(ASSETS_DIR / ".env")

DB_PATH = ROOT_DIR / "maxx.sqlite"

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("PRAGMA journal_mode=WAL;")
        await db.execute("PRAGMA synchronous=NORMAL;")
        await db.execute("PRAGMA temp_store=MEMORY;")
        await db.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE,
                password_hash TEXT,
                token TEXT,
                created_at TEXT
            )
        ''')
        await db.execute('''
            CREATE TABLE IF NOT EXISTS playlists (
                id TEXT PRIMARY KEY,
                profile_id TEXT,
                is_active INTEGER,
                type TEXT,
                data TEXT
            )
        ''')
        await db.execute('''
            CREATE TABLE IF NOT EXISTS favorites (
                id TEXT PRIMARY KEY,
                profile_id TEXT,
                playlist_id TEXT,
                content_type TEXT,
                content_id TEXT,
                data TEXT
            )
        ''')
        await db.execute('''
            CREATE TABLE IF NOT EXISTS watch_progress (
                id TEXT PRIMARY KEY,
                profile_id TEXT,
                playlist_id TEXT,
                content_type TEXT,
                content_id TEXT,
                progress REAL,
                last_watched_at TEXT,
                data TEXT
            )
        ''')
        await db.execute('''
            CREATE TABLE IF NOT EXISTS settings (
                profile_id TEXT PRIMARY KEY,
                data TEXT
            )
        ''')
        await db.execute('''
            CREATE TABLE IF NOT EXISTS tenant_branding (
                domain TEXT PRIMARY KEY,
                brand_name TEXT,
                primary_color TEXT,
                logo_url TEXT,
                favicon_url TEXT,
                watermark_url TEXT,
                language TEXT,
                data TEXT
            )
        ''')
        
        # Add playlist_id to existing tables if missing
        try:
            await db.execute("ALTER TABLE favorites ADD COLUMN playlist_id TEXT")
        except Exception:
            pass
        try:
            await db.execute("ALTER TABLE watch_progress ADD COLUMN playlist_id TEXT")
        except Exception:
            pass
        
        
        # Add profile_id to playlists if missing
        try:
            await db.execute("ALTER TABLE playlists ADD COLUMN profile_id TEXT")
            # For legacy data migration, link existing playlists to profile_id='default' temporarily
            await db.execute("UPDATE playlists SET profile_id = 'default' WHERE profile_id IS NULL")
        except Exception:
            pass

        # MASSIVE DATA OPTIMIZATION TABLES
        await db.execute('''
            CREATE TABLE IF NOT EXISTS categories (
                id TEXT,
                playlist_id TEXT,
                type TEXT,
                name TEXT,
                data TEXT,
                PRIMARY KEY(id, playlist_id, type)
            )
        ''')
        await db.execute('''
            CREATE TABLE IF NOT EXISTS streams (
                id TEXT,
                playlist_id TEXT,
                type TEXT,
                category_id TEXT,
                name TEXT,
                stream_url TEXT,
                data TEXT,
                PRIMARY KEY(id, playlist_id, type)
            )
        ''')
        
        await db.execute('CREATE INDEX IF NOT EXISTS idx_cat_type ON categories(playlist_id, type)')
        await db.execute('CREATE INDEX IF NOT EXISTS idx_str_type_cat ON streams(playlist_id, type, category_id)')
        await db.execute('CREATE INDEX IF NOT EXISTS idx_str_name ON streams(name)')
        
        await db.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    global proxy_client
    await init_db()
    limits = httpx.Limits(max_connections=1000, max_keepalive_connections=100)
    proxy_client = httpx.AsyncClient(timeout=30.0, follow_redirects=True, limits=limits)
    yield
    await proxy_client.aclose()

app = FastAPI(title="Maxx Player API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT data FROM playlists WHERE id = ?", (playlist_id,)) as cursor:
            row = await cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Playlist not found")
            return json.loads(row[0])


async def get_active_playlist_internal(request_playlist_id: Optional[str] = None, profile_id: str = "default") -> Optional[dict[str, Any]]:
    async with aiosqlite.connect(DB_PATH) as db:
        if request_playlist_id:
            async with db.execute("SELECT data FROM playlists WHERE id = ?", (request_playlist_id,)) as cursor:
                row = await cursor.fetchone()
                if row:
                    return json.loads(row[0])
        async with db.execute("SELECT data FROM playlists WHERE profile_id = ? AND is_active = 1 LIMIT 1", (profile_id,)) as cursor:
            row = await cursor.fetchone()
            if not row:
                return None
            return json.loads(row[0])


def xtream_from_playlist(pl: dict[str, Any]) -> XtreamClient:
    if pl["type"] != "xtream":
        raise HTTPException(status_code=400, detail="Playlist is not an Xtream account")
    return XtreamClient(pl["server_url"], pl["username"], pl["password"], client=proxy_client)


def clear_cache():
    _stream_cache.clear()
    _category_cache.clear()

@api.get("/branding")
async def get_branding(request: Request):
    domain = request.headers.get("host", "localhost").split(":")[0]
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT * FROM tenant_branding WHERE domain = ?", (domain,)) as cursor:
            row = await cursor.fetchone()
            if row:
                return {
                    "domain": row[0],
                    "brand_name": row[1],
                    "primary_color": row[2],
                    "logo_url": row[3],
                    "favicon_url": row[4],
                    "watermark_url": row[5],
                    "language": row[6],
                    "data": json.loads(row[7] if row[7] else "{}")
                }
    return {"brand_name": "Emergent", "primary_color": "#E50914"} # Default fallback

class BrandingConfig(BaseModel):
    domain: str
    brand_name: Optional[str] = None
    primary_color: Optional[str] = None
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    watermark_url: Optional[str] = None
    language: Optional[str] = "en"
    data: Optional[dict] = {}

@api.post("/admin/branding")
async def update_branding(data: BrandingConfig):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute('''
            INSERT OR REPLACE INTO tenant_branding 
            (domain, brand_name, primary_color, logo_url, favicon_url, watermark_url, language, data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.domain, data.brand_name, data.primary_color, 
            data.logo_url, data.favicon_url, data.watermark_url, 
            data.language, json.dumps(data.data or {})
        ))
        await db.commit()
    return {"status": "ok"}

# ---------------------- System Endpoints ---------------------- #

# ---------------------- Sync Engine ---------------------- #

def _process_xtream_streams(c_type, streams, playlist_id, client):
    rows = []
    if not streams:
        return rows
    for s in streams:
        sid = str(s.get("stream_id") or s.get("series_id"))
        name = s.get("name", "")
        cid = str(s.get("category_id", ""))
        if c_type == "live":
            surl = client.live_stream_url(sid)
        elif c_type == "vod":
            ext = s.get("container_extension") or "mp4"
            surl = client.vod_stream_url(sid, ext=ext)
        else:
            surl = client.series_stream_url(sid)
        s["stream_url"] = surl
        rows.append((sid, playlist_id, c_type, cid, name, surl, json.dumps(s)))
    return rows

def _process_m3u(m3u_content, playlist_id):
    items = parse_m3u(m3u_content)
    seen_cats = {}
    for it in items:
        cid = it.get("category_id", "all")
        cname = it.get("category_name", "All")
        seen_cats[cid] = cname
    c_rows = [(cid, playlist_id, "live", cname, json.dumps({"category_id": cid, "category_name": cname})) for cid, cname in seen_cats.items()]
    s_rows = []
    for it in items:
        sid = str(it.get("stream_id", uuid.uuid4()))
        cid = str(it.get("category_id", "all"))
        name = it.get("name", "")
        surl = it.get("stream_url", "")
        it["stream_id"] = sid
        s_rows.append((sid, playlist_id, "live", cid, name, surl, json.dumps(it)))
    return c_rows, s_rows

async def run_sync_playlist(playlist_id: str):
    clear_cache()
    pl = await get_playlist(playlist_id)
    if not pl:
        return
        
    async with aiosqlite.connect(DB_PATH) as db:
        # Clear old items for this playlist
        await db.execute("DELETE FROM categories WHERE playlist_id = ?", (playlist_id,))
        await db.execute("DELETE FROM streams WHERE playlist_id = ?", (playlist_id,))
        await db.commit()
        
        if pl["type"] == "xtream":
            client = xtream_from_playlist(pl)
            try:
                # Concurrent fetch of categories
                cat_tasks = [client.categories(c) for c in ["live", "vod", "series"]]
                cat_results = await asyncio.gather(*cat_tasks, return_exceptions=True)
                
                for c_type, result in zip(["live", "vod", "series"], cat_results):
                    if isinstance(result, Exception):
                        log.warning(f"Failed to fetch {c_type} categories: {result}")
                    elif result:
                        await db.executemany(
                            "INSERT OR IGNORE INTO categories (id, playlist_id, type, name, data) VALUES (?, ?, ?, ?, ?)",
                            [(str(c.get("category_id")), playlist_id, c_type, c.get("category_name", ""), json.dumps(c)) for c in result]
                        )
                
                # Concurrent fetch of streams
                stream_tasks = [client.streams(c) for c in ["live", "vod", "series"]]
                stream_results = await asyncio.gather(*stream_tasks, return_exceptions=True)
                
                for c_type, result in zip(["live", "vod", "series"], stream_results):
                    if isinstance(result, Exception):
                        log.warning(f"Failed to fetch {c_type} streams: {result}")
                    elif result:
                        rows = await asyncio.to_thread(_process_xtream_streams, c_type, result, playlist_id, client)
                        for i in range(0, len(rows), 5000):
                            await db.executemany(
                                "INSERT OR IGNORE INTO streams (id, playlist_id, type, category_id, name, stream_url, data) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                rows[i:i+5000]
                            )
            except Exception as e:
                log.error(f"Sync failed for xtream {playlist_id}: {e}")
                
        elif pl["type"] == "m3u":
            try:
                c_rows, s_rows = await asyncio.to_thread(_process_m3u, pl.get("m3u_content", "") or "", playlist_id)
                await db.executemany("INSERT OR IGNORE INTO categories (id, playlist_id, type, name, data) VALUES (?, ?, ?, ?, ?)", c_rows)
                for i in range(0, len(s_rows), 5000):
                    await db.executemany(
                        "INSERT OR IGNORE INTO streams (id, playlist_id, type, category_id, name, stream_url, data) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        s_rows[i:i+5000]
                    )
                pl["m3u_content"] = ""
                await db.execute("UPDATE playlists SET data = ? WHERE id = ?", (json.dumps(pl), playlist_id))
            except Exception as e:
                log.error(f"Sync failed for m3u {playlist_id}: {e}")
                
        elif pl["type"] == "demo":
            try:
                for c_type in ["live", "vod", "series"]:
                    cats = DEMO_CATEGORIES.get(c_type, [])
                    await db.executemany(
                        "INSERT OR IGNORE INTO categories (id, playlist_id, type, name, data) VALUES (?, ?, ?, ?, ?)",
                        [(str(c.get("category_id")), playlist_id, c_type, c.get("category_name"), json.dumps(c)) for c in cats]
                    )
                
                for c_type, source in [("live", DEMO_LIVE_CHANNELS), ("vod", DEMO_MOVIES), ("series", DEMO_SERIES)]:
                    rows = []
                    for s in source:
                        sid = str(s.get("stream_id") or s.get("series_id"))
                        name = s.get("name", "")
                        cid = str(s.get("category_id", ""))
                        surl = s.get("stream_url", "")
                        rows.append((sid, playlist_id, c_type, cid, name, surl, json.dumps(s)))
                    await db.executemany(
                        "INSERT OR IGNORE INTO streams (id, playlist_id, type, category_id, name, stream_url, data) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        rows
                    )
            except Exception as e:
                log.error(f"Sync failed for demo {playlist_id}: {e}")
                
        await db.commit()

@api.post("/playlists/{playlist_id}/sync")
async def start_sync(playlist_id: str):
    pl = await get_playlist(playlist_id)
    # Fire and forget
    asyncio.create_task(run_sync_playlist(playlist_id))
    return {"ok": True, "message": "Syncing started in background"}


# ---------------------- Health ---------------------- #

@api.get("/")
async def root():
    return {"app": "Maxx Player", "status": "ok"}



# ---------------------- Auth Models & Logic ---------------------- #

from datetime import datetime, timezone
import uuid

class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: str
    username: str
    created_at: str

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    token = authorization.split(" ")[1]
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT id, username, created_at FROM users WHERE token = ?", (token,)) as cursor:
            row = await cursor.fetchone()
            if not row:
                raise HTTPException(status_code=401, detail="Invalid token")
            return {"id": row[0], "username": row[1], "created_at": row[2]}

@api.post("/auth/register")
async def register(payload: UserRegister):
    async with aiosqlite.connect(DB_PATH) as db:
        # Check if first user
        async with db.execute("SELECT COUNT(*) FROM users") as cursor:
            count = (await cursor.fetchone())[0]
            
        async with db.execute("SELECT id FROM users WHERE username = ?", (payload.username,)) as cursor:
            if await cursor.fetchone():
                raise HTTPException(status_code=400, detail="Username already exists")
                
        user_id = str(uuid.uuid4())
        token = secrets.token_hex(32)
        now = datetime.now(timezone.utc).isoformat()
        
        await db.execute(
            "INSERT INTO users (id, username, password_hash, token, created_at) VALUES (?, ?, ?, ?, ?)",
            (user_id, payload.username, hash_password(payload.password), token, now)
        )
        
        if count == 0:
            await db.execute("UPDATE playlists SET profile_id = ? WHERE profile_id = 'default' OR profile_id IS NULL", (user_id,))
            await db.execute("UPDATE favorites SET profile_id = ? WHERE profile_id = 'default'", (user_id,))
            await db.execute("UPDATE watch_progress SET profile_id = ? WHERE profile_id = 'default'", (user_id,))
            
        await db.commit()
        return {"token": token, "user": {"id": user_id, "username": payload.username, "created_at": now}}

@api.post("/auth/login")
async def login(payload: UserLogin):
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT id, password_hash, username, created_at FROM users WHERE username = ?", (payload.username,)) as cursor:
            row = await cursor.fetchone()
            if not row or row[1] != hash_password(payload.password):
                raise HTTPException(status_code=401, detail="Invalid username or password")
            
            token = secrets.token_hex(32)
            await db.execute("UPDATE users SET token = ? WHERE id = ?", (token, row[0]))
            await db.commit()
            return {"token": token, "user": {"id": row[0], "username": row[2], "created_at": row[3]}}

@api.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user
    

# ---------------------- Playlist management ---------------------- #

@api.post("/playlists", response_model=Playlist)
async def create_playlist(payload: PlaylistCreate, profile_id: str = "default"):
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
                
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("UPDATE playlists SET is_active = 0 WHERE profile_id = ?", (profile_id,))
        doc["is_active"] = True
        await db.execute(
            "INSERT INTO playlists (id, profile_id, is_active, type, data) VALUES (?, ?, ?, ?, ?)",
            (pl.id, profile_id, 1, pl.type, json.dumps(doc))
        )
        
        async with db.execute("SELECT id, data FROM playlists") as cursor:
            for row_id, data_str in await cursor.fetchall():
                if row_id == pl.id: continue
                data = json.loads(data_str)
                data["is_active"] = False
                await db.execute("UPDATE playlists SET data = ? WHERE id = ?", (json.dumps(data), row_id))
                
        await db.commit()
    
    # Synchronously await the sync after creating the playlist to prevent race conditions on frontend
    await run_sync_playlist(pl.id)
    
    doc.pop("_id", None)
    return doc


@api.get("/playlists")
async def list_playlists(profile_id: str = "default"):
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT data FROM playlists WHERE profile_id = ?", (profile_id,)) as cursor:
            docs = [json.loads(row[0]) for row in await cursor.fetchall()]
    for d in docs:
        if d.get("password"):
            d["password_masked"] = "•" * 8
    return docs


@api.get("/playlists/active")
async def get_active_playlist(playlist_id: Optional[str] = Header(None, alias='X-Playlist-ID')):
    pl = await get_active_playlist_internal(playlist_id)
    return pl


@api.post("/playlists/{playlist_id}/activate")
async def activate_playlist(playlist_id: str, profile_id: str = "default"):
    pl = await get_playlist(playlist_id)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("UPDATE playlists SET is_active = 0 WHERE profile_id = ?", (profile_id,))
        await db.execute("UPDATE playlists SET is_active = 1 WHERE id = ? AND profile_id = ?", (playlist_id, profile_id))
        async with db.execute("SELECT id, data FROM playlists") as cursor:
            for row_id, data_str in await cursor.fetchall():
                data = json.loads(data_str)
                data["is_active"] = (row_id == playlist_id)
                await db.execute("UPDATE playlists SET data = ? WHERE id = ?", (json.dumps(data), row_id))
        await db.commit()
    clear_cache()
    return {"ok": True, "active": pl["id"]}


@api.delete("/playlists/{playlist_id}")
async def delete_playlist(playlist_id: str, profile_id: str = "default"):
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("DELETE FROM playlists WHERE id = ?", (playlist_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Playlist not found")
        # Clean up synced items
        await db.execute("DELETE FROM categories WHERE playlist_id = ?", (playlist_id,))
        await db.execute("DELETE FROM streams WHERE playlist_id = ?", (playlist_id,))
        await db.commit()
    clear_cache()
    return {"ok": True}


# ---------------------- Demo seed ---------------------- #

@api.post("/playlists/demo")
async def create_demo_playlist(profile_id: str = "default"):
    pl_id = None
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT data FROM playlists WHERE type = 'demo' LIMIT 1") as cursor:
            row = await cursor.fetchone()
            if row:
                existing = json.loads(row[0])
                pl_id = existing["id"]
                await db.execute("UPDATE playlists SET is_active = 0 WHERE profile_id = ?", (profile_id,))
                await db.execute("UPDATE playlists SET is_active = 1 WHERE id = ? AND profile_id = ?", (existing["id"], profile_id))
                async with db.execute("SELECT id, data FROM playlists") as cursor2:
                    for row_id, data_str in await cursor2.fetchall():
                        data = json.loads(data_str)
                        data["is_active"] = (row_id == existing["id"])
                        await db.execute("UPDATE playlists SET data = ? WHERE id = ?", (json.dumps(data), row_id))
                await db.commit()
                existing["is_active"] = True
                clear_cache()
                await run_sync_playlist(pl_id)
                return existing
                
        pl = Playlist(name="Maxx Demo Library", type="demo", is_active=True)
        doc = pl.model_dump()
        pl_id = pl.id
        await db.execute("UPDATE playlists SET is_active = 0 WHERE profile_id = ?", (profile_id,))
        
        async with db.execute("SELECT id, data FROM playlists") as cursor2:
            for row_id, data_str in await cursor2.fetchall():
                data = json.loads(data_str)
                data["is_active"] = False
                await db.execute("UPDATE playlists SET data = ? WHERE id = ?", (json.dumps(data), row_id))
                
        await db.execute(
            "INSERT INTO playlists (id, profile_id, is_active, type, data) VALUES (?, ?, ?, ?, ?)",
            (pl.id, profile_id, 1, pl.type, json.dumps(doc))
        )
        await db.commit()
        doc.pop("_id", None)
        clear_cache()
        await run_sync_playlist(pl_id)
        return doc


# ---------------------- Account info ---------------------- #

@api.get("/account/info")
async def account_info(playlist_id: Optional[str] = Header(None, alias='X-Playlist-ID')):
    pl = await get_active_playlist_internal(playlist_id)
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
        async with aiosqlite.connect(DB_PATH) as db:
            async with db.execute("SELECT COUNT(*) FROM streams WHERE playlist_id = ?", (pl["id"],)) as cursor:
                count = (await cursor.fetchone())[0]
        return {
            "user_info": {"username": pl["name"], "status": "Active", "max_connections": "1", "active_cons": "1"},
            "server_info": {"url": pl.get("m3u_url") or "local", "timezone": "UTC"},
            "channels_count": count,
        }
    raise HTTPException(status_code=400, detail="Unknown playlist type")


# ---------------------- Categories / Streams ---------------------- #

@api.get("/content/categories/{content_type}")
async def get_categories(content_type: str, playlist_id: Optional[str] = Header(None, alias='X-Playlist-ID')):
    if content_type not in ("live", "vod", "series"):
        raise HTTPException(status_code=400, detail="Invalid content type")
    pl = await get_active_playlist_internal(playlist_id)
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
        
    cache_key = (pl["id"], content_type)
    if cache_key in _category_cache:
        return Response(content=_category_cache[cache_key], media_type="application/json")
        
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT json_group_array(json(data)) FROM categories WHERE playlist_id = ? AND type = ?", 
            (pl["id"], content_type)
        ) as cursor:
            row = await cursor.fetchone()
            result = row[0] if row and row[0] else "[]"
            _category_cache[cache_key] = result
            return Response(content=result, media_type="application/json")


@api.get("/content/streams/{content_type}")
async def get_streams(content_type: str, category_id: Optional[str] = None, playlist_id: Optional[str] = Header(None, alias='X-Playlist-ID')):
    if content_type not in ("live", "vod", "series"):
        raise HTTPException(status_code=400, detail="Invalid content type")
    pl = await get_active_playlist_internal(playlist_id)
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
        
    cache_key = (pl["id"], content_type, category_id)
    if cache_key in _stream_cache:
        return Response(content=_stream_cache[cache_key], media_type="application/json")
        
    async with aiosqlite.connect(DB_PATH) as db:
        if category_id and category_id != "all":
            query = "SELECT json_group_array(json(data)) FROM streams WHERE playlist_id = ? AND type = ? AND category_id = ?"
            params = (pl["id"], content_type, category_id)
        else:
            query = "SELECT json_group_array(json(data)) FROM streams WHERE playlist_id = ? AND type = ?"
            params = (pl["id"], content_type)
            
        async with db.execute(query, params) as cursor:
            row = await cursor.fetchone()
            result = row[0] if row and row[0] else "[]"
            _stream_cache[cache_key] = result
            return Response(content=result, media_type="application/json")


# ---------------------- Details ---------------------- #

@api.get("/content/movie/{movie_id}")
async def get_movie_details(movie_id: str, playlist_id: Optional[str] = Header(None, alias='X-Playlist-ID')):
    pl = await get_active_playlist_internal(playlist_id)
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
        
    # Xtream provides extra info via its vod_info endpoint
    if pl["type"] == "xtream":
        client = xtream_from_playlist(pl)
        try:
            info = await client.vod_info(movie_id)
            info["stream_url"] = client.vod_stream_url(movie_id)
            return info
        except Exception as e:
            # Fallback to local
            pass
            
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT data FROM streams WHERE playlist_id = ? AND type = 'vod' AND id = ?", (pl["id"], movie_id)) as cursor:
            row = await cursor.fetchone()
            if row:
                return json.loads(row[0])
                
    raise HTTPException(status_code=404, detail="Movie not found")


@api.get("/content/series/{series_id}")
async def get_series_details(series_id: str, playlist_id: Optional[str] = Header(None, alias='X-Playlist-ID')):
    pl = await get_active_playlist_internal(playlist_id)
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
        
    if pl["type"] == "xtream":
        client = xtream_from_playlist(pl)
        try:
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
        except Exception as e:
            pass
            
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT data FROM streams WHERE playlist_id = ? AND type = 'series' AND id = ?", (pl["id"], series_id)) as cursor:
            row = await cursor.fetchone()
            if row:
                return json.loads(row[0])
                
    raise HTTPException(status_code=404, detail="Series not found")


# ---------------------- EPG ---------------------- #

@api.get("/content/epg/{stream_id}")
async def get_epg(stream_id: str, limit: int = 12, playlist_id: Optional[str] = Header(None, alias='X-Playlist-ID')):
    pl = await get_active_playlist_internal(playlist_id)
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
async def stream_url(content_type: str, content_id: str, ext: Optional[str] = None, playlist_id: Optional[str] = Header(None, alias='X-Playlist-ID')):
    pl = await get_active_playlist_internal(playlist_id)
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
        
    if pl["type"] == "xtream":
        client = xtream_from_playlist(pl)
        if content_type == "live":
            url = client.live_stream_url(content_id, ext=ext or "m3u8")
        elif content_type in ["vod", "movie"]:
            url = client.vod_stream_url(content_id, ext=ext or "mp4")
        elif content_type == "episode":
            url = client.series_stream_url(content_id, ext=ext or "mp4")
        else:
            url = None
        if url:
            return {"url": url}
            
    async with aiosqlite.connect(DB_PATH) as db:
        c_type = "vod" if content_type == "movie" else content_type
        async with db.execute("SELECT data FROM streams WHERE playlist_id = ? AND type = ? AND id = ?", (pl["id"], c_type, content_id)) as cursor:
            row = await cursor.fetchone()
            if row:
                s = json.loads(row[0])
                url = s.get("stream_url", "")
                if ext and url:
                    # Dynamically replace extension for Xtream formats to force transcoding/HLS
                    import re
                    url = re.sub(r'\.[a-zA-Z0-9]+$', f'.{ext}', url)
                return {"url": url}
                
    raise HTTPException(status_code=404, detail="Stream not found")


# ---------------------- Stream Proxy (CORS workaround) ---------------------- #

@api.get("/proxy/stream")
async def proxy_stream(request: Request, url: str = Query(...)):
    """Reverse-proxy a remote stream/playlist to bypass CORS for the browser."""
    req_headers = {}
    for h in ("range", "accept"):
        if h in request.headers:
            req_headers[h.title()] = request.headers[h]
            
    # Spoof User-Agent to standard player to bypass provider blocks (HTTP 456/403)
    # vvc.to and other strict providers often block IPTVSmartersPro and generic browser User-Agents.
    req_headers["User-Agent"] = "VLC/3.0.9 LibVLC/3.0.9"

    try:
        req = proxy_client.build_request("GET", url, headers=req_headers)
        r = await proxy_client.send(req, stream=True)
        ct = r.headers.get("content-type", "application/octet-stream")
        
        # Check if it's an M3U8 playlist
        is_m3u8 = "mpegurl" in ct.lower() or "apple.mpegurl" in ct.lower() or url.split("?")[0].endswith(".m3u8")
        
        if is_m3u8 and r.status_code == 200:
            text = await r.aread()
            text = text.decode("utf-8", errors="ignore")
            await r.aclose()
            
            new_lines = []
            for line in text.split("\n"):
                line = line.strip()
                if not line:
                    continue
                if line.startswith("#"):
                    new_lines.append(line)
                else:
                    abs_url = urljoin(url, line)
                    proxy_url = f"/api/proxy/stream?url={quote(abs_url, safe='')}"
                    new_lines.append(proxy_url)
            
            new_text = "\n".join(new_lines) + "\n"
            headers = {"Access-Control-Allow-Origin": "*", "Cache-Control": "no-cache"}
            return Response(content=new_text, media_type=ct, headers=headers)

        # Standard streaming for Video / TS Segments / Errors
        async def gen():
            try:
                async for chunk in r.aiter_bytes(chunk_size=64 * 1024):
                    yield chunk
            except asyncio.CancelledError:
                pass
            finally:
                await r.aclose()
                
        headers = {"Access-Control-Allow-Origin": "*", "Cache-Control": "no-cache"}
        for h in ("content-range", "accept-ranges", "content-length"):
            if h in r.headers:
                headers[h.title()] = r.headers[h]

        return StreamingResponse(gen(), status_code=r.status_code, media_type=ct, headers=headers)
        
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Proxy error: {str(e)}") from e


# ---------------------- Favorites ---------------------- #

@api.get("/user/favorites")
async def list_favorites(profile_id: str = "default", playlist_id: Optional[str] = Header(None, alias='X-Playlist-ID')):

    pl = await get_active_playlist_internal(playlist_id)
    if not pl:
        return []
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT data FROM favorites WHERE profile_id = ? AND playlist_id = ?", (profile_id, pl["id"])) as cursor:
            docs = [json.loads(row[0]) for row in await cursor.fetchall()]
    return docs


@api.post("/user/favorites")
async def add_favorite(payload: FavoriteCreate, profile_id: str = "default", playlist_id: Optional[str] = Header(None, alias='X-Playlist-ID')):

    pl = await get_active_playlist_internal(playlist_id)
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
    async with aiosqlite.connect(DB_PATH) as db:
        if payload.content_type in ("movie", "vod"):
            async with db.execute(
                "SELECT data FROM favorites WHERE profile_id = ? AND playlist_id = ? AND content_id = ? AND content_type IN ('movie', 'vod')",
                (profile_id, pl["id"], payload.content_id)
            ) as cursor:
                row = await cursor.fetchone()
                if row:
                    return json.loads(row[0])
        else:
            async with db.execute(
                "SELECT data FROM favorites WHERE profile_id = ? AND playlist_id = ? AND content_id = ? AND content_type = ?",
                (profile_id, pl["id"], payload.content_id, payload.content_type)
            ) as cursor:
                row = await cursor.fetchone()
                if row:
                    return json.loads(row[0])
                
        doc = {
            "id": str(uuid.uuid4()),
            "profile_id": profile_id,
            "playlist_id": pl["id"],
            "content_type": payload.content_type,
            "content_id": payload.content_id,
            "content_data": payload.content_data,
            "added_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.execute(
            "INSERT INTO favorites (id, profile_id, playlist_id, content_type, content_id, data) VALUES (?, ?, ?, ?, ?, ?)",
            (doc["id"], doc["profile_id"], doc["playlist_id"], doc["content_type"], doc["content_id"], json.dumps(doc))
        )
        await db.commit()
    return doc


@api.delete("/user/favorites/{content_type}/{content_id}")
async def remove_favorite(content_type: str, content_id: str, profile_id: str = "default", playlist_id: Optional[str] = Header(None, alias='X-Playlist-ID')):

    pl = await get_active_playlist_internal(playlist_id)
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
    async with aiosqlite.connect(DB_PATH) as db:
        if content_type in ("movie", "vod"):
            await db.execute(
                "DELETE FROM favorites WHERE profile_id = ? AND playlist_id = ? AND content_type IN ('movie', 'vod') AND content_id = ?",
                (profile_id, pl["id"], content_id)
            )
        else:
            await db.execute(
                "DELETE FROM favorites WHERE profile_id = ? AND playlist_id = ? AND content_type = ? AND content_id = ?",
                (profile_id, pl["id"], content_type, content_id)
            )
        await db.commit()
    return {"ok": True}


# ---------------------- Watch progress / Continue Watching ---------------------- #

@api.post("/user/progress")
async def upsert_progress(payload: ProgressUpdate, profile_id: str = "default", playlist_id: Optional[str] = Header(None, alias='X-Playlist-ID')):

    pl = await get_active_playlist_internal(playlist_id)
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
    async with aiosqlite.connect(DB_PATH) as db:
        progress_val = (payload.position / payload.duration) if payload.duration else 0
        doc = {
            "profile_id": profile_id,
            "playlist_id": pl["id"],
            "content_type": payload.content_type,
            "content_id": payload.content_id,
            "position": payload.position,
            "duration": payload.duration,
            "progress": progress_val,
            "content_data": payload.content_data,
            "last_watched_at": datetime.now(timezone.utc).isoformat(),
        }
        
        if payload.content_type in ("movie", "vod"):
            async with db.execute(
                "SELECT id, data FROM watch_progress WHERE profile_id = ? AND playlist_id = ? AND content_type IN ('movie', 'vod') AND content_id = ?",
                (profile_id, pl["id"], payload.content_id)
            ) as cursor:
                row = await cursor.fetchone()
        else:
            async with db.execute(
                "SELECT id, data FROM watch_progress WHERE profile_id = ? AND playlist_id = ? AND content_type = ? AND content_id = ?",
                (profile_id, pl["id"], payload.content_type, payload.content_id)
            ) as cursor:
                row = await cursor.fetchone()
            
        if row:
            doc["id"] = row[0]
            existing_data = json.loads(row[1])
            
            # Safely merge content_data to avoid overwriting valid posters with empty strings
            existing_cd = existing_data.get("content_data", {})
            new_cd = doc.get("content_data", {})
            merged_cd = dict(existing_cd)
            for k, v in new_cd.items():
                if v:
                    merged_cd[k] = v
            doc["content_data"] = merged_cd
            
            existing_data.update(doc)
            doc = existing_data
            
            await db.execute(
                "UPDATE watch_progress SET progress = ?, last_watched_at = ?, data = ? WHERE id = ?",
                (progress_val, doc["last_watched_at"], json.dumps(doc), doc["id"])
            )
        else:
            doc["id"] = str(uuid.uuid4())
            await db.execute(
                "INSERT INTO watch_progress (id, profile_id, playlist_id, content_type, content_id, progress, last_watched_at, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (doc["id"], profile_id, pl["id"], payload.content_type, payload.content_id, progress_val, doc["last_watched_at"], json.dumps(doc))
            )
            
        await db.commit()
    return {"ok": True}


@api.get("/user/progress")
async def list_progress(profile_id: str = "default", playlist_id: Optional[str] = Header(None, alias='X-Playlist-ID')):

    pl = await get_active_playlist_internal(playlist_id)
    if not pl:
        return []
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT data FROM watch_progress WHERE profile_id = ? AND playlist_id = ? ORDER BY last_watched_at DESC", 
            (profile_id, pl["id"])
        ) as cursor:
            docs = [json.loads(row[0]) for row in await cursor.fetchall()]
    return docs


@api.get("/user/continue-watching")
async def continue_watching(profile_id: str = "default", playlist_id: Optional[str] = Header(None, alias='X-Playlist-ID')):

    pl = await get_active_playlist_internal(playlist_id)
    if not pl:
        return []
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT data FROM watch_progress WHERE profile_id = ? AND playlist_id = ? AND progress > 0.02 AND progress < 0.95 ORDER BY last_watched_at DESC LIMIT 50",
            (profile_id, pl["id"])
        ) as cursor:
            docs = [json.loads(row[0]) for row in await cursor.fetchall()]
    return docs


@api.delete("/user/progress/{content_type}/{content_id}")
async def delete_progress(content_type: str, content_id: str, profile_id: str = "default", playlist_id: Optional[str] = Header(None, alias='X-Playlist-ID')):

    pl = await get_active_playlist_internal(playlist_id)
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
    async with aiosqlite.connect(DB_PATH) as db:
        if content_type in ("movie", "vod"):
            await db.execute(
                "DELETE FROM watch_progress WHERE profile_id = ? AND playlist_id = ? AND content_type IN ('movie', 'vod') AND content_id = ?",
                (profile_id, pl["id"], content_id)
            )
        else:
            await db.execute(
                "DELETE FROM watch_progress WHERE profile_id = ? AND playlist_id = ? AND content_type = ? AND content_id = ?",
                (profile_id, pl["id"], content_type, content_id)
            )
        await db.commit()
    return {"ok": True}


# ---------------------- Search ---------------------- #

@api.get("/content/search")
async def search_content(q: str = Query(..., min_length=1), playlist_id: Optional[str] = Header(None, alias='X-Playlist-ID')):
    pl = await get_active_playlist_internal(playlist_id)
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
        
    q_like = f"%{q}%"
    results: dict[str, list[Any]] = {"live": [], "movies": [], "series": []}
    
    async with aiosqlite.connect(DB_PATH) as db:
        for c_type, r_key in [("live", "live"), ("vod", "movies"), ("series", "series")]:
            async with db.execute(
                "SELECT data FROM streams WHERE playlist_id = ? AND type = ? AND name LIKE ? LIMIT 50",
                (pl["id"], c_type, q_like)
            ) as cursor:
                rows = await cursor.fetchall()
                results[r_key] = [json.loads(row[0]) for row in rows]
                
    return results


# ---------------------- Settings ---------------------- #

@api.get("/user/settings")
async def get_settings(profile_id: str = "default"):
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT data FROM settings WHERE profile_id = ?", (profile_id,)) as cursor:
            row = await cursor.fetchone()
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
                }
            return json.loads(row[0])


@api.put("/user/settings")
async def update_settings(settings: dict[str, Any] = Body(...)):
    pid = settings.get("profile_id", "default")
    settings["profile_id"] = pid
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT data FROM settings WHERE profile_id = ?", (pid,)) as cursor:
            row = await cursor.fetchone()
            
        if row:
            await db.execute("UPDATE settings SET data = ? WHERE profile_id = ?", (json.dumps(settings), pid))
        else:
            await db.execute("INSERT INTO settings (profile_id, data) VALUES (?, ?)", (pid, json.dumps(settings)))
            
        await db.commit()
        
    return settings


# ---------------------- Mount ---------------------- #

app.include_router(api)

import os
import sys
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

if "MAXX_FRONTEND_DIR" in os.environ:
    FRONTEND_BUILD_DIR = os.environ["MAXX_FRONTEND_DIR"]
elif getattr(sys, 'frozen', False):
    FRONTEND_BUILD_DIR = os.path.join(sys._MEIPASS, "frontend", "build")
else:
    FRONTEND_BUILD_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "build")

if os.path.exists(FRONTEND_BUILD_DIR):
    static_dir = os.path.join(FRONTEND_BUILD_DIR, "static")
    if os.path.exists(static_dir):
        app.mount("/static", StaticFiles(directory=static_dir), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Serve exact file if it exists (like favicon.ico, manifest.json)
        potential_path = os.path.join(FRONTEND_BUILD_DIR, full_path)
        if full_path and os.path.exists(potential_path) and os.path.isfile(potential_path):
            return FileResponse(potential_path)
        
        # Fallback to index.html for React Router SPA
        index_path = os.path.join(FRONTEND_BUILD_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"error": "Frontend build not found"}
