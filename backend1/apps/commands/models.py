import uuid
from django.db import models


class CommandAuthorizationPolicy(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    command_type = models.CharField(max_length=32, unique=True)
    min_role = models.CharField(max_length=32, default='operations')
    requires_speed_gate = models.BooleanField(default=False)
    max_speed_kmh = models.FloatField(default=5.0)
    requires_confirmation = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'smrod_command_policies'
        ordering = ['command_type']
        verbose_name_plural = 'Command authorization policies'

    def __str__(self):
        return f'{self.command_type} ≥ {self.min_role}'


class RemoteCommandLog(models.Model):
    COMMAND_TYPE_CHOICES = [
        ('immobilize', 'Immobilize'),
        ('mobilize', 'Mobilize'),
        ('trigger_alarm', 'Trigger Alarm'),
        ('lock_doors', 'Lock Doors'),
        ('unlock_doors', 'Unlock Doors'),
        ('diagnostics_ping', 'Diagnostics Ping'),
        ('reboot_device', 'Reboot Device'),
    ]
    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('dispatched', 'Dispatched'),
        ('acknowledged', 'Acknowledged'),
        ('executed', 'Executed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    idempotency_key = models.CharField(max_length=128, unique=True, db_index=True)
    vehicle = models.ForeignKey(
        'vehicles.Vehicle',
        on_delete=models.CASCADE,
        related_name='remote_commands',
    )
    device = models.ForeignKey(
        'devices.VSCUDevice',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='remote_commands',
    )
    command_type = models.CharField(max_length=32, choices=COMMAND_TYPE_CHOICES, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued', db_index=True)
    issued_by = models.CharField(max_length=120)
    operator_role = models.CharField(max_length=32, default='operations')
    safety_check_passed = models.BooleanField(default=False)
    delivery_latency_ms = models.PositiveIntegerField(null=True, blank=True)
    execution_result = models.TextField(blank=True)
    mqtt_topic = models.CharField(max_length=255, blank=True)
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'smrod_remote_commands'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.command_type} → {self.vehicle_id} [{self.status}]'
