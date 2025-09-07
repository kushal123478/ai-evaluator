from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from models import Document, Feedback, TestCase

class Database:
    client: AsyncIOMotorClient = None
    database = None

db = Database()

async def connect_to_mongo():
    """Create database connection"""
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    db.client = AsyncIOMotorClient(mongodb_url)
    db.database = db.client.ai_evaluator
    
    # Initialize beanie with document models
    await init_beanie(database=db.database, document_models=[Document, Feedback, TestCase])

async def close_mongo_connection():
    """Close database connection"""
    db.client.close()

async def get_database():
    return db.database