import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Icon } from './Icon'
import { Artwork } from './Artwork'

export type Vote = 'up' | 'down'

type QueueTrackLike = {
  id: string
  title: string
  artist: string
  duration?: number
  art?: string
  gradient?: string
  votes?: number
}

type QueuePanelProps = {
  tracks: QueueTrackLike[]
  currentIndex: number
  newIndex: number | null
  votes: Record<string, Vote>
  skipVotes?: { count: number; required: number } | null
  participantCount: number
  canAdd?: boolean
  canRemove?: boolean
  open: boolean
  onToggle: () => void
  onVote: (trackId: string, vote: Vote) => void
  onVoteSkip: () => void
  onAdd: () => void
  onRemove?: (trackId: string) => void
  onQuit: () => void
}

export function QueuePanel({
  tracks,
  currentIndex,
  newIndex,
  votes,
  skipVotes = null,
  participantCount,
  canAdd = true,
  canRemove = false,
  open,
  onToggle,
  onVote,
  onVoteSkip,
  onAdd,
  onRemove,
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
          {participantCount} participant{participantCount > 1 ? 's' : ''}
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
      {skipVotes && (
        <div className="skipbar">
          <button className="ghost" onClick={onVoteSkip}>
            <Icon name="skip" />
            Passer
          </button>
          <span>
            {skipVotes.count}/{skipVotes.required}
          </span>
        </div>
      )}
      <ul className="ql" id="ql" ref={listRef}>
        {tracks.length === 0 && (
          <li className="qempty">File vide · ajoutez un titre pour commencer</li>
        )}
        {tracks.map((track, index) => (
          <li
            key={track.id}
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
                style={{ '--g': track.gradient ?? 'linear-gradient(135deg,#d8d6cf,#3a3b3d 60%,#111315)' } as CSSProperties}
              >
                <Artwork src={track.art} />
              </span>
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
                  aria-pressed={votes[track.id] === 'up'}
                  onClick={() => onVote(track.id, 'up')}
                >
                  <Icon name="like" />
                </button>
                <button
                  className="dislike"
                  aria-label={`Voter contre ${track.title}`}
                  aria-pressed={votes[track.id] === 'down'}
                  onClick={() => onVote(track.id, 'down')}
                >
                  <Icon name="dislike" />
                </button>
                {canRemove && onRemove && index !== currentIndex && (
                  <button
                    className="rm"
                    aria-label={`Retirer ${track.title} de la file`}
                    onClick={() => onRemove(track.id)}
                  >
                    <Icon name="trash" />
                  </button>
                )}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
