const BASE_URL: string =
  (import.meta.env.VITE_TUNELY_API_URL as string | undefined) ??
  'http://localhost:8000'
const EMAIL: string =
  (import.meta.env.VITE_TUNELY_EMAIL as string | undefined) ??
  'test@tunely.com'
const PASSWORD: string =
  (import.meta.env.VITE_TUNELY_PASSWORD as string | undefined) ??
  'password123'

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

let token: string | null = null

async function requestToken(): Promise<string | null> {
  if (token) return token
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    })
    if (!response.ok) return null
    const payload = (await response.json()) as { access_token?: unknown }
    token = typeof payload.access_token === 'string' ? payload.access_token : null
    return token
  } catch {
    return null
  }
}

async function call<T>(path: string, options: RequestOptions = {}): Promise<T | null> {
  const send = (access: string) =>
    fetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access}`,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })

  try {
    const access = await requestToken()
    if (!access) return null
    let response = await send(access)
    if (response.status === 401) {
      token = null
      const retried = await requestToken()
      if (!retried) return null
      response = await send(retried)
    }
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

export async function createRoom(name: string): Promise<string | null> {
  const room = await call<{ code?: unknown }>('/rooms/', {
    method: 'POST',
    body: { name },
  })
  return typeof room?.code === 'string' ? room.code : null
}

export async function proposeTrack(
  code: string,
  title: string,
  artist: string,
): Promise<BackendTrack | null> {
  return call<BackendTrack>(`/rooms/${encodeURIComponent(code)}/tracks`, {
    method: 'POST',
    body: { title, artist },
  })
}

export async function skipToNext(code: string): Promise<BackendTrack | null> {
  const result = await call<{ track?: BackendTrack | null }>(
    `/rooms/${encodeURIComponent(code)}/current/next`,
    { method: 'POST' },
  )
  return result?.track ?? null
}

export async function getCurrentTrack(code: string): Promise<CurrentTrackState | null> {
  return call<CurrentTrackState>(`/rooms/${encodeURIComponent(code)}/current`)
}
