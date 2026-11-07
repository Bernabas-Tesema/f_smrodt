import uuid
from django.db import models


class RiskRuleParameter(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=64, unique=True)
    display_name = models.CharField(max_length=120)
    weight = models.FloatField(default=0.0, help_text='Relative weight in fleet risk formula')
    threshold = models.FloatField(default=0.0)
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'smrod_risk_rules'
        ordering = ['code']

    def __str__(self):
        return f'{self.code} (w={self.weight})'


class RiskScoreSnapshot(models.Model):
    CATEGORY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vehicle = models.ForeignKey(
        'vehicles.Vehicle',
        on_delete=models.CASCADE,
        related_name='risk_snapshots',
    )
    score = models.PositiveSmallIntegerField(default=0)
    category = models.CharField(max_length=16, choices=CATEGORY_CHOICES, default='low')
    factor_breakdown = models.JSONField(default=dict, blank=True)
    primary_risk_factor = models.CharField(max_length=120, blank=True)
    calculated_at = models.DateTimeField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'smrod_risk_scores'
        ordering = ['-calculated_at']
        indexes = [
            models.Index(fields=['vehicle', '-calculated_at']),
        ]

    def __str__(self):
        return f'{self.vehicle_id}: {self.score} ({self.category})'
