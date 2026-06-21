import asyncio
import time
import httpx
import logging

logging.basicConfig(level=logging.INFO)

async def fetch_streams(client, i):
    start = time.time()
    try:
        r = await client.get("http://localhost:8000/api/content/streams/vod", timeout=30.0)
        end = time.time()
        logging.info(f"Request {i} completed in {end - start:.3f}s with status {r.status_code}, len={len(r.content)}")
        return end - start
    except Exception as e:
        end = time.time()
        logging.error(f"Request {i} failed in {end - start:.3f}s: {e}")
        return None

async def main():
    async with httpx.AsyncClient() as client:
        # Check active playlist
        try:
            r = await client.get("http://localhost:8000/api/playlists/active")
            if r.status_code != 200 or not r.json():
                logging.warning("No active playlist found. Please ensure demo or a real playlist is active.")
                
            # Fire 10 concurrent requests
            logging.info("Starting concurrent load test...")
            tasks = [fetch_streams(client, i) for i in range(10)]
            results = await asyncio.gather(*tasks)
            valid = [r for r in results if r is not None]
            if valid:
                logging.info(f"Average time: {sum(valid)/len(valid):.3f}s. Max time: {max(valid):.3f}s")
        except Exception as e:
            logging.error(f"Test failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
