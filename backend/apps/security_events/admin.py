from django.contrib import admin
from .models import SecurityIncident, IncidentResolutionLog


@admin.register(SecurityIncident)
class SecurityIncidentAdmin(admin.ModelAdmin):
    list_display = ('event_type', 'severity', 'status', 'vehicle', 'risk_score', 'occurred_at')
    list_filter = ('event_type', 'severity', 'status')
    search_fields = ('description', 'vehicle__plate_number', 'assigned_operator')


@admin.register(IncidentResolutionLog)
class IncidentResolutionLogAdmin(admin.ModelAdmin):
    list_display = ('incident', 'from_status', 'to_status', 'actor_email', 'created_at')
