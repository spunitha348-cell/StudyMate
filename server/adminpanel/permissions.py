from rest_framework import permissions

class IsFaculty(permissions.BasePermission):
    """Faculty can access admin-panel APIs (materials, structure, student records)."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) == 'faculty'
        )
