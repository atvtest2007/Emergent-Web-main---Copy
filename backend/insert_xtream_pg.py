import asyncio
import os
import uuid
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL not set in .env")
        return

    conn = await asyncpg.connect(db_url)
    try:
        # Create schema if not exists
        with open('schema.sql', 'r') as f:
            await conn.execute(f.read())
            
        print("Schema ensured.")

        doc = {
            "id": str(uuid.uuid4()),
            "name": "User Xtream (Supabase)",
            "type": "xtream",
            "server_url": "https://xpme2.com:8443",
            "username": "ryans0",
            "password": "Bigfootrocks",
            "is_active": True,
            "auto_connect": True
        }
        
        async with conn.transaction():
            await conn.execute("UPDATE playlists SET is_active = false")
            await conn.execute('''
                INSERT INTO playlists (id, name, type, server_url, username, password, is_active, auto_connect)
                VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8)
            ''', doc["id"], doc["name"], doc["type"], doc["server_url"], doc["username"], doc["password"], doc["is_active"], doc["auto_connect"])
            
        print("Inserted Xtream credentials successfully into Supabase!")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(run())
