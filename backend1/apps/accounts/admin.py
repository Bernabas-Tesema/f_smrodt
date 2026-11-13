from django.contrib import admin
from .models import (
    UserProfile,
    OperatorSession,
    Role,
    Permission,
    RolePermission,
    RoleAssignment,
)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'role', 'department', 'is_active', 'last_login_at')
    list_filter = ('role', 'is_active', 'two_factor_enabled')
    search_fields = ('full_name', 'email', 'supabase_uid')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(OperatorSession)
class OperatorSessionAdmin(admin.ModelAdmin):
    list_display = ('profile', 'session_jti', 'ip_address', 'is_revoked', 'expires_at', 'created_at')
    list_filter = ('is_revoked',)
    search_fields = ('session_jti', 'profile__email')


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('code', 'display_name', 'is_system', 'created_at')
    search_fields = ('code', 'display_name')


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('code', 'description')
    search_fields = ('code',)


@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ('role', 'permission')
    list_filter = ('role',)


@admin.register(RoleAssignment)
class RoleAssignmentAdmin(admin.ModelAdmin):
    list_display = ('profile', 'role', 'assigned_by', 'assigned_at')
    list_filter = ('role',)
