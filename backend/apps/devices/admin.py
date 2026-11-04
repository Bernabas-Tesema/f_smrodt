from django.contrib import admin
from .models import VSCUDevice


@admin.register(VSCUDevice)
class VSCUDeviceAdmin(admin.ModelAdmin):
    list_display = (
        'serial_number',
        'imei',
        'vehicle',
        'connection_status',
        'firmware_version',
        'battery_level',
        'lte_signal_rssi',
        'last_ping_at',
    )
    list_filter = ('connection_status', 'firmware_version')
    search_fields = ('serial_number', 'imei', 'hardware_uid', 'mac_address')
    readonly_fields = ('id', 'created_at', 'updated_at')
    raw_id_fields = ('vehicle',)
