# Python

```python
import requests

BASE = "http://localhost:3001"

def login(email: str, password: str) -> dict:
    r = requests.post(
        f"{BASE}/api/v1/auth/login",
        json={"email": email, "password": password},
        timeout=10,
    )
    r.raise_for_status()
    return r.json()

def me(access_token: str) -> dict:
    r = requests.get(
        f"{BASE}/api/v1/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    )
    r.raise_for_status()
    return r.json()
```

Verify JWTs in Python APIs with PyJWT + JWKS (`jwt.PyJWKClient`) against:

`http://localhost:3001/.well-known/jwks.json`
