import { useCallback, useEffect, useMemo, useState } from 'react'
import { SEED_TRACKS } from '../data/tracks'

type Notify = (message: string) => void

export function usePlayer(notify: Notify) {
  const [tracks] = useState(SEED_TRACKS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [time, setTime] = useState(102)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [shuffleTarget, setShuffleTarget] = useState<number | null>(null)

  const track = tracks[currentIndex]

  const rollShuffleTarget = useCallback(
    (from: number) => {
      const count = tracks.length
      if (count < 2) return from
      let candidate = from
      while (candidate === from) {
        candidate = Math.floor(Math.random() * count)
      }
      return candidate
    },
    [tracks.length],
  )

  const upcomingIndex = useMemo(() => {
    const count = tracks.length
    if (count < 2) return currentIndex
    if (shuffle) return shuffleTarget ?? currentIndex
    return (currentIndex + 1) % count
  }, [tracks.length, shuffle, shuffleTarget, currentIndex])

  const goToTrack = useCallback(
    (index: number) => {
      setCurrentIndex(index)
      setTime(0)
      setShuffleTarget(rollShuffleTarget(index))
    },
    [rollShuffleTarget],
  )

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => setTime((value) => value + 0.25), 250)
    return () => window.clearInterval(id)
  }, [playing])

  useEffect(() => {
    if (time < track.duration) return
    if (repeat) {
      setTime(0)
      return
    }
    if (!shuffle && currentIndex === tracks.length - 1) {
      setTime(track.duration)
      setPlaying(false)
      return
    }
    goToTrack(upcomingIndex)
  }, [
    time,
    track.duration,
    currentIndex,
    tracks.length,
    repeat,
    shuffle,
    upcomingIndex,
    goToTrack,
  ])

  const togglePlay = useCallback(() => {
    if (!playing && time >= track.duration) setTime(0)
    setPlaying((value) => !value)
  }, [playing, time, track.duration])

  const nextTrack = useCallback(
    () => goToTrack(upcomingIndex),
    [goToTrack, upcomingIndex],
  )

  const prevTrack = useCallback(() => {
    if (time > 3) {
      setTime(0)
      return
    }
    goToTrack((currentIndex - 1 + tracks.length) % tracks.length)
  }, [time, currentIndex, tracks.length, goToTrack])

  const toggleShuffle = useCallback(() => {
    const next = !shuffle
    setShuffle(next)
    setShuffleTarget(next ? rollShuffleTarget(currentIndex) : null)
    notify(next ? 'Lecture aléatoire activée' : 'Lecture aléatoire désactivée')
  }, [shuffle, currentIndex, rollShuffleTarget, notify])

  const toggleRepeat = useCallback(() => {
    const next = !repeat
    setRepeat(next)
    notify(next ? 'Répétition du titre activée' : 'Répétition désactivée')
  }, [repeat, notify])

  const seekTo = useCallback(
    (seconds: number) =>
      setTime(Math.max(0, Math.min(track.duration, seconds))),
    [track.duration],
  )

  const selectTrack = useCallback(
    (index: number) => {
      if (index !== currentIndex) goToTrack(index)
      setPlaying(true)
    },
    [currentIndex, goToTrack],
  )

  return {
    tracks,
    track,
    currentIndex,
    upcomingIndex,
    time,
    playing,
    shuffle,
    repeat,
    togglePlay,
    nextTrack,
    prevTrack,
    toggleShuffle,
    toggleRepeat,
    seekTo,
    selectTrack,
  }
}
