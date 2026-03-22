"""Faculty credentials live in a dedicated MongoDB database (see ``get_faculty_collection``)."""
from datetime import datetime

from django.contrib.auth.hashers import make_password

from backend.mongodb import get_faculty_collection


def faculty_collection():
    return get_faculty_collection()


def find_faculty_by_email(email: str):
    if not email:
        return None
    email = email.strip().lower()
    return faculty_collection().find_one({'email': email})


def upsert_faculty_document(
    email: str,
    password_plain: str,
    username: str = None,
    first_name: str = '',
    last_name: str = '',
):
    """Insert or update a faculty document (hashed password)."""
    email = email.strip().lower()
    coll = faculty_collection()
    now = datetime.utcnow()
    doc = {
        'email': email,
        'username': username or email.split('@')[0],
        'password': make_password(password_plain),
        'first_name': first_name or '',
        'last_name': last_name or '',
        'updated_at': now,
    }
    existing = coll.find_one({'email': email})
    if existing:
        coll.update_one({'email': email}, {'$set': doc})
    else:
        doc['created_at'] = now
        coll.insert_one(doc)
    return coll.find_one({'email': email})
