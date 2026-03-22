from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.conf import settings
import traceback
from students.models import Year, Semester, Subject, StudyMaterial
from students.serializers import YearSerializer, SemesterSerializer, SubjectSerializer, StudyMaterialSerializer
from accounts.serializers import UserSerializer
from .permissions import IsFaculty

User = get_user_model()

class StudentManagementViewSet(viewsets.ModelViewSet):
    """Manage students - Admin only"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsFaculty]
    
    def get_queryset(self):
        queryset = User.objects.filter(role='student')
        # Add search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        return queryset
    
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['role'] = 'student'
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            password=request.data.get('password', 'defaultpassword123'),
            role='student',
            first_name=serializer.validated_data.get('first_name', ''),
            last_name=serializer.validated_data.get('last_name', '')
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    
    def destroy(self, request, *args, **kwargs):
        """Permanently delete a student from database"""
        student = self.get_object()
        # Also delete from MongoDB if exists
        try:
            from backend.mongodb import get_collection
            users_collection = get_collection('users')
            users_collection.delete_one({'django_user_id': student.id})
        except Exception as e:
            print(f"Error deleting from MongoDB: {e}")
        
        # Permanently delete from Django database
        student.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AcademicStructureViewSet(viewsets.ModelViewSet):
    """Manage academic structure - Admin only"""
    permission_classes = [IsAuthenticated, IsFaculty]
    
    def get_queryset(self):
        structure_type = self.request.query_params.get('type', 'year')
        if structure_type == 'year':
            return Year.objects.all()
        elif structure_type == 'semester':
            return Semester.objects.all()
        elif structure_type == 'subject':
            return Subject.objects.all()
        return Year.objects.all()
    
    def get_serializer_class(self):
        structure_type = self.request.query_params.get('type', 'year')
        if structure_type == 'year':
            return YearSerializer
        elif structure_type == 'semester':
            return SemesterSerializer
        elif structure_type == 'subject':
            return SubjectSerializer
        return YearSerializer
    
    @action(detail=False, methods=['post'])
    def create_year(self, request):
        """Create a new year"""
        serializer = YearSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def create_semester(self, request):
        """Create a new semester"""
        serializer = SemesterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def create_subject(self, request):
        """Create a new subject"""
        serializer = SubjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StudyMaterialManagementViewSet(viewsets.ModelViewSet):
    """Upload and manage study materials - Admin only"""
    serializer_class = StudyMaterialSerializer
    permission_classes = [IsAuthenticated, IsFaculty]
    
    def get_queryset(self):
        queryset = StudyMaterial.objects.all()
        
        # Filter by subject
        subject_id = self.request.query_params.get('subject', None)
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        
        # Filter by department (through subject -> semester)
        department_id = self.request.query_params.get('department', None)
        if department_id:
            queryset = queryset.filter(subject__semester__department_id=department_id)
        
        # Filter by year (through subject -> semester)
        year_id = self.request.query_params.get('year', None)
        if year_id:
            queryset = queryset.filter(subject__semester__year_id=year_id)
        
        # Filter by semester (through subject)
        semester_id = self.request.query_params.get('semester', None)
        if semester_id:
            queryset = queryset.filter(subject__semester_id=semester_id)
        
        # Filter by material type
        material_type = self.request.query_params.get('type', None)
        if material_type:
            queryset = queryset.filter(material_type=material_type)
        
        # Search by title, description, or subject name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) |
                Q(subject__name__icontains=search)
            )
        
        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def create(self, request, *args, **kwargs):
        """Handle file upload with better error handling"""
        try:
            # Get uploaded file from request
            uploaded_file = request.FILES.get('file')
            if not uploaded_file:
                return Response(
                    {'error': 'No file provided. Please select a file to upload.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate file size (max 10MB for free tier)
            # Note: Check size without reading the file
            max_size = 10 * 1024 * 1024  # 10MB
            file_size = uploaded_file.size
            if file_size == 0:
                return Response(
                    {'error': 'The uploaded file is empty. Please select a valid file.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if file_size > max_size:
                return Response(
                    {'error': f'File size exceeds 10MB limit. Your file is {file_size / (1024*1024):.2f}MB.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Reset file pointer to beginning (in case it was read)
            if hasattr(uploaded_file, 'seek'):
                uploaded_file.seek(0)
            
            # Validate serializer (file field is optional in serializer)
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    {'error': 'Validation failed', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save material instance first (without file field - file goes to Cloudinary)
            material = serializer.save(uploaded_by=request.user)
            
            # Upload file to Cloudinary
            try:
                from backend.cloudinary_utils import upload_file_to_cloudinary
                from backend.mongodb import get_collection
                
                # Build folder path safely
                dept_name = material.subject.semester.department.name if material.subject.semester.department else "general"
                year_name = material.subject.semester.year.name.replace(' ', '_')
                semester_num = material.subject.semester.number
                subject_name = material.subject.name.replace(' ', '_').replace('/', '_')
                
                folder_path = f'studymate/materials/{dept_name}/{year_name}/semester_{semester_num}/{subject_name}'
                
                # Reset file pointer to beginning before upload (important!)
                if hasattr(uploaded_file, 'seek'):
                    uploaded_file.seek(0)
                
                # Upload to Cloudinary
                upload_result = upload_file_to_cloudinary(
                    uploaded_file,
                    folder=folder_path,
                    resource_type='auto'
                )
                
                # Update material with Cloudinary data
                material.cloudinary_public_id = upload_result.get('public_id')
                material.cloudinary_url = upload_result.get('url')
                material.cloudinary_secure_url = upload_result.get('secure_url')
                material.file_name = upload_result.get('original_filename', uploaded_file.name)
                material.file_size = upload_result.get('bytes', uploaded_file.size)
                material.file_format = upload_result.get('format', uploaded_file.name.split('.')[-1] if '.' in uploaded_file.name else '')
                material.save()
                
                # Store metadata in MongoDB
                try:
                    materials_collection = get_collection('study_materials')
                    material_doc = {
                        'django_material_id': material.id,
                        'subject_id': material.subject.id,
                        'subject_name': material.subject.name,
                        'title': material.title,
                        'description': material.description,
                        'material_type': material.material_type,
                        'cloudinary_public_id': material.cloudinary_public_id,
                        'cloudinary_url': material.cloudinary_url,
                        'cloudinary_secure_url': material.cloudinary_secure_url,
                        'file_name': material.file_name,
                        'file_size': material.file_size,
                        'file_format': material.file_format,
                        'uploaded_by_id': material.uploaded_by.id if material.uploaded_by else None,
                        'uploaded_by_username': material.uploaded_by.username if material.uploaded_by else None,
                        'created_at': material.created_at.isoformat(),
                        'updated_at': material.updated_at.isoformat(),
                        'department': dept_name,
                        'year': material.subject.semester.year.name,
                        'semester': semester_num,
                    }
                    materials_collection.insert_one(material_doc)
                except Exception as e:
                    print(f"Error storing material in MongoDB: {e}")
                    # Continue even if MongoDB storage fails
                
                # Return success response
                response_serializer = self.get_serializer(material)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                # If Cloudinary upload fails, delete the material record
                material.delete()
                error_msg = str(e)
                error_trace = traceback.format_exc()
                print(f"Cloudinary upload error: {error_msg}")
                print(f"Traceback: {error_trace}")
                return Response(
                    {
                        'error': f'Failed to upload file to Cloudinary: {error_msg}',
                        'details': error_trace if settings.DEBUG else None
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except Exception as e:
            error_msg = str(e)
            error_trace = traceback.format_exc()
            print(f"Upload error: {error_msg}")
            print(f"Traceback: {error_trace}")
            return Response(
                {
                    'error': error_msg,
                    'details': error_trace if settings.DEBUG else None
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        """Permanently delete a study material from Cloudinary, MongoDB, and database"""
        material = self.get_object()
        
        # Delete from Cloudinary
        if material.cloudinary_public_id:
            try:
                from backend.cloudinary_utils import delete_file_from_cloudinary
                delete_file_from_cloudinary(material.cloudinary_public_id)
            except Exception as e:
                print(f"Error deleting from Cloudinary: {e}")
        
        # Delete from MongoDB
        try:
            from backend.mongodb import get_collection
            materials_collection = get_collection('study_materials')
            materials_collection.delete_one({'django_material_id': material.id})
        except Exception as e:
            print(f"Error deleting from MongoDB: {e}")
        
        # Delete local file if exists (legacy)
        if material.file:
            material.file.delete(save=False)
        
        # Delete the database record
        material.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download a study material - redirect to Cloudinary URL"""
        from django.http import HttpResponseRedirect
        material = self.get_object()
        
        if material.cloudinary_secure_url:
            # Redirect to Cloudinary secure URL for download
            return HttpResponseRedirect(material.cloudinary_secure_url)
        elif material.cloudinary_url:
            return HttpResponseRedirect(material.cloudinary_url)
        elif material.file:
            # Fallback to local file if Cloudinary URL not available
            from django.http import FileResponse
            return FileResponse(material.file.open(), as_attachment=True, filename=material.file.name.split('/')[-1])
        return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)