import { Hono } from "hono";
import { AppEnv } from "./env";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

const authApp = new Hono<AppEnv>();

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function randomBase64Url(bytesLength = 32): string {
  const bytes = new Uint8Array(bytesLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes.buffer);
}

async function sha256Base64Url(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(digest);
}

function getCallbackUrl(requestUrl: string): string {
  return new URL("/auth/github/callback", requestUrl).toString();
}

authApp.get("/auth/github/login", async (c) => {
  const state = randomBase64Url();
  const codeVerifier = randomBase64Url(64);
  const codeChallenge = await sha256Base64Url(codeVerifier);

  const isHttps = new URL(c.req.url).protocol === "https:";

  setCookie(c, "github_oauth_state", state, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "Lax",
    path: "/",
    maxAge: 10 * 60,
  });

  setCookie(c, "github_oauth_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "Lax",
    path: "/",
    maxAge: 10 * 60,
  });

  const url = new URL("https://github.com/login/oauth/authorize");

  url.searchParams.set("client_id", c.env.GITHUB_CLIENT_ID);
  url.searchParams.set("redirect_uri", getCallbackUrl(c.req.url));
  url.searchParams.set("scope", "read:user user:email");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  return c.redirect(url.toString());
});

authApp.get("/auth/github/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");

  const expectedState = getCookie(c, "github_oauth_state");
  const codeVerifier = getCookie(c, "github_oauth_code_verifier");

  deleteCookie(c, "github_oauth_state", { path: "/" });
  deleteCookie(c, "github_oauth_code_verifier", { path: "/" });

  if (!code || !state || !expectedState || state !== expectedState) {
    return c.text("Invalid OAuth state", 400);
  }

  if (!codeVerifier) {
    return c.text("Missing OAuth code verifier", 400);
  }

  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: c.env.GITHUB_CLIENT_ID,
        client_secret: c.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: getCallbackUrl(c.req.url),
        code_verifier: codeVerifier,
      }),
    },
  );

  const tokenData = await tokenResponse.json<{
    access_token?: string;
    token_type?: string;
    scope?: string;
    error?: string;
    error_description?: string;
  }>();

  if (!tokenResponse.ok || !tokenData.access_token) {
    return c.json(
      {
        error: tokenData.error ?? "oauth_token_exchange_failed",
        description: tokenData.error_description,
      },
      400,
    );
  }

  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${tokenData.access_token}`,
      "User-Agent": "your-app-name",
    },
  });

  if (!userResponse.ok) {
    return c.text("Failed to fetch GitHub user", 400);
  }

  const githubUser = await userResponse.json<{
    id: number;
    login: string;
    name: string | null;
    avatar_url: string;
    email: string | null;
  }>();

  // 这里不要只用 login 当唯一用户标识，因为 GitHub username 可能变化。
  // 应该用 githubUser.id 作为稳定外部身份 ID。
  //
  // const user = await upsertUserByGitHubId(githubUser);
  // const sessionId = await createSession(user.id);

  const sessionId = crypto.randomUUID();

  const isHttps = new URL(c.req.url).protocol === "https:";

  setCookie(c, "session", sessionId, {
    httpOnly: true,
    secure: isHttps,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return c.redirect("/");
});

export default authApp;
