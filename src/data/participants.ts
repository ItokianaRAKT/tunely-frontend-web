export type Participant = {
  id: string
  name: string
  initials: string
  color: string
}

export const SEED_PARTICIPANTS: Participant[] = [
  { id: 'am', name: 'Amara M.', initials: 'AM', color: '#3b3d40' },
  { id: 'lr', name: 'Léo R.', initials: 'LR', color: '#244cff' },
  { id: 'nt', name: 'Nour T.', initials: 'NT', color: '#6a6b6d' },
  { id: 'sd', name: 'Sacha D.', initials: 'SD', color: '#8a8b8d' },
]

export const YOU_ID = 'lr'
