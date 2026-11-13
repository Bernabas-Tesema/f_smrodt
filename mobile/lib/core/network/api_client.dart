import 'package:dio/dio.dart';

import '../constants/api_constants.dart';
import '../constants/app_constants.dart';
import '../security/secure_storage_service.dart';

/// Shared API client. All calls use HTTPS. Command posts carry an idempotency key.
class ApiClient {
  ApiClient(SecureStorageService secure)
    : _dio = Dio(
        BaseOptions(
          baseUrl: ApiConstants.baseUrl,
          connectTimeout: const Duration(seconds: 8),
          receiveTimeout: const Duration(seconds: 12),
          headers: {'Accept': 'application/json'},
        ),
      ) {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await secure.read(AppConstants.tokenKey);
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
      ),
    );
  }

  final Dio _dio;

  Future<Response<dynamic>> get(String path) => _dio.get(path);

  Future<Response<dynamic>> post(
    String path, {
    Object? data,
    Map<String, dynamic>? headers,
  }) {
    return _dio.post(path, data: data, options: Options(headers: headers));
  }

  Future<Response<dynamic>> patch(String path, {Object? data}) => _dio.patch(path, data: data);
}
