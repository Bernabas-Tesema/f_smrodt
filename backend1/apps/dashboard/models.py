import uuid
from django.db import models


class DashboardMetricCache(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cache_key = models.CharField(max_length=80, unique=True, db_index=True)
    metric_name = models.CharField(max_length=120)
    metric_value = models.JSONField(default=dict)
    computed_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'smrod_dashboard_cache'
        ordering = ['cache_key']
        verbose_name_plural = 'Dashboard metric caches'

    def __str__(self):
        return f'{self.cache_key} @ {self.computed_at}'
