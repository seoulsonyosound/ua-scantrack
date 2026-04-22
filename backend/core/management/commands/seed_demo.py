from django.core.management.base import BaseCommand
from core.models import AppUser, Student
from django.contrib.auth.hashers import make_password


class Command(BaseCommand):
    help = "Seed demo accounts: admin@ua.edu and student@ua.edu"

    def handle(self, *args, **options):
        # Create a sample student record
        student, _ = Student.objects.get_or_create(
            student_no="2021000020",
            defaults=dict(
                first_name="Theeanna",
                last_name="Alejos",
                course="BSIT",
                year_level=3,
            ),
        )
        
        student, _ = Student.objects.get_or_create(
            student_no="2023000388",
            defaults=dict(
                first_name="Stephany",
                last_name="Dela Pena",
                course="BSIT",
                year_level=3,
            ),
        )
        
        student, _ = Student.objects.get_or_create(
            student_no="2021000022",
            defaults=dict(
                first_name="Graciella",
                last_name="Pastoral",
                course="BSIT",
                year_level=3,
            ),
        )
        
        student, _ = Student.objects.get_or_create(
            student_no="20210000893",
            defaults=dict(
                first_name="Graciella",
                last_name="Pastoral",
                course="BSIT",
                year_level=3,
            ),
        )

        # Student user
        student_user, _ = AppUser.objects.update_or_create(
            email="student@ua.edu",
            defaults=dict(
                role=AppUser.ROLE_STUDENT,
                student=student,
            ),
        )
        student_user.password = make_password("student123")
        student_user.save()

        # Admin user
        admin_user, _ = AppUser.objects.update_or_create(
            email="admin@ua.edu",
            defaults=dict(
                role=AppUser.ROLE_ADMIN,
                student=None,
                is_active=True,
                is_staff=True,
            ),
        )
        admin_user.password = make_password("admin123")
        admin_user.save()

        self.stdout.write(self.style.SUCCESS("Seeded demo users: admin@ua.edu / student@ua.edu"))
        self.stdout.write(self.style.SUCCESS("Passwords: admin123, student123"))
        self.stdout.write(self.style.WARNING("DEMO ONLY: passwords stored in Django hash."))