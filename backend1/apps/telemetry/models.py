import uuid
from django.db import models


class TelemetryReading(models.Model):
    id = models.BigAutoField(primary_key=True)
    vehicle = models.ForeignKey(
        'vehicles.Vehicle',
        on_delete=models.CASCADE,
        related_name='telemetry_readings',
    )
    device = models.ForeignKey(
        'devices.VSCUDevice',
        on_delete=models.CASCADE,
        related_name='telemetry_readings',
    )
    recorded_at = models.DateTimeField(db_index=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    speed_kmh = models.FloatField(default=0.0)
    heading_deg = models.FloatField(default=0.0)
    altitude_m = models.FloatField(null=True, blank=True)
    battery_voltage = models.FloatField(default=0.0)
    imu_g_force = models.FloatField(default=1.0)
    gnss_satellites = models.PositiveSmallIntegerField(default=0)
    mcu_temperature = models.FloatField(null=True, blank=True)
    raw_payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'smrod_telemetry_readings'
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['vehicle', '-recorded_at']),
            models.Index(fields=['device', '-recorded_at']),
        ]

    def __str__(self):
        return f'Telemetry {self.vehicle_id} @ {self.recorded_at}'


class IMUImpactRecord(models.Model):
    IMPACT_CHOICES = [
        ('low', 'Low'),
        ('moderate', 'Moderate'),
        ('high', 'High'),
        ('severe', 'Severe'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vehicle = models.ForeignKey(
        'vehicles.Vehicle',
        on_delete=models.CASCADE,
        related_name='imu_impacts',
    )
    device = models.ForeignKey(
        'devices.VSCUDevice',
        on_delete=models.CASCADE,
        related_name='imu_impacts',
    )
    recorded_at = models.DateTimeField(db_index=True)
    peak_g_force = models.FloatField()
    impact_level = models.CharField(max_length=16, choices=IMPACT_CHOICES, default='moderate')
    axis_x = models.FloatField(default=0.0)
    axis_y = models.FloatField(default=0.0)
    axis_z = models.FloatField(default=0.0)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'smrod_imu_records'
        ordering = ['-recorded_at']

    def __str__(self):
        return f'IMU {self.impact_level} {self.peak_g_force}g @ {self.recorded_at}'
