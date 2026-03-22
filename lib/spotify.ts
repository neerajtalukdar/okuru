let cachedToken: { token: string; expires: number } | null = null;

export async function getSpotifyToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.token;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
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
  cachedToken = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.token;
}

export interface SpotifyTrack {
  id: string;
  spotifyUrl: string;
  previewUrl: string | null;
  albumArt: string | null;
  durationMs: number;
}

export async function searchTrack(
  title: string,
  artist: string,
  token: string
): Promise<SpotifyTrack | null> {
  const q = encodeURIComponent(`track:${title} artist:${artist}`);
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) return null;
  const data = await res.json();
  const item = data.tracks?.items?.[0];
  if (!item) return null;

  return {
    id: item.id,
    spotifyUrl: item.external_urls.spotify,
    previewUrl: item.preview_url,
    albumArt: item.album?.images?.[1]?.url ?? item.album?.images?.[0]?.url ?? null,
    durationMs: item.duration_ms,
  };
}
