import type { CSSProperties } from 'react'

export type IconName =
  | 'shuffle'
  | 'prev'
  | 'next'
  | 'repeat'
  | 'plus'
  | 'list'
  | 'users'
  | 'exit'
  | 'copy'
  | 'home'
  | 'folder'
  | 'chev'
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
      <symbol id="shuffle" viewBox="0 0 24 24">
        <path d="M3 7h3.500c3 0 4.500 2 6 5s3 5 6 5H21M3 17h3.500c1.500 0 2.600-.500 3.600-1.500M14 8c1-1 2-1.500 3.500-1.500H21M18.500 3.500 21 6.500l-2.500 3M18.500 14.500 21 17.500l-2.500 3" />
      </symbol>
      <symbol id="prev" viewBox="0 0 24 24">
        <path d="M6 5v14" />
        <path d="M19 6v12L9 12z" />
      </symbol>
      <symbol id="next" viewBox="0 0 24 24">
        <path d="M18 5v14" />
        <path d="M5 6v12l10-6z" />
      </symbol>
      <symbol id="repeat" viewBox="0 0 24 24">
        <path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" />
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
