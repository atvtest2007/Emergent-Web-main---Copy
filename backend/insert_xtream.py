import asyncio
import os
import uuid
from motor.motor_asyncio import AsyncIOMotorClient

async def run():
    mongo = AsyncIOMotorClient("mongodb://localhost:27017")
    db = mongo["maxx_player"]
    
    doc = {
        "id": str(uuid.uuid4()),
        "name": "User Xtream",
        "type": "xtream",
        "server_url": "https://xpme2.com:8443",
        "username": "ryans0",
        "password": "Bigfootrocks",
        "is_active": True,
        "auto_connect": True
    }
    
    # Deactivate others
    await db.playlists.update_many({}, {"$set": {"is_active": False}})
    # Insert new
    await db.playlists.insert_one(doc)
    print("Inserted Xtream credentials successfully!")

if __name__ == "__main__":
    asyncio.run(run())
