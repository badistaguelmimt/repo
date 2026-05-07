import { useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { useLocation, useNavigate } from 'react-router-dom'

export const useRequireAuthAction = () => {
  const { isLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const requireAuthAction = useCallback((action) => {
    if (!isLoaded) return false

    if (!isSignedIn) {
      navigate('/auth', {
        state: { from: `${location.pathname}${location.search}` },
      })
      return false
    }

    if (typeof action === 'function') {
      action()
    }

    return true
  }, [isLoaded, isSignedIn, location.pathname, location.search, navigate])

  return {
    isReady: isLoaded,
    isSignedIn,
    requireAuthAction,
  }
}
