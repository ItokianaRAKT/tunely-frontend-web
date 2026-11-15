/**
 * iTunes Search API client.
 *
 * The endpoint answers with `access-control-allow-origin: *`, so the browser
 * calls it directly. It is only used to turn what the user typed into the
 * official title, artist, duration and square artwork of a real release,
 * which the room then relies on to pick the right YouTube video.
 */

const SEARCH_URL = 'https://itunes.apple.com/search'
const LIMIT = 12

export type ITunesTrack = {
  id: number
  title: string
  artist: string
  /** Official length in whole seconds (from trackTimeMillis). */
  duration: number
  /** Square artwork upscaled to 600x600. */
  art?: string
}

type ITunesResponse = {
  results?: unknown[]
}

function toTrack(raw: unknown, index: number): ITunesTrack | null {
  if (typeof raw !== 'object' || raw === null) return null
  const item = raw as Record<string, unknown>

  const title = item.trackName
  const artist = item.artistName
  const durationMs = item.trackTimeMillis
  if (typeof title !== 'string' || !title.trim()) return null
  if (typeof artist !== 'string' || !artist.trim()) return null
  if (typeof durationMs !== 'number' || !Number.isFinite(durationMs) || durationMs <= 0) {
    return null
  }

  const thumb = typeof item.artworkUrl100 === 'string' ? item.artworkUrl100 : ''
  const art = thumb.replace('100x100bb', '600x600bb') || undefined
  const id = typeof item.trackId === 'number' ? item.trackId : index

  return {
    id,
    title: title.trim(),
    artist: artist.trim(),
    duration: Math.round(durationMs / 1000),
    art,
  }
}

/**
 * Search official songs on iTunes. Rejects on network or HTTP failures so
 * callers can fall back to manual entry; an empty array means "no match".
 */
export async function searchITunes(
  term: string,
  signal?: AbortSignal,
): Promise<ITunesTrack[]> {
  const params = new URLSearchParams({ term, entity: 'song', limit: String(LIMIT) })
  const response = await fetch(`${SEARCH_URL}?${params.toString()}`, { signal })
  if (!response.ok) throw new Error(`iTunes search failed: ${response.status}`)

  const payload = (await response.json()) as ITunesResponse
  const tracks: ITunesTrack[] = []
  for (const [index, raw] of (payload.results ?? []).entries()) {
    const track = toTrack(raw, index)
    if (track) tracks.push(track)
  }
  return tracks
}
