import { useEffect, useState } from "react";
import { getBrowserSession, me, refreshJwt, storeTokens } from "./api";

export function Callback() {
  const [status, setStatus] = useState("Finishing social login…");
  const [detail, setDetail] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const params = Object.fromEntries(new URLSearchParams(window.location.search));
    if (params.error) {
      setStatus("OAuth returned an error");
      setDetail(JSON.stringify(params, null, 2));
      return;
    }

    void (async () => {
      try {
        const session = await getBrowserSession();
        const token = session?.session?.token;
        if (token) {
          const [profile, jwt] = await Promise.all([
            me(token).catch(() => null),
            refreshJwt(token),
          ]);
          storeTokens({
            accessToken: token,
            jwt: jwt ?? token,
            tokenType: "Bearer",
            expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          });
          setOk(true);
          setStatus(
            profile?.user
              ? `Signed in as ${profile.user.email}`
              : "Social login completed. Session cookie is set.",
          );
          return;
        }

        if (session?.user) {
          setOk(true);
          setStatus(`Signed in as ${session.user.email}`);
          return;
        }

        setOk(true);
        setStatus(
          "Returned from Google/GitHub. If you are not signed in, add http://localhost:5173/callback to this app's Redirect URIs in Admin.",
        );
        if (Object.keys(params).length > 0) {
          setDetail(JSON.stringify(params, null, 2));
        }
      } catch (err) {
        setStatus(err instanceof Error ? err.message : "Callback failed");
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
