# Go

```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func login(email, password string) (map[string]any, error) {
	body, _ := json.Marshal(map[string]string{
		"email": email, "password": password,
	})
	res, err := http.Post(
		"http://localhost:3001/api/v1/auth/login",
		"application/json",
		bytes.NewReader(body),
	)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	data, _ := io.ReadAll(res.Body)
	var out map[string]any
	_ = json.Unmarshal(data, &out)
	return out, nil
}

func me(accessToken string) {
	req, _ := http.NewRequest("GET", "http://localhost:3001/api/v1/auth/me", nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)
	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}
```

Verify JWTs in Go APIs with a JWKS library (e.g. `github.com/lestrrat-go/jwx/v2`) pointing at:

`http://localhost:3001/.well-known/jwks.json`
