from django.contrib import admin
from .models import Student, Event, Attendance, AppUser


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("student_no", "last_name", "first_name", "course", "year_level")
    search_fields = ("student_no", "last_name", "first_name", "course")

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "event_date", "start_time", "end_time", "venue", "pin_code", "pin_enabled")
    search_fields = ("title", "venue", "pin_code")
    list_filter = ("event_date", "pin_enabled")

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ("event", "student", "status", "time_in", "time_out")
    search_fields = ("student__student_no", "student__last_name", "event__title")
    list_filter = ("status", "event")
    
@admin.register(AppUser)
class AppUserAdmin(admin.ModelAdmin):
    list_display = ("email", "role", "student", "is_staff", "is_superuser", "is_active")
    search_fields = ("email", "role")
    list_filter = ("role", "is_staff", "is_superuser", "is_active")