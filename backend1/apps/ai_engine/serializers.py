from rest_framework import serializers
from .models import AIProviderConfig, AIPrediction, VehicleRiskScore, AIInferenceLog
from apps.vehicles.models import Vehicle


class AIProviderConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIProviderConfig
        fields = [
            'id', 'provider', 'display_name', 'model_name', 'is_active', 'is_default',
            'api_key_env_var', 'max_tokens', 'temperature', 'status', 'avg_latency_ms',
            'uptime_pct', 'total_tokens_used', 'total_cost_usd', 'error_count_24h',
            'last_health_check'
        ]
        read_only_fields = ['id', 'total_tokens_used', 'total_cost_usd', 'last_health_check']


class AIPredictionSerializer(serializers.ModelSerializer):
    vehicle_plate = serializers.CharField(source='vehicle.plate_number', read_only=True)
    vehicle_make = serializers.CharField(source='vehicle.make', read_only=True)
    vehicle_model = serializers.CharField(source='vehicle.model', read_only=True)

    class Meta:
        model = AIPrediction
        fields = [
            'id', 'vehicle', 'vehicle_plate', 'vehicle_make', 'vehicle_model',
            'prediction_type', 'title', 'risk_score', 'risk_level', 'confidence_score',
            'ai_explanation', 'recommended_actions', 'contributing_factors',
            'raw_telemetry_snapshot', 'status', 'false_positive_reason',
            'assigned_operator', 'provider_used', 'model_version',
            'inference_latency_ms', 'created_at', 'updated_at',
            'acknowledged_at', 'resolved_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class VehicleRiskScoreSerializer(serializers.ModelSerializer):
    vehicle_plate = serializers.CharField(source='vehicle.plate_number', read_only=True)
    vehicle_make = serializers.CharField(source='vehicle.make', read_only=True)
    vehicle_model = serializers.CharField(source='vehicle.model', read_only=True)

    class Meta:
        model = VehicleRiskScore
        fields = [
            'id', 'vehicle', 'vehicle_plate', 'vehicle_make', 'vehicle_model',
            'current_score', 'category', 'factor_breakdown', 'score_delta_7d',
            'primary_risk_factor', 'last_calculated_at'
        ]
        read_only_fields = ['id', 'last_calculated_at']


class AIInferenceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIInferenceLog
        fields = '__all__'


class FalsePositiveAuditSerializer(serializers.Serializer):
    reason = serializers.CharField(required=True, min_length=5, max_length=500)
    operator_notes = serializers.CharField(required=False, allow_blank=True)


class InvestigationRequestSerializer(serializers.Serializer):
    event_id = serializers.CharField(required=True)
    focus_area = serializers.ChoiceField(
        choices=['telemetry_anomaly', 'theft_vectors', 'driver_behavior', 'full_synthesis'],
        default='full_synthesis'
    )
