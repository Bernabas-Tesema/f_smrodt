from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.ai_engine.models import AIInferenceLog, AIPrediction, AIProviderConfig
from apps.ai_engine.services.risk_scoring import RiskScoringEngine
from apps.devices.models import VSCUDevice
from apps.vehicles.models import Vehicle

FLEET = [
    {
        'plate_number': 'KDM 482Y',
        'vin': 'JTMCV02J504123482',
        'make': 'Toyota',
        'model': 'Land Cruiser',
        'year': 2022,
        'color': 'White',
        'owner_name': 'Amina Hassan',
        'owner_email': 'amina.hassan@smrod.app',
        'owner_phone': '+254700100001',
        'status': 'active',
        'security_status': 'critical',
        'is_immobilized': False,
        'current_speed': 64,
        'heading': 42,
        'last_latitude': -1.2921,
        'last_longitude': 36.8219,
        'serial': 'SMROD-001',
        'imei': '356938035643801',
        'hardware_uid': 'ESP32S3-7CDF-A182-01',
        'mac': '7C:DF:A1:82:00:01',
        'connection': 'online',
        'battery': 86,
    },
    {
        'plate_number': 'KBZ 194C',
        'vin': 'JTMCV02J504123194',
        'make': 'Toyota',
        'model': 'Hilux',
        'year': 2021,
        'color': 'Silver',
        'owner_name': 'David Kamau',
        'owner_email': 'david.kamau@smrod.app',
        'owner_phone': '+254700100002',
        'status': 'active',
        'security_status': 'warning',
        'is_immobilized': False,
        'current_speed': 0,
        'heading': 180,
        'last_latitude': -1.3032,
        'last_longitude': 36.7805,
        'serial': 'SMROD-002',
        'imei': '356938035643802',
        'hardware_uid': 'ESP32S3-7CDF-B293-02',
        'mac': '7C:DF:A1:82:00:02',
        'connection': 'online',
        'battery': 74,
    },
    {
        'plate_number': 'KDE 910T',
        'vin': 'JTMCV02J504123910',
        'make': 'Isuzu',
        'model': 'D-Max',
        'year': 2023,
        'color': 'Blue',
        'owner_name': 'Grace Wanjiku',
        'owner_email': 'grace.wanjiku@smrod.app',
        'owner_phone': '+254700100003',
        'status': 'active',
        'security_status': 'normal',
        'is_immobilized': False,
        'current_speed': 38,
        'heading': 90,
        'last_latitude': -1.2674,
        'last_longitude': 36.8081,
        'serial': 'SMROD-003',
        'imei': '356938035643803',
        'hardware_uid': 'ESP32S3-7CDF-C304-03',
        'mac': '7C:DF:A1:82:00:03',
        'connection': 'online',
        'battery': 91,
    },
    {
        'plate_number': 'KCL 812A',
        'vin': 'JTMCV02J504123812',
        'make': 'Nissan',
        'model': 'Navara',
        'year': 2020,
        'color': 'Black',
        'owner_name': 'Peter Otieno',
        'owner_email': 'peter.otieno@smrod.app',
        'owner_phone': '+254700100004',
        'status': 'active',
        'security_status': 'critical',
        'is_immobilized': True,
        'current_speed': 0,
        'heading': 12,
        'last_latitude': -1.3197,
        'last_longitude': 36.9256,
        'serial': 'SMROD-004',
        'imei': '356938035643804',
        'hardware_uid': 'ESP32S3-7CDF-D415-04',
        'mac': '7C:DF:A1:82:00:04',
        'connection': 'degraded',
        'battery': 41,
    },
    {
        'plate_number': 'KDL 305M',
        'vin': 'JTMCV02J504123305',
        'make': 'Mitsubishi',
        'model': 'L200',
        'year': 2024,
        'color': 'Grey',
        'owner_name': 'Lucy Njeri',
        'owner_email': 'lucy.njeri@smrod.app',
        'owner_phone': '+254700100005',
        'status': 'active',
        'security_status': 'warning',
        'is_immobilized': False,
        'current_speed': 72,
        'heading': 210,
        'last_latitude': -1.2501,
        'last_longitude': 36.8452,
        'serial': 'SMROD-005',
        'imei': '356938035643805',
        'hardware_uid': 'ESP32S3-7CDF-E526-05',
        'mac': '7C:DF:A1:82:00:05',
        'connection': 'online',
        'battery': 88,
    },
    {
        'plate_number': 'KDA 771P',
        'vin': 'JTMCV02J504123771',
        'make': 'Toyota',
        'model': 'Prado',
        'year': 2019,
        'color': 'Pearl',
        'owner_name': 'Samuel Kipchoge',
        'owner_email': 'samuel.kipchoge@smrod.app',
        'owner_phone': '+254700100006',
        'status': 'active',
        'security_status': 'normal',
        'is_immobilized': False,
        'current_speed': 0,
        'heading': 0,
        'last_latitude': -1.2864,
        'last_longitude': 36.8172,
        'serial': 'SMROD-006',
        'imei': '356938035643806',
        'hardware_uid': 'ESP32S3-7CDF-F637-06',
        'mac': '7C:DF:A1:82:00:06',
        'connection': 'offline',
        'battery': 19,
    },
]


