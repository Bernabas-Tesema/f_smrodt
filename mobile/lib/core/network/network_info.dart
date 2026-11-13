import '../constants/app_constants.dart';

/// Network availability abstraction.
class NetworkInfo {
  const NetworkInfo();

  Future<bool> get isConnected async => AppConstants.usePilotData;
}
