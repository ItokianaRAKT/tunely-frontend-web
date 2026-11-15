import { useEffect, useRef, useState } from 'react'
import { searchITunes } from '../api/itunes'
import type { ITunesTrack } from '../api/itunes'
import type { NewTrack } from '../data/tracks'

type AddTrackDialogProps = {
  open: boolean
  onClose: () => void
  onAdd: (track: NewTrack) => void
}

type SearchPhase = 'idle' | 'searching' | 'empty' | 'error'

const SEARCH_DELAY_MS = 350

function formatTime(seconds: number) {
  const total = Math.floor(seconds)
  return `${Math.floor(total / 60)}:${`0${total % 60}`.slice(-2)}`
}

export function AddTrackDialog({ open, onClose, onAdd }: AddTrackDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [results, setResults] = useState<ITunesTrack[]>([])
  const [picked, setPicked] = useState<ITunesTrack | null>(null)
  const [phase, setPhase] = useState<SearchPhase>('idle')

  // Clear the previous search when the dialog opens again.
  const [prevOpen, setPrevOpen] = useState(open)
  if (prevOpen !== open) {
    setPrevOpen(open)
    if (open) {
      setTitle('')
      setArtist('')
      setResults([])
      setPicked(null)
      setPhase('idle')
    }
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (!dialog.open) dialog.showModal()
      titleRef.current?.focus()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open])

  // Debounced iTunes lookup: typing in the title field searches for the
  // official release, a picked result fills the fields with its exact
  // values, and any manual edit drops the selection again.
  useEffect(() => {
    if (!open) return
    const term = title.trim()
    if (picked && term === picked.title && artist.trim() === picked.artist) return
    if (term.length < 2) return

    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setPhase('searching')
      searchITunes(term, controller.signal)
        .then((list) => {
          if (controller.signal.aborted) return
          setResults(list)
          setPhase(list.length > 0 ? 'idle' : 'empty')
        })
        .catch(() => {
          if (controller.signal.aborted) return
          setResults([])
          setPhase('error')
        })
    }, SEARCH_DELAY_MS)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [open, title, artist, picked])

  const pick = (track: ITunesTrack) => {
    setPicked(track)
    setTitle(track.title)
    setArtist(track.artist)
  }

  const handleSubmit = () => {
    const cleanTitle = title.trim()
    const cleanArtist = artist.trim()
    if (!cleanTitle || !cleanArtist) return
    const exact = picked && picked.title === cleanTitle && picked.artist === cleanArtist
    onAdd({
      title: cleanTitle,
      artist: cleanArtist,
      duration: exact ? picked.duration : undefined,
      art: exact ? picked.art : undefined,
    })
  }

  const hint =
    results.length === 0 && phase === 'searching'
      ? 'Recherche iTunes…'
      : phase === 'empty'
        ? 'Aucun résultat · saisissez le titre et l’artiste'
        : phase === 'error'
          ? 'Recherche iTunes indisponible · saisie manuelle'
          : null

  return (
    <dialog ref={dialogRef} onClose={onClose}>
      <form method="dialog" onSubmit={handleSubmit}>
        <h4>Ajouter un titre</h4>
        <label>
          Titre
          <input
            ref={titleRef}
            required
            maxLength={96}
            autoComplete="off"
            placeholder="Rechercher un titre (iTunes)"
            value={title}
            onChange={(event) => {
              const value = event.target.value
              setPicked(null)
              setTitle(value)
              if (value.trim().length < 2) {
                setResults([])
                setPhase('idle')
              }
            }}
          />
        </label>
        <label>
          Artiste
          <input
            required
            maxLength={64}
            autoComplete="off"
            value={artist}
            onChange={(event) => {
              setPicked(null)
              setArtist(event.target.value)
            }}
          />
        </label>
        <div className="srch" aria-live="polite">
          {hint && <p className="hint">{hint}</p>}
          {results.length > 0 && (
            <ul className="results" aria-label="Résultats iTunes">
              {results.map((track) => (
                <li key={track.id}>
                  <button
                    type="button"
                    className={picked?.id === track.id ? 'res on' : 'res'}
                    aria-pressed={picked?.id === track.id}
                    onClick={() => pick(track)}
                  >
                    {track.art && <img src={track.art} alt="" />}
                    <span className="meta">
                      <b>{track.title}</b>
                      <small>{track.artist}</small>
                    </span>
                    <span className="dur">{formatTime(track.duration)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="acts">
          <button type="button" className="btn" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="btn p">
            Ajouter à la file
          </button>
        </div>
      </form>
    </dialog>
  )
}