class Command(BaseCommand):
    help = 'Load demo vehicles, VSCU devices, and AI records into the local database.'

    def handle(self, *args, **options):
        now = timezone.now()
        AIPrediction.objects.all().delete()
        AIInferenceLog.objects.all().delete()
        VSCUDevice.objects.all().delete()
        Vehicle.objects.all().delete()

        vehicles = {}
        for row in FLEET:
            vehicle = Vehicle.objects.create(
                plate_number=row['plate_number'],
                vin=row['vin'],
                make=row['make'],
                model=row['model'],
                year=row['year'],
                color=row['color'],
                owner_name=row['owner_name'],
                owner_email=row['owner_email'],
                owner_phone=row['owner_phone'],
                status=row['status'],
                security_status=row['security_status'],
                is_immobilized=row['is_immobilized'],
                current_speed=row['current_speed'],
                heading=row['heading'],
                last_latitude=row['last_latitude'],
                last_longitude=row['last_longitude'],
                last_telemetry_at=now,
            )
            vehicles[row['plate_number']] = vehicle
            VSCUDevice.objects.create(
                serial_number=row['serial'],
                imei=row['imei'],
                hardware_uid=row['hardware_uid'],
                mac_address=row['mac'],
                vehicle=vehicle,
                connection_status=row['connection'],
                battery_level=row['battery'],
                last_ping_at=now,
                gnss_satellites=11 if row['connection'] == 'online' else 0,
                gnss_fix='3D_FIX' if row['connection'] == 'online' else 'NO_FIX',
            )

        AIProviderConfig.objects.update_or_create(
            provider='gemini',
            defaults={
                'display_name': 'Google Gemini',
                'model_name': 'gemini-2.5-flash',
                'is_active': True,
                'is_default': True,
                'api_key_env_var': 'GEMINI_API_KEY',
                'status': 'active',
                'avg_latency_ms': 240,
            },
        )
        AIProviderConfig.objects.update_or_create(
            provider='openai',
            defaults={
                'display_name': 'OpenAI',
                'model_name': 'gpt-4o',
                'is_active': False,
                'is_default': False,
                'api_key_env_var': 'OPENAI_API_KEY',
                'status': 'disabled',
            },
        )
        AIProviderConfig.objects.update_or_create(
            provider='anthropic',
            defaults={
                'display_name': 'Anthropic Claude',
                'model_name': 'claude-3-5-sonnet',
                'is_active': False,
                'is_default': False,
                'api_key_env_var': 'ANTHROPIC_API_KEY',
                'status': 'disabled',
            },
        )

        self._prediction(
            vehicles['KDM 482Y'],
            'theft',
            'Unauthorized movement with ignition off',
            92,
            'critical',
            0.96,
            'pending',
            'Vehicle is moving at speed while the ignition is off. Pattern matches flatbed towing.',
        )
        self._prediction(
            vehicles['KBZ 194C'],
            'theft',
            'Geofence exit outside dispatch window',
            78,
            'high',
            0.88,
            'investigating',
            'Vehicle left the home zone while the schedule showed it should be parked.',
        )
        self._prediction(
            vehicles['KCL 812A'],
            'crash',
            'High impact shock on IMU',
            86,
            'critical',
            0.93,
            'pending',
            'A sudden deceleration above 3.5g was recorded and the vehicle is now stationary.',
        )
        self._prediction(
            vehicles['KDL 305M'],
            'crash',
            'Hard braking event',
            54,
            'medium',
            0.71,
            'acknowledged',
            'A sharp brake event was recorded. No rollover signature followed.',
        )

        for vehicle in vehicles.values():
            RiskScoringEngine.calculate_vehicle_risk(vehicle)

        AIInferenceLog.objects.bulk_create([
            AIInferenceLog(
                provider='gemini',
                model='gemini-2.5-flash',
                endpoint='theft-detection',
                prompt_tokens=820,
                completion_tokens=210,
                total_tokens=1030,
                cost_usd='0.00420',
                latency_ms=240,
                status_code=200,
                is_success=True,
            ),
            AIInferenceLog(
                provider='gemini',
                model='gemini-2.5-flash',
                endpoint='crash-detection',
                prompt_tokens=640,
                completion_tokens=180,
                total_tokens=820,
                cost_usd='0.00310',
                latency_ms=190,
                status_code=200,
                is_success=True,
            ),
        ])

        self.stdout.write(self.style.SUCCESS(
            f'Seeded {len(vehicles)} vehicles, devices, AI providers, predictions, and risk scores.'
        ))

    def _prediction(self, vehicle, kind, title, score, level, confidence, status, explanation):
        AIPrediction.objects.create(
            vehicle=vehicle,
            prediction_type=kind,
            risk_score=score,
            risk_level=level,
            confidence_score=confidence,
            title=title,
            ai_explanation=explanation,
            recommended_actions=[
                'Confirm the last GNSS position with the owner.',
                'Keep the high-frequency tracking interval until the event is closed.',
            ],
            contributing_factors={'speed_kph': vehicle.current_speed, 'security_status': vehicle.security_status},
            raw_telemetry_snapshot={
                'latitude': vehicle.last_latitude,
                'longitude': vehicle.last_longitude,
                'speed': vehicle.current_speed,
            },
            status=status,
            provider_used='gemini',
            model_version='gemini-2.5-flash',
            inference_latency_ms=240,
        )
