from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Vehicle


class CurrentVehicleView(APIView):
    def get(self, request):
        vehicles = Vehicle.objects.all()
        email = getattr(request.user, 'email', '')
        if email:
            owned = vehicles.filter(owner_email__iexact=email)
            if owned.exists():
                vehicles = owned

        vehicle = vehicles.first()
        if vehicle is None:
            return Response(
                {'detail': 'No vehicle paired yet.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({
            'id': str(vehicle.id),
            'ownerId': getattr(request.user, 'id', '') or vehicle.owner_email,
            'deviceId': '',
            'serialNo': vehicle.vin,
            'make': vehicle.make,
            'model': vehicle.model,
            'plateNo': vehicle.plate_number,
            'armed': vehicle.security_status != 'critical',
            'immobilized': vehicle.is_immobilized,
            'online': vehicle.status == 'active',
            'powerCut': False,
            'doorOpen': False,
            'batteryPercent': 0,
            'backupBatteryPercent': 0,
            'firmwareVersion': '',
            'latitude': vehicle.last_latitude or 0,
            'longitude': vehicle.last_longitude or 0,
            'speedKph': vehicle.current_speed,
            'address': '',
            'riskScore': 0,
            'riskLevel': 'low',
            'riskFactors': [],
            'updatedAt': (
                vehicle.last_telemetry_at or vehicle.updated_at
            ).isoformat(),
        })
