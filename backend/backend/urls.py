from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import StudentViewSet, EventViewSet, AttendanceViewSet, StudentMeView
from core.auth_views import LoginView, StudentMyAttendanceView

router = DefaultRouter()
router.register("students", StudentViewSet)
router.register("events", EventViewSet)
router.register("attendance", AttendanceViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),

    # Custom endpoints for "me" and login (ALWAYS before the router include)
    path("api/students/me/", StudentMeView.as_view()),
    path("api/me/", StudentMeView.as_view()),  # optional, for testing

    path("api/auth/login/", LoginView.as_view()),
    path("api/attendance/my/", StudentMyAttendanceView.as_view()),

    # Default router endpoints
    path("api/", include(router.urls)),
]