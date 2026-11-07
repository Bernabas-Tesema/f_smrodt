from django.contrib import admin
from .models import DashboardMetricCache


@admin.register(DashboardMetricCache)
class DashboardMetricCacheAdmin(admin.ModelAdmin):
    list_display = ('cache_key', 'metric_name', 'computed_at', 'expires_at')
    search_fields = ('cache_key', 'metric_name')
