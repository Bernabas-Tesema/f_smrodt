"""
Celery Background Tasks for Asynchronous AI Batch Evaluation
"""
import logging
from celery import shared_task

logger = logging.getLogger('smrod.ai.tasks')


@shared_task(name='ai_engine.tasks.batch_evaluate_fleet_risk')
def batch_evaluate_fleet_risk():
    """
    Periodic cron task to recalculate risk scores across active fleet.
    """
    from apps.vehicles.models import Vehicle
    from .services.risk_scoring import RiskScoringEngine

    logger.info("Starting scheduled batch fleet risk scoring evaluation...")
    vehicles = Vehicle.objects.filter(status='active')
    updated_count = 0

    for veh in vehicles:
        try:
            RiskScoringEngine.calculate_vehicle_risk(veh)
            updated_count += 1
        except Exception as err:
            logger.error(f"Failed to calculate risk score for vehicle {veh.plate_number}: {err}")

    logger.info(f"Completed fleet risk scoring for {updated_count} vehicles.")
    return {'evaluated_vehicles': updated_count}


@shared_task(name='ai_engine.tasks.process_async_telemetry_batch')
def process_async_telemetry_batch(vehicle_id: str, telemetry_packet: dict):
    """
    Asynchronously evaluates high-frequency telemetry buffer without blocking MQTT ingress.
    """
    from apps.vehicles.models import Vehicle
    from .services.theft_detection import TheftDetectionService
    from .services.crash_detection import CrashDetectionService

    try:
        vehicle = Vehicle.objects.get(id=vehicle_id)
        # Check theft
        theft_pred = TheftDetectionService.evaluate_telemetry_for_theft(vehicle, telemetry_packet)
        # Check crash
        crash_pred = CrashDetectionService.evaluate_impact_telemetry(vehicle, telemetry_packet)
        return {
            'vehicle': vehicle.plate_number,
            'theft_alert': bool(theft_pred),
            'crash_alert': bool(crash_pred)
        }
    except Exception as e:
        logger.error(f"Error in async telemetry AI processing: {e}")
        return {'error': str(e)}
