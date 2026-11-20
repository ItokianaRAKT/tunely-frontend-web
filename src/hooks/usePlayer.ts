import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { GRADIENTS } from '../data/tracks'
import type { NewTrack, Track } from '../data/tracks'
import type { AdoptedVideo } from '../api/tunely'
import { useYouTubePlayer } from './useYouTubePlayer'

type Notify = (message: string) => void

type RemoteSyncState = {
  mode: 'PARTY' | 'REMOTE' | null
  isPlaying: boolean
  startAt: number | null
  clockOffset: number
  pausedAtPosition?: number | null
  serverTime: number
}

type PlayerOptions = {
  youtube?: boolean
  shouldPlayAudio?: boolean
  roomSync?: RemoteSyncState | null
  adopt?: (track: Track) => Promise<AdoptedVideo | null>
}

function initialTime(tracks: Track[]) {
  return tracks.length > 0 ? 102 : 0
}

export function usePlayer(
  notify: Notify,
  initialTracks: Track[],
  options: PlayerOptions = {},
) {
  const { youtube = false, shouldPlayAudio = true, roomSync = null, adopt } = options
  const [tracks, setTracks] = useState(initialTracks)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playing, setPlaying] = useState(initialTracks.length > 0)
  const [time, setTime] = useState(initialTime(initialTracks))
  const [newIndex, setNewIndex] = useState<number | null>(null)

  const track = tracks[currentIndex]

  const upcomingIndex = useMemo(() => {
    const next = currentIndex + 1
    return next < tracks.length ? next : -1
  }, [tracks.length, currentIndex])

  const latestRef = useRef({ time, track, currentIndex, tracks, upcomingIndex })

  useLayoutEffect(() => {
    latestRef.current = { time, track, currentIndex, tracks, upcomingIndex }
  })

  const lastCuedRef = useRef<string | null>(null)

  const [prevInitialTracks, setPrevInitialTracks] = useState(initialTracks)
  if (prevInitialTracks !== initialTracks) {
    setPrevInitialTracks(initialTracks)
    setTracks(initialTracks)
    setCurrentIndex(0)
    setTime(initialTime(initialTracks))
    setPlaying(initialTracks.length > 0)
    setNewIndex(null)
  }

  useEffect(() => {
    lastCuedRef.current = null
  }, [initialTracks])

  const advanceTrack = useCallback(() => {
    const latest = latestRef.current
    if (!latest.track) return
    if (latest.currentIndex === latest.tracks.length - 1) {
      setTime(latest.track.duration)
      setPlaying(false)
      return
    }
    const finishedIndex = latest.currentIndex
    setTracks((list) => list.filter((_, index) => index !== finishedIndex))
    setCurrentIndex(finishedIndex)
    setTime(0)
    setNewIndex((value) => {
      if (value === null || value === finishedIndex) return null
      return value > finishedIndex ? value - 1 : value
    })
  }, [])

  const handleTick = useCallback(
    (playerTime: number, playerDuration: number) => {
      if (!latestRef.current.track?.youtubeId) return
      setTime(playerTime)
      setTracks((list) => {
        const index = latestRef.current.currentIndex
        const current = list[index]
        if (!current || current.duration === playerDuration) return list
        return list.map((item, i) =>
          i === index ? { ...item, duration: playerDuration } : item,
        )
      })
    },
    [],
  )

  const handleError = useCallback(() => {
    if (!latestRef.current.track?.youtubeId) return
    notify('Lecture YouTube indisponible · lecture simulée')
    setTracks((list) => {
      const index = latestRef.current.currentIndex
      const current = list[index]
      if (!current?.youtubeId) return list
      return list.map((item, i) =>
        i === index ? { ...item, youtubeId: undefined } : item,
      )
    })
  }, [notify])

  const yt = useYouTubePlayer({
    enabled: youtube && shouldPlayAudio,
    onTick: handleTick,
    onEnded: () => {
      if (latestRef.current.track?.youtubeId) advanceTrack()
    },
    onError: handleError,
    onPlayingChange: (value) => {
      if (latestRef.current.track?.youtubeId) setPlaying(value)
    },
    onPlayBlocked: () => {
      if (latestRef.current.track?.youtubeId) setPlaying(false)
    },
  })

  // The adopter identity may change (backend room created mid-flight); keep
  // it in a ref so a track is only ever adopted by a single request.
  const adoptRef = useRef(adopt)
  useLayoutEffect(() => {
    adoptRef.current = adopt
  })

  useEffect(() => {
    const resolve = adoptRef.current
    if (!youtube || !resolve || !track || track.youtubeId) return
    let cancelled = false
    void resolve(track)
      .then((video) => {
        if (!video || cancelled) return
        setTracks((list) => {
          const index = latestRef.current.currentIndex
          const current = list[index]
          if (!current || current.title !== track.title || current.youtubeId) {
            return list
          }
          return list.map((item, i) =>
            i === index
              ? {
                  ...item,
                  youtubeId: video.youtubeId,
                  duration: video.duration ?? item.duration,
                }
              : item,
          )
        })
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [youtube, track])

  useEffect(() => {
    if (!yt) return
    const videoId = track?.youtubeId
    if (!videoId) {
      lastCuedRef.current = null
      yt.pause()
      return
    }
    if (lastCuedRef.current === videoId) return
    lastCuedRef.current = videoId
    const startAt = latestRef.current.time
    yt.cue(videoId)
    if (startAt > 1) yt.seek(startAt)
    if (playing) yt.play()
  }, [yt, track?.youtubeId, playing])

  useEffect(() => {
    if (!roomSync || roomSync.mode !== 'REMOTE' || !track?.youtubeId || !shouldPlayAudio || !yt) {
      return undefined
    }

    if (!roomSync.isPlaying || roomSync.startAt == null) {
      if (typeof roomSync.pausedAtPosition === 'number') {
        setTime(roomSync.pausedAtPosition)
      }
      setPlaying(false)
      yt.pause()
      return undefined
    }

    const targetPosition = ((Date.now() + roomSync.clockOffset) - roomSync.startAt) / 1000
    const resolvedPosition = Math.max(0, targetPosition)
    setTime(resolvedPosition)
    setPlaying(true)

    if (targetPosition < 0) {
      const delayMs = Math.abs(targetPosition) * 1000
      yt.cue(track.youtubeId)
      const timer = window.setTimeout(() => {
        yt.seek(0, true)
        yt.play()
      }, delayMs)
      return () => window.clearTimeout(timer)
    }

    yt.seek(resolvedPosition, true)
    yt.play()
    return undefined
  }, [roomSync, shouldPlayAudio, track?.youtubeId, yt])

  useEffect(() => {
    if (!roomSync || roomSync.mode !== 'REMOTE' || !track?.youtubeId || !shouldPlayAudio || !yt) {
      return undefined
    }
    if (!roomSync.isPlaying || roomSync.startAt == null) return undefined

    const startAt = roomSync.startAt
    if (startAt == null) return undefined

    const interval = window.setInterval(() => {
      const targetPosition = ((Date.now() + roomSync.clockOffset) - startAt) / 1000
      const currentTime = yt.getCurrentTime()
      if (Math.abs(currentTime - targetPosition) > 1.5) {
        yt.seek(Math.max(0, targetPosition), true)
      }
    }, 5000)

    return () => window.clearInterval(interval)
  }, [roomSync, shouldPlayAudio, track?.youtubeId, yt])

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      const latest = latestRef.current
      if (!latest.track) {
        setPlaying(false)
        return
      }
      if (youtube && latest.track.youtubeId) return
      const nextTime = latest.time + 0.25
      if (nextTime < latest.track.duration) {
        setTime(nextTime)
        return
      }
      advanceTrack()
    }, 250)
    return () => window.clearInterval(id)
  }, [playing, youtube, advanceTrack])

  const togglePlay = useCallback(() => {
    if (!track) return
    if (youtube && track.youtubeId && yt) {
      if (playing) {
        yt.pause()
        setPlaying(false)
      } else {
        yt.play()
        setPlaying(true)
      }
      return
    }
    if (!playing && time >= track.duration) setTime(0)
    setPlaying((value) => !value)
  }, [playing, time, track, youtube, yt])

  const pausePlayback = useCallback(() => {
    setPlaying(false)
    yt?.pause()
  }, [yt])

  const seekTo = useCallback(
    (seconds: number) => {
      if (!track) return
      const clamped = Math.max(0, Math.min(track.duration, seconds))
      if (youtube && track.youtubeId && yt) {
        yt.seek(clamped)
        setTime(clamped)
        return
      }
      setTime(clamped)
    },
    [track, youtube, yt],
  )

  const addTrack = useCallback(
    (input: NewTrack) => {
      // iTunes selections carry the official length; manual entries get the
      // mock filler and must never be reported back as an expected duration.
      const duration = input.duration ?? 180 + Math.floor(Math.random() * 121)
      const gradient = GRADIENTS[tracks.length % GRADIENTS.length]
      const wasEmpty = tracks.length === 0
      setTracks((list) => [
        ...list,
        {
          title: input.title,
          artist: input.artist,
          duration,
          gradient,
          art: input.art,
          official: input.duration !== undefined,
        },
      ])
      setNewIndex(tracks.length)
      if (wasEmpty) {
        setTime(0)
        setPlaying(true)
      }
      notify(`« ${input.title} » ajouté à la file`)
    },
    [tracks.length, notify],
  )

  return {
    tracks,
    track,
    currentIndex,
    upcomingIndex,
    time,
    playing,
    togglePlay,
    pausePlayback,
    skipTrack: advanceTrack,
    seekTo,
    addTrack,
    newIndex,
  }
}
