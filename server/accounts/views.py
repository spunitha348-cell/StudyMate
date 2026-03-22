from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.contrib.auth.hashers import make_password, check_password
from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView
from backend.mongodb import get_collection
from datetime import datetime
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import CustomTokenObtainPairSerializer, UserSerializer
from .faculty_mongo import find_faculty_by_email, upsert_faculty_document

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def faculty_login(request):
    """
    Faculty sign-in: validates email/password against MongoDB `faculty` collection,
    then syncs a Django User (role=faculty) for JWT.
    """
    email = (request.data.get('email') or '').strip().lower()
    password = request.data.get('password') or ''
    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    doc = find_faculty_by_email(email)
    if not doc or not check_password(password, doc['password']):
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        user = User.objects.get(email__iexact=email)
        if user.role != 'faculty':
            return Response(
                {'error': 'This email is registered as a student account.'},
                status=status.HTTP_403_FORBIDDEN,
            )
    except User.DoesNotExist:
        user = User.objects.create_user(
            username=doc.get('username') or email.split('@')[0],
            email=email,
            password=password,
            role='faculty',
            first_name=doc.get('first_name') or '',
            last_name=doc.get('last_name') or '',
            is_staff=True,
            is_superuser=False,
            is_active=True,
        )
    else:
        user.set_password(password)
        user.save(update_fields=['password'])

    refresh = RefreshToken.for_user(user)
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'role': user.role,
        'username': user.username,
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new student"""
    data = request.data
    
    # Validate required fields
    required_fields = ['username', 'email', 'password']
    missing_fields = [field for field in required_fields if not data.get(field)]
    
    if missing_fields:
        return Response({
            'error': f'Missing required fields: {", ".join(missing_fields)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if email already exists
    if User.objects.filter(email=data.get('email')).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if username already exists
    if User.objects.filter(username=data.get('username')).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate password length
    password = data.get('password', '')
    if len(password) < 6:
        return Response({'error': 'Password must be at least 6 characters long'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate email format
    from django.core.validators import validate_email
    from django.core.exceptions import ValidationError
    try:
        validate_email(data.get('email'))
    except ValidationError:
        return Response({'error': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Create user in Django (SQLite)
        user = User.objects.create_user(
            username=data.get('username'),
            email=data.get('email'),
            password=password,
            role='student',
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', '')
        )
        
        # Also store in MongoDB
        users_collection = get_collection('users')
        user_doc = {
            'username': data.get('username'),
            'email': data.get('email'),
            'password': make_password(password),  # Hash password
            'role': 'student',
            'first_name': data.get('first_name', ''),
            'last_name': data.get('last_name', ''),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'django_user_id': user.id  # Link to Django user
        }
        users_collection.insert_one(user_doc)
        
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except ValueError as e:
        return Response({
            'error': f'Validation error: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        import traceback
        return Response({
            'error': f'Registration failed: {str(e)}',
            'details': str(traceback.format_exc()) if settings.DEBUG else None
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_faculty(request):
    """Register a new faculty account: Django User (role=faculty) + MongoDB faculty DB document."""
    data = request.data

    required_fields = ['username', 'email', 'password']
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return Response(
            {'error': f'Missing required fields: {", ".join(missing_fields)}'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    email = (data.get('email') or '').strip().lower()
    username = (data.get('username') or '').strip()
    if not username:
        return Response({'error': 'Username cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

    existing = User.objects.filter(email__iexact=email).first()
    if existing:
        if existing.role == 'student':
            return Response(
                {
                    'error': (
                        'This email is already used for a student account. '
                        'Faculty sign-up needs a different email, or sign in as a student.'
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {'error': 'This email already has a faculty account. Use Faculty login.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username__iexact=username).exists():
        return Response(
            {'error': 'Username already taken. Choose another username.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        faculty_doc = find_faculty_by_email(email)
    except Exception as e:
        return Response(
            {
                'error': (
                    'Cannot reach the faculty database (MongoDB). '
                    'Check Atlas IP access list (allow your IP or 0.0.0.0/0 for dev) and MONGODB_URI.'
                ),
                'details': str(e) if settings.DEBUG else None,
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    if faculty_doc:
        return Response(
            {'error': 'This email is already registered as faculty in the database. Use Faculty login.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    password = data.get('password', '')
    if len(password) < 6:
        return Response(
            {'error': 'Password must be at least 6 characters long'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    from django.core.validators import validate_email
    from django.core.exceptions import ValidationError
    try:
        validate_email(email)
    except ValidationError:
        return Response({'error': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)

    user = None
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role='faculty',
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            is_staff=True,
            is_superuser=False,
            is_active=True,
        )
        upsert_faculty_document(
            email,
            password,
            username=username,
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
        )
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except (ValueError, IntegrityError) as e:
        if user is not None and getattr(user, 'pk', None):
            user.delete()
        return Response({'error': f'Validation error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        if user is not None and getattr(user, 'pk', None):
            user.delete()
        import traceback
        return Response(
            {
                'error': f'Registration failed: {str(e)}',
                'details': str(traceback.format_exc()) if settings.DEBUG else None,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_check_email(request):
    """Return whether an account exists for this email (for same-page reset flow)."""
    email = (request.data.get('email') or '').strip().lower()
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    from django.core.validators import validate_email
    from django.core.exceptions import ValidationError
    try:
        validate_email(email)
    except ValidationError:
        return Response({'error': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)
    in_django = User.objects.filter(email__iexact=email).exists()
    in_faculty_mongo = False
    try:
        in_faculty_mongo = find_faculty_by_email(email) is not None
    except Exception:
        pass
    return Response({'exists': in_django or in_faculty_mongo})


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_reset(request):
    """Set a new password when email exists (students and faculty)."""
    email = (request.data.get('email') or '').strip().lower()
    new_password = request.data.get('new_password') or ''
    confirm = request.data.get('confirm_password') or new_password

    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    if len(new_password) < 6:
        return Response({'error': 'Password must be at least 6 characters long'}, status=status.HTTP_400_BAD_REQUEST)
    if new_password != confirm:
        return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

    user = None
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        user = None

    faculty_doc = None
    try:
        faculty_doc = find_faculty_by_email(email)
    except Exception:
        pass

    if not user and not faculty_doc:
        return Response({'error': 'No account found for this email'}, status=status.HTTP_404_NOT_FOUND)

    if user:
        user.set_password(new_password)
        user.save(update_fields=['password'])
        try:
            users_collection = get_collection('users')
            users_collection.update_one(
                {'django_user_id': user.id},
                {'$set': {'password': make_password(new_password), 'updated_at': datetime.utcnow()}},
            )
        except Exception:
            pass

    if faculty_doc or (user and user.role == 'faculty'):
        try:
            upsert_faculty_document(
                email,
                new_password,
                username=(user.username if user else None)
                or (faculty_doc.get('username') if faculty_doc else None),
                first_name=(user.first_name if user else '')
                or (faculty_doc.get('first_name', '') if faculty_doc else ''),
                last_name=(user.last_name if user else '')
                or (faculty_doc.get('last_name', '') if faculty_doc else ''),
            )
        except Exception:
            pass

    return Response({'detail': 'Password updated. Please sign in with your new password.'})

