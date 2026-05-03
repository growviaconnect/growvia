// Uses only Web Crypto API (no Node.js built-in imports) — compatible with
// all Next.js runtimes including Turbopack and Edge.

function toBase64url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1024) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 1024));
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function encodeBase64url(str: string): string {
  return toBase64url(new TextEncoder().encode(str));
}

async function getAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "";
  const key   = (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");

  if (!email || !key) throw new Error("Google service account credentials not configured");

  const now     = Math.floor(Date.now() / 1000);
  const header  = encodeBase64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = encodeBase64url(JSON.stringify({
    iss:   email,
    scope: "https://www.googleapis.com/auth/calendar",
    aud:   "https://oauth2.googleapis.com/token",
    exp:   now + 3600,
    iat:   now,
  }));

  const sigInput = `${header}.${payload}`;

  // Import RSA private key (PKCS#8 PEM — Google service account format)
  const pemBody = key
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sigBuf = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(sigInput)
  );

  const jwt = `${sigInput}.${toBase64url(new Uint8Array(sigBuf))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion:  jwt,
    }),
  });

  const json = await res.json() as { access_token?: string; error?: string; error_description?: string };
  if (!res.ok) throw new Error(`Google OAuth: ${json.error_description ?? json.error}`);
  return json.access_token!;
}

export async function createMeetLink(params: {
  title:     string;
  startIso:  string;
  endIso:    string;
  attendees: string[];
}): Promise<string> {
  const token = await getAccessToken();

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=none",
    {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary:  params.title,
        start:    { dateTime: params.startIso, timeZone: "UTC" },
        end:      { dateTime: params.endIso,   timeZone: "UTC" },
        attendees: params.attendees.map(email => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: Math.random().toString(36).slice(2),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      }),
    }
  );

  type EntryPoint = { entryPointType: string; uri: string };
  const event = await res.json() as { conferenceData?: { entryPoints?: EntryPoint[] }; error?: unknown };
  if (!res.ok) throw new Error(`Google Calendar API: ${JSON.stringify(event.error)}`);

  const link = event.conferenceData?.entryPoints?.find(ep => ep.entryPointType === "video")?.uri;
  if (!link) throw new Error("No Meet link in Calendar response");
  return link;
}
