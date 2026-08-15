# Flutter

Use plain HTTP — no Better Auth package required.

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<Map<String, dynamic>> login(String email, String password) async {
  final res = await http.post(
    Uri.parse('http://localhost:3001/api/v1/auth/login'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'email': email, 'password': password}),
  );
  if (res.statusCode >= 400) {
    throw Exception(res.body);
  }
  return jsonDecode(res.body) as Map<String, dynamic>;
}

Future<Map<String, dynamic>> me(String accessToken) async {
  final res = await http.get(
    Uri.parse('http://localhost:3001/api/v1/auth/me'),
    headers: {'Authorization': 'Bearer $accessToken'},
  );
  return jsonDecode(res.body) as Map<String, dynamic>;
}
```

Store `accessToken` securely (e.g. `flutter_secure_storage`). Send `jwt` to your backend APIs; those backends verify via JWKS.
