import type { CSSProperties } from 'react'
import { Icon } from './Icon'
import type { Track } from '../data/tracks'

type QueuePanelProps = {
  tracks: Track[]
  currentIndex: number
}

export function QueuePanel({ tracks, currentIndex }: QueuePanelProps) {
  return (
    <div className="right qopen">
      <div className="who">
        <span>
          <Icon name="users" />
          4 participants
        </span>
        <button className="ghost">
          <Icon name="exit" />
          Quitter la Room
        </button>
      </div>
      <div className="qh">
        <button className="qt">
          <Icon name="list" />
          File d’attente
        </button>
        <button className="ghost">
          <Icon name="plus" style={{ width: 14, height: 14 }} />
          Ajouter
        </button>
      </div>
      <ul className="ql" id="ql">
        {tracks.map((track, index) => (
          <li key={index}>
            <button
              className="row"
              aria-current={index === currentIndex ? 'true' : undefined}
            >
              <span
                className="th"
                style={{ '--g': track.gradient } as CSSProperties}
              />
              <span className="meta">
                <b>{track.title}</b>
                <small>{track.artist}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
