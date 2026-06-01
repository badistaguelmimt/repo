import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { getCurrentUtilisateur } from '../services/authApi'

export const ROLE_KEYS = {
  VISITEUR: 'visiteur',
  UTILISATEUR: 'utilisateur',
  PRESTATAIRE: 'prestataire',
  REFUGE: 'refuge',
  ADMIN: 'admin',
}

const ROLE_PRIORITY = [
  ROLE_KEYS.ADMIN,
  ROLE_KEYS.REFUGE,
  ROLE_KEYS.PRESTATAIRE,
  ROLE_KEYS.UTILISATEUR,
]

const dashboardRoles = new Set([
  ROLE_KEYS.ADMIN,
  ROLE_KEYS.PRESTATAIRE,
  ROLE_KEYS.REFUGE,
])

// Cache en mémoire par userId pour éviter les appels répétés
const roleAccessCache = new Map()

const normalizeRoleName = (value) => {
  const normalized = String(value ?? '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  if (normalized.includes('admin')) return ROLE_KEYS.ADMIN
  if (normalized.includes('prestataire')) return ROLE_KEYS.PRESTATAIRE
  if (normalized.includes('refuge')) return ROLE_KEYS.REFUGE
  if (normalized.includes('utilisateur') || normalized.includes('user')) return ROLE_KEYS.UTILISATEUR
  return null
}

const normalizeRoles = (roles = []) => {
  const normalized = roles
    .map((role) => normalizeRoleName(role?.Nom ?? role?.nom ?? role))
    .filter(Boolean)

  if (normalized.length === 0) return [ROLE_KEYS.UTILISATEUR]
  return Array.from(new Set(normalized))
}

const resolvePrimaryRole = (roles) => {
  for (const roleName of ROLE_PRIORITY) {
    if (roles.includes(roleName)) return roleName
  }
  return ROLE_KEYS.UTILISATEUR
}

const buildRoleState = ({ isSignedIn, roles, error = null, backendUserId = null, source = 'backend' }) => {
  const normalizedRoles = Array.isArray(roles) ? roles : [ROLE_KEYS.VISITEUR]
  const role = isSignedIn ? resolvePrimaryRole(normalizedRoles) : ROLE_KEYS.VISITEUR
  const canAccessDashboard = isSignedIn && dashboardRoles.has(role)

  return {
    loading: false,
    isSignedIn,
    role,
    roles: normalizedRoles,
    backendUserId,
    canAccessDashboard,
    isAdmin: role === ROLE_KEYS.ADMIN,
    isPrestataire: role === ROLE_KEYS.PRESTATAIRE,
    isRefuge: role === ROLE_KEYS.REFUGE,
    isUtilisateur: role === ROLE_KEYS.UTILISATEUR,
    error,
    source,
  }
}

const visitorState = buildRoleState({
  isSignedIn: false,
  roles: [ROLE_KEYS.VISITEUR],
  source: 'none',
})

export const useRoleAccess = () => {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth()
  const [version, setVersion] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const [state, setState] = useState({ ...visitorState, loading: true })

  const refreshRoles = useCallback(() => {
    if (userId) roleAccessCache.delete(userId)
    setRetryCount(0)
    setVersion((v) => v + 1)
  }, [userId])

  useEffect(() => {
    let cancelled = false

    const resolveRoles = async () => {
      if (!isLoaded) return

      if (!isSignedIn || !userId) {
        if (!cancelled) setState(visitorState)
        return
      }

      const cached = roleAccessCache.get(userId)
      if (cached) {
        if (!cancelled) setState(cached)
        return
      }

      if (!cancelled) setState((prev) => ({ ...prev, loading: true }))

      try {
        const token = await getToken()

        if (!token) {
          if (retryCount < 3) {
            setRetryCount(c => c + 1)
            setTimeout(() => setVersion((v) => v + 1), 1000)
            return
          } else {
            throw new Error("Impossible de récupérer le jeton Clerk après plusieurs tentatives.")
          }
        }

        let me = null
        try {
          // Appel au nouveau endpoint /me — retourne { utilisateur, roles }
          me = await getCurrentUtilisateur(token)
        } catch (err) {
          // 404 avec syncing: true = Inngest n'a pas encore synchronisé le compte
          const isSyncing = err?.response?.status === 404 && err?.response?.data?.syncing
          if (isSyncing && retryCount < 5) {
            console.log(`[useRoleAccess] Synchro en cours, retry ${retryCount + 1}/5...`)
            setRetryCount(c => c + 1)
            setTimeout(() => setVersion((v) => v + 1), 2000)
            return
          }
          throw err
        }

        const backendRoles = normalizeRoles(me?.roles ?? [])
        const nextState = buildRoleState({
          isSignedIn: true,
          roles: backendRoles,
          backendUserId: me?.utilisateur?.Id ? String(me.utilisateur.Id) : null,
          source: 'backend',
        })

        roleAccessCache.set(userId, nextState)
        if (!cancelled) setState(nextState)
      } catch (error) {
        console.error('❌ useRoleAccess error:', error)
        const fallbackState = buildRoleState({
          isSignedIn: true,
          roles: [ROLE_KEYS.UTILISATEUR],
          error: error?.message ?? 'Erreur réseau',
          source: 'fallback',
        })
        roleAccessCache.set(userId, fallbackState)
        if (!cancelled) setState(fallbackState)
      }
    }

    resolveRoles()
    return () => { cancelled = true }
  }, [isLoaded, isSignedIn, userId, version, getToken])

  return useMemo(() => ({ ...state, refreshRoles }), [refreshRoles, state])
}
