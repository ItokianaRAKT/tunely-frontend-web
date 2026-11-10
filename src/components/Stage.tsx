import type { Track } from '../data/tracks'

type StageProps = {
  track: Track
  index: number
}

export function Stage({ track, index }: StageProps) {
  return (
    <section className="stage" aria-label="En cours de lecture">
      <svg
        className="art"
        viewBox="0 0 800 520"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        style={{ transform: `translateX(${-(index % 5) * 14}px) scale(1.08)` }}
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d4d2cb" />
            <stop offset="0.5" stopColor="#4a4b4d" />
            <stop offset="1" stopColor="#111315" />
          </linearGradient>
          <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e2e0d8" />
            <stop offset="1" stopColor="#7d7e7f" />
          </linearGradient>
          <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#244CFF" stopOpacity="0.5" />
            <stop offset="1" stopColor="#244CFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="800" height="520" fill="url(#sky)" />
        <polygon
          points="0,0 380,0 250,70 0,150"
          fill="#cfcdc6"
          opacity="0.75"
        />
        <polygon points="230,110 520,190 600,40 560,0 330,0" fill="url(#wall)" />
        <polygon points="330,0 560,0 520,190 230,110" fill="#b9b7b0" opacity="0.55" />
        <polygon points="230,110 520,190 520,310 300,260" fill="#26272a" />
        <polygon points="520,190 600,40 800,130 800,330 520,310" fill="#0c0d0f" />
        <g stroke="#f2f0e9" strokeOpacity="0.28" fill="none">
          <path d="M400 380 800 330M380 420 800 360M360 460 800 390M340 500 800 420" />
          <path d="M430 90 800 330" strokeOpacity="0.8" />
        </g>
        <path d="M0 520V360a110 110 0 0 1 220 0v160z" fill="#0c0d0f" opacity="0.55" />
        <path d="M40 520V380a70 70 0 0 1 140 0v140z" fill="url(#beam)" />
      </svg>
      <svg className="spark i" viewBox="0 0 46 96" aria-hidden="true">
        <path
          d="M23 0Q25 40 46 48Q25 56 23 96Q21 56 0 48Q21 40 23 0Z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
      <div className="kick">
        <i />
        EN COURS
      </div>
      <h1>{track.artist}</h1>
      <h2>{track.title}</h2>
    </section>
  )
}
