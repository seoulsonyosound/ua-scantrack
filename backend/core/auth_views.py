from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from .models import AppUser, Attendance
from .serializers import RegisterSerializer, StudentSerializer, AttendanceSerializer

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        if email:
            email = email.lower()
        user = AppUser.objects.filter(email__iexact=email).first()
        if user and user.check_password(password):
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key, 
                "role": user.role,
                "email": user.email
            })
        return Response({"detail": "Invalid credentials"}, status=401)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [] # This prevents the "Invalid token" check

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class StudentMeView(APIView):
    def get(self, request):
        email = request.query_params.get("email")
        user = AppUser.objects.filter(email=email).first()
        if not user or not user.student:
            return Response({"detail": "Student record not linked"}, status=404)
        return Response(StudentSerializer(user.student).data)
    
class StudentMyAttendanceView(APIView):
    def get(self, request):
        email = request.query_params.get("email")
        user = AppUser.objects.filter(email=email).first()
        if not user or not user.student:
            return Response({"detail": "Student record not linked"}, status=404)
        qs = Attendance.objects.filter(student=user.student).order_by("-time_in")
        return Response(AttendanceSerializer(qs, many=True).data)