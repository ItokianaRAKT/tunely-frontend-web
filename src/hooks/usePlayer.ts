import { useCallback, useEffect, useState } from 'react'
import { SEED_TRACKS } from '../data/tracks'

type Notify = (message: string) => void

export function usePlayer(notify: Notify) {
  const [tracks] = useState(SEED_TRACKS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [time, setTime] = useState(102)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)

  const track = tracks[currentIndex]

  const pickNextIndex = useCallback(() => {
    const count = tracks.length
    if (count < 2) return currentIndex
    if (shuffle) {
      let candidate = currentIndex
      while (candidate === currentIndex) {
        candidate = Math.floor(Math.random() * count)
      }
      return candidate
    }
    return (currentIndex + 1) % count
  }, [tracks.length, shuffle, currentIndex])

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
    setTime(0)
    setCurrentIndex(pickNextIndex())
  }, [
    time,
    track.duration,
    currentIndex,
    tracks.length,
    repeat,
    shuffle,
    pickNextIndex,
  ])

  const togglePlay = useCallback(() => {
    if (!playing && time >= track.duration) setTime(0)
    setPlaying((value) => !value)
  }, [playing, time, track.duration])

  const nextTrack = useCallback(() => {
    setTime(0)
    setCurrentIndex(pickNextIndex())
  }, [pickNextIndex])

  const prevTrack = useCallback(() => {
    if (time <= 3) {
      setCurrentIndex((index) => (index - 1 + tracks.length) % tracks.length)
    }
    setTime(0)
  }, [time, tracks.length])

  const toggleShuffle = useCallback(() => {
    const next = !shuffle
    setShuffle(next)
    notify(next ? 'Lecture aléatoire activée' : 'Lecture aléatoire désactivée')
  }, [shuffle, notify])

  const toggleRepeat = useCallback(() => {
    const next = !repeat
    setRepeat(next)
    notify(next ? 'Répétition du titre activée' : 'Répétition désactivée')
  }, [repeat, notify])

  const seekTo = useCallback(
    (seconds: number) => setTime(Math.max(0, Math.min(track.duration, seconds))),
    [track.duration],
  )

  const selectTrack = useCallback(
    (index: number) => {
      if (index !== currentIndex) setTime(0)
      setCurrentIndex(index)
      setPlaying(true)
    },
    [currentIndex],
  )

  return {
    tracks,
    track,
    currentIndex,
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
