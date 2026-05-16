from django.db import models
from django.utils import timezone
import random
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

class Student(models.Model):
    student_no = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=80)
    last_name = models.CharField(max_length=80)
    course = models.CharField(max_length=80, default="BSIT")
    year_level = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.student_no} - {self.last_name}"

class Event(models.Model):
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    event_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    venue = models.CharField(max_length=120)
    pin_code = models.CharField(max_length=4, db_index=True, blank=True) 
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
    
class AppUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', AppUser.ROLE_ADMIN)
        return self.create_user(email, password, **extra_fields)

class AppUser(AbstractBaseUser, PermissionsMixin):
    ROLE_ADMIN = "ADMIN"
    ROLE_STUDENT = "STUDENT"
    ROLE_CHOICES = [(ROLE_ADMIN, "Admin"), (ROLE_STUDENT, "Student")]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=ROLE_STUDENT)
    student = models.OneToOneField(Student, null=True, blank=True, on_delete=models.SET_NULL)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = AppUserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    
    
    
    