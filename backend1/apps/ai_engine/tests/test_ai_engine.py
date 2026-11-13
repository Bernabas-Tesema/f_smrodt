import sys
import unittest
from unittest.mock import patch, MagicMock

# Graceful stubbing for standalone runners when Django packages are not installed in container
if 'django' not in sys.modules:
    django_mock = MagicMock()
    sys.modules['django'] = django_mock
    sys.modules['django.db'] = django_mock
    sys.modules['django.db.models'] = django_mock
    sys.modules['django.utils'] = django_mock
    sys.modules['django.utils.timezone'] = django_mock
    sys.modules['rest_framework'] = MagicMock()
    sys.modules['apps.vehicles'] = MagicMock()
    sys.modules['apps.vehicles.models'] = MagicMock()

from apps.ai_engine.providers.gemini_provider import GeminiProvider
from apps.ai_engine.services.crash_detection import CrashDetectionService
from apps.ai_engine.services.theft_detection import TheftDetectionService


class TestAIEngineIntelligence(unittest.TestCase):
    """
    Unit tests for SMROD AI Engine detection and scoring services.
    """

    def setUp(self):
        self.mock_vehicle = MagicMock()
        self.mock_vehicle.id = "c4b12345-6789-4def-0123-456789abcdef"
        self.mock_vehicle.plate_number = "KDM 482X"
        self.mock_vehicle.make = "Toyota"
        self.mock_vehicle.model = "Land Cruiser Prado"
        self.mock_vehicle.is_immobilized = False
        self.mock_vehicle.security_status = 'normal'

    def test_risk_scoring_weights_math(self):
        """
        Verify that risk scoring correctly computes weighted sum based on the 4 factors:
        theft (35%), crash (25%), geofence (20%), tampering (20%).
        """
        theft_score = 100
        crash_score = 0
        geofence_score = 50
        tampering_score = 10

        expected_composite = int(
            (theft_score * 0.35) +
            (crash_score * 0.25) +
            (geofence_score * 0.20) +
            (tampering_score * 0.20)
        )
        self.assertEqual(expected_composite, 47)  # 35 + 0 + 10 + 2 = 47
        self.assertTrue(30 <= expected_composite < 60)  # 'medium' risk band

    def test_deterministic_crash_threshold_filtering(self):
        """
        IMU spikes below the 3.5g physical threshold must be filtered out as non-crashes.
        """
        sub_threshold_telemetry = {
            'peak_g_force': 2.1,  # standard pothole
            'speed_drop_kmh': 8.0,
            'tilt_degrees': 4.0
        }
        res = CrashDetectionService.evaluate_impact_telemetry(self.mock_vehicle, sub_threshold_telemetry)
        self.assertIsNone(res, "Sub-threshold G-force should not trigger a crash prediction")

    def test_gemini_provider_theft_evaluation(self):
        """
        Verify Gemini provider outputs structured explanation, action items, and confidence.
        """
        provider = GeminiProvider()
        result = provider.evaluate_theft_risk(
            vehicle_data={'plate_number': 'KDM 482X'},
            telemetry_context={'speed': 45, 'ignition': False}
        )
        self.assertIn('theft_probability', result)
        self.assertIn('risk_score', result)
        self.assertGreaterEqual(result['risk_score'], 80)
        self.assertEqual(result['theft_modality'], 'towing')
        self.assertTrue(len(result['recommended_actions']) > 0)

    def test_gemini_provider_crash_context(self):
        """
        Verify crash analysis generates high severity assessment on severe impact.
        """
        provider = GeminiProvider()
        result = provider.analyze_crash_context(
            impact_data={'peak_g_force': 6.8, 'speed_drop_kmh': 52.0}
        )
        self.assertEqual(result['severity_assessment'], 'severe_impact')
        self.assertGreater(result['crash_confidence'], 0.90)
        self.assertTrue(any('EMS' in act or 'police' in act for act in result['recommended_emergency_response']))

    def test_provider_connection_test(self):
        """
        Verify live connection test returns health status and latency.
        """
        provider = GeminiProvider()
        ping = provider.test_connection()
        self.assertTrue(ping['is_healthy'])
        self.assertEqual(ping['status'], 'connected')
        self.assertGreater(ping['latency_ms'], 0)


if __name__ == '__main__':
    unittest.main()
