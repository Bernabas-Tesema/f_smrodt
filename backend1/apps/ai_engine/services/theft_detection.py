from __future__ import annotations
import logging
from typing import Dict, Any, Optional
from django.utils import timezone
from ..models import AIPrediction
from .intelligence_service import AIIntelligenceService

logger = logging.getLogger('smrod.ai.theft')


class TheftDetectionService:
    """
    Deterministic & AI-Assisted Theft Detection Service.
    Combines strict rule-based filters (ignition state, speed, IMU vibrations, geofence)
    with LLM contextual intelligence to classify theft modality and generate actionable alerts.
    """

    @classmethod
    def evaluate_telemetry_for_theft(
        cls,
        vehicle,
        telemetry: Dict[str, Any]
    ) -> Optional[AIPrediction]:
        """
        Evaluates incoming vehicle telemetry stream for theft indicators.
        Returns an AIPrediction if theft or unauthorized movement is detected.
        """
        speed = float(telemetry.get('speed', 0.0))
        ignition = bool(telemetry.get('ignition', False))
        geofence_breach = bool(telemetry.get('geofence_breach', False))
        vibration_g = float(telemetry.get('vibration_g', 0.0))

        # Deterministic trigger checks
        is_towing = (not ignition) and (speed >= 5.0)
        is_geofence_theft = geofence_breach and (speed > 0)
        is_tampering = (vibration_g > 1.8) and (speed == 0) and (not ignition)

        if not (is_towing or is_geofence_theft or is_tampering):
            return None  # Normal operating parameters

        vehicle_payload = {
            'id': str(vehicle.id),
            'plate_number': vehicle.plate_number,
            'make': vehicle.make,
            'model': vehicle.model,
            'is_immobilized': vehicle.is_immobilized
        }

        # Invoke AI engine for deep contextual reasoning
        ai_result = AIIntelligenceService.execute_with_failover(
            'evaluate_theft_risk',
            vehicle_data=vehicle_payload,
            telemetry_context=telemetry
        )

        risk_score = ai_result.get('risk_score', 85)
        risk_level = ai_result.get('risk_level', 'high')
        modality = ai_result.get('theft_modality', 'unauthorized_movement')

        title = f"Possible Theft Detected: {modality.replace('_', ' ').title()}"

        prediction = AIPrediction.objects.create(
            vehicle=vehicle,
            prediction_type='theft',
            title=title,
            risk_score=risk_score,
            risk_level=risk_level,
            confidence_score=ai_result.get('theft_probability', 0.90),
            ai_explanation=ai_result.get('explanation', 'Suspicious movement patterns detected.'),
            recommended_actions=ai_result.get('recommended_actions', []),
            contributing_factors={
                'speed_kmh': speed,
                'ignition_on': ignition,
                'geofence_breach': geofence_breach,
                'vibration_g': vibration_g,
                'modality': modality
            },
            raw_telemetry_snapshot=telemetry,
            provider_used=ai_result.get('provider', 'gemini'),
            model_version=ai_result.get('model_version', 'gemini-2.5-flash'),
            inference_latency_ms=ai_result.get('latency_ms', 250),
            status='pending'
        )

        # Update vehicle security status to critical
        vehicle.security_status = 'critical'
        vehicle.save(update_fields=['security_status'])

        return prediction
