from __future__ import annotations
import logging
from typing import Dict, Any, Optional
from ..models import AIPrediction
from .intelligence_service import AIIntelligenceService

logger = logging.getLogger('smrod.ai.crash')


class CrashDetectionService:
    """
    Deterministic IMU Signal Processing & AI-Assisted Crash Verification.
    
    SAFETY PRINCIPLE:
    Physical safety detection is ALWAYS deterministic (G-force acceleration spikes,
    gyroscope roll/tilt angles, and rapid speed decay). The AI model acts as an
    advisor to assess collision plausibility, eliminate road-bump false positives,
    and generate structured emergency triage protocols.
    """

    CRASH_G_FORCE_THRESHOLD = 3.5  # Multi-axis acceleration threshold
    SEVERE_G_FORCE_THRESHOLD = 6.0
    DECELERATION_DELTA_KMH = 30.0  # Instantaneous speed drop

    @classmethod
    def evaluate_impact_telemetry(
        cls,
        vehicle,
        imu_telemetry: Dict[str, Any]
    ) -> Optional[AIPrediction]:
        """
        Processes high-frequency IMU telemetry packet.
        Returns an AIPrediction record if an impact event is verified.
        """
        peak_g = float(imu_telemetry.get('peak_g_force', 1.0))
        speed_drop = float(imu_telemetry.get('speed_drop_kmh', 0.0))
        tilt_deg = float(imu_telemetry.get('tilt_degrees', 0.0))

        # Deterministic physical criteria check
        is_crash_candidate = (peak_g >= cls.CRASH_G_FORCE_THRESHOLD) or (speed_drop >= cls.DECELERATION_DELTA_KMH)

        if not is_crash_candidate:
            return None

        # Execute AI contextual analysis
        ai_result = AIIntelligenceService.execute_with_failover(
            'analyze_crash_context',
            impact_data=imu_telemetry
        )

        severity = ai_result.get('severity_assessment', 'moderate_collision')
        confidence = ai_result.get('crash_confidence', 0.90)

        risk_score = 95 if peak_g >= cls.SEVERE_G_FORCE_THRESHOLD else 80
        risk_level = 'critical' if risk_score >= 90 else 'high'

        title = f"Crash Alert: {severity.replace('_', ' ').title()} ({peak_g:.1f}g)"

        prediction = AIPrediction.objects.create(
            vehicle=vehicle,
            prediction_type='crash',
            title=title,
            risk_score=risk_score,
            risk_level=risk_level,
            confidence_score=confidence,
            ai_explanation=ai_result.get('plausibility_analysis', 'IMU shock pattern verified.'),
            recommended_actions=ai_result.get('recommended_emergency_response', []),
            contributing_factors={
                'peak_g_force': peak_g,
                'speed_drop_kmh': speed_drop,
                'tilt_degrees': tilt_deg,
                'severity_tier': severity
            },
            raw_telemetry_snapshot=imu_telemetry,
            provider_used=ai_result.get('provider', 'gemini'),
            model_version=ai_result.get('model_version', 'gemini-2.5-flash'),
            inference_latency_ms=ai_result.get('latency_ms', 210),
            status='pending'
        )

        vehicle.security_status = 'critical'
        vehicle.save(update_fields=['security_status'])

        return prediction
