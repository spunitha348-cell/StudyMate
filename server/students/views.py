from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.http import HttpResponseRedirect
from django.http import Http404
import re
from .models import Department, Year, Semester, Subject, StudyMaterial
from .serializers import DepartmentSerializer, YearSerializer, SemesterSerializer, SubjectSerializer, StudyMaterialSerializer
from backend.mongodb import get_collection


def _to_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _normalize_material_doc(doc):
    return {
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
    }


def _parse_semester_token(token):
    """Token format for derived Mongo semesters: dept::year::number."""
    if not token or '::' not in token:
        return None
    parts = token.split('::')
    if len(parts) != 3:
        return None
    return {
        'department': parts[0],
        'year': parts[1],
        'semester': _to_int(parts[2]),
    }


def _extract_semester_number(value):
    number = _to_int(value)
    if number is not None:
        return number
    match = re.search(r'(\d+)', str(value or ''))
    return int(match.group(1)) if match else None

class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    """View all departments"""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        # Build base list from Django so departments created via migrations/admin are always present.
        django_departments = list(self.get_queryset().values('id', 'name', 'code', 'created_at'))
        combined = {}
        for dept in django_departments:
            name = str(dept.get('name') or '').strip()
            if not name:
                continue
            combined[name.lower()] = {
                'id': str(dept.get('id')),
                'name': name,
                'code': dept.get('code', '') or '',
                'created_at': dept.get('created_at'),
            }

        # Mongo-first: dedicated collection (merge, don't replace)
        try:
            departments_collection = get_collection('departments')
            docs = list(departments_collection.find({}, {'_id': 0, 'id': 1, 'name': 1, 'code': 1, 'created_at': 1}))
            if docs:
                for doc in docs:
                    name = str(doc.get('name') or '').strip()
                    if not name:
                        continue
                    key = name.lower()
                    existing = combined.get(key, {})
                    combined[key] = {
                        'id': str(doc.get('id') or existing.get('id') or name),
                        'name': name,
                        'code': doc.get('code', existing.get('code', '')) or '',
                        'created_at': doc.get('created_at') or existing.get('created_at'),
                    }
        except Exception:
            pass

        # Mongo fallback: derive from uploaded material metadata (merge as additional source)
        try:
            materials_collection = get_collection('study_materials')
            department_names = sorted(
                d for d in materials_collection.distinct('department') if isinstance(d, str) and d.strip()
            )
            if department_names:
                for name in department_names:
                    key = name.lower()
                    if key not in combined:
                        combined[key] = {'id': name, 'name': name, 'code': '', 'created_at': None}
        except Exception:
            pass

        if combined:
            return Response(sorted(combined.values(), key=lambda item: item['name'].lower()))

        return super().list(request, *args, **kwargs)

class YearViewSet(viewsets.ReadOnlyModelViewSet):
    """View all years"""
    queryset = Year.objects.all()
    serializer_class = YearSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        # Mongo-first: dedicated collection
        try:
            years_collection = get_collection('years')
            docs = list(years_collection.find({}, {'_id': 0, 'id': 1, 'name': 1, 'number': 1, 'created_at': 1}))
            if docs:
                unique = {}
                for doc in docs:
                    name = str(doc.get('name') or '').strip()
                    if not name:
                        continue
                    unique[name.lower()] = {
                        'id': name,
                        'name': name,
                        'number': doc.get('number', 1),
                        'created_at': doc.get('created_at'),
                    }
                return Response(sorted(unique.values(), key=lambda item: item['name'].lower()))
        except Exception:
            pass

        # Mongo fallback: derive from uploaded material metadata
        try:
            materials_collection = get_collection('study_materials')
            year_names = sorted(
                y for y in materials_collection.distinct('year') if isinstance(y, str) and y.strip()
            )
            if year_names:
                derived = [{'id': name, 'name': name, 'number': idx + 1, 'created_at': None} for idx, name in enumerate(year_names)]
                return Response(derived)
        except Exception:
            pass

        return super().list(request, *args, **kwargs)

