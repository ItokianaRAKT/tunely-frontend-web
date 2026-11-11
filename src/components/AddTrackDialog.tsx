import { useEffect, useRef } from 'react'

type AddTrackDialogProps = {
  open: boolean
  onClose: () => void
  onAdd: (title: string, artist: string) => void
}

export function AddTrackDialog({ open, onClose, onAdd }: AddTrackDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const artistRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      formRef.current?.reset()
      if (!dialog.open) dialog.showModal()
      titleRef.current?.focus()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open])

  const handleSubmit = () => {
    const title = titleRef.current?.value.trim()
    const artist = artistRef.current?.value.trim()
    if (!title || !artist) return
    onAdd(title, artist)
  }

  return (
    <dialog ref={dialogRef} onClose={onClose}>
      <form method="dialog" ref={formRef} onSubmit={handleSubmit}>
        <h4>Ajouter un titre</h4>
        <label>
          Titre
          <input ref={titleRef} required maxLength={48} autoComplete="off" />
        </label>
        <label>
          Artiste
          <input ref={artistRef} required maxLength={40} autoComplete="off" />
        </label>
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
