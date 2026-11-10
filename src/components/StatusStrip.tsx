import type { CSSProperties } from 'react'
import type { Track } from '../data/tracks'

type StatusStripProps = {
  track: Track
  time: number
  upcoming: Track
}

export function StatusStrip({ track, time, upcoming }: StatusStripProps) {
  const minutes = Math.ceil((track.duration - time) / 60)
  const eta = minutes <= 0 ? 'bientôt' : `dans ${minutes} min`

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
    </footer>
  )
}
