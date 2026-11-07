import uuid
from django.db import models


class Geofence(models.Model):
    TYPE_CHOICES = [
        ('circle', 'Circle'),
        ('polygon', 'Polygon'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    fence_type = models.CharField(max_length=16, choices=TYPE_CHOICES, default='circle')
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='active', db_index=True)
    center_lat = models.FloatField()
    center_lng = models.FloatField()
    radius_meters = models.FloatField(null=True, blank=True)
    polygon_coordinates = models.JSONField(default=list, blank=True)
    speed_limit_kmh = models.PositiveSmallIntegerField(null=True, blank=True)
    breach_count_24h = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'smrod_geofences'
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.fence_type})'


class VehicleGeofenceAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    geofence = models.ForeignKey(Geofence, on_delete=models.CASCADE, related_name='vehicle_assignments')
    vehicle = models.ForeignKey(
        'vehicles.Vehicle',
        on_delete=models.CASCADE,
        related_name='geofence_assignments',
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'smrod_geofence_assignments'
        unique_together = ('geofence', 'vehicle')

    def __str__(self):
        return f'{self.vehicle_id} ↔ {self.geofence_id}'


class GeofenceBreachLog(models.Model):
    BREACH_CHOICES = [
        ('entry', 'Entry'),
        ('exit', 'Exit'),
        ('speed_limit', 'Speed Limit'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    geofence = models.ForeignKey(Geofence, on_delete=models.CASCADE, related_name='breaches')
    vehicle = models.ForeignKey(
        'vehicles.Vehicle',
        on_delete=models.CASCADE,
        related_name='geofence_breaches',
    )
    breach_type = models.CharField(max_length=20, choices=BREACH_CHOICES, default='exit')
    latitude = models.FloatField()
    longitude = models.FloatField()
    speed_kmh = models.FloatField(default=0.0)
    recorded_at = models.DateTimeField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'smrod_geofence_breaches'
        ordering = ['-recorded_at']

    def __str__(self):
        return f'{self.breach_type} {self.geofence_id} / {self.vehicle_id}'