class SemesterViewSet(viewsets.ReadOnlyModelViewSet):
    """View semesters with filters"""
    serializer_class = SemesterSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Semester.objects.all()
        
        # Filter by department
        department_id = self.request.query_params.get('department', None)
        if department_id and str(department_id).isdigit():
            queryset = queryset.filter(department_id=department_id)
        
        # Filter by year
        year_id = self.request.query_params.get('year', None)
        if year_id and str(year_id).isdigit():
            queryset = queryset.filter(year_id=year_id)
        
        return queryset

    def list(self, request, *args, **kwargs):
        # Mongo-first: dedicated collection
        try:
            semesters_collection = get_collection('semesters')
            department_id = request.query_params.get('department')
            year_id = request.query_params.get('year')
            docs = list(semesters_collection.find({}, {'_id': 0}))
            filtered_docs = []
            for doc in docs:
                if department_id:
                    if str(doc.get('department_id')) != str(department_id) and str(doc.get('department_name')) != str(department_id):
                        continue
                if year_id:
                    if str(doc.get('year_id')) != str(year_id) and str(doc.get('year_name')) != str(year_id):
                        continue
                semester_number = _to_int(doc.get('number'))
                if semester_number is None:
                    semester_number = _to_int(doc.get('name')) or 1
                department_name = str(doc.get('department_name') or doc.get('department_id') or '').strip()
                year_name = str(doc.get('year_name') or doc.get('year_id') or '').strip()
                if not department_name or not year_name:
                    continue
                filtered_docs.append({
                    'id': f"{department_name}::{year_name}::{semester_number}",
                    'department': department_name,
                    'department_name': department_name,
                    'department_code': doc.get('department_code', ''),
                    'year': year_name,
                    'year_name': year_name,
                    'name': f"Semester {semester_number}",
                    'number': semester_number,
                    'created_at': doc.get('created_at'),
                })
            if docs:
                unique = {}
                for item in filtered_docs:
                    unique[item['id']] = item
                return Response(sorted(unique.values(), key=lambda item: item['number']))
        except Exception:
            pass

        # Mongo fallback: derive from uploaded material metadata
        try:
            materials_collection = get_collection('study_materials')
            department_filter = request.query_params.get('department')
            year_filter = request.query_params.get('year')
            docs = list(materials_collection.find({}, {'_id': 0, 'department': 1, 'year': 1, 'semester': 1}))
            derived_map = {}
            for doc in docs:
                department = doc.get('department')
                year = doc.get('year')
                semester = doc.get('semester')
                if not department or not year or semester is None:
                    continue
                if department_filter and department_filter != str(department):
                    continue
                if year_filter and year_filter != str(year):
                    continue
                token = f"{department}::{year}::{semester}"
                if token not in derived_map:
                    sem_num = _to_int(semester) or 0
                    derived_map[token] = {
                        'id': token,
                        'department': str(department),
                        'department_name': str(department),
                        'department_code': '',
                        'year': str(year),
                        'year_name': str(year),
                        'name': f"Semester {sem_num}" if sem_num else f"Semester {semester}",
                        'number': sem_num,
                        'created_at': None,
                    }
            if derived_map:
                sorted_items = sorted(derived_map.values(), key=lambda item: item.get('number') or 0)
                return Response(sorted_items)
        except Exception:
            pass

        return super().list(request, *args, **kwargs)

