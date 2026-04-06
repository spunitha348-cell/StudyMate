from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'departments'
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Year(models.Model):
    name = models.CharField(max_length=100, unique=True)
    number = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'years'
        ordering = ['number']
    
    def __str__(self):
        return self.name

class Semester(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='semesters', null=True, blank=True)
    year = models.ForeignKey(Year, on_delete=models.CASCADE, related_name='semesters')
    name = models.CharField(max_length=100)
    number = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'semesters'
        unique_together = ['department', 'year', 'number']
        ordering = ['year', 'number']
    
    def __str__(self):
        dept = f"{self.department.name} - " if self.department else ""
        return f"{dept}{self.year.name} - Semester {self.number}"

class Subject(models.Model):
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='subjects')
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'subjects'
        ordering = ['semester', 'name']
    
    def __str__(self):
        return f"{self.semester} - {self.name}"

class StudyMaterial(models.Model):
    MATERIAL_TYPES = [
        ('note', 'Note'),
        ('question_paper', 'Question Paper'),
        ('syllabus', 'Syllabus'),
        ('other', 'Other'),
    ]
    
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='materials')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    material_type = models.CharField(max_length=20, choices=MATERIAL_TYPES, default='note')
    youtube_url = models.URLField(max_length=500, blank=True, null=True)
    # Cloudinary fields
    cloudinary_public_id = models.CharField(max_length=255, blank=True, null=True)
    cloudinary_url = models.URLField(max_length=500, blank=True, null=True)
    cloudinary_secure_url = models.URLField(max_length=500, blank=True, null=True)
    file_name = models.CharField(max_length=255, blank=True, null=True)
    file_size = models.BigIntegerField(blank=True, null=True)  # Size in bytes
    file_format = models.CharField(max_length=50, blank=True, null=True)  # pdf, docx, etc.
    # Legacy file field for backward compatibility (can be removed after migration)
    file = models.FileField(upload_to='study_materials/', blank=True, null=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'study_materials'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def file_url(self):
        """Return Cloudinary URL if available, otherwise fallback to file field"""
        if self.cloudinary_secure_url:
            return self.cloudinary_secure_url
        elif self.cloudinary_url:
            return self.cloudinary_url
        elif self.file:
            return self.file.url
        return None

