/**
 * useCurrentUser.js
 * Récupère et transforme le profil backend de l'utilisateur connecté.
 * La logique de mappage (ex-utilisateurMapper) est inline ici.
 */

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { getUtilisateurByClerkId } from '../services/authApi'

// ── Helpers (ex-utilisateurMapper) ───────────────────────────────────────────
const toStr = (v) => {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

/**
 * Transforme la réponse brute du backend en objet utilisateur normalisé.
 * Accepte { utilisateur: {...} } ou directement l'objet.
 */
const mapUtilisateur = (raw) => {
  if (!raw) return null
  const user = raw?.utilisateur ?? raw
  return {
    id:        user?.Id          ?? user?.id          ?? null,
    clerkId:   user?.clerkId                          ?? null,
    prenom:    toStr(user?.Prenom) ?? toStr(user?.prenom) ?? null,
    nom:       toStr(user?.Nom)    ?? toStr(user?.nom)    ?? null,
    email:     toStr(user?.AddresseEmail) ?? toStr(user?.email) ?? null,
    adresse:   toStr(user?.Addresse) ?? toStr(user?.adresse)   ?? null,
    wilaya:    toStr(user?.Wilaya) ?? toStr(user?.wilaya)     ?? null,
    telephone: toStr(user?.Wilaya) ?? toStr(user?.telephone)   ?? null,
    photo:     user?.Photo ?? user?.photo ?? null,
    creeLe:    user?.CreeLe ?? null,
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Récupère le profil backend de l'utilisateur actuellement connecté.
 *
 * @returns {{ user: object|null, isLoading: boolean, error: string|null }}
 */
export const useCurrentUser = () => {
  const [user,      setUser]      = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState(null)

  const { userId, isSignedIn } = useAuth()

  useEffect(() => {
    if (!isSignedIn || !userId) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const raw    = await getUtilisateurByClerkId(userId)
        const mapped = mapUtilisateur(raw)
        if (!cancelled) setUser(mapped)
      } catch (err) {
        if (!cancelled) setError(err?.message ?? 'Erreur lors du chargement du profil')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [isSignedIn, userId])

  return { user, isLoading, error }
}
