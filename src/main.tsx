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
  baseTheme: undefined,
  elements: {
    cardBox: {
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      overflow: 'hidden',
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '0px',
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
