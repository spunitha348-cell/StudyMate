"""
One-time: copy faculty documents from legacy ``studymate_db.faculty`` to ``studymate_faculty_db.faculty``.

Run after deploying the separate faculty database if you already had rows in the old collection.
"""
from django.core.management.base import BaseCommand

from backend.mongodb import get_faculty_collection, get_legacy_faculty_collection_in_main_db


class Command(BaseCommand):
    help = 'Copy faculty documents from studymate_db.faculty to the dedicated faculty database'

    def handle(self, *args, **options):
        legacy = get_legacy_faculty_collection_in_main_db()
        target = get_faculty_collection()
        count = 0
        for doc in legacy.find():
            doc.pop('_id', None)
            email = doc.get('email')
            if not email:
                continue
            email = email.strip().lower()
            doc['email'] = email
            target.update_one({'email': email}, {'$set': doc}, upsert=True)
            count += 1
        self.stdout.write(self.style.SUCCESS(f'Migrated {count} faculty document(s) to {target.database.name}.{target.name}'))
