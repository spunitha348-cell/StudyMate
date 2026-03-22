from django.urls import path
from .views import (
    register,
    register_faculty,
    forgot_password_check_email,
    forgot_password_reset,
    CustomTokenObtainPairView,
    faculty_login,
)

urlpatterns = [
    path('register/', register, name='register'),
    path('register/faculty/', register_faculty, name='register_faculty'),
    path('student/login/', CustomTokenObtainPairView.as_view(), name='student_login'),
    path('faculty/login/', faculty_login, name='faculty_login'),
    path('forgot-password/check-email/', forgot_password_check_email, name='forgot_password_check_email'),
    path('forgot-password/reset/', forgot_password_reset, name='forgot_password_reset'),
]



