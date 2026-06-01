import { useEffect } from 'react'
import { AuthenticateWithRedirectCallback, useUser } from '@clerk/clerk-react'

/**
 * Page de callback OAuth (Google, etc.)
 * Après que Clerk valide le token Google, on met à jour les unsafeMetadata
 * avec les infos remplies dans le formulaire d'inscription (stockées dans localStorage).
 */
const SsoCallbackInner = () => {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (!isLoaded || !user) return

    const raw = localStorage.getItem('adopty_signup_meta')
    if (!raw) return

    try {
      const meta = JSON.parse(raw)
      // Mettre à jour les unsafeMetadata Clerk — Inngest les lira dans le webhook user.created
      user.update({
        firstName: meta.prenom || user.firstName,
        lastName: meta.nom || user.lastName,
        unsafeMetadata: meta,
      }).catch(console.error)
      localStorage.removeItem('adopty_signup_meta')
    } catch (e) {
      console.error('[SsoCallback] Erreur lecture localStorage:', e)
    }
  }, [isLoaded, user])

  return null
}

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
      <SsoCallbackInner />
    </div>
  )
}

export default SsoCallback
