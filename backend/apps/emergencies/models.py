import uuid
from django.db import models


class EmergencyIncident(models.Model):
    SEVERITY_CHOICES = [
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('responding', 'Responding'),
        ('contained', 'Contained'),
        ('closed', 'Closed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    severity = models.CharField(max_length=16, choices=SEVERITY_CHOICES, default='critical')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open', db_index=True)
    triggered_by = models.CharField(max_length=120)
    related_vehicle = models.ForeignKey(
        'vehicles.Vehicle',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='emergency_incidents',
    )
    related_security_event = models.ForeignKey(
        'security_events.SecurityIncident',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='emergency_incidents',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'smrod_emergency_incidents'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} [{self.status}]'


class LockdownOrder(models.Model):
    ORDER_TYPE_CHOICES = [
        ('fleet_lockdown', 'Fleet Lockdown'),
        ('broadcast_siren', 'Broadcast Siren'),
        ('selective_immobilize', 'Selective Immobilize'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('executing', 'Executing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    emergency = models.ForeignKey(
        EmergencyIncident,
        on_delete=models.CASCADE,
        related_name='lockdown_orders',
        null=True,
        blank=True,
    )
    order_type = models.CharField(max_length=32, choices=ORDER_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    issued_by = models.CharField(max_length=120)
    target_vehicle_ids = models.JSONField(default=list, blank=True)
    result_summary = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'smrod_emergency_orders'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.order_type} [{self.status}]'