class SubjectViewSet(viewsets.ReadOnlyModelViewSet):
    """View subjects with filters"""
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Subject.objects.all()
        
        # Filter by semester
        semester_id = self.request.query_params.get('semester', None)
        if semester_id and str(semester_id).isdigit():
            queryset = queryset.filter(semester_id=semester_id)
        
        # Filter by department (through semester)
        department_id = self.request.query_params.get('department', None)
        if department_id and str(department_id).isdigit():
            queryset = queryset.filter(semester__department_id=department_id)
        
        # Filter by year (through semester)
        year_id = self.request.query_params.get('year', None)
        if year_id and str(year_id).isdigit():
            queryset = queryset.filter(semester__year_id=year_id)
        
        # Search by subject name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(code__icontains=search)
            )
        
        return queryset

    def list(self, request, *args, **kwargs):
        # Mongo-first: dedicated collection
        try:
            subjects_collection = get_collection('subjects')
            semester_id = request.query_params.get('semester')
            department_id = request.query_params.get('department')
            year_id = request.query_params.get('year')
            search = request.query_params.get('search')
            docs = list(subjects_collection.find({}, {'_id': 0}))
            try:
                preferred_subject_ids = {
                    str(sid) for sid in get_collection('study_materials').distinct('subject_id') if sid is not None
                }
            except Exception:
                preferred_subject_ids = set()
            filtered_docs = []
            for doc in docs:
                if semester_id:
                    parsed_sem = _parse_semester_token(semester_id)
                    if parsed_sem:
                        doc_department = str(doc.get('department_name') or doc.get('department_id') or '')
                        doc_year = str(doc.get('year_name') or doc.get('year_id') or '')
                        sem_from_name = _extract_semester_number(doc.get('semester_name'))
                        if doc_department != parsed_sem['department'] or doc_year != parsed_sem['year'] or sem_from_name != parsed_sem['semester']:
                            continue
                    elif str(doc.get('semester_id')) != str(semester_id):
                        continue
                if department_id and str(doc.get('department_name')) != str(department_id) and str(doc.get('department_id')) != str(department_id):
                    continue
                if year_id and str(doc.get('year_name')) != str(year_id) and str(doc.get('year_id')) != str(year_id):
                    continue
                if search:
                    searchable = f"{doc.get('name', '')} {doc.get('code', '')}".lower()
                    if search.lower() not in searchable:
                        continue
                filtered_docs.append(doc)
            if docs:
                unique = {}
                for item in filtered_docs:
                    sem_num = _extract_semester_number(item.get('semester_name'))
                    key = f"{item.get('name','').strip().lower()}::{item.get('department_name','')}::{item.get('year_name','')}::{sem_num}"
                    current = unique.get(key)
                    candidate_is_preferred = str(item.get('id')) in preferred_subject_ids
                    current_is_preferred = str(current.get('id')) in preferred_subject_ids if current else False
                    if current is None or (candidate_is_preferred and not current_is_preferred):
                        unique[key] = item
                return Response(sorted(unique.values(), key=lambda item: str(item.get('name', '')).lower()))
        except Exception:
            pass

        # Mongo fallback: derive from uploaded material metadata
        try:
            materials_collection = get_collection('study_materials')
            semester_filter = request.query_params.get('semester')
            parsed_sem = _parse_semester_token(semester_filter) if semester_filter else None
            search = (request.query_params.get('search') or '').strip().lower()
            docs = list(materials_collection.find({}, {'_id': 0, 'subject_id': 1, 'subject_name': 1, 'department': 1, 'year': 1, 'semester': 1}))
            subjects_map = {}
            for doc in docs:
                subject_name = doc.get('subject_name')
                if not subject_name:
                    continue
                if parsed_sem:
                    if str(doc.get('department')) != parsed_sem['department']:
                        continue
                    if str(doc.get('year')) != parsed_sem['year']:
                        continue
                    if _to_int(doc.get('semester')) != parsed_sem['semester']:
                        continue
                if search and search not in str(subject_name).lower():
                    continue
                subject_id = doc.get('subject_id') if doc.get('subject_id') is not None else subject_name
                if subject_id not in subjects_map:
                    subjects_map[subject_id] = {
                        'id': subject_id,
                        'semester': semester_filter or '',
                        'semester_name': f"Semester {doc.get('semester')}" if doc.get('semester') is not None else '',
                        'year_name': str(doc.get('year') or ''),
                        'department_name': str(doc.get('department') or ''),
                        'name': subject_name,
                        'code': '',
                        'created_at': None,
                    }
            if subjects_map:
                sorted_items = sorted(subjects_map.values(), key=lambda item: item['name'])
                return Response(sorted_items)
        except Exception:
            pass

        return super().list(request, *args, **kwargs)

class StudyMaterialViewSet(viewsets.ReadOnlyModelViewSet):
    """Browse, search and download study materials"""
    serializer_class = StudyMaterialSerializer
    permission_classes = [IsAuthenticated]
    
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

    def list(self, request, *args, **kwargs):
        # Mongo-first path
        mongo_query_ok = False
        try:
            materials_collection = get_collection('study_materials')
            docs = list(materials_collection.find({}))
            mongo_query_ok = True

            subject_param = request.query_params.get('subject')
            department_param = request.query_params.get('department')
            year_param = request.query_params.get('year')
            semester_param = request.query_params.get('semester')
            type_param = request.query_params.get('type')
            search_param = (request.query_params.get('search') or '').strip().lower()

            filtered = []
            for doc in docs:
                # Subject filter
                if subject_param:
                    subject_int = _to_int(subject_param)
                    if subject_int is not None:
                        if _to_int(doc.get('subject_id')) != subject_int:
                            continue
                    elif str(doc.get('subject_id')) != str(subject_param):
                        continue

                # Department/year/semester filters use derived metadata in Mongo docs
                if department_param and str(doc.get('department')) != str(department_param):
                    continue
                if year_param and str(doc.get('year')) != str(year_param):
                    continue
                if semester_param:
                    parsed_sem = _parse_semester_token(semester_param)
                    if parsed_sem:
                        if str(doc.get('department')) != parsed_sem['department']:
                            continue
                        if str(doc.get('year')) != parsed_sem['year']:
                            continue
                        if _to_int(doc.get('semester')) != parsed_sem['semester']:
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
            return Response([_normalize_material_doc(doc) for doc in filtered])
        except Exception:
            pass

        if mongo_query_ok:
            return Response([])

        # Fallback path: Django ORM records
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download a study material - redirect to Cloudinary URL"""
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

        # Mongo fallback
        try:
            materials_collection = get_collection('study_materials')
            material_id = _to_int(pk)
            query = {'django_material_id': material_id} if material_id is not None else {'django_material_id': pk}
            doc = materials_collection.find_one(query)
            if doc:
                file_url = doc.get('cloudinary_secure_url') or doc.get('cloudinary_url')
                if file_url:
                    return HttpResponseRedirect(file_url)
        except Exception:
            pass

        return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

