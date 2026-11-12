import { useRef } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { Icon } from './Icon'
import type { Track } from '../data/tracks'

type StageProps = {
  track: Track
  index: number
  time: number
  repeat: boolean
  onTogglePlay: () => void
  onToggleRepeat: () => void
  onSeek: (seconds: number) => void
}

function formatTime(seconds: number) {
  const total = Math.floor(seconds)
  return `${Math.floor(total / 60)}:${`0${total % 60}`.slice(-2)}`
}

export function Stage({
  track,
  index,
  time,
  repeat,
  onTogglePlay,
  onToggleRepeat,
  onSeek,
}: StageProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const progress = Math.min(1, time / track.duration) * 100

  const seekFromPointer = (clientX: number) => {
    const rect = barRef.current?.getBoundingClientRect()
    if (!rect) return
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    onSeek(ratio * track.duration)
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    seekFromPointer(event.clientX)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      seekFromPointer(event.clientX)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const deltas: Record<string, number> = {
      ArrowRight: 5,
      ArrowLeft: -5,
      ArrowUp: 5,
      ArrowDown: -5,
    }
    const delta = deltas[event.key]
    if (delta === undefined) return
    event.preventDefault()
    onSeek(Math.max(0, Math.min(track.duration, time + delta)))
  }

  return (
    <section className="stage" aria-label="En cours de lecture">
      <svg
        className="art"
        viewBox="0 0 800 520"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        style={{ transform: `translateX(${-(index % 5) * 14}px) scale(1.08)` }}
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d4d2cb" />
            <stop offset="0.5" stopColor="#4a4b4d" />
            <stop offset="1" stopColor="#111315" />
          </linearGradient>
          <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e2e0d8" />
            <stop offset="1" stopColor="#7d7e7f" />
          </linearGradient>
          <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#244CFF" stopOpacity="0.5" />
            <stop offset="1" stopColor="#244CFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="800" height="520" fill="url(#sky)" />
        <polygon
          points="0,0 380,0 250,70 0,150"
          fill="#cfcdc6"
          opacity="0.75"
        />
        <polygon points="230,110 520,190 600,40 560,0 330,0" fill="url(#wall)" />
        <polygon points="330,0 560,0 520,190 230,110" fill="#b9b7b0" opacity="0.55" />
        <polygon points="230,110 520,190 520,310 300,260" fill="#26272a" />
        <polygon points="520,190 600,40 800,130 800,330 520,310" fill="#0c0d0f" />
        <g stroke="#f2f0e9" strokeOpacity="0.28" fill="none">
          <path d="M400 380 800 330M380 420 800 360M360 460 800 390M340 500 800 420" />
          <path d="M430 90 800 330" strokeOpacity="0.8" />
        </g>
        <path d="M0 520V360a110 110 0 0 1 220 0v160z" fill="#0c0d0f" opacity="0.55" />
        <path d="M40 520V380a70 70 0 0 1 140 0v140z" fill="url(#beam)" />
      </svg>
      <svg className="spark i" viewBox="0 0 46 96" aria-hidden="true">
        <path
          d="M23 0Q25 40 46 48Q25 56 23 96Q21 56 0 48Q21 40 23 0Z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
      <div className="kick">
        <i />
        EN COURS
      </div>
      <h1>{track.artist}</h1>
      <h2>{track.title}</h2>
      <div
        className="bar"
        ref={barRef}
        role="slider"
        tabIndex={0}
        aria-label="Progression"
        aria-valuemin={0}
        aria-valuemax={track.duration}
        aria-valuenow={Math.floor(time)}
        aria-valuetext={`${formatTime(time)} sur ${formatTime(track.duration)}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onKeyDown={handleKeyDown}
      >
        <div className="tr" />
        <div className="fl" style={{ width: `${progress}%` }} />
        <div className="kn" style={{ left: `${progress}%` }} />
      </div>
      <div className="times">
        <span>{formatTime(time)}</span>
        <span>{formatTime(track.duration)}</span>
      </div>
      <div className="ctl">
        <button
          className="pp"
          aria-label="Lecture / pause"
          onClick={onTogglePlay}
        >
          <svg className="ps" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
          <svg className="pl" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
        <button
          aria-pressed={repeat}
          aria-label="Répéter"
          onClick={onToggleRepeat}
        >
          <Icon name="repeat" />
        </button>
      </div>
    </section>
  )
}
