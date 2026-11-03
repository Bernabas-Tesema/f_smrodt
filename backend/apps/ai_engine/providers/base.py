import abc
import time
from typing import Dict, Any, List


class BaseAIProvider(abc.ABC):
    """
    Abstract Base Class for all SMROD AI Providers (Gemini, OpenAI, Anthropic).
    Provides consistent contracts for telemetry analysis, theft risk evaluation,
    crash triage, and incident summarization.
    """

    def __init__(self, model_name: str, api_key: str = None, timeout_seconds: int = 8):
        self.model_name = model_name
        self.api_key = api_key
        self.timeout_seconds = timeout_seconds

    @abc.abstractmethod
    def evaluate_theft_risk(
        self,
        vehicle_data: Dict[str, Any],
        telemetry_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Evaluate likelihood of theft based on deterministic pre-flags,
        movement anomalies, ignition mismatch, and historical geofence boundaries.
        Returns:
            {
                "theft_probability": float (0.0 - 1.0),
                "risk_score": int (0 - 100),
                "risk_level": str ("low" | "medium" | "high" | "critical"),
                "theft_modality": str ("towing", "hotwiring", "unauthorized_driver", "jamming"),
                "explanation": str,
                "recommended_actions": List[str],
                "tokens_used": int,
                "latency_ms": int
            }
        """
        pass

    @abc.abstractmethod
    def analyze_crash_context(
        self,
        impact_data: Dict[str, Any],
        telemetry_window: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Provide contextual analysis of an IMU impact event (G-force spike,
        rapid deceleration, tilt angle). Note: AI is an ADVISOR, not the sole detector.
        Returns:
            {
                "crash_confidence": float (0.0 - 1.0),
                "severity_assessment": str ("minor_bump", "moderate_collision", "severe_impact", "rollover"),
                "plausibility_analysis": str,
                "recommended_emergency_response": List[str],
                "tokens_used": int,
                "latency_ms": int
            }
        """
        pass

    @abc.abstractmethod
    def generate_incident_summary(
        self,
        event_data: Dict[str, Any],
        vehicle_profile: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Summarize a security incident for operator investigation with key root causes
        and step-by-step triage recommendations.
        """
        pass

    @abc.abstractmethod
    def test_connection(self) -> Dict[str, Any]:
        """
        Performs a lightweight ping/handshake with the AI provider endpoint.
        Returns:
            {
                "is_healthy": bool,
                "latency_ms": int,
                "model_version": str,
                "error": str or None
            }
        """
        pass
