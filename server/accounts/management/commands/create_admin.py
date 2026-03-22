"""
Management command to create a default faculty account if it does not exist.
Creates both a Django User (role=faculty) and a document in MongoDB `faculty` (source of truth for faculty login).
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

from accounts.faculty_mongo import upsert_faculty_document

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates a faculty user if it does not exist'

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='Admin',
            help='Username for faculty user (default: Admin)'
        )
        parser.add_argument(
            '--email',
            type=str,
            default='jacsiceadmin@gmail.com',
            help='Email for faculty user (default: jacsiceadmin@gmail.com)'
        )
        parser.add_argument(
            '--password',
            type=str,
            default=None,
            help='Password for faculty user (default: from ADMIN_PASSWORD env var or jacsice@Admin)'
        )

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password'] or os.environ.get('ADMIN_PASSWORD', 'jacsice@Admin')

        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'User "{username}" already exists. Skipping creation.')
            )
            return

        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.ERROR(f'Email "{email}" is already in use by another user.')
            )
            return

        try:
            User.objects.create_user(
                username=username,
                email=email,
                password=password,
                role='faculty',
                is_staff=True,
                is_superuser=True,
                is_active=True
            )
            try:
                upsert_faculty_document(
                    email,
                    password,
                    username=username,
                    first_name='',
                    last_name='',
                )
            except Exception as ex:
                self.stdout.write(
                    self.style.WARNING(
                        f'Faculty user created in Django but MongoDB faculty sync failed: {ex}'
                    )
                )
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created faculty user: {username} ({email})'
                )
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating faculty user: {str(e)}')
            )
