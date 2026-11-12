import type { CSSProperties } from 'react'

export type IconName =
  | 'repeat'
  | 'plus'
  | 'list'
  | 'users'
  | 'exit'
  | 'copy'
  | 'home'
  | 'folder'
  | 'chev'
  | 'like'
  | 'dislike'
  | 'logo'

type IconProps = {
  name: IconName
  className?: string
  style?: CSSProperties
}

export function Icon({ name, className, style }: IconProps) {
  return (
    <svg
      className={className === undefined ? 'i' : `i ${className}`}
      style={style}
      aria-hidden="true"
    >
      <use href={`#${name}`} />
    </svg>
  )
}

export function IconSprite() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute' }}
      aria-hidden="true"
    >
      <symbol id="repeat" viewBox="0 0 24 24">
        <path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" />
      </symbol>
      <symbol id="like" viewBox="0 0 24 24">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
      </symbol>
      <symbol id="dislike" viewBox="0 0 24 24">
        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
      </symbol>
      <symbol id="plus" viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14" />
      </symbol>
      <symbol id="list" viewBox="0 0 24 24">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
      </symbol>
      <symbol id="users" viewBox="0 0 24 24">
        <path d="M16 20v-1.500a3.500 3.500 0 0 0-3.500-3.500h-4A3.500 3.500 0 0 0 5 18.500V20M10.500 12a3.500 3.500 0 1 0 0-7 3.500 3.500 0 0 0 0 7M21 20v-1.500a3.500 3.500 0 0 0-2.500-3.300M16 5.200a3.500 3.500 0 0 1 0 6.600" />
      </symbol>
      <symbol id="exit" viewBox="0 0 24 24">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
      </symbol>
      <symbol id="copy" viewBox="0 0 24 24">
        <rect x="9" y="9" width="11" height="11" rx="1" />
        <path d="M5 15V5a1 1 0 0 1 1-1h10" />
      </symbol>
      <symbol id="home" viewBox="0 0 24 24">
        <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />
      </symbol>
      <symbol id="folder" viewBox="0 0 24 24">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </symbol>
      <symbol id="chev" viewBox="0 0 24 24">
        <path d="M6 9l6 6 6-6" />
      </symbol>
      <symbol id="logo" viewBox="0 0 30 24">
        <path
          d="M3 20 5 6M9 21V4M14 19l3-14M21 21V8l3 4 3-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </symbol>
    </svg>
  )
}
