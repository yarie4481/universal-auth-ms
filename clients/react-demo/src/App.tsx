import { useEffect, useState, type FormEvent } from "react";
import {
  CLIENT_ID,
  clearTokens,
  getStoredAccessToken,
  getStoredJwt,
  login,
  logout,
  me,
  register,
  startOAuth,
  storeTokens,
  type AuthUser,
} from "./api";

type Mode = "login" | "register";

export function App() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("Demo User");
  const [email, setEmail] = useState("demo@test.com");
  const [password, setPassword] = useState("Password123!");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [jwt, setJwt] = useState<string | null>(getStoredJwt());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) return;
    me(token)
      .then((result) => setUser(result.user))
      .catch(() => clearTokens());
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result =
        mode === "register"
          ? await register(name, email, password)
          : await login(email, password);
      storeTokens(result.tokens);
      setUser(result.user);
      setJwt(result.tokens.jwt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    const token = getStoredAccessToken();
    if (token) {
      await logout(token).catch(() => undefined);
    }
    clearTokens();
    setUser(null);
    setJwt(null);
  }

  async function onSocial(provider: "google" | "github") {
    setBusy(true);
    setError(null);
    try {
      await startOAuth(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : "OAuth failed");
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <div className="card">
        <p className="eyebrow">React client · port 5173</p>
        <h1>Test your auth API</h1>
        <p className="lede">
          This app talks only to your REST API. It never uses Better Auth
          directly.
        </p>

        <dl className="meta">
          <div>
            <dt>API</dt>
            <dd>http://localhost:3001</dd>
          </div>
          <div>
            <dt>clientId</dt>
            <dd>{CLIENT_ID || "(set VITE_CLIENT_ID)"}</dd>
          </div>
        </dl>

        {user ? (
          <section className="success">
            <h2>Logged in</h2>
            <p>
              <strong>{user.name}</strong>
              <br />
              {user.email}
            </p>
            {jwt ? (
              <pre className="token">{jwt.slice(0, 72)}…</pre>
            ) : null}
            <button type="button" className="btn" onClick={onLogout}>
              Log out
            </button>
          </section>
        ) : (
          <>
            <div className="tabs">
              <button
                type="button"
                className={mode === "login" ? "tab active" : "tab"}
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={mode === "register" ? "tab active" : "tab"}
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </div>

            <form onSubmit={onSubmit} className="form">
              {mode === "register" ? (
                <label>
                  Name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </label>
              ) : null}
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </label>
              <button type="submit" className="btn" disabled={busy}>
                {busy
                  ? "Working…"
                  : mode === "register"
                    ? "Create account"
                    : "Sign in"}
              </button>
            </form>

            <div className="divider">or social login</div>

            <div className="row">
              <button
                type="button"
                className="btn secondary"
                disabled={busy}
                onClick={() => onSocial("google")}
              >
                Continue with Google
              </button>
              <button
                type="button"
                className="btn secondary"
                disabled={busy}
                onClick={() => onSocial("github")}
              >
                Continue with GitHub
              </button>
            </div>
          </>
        )}

        {error ? <p className="error">{error}</p> : null}

        <ol className="hint">
          <li>
            In Admin, add redirect URI{" "}
            <code>http://localhost:5173/callback</code> and origin{" "}
            <code>http://localhost:5173</code>
          </li>
          <li>
            In Google Console, add JS origin{" "}
            <code>http://localhost:5173</code>
          </li>
          <li>Keep the API running on port 3001</li>
        </ol>
      </div>
    </main>
  );
}
