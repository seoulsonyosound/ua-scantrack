# backend/core/management/commands/seed_demo.py
from django.core.management.base import BaseCommand
from core.models import AppUser, Student

class Command(BaseCommand):
    help = "Seed demo accounts: admin@ua.edu and student@ua.edu"

    def handle(self, *args, **options):
        # Create a sample student record
        student, _ = Student.objects.get_or_create(
            student_no="2021000020",  # this should match a barcode value you can scan
            defaults=dict(
                first_name="Demo",
                last_name="Student",
                course="BSIT",
                year_level=3,
            ),
        )

        # Student user
        AppUser.objects.update_or_create(
            email="student@ua.edu",
            defaults=dict(
                password="student123",
                role=AppUser.ROLE_STUDENT,
                student=student,
            ),
        )

        # Admin user (no linked student)
        AppUser.objects.update_or_create(
            email="admin@ua.edu",
            defaults=dict(
                password="admin123",
                role=AppUser.ROLE_ADMIN,
                student=None,
            ),
        )

        self.stdout.write(self.style.SUCCESS("Seeded demo users: admin@ua.edu / student@ua.edu"))
        self.stdout.write(self.style.SUCCESS("Passwords: admin123, student123"))
        self.stdout.write(self.style.WARNING("DEMO ONLY: passwords stored in plain text."))