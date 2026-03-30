from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import IntegrityError
from django.http import HttpResponse
import csv

from .models import Student, Event, Attendance
from .serializers import StudentSerializer, EventSerializer, AttendanceSerializer
from rest_framework.permissions import BasePermission
from django.utils import timezone
from rest_framework.permissions import AllowAny

ADMIN_PASSCODE = "1234"  # demo passcode; you can move to settings/env later

class IsAdminPasscode(BasePermission):
    def has_permission(self, request, view):
        return request.headers.get("X-ADMIN-PASSCODE") == ADMIN_PASSCODE

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().order_by("last_name")
    serializer_class = StudentSerializer

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by("-event_date", "-start_time")
    serializer_class = EventSerializer

    # inside class EventViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
    # Allow Student Admin PIN validation + upcoming events without admin passcode
        if self.action in ("validate_pin", "upcoming"):
            return [AllowAny()]

    # Allow anyone to view events (demo)
        if self.request.method in ("GET",):
            return [AllowAny()]

    # Everything else requires admin passcode
        return [IsAdminPasscode()]

    @action(detail=False, methods=["get"])
    def upcoming(self, request):
        today = timezone.localdate()
        qs = Event.objects.filter(event_date__gte=today).order_by("event_date", "start_time")
        return Response(EventSerializer(qs, many=True).data)
    
    @action(detail=False, methods=["post"])
    def validate_pin(self, request):
        pin_code = request.data.get("pin_code")
        if not pin_code:
            return Response({"pin_code": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

        try:
            event = Event.objects.get(pin_code=pin_code, pin_enabled=True)
        except Event.DoesNotExist:
            return Response({"detail": "Invalid PIN"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(EventSerializer(event).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def report_csv(self, request, pk=None):
        """
        Admin report:
        GET /api/events/{event_id}/report_csv/
        Returns full attendance CSV for this event.
        """
        event = self.get_object()

        qs = (
            Attendance.objects
            .select_related("student")
            .filter(event=event)
            .order_by("time_in")
        )

        filename = f"attendance_event_{event.id}_{event.event_date}.csv"
        resp = HttpResponse(content_type="text/csv")
        resp["Content-Disposition"] = f'attachment; filename="{filename}"'

        writer = csv.writer(resp)
        writer.writerow([
            "event_id",
            "event_title",
            "event_date",
            "venue",
            "student_no",
            "first_name",
            "last_name",
            "course",
            "year_level",
            "time_in",
            "time_out",
            "status",
        ])

        for a in qs:
            s = a.student
            writer.writerow([
                event.id,
                event.title,
                str(event.event_date),
                event.venue,
                s.student_no,
                s.first_name,
                s.last_name,
                s.course,
                s.year_level,
                a.time_in.isoformat() if a.time_in else "",
                a.time_out.isoformat() if a.time_out else "",
                a.status,
            ])

        return resp

    @action(detail=True, methods=["get"])
    def attendees_csv(self, request, pk=None):
        """
        Admin attendees list (checked-in students only):
        GET /api/events/{event_id}/attendees_csv/
        Returns a CSV of unique students who have attendance records for this event.
        """
        event = self.get_object()

        qs = (
            Attendance.objects
            .select_related("student")
            .filter(event=event)
            .order_by("student__last_name", "student__first_name")
        )

        filename = f"attendees_event_{event.id}_{event.event_date}.csv"
        resp = HttpResponse(content_type="text/csv")
        resp["Content-Disposition"] = f'attachment; filename="{filename}"'

        writer = csv.writer(resp)
        writer.writerow([
            "event_id",
            "event_title",
            "event_date",
            "venue",
            "student_no",
            "first_name",
            "last_name",
            "course",
            "year_level",
            "status",
            "time_in",
        ])

        # Attendance has unique_together(student,event), so each row is already unique per student.
        for a in qs:
            s = a.student
            writer.writerow([
                event.id,
                event.title,
                str(event.event_date),
                event.venue,
                s.student_no,
                s.first_name,
                s.last_name,
                s.course,
                s.year_level,
                a.status,
                a.time_in.isoformat() if a.time_in else "",
            ])

        return resp

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related("student", "event").all()
    serializer_class = AttendanceSerializer

    def get_permissions(self):
        if self.action == "scan_checkin":
            return [AllowAny()]  # student admin scanning
        if self.request.method in ("GET",):
            return [AllowAny()]  # demo; later restrict
        return [IsAdminPasscode()]  # create/update/delete requires admin passcode

    def get_queryset(self):
        qs = super().get_queryset()
        event_id = self.request.query_params.get("event")
        student_id = self.request.query_params.get("student")
        if event_id:
            qs = qs.filter(event_id=event_id)
        if student_id:
            qs = qs.filter(student_id=student_id)
        return qs.order_by("-time_in")

    @action(detail=False, methods=["post"])
    def scan_checkin(self, request):
        # (keep your existing scan_checkin code unchanged)
        pin = request.data.get("pin_code")
        student_no = request.data.get("student_no")

        if not pin or not student_no:
            return Response({"detail": "pin_code and student_no required"}, status=400)

        try:
            event = Event.objects.get(pin_code=pin, pin_enabled=True)
        except Event.DoesNotExist:
            return Response({"detail": "Invalid PIN"}, status=400)

        try:
            student = Student.objects.get(student_no=student_no)
        except Student.DoesNotExist:
            return Response({"detail": "Unknown student barcode"}, status=404)

        now = timezone.localtime(timezone.now())
        start_dt = timezone.make_aware(
            timezone.datetime.combine(event.event_date, event.start_time)
        )

        status_value = Attendance.STATUS_PRESENT if now <= start_dt else Attendance.STATUS_LATE

        try:
            att = Attendance.objects.create(student=student, event=event, status=status_value)
        except IntegrityError:
            return Response({"detail": "Already checked-in"}, status=409)

        return Response(AttendanceSerializer(att).data, status=status.HTTP_201_CREATED)