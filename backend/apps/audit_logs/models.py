import uuid
from django.db import models


class AuditTrailRecord(models.Model):
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('failure', 'Failure'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    actor_email = models.EmailField(db_index=True)
    actor_role = models.CharField(max_length=32, default='viewer')
    action = models.CharField(max_length=120, db_index=True)
    target_resource = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default='success')
    details = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    integrity_hash = models.CharField(max_length=128, blank=True)

    class Meta:
        db_table = 'smrod_audit_logs'
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.actor_email}: {self.action} [{self.status}]'
