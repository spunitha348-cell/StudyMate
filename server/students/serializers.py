from rest_framework import serializers
from .models import Department, Year, Semester, Subject, StudyMaterial
from accounts.serializers import UserSerializer

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'created_at']

class YearSerializer(serializers.ModelSerializer):
    class Meta:
        model = Year
        fields = ['id', 'name', 'number', 'created_at']

class SemesterSerializer(serializers.ModelSerializer):
    year_name = serializers.CharField(source='year.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_code = serializers.CharField(source='department.code', read_only=True)
    
    class Meta:
        model = Semester
        fields = ['id', 'department', 'department_name', 'department_code', 'year', 'year_name', 'name', 'number', 'created_at']

class SubjectSerializer(serializers.ModelSerializer):
    semester_name = serializers.CharField(source='semester.name', read_only=True)
    year_name = serializers.CharField(source='semester.year.name', read_only=True)
    department_name = serializers.CharField(source='semester.department.name', read_only=True)
    
    class Meta:
        model = Subject
        fields = ['id', 'semester', 'semester_name', 'year_name', 'department_name', 'name', 'code', 'created_at']

class StudyMaterialSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    file_url = serializers.SerializerMethodField()
    file_name = serializers.CharField(read_only=True)
    file_size = serializers.IntegerField(read_only=True)
    file_format = serializers.CharField(read_only=True)
    
    class Meta:
        model = StudyMaterial
        fields = ['id', 'subject', 'subject_name', 'title', 'description', 'material_type', 
                  'youtube_url', 'file', 'file_url', 'file_name', 'file_size', 'file_format',
                  'cloudinary_public_id', 'cloudinary_url', 'cloudinary_secure_url',
                  'uploaded_by_name', 'created_at', 'updated_at']
        read_only_fields = ['uploaded_by', 'created_at', 'updated_at', 'cloudinary_public_id', 
                          'cloudinary_url', 'cloudinary_secure_url', 'file_name', 'file_size', 'file_format']
    
    def validate_file(self, value):
        """File field is optional since we're using Cloudinary"""
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.method == 'POST':
            incoming_file = request.FILES.get('file')
            youtube_url = attrs.get('youtube_url')
            if not incoming_file and not youtube_url:
                raise serializers.ValidationError("Please provide either a file or a YouTube URL.")
        return attrs
    
    def get_file_url(self, obj):
        # Priority: Cloudinary secure URL > Cloudinary URL > local file URL
        if obj.cloudinary_secure_url:
            return obj.cloudinary_secure_url
        elif obj.cloudinary_url:
            return obj.cloudinary_url
        elif obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

