import uuid
from django.db import models
from apps.vehicles.models import Vehicle


class VSCUDevice(models.Model):
    CONNECTION_STATUS_CHOICES = [
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('degraded', 'Degraded'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    serial_number = models.CharField(max_length=40, unique=True, db_index=True)
    imei = models.CharField(max_length=15, unique=True, db_index=True)
    hardware_uid = models.CharField(max_length=50, unique=True)
    mac_address = models.CharField(max_length=20)

    # 1:1 or 1:0 vehicle assignment
    vehicle = models.OneToOneField(
        Vehicle,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='vscu_device'
    )

    connection_status = models.CharField(
        max_length=20,
        choices=CONNECTION_STATUS_CHOICES,
        default='offline'
    )
    firmware_version = models.CharField(max_length=30, default='v2.4.1-smrod-prod')

    # Battery & Connectivity
    battery_level = models.PositiveSmallIntegerField(default=100)
    battery_voltage = models.FloatField(default=4.2)
    lte_signal_rssi = models.IntegerField(default=-70)
    lte_operator = models.CharField(max_length=50, default='Safaricom 4G/LTE')
    gnss_satellites = models.PositiveSmallIntegerField(default=12)
    gnss_fix = models.CharField(max_length=20, default='3D_FIX')
    imu_status = models.CharField(max_length=30, default='normal')

    last_ping_at = models.DateTimeField(null=True, blank=True)
    mcu_temperature = models.FloatField(default=35.0)
    uptime_seconds = models.BigIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'smrod_vscu_devices'
        ordering = ['serial_number']

    def __str__(self):
        return f'{self.serial_number} (IMEI: {self.imei})'


class DeviceCertificate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device = models.ForeignKey(VSCUDevice, on_delete=models.CASCADE, related_name='certificates')
    client_cert_serial = models.CharField(max_length=128, unique=True)
    fingerprint_sha256 = models.CharField(max_length=64, blank=True)
    issued_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    is_revoked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'smrod_device_certs'
        ordering = ['-issued_at']

    def __str__(self):
        return f'Cert {self.client_cert_serial} ({self.device.serial_number})'


class DeviceDiagnosticsLog(models.Model):
    STATUS_CHOICES = [
        ('ok', 'OK'),
        ('warning', 'Warning'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device = models.ForeignKey(VSCUDevice, on_delete=models.CASCADE, related_name='diagnostics_logs')
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='ok')
    summary = models.CharField(max_length=255)
    details = models.JSONField(default=dict, blank=True)
    run_at = models.DateTimeField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'smrod_diagnostics_logs'
        ordering = ['-run_at']

    def __str__(self):
        return f'Diag {self.device.serial_number} [{self.status}]'
