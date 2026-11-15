import { useEffect, useRef } from 'react'
import { Icon } from './Icon'
import type { PlaybackMode } from '../context/app-context'

type ModeChoiceDialogProps = {
  open: boolean
  onClose: () => void
  onChoose: (playback: PlaybackMode) => void
}

const OPTIONS: Array<{
  mode: PlaybackMode
  icon: 'broadcast' | 'speaker'
  label: string
  hint: string
}> = [
  {
    mode: 'remote',
    icon: 'broadcast',
    label: 'Remote',
    hint: 'Chaque téléphone joue la musique en temps réel',
  },
  {
    mode: 'in-person',
    icon: 'speaker',
    label: 'Présentiel',
    hint: 'Un seul téléphone joue ; l’hôte peut déléguer la lecture',
  },
]

export function ModeChoiceDialog({ open, onClose, onChoose }: ModeChoiceDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog ref={dialogRef} onClose={onClose}>
      <div className="mode-pick">
        <h4>Créer une Room</h4>
        <p>Comment la musique doit-elle se lancer ?</p>
        <div className="mode-cards">
          {OPTIONS.map((option) => (
            <button
              key={option.mode}
              type="button"
              className="mode-card"
              onClick={() => onChoose(option.mode)}
            >
              <Icon name={option.icon} />
              <b>{option.label}</b>
              <small>{option.hint}</small>
            </button>
          ))}
        </div>
        <div className="acts">
          <button type="button" className="btn" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </dialog>
  )
}
