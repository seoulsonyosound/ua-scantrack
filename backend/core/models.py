from django.db import models
from django.utils import timezone
import random

class Student(models.Model):
    student_no = models.CharField(max_length=50, unique=True)  # barcode value
    first_name = models.CharField(max_length=80)
    last_name = models.CharField(max_length=80)
    course = models.CharField(max_length=80)
    year_level = models.IntegerField()

    def __str__(self):
        return f"{self.student_no} - {self.last_name}"

class Event(models.Model):
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    event_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    venue = models.CharField(max_length=120)
    pin_code = models.CharField(max_length=4, db_index=True)
    pin_enabled = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.pin_code:
            self.pin_code = f"{random.randint(0, 9999):04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

class Attendance(models.Model):
    STATUS_PRESENT = "PRESENT"
    STATUS_LATE = "LATE"
    STATUS_CHOICES = [(STATUS_PRESENT, "Present"), (STATUS_LATE, "Late")]

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    time_in = models.DateTimeField(default=timezone.now)
    time_out = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)

    class Meta:
        unique_together = ("student", "event")

    def __str__(self):
        return f"{self.student.student_no} @ {self.event.title}"
    
class AppUser(models.Model):
    ROLE_ADMIN = "ADMIN"
    ROLE_STUDENT = "STUDENT"
    ROLE_CHOICES = [(ROLE_ADMIN, "Admin"), (ROLE_STUDENT, "Student")]

    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  # DEMO: plain text (do not use in production)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    # link a student account to a Student row (only for STUDENT role)
    student = models.OneToOneField("Student", null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"{self.email} ({self.role})"