import asyncio
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from backend.config import settings

logger = logging.getLogger("database")
logging.basicConfig(level=logging.INFO)

# In-Memory database store for seamless fallback if MongoDB is unreachable
class InMemoryDB:
    def __init__(self):
        self.users = []
        self.papers = []
        self.plagiarism_reports = []
        self.notifications = []
        self.ai_memory = []
        self.feedback = []
        self.generated_ideas = []
        self.diagrams = []
        logger.info("initialized resilient in-memory fallback database.")

    async def insert_one(self, collection_name, document):
        if "_id" not in document:
            import bson
            document["_id"] = str(bson.ObjectId()) if hasattr(bson, "ObjectId") else str(len(getattr(self, collection_name)) + 1)
        getattr(self, collection_name).append(document)
        return document

    async def find_one(self, collection_name, query):
        coll = getattr(self, collection_name)
        for doc in coll:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc
        return None

    async def find_many(self, collection_name, query, limit=100, sort_key=None, sort_dir=-1):
        coll = getattr(self, collection_name)
        results = []
        for doc in coll:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                results.append(doc)
        
        if sort_key:
            results.sort(key=lambda x: x.get(sort_key, ""), reverse=(sort_dir == -1))
        return results[:limit]

    async def update_one(self, collection_name, query, update_data):
        doc = await self.find_one(collection_name, query)
        if doc:
            for k, v in update_data.items():
                if k == "$set":
                    for sk, sv in v.items():
                        doc[sk] = sv
                else:
                    doc[k] = v
            return doc
        return None

# Global variables
client = None
db = None
is_mongo_active = False
in_memory_db = InMemoryDB()

async def init_db():
    global client, db, is_mongo_active
    try:
        logger.info(f"Connecting to MongoDB URI: {settings.MONGODB_URI}")
        # Try to connect with a short timeout to prevent blocking startup
        client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=10000,
            tlsAllowInvalidCertificates=True
        )
        # Verify connection
        await client.admin.command('ping')
        db = client.get_default_database() or client["self_evolving_db"]
        is_mongo_active = True
        logger.info("Successfully connected to MongoDB Atlas!")
    except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
        logger.warning(f"MongoDB connection failed: {e}. Falling back to resilient In-Memory Store.")
        is_mongo_active = False
        db = None

# Create helper operations that abstract away MongoDB and In-Memory details
class DatabaseHelper:
    @staticmethod
    async def insert(collection: str, doc: dict) -> dict:
        if is_mongo_active:
            try:
                res = await db[collection].insert_one(doc)
                doc["_id"] = str(res.inserted_id)
                return doc
            except Exception as e:
                logger.error(f"MongoDB write failed: {e}")
                # Remove _id if motor injected it before failing
                if "_id" in doc:
                    del doc["_id"]
        return await in_memory_db.insert_one(collection, doc)

    @staticmethod
    async def find_one(collection: str, query: dict) -> dict:
        if is_mongo_active:
            try:
                res = await db[collection].find_one(query)
                if res:
                    res["_id"] = str(res["_id"])
                    return res
                return None
            except Exception as e:
                logger.error(f"MongoDB read failed: {e}")
        return await in_memory_db.find_one(collection, query)

    @staticmethod
    async def find(collection: str, query: dict, limit: int = 100, sort_key: str = None, sort_dir: int = -1) -> list:
        if is_mongo_active:
            try:
                cursor = db[collection].find(query)
                if sort_key:
                    cursor = cursor.sort(sort_key, sort_dir)
                res = await cursor.to_list(length=limit)
                for doc in res:
                    doc["_id"] = str(doc["_id"])
                return res
            except Exception as e:
                logger.error(f"MongoDB find failed: {e}")
        return await in_memory_db.find_many(collection, query, limit=limit, sort_key=sort_key, sort_dir=sort_dir)

    @staticmethod
    async def update(collection: str, query: dict, update_data: dict) -> dict:
        if is_mongo_active:
            try:
                # Add support for standard $set if not present
                up = update_data if any(k.startswith('$') for k in update_data.keys()) else {"$set": update_data}
                await db[collection].update_one(query, up)
                res = await db[collection].find_one(query)
                if res:
                    res["_id"] = str(res["_id"])
                    return res
            except Exception as e:
                logger.error(f"MongoDB update failed: {e}")
        return await in_memory_db.update_one(collection, query, update_data)
