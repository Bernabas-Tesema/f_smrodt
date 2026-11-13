import uuid
from django.db import models


class SecurityIncident(models.Model):
    EVENT_TYPE_CHOICES = [
        ('unauthorized_movement', 'Unauthorized Movement'),
        ('tampering', 'Tampering'),
        ('power_loss', 'Power Loss'),
        ('crash_detected', 'Crash Detected'),
        ('geofence_breach', 'Geofence Breach'),
        ('device_offline', 'Device Offline'),
        ('sos_emergency', 'SOS Emergency'),
    ]
    SEVERITY_CHOICES = [
        ('critical', 'Critical'),
        ('high', 'High'),
        ('moderate', 'Moderate'),
        ('low', 'Low'),
    ]
    STATUS_CHOICES = [
        ('new', 'New'),
        ('acknowledged', 'Acknowledged'),
        ('investigating', 'Investigating'),
        ('resolved', 'Resolved'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vehicle = models.ForeignKey(
        'vehicles.Vehicle',
        on_delete=models.CASCADE,
        related_name='security_incidents',
    )
    device = models.ForeignKey(
        'devices.VSCUDevice',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='security_incidents',
    )
    event_type = models.CharField(max_length=40, choices=EVENT_TYPE_CHOICES, db_index=True)
    severity = models.CharField(max_length=16, choices=SEVERITY_CHOICES, default='moderate', db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', db_index=True)
    risk_score = models.PositiveSmallIntegerField(default=0)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    location_name = models.CharField(max_length=255, blank=True)
    description = models.TextField()
    assigned_operator = models.CharField(max_length=120, blank=True)
    resolution_notes = models.TextField(blank=True)
    telemetry_snapshot = models.JSONField(default=dict, blank=True)
    occurred_at = models.DateTimeField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'smrod_security_events'
        ordering = ['-occurred_at']

    def __str__(self):
        return f'{self.event_type} [{self.severity}] {self.vehicle_id}'


class IncidentResolutionLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    incident = models.ForeignKey(
        SecurityIncident,
        on_delete=models.CASCADE,
        related_name='resolution_logs',
    )
    from_status = models.CharField(max_length=20)
    to_status = models.CharField(max_length=20)
    actor_email = models.EmailField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'smrod_event_resolutions'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.incident_id}: {self.from_status} → {self.to_status}'
