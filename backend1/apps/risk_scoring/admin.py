from django.contrib import admin
from .models import RiskRuleParameter, RiskScoreSnapshot


@admin.register(RiskRuleParameter)
class RiskRuleParameterAdmin(admin.ModelAdmin):
    list_display = ('code', 'display_name', 'weight', 'threshold', 'is_active')
    list_filter = ('is_active',)


@admin.register(RiskScoreSnapshot)
class RiskScoreSnapshotAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'score', 'category', 'primary_risk_factor', 'calculated_at')
    list_filter = ('category',)
