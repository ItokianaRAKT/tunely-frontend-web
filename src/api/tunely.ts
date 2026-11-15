const BASE_URL: string =
  (import.meta.env.VITE_TUNELY_API_URL as string | undefined) ??
  'http://localhost:8000'

export type BackendTrack = {
  id: number
  title: string
  artist: string
  youtube_id: string
  vote_count: number
  duration_seconds: number | null
}

export type CurrentTrackState = {
  track: BackendTrack | null
  is_paused: boolean
  started_at: string | null
}

type RequestOptions = {
  method?: string
  body?: unknown
}

export async function fetchWithClerkToken(
  input: RequestInfo | URL,
  getToken: () => Promise<string | null>,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getToken()
  if (!token) {
    throw new Error('Missing Clerk token for authenticated request')
  }

  const headers = new Headers(init.headers ?? {})
  headers.set('Authorization', `Bearer ${token}`)

  return fetch(input, {
    ...init,
    headers,
  })
}

async function call<T>(
  path: string,
  getToken: () => Promise<string | null>,
  options: RequestOptions = {},
): Promise<T | null> {
  try {
    const access = await getToken()
    if (!access) return null

    const response = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access}`,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })

    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

export async function createBackendRoom(
  getToken: () => Promise<string | null>,
  name: string,
): Promise<string | null> {
  const room = await call<{ code?: unknown }>('/rooms/', getToken, {
    method: 'POST',
    body: { name },
  })
  return typeof room?.code === 'string' ? room.code : null
}

export async function proposeTrack(
  getToken: () => Promise<string | null>,
  code: string,
  title: string,
  artist: string,
  durationSeconds?: number,
): Promise<BackendTrack | null> {
  return call<BackendTrack>(`/rooms/${encodeURIComponent(code)}/tracks`, getToken, {
    method: 'POST',
    body: {
      title,
      artist,
      ...(durationSeconds ? { duration_seconds: durationSeconds } : {}),
    },
  })
}

export async function skipToNext(
  getToken: () => Promise<string | null>,
  code: string,
): Promise<BackendTrack | null> {
  const result = await call<{ track?: BackendTrack | null }>(
    `/rooms/${encodeURIComponent(code)}/current/next`,
    getToken,
    { method: 'POST' },
  )
  return result?.track ?? null
}

export async function getCurrentTrack(
  getToken: () => Promise<string | null>,
  code: string,
): Promise<CurrentTrackState | null> {
  return call<CurrentTrackState>(`/rooms/${encodeURIComponent(code)}/current`, getToken)
}

export type AdoptedVideo = {
  youtubeId: string
  duration: number | null
}

function matches(track: BackendTrack, title: string, artist: string) {
  return track.title === title && track.artist === artist
}

function toVideo(track: BackendTrack): AdoptedVideo | null {
  if (!track.youtube_id) return null
  return { youtubeId: track.youtube_id, duration: track.duration_seconds }
}

async function startTrack(
  getToken: () => Promise<string | null>,
  code: string,
  title: string,
  artist: string,
  durationSeconds?: number,
): Promise<AdoptedVideo | null> {
  await proposeTrack(getToken, code, title, artist, durationSeconds)
  const started = await skipToNext(getToken, code)
  if (!started || !matches(started, title, artist)) return null
  return toVideo(started)
}

/**
 * Resolve the YouTube video id of a local track through the backend.
 * Returns null whenever the backend is unreachable or its queue does not
 * line up with the local one, so callers can stay on simulated playback.
 * When the caller knows the official duration of the track, it is stored on
 * the proposal so the backend can filter InnerTube results against it.
 */
export async function resolveVideoId(
  getToken: () => Promise<string | null>,
  code: string,
  title: string,
  artist: string,
  durationSeconds?: number,
): Promise<AdoptedVideo | null> {
  const current = await getCurrentTrack(getToken, code)
  if (current?.track) {
    if (matches(current.track, title, artist)) return toVideo(current.track)
    // The backend clock is on another track: propose the local one and let
    // the backend advance, adopting only on an exact title/artist match.
    return startTrack(getToken, code, title, artist, durationSeconds)
  }
  return startTrack(getToken, code, title, artist, durationSeconds)
}
