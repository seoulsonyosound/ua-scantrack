# backend/backend/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import StudentViewSet, EventViewSet, AttendanceViewSet
from core.auth_views import LoginView, StudentMeView, StudentMyAttendanceView

router = DefaultRouter()
router.register("students", StudentViewSet)
router.register("events", EventViewSet)
router.register("attendance", AttendanceViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),

    # demo auth/profile endpoints
    path("api/auth/login/", LoginView.as_view()),
    path("api/students/me/", StudentMeView.as_view()),
    path("api/attendance/my/", StudentMyAttendanceView.as_view()),
]