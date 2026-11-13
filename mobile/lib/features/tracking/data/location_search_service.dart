import 'package:dio/dio.dart';
import 'package:latlong2/latlong.dart';

import '../presentation/widgets/vehicle_map.dart';

class LocationSearchResult {
  const LocationSearchResult({
    required this.name,
    required this.place,
    required this.point,
  });

  final String name;
  final String place;
  final LatLng point;
}

/// Mapbox Places geocoding for map location search.
class LocationSearchService {
  LocationSearchService({Dio? dio}) : _dio = dio ?? Dio();

  final Dio _dio;

  Future<List<LocationSearchResult>> search(String query) async {
    final trimmed = query.trim();
    if (trimmed.length < 2) return const [];

    final response = await _dio.get<Map<String, dynamic>>(
      'https://api.mapbox.com/geocoding/v5/mapbox.places/${Uri.encodeComponent(trimmed)}.json',
      queryParameters: {
        'access_token': VehicleMap.mapboxToken,
        'limit': 6,
        'autocomplete': true,
        'types': 'place,locality,neighborhood,address,poi',
      },
    );

    final features = response.data?['features'];
    if (features is! List) return const [];

    return features
        .whereType<Map>()
        .map((feature) {
          final center = feature['center'];
          if (center is! List || center.length < 2) return null;
          final lng = (center[0] as num).toDouble();
          final lat = (center[1] as num).toDouble();
          final placeName = '${feature['place_name'] ?? feature['text'] ?? 'Place'}';
          final short = '${feature['text'] ?? placeName}';
          return LocationSearchResult(
            name: short,
            place: placeName,
            point: LatLng(lat, lng),
          );
        })
        .whereType<LocationSearchResult>()
        .toList();
  }
}
