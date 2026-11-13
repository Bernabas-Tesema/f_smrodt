from django.contrib import admin
from .models import VSCUDevice, DeviceCertificate, DeviceDiagnosticsLog


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


@admin.register(DeviceCertificate)
class DeviceCertificateAdmin(admin.ModelAdmin):
    list_display = ('client_cert_serial', 'device', 'issued_at', 'expires_at', 'is_revoked')
    list_filter = ('is_revoked',)
    search_fields = ('client_cert_serial', 'device__serial_number')


@admin.register(DeviceDiagnosticsLog)
class DeviceDiagnosticsLogAdmin(admin.ModelAdmin):
    list_display = ('device', 'status', 'summary', 'run_at')
    list_filter = ('status',)
