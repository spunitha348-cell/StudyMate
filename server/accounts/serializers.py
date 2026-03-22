from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'first_name', 'last_name']
        read_only_fields = ['id']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """JWT login for students only (Django User with role=student). Faculty must use /api/auth/faculty/login/."""
    username_field = 'username'
    
    def validate(self, attrs):
        username_or_email = attrs.get('username')
        password = attrs.get('password')

        user_obj = None
        try:
            user_obj = User.objects.get(username=username_or_email)
        except User.DoesNotExist:
            try:
                user_obj = User.objects.get(email=username_or_email)
            except User.DoesNotExist:
                pass
        
        if user_obj:
            user = authenticate(username=user_obj.username, password=password)
        else:
            user = None
        
        if not user:
            raise AuthenticationFailed('Invalid credentials')

        if user.role != 'student':
            raise AuthenticationFailed(
                'This account is for faculty. Use the Faculty login page and your faculty credentials.'
            )
        
        refresh = self.get_token(user)
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': user.role,
            'username': user.username,
        }
        return data
