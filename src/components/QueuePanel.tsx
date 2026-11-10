import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { Icon } from './Icon'
import type { Track } from '../data/tracks'

type QueuePanelProps = {
  tracks: Track[]
  currentIndex: number
  newIndex: number | null
  open: boolean
  onToggle: () => void
  onPick: (index: number) => void
  onAdd: () => void
}

export function QueuePanel({
  tracks,
  currentIndex,
  newIndex,
  open,
  onToggle,
  onPick,
  onAdd,
}: QueuePanelProps) {
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (newIndex === null) return
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [newIndex])

  return (
    <div className={open ? 'right qopen' : 'right'}>
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
        <button
          className="qt"
          aria-expanded={open}
          aria-controls="ql"
          onClick={onToggle}
        >
          <Icon name="list" />
          File d’attente
          <span className="chev">
            <Icon name="chev" />
          </span>
        </button>
        <button className="ghost" onClick={onAdd}>
          <Icon name="plus" style={{ width: 14, height: 14 }} />
          Ajouter
        </button>
      </div>
      <ul className="ql" id="ql" ref={listRef}>
        {tracks.map((track, index) => (
          <li
            key={index}
            className={index === newIndex ? 'new' : undefined}
          >
            <button
              className="row"
              aria-current={index === currentIndex ? 'true' : undefined}
              onClick={() => onPick(index)}
            >
              <span
                className="th"
                style={{ '--g': track.gradient } as CSSProperties}
              />
              <span className="meta">
                <b>{track.title}</b>
                <small>{track.artist}</small>
              </span>
              {index === currentIndex && (
                <span className="eq" aria-label="En cours">
                  <s />
                  <s />
                  <s />
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
