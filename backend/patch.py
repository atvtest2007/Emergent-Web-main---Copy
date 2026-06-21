import sys

with open('server.py', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Imports
if 'from fastapi.middleware.gzip import GZipMiddleware' not in code:
    code = code.replace('from starlette.middleware.cors import CORSMiddleware', 
                        'from starlette.middleware.cors import CORSMiddleware\nfrom fastapi.middleware.gzip import GZipMiddleware')

# 2. Add global httpx proxy_client and cache dicts
if '_stream_cache = {}' not in code:
    code = code.replace('ROOT_DIR = Path(__file__).parent', 
                        'ROOT_DIR = Path(__file__).parent\n\n_stream_cache = {}\n_category_cache = {}\nproxy_client: httpx.AsyncClient = None')

# 3. Lifespan to init and close proxy_client
if 'global proxy_client' not in code:
    code = code.replace('async def lifespan(app: FastAPI):\n    await init_db()\n    yield', 
                        'async def lifespan(app: FastAPI):\n    global proxy_client\n    await init_db()\n    proxy_client = httpx.AsyncClient(timeout=30.0, follow_redirects=True)\n    yield\n    await proxy_client.aclose()')

# 4. GZip Middleware
if 'GZipMiddleware' not in code.split('CORSMiddleware')[1]: # Check after CORS
    code = code.replace('app.add_middleware(\n    CORSMiddleware,', 
                        'app.add_middleware(GZipMiddleware, minimum_size=1000)\napp.add_middleware(\n    CORSMiddleware,')

# 5. Clear Cache function
if 'def clear_cache():' not in code:
    code = code.replace('# ---------------------- Sync Engine ---------------------- #', 
                        'def clear_cache():\n    _stream_cache.clear()\n    _category_cache.clear()\n\n# ---------------------- Sync Engine ---------------------- #')

# 6. clear_cache() calls
code = code.replace('async def run_sync_playlist(playlist_id: str):\n    pl = await get_playlist(playlist_id)', 
                    'async def run_sync_playlist(playlist_id: str):\n    clear_cache()\n    pl = await get_playlist(playlist_id)')
code = code.replace('await db.commit()\n    return {"ok": True, "active": pl["id"]}', 
                    'await db.commit()\n    clear_cache()\n    return {"ok": True, "active": pl["id"]}')
code = code.replace('await db.execute("DELETE FROM streams WHERE playlist_id = ?", (playlist_id,))\n        await db.commit()\n    return {"ok": True}', 
                    'await db.execute("DELETE FROM streams WHERE playlist_id = ?", (playlist_id,))\n        await db.commit()\n    clear_cache()\n    return {"ok": True}')
code = code.replace('asyncio.create_task(run_sync_playlist(pl_id))\n        return doc', 
                    'clear_cache()\n        asyncio.create_task(run_sync_playlist(pl_id))\n        return doc')
code = code.replace('asyncio.create_task(run_sync_playlist(pl_id))\n                return existing', 
                    'clear_cache()\n                asyncio.create_task(run_sync_playlist(pl_id))\n                return existing')

# 7. Optimized get_categories
new_get_cat = """@api.get("/content/categories/{content_type}")
async def get_categories(content_type: str):
    if content_type not in ("live", "vod", "series"):
        raise HTTPException(status_code=400, detail="Invalid content type")
    pl = await get_active_playlist_internal()
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
            return Response(content=result, media_type="application/json")"""

code = code.replace("""@api.get("/content/categories/{content_type}")
async def get_categories(content_type: str):
    if content_type not in ("live", "vod", "series"):
        raise HTTPException(status_code=400, detail="Invalid content type")
    pl = await get_active_playlist_internal()
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
        
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT data FROM categories WHERE playlist_id = ? AND type = ?", 
            (pl["id"], content_type)
        ) as cursor:
            rows = await cursor.fetchall()
            return [json.loads(row[0]) for row in rows]""", new_get_cat)

# 8. Optimized get_streams
new_get_streams = """@api.get("/content/streams/{content_type}")
async def get_streams(content_type: str, category_id: Optional[str] = None):
    if content_type not in ("live", "vod", "series"):
        raise HTTPException(status_code=400, detail="Invalid content type")
    pl = await get_active_playlist_internal()
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
            return Response(content=result, media_type="application/json")"""

code = code.replace("""@api.get("/content/streams/{content_type}")
async def get_streams(content_type: str, category_id: Optional[str] = None):
    if content_type not in ("live", "vod", "series"):
        raise HTTPException(status_code=400, detail="Invalid content type")
    pl = await get_active_playlist_internal()
    if not pl:
        raise HTTPException(status_code=404, detail="No active playlist")
        
    async with aiosqlite.connect(DB_PATH) as db:
        if category_id and category_id != "all":
            query = "SELECT data FROM streams WHERE playlist_id = ? AND type = ? AND category_id = ?"
            params = (pl["id"], content_type, category_id)
        else:
            query = "SELECT data FROM streams WHERE playlist_id = ? AND type = ?"
            params = (pl["id"], content_type)
            
        async with db.execute(query, params) as cursor:
            rows = await cursor.fetchall()
            return [json.loads(row[0]) for row in rows]""", new_get_streams)

# 9. Proxy Stream
new_proxy = """@api.get("/proxy/stream")
async def proxy_stream(url: str = Query(...)):
    \"\"\"Reverse-proxy a remote stream/playlist to bypass CORS for the browser.\"\"\"
    async def gen():
        async with proxy_client.stream("GET", url) as r:
            r.raise_for_status()
            async for chunk in r.aiter_bytes():
                yield chunk

    try:
        head = await proxy_client.head(url)
        ct = head.headers.get("content-type", "application/octet-stream")
    except Exception:
        ct = "application/octet-stream"

    headers = {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
    }
    return StreamingResponse(gen(), media_type=ct, headers=headers)"""

old_proxy = """@api.get("/proxy/stream")
async def proxy_stream(url: str = Query(...)):
    \"\"\"Reverse-proxy a remote stream/playlist to bypass CORS for the browser.\"\"\"
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
    return StreamingResponse(gen(), media_type=ct, headers=headers)"""

code = code.replace(old_proxy, new_proxy)

with open('server.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("Patch applied successfully.")
