import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { GRADIENTS } from '../data/tracks'
import type { Track } from '../data/tracks'

type Notify = (message: string) => void

function initialTime(tracks: Track[]) {
  return tracks.length > 0 ? 102 : 0
}

export function usePlayer(notify: Notify, initialTracks: Track[]) {
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
    if (!playing) return
    const id = window.setInterval(() => {
      const latest = latestRef.current
      if (!latest.track) {
        setPlaying(false)
        return
      }
      const nextTime = latest.time + 0.25
      if (nextTime < latest.track.duration) {
        setTime(nextTime)
        return
      }
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
    }, 250)
    return () => window.clearInterval(id)
  }, [playing])

  const togglePlay = useCallback(() => {
    if (!track) return
    if (!playing && time >= track.duration) setTime(0)
    setPlaying((value) => !value)
  }, [playing, time, track])

  const pausePlayback = useCallback(() => setPlaying(false), [])

  const seekTo = useCallback(
    (seconds: number) => {
      if (!track) return
      setTime(Math.max(0, Math.min(track.duration, seconds)))
    },
    [track],
  )

  const addTrack = useCallback(
    (title: string, artist: string) => {
      const duration = 180 + Math.floor(Math.random() * 121)
      const gradient = GRADIENTS[tracks.length % GRADIENTS.length]
      const wasEmpty = tracks.length === 0
      setTracks((list) => [...list, { title, artist, duration, gradient }])
      setNewIndex(tracks.length)
      if (wasEmpty) {
        setTime(0)
        setPlaying(true)
      }
      notify(`« ${title} » ajouté à la file`)
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
    seekTo,
    addTrack,
    newIndex,
  }
}
