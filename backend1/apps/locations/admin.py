from django.contrib import admin
from .models import LocationPoint, TripHistory


@admin.register(LocationPoint)
class LocationPointAdmin(admin.ModelAdmin):
    list_display = ('id', 'vehicle', 'recorded_at', 'latitude', 'longitude', 'speed_kmh')
    search_fields = ('vehicle__plate_number', 'location_name')


@admin.register(TripHistory)
class TripHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'vehicle', 'status', 'started_at', 'ended_at', 'distance_km')
    list_filter = ('status',)
