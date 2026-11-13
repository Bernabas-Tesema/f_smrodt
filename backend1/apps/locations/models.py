import uuid
from django.db import models


class LocationPoint(models.Model):
    id = models.BigAutoField(primary_key=True)
    vehicle = models.ForeignKey(
        'vehicles.Vehicle',
        on_delete=models.CASCADE,
        related_name='location_points',
    )
    recorded_at = models.DateTimeField(db_index=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    speed_kmh = models.FloatField(default=0.0)
    heading_deg = models.FloatField(default=0.0)
    accuracy_m = models.FloatField(null=True, blank=True)
    location_name = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'smrod_location_points'
        ordering = ['-recorded_at']
        indexes = [
            models.Index(fields=['vehicle', '-recorded_at']),
        ]

    def __str__(self):
        return f'Point {self.vehicle_id} ({self.latitude}, {self.longitude})'


class TripHistory(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('aborted', 'Aborted'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vehicle = models.ForeignKey(
        'vehicles.Vehicle',
        on_delete=models.CASCADE,
        related_name='trips',
    )
    started_at = models.DateTimeField(db_index=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    start_latitude = models.FloatField()
    start_longitude = models.FloatField()
    end_latitude = models.FloatField(null=True, blank=True)
    end_longitude = models.FloatField(null=True, blank=True)
    distance_km = models.FloatField(default=0.0)
    max_speed_kmh = models.FloatField(default=0.0)
    avg_speed_kmh = models.FloatField(default=0.0)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'smrod_trips'
        ordering = ['-started_at']

    def __str__(self):
        return f'Trip {self.vehicle_id} ({self.status})'
