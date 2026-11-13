from django.contrib import admin
from .models import EmergencyIncident, LockdownOrder


@admin.register(EmergencyIncident)
class EmergencyIncidentAdmin(admin.ModelAdmin):
    list_display = ('title', 'severity', 'status', 'triggered_by', 'created_at')
    list_filter = ('severity', 'status')


@admin.register(LockdownOrder)
class LockdownOrderAdmin(admin.ModelAdmin):
    list_display = ('order_type', 'status', 'issued_by', 'created_at', 'completed_at')
    list_filter = ('order_type', 'status')
