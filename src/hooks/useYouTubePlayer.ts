import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'

type YouTubePlayer = {
  cueVideoById(videoId: string): void
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  getCurrentTime(): number
  getDuration(): number
  getPlayerState(): number
  destroy(): void
}

type YouTubeApi = {
  Player: new (element: HTMLElement, options: Record<string, unknown>) => YouTubePlayer
}

declare global {
  interface Window {
    YT?: YouTubeApi
    onYouTubeIframeAPIReady?: () => void
  }
}

type PlayerOptions = {
  enabled: boolean
  onTick: (time: number, duration: number) => void
  onEnded: () => void
  onError: () => void
  onPlayingChange: (playing: boolean) => void
  onPlayBlocked: () => void
}

export type YouTubeController = {
  cue: (videoId: string) => void
  play: () => void
  pause: () => void
  seek: (seconds: number) => void
}

const STATE_ENDED = 0
const STATE_PLAYING = 1
const STATE_PAUSED = 2
const STATE_BUFFERING = 3

const PLAY_WATCHDOG_MS = 1200
const TICK_MS = 250

let apiPromise: Promise<YouTubeApi | null> | null = null

function loadYouTubeApi(): Promise<YouTubeApi | null> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (!apiPromise) {
    apiPromise = new Promise<YouTubeApi | null>((resolve) => {
      const previous = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previous?.()
        resolve(window.YT?.Player ? window.YT : null)
      }
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      tag.onerror = () => resolve(null)
      document.head.appendChild(tag)
    }).then((api) => {
      if (!api) apiPromise = null
      return api
    })
  }
  return apiPromise
}

function createWrapper(): HTMLDivElement {
  const wrapper = document.createElement('div')
  wrapper.setAttribute('aria-hidden', 'true')
  wrapper.style.cssText =
    'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;'
  const target = document.createElement('div')
  wrapper.appendChild(target)
  document.body.appendChild(wrapper)
  return wrapper
}

export function useYouTubePlayer(options: PlayerOptions): YouTubeController | null {
  const { enabled } = options
  const optionsRef = useRef(options)
  useLayoutEffect(() => {
    optionsRef.current = options
  })

  const playerRef = useRef<YouTubePlayer | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const pendingRef = useRef({ videoId: null as string | null, play: false, seek: null as number | null })
  const createdWithRef = useRef<string | null>(null)
  const pollRef = useRef<number | null>(null)
  const watchdogRef = useRef<number | null>(null)

  const clearWatchdog = useCallback(() => {
    if (watchdogRef.current !== null) {
      window.clearTimeout(watchdogRef.current)
      watchdogRef.current = null
    }
  }, [])

  const armWatchdog = useCallback(() => {
    clearWatchdog()
    watchdogRef.current = window.setTimeout(() => {
      const state = playerRef.current?.getPlayerState()
      if (state === STATE_PLAYING || state === STATE_BUFFERING) return
      optionsRef.current.onPlayBlocked()
    }, PLAY_WATCHDOG_MS)
  }, [clearWatchdog])

  const ensurePlayer = useCallback(async () => {
    if (playerRef.current) return
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const api = await loadYouTubeApi()
    if (!api) {
      optionsRef.current.onError()
      return
    }
    if (playerRef.current) return
    const target = wrapper.firstElementChild as HTMLElement
    const videoId = pendingRef.current.videoId ?? ''
    createdWithRef.current = videoId
    const player = new api.Player(target, {
      width: '1',
      height: '1',
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        playsinline: 1,
        rel: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        fs: 0,
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          const pending = pendingRef.current
          if (pending.videoId && pending.videoId !== createdWithRef.current) {
            player.cueVideoById(pending.videoId)
            createdWithRef.current = pending.videoId
          }
          if (pending.seek !== null) {
            player.seekTo(pending.seek, true)
            pending.seek = null
          }
          if (pending.play) {
            pending.play = false
            player.playVideo()
            armWatchdog()
          }
        },
        onStateChange: (event: { data?: number }) => {
          const state = event.data
          if (state === STATE_ENDED) {
            clearWatchdog()
            optionsRef.current.onEnded()
            return
          }
          if (state === STATE_PLAYING || state === STATE_BUFFERING) {
            clearWatchdog()
          }
          if (state === STATE_PLAYING) optionsRef.current.onPlayingChange(true)
          if (state === STATE_PAUSED) optionsRef.current.onPlayingChange(false)
        },
        onError: () => optionsRef.current.onError(),
      },
    })
    playerRef.current = player
    pollRef.current = window.setInterval(() => {
      const current = playerRef.current
      if (!current || current.getPlayerState() !== STATE_PLAYING) return
      const time = current.getCurrentTime()
      const duration = current.getDuration()
      if (duration > 0) optionsRef.current.onTick(time, duration)
    }, TICK_MS)
  }, [armWatchdog, clearWatchdog])

  const cue = useCallback(
    (videoId: string) => {
      pendingRef.current.videoId = videoId
      const player = playerRef.current
      if (player) {
        player.cueVideoById(videoId)
        createdWithRef.current = videoId
        return
      }
      if (!wrapperRef.current) wrapperRef.current = createWrapper()
      void ensurePlayer()
    },
    [ensurePlayer],
  )

  const play = useCallback(() => {
    const player = playerRef.current
    if (!player) {
      pendingRef.current.play = true
      return
    }
    player.playVideo()
    armWatchdog()
  }, [armWatchdog])

  const pause = useCallback(() => {
    clearWatchdog()
    const player = playerRef.current
    if (!player) {
      pendingRef.current.play = false
      return
    }
    player.pauseVideo()
  }, [clearWatchdog])

  const seek = useCallback((seconds: number) => {
    const player = playerRef.current
    if (!player) {
      pendingRef.current.seek = seconds
      return
    }
    player.seekTo(seconds, true)
    const duration = player.getDuration()
    if (duration > 0) optionsRef.current.onTick(seconds, duration)
  }, [])

  useEffect(() => {
    if (!enabled) return
    return () => {
      if (pollRef.current !== null) {
        window.clearInterval(pollRef.current)
        pollRef.current = null
      }
      clearWatchdog()
      playerRef.current?.destroy()
      playerRef.current = null
      wrapperRef.current?.remove()
      wrapperRef.current = null
      pendingRef.current = { videoId: null, play: false, seek: null }
      createdWithRef.current = null
    }
  }, [enabled, clearWatchdog])

  return useMemo<YouTubeController | null>(
    () => (enabled ? { cue, play, pause, seek } : null),
    [enabled, cue, play, pause, seek],
  )
}
