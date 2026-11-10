import { Icon } from './Icon'

export function Sidebar() {
  return (
    <aside className="side">
      <div className="wm">TUNELY.</div>
      <div className="room">
        <Icon name="logo" className="mk" style={{ width: 24, height: 20 }} />
        <div>
          <b>Ma Room</b>
          <button className="code" aria-label="Copier le code de la Room">
            <span>#7F3Q</span>
            <Icon name="copy" />
          </button>
        </div>
      </div>
      <nav aria-label="Navigation">
        <button aria-current="true">
          <Icon name="home" />
          Accueil
        </button>
        <button>
          <Icon name="folder" />
          Mes Rooms
        </button>
        <button>
          <Icon name="plus" />
          Créer une Room
        </button>
      </nav>
      <div className="sart" aria-hidden="true">
        <svg viewBox="0 0 184 170" preserveAspectRatio="xMidYMax slice">
          <defs>
            <linearGradient id="sb" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#6b6c6e" />
              <stop offset="1" stopColor="#cfcdc6" />
            </linearGradient>
            <linearGradient id="pb" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#244CFF" />
              <stop offset="1" stopColor="#0c1a66" />
            </linearGradient>
          </defs>
          <polygon points="0,10 120,40 184,0 184,170 0,170" fill="url(#sb)" />
          <polygon points="0,10 70,28 0,60" fill="#dedcd4" />
          <path d="M40 170V95a40 40 0 0 1 80 0v75z" fill="#0e1012" />
          <path d="M62 170V102a24 24 0 0 1 48 0v68z" fill="url(#pb)" />
          <polygon
            points="120,40 184,0 184,170 150,170"
            fill="#111315"
            opacity="0.6"
          />
        </svg>
      </div>
      <div className="sbrand">
        Different people.
        <br />
        One frequency.
      </div>
    </aside>
  )
}
