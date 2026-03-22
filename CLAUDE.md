# Okuru

Playlist gifting app. Users fill in details about a person → Claude generates a curated 10-track playlist → saved to Redis with a short ID → shareable link at `/p/[id]`.

## Stack
- Next.js 16 (App Router, TypeScript)
- Anthropic SDK — `claude-opus-4-6` for playlist generation
- Spotify Web API — client credentials flow, searches tracks for album art + Spotify links
- Upstash Redis — permanent playlist storage
- Deployed on Vercel at `okuru-app.vercel.app`

## Key files
- `app/page.tsx` — form (recipient, relationship, occasion, traits, note)
- `app/api/generate/route.ts` — calls Claude, enriches with Spotify, saves to Redis, returns `{ id }`
- `app/p/[id]/page.tsx` — server component, fetches from Redis, renders PlaylistView
- `components/PlaylistView.tsx` — client component, album art, audio previews, share button
- `app/api/image/route.ts` — proxies Spotify CDN images (i.scdn.co blocks hotlinking)
- `lib/spotify.ts` — token cache + track search
- `lib/store.ts` — Redis get/set with nanoid short IDs

## Env vars needed
```
ANTHROPIC_API_KEY
SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

## Dev
```
npm run dev   # runs on port 3457
```

## Notes
- Spotify preview URLs are mostly deprecated — album art + Spotify links work, inline audio usually doesn't
- Vercel Authentication must be **disabled** in Project Settings → Deployment Protection for the image proxy to work publicly
- After `vercel --prod`, manually re-alias: `vercel alias set <url> okuru-app.vercel.app`
- Playlists stored permanently (no expiry)
