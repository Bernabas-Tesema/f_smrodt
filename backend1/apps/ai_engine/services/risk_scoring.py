from __future__ import annotations
import logging
from typing import Dict, Any
from django.utils import timezone
from ..models import VehicleRiskScore, AIPrediction

logger = logging.getLogger('smrod.ai.risk_scoring')


class RiskScoringEngine:
    """
    Transparent, Deterministic Vehicle Risk Scoring Engine (0 - 100).
    
    Formula:
      Risk Score = (Theft Risk * 0.35) + 
                   (Crash & Impact History * 0.25) + 
                   (Geofence Breaches * 0.20) + 
                   (Sensor Tampering & Shocks * 0.20)
    """

    WEIGHT_THEFT = 0.35
    WEIGHT_CRASH = 0.25
    WEIGHT_GEOFENCE = 0.20
    WEIGHT_TAMPERING = 0.20

    @classmethod
    def calculate_vehicle_risk(cls, vehicle) -> VehicleRiskScore:
        """
        Calculates and records the current aggregate risk score for a vehicle.
        """
        # 1. Theft Factor (0-100)
        recent_theft = AIPrediction.objects.filter(
            vehicle=vehicle,
            prediction_type='theft',
            status__in=['pending', 'acknowledged', 'investigating', 'confirmed']
        ).first()
        theft_score = recent_theft.risk_score if recent_theft else (10 if vehicle.is_immobilized else 5)

        # 2. Crash Factor (0-100)
        recent_crash = AIPrediction.objects.filter(
            vehicle=vehicle,
            prediction_type='crash',
            status__in=['pending', 'acknowledged', 'investigating', 'confirmed']
        ).first()
        crash_score = recent_crash.risk_score if recent_crash else 0

        # 3. Geofence Factor (0-100)
        # Baseline estimate based on alerts
        geofence_score = 45 if vehicle.security_status == 'warning' else (85 if vehicle.security_status == 'critical' and not recent_theft else 10)

        # 4. Tampering Factor (0-100)
        tampering_score = 15

        # Weighted calculation
        composite_score = int(
            (theft_score * cls.WEIGHT_THEFT) +
            (crash_score * cls.WEIGHT_CRASH) +
            (geofence_score * cls.WEIGHT_GEOFENCE) +
            (tampering_score * cls.WEIGHT_TAMPERING)
        )
        composite_score = max(0, min(100, composite_score))

        # Categorization
        if composite_score >= 80:
            category = 'critical'
        elif composite_score >= 60:
            category = 'high'
        elif composite_score >= 30:
            category = 'medium'
        else:
            category = 'low'

        # Primary risk factor explanation
        factors = {
            'Theft & Unauthorized Movement': theft_score * cls.WEIGHT_THEFT,
            'Collision & Impact History': crash_score * cls.WEIGHT_CRASH,
            'Geofence Boundary Violations': geofence_score * cls.WEIGHT_GEOFENCE,
            'Device Tampering & Vibration Shocks': tampering_score * cls.WEIGHT_TAMPERING
        }
        primary_factor = max(factors, key=factors.get)

        factor_breakdown = {
            'theft_risk': {
                'raw_score': theft_score,
                'weight': cls.WEIGHT_THEFT,
                'weighted_contribution': round(theft_score * cls.WEIGHT_THEFT, 1)
            },
            'crash_history': {
                'raw_score': crash_score,
                'weight': cls.WEIGHT_CRASH,
                'weighted_contribution': round(crash_score * cls.WEIGHT_CRASH, 1)
            },
            'geofence_breaches': {
                'raw_score': geofence_score,
                'weight': cls.WEIGHT_GEOFENCE,
                'weighted_contribution': round(geofence_score * cls.WEIGHT_GEOFENCE, 1)
            },
            'sensor_tampering': {
                'raw_score': tampering_score,
                'weight': cls.WEIGHT_TAMPERING,
                'weighted_contribution': round(tampering_score * cls.WEIGHT_TAMPERING, 1)
            }
        }

        risk_record, created = VehicleRiskScore.objects.update_or_create(
            vehicle=vehicle,
            defaults={
                'current_score': composite_score,
                'category': category,
                'factor_breakdown': factor_breakdown,
                'primary_risk_factor': primary_factor,
                'last_calculated_at': timezone.now()
            }
        )

        return risk_record
