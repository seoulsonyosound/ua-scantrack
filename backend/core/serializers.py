from rest_framework import serializers
from .models import AppUser, Student, Event, Attendance
import random

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = "__all__"
        
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    # LATEST UPDATE: Accept student_no from the frontend
    student_no = serializers.CharField(write_only=True)

    class Meta:
        model = AppUser
        fields = ['email', 'password', 'first_name', 'last_name', 'student_no']

    def create(self, validated_data):
        # 1. Extract the manual ID and names
        s_no = validated_data.pop('student_no')
        f_name = validated_data.pop('first_name')
        l_name = validated_data.pop('last_name')

        # 2. Create Student profile using the provided student_no
        student_profile = Student.objects.create(
            student_no=s_no, 
            first_name=f_name,
            last_name=l_name,
            course="BSIT",
            year_level=1
        )

        # 3. Create User linked to the profile
        user = AppUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role=AppUser.ROLE_STUDENT,
            student=student_profile
        )
        return user

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    event = EventSerializer(read_only=True)
    class Meta:
        model = Attendance
        fields = ["id", "event", "student", "time_in", "time_out", "status"]