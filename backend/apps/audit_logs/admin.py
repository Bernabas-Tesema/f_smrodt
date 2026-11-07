from django.contrib import admin
from .models import AuditTrailRecord


@admin.register(AuditTrailRecord)
class AuditTrailRecordAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'actor_email', 'actor_role', 'action', 'target_resource', 'status')
    list_filter = ('status', 'actor_role', 'action')
    search_fields = ('actor_email', 'action', 'target_resource', 'details')
    readonly_fields = ('id', 'timestamp', 'integrity_hash')
