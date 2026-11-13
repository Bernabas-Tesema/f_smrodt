import 'dart:async';

import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';

import '../../../../app/theme/app_colors.dart';
import '../../data/location_search_service.dart';

/// Map overlay search that jumps the camera to a chosen place.
class LocationSearchBar extends StatefulWidget {
  const LocationSearchBar({super.key, required this.onSelect});

  final ValueChanged<LatLng> onSelect;

  @override
  State<LocationSearchBar> createState() => _LocationSearchBarState();
}

class _LocationSearchBarState extends State<LocationSearchBar> {
  final _controller = TextEditingController();
  final _focus = FocusNode();
  final _service = LocationSearchService();
  Timer? _debounce;
  List<LocationSearchResult> _results = const [];
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    _focus.dispose();
    super.dispose();
  }

  void _onChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), () => _search(value));
  }

  Future<void> _search(String value) async {
    if (value.trim().length < 2) {
      setState(() {
        _results = const [];
        _error = null;
        _loading = false;
      });
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final results = await _service.search(value);
      if (!mounted) return;
      setState(() {
        _results = results;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = 'Search failed. Try again.';
        _results = const [];
      });
    }
  }

  void _pick(LocationSearchResult result) {
    _controller.text = result.name;
    _focus.unfocus();
    setState(() => _results = const []);
    widget.onSelect(result.point);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Material(
          elevation: 3,
          borderRadius: BorderRadius.circular(16),
          color: AppColors.paper,
          child: TextField(
            controller: _controller,
            focusNode: _focus,
            onChanged: _onChanged,
            textInputAction: TextInputAction.search,
            decoration: InputDecoration(
              hintText: 'Search location',
              prefixIcon: const Icon(Icons.search_rounded, color: AppColors.primary),
              suffixIcon: _loading
                  ? const Padding(
                      padding: EdgeInsets.all(12),
                      child: SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                      ),
                    )
                  : (_controller.text.isEmpty
                      ? null
                      : IconButton(
                          onPressed: () {
                            _controller.clear();
                            setState(() {
                              _results = const [];
                              _error = null;
                            });
                          },
                          icon: const Icon(Icons.close_rounded, color: AppColors.muted),
                        )),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
            ),
          ),
        ),
        if (_error != null) ...[
          const SizedBox(height: 6),
          Material(
            color: AppColors.paper,
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Text(_error!, style: const TextStyle(color: AppColors.danger, fontSize: 12)),
            ),
          ),
        ],
        if (_results.isNotEmpty) ...[
          const SizedBox(height: 6),
          Material(
            elevation: 4,
            borderRadius: BorderRadius.circular(14),
            color: AppColors.paper,
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 220),
              child: ListView.separated(
                shrinkWrap: true,
                padding: EdgeInsets.zero,
                itemCount: _results.length,
                separatorBuilder: (_, _) => const Divider(height: 1, color: AppColors.line),
                itemBuilder: (context, index) {
                  final item = _results[index];
                  return ListTile(
                    dense: true,
                    leading: const Icon(Icons.place_outlined, color: AppColors.primary),
                    title: Text(item.name, maxLines: 1, overflow: TextOverflow.ellipsis),
                    subtitle: Text(item.place, maxLines: 1, overflow: TextOverflow.ellipsis),
                    onTap: () => _pick(item),
                  );
                },
              ),
            ),
          ),
        ],
      ],
    );
  }
}
