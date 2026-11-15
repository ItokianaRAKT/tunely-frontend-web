import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      <AppProvider>
        <App />
      </AppProvider>
    </ClerkProvider>
  </StrictMode>,
)
