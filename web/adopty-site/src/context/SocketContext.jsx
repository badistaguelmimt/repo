import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { io } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * SocketContext — Contexte global de connexion Socket.IO.
 *
 * Gère une seule instance socket pour toute l'application.
 * Tous les composants qui ont besoin du socket l'obtiennent via useSocket().
 * Le pattern est identique à CartContext : Provider en haut de l'arbre, hook pour consommer.
 */
const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const { getToken, isSignedIn, userId } = useAuth()
  const socketRef  = useRef(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // On ne crée le socket que si l'utilisateur est connecté à Clerk
    if (!isSignedIn) return

    let socket = null

    const initSocket = async () => {
      try {
        const token = await getToken()
        if (!token) return

        socket = io(API_URL, {
          auth: { token, userId: userId },
          transports: ['websocket', 'polling'],
          // Reconnexion automatique avec back-off exponentiel
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        })

        socketRef.current = socket

        socket.on('connect',    () => setIsConnected(true))
        socket.on('disconnect', () => setIsConnected(false))
        socket.on('connect_error', (err) => {
          console.warn('[Socket] Erreur de connexion :', err.message)
          setIsConnected(false)
        })

      } catch (err) {
        console.error('[Socket] Initialisation échouée :', err)
      }
    }

    initSocket()

    // Nettoyage : déconnexion propre à la destruction du Provider
    return () => {
      if (socket) {
        socket.disconnect()
        socketRef.current = null
        setIsConnected(false)
      }
    }
  }, [isSignedIn, getToken])

  return (
    <SocketContext.Provider value={{ socketRef, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

/**
 * useSocket — Accède à la connexion socket partagée.
 * Doit être utilisé à l'intérieur du SocketProvider.
 *
 * @returns {{ socketRef: React.MutableRefObject, isConnected: boolean }}
 */
export const useSocket = () => {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket doit être utilisé dans un <SocketProvider>')
  return ctx
}
