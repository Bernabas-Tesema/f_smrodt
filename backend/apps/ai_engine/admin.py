from django.contrib import admin
from .models import AIProviderConfig, AIPrediction, VehicleRiskScore, AIInferenceLog


@admin.register(AIProviderConfig)
class AIProviderConfigAdmin(admin.ModelAdmin):
    list_display = (
        'display_name',
        'provider',
        'model_name',
        'is_active',
        'status',
        'avg_latency_ms',
        'total_cost_usd',
        'last_health_check',
    )
    list_filter = ('provider', 'is_active', 'status')
    search_fields = ('display_name', 'model_name')
    readonly_fields = ('id', 'total_tokens_used', 'total_cost_usd', 'last_health_check')


@admin.register(AIPrediction)
class AIPredictionAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'prediction_type',
        'vehicle',
        'risk_score',
        'risk_level',
        'status',
        'provider_used',
        'created_at',
    )
    list_filter = ('prediction_type', 'risk_level', 'status', 'provider_used')
    search_fields = ('title', 'vehicle__plate_number', 'ai_explanation')
    readonly_fields = ('id', 'created_at', 'updated_at')
    raw_id_fields = ('vehicle',)


@admin.register(VehicleRiskScore)
class VehicleRiskScoreAdmin(admin.ModelAdmin):
    list_display = (
        'vehicle',
        'current_score',
        'category',
        'primary_risk_factor',
        'score_delta_7d',
        'last_calculated_at',
    )
    list_filter = ('category',)
    search_fields = ('vehicle__plate_number', 'primary_risk_factor')
    raw_id_fields = ('vehicle',)


@admin.register(AIInferenceLog)
class AIInferenceLogAdmin(admin.ModelAdmin):
    list_display = (
        'provider',
        'model',
        'endpoint',
        'total_tokens',
        'cost_usd',
        'latency_ms',
        'is_success',
        'created_at',
    )
    list_filter = ('provider', 'is_success')
    search_fields = ('endpoint', 'model', 'error_message')
    readonly_fields = ('id', 'created_at')
