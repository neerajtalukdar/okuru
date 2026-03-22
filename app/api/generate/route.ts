import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getSpotifyToken, searchTrack } from "@/lib/spotify";
import { savePlaylist } from "@/lib/store";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { recipient, relationship, occasion, traits, note } = await req.json();

  const prompt = `You are a music curator creating a deeply personal playlist as a gift.

Create a playlist for someone with these details:
- Name: ${recipient}
- Relationship: ${relationship}
- Occasion: ${occasion}
- About them: ${traits || "No additional details provided"}
- Personal note from sender: ${note || "None"}

Return ONLY valid JSON in this exact format, no other text:
{
  "playlistName": "A poetic, specific name for this playlist (not generic)",
  "playlistTheme": "One sentence capturing the emotional arc or feeling of this playlist",
  "tracks": [
    {
      "title": "Song Title",
      "artist": "Artist Name",
      "reason": "One sentence — why this song for this person right now"
    }
  ]
}

Include exactly 10 tracks. Make them feel handpicked, not algorithmic. Mix eras and genres if it fits. The reason for each track should feel personal and specific, not generic. Use real, well-known songs that exist on Spotify.`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const playlist = JSON.parse(jsonMatch[0]);

    // Enrich with Spotify data
    let spotifyToken: string | null = null;
    try {
      spotifyToken = await getSpotifyToken();
    } catch (e) {
      console.error("Spotify token error:", e);
    }

    if (spotifyToken) {
      const enriched = await Promise.all(
        playlist.tracks.map(async (track: { title: string; artist: string; reason: string }) => {
          const spotify = await searchTrack(track.title, track.artist, spotifyToken!);
          return { ...track, spotify };
        })
      );
      playlist.tracks = enriched;
    }

    // Save to Redis and return short ID
    const id = await savePlaylist({ playlist, recipient, note });

    return NextResponse.json({ id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate playlist" }, { status: 500 });
  }
}
