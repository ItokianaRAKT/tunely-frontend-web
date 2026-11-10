import { useCallback, useEffect, useState } from 'react'
import { SEED_TRACKS } from '../data/tracks'

export function usePlayer() {
  const [tracks] = useState(SEED_TRACKS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [time, setTime] = useState(102)

  const track = tracks[currentIndex]

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => setTime((value) => value + 0.25), 250)
    return () => window.clearInterval(id)
  }, [playing])

  useEffect(() => {
    if (time < track.duration) return
    if (currentIndex === tracks.length - 1) {
      setTime(track.duration)
      setPlaying(false)
    } else {
      setTime(0)
      setCurrentIndex((index) => (index + 1) % tracks.length)
    }
  }, [time, track.duration, currentIndex, tracks.length])

  const togglePlay = useCallback(() => setPlaying((value) => !value), [])

  const nextTrack = useCallback(
    () => setCurrentIndex((index) => (index + 1) % tracks.length),
    [tracks.length],
  )

  const prevTrack = useCallback(
    () =>
      setCurrentIndex((index) => (index - 1 + tracks.length) % tracks.length),
    [tracks.length],
  )

  return {
    tracks,
    track,
    currentIndex,
    time,
    playing,
    togglePlay,
    nextTrack,
    prevTrack,
  }
}
