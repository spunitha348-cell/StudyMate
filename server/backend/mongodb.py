"""
MongoDB connection utility.

- ``studymate_db`` (default): student mirror ``users``, ``study_materials``, etc.
- Faculty credentials live in a **separate database** (see ``MONGODB_FACULTY_DB_NAME``).
"""
from pymongo import MongoClient
import os

# MongoDB connection
_client = None
_db = None
_faculty_db = None

def get_mongodb_client():
    """Get MongoDB client connection"""
    global _client
    if _client is None:
        # Try to get from environment or Django settings
        mongodb_uri = os.getenv('MONGODB_URI')
        if not mongodb_uri:
            try:
                from django.conf import settings
                mongodb_uri = getattr(settings, 'MONGODB_URI', None)
            except:
                pass
        
        # Default MongoDB URI
        if not mongodb_uri:
            mongodb_uri = 'mongodb+srv://nalliayanandhakumar_db_user:StudyMate@cluster0.giucynj.mongodb.net/studymate_db?retryWrites=true&w=majority'
        
        # Configure SSL for MongoDB Atlas
        import ssl
        _client = MongoClient(
            mongodb_uri,
            tlsAllowInvalidCertificates=True,  # For development - disable in production
            serverSelectionTimeoutMS=5000
        )
    return _client

def get_mongodb_db():
    """Get MongoDB database"""
    global _db
    if _db is None:
        client = get_mongodb_client()
        # Extract database name from URI or use default
        db_name = 'studymate_db'
        _db = client[db_name]
    return _db

def get_collection(collection_name):
    """Get a MongoDB collection in the main app database (e.g. ``users`` for students)."""
    db = get_mongodb_db()
    return db[collection_name]


def get_faculty_db():
    """Dedicated MongoDB database for faculty records (sign-in / sign-up source of truth)."""
    global _faculty_db
    if _faculty_db is None:
        client = get_mongodb_client()
        try:
            from django.conf import settings
            name = getattr(settings, 'MONGODB_FACULTY_DB_NAME', 'studymate_faculty_db')
        except Exception:
            name = os.getenv('MONGODB_FACULTY_DB_NAME', 'studymate_faculty_db')
        _faculty_db = client[name]
    return _faculty_db


def get_faculty_collection():
    """Collection holding faculty documents (email, hashed password, profile)."""
    try:
        from django.conf import settings
        coll = getattr(settings, 'MONGODB_FACULTY_COLLECTION', 'faculty')
    except Exception:
        coll = os.getenv('MONGODB_FACULTY_COLLECTION', 'faculty')
    return get_faculty_db()[coll]


def get_legacy_faculty_collection_in_main_db():
    """Old location: ``studymate_db.faculty`` (before split). For one-off migration only."""
    return get_collection('faculty')

