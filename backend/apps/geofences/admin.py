from django.contrib import admin
from .models import Geofence, VehicleGeofenceAssignment, GeofenceBreachLog


@admin.register(Geofence)
class GeofenceAdmin(admin.ModelAdmin):
    list_display = ('name', 'fence_type', 'status', 'speed_limit_kmh', 'breach_count_24h')
    list_filter = ('fence_type', 'status')
    search_fields = ('name',)


@admin.register(VehicleGeofenceAssignment)
class VehicleGeofenceAssignmentAdmin(admin.ModelAdmin):
    list_display = ('geofence', 'vehicle', 'is_active', 'assigned_at')
    list_filter = ('is_active',)


@admin.register(GeofenceBreachLog)
class GeofenceBreachLogAdmin(admin.ModelAdmin):
    list_display = ('geofence', 'vehicle', 'breach_type', 'speed_kmh', 'recorded_at')
    list_filter = ('breach_type',)
