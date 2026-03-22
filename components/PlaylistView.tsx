"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import type { StoredPlaylist } from "@/lib/store";

function useAudioPlayer(tracks: StoredPlaylist["playlist"]["tracks"]) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      const onTimeUpdate = () => {
        setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
      };
      const onEnded = () => setPlayingIndex(null);
      audio.addEventListener("timeupdate", onTimeUpdate);
      audio.addEventListener("ended", onEnded);
      return () => {
        audio.removeEventListener("timeupdate", onTimeUpdate);
        audio.removeEventListener("ended", onEnded);
      };
    }
  }, []);

  const toggle = (index: number) => {
    const track = tracks[index];
    const previewUrl = track.spotify?.previewUrl;
    if (!previewUrl) return;

    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;

    if (playingIndex === index) {
      audio.pause();
      setPlayingIndex(null);
    } else {
      audio.src = previewUrl;
      audio.play();
      setPlayingIndex(index);
    }
  };

  return { playingIndex, progress, toggle };
}

export default function PlaylistView({ data, id }: { data: StoredPlaylist; id: string }) {
  const router = useRouter();
  const { playlist, recipient, note } = data;
  const { playingIndex, progress, toggle } = useAudioPlayer(playlist.tracks);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/p/${id}`
    : `/p/${id}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: playlist.playlistName,
        text: `A playlist made for ${recipient}: ${playlist.playlistTheme}`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="w-full max-w-lg mx-auto">

        {/* Top nav */}
        <div className="flex items-center justify-between mb-16">
          <p className="text-xs tracking-[0.25em] uppercase" style={{ color: "var(--muted)" }}>
            送る · Okuru
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-xs tracking-widest uppercase transition-colors"
            style={{ color: "var(--muted)" }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--fg)")}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--muted)")}
          >
            ← Make another
          </button>
        </div>

        {/* For label */}
        <div className="mb-10">
          <p className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: "var(--muted)" }}>
            A playlist for
          </p>
          <h1
            className="text-5xl leading-tight mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}
          >
            {recipient}
          </h1>
        </div>

        {/* Playlist header */}
        <div
          className="rounded-2xl p-6 mb-3"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div
            className="inline-flex items-center gap-1.5 text-xs tracking-widest uppercase px-3 py-1 rounded-full mb-4"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            <span>♫</span>
            <span>Your playlist</span>
          </div>
          <h2
            className="text-3xl leading-tight mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}
          >
            {playlist.playlistName}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-light)" }}>
            {playlist.playlistTheme}
          </p>
        </div>

        {/* Tracks */}
        <div
          className="rounded-2xl mb-3 overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {playlist.tracks.map((track, i) => {
            const isPlaying = playingIndex === i;
            const hasPreview = !!track.spotify?.previewUrl;

            return (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  borderBottom: i < playlist.tracks.length - 1 ? "1px solid var(--border)" : "none",
                  background: isPlaying ? "var(--accent-glow)" : "transparent",
                }}
              >
                {/* Album art / play */}
                <div
                  className="relative flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden"
                  style={{ background: "var(--surface-2)" }}
                >
                  {track.spotify?.albumArt ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={track.spotify.albumArt}
                      alt={`${track.title} album art`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: "var(--muted)" }}>
                      ♪
                    </div>
                  )}
                  {hasPreview && (
                    <button
                      onClick={() => toggle(i)}
                      className="absolute inset-0 flex items-center justify-center transition-all"
                      style={{ background: isPlaying ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.55)"; }}
                      onMouseLeave={(e) => { if (!isPlaying) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0)"; }}
                    >
                      <span className="text-white text-xs font-bold">{isPlaying ? "▐▐" : "▶"}</span>
                    </button>
                  )}
                </div>

                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-x-2 flex-wrap">
                    <span className="text-sm font-medium" style={{ color: isPlaying ? "var(--accent)" : "var(--fg)" }}>
                      {track.title}
                    </span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{track.artist}</span>
                  </div>
                  <p className="text-xs leading-relaxed mt-0.5 line-clamp-2" style={{ color: "var(--muted)" }}>
                    {track.reason}
                  </p>
                  {isPlaying && (
                    <div className="mt-1.5 h-0.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%`, background: "var(--accent)" }}
                      />
                    </div>
                  )}
                </div>

                {/* Spotify link */}
                {track.spotify?.spotifyUrl && (
                  <a
                    href={track.spotify.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-colors"
                    style={{ color: "var(--muted)" }}
                    title="Open in Spotify"
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#1DB954")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--muted)")}
                  >
                    <SpotifyIcon />
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* Personal note */}
        {note && (
          <div
            className="rounded-2xl p-6 mb-8 relative overflow-hidden"
            style={{ background: "var(--accent-glow)", border: "1px solid rgba(196,168,130,0.2)" }}
          >
            <span
              className="absolute -top-2 left-4 text-7xl leading-none select-none pointer-events-none"
              style={{ fontFamily: "var(--font-display)", color: "rgba(196,168,130,0.12)" }}
            >
              "
            </span>
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--accent)" }}>A note</p>
            <p className="text-sm leading-relaxed relative z-10" style={{ color: "var(--fg)" }}>{note}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 py-3.5 rounded-2xl text-xs font-medium tracking-widest uppercase transition-all duration-200"
            style={{ background: "var(--accent)", color: "#0c0a10" }}
          >
            {copied ? "Link copied!" : "Share this"}
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 py-3.5 rounded-2xl text-xs font-medium tracking-widest uppercase transition-all duration-200"
            style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--muted-light)" }}
          >
            Make another
          </button>
        </div>

        <p className="text-center text-xs mt-10" style={{ color: "var(--muted)" }}>
          送る · Made with care
        </p>
      </div>
    </main>
  );
}

function SpotifyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.56-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}
