import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  const hasId = !!clientId;
  const hasSecret = !!clientSecret;

  let tokenResult = null;
  let tokenError = null;

  if (clientId && clientSecret) {
    try {
      const creds = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${creds}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });
      const data = await res.json();
      tokenResult = data.access_token ? "ok" : `failed: ${JSON.stringify(data)}`;
    } catch (e) {
      tokenError = String(e);
    }
  }

  return NextResponse.json({ hasId, hasSecret, tokenResult, tokenError });
}
