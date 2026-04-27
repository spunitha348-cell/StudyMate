from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.conf import settings
import re
import traceback
from students.models import Department, Year, Semester, Subject, StudyMaterial
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
            year = serializer.save()
            try:
                from backend.mongodb import get_collection
                years_collection = get_collection('years')
                years_collection.update_one(
                    {'id': str(year.id)},
                    {'$set': {
                        'id': str(year.id),
                        'name': year.name,
                        'number': year.number,
                        'created_at': str(year.created_at.isoformat()) if getattr(year, 'created_at', None) else None,
                    }},
                    upsert=True
                )
            except Exception as e:
                print(f"Error syncing year to MongoDB: {e}")
            return Response(YearSerializer(year).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def create_semester(self, request):
        """Create a new semester"""
        serializer = SemesterSerializer(data=request.data)
        if serializer.is_valid():
            semester = serializer.save()
            try:
                from backend.mongodb import get_collection
                semesters_collection = get_collection('semesters')
                department_obj = semester.department
                year_obj = semester.year
                semesters_collection.update_one(
                    {'id': str(semester.id)},
                    {'$set': {
                        'id': str(semester.id),
                        'department_id': str(department_obj.id) if department_obj else '',
                        'department_name': department_obj.name if department_obj else 'General',
                        'department_code': department_obj.code if department_obj else '',
                        'year_id': str(year_obj.id),
                        'year_name': year_obj.name,
                        'name': semester.name,
                        'number': semester.number,
                        'created_at': str(semester.created_at.isoformat()) if getattr(semester, 'created_at', None) else None,
                    }},
                    upsert=True
                )
            except Exception as e:
                print(f"Error syncing semester to MongoDB: {e}")
            return Response(SemesterSerializer(semester).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def create_subject(self, request):
        """Create a new subject"""
        serializer = SubjectSerializer(data=request.data)
        if serializer.is_valid():
            subject = serializer.save()
            try:
                from backend.mongodb import get_collection
                subjects_collection = get_collection('subjects')
                semester_obj = subject.semester
                year_obj = semester_obj.year
                department_obj = semester_obj.department
                subjects_collection.update_one(
                    {'id': str(subject.id)},
                    {'$set': {
                        'id': str(subject.id),
                        'semester_id': str(semester_obj.id),
                        'semester_name': semester_obj.name,
                        'year_name': year_obj.name,
                        'department_name': department_obj.name if department_obj else 'General',
                        'name': subject.name,
                        'code': subject.code or '',
                        'created_at': str(subject.created_at.isoformat()) if getattr(subject, 'created_at', None) else None,
                    }},
                    upsert=True
                )
            except Exception as e:
                print(f"Error syncing subject to MongoDB: {e}")
            return Response(SubjectSerializer(subject).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StudyMaterialManagementViewSet(viewsets.ModelViewSet):
    """Upload and manage study materials - Admin only"""
    serializer_class = StudyMaterialSerializer
    permission_classes = [IsAuthenticated, IsFaculty]
    
    def get_queryset(self):
        queryset = StudyMaterial.objects.all()
        
        # Filter by subject
        subject_id = self.request.query_params.get('subject', None)
        if subject_id and str(subject_id).isdigit():
            queryset = queryset.filter(subject_id=subject_id)
        
        # Filter by department (through subject -> semester)
        department_id = self.request.query_params.get('department', None)
        if department_id and str(department_id).isdigit():
            queryset = queryset.filter(subject__semester__department_id=department_id)
        
        # Filter by year (through subject -> semester)
        year_id = self.request.query_params.get('year', None)
        if year_id and str(year_id).isdigit():
            queryset = queryset.filter(subject__semester__year_id=year_id)
        
        # Filter by semester (through subject)
        semester_id = self.request.query_params.get('semester', None)
        if semester_id and str(semester_id).isdigit():
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

    def _extract_semester_number(self, semester_value, semester_name=''):
        if semester_value is not None and str(semester_value).isdigit():
            return int(semester_value)
        token = str(semester_value or '')
        if '::' in token:
            parts = token.split('::')
            if len(parts) == 3 and str(parts[2]).isdigit():
                return int(parts[2])
        name = str(semester_name or '')
        match = re.search(r'(\d+)', name)
        if match:
            return int(match.group(1))
        return 1

    def _ensure_sqlite_subject(self, requested_subject_id):
        """Ensure a Subject exists in SQLite for uploads when UI uses Mongo IDs."""
        if requested_subject_id and str(requested_subject_id).isdigit():
            subject = Subject.objects.filter(pk=int(requested_subject_id)).first()
            if subject:
                return subject

        # Static frontend fallback token format:
        # static::<department>::<year>::<semester>::<subject_name>
        requested_id = str(requested_subject_id or '').strip()
        if requested_id.startswith('static::'):
            parts = requested_id.split('::', 4)
            if len(parts) == 5:
                _, department_name, year_name, semester_raw, subject_name = parts
                if department_name and year_name and subject_name:
                    semester_number = self._extract_semester_number(semester_raw, semester_raw)
                    department_obj = Department.objects.filter(name__iexact=department_name).first()
                    if not department_obj:
                        department_obj = Department.objects.create(name=department_name, code=department_name)

                    year_obj = Year.objects.filter(name__iexact=year_name).first()
                    if not year_obj:
                        year_number = self._extract_semester_number(year_name, year_name)
                        if year_number < 1:
                            year_number = 1
                        year_obj = Year.objects.create(name=year_name, number=year_number)

                    semester_obj = Semester.objects.filter(
                        department=department_obj,
                        year=year_obj,
                        number=semester_number
                    ).first()
                    if not semester_obj:
                        semester_obj = Semester.objects.create(
                            department=department_obj,
                            year=year_obj,
                            number=semester_number,
                            name=f"Semester {semester_number}"
                        )

                    subject_obj = Subject.objects.filter(
                        semester=semester_obj,
                        name__iexact=subject_name
                    ).first()
                    if not subject_obj:
                        subject_obj = Subject.objects.create(
                            semester=semester_obj,
                            name=subject_name,
                            code=''
                        )
                    return subject_obj

        try:
            from backend.mongodb import get_collection
            subjects_collection = get_collection('subjects')
            semesters_collection = get_collection('semesters')
            years_collection = get_collection('years')
            departments_collection = get_collection('departments')
        except Exception:
            return None

        if not requested_id:
            return None

        subject_doc = subjects_collection.find_one({'id': requested_id})
        if not subject_doc and requested_id.isdigit():
            subject_doc = subjects_collection.find_one({'id': int(requested_id)})
        if not subject_doc:
            material_doc = get_collection('study_materials').find_one({'subject_id': int(requested_id) if requested_id.isdigit() else requested_id})
            if material_doc:
                subject_doc = {
                    'id': requested_id,
                    'name': material_doc.get('subject_name') or 'Unknown Subject',
                    'semester_id': f"{material_doc.get('department')}::{material_doc.get('year')}::{material_doc.get('semester')}",
                    'semester_name': f"Semester {material_doc.get('semester')}",
                    'year_name': material_doc.get('year'),
                    'department_name': material_doc.get('department'),
                    'code': '',
                }
        if not subject_doc:
            return None

        semester_id = subject_doc.get('semester_id')
        semester_doc = semesters_collection.find_one({'id': semester_id}) if semester_id else None
        if not semester_doc and isinstance(semester_id, str) and '::' in semester_id:
            parts = semester_id.split('::')
            if len(parts) == 3:
                semester_doc = {
                    'id': semester_id,
                    'department_name': parts[0],
                    'year_name': parts[1],
                    'number': int(parts[2]) if str(parts[2]).isdigit() else 1,
                    'name': f"Semester {parts[2]}",
                    'department_id': parts[0],
                    'year_id': parts[1],
                }

        department_name = (
            (semester_doc or {}).get('department_name')
            or subject_doc.get('department_name')
            or 'General'
        )
        year_name = (
            (semester_doc or {}).get('year_name')
            or subject_doc.get('year_name')
            or 'Year 1'
        )
        semester_number = self._extract_semester_number(
            (semester_doc or {}).get('number'),
            (semester_doc or {}).get('name') or subject_doc.get('semester_name', '')
        )

        department_obj = Department.objects.filter(name__iexact=department_name).first()
        if not department_obj:
            department_obj = Department.objects.create(name=department_name, code='')

        year_obj = Year.objects.filter(name__iexact=year_name).first()
        if not year_obj:
            year_obj = Year.objects.create(name=year_name, number=1)

        semester_obj = Semester.objects.filter(
            department=department_obj,
            year=year_obj,
            number=semester_number
        ).first()
        if not semester_obj:
            semester_obj = Semester.objects.create(
                department=department_obj,
                year=year_obj,
                number=semester_number,
                name=(semester_doc or {}).get('name') or f"Semester {semester_number}"
            )

        subject_name = subject_doc.get('name') or 'Unknown Subject'
        subject_obj = Subject.objects.filter(semester=semester_obj, name__iexact=subject_name).first()
        if not subject_obj:
            subject_obj = Subject.objects.create(
                semester=semester_obj,
                name=subject_name,
                code=subject_doc.get('code') or ''
            )
        return subject_obj

    def list(self, request, *args, **kwargs):
        # Mongo-first path
        mongo_query_ok = False
        try:
            from backend.mongodb import get_collection

            materials_collection = get_collection('study_materials')
            docs = list(materials_collection.find({}))
            mongo_query_ok = True

            subject_param = request.query_params.get('subject')
            department_param = request.query_params.get('department')
            year_param = request.query_params.get('year')
            semester_param = request.query_params.get('semester')
            type_param = request.query_params.get('type')
            search_param = (request.query_params.get('search') or '').strip().lower()

            def to_int(value):
                try:
                    return int(value)
                except (TypeError, ValueError):
                    return None

            filtered = []
            for doc in docs:
                if subject_param:
                    subject_int = to_int(subject_param)
                    if subject_int is not None:
                        if to_int(doc.get('subject_id')) != subject_int:
                            continue
                    elif str(doc.get('subject_id')) != str(subject_param):
                        continue

                if department_param and str(doc.get('department')) != str(department_param):
                    continue
                if year_param and str(doc.get('year')) != str(year_param):
                    continue
                if semester_param:
                    if '::' in str(semester_param):
                        parts = str(semester_param).split('::')
                        if len(parts) == 3:
                            if str(doc.get('department')) != parts[0]:
                                continue
                            if str(doc.get('year')) != parts[1]:
                                continue
                            if str(doc.get('semester')) != parts[2]:
                                continue
                        else:
                            continue
                    elif str(doc.get('semester')) != str(semester_param):
                        continue
                if type_param and str(doc.get('material_type')) != str(type_param):
                    continue

                if search_param:
                    searchable = " ".join([
                        str(doc.get('title') or ''),
                        str(doc.get('description') or ''),
                        str(doc.get('subject_name') or ''),
                    ]).lower()
                    if search_param not in searchable:
                        continue

                filtered.append(doc)

            filtered.sort(key=lambda d: str(d.get('created_at') or ''), reverse=True)
            result = []
            for doc in filtered:
                result.append({
                    'id': doc.get('django_material_id') or str(doc.get('_id')),
                    'subject': doc.get('subject_id'),
                    'subject_name': doc.get('subject_name', ''),
                    'title': doc.get('title', ''),
                    'description': doc.get('description', ''),
                    'material_type': doc.get('material_type', 'other'),
                    'youtube_url': doc.get('youtube_url'),
                    'file': None,
                    'file_url': doc.get('cloudinary_secure_url') or doc.get('cloudinary_url'),
                    'file_name': doc.get('file_name'),
                    'file_size': doc.get('file_size'),
                    'file_format': doc.get('file_format'),
                    'cloudinary_public_id': doc.get('cloudinary_public_id'),
                    'cloudinary_url': doc.get('cloudinary_url'),
                    'cloudinary_secure_url': doc.get('cloudinary_secure_url'),
                    'uploaded_by_name': doc.get('uploaded_by_username') or 'Unknown',
                    'created_at': doc.get('created_at'),
                    'updated_at': doc.get('updated_at') or doc.get('created_at'),
                })
            return Response(result)
        except Exception:
            pass

        if mongo_query_ok:
            return Response([])

        # Fallback path: Django ORM records
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Handle file upload with better error handling"""
        try:
            # Get uploaded file from request
            uploaded_file = request.FILES.get('file')
            youtube_url = request.data.get('youtube_url', '')
            if not uploaded_file and not youtube_url:
                return Response(
                    {'error': 'Please provide a file or a YouTube URL.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if uploaded_file:
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
            
            # Ensure subject exists in SQLite even when filter dropdown uses Mongo IDs
            request_data = request.data.copy()
            raw_subject_id = request_data.get('subject')
            if raw_subject_id:
                raw_subject_value = str(raw_subject_id).strip()
                subject_exists = raw_subject_value.isdigit() and Subject.objects.filter(pk=int(raw_subject_value)).exists()
                if not subject_exists:
                    resolved_subject = self._ensure_sqlite_subject(raw_subject_value)
                    if resolved_subject:
                        request_data['subject'] = str(resolved_subject.id)

            # Validate serializer (file field is optional in serializer)
            serializer = self.get_serializer(data=request_data)
            if not serializer.is_valid():
                return Response(
                    {'error': 'Validation failed', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Save material instance first (without file field - file goes to Cloudinary)
            material = serializer.save(uploaded_by=request.user)
            
            # Upload file to Cloudinary only when a file is provided
            try:
                from backend.mongodb import get_collection

                # Build folder path safely
                dept_name = material.subject.semester.department.name if material.subject.semester.department else "general"
                year_name = material.subject.semester.year.name.replace(' ', '_')
                semester_num = material.subject.semester.number
                subject_name = material.subject.name.replace(' ', '_').replace('/', '_')

                if uploaded_file:
                    from backend.cloudinary_utils import upload_file_to_cloudinary

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
                    departments_collection = get_collection('departments')
                    years_collection = get_collection('years')
                    semesters_collection = get_collection('semesters')
                    subjects_collection = get_collection('subjects')

                    semester_obj = material.subject.semester
                    department_obj = semester_obj.department
                    year_obj = semester_obj.year

                    if department_obj:
                        departments_collection.update_one(
                            {'id': str(department_obj.id)},
                            {'$set': {
                                'id': str(department_obj.id),
                                'name': department_obj.name,
                                'code': department_obj.code or '',
                                'created_at': str(department_obj.created_at.isoformat()) if getattr(department_obj, 'created_at', None) else None,
                            }},
                            upsert=True
                        )

                    years_collection.update_one(
                        {'id': str(year_obj.id)},
                        {'$set': {
                            'id': str(year_obj.id),
                            'name': year_obj.name,
                            'number': year_obj.number,
                            'created_at': str(year_obj.created_at.isoformat()) if getattr(year_obj, 'created_at', None) else None,
                        }},
                        upsert=True
                    )

                    semesters_collection.update_one(
                        {'id': str(semester_obj.id)},
                        {'$set': {
                            'id': str(semester_obj.id),
                            'department_id': str(department_obj.id) if department_obj else '',
                            'department_name': department_obj.name if department_obj else 'General',
                            'department_code': department_obj.code if department_obj else '',
                            'year_id': str(year_obj.id),
                            'year_name': year_obj.name,
                            'name': semester_obj.name,
                            'number': semester_obj.number,
                            'created_at': str(semester_obj.created_at.isoformat()) if getattr(semester_obj, 'created_at', None) else None,
                        }},
                        upsert=True
                    )

                    subjects_collection.update_one(
                        {'id': str(material.subject.id)},
                        {'$set': {
                            'id': str(material.subject.id),
                            'semester_id': str(semester_obj.id),
                            'semester_name': semester_obj.name,
                            'year_name': year_obj.name,
                            'department_name': department_obj.name if department_obj else 'General',
                            'name': material.subject.name,
                            'code': material.subject.code or '',
                            'created_at': str(material.subject.created_at.isoformat()) if getattr(material.subject, 'created_at', None) else None,
                        }},
                        upsert=True
                    )

                    material_doc = {
                        'django_material_id': material.id,
                        'subject_id': material.subject.id,
                        'subject_name': material.subject.name,
                        'title': material.title,
                        'description': material.description,
                        'material_type': material.material_type,
                        'youtube_url': material.youtube_url,
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
        pk = kwargs.get('pk')
        material = StudyMaterial.objects.filter(pk=pk).first()

        # If present in SQLite, follow existing delete flow.
        if material:
            if material.cloudinary_public_id:
                try:
                    from backend.cloudinary_utils import delete_file_from_cloudinary
                    delete_file_from_cloudinary(material.cloudinary_public_id)
                except Exception as e:
                    print(f"Error deleting from Cloudinary: {e}")

            try:
                from backend.mongodb import get_collection
                materials_collection = get_collection('study_materials')
                materials_collection.delete_one({'django_material_id': material.id})
            except Exception as e:
                print(f"Error deleting from MongoDB: {e}")

            if material.file:
                material.file.delete(save=False)

            material.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        # Mongo fallback: handle records that exist only in Mongo list responses.
        try:
            from backend.mongodb import get_collection
            materials_collection = get_collection('study_materials')

            mongo_query = {'django_material_id': int(pk)} if str(pk).isdigit() else {'django_material_id': pk}
            mongo_doc = materials_collection.find_one(mongo_query)
            if not mongo_doc and not str(pk).isdigit():
                # Optional fallback if frontend ever sends raw Mongo _id string
                from bson import ObjectId
                try:
                    mongo_doc = materials_collection.find_one({'_id': ObjectId(pk)})
                except Exception:
                    mongo_doc = None

            if not mongo_doc:
                return Response({'error': 'Study material not found'}, status=status.HTTP_404_NOT_FOUND)

            cloudinary_public_id = mongo_doc.get('cloudinary_public_id')
            if cloudinary_public_id:
                try:
                    from backend.cloudinary_utils import delete_file_from_cloudinary
                    delete_file_from_cloudinary(cloudinary_public_id)
                except Exception as e:
                    print(f"Error deleting Mongo fallback file from Cloudinary: {e}")

            materials_collection.delete_one({'_id': mongo_doc['_id']})
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            print(f"Error in Mongo fallback delete: {e}")
            return Response({'error': 'Failed to delete study material'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download a study material - redirect to Cloudinary URL"""
        from django.http import HttpResponseRedirect
        from django.http import Http404
        try:
            material = self.get_object()
            if material.cloudinary_secure_url:
                return HttpResponseRedirect(material.cloudinary_secure_url)
            if material.cloudinary_url:
                return HttpResponseRedirect(material.cloudinary_url)
            if material.file:
                from django.http import FileResponse
                return FileResponse(material.file.open(), as_attachment=True, filename=material.file.name.split('/')[-1])
        except Http404:
            pass

        try:
            from backend.mongodb import get_collection
            materials_collection = get_collection('study_materials')
            material_id = int(pk) if str(pk).isdigit() else None
            if material_id is not None:
                doc = materials_collection.find_one({'django_material_id': material_id})
                if doc:
                    file_url = doc.get('cloudinary_secure_url') or doc.get('cloudinary_url')
                    if file_url:
                        return HttpResponseRedirect(file_url)
        except Exception as e:
            print(f"Error downloading from Mongo fallback: {e}")
        return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)