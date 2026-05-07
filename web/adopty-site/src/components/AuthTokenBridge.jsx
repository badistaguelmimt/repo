import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { setAuthTokenGetter } from '../lib/http'

const AuthTokenBridge = () => {
  const { getToken } = useAuth()

  useEffect(() => {
    setAuthTokenGetter(getToken)
    return () => setAuthTokenGetter(null)
  }, [getToken])

  return null
}

export default AuthTokenBridge

