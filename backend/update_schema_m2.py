import asyncio
import os
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
        # Add new columns to settings
        try:
            await conn.execute("ALTER TABLE settings ADD COLUMN parental_pin VARCHAR(10) DEFAULT NULL;")
        except asyncpg.exceptions.DuplicateColumnError:
            print("Column parental_pin already exists.")
            
        try:
            await conn.execute("ALTER TABLE settings ADD COLUMN locked_categories JSONB DEFAULT '[]'::jsonb;")
        except asyncpg.exceptions.DuplicateColumnError:
            print("Column locked_categories already exists.")
            
        # Create search_history table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS search_history (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                profile_id TEXT NOT NULL DEFAULT 'default',
                query TEXT NOT NULL,
                searched_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
        ''')
        print("Database schema successfully updated for Milestone 2.")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(run())
