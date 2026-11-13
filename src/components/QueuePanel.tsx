import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Icon } from './Icon'
import type { Track } from '../data/tracks'

export type Vote = 'up' | 'down'

type QueuePanelProps = {
  tracks: Track[]
  currentIndex: number
  newIndex: number | null
  votes: Record<string, Vote>
  canAdd?: boolean
  open: boolean
  onToggle: () => void
  onVote: (index: number, vote: Vote) => void
  onAdd: () => void
  onQuit: () => void
}

export function QueuePanel({
  tracks,
  currentIndex,
  newIndex,
  votes,
  canAdd = true,
  open,
  onToggle,
  onVote,
  onAdd,
  onQuit,
}: QueuePanelProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const [voting, setVoting] = useState<number | null>(null)
  const [prevCount, setPrevCount] = useState(tracks.length)
  if (prevCount !== tracks.length) {
    setPrevCount(tracks.length)
    setVoting(null)
  }

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
        <button className="ghost" onClick={onQuit}>
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
        {canAdd && (
          <button className="ghost" onClick={onAdd}>
            <Icon name="plus" style={{ width: 14, height: 14 }} />
            Ajouter
          </button>
        )}
      </div>
      <ul className="ql" id="ql" ref={listRef}>
        {tracks.length === 0 && (
          <li className="qempty">File vide · ajoutez un titre pour commencer</li>
        )}
        {tracks.map((track, index) => (
          <li
            key={index}
            className={index === newIndex ? 'new' : undefined}
          >
            <button
              className="row"
              aria-current={index === currentIndex ? 'true' : undefined}
              aria-expanded={voting === index}
              onClick={() =>
                setVoting((current) => (current === index ? null : index))
              }
            >
              <span
                className="th"
                style={{ '--g': track.gradient } as CSSProperties}
              />
              <span className="meta">
                <b>{track.title}</b>
                <small>{track.artist}</small>
              </span>
              {index === currentIndex && voting !== index && (
                <span className="eq" aria-label="En cours">
                  <s />
                  <s />
                  <s />
                </span>
              )}
            </button>
            {voting === index && (
              <span className="vote">
                <button
                  className="like"
                  aria-label={`Voter pour ${track.title}`}
                  aria-pressed={votes[track.title] === 'up'}
                  onClick={() => onVote(index, 'up')}
                >
                  <Icon name="like" />
                </button>
                <button
                  className="dislike"
                  aria-label={`Voter contre ${track.title}`}
                  aria-pressed={votes[track.title] === 'down'}
                  onClick={() => onVote(index, 'down')}
                >
                  <Icon name="dislike" />
                </button>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
