import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/errors/app_exception.dart';
import '../../../../core/network/api_client.dart';

/// Snapshot of Django AI overview for the owner app dashboard.
class AiOverviewSnapshot {
  const AiOverviewSnapshot({
    required this.provider,
    required this.model,
    required this.riskScore,
    required this.theftLabel,
    required this.crashLabel,
    required this.connected,
    required this.insights,
    this.error,
  });

  final String provider;
  final String model;
  final int riskScore;
  final String theftLabel;
  final String crashLabel;
  final bool connected;
  final List<String> insights;
  final String? error;

  factory AiOverviewSnapshot.fallback({String? error, int riskScore = 18}) {
    return AiOverviewSnapshot(
      provider: 'Google Gemini',
      model: 'gemini-2.5-flash',
      riskScore: riskScore,
      theftLabel: 'ARMED',
      crashLabel: 'NORMAL',
      connected: false,
      insights: const [
        'Connect Django at localhost:8000 to load live AI metrics.',
        'Theft and crash models stay armed on-device meanwhile.',
      ],
      error: error,
    );
  }
}

/// Remote AI Intelligence Data Source connecting Flutter to the Django AI Engine.
class AiRemoteDataSource {
  const AiRemoteDataSource(this._api);

  final ApiClient _api;

  /// Fetch overall AI threat overview from Django `/ai/overview/`.
  Future<AiOverviewSnapshot> getAiOverview({int fallbackRisk = 18}) async {
    try {
      final response = await _guard(() => _api.get(ApiConstants.aiOverview));
      final data = response.data;
      if (data is! Map) {
        return AiOverviewSnapshot.fallback(riskScore: fallbackRisk);
      }

      final map = Map<String, dynamic>.from(data);
      final metrics = Map<String, dynamic>.from(
        (map['metrics'] as Map?) ?? const {},
      );
      final theftCount = (metrics['active_theft_incidents'] as num?)?.toInt() ?? 0;
      final crashCount = (metrics['active_crash_alerts'] as num?)?.toInt() ?? 0;
      final critical = (metrics['critical_risk_vehicles'] as num?)?.toInt() ?? 0;
      final latency = (metrics['avg_inference_latency_ms'] as num?)?.toDouble();

      final risk = critical > 0
          ? 80 + critical.clamp(0, 20)
          : theftCount > 0
              ? 55 + (theftCount * 5).clamp(0, 30)
              : fallbackRisk;

      final recent = (map['recent_predictions'] as List?) ?? const [];
      final insights = <String>[
        if (map['active_provider'] != null)
          'Active model: ${map['active_provider']} (${map['active_model'] ?? 'n/a'})',
        if (latency != null) 'Avg inference latency ${latency.round()} ms',
        'Theft alerts active: $theftCount · Crash alerts: $crashCount',
        if (recent.isNotEmpty)
          'Latest: ${(recent.first as Map)['title'] ?? (recent.first as Map)['prediction_type'] ?? 'prediction'}',
      ];

      return AiOverviewSnapshot(
        provider: (map['active_provider'] ?? 'Google Gemini').toString(),
        model: (map['active_model'] ?? 'gemini-2.5-flash').toString(),
        riskScore: risk.clamp(0, 100),
        theftLabel: theftCount > 0 ? 'ALERT ($theftCount)' : 'ARMED',
        crashLabel: crashCount > 0 ? 'ALERT ($crashCount)' : 'NORMAL',
        connected: true,
        insights: insights,
      );
    } on AppException catch (error) {
      return AiOverviewSnapshot.fallback(
        error: error.message,
        riskScore: fallbackRisk,
      );
    } catch (error) {
      return AiOverviewSnapshot.fallback(
        error: error.toString(),
        riskScore: fallbackRisk,
      );
    }
  }

  /// Vehicle risk detail from Django `/ai/vehicles/<id>/risk/`.
  Future<Map<String, dynamic>?> getVehicleRisk(String vehicleId) async {
    try {
      final response = await _guard(
        () => _api.get(ApiConstants.aiVehicleRisk(vehicleId)),
      );
      if (response.data is Map<String, dynamic>) {
        return response.data as Map<String, dynamic>;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<List<Map<String, dynamic>>> listTheftDetections() async {
    try {
      final response = await _guard(() => _api.get(ApiConstants.aiTheftDetections));
      final data = response.data;
      if (data is List) {
        return data.map((e) => Map<String, dynamic>.from(e as Map)).toList();
      }
      if (data is Map && data['results'] is List) {
        return (data['results'] as List)
            .map((e) => Map<String, dynamic>.from(e as Map))
            .toList();
      }
      return const [];
    } catch (_) {
      return const [];
    }
  }

  Future<Response<dynamic>> _guard(Future<Response<dynamic>> Function() call) async {
    try {
      return await call();
    } on DioException catch (error) {
      throw AppException(
        error.response?.data is Map
            ? (error.response!.data as Map)['message']?.toString() ??
                'AI Engine service error'
            : 'AI Engine communication failure',
      );
    }
  }
}
