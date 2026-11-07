import uuid
from django.db import models


class NotificationPreference(models.Model):
    CHANNEL_CHOICES = [
        ('sms', 'SMS'),
        ('email', 'Email'),
        ('push', 'Push (FCM)'),
        ('websocket', 'WebSocket'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile = models.ForeignKey(
        'accounts.UserProfile',
        on_delete=models.CASCADE,
        related_name='notification_preferences',
        null=True,
        blank=True,
    )
    email = models.EmailField(blank=True)
    channel = models.CharField(max_length=16, choices=CHANNEL_CHOICES)
    event_types = models.JSONField(default=list, blank=True)
    is_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'smrod_notification_preferences'
        ordering = ['channel']

    def __str__(self):
        return f'{self.channel} → {self.email or self.profile_id}'


class NotificationLog(models.Model):
    CHANNEL_CHOICES = [
        ('sms', 'SMS'),
        ('email', 'Email'),
        ('push', 'Push (FCM)'),
        ('websocket', 'WebSocket'),
    ]
    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
        ('acknowledged', 'Acknowledged'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    channel = models.CharField(max_length=16, choices=CHANNEL_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued', db_index=True)
    recipient = models.CharField(max_length=255)
    title = models.CharField(max_length=200)
    body = models.TextField()
    related_vehicle = models.ForeignKey(
        'vehicles.Vehicle',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications',
    )
    related_security_event = models.ForeignKey(
        'security_events.SecurityIncident',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications',
    )
    payload = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = 'smrod_notification_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.channel}:{self.title} [{self.status}]'
