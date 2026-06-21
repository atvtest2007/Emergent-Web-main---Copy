import asyncio
import httpx
import time

async def fetch_stream(url, client_id):
    print(f"Client {client_id} starting...")
    start = time.time()
    chunks = 0
    try:
        async with httpx.AsyncClient() as client:
            async with client.stream("GET", f"http://localhost:8000/api/proxy/stream?url={url}") as r:
                print(f"Client {client_id} connected with status {r.status_code}")
                async for chunk in r.aiter_bytes():
                    chunks += 1
                    if chunks % 100 == 0:
                        print(f"Client {client_id} received {chunks} chunks")
                    if chunks > 300:
                        break
    except Exception as e:
        print(f"Client {client_id} failed: {e}")
    end = time.time()
    print(f"Client {client_id} finished in {end - start:.2f}s with {chunks} chunks")

async def main():
    # Use two different public video streams
    url1 = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    url2 = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
    
    await asyncio.gather(
        fetch_stream(url1, 1),
        fetch_stream(url2, 2)
    )

if __name__ == "__main__":
    asyncio.run(main())
