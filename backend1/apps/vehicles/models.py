import uuid
from django.db import models


class Vehicle(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'Maintenance'),
    ]

    SECURITY_STATUS_CHOICES = [
        ('normal', 'Normal'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plate_number = models.CharField(max_length=20, unique=True, db_index=True)
    vin = models.CharField(max_length=17, unique=True)
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.PositiveIntegerField()
    color = models.CharField(max_length=30, blank=True)

    # Owner details
    owner_name = models.CharField(max_length=120)
    owner_email = models.EmailField()
    owner_phone = models.CharField(max_length=30)

    # Operational status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    security_status = models.CharField(max_length=20, choices=SECURITY_STATUS_CHOICES, default='normal')
    is_immobilized = models.BooleanField(default=False)
    current_speed = models.FloatField(default=0.0)
    heading = models.FloatField(default=0.0)
    last_latitude = models.FloatField(null=True, blank=True)
    last_longitude = models.FloatField(null=True, blank=True)
    last_telemetry_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'smrod_vehicles'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.plate_number} ({self.make} {self.model})'


class VehicleStatusHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='status_logs')
    from_status = models.CharField(max_length=20, blank=True)
    to_status = models.CharField(max_length=20)
    from_security_status = models.CharField(max_length=20, blank=True)
    to_security_status = models.CharField(max_length=20, blank=True)
    reason = models.CharField(max_length=255, blank=True)
    changed_by = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'smrod_vehicle_status_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.vehicle_id}: {self.from_status} → {self.to_status}'
