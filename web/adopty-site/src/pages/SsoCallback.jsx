import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'

/**
 * Page de callback OAuth (Google, etc.)
 * Clerk redirige ici après l'authentification externe.
 * AuthenticateWithRedirectCallback gère automatiquement l'échange de tokens
 * et redirige vers redirectUrlComplete (défini dans authenticateWithRedirect).
 */
const SsoCallback = () => {
  return (
    <div className="min-h-screen bg-[#fbfbe2] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-['Plus_Jakarta_Sans'] font-bold text-primary text-xs uppercase tracking-widest animate-pulse">
          Connexion en cours...
        </p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  )
}

export default SsoCallback
