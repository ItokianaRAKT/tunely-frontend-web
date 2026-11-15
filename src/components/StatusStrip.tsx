import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Icon } from './Icon'
import { Artwork } from './Artwork'
import type { Track } from '../data/tracks'
import type { Participant } from '../data/participants'
import type { PlaybackMode } from '../context/app-context'

type StatusStripProps = {
  track?: Track
  time: number
  upcoming?: Track
  participants: Participant[]
  hostId: string
  playback: PlaybackMode
  speakerId: string
  viewerId: string
  canNameHost: boolean
  onNameHost: (id: string) => void
  onDelegate: (id: string) => void
}

export function StatusStrip({
  track,
  time,
  upcoming,
  participants,
  hostId,
  playback,
  speakerId,
  viewerId,
  canNameHost,
  onNameHost,
  onDelegate,
}: StatusStripProps) {
  const [listOpen, setListOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!listOpen) return
    const closeOnOutside = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setListOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutside)
    return () => document.removeEventListener('pointerdown', closeOnOutside)
  }, [listOpen])

  const minutes = track ? Math.ceil((track.duration - time) / 60) : 0
  const eta = !track
    ? ''
    : minutes <= 0
      ? 'bientôt'
      : `dans ${minutes} min`

  const progress = track ? Math.min(1, time / track.duration) * 100 : 0
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
          {upcoming ? (
            <>
              <span
                className="th"
                style={{ '--g': upcoming.gradient } as CSSProperties}
              >
                <Artwork src={upcoming.art} />
              </span>
              <div className="meta">
                <b>{upcoming.title}</b>
                <small>{upcoming.artist}</small>
              </div>
              <time>{eta}</time>
            </>
          ) : (
            <div className="meta">
              <b>{track ? 'Dernier titre' : 'File vide'}</b>
              <small>
                {track
                  ? 'Aucune suite dans la file'
                  : 'Ajoutez un titre pour compléter la playlist'}
              </small>
            </div>
          )}
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
      <div className="ppl" ref={wrapRef}>
        <h3>Les participants</h3>
        <button
          className="av"
          aria-expanded={listOpen}
          aria-controls="plist"
          aria-label="Voir la liste des participants"
          onClick={() => setListOpen((value) => !value)}
        >
          {participants.slice(0, 3).map((person) => (
            <span
              key={person.id}
              style={{ '--c': person.color } as CSSProperties}
            >
              {person.initials}
            </span>
          ))}
          {participants.length > 3 && (
            <span className="more">+{participants.length - 3}</span>
          )}
        </button>
          <ul className="plist" id="plist" hidden={!listOpen}>
            {participants.map((person) => {
              const isViewerHost = hostId === viewerId
              const viewerHoldsLecture = speakerId === viewerId
              const inPerson = playback === 'in-person'
              const reclaim =
                inPerson && isViewerHost && speakerId !== hostId && person.id === hostId
              const handBack =
                inPerson && viewerHoldsLecture && !isViewerHost && person.id === viewerId
              const give =
                inPerson &&
                isViewerHost &&
                person.id !== speakerId &&
                person.id !== hostId
              const nominate = person.id !== hostId && canNameHost
              return (
                <li key={person.id}>
                  <span
                    className="pi"
                    style={{ '--c': person.color } as CSSProperties}
                  >
                    {person.initials}
                  </span>
                  <span className="pn">
                    <b>{person.name}</b>
                    {person.id === viewerId && <small>vous</small>}
                  </span>
                  {person.id === hostId && <span className="pbadge">Hôte</span>}
                  {inPerson && person.id === speakerId && (
                    <span className="pbadge lecture">Lecture</span>
                  )}
                  {(reclaim || handBack || give || nominate) && (
                    <span className="pacts">
                      {reclaim && (
                        <button
                          className="nominate"
                          onClick={() => onDelegate(person.id)}
                        >
                          Reprendre la lecture
                        </button>
                      )}
                      {handBack && (
                        <button
                          className="nominate"
                          onClick={() => onDelegate(hostId)}
                        >
                          Rendre la lecture
                        </button>
                      )}
                      {give && (
                        <button
                          className="nominate"
                          onClick={() => onDelegate(person.id)}
                        >
                          Donner la lecture
                        </button>
                      )}
                      {nominate && (
                        <button
                          className="nominate"
                          onClick={() => onNameHost(person.id)}
                        >
                          Nommer hôte
                        </button>
                      )}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
      </div>
    </footer>
  )
}
