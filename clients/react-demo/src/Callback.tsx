import { useEffect, useState } from "react";
import { getOAuthSession, storeTokens } from "./api";

export function Callback() {
  const [status, setStatus] = useState("Finishing social login…");
  const [detail, setDetail] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const params = Object.fromEntries(
      new URLSearchParams(window.location.search),
    );
    if (params.error) {
      setStatus("OAuth returned an error");
      setDetail(JSON.stringify(params, null, 2));
      return;
    }

    void (async () => {
      try {
        const result = await getOAuthSession();
        storeTokens(result.tokens);
        setOk(true);
        setStatus(`Signed in as ${result.user.email}`);
        window.setTimeout(() => {
          window.location.replace("/");
        }, 800);
      } catch (err) {
        setStatus(
          err instanceof Error
            ? err.message
            : "Could not read the session after Google login. Keep the API running on port 3001 and try again.",
        );
      }
    })();
  }, []);

  return (
    <main className="page">
      <div className="card">
        <p className="eyebrow">OAuth callback</p>
        <h1>{ok ? "Welcome back" : "Working"}</h1>
        <p className="lede">{status}</p>
        {detail ? <pre className="token">{detail}</pre> : null}
        <a className="btn" href="/">
          Continue to app
        </a>
      </div>
    </main>
  );
}
