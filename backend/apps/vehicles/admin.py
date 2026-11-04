from django.contrib import admin
from .models import Vehicle


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = (
        'plate_number',
        'make',
        'model',
        'year',
        'owner_name',
        'status',
        'security_status',
        'is_immobilized',
        'current_speed',
        'updated_at',
    )
    list_filter = ('status', 'security_status', 'is_immobilized', 'make')
    search_fields = ('plate_number', 'vin', 'owner_name', 'owner_email', 'owner_phone')
    readonly_fields = ('id', 'created_at', 'updated_at')
    ordering = ('-updated_at',)
