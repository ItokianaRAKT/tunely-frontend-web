export type Track = {
  title: string
  artist: string
  duration: number
  gradient: string
  youtubeId?: string
}

export const GRADIENTS = [
  'linear-gradient(135deg,#d8d6cf,#3a3b3d 60%,#111315)',
  'linear-gradient(180deg,#c9cbc8,#7a7d80 50%,#222)',
  'linear-gradient(160deg,#244CFF,#15182a 60%,#B8B9B5)',
  'linear-gradient(135deg,#B8B9B5,#111315)',
  'radial-gradient(circle at 30% 85%,#244CFF 0 26%,transparent 27%),linear-gradient(135deg,#e2e0d8,#555)',
]

export const SEED_TRACKS: Track[] = [
  { title: 'Sweater Weather', artist: 'The Neighbourhood', duration: 240 },
  { title: '505', artist: 'Arctic Monkeys', duration: 253 },
  { title: 'Midnight City', artist: 'M83', duration: 243 },
  { title: 'Do I Wanna Know?', artist: 'Arctic Monkeys', duration: 272 },
  { title: 'Nothing Else Matters', artist: 'Metallica', duration: 388 },
].map((track, index) => ({
  ...track,
  gradient: GRADIENTS[index % GRADIENTS.length],
}))
