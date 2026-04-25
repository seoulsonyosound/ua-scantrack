# backend/core/auth_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import AppUser, Attendance
from .serializers import StudentSerializer, AttendanceSerializer
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
User = get_user_model()


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        
        user = User.objects.filter(email=email).first()
        
        if user and user.check_password(password):
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key, 
                "role": user.role,
                "email": user.email
            })
        return Response({"detail": "Invalid credentials"}, status=401)

class StudentMeView(APIView):
   
    def get(self, request):
        email = request.query_params.get("email")
        if not email:
            return Response({"detail": "email query param required"}, status=400)

        try:
            user = AppUser.objects.get(email=email, role=AppUser.ROLE_STUDENT)
        except AppUser.DoesNotExist:
            return Response({"detail": "Student user not found"}, status=404)

        if not user.student:
            return Response({"detail": "Student record not linked"}, status=409)

        return Response(StudentSerializer(user.student).data)

class StudentMyAttendanceView(APIView):
   
    def get(self, request):
        email = request.query_params.get("email")
        if not email:
            return Response({"detail": "email query param required"}, status=400)

        try:
            user = AppUser.objects.get(email=email, role=AppUser.ROLE_STUDENT)
        except AppUser.DoesNotExist:
            return Response({"detail": "Student user not found"}, status=404)

        if not user.student_id:
            return Response({"detail": "Student record not linked"}, status=409)

        qs = Attendance.objects.select_related("student", "event").filter(student_id=user.student_id).order_by("-time_in")
        return Response(AttendanceSerializer(qs, many=True).data)