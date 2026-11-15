import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.tsx'
import { AppProvider } from './context/AppContext'

const publishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined

if (!publishableKey) {
  throw new Error(
    'Missing VITE_CLERK_PUBLISHABLE_KEY. Copy .env.example to .env.local and set it.',
  )
}

const clerkAppearance = {
  elements: {
    card: {
      background: '#121619',
      border: '1px solid rgba(148, 163, 184, 0.28)',
      boxShadow: '0 20px 48px rgba(2, 6, 23, 0.48)',
      borderRadius: '16px',
    },
  },
}

const clerkLocalization = {
  signIn: {
    start: {
      title: 'Tunely',
      subtitle: 'The Listening Space',
    },
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={clerkAppearance}
      localization={clerkLocalization}
    >
      <AppProvider>
        <App />
      </AppProvider>
    </ClerkProvider>
  </StrictMode>,
)
