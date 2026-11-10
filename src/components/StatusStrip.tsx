import type { CSSProperties } from 'react'
import { Icon } from './Icon'
import type { Track } from '../data/tracks'

type StatusStripProps = {
  track: Track
  time: number
  upcoming: Track
}

export function StatusStrip({ track, time, upcoming }: StatusStripProps) {
  const minutes = Math.ceil((track.duration - time) / 60)
  const eta = minutes <= 0 ? 'bientôt' : `dans ${minutes} min`

  const progress = Math.min(1, time / track.duration) * 100
  const cx = 20 + (140 * progress) / 100
  const phase = time * 3
  const points: string[] = ['M0 22']
  for (let i = 0; i <= 180; i += 2) {
    const u = (i - cx) / 16
    const y = 22 - 17 * Math.exp(-u * u) * Math.sin((i - cx) / 3 + phase)
    points.push(`L${i} ${y.toFixed(1)}`)
  }
  const wavePath = points.join(' ')

  return (
    <footer className="strip">
      <div>
        <h3>Prochaine lecture</h3>
        <div className="nx">
          <span
            className="th"
            style={{ '--g': upcoming.gradient } as CSSProperties}
          />
          <div className="meta">
            <b>{upcoming.title}</b>
            <small>{upcoming.artist}</small>
          </div>
          <time>{eta}</time>
        </div>
      </div>
      <div className="wave" aria-hidden="true">
        <svg viewBox="0 0 180 44" preserveAspectRatio="none">
          <line x1="0" y1="22" x2="180" y2="22" />
          <path d={wavePath} />
        </svg>
        <p>
          <Icon name="logo" style={{ width: 12, height: 12 }} />
          Une playlist construite ensemble.
        </p>
      </div>
      <div>
        <h3>Les participants</h3>
        <div className="av" aria-label="Participants (exemples illustratifs)">
          <span style={{ '--c': '#3b3d40' } as CSSProperties}>AM</span>
          <span style={{ '--c': '#244CFF' } as CSSProperties}>LR</span>
          <span style={{ '--c': '#6a6b6d' } as CSSProperties}>NT</span>
          <span>+1</span>
        </div>
      </div>
    </footer>
  )
}
