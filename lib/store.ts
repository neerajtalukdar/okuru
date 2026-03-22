import { Redis } from "@upstash/redis";
import { nanoid } from "nanoid";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface StoredPlaylist {
  playlist: {
    playlistName: string;
    playlistTheme: string;
    tracks: Array<{
      title: string;
      artist: string;
      reason: string;
      spotify?: {
        id: string | null;
        spotifyUrl: string | null;
        previewUrl: string | null;
        albumArt: string | null;
        durationMs: number;
      } | null;
    }>;
  };
  recipient: string;
  note: string;
  createdAt: number;
}

export async function savePlaylist(data: Omit<StoredPlaylist, "createdAt">): Promise<string> {
  const id = nanoid(8);
  await redis.set(`playlist:${id}`, { ...data, createdAt: Date.now() }, { ex: 60 * 60 * 24 * 90 }); // 90 days
  return id;
}

export async function getPlaylist(id: string): Promise<StoredPlaylist | null> {
  return redis.get<StoredPlaylist>(`playlist:${id}`);
}
