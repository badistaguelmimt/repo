import { useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSignIn } from '@clerk/clerk-react'
import { findOrCreateDirectConversation } from '../services/authApi'
import { useCurrentUser } from './useCurrentUser'

/**
 * useStartConversation — Crée ou retrouve une conversation directe avec un utilisateur cible,
 * puis ouvre le drawer de messagerie en passant l'ID de conversation pour l'auto-ouvrir.
 *
 * Usage :
 *   const { startConversation, isLoading } = useStartConversation()
 *   startConversation(targetUserId, targetName)
 */
export const useStartConversation = () => {
  const { user: currentUser, isLoading: isLoadingUser } = useCurrentUser()
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const startConversation = useCallback(async (targetUserId, targetName = '') => {
    // Non connecté → redirection vers auth
    if (!currentUser && !isLoadingUser) {
      navigate('/auth')
      return
    }
    if (!targetUserId) return

    // Anti-réflexivité : on ne peut pas se contacter soi-même
    if (currentUser && String(currentUser.id) === String(targetUserId)) {
      console.warn('[useStartConversation] Tentative de conversation avec soi-même ignorée.')
      return
    }
    setIsLoading(true)
    setError(null)

    try {
      const result = await findOrCreateDirectConversation(targetUserId)
      // Mettre à jour l'état de l'URL pour passer l'ID de conversation à Messages.jsx
      navigate(location.pathname, {
        replace: true,
        state: {
          ...location.state,
          openConvId:  result.conversationId,
          targetName,
        }
      })
      // Déclencher l'ouverture du drawer dans Layout
      window.dispatchEvent(new Event('open-messaging'))
    } catch (err) {
      console.error('[useStartConversation]', err)
      setError('Impossible de démarrer la conversation.')
    } finally {
      setIsLoading(false)
    }
  }, [currentUser, isLoadingUser, navigate])

  return { startConversation, isLoading, error }
}
