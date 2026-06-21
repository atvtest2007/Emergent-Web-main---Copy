import httpx
import asyncio

async def test_favorites():
    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        # Add a favorite
        payload = {
            "content_type": "vod",
            "content_id": "test_123",
            "content_data": {"name": "Test Movie"}
        }
        res = await client.post("/api/user/favorites", json=payload)
        print("Add response:", res.json())
        
        # List favorites
        res = await client.get("/api/user/favorites")
        favs = res.json()
        print("Favorites list contains test_123?", any(f.get("content_id") == "test_123" for f in favs))
        
        # Remove favorite
        res = await client.delete("/api/user/favorites/vod/test_123")
        print("Delete response:", res.json())
        
        # List favorites again
        res = await client.get("/api/user/favorites")
        favs = res.json()
        print("Favorites list contains test_123 after delete?", any(f.get("content_id") == "test_123" for f in favs))

if __name__ == "__main__":
    asyncio.run(test_favorites())
