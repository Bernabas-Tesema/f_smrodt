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
