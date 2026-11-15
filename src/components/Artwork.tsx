type ArtworkProps = {
  src?: string
  className?: string
}

/**
 * Square album artwork. Renders nothing when there is no artwork, and hides
 * itself when the image cannot be loaded, so the gradient or scenery behind
 * it stays visible instead of a broken image.
 *
 * The key forces a fresh element when the URL changes: an image that failed
 * before stays hidden for the same URL, but a new one gets a clean start.
 */
export function Artwork({ src, className }: ArtworkProps) {
  if (!src) return null
  return (
    <img
      key={src}
      className={className}
      src={src}
      alt=""
      onError={(event) => {
        event.currentTarget.style.display = 'none'
      }}
    />
  )
}
