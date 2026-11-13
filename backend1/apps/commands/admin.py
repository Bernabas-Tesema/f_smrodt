from django.contrib import admin
from .models import RemoteCommandLog, CommandAuthorizationPolicy


@admin.register(CommandAuthorizationPolicy)
class CommandAuthorizationPolicyAdmin(admin.ModelAdmin):
    list_display = ('command_type', 'min_role', 'requires_speed_gate', 'max_speed_kmh', 'is_active')
    list_filter = ('is_active', 'requires_speed_gate')


@admin.register(RemoteCommandLog)
class RemoteCommandLogAdmin(admin.ModelAdmin):
    list_display = ('command_type', 'vehicle', 'status', 'issued_by', 'operator_role', 'created_at')
    list_filter = ('command_type', 'status', 'operator_role')
    search_fields = ('idempotency_key', 'issued_by', 'vehicle__plate_number')
