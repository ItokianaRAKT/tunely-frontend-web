import { useCallback, useState } from 'react'
import { SEED_TRACKS } from '../data/tracks'

export function usePlayer() {
  const [tracks] = useState(SEED_TRACKS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [time] = useState(102)

  const track = tracks[currentIndex]

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
