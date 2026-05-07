import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { CartProvider } from './context/CartContext'
import { NotificationProvider } from './context/NotificationContext'
import AuthTokenBridge from './components/AuthTokenBridge'
import App from './App.jsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const root = ReactDOM.createRoot(document.getElementById('root'))

if (!PUBLISHABLE_KEY) {
  // Affiche un écran d'erreur spécifique au lieu de faire planter complètement l'app avec Clerk
  root.render(
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center', backgroundColor: '#fef2f2', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: '#991b1b', fontSize: '2rem', marginBottom: '1rem' }}>Clé Clerk Manquante !</h1>
      <p style={{ color: '#7f1d1d', maxWidth: '600px', lineHeight: '1.5' }}>
        L'application utilise <strong>Clerk</strong> pour l'authentification.<br/>
        Veuillez ajouter votre clé publique dans le fichier <code>.env</code> à la racine du projet :
      </p>
      <pre style={{ background: '#000', color: '#fff', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
VITE_CLERK_PUBLISHABLE_KEY=pk_test_votre_cle_ici
      </pre>
      <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>Une fois ajoutée, redémarrez le serveur (npm run dev).</p>
    </div>
  )
} else {
  root.render(
    <React.StrictMode>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        afterSignOutUrl="/"
      >
        <AuthTokenBridge />
        <BrowserRouter>
          <NotificationProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </NotificationProvider>
        </BrowserRouter>
      </ClerkProvider>
    </React.StrictMode>
  )
}
