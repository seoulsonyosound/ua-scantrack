from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import IntegrityError
from django.http import HttpResponse
import csv

from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
User = get_user_model()
from rest_framework.authentication import TokenAuthentication


from .models import Student, Event, Attendance
from .serializers import StudentSerializer, EventSerializer, AttendanceSerializer
from rest_framework.permissions import BasePermission
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated

from rest_framework.renderers import BaseRenderer

ADMIN_PASSCODE = "1234" 


class CSVRenderer(BaseRenderer):
    media_type = "text/csv"
    format = "csv"
    charset = "utf-8"

   
    def render(self, data, accepted_media_type=None, renderer_context=None):
        if data is None:
            return ""
        if isinstance(data, (bytes, bytearray)):
            return data
        return str(data)


class IsAdminPasscode(BasePermission):
    def has_permission(self, request, view):
        if request.method == 'GET':
            return True
        
        passcode = request.headers.get('X-Admin-Passcode') or request.META.get('HTTP_X_ADMIN_PASSCODE')
        
        return passcode == ADMIN_PASSCODE

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().order_by("last_name")
    serializer_class = StudentSerializer
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        student_no = instance.student_no
        self.perform_destroy(instance)
        
        return Response(
            {"detail": f"Student '{student_no}' has been deleted successfully."},
            status=status.HTTP_200_OK
        )


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by('-event_date')
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    
    authentication_classes = [TokenAuthentication]

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'validate_pin']:
            return [AllowAny()]
        
        return [IsAdminPasscode()]
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        event_title = instance.title
        self.perform_destroy(instance)
        
        return Response(
            {"detail": f"Event '{event_title}' has been deleted successfully."},
            status=status.HTTP_200_OK
        )
    
    
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
    
    @action(detail=True, methods=["get"], renderer_classes=[CSVRenderer])
    def report_csv(self, request, pk=None):
       
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


    @action(detail=True, methods=["get"], renderer_classes=[CSVRenderer])
    def attendees_csv(self, request, pk=None):
    
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
            return [AllowAny()]  
        if self.request.method in ("GET",):
            return [AllowAny()]  
        return [IsAdminPasscode()]  

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
    
class StudentMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print("StudentMeView CALLED!")
        app_user = request.user
        if not hasattr(app_user, 'student') or app_user.student is None:
            return Response({'detail': 'No student profile found.'}, status=404)
        serializer = StudentSerializer(app_user.student)
        return Response(serializer.data)
    
class RegisterView(APIView):
    # This allows anyone to access the registration endpoint
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        student_id = data.get('student_id', '')

        if not email or not password:
            return Response({"detail": "Email and password required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Create the User
            user = User.objects.create_user(
                username=email, 
                email=email, 
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            # Create the associated Student profile
            Student.objects.create(user=user, student_no=student_id)
            
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key}, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response({"detail": "User already exists"}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    # This ensures an old/invalid token doesn't block the login attempt
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                token, _ = Token.objects.get_or_create(user=user)
                return Response({
                    "token": token.key,
                    "is_staff": user.is_staff
                }, status=status.HTTP_200_OK)
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)