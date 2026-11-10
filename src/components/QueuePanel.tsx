import { Icon } from './Icon'

export function QueuePanel() {
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
      <ul className="ql" id="ql" />
    </div>
  )
}
