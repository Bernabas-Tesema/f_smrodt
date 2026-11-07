from django.contrib import admin
from .models import TelemetryReading, IMUImpactRecord


@admin.register(TelemetryReading)
class TelemetryReadingAdmin(admin.ModelAdmin):
    list_display = ('id', 'vehicle', 'device', 'recorded_at', 'speed_kmh', 'battery_voltage')
    list_filter = ('recorded_at',)
    search_fields = ('vehicle__plate_number', 'device__serial_number')
    readonly_fields = ('created_at',)


@admin.register(IMUImpactRecord)
class IMUImpactRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'vehicle', 'impact_level', 'peak_g_force', 'recorded_at')
    list_filter = ('impact_level',)
