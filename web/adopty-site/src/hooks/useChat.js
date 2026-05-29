import { useCallback, useEffect, useRef, useState } from 'react'
import { useSocket } from '../context/SocketContext'
import { useCurrentUser } from './useCurrentUser'
import { getConversationsByUtilisateur } from '../services/authApi'

/**
 * useChat — Hook métier de la messagerie temps réel.
 *
 * Interface alignée sur ChatRoom.jsx du camarade.
 * Expose : dbUser, messages, isLoading, error, isConnected,
 *          typingUsers, sendMessage, sendTyping, markAsRead,
 *          conversations, activeConv, openConversation, isLoadingConvs
 *
 * typingUsers : { [userId]: userName } — utilisateurs en train d'écrire
 *               dans la conversation active (format attendu par ChatRoom)
 */
export const useChat = () => {
  const { socketRef, isConnected } = useSocket()
  const { user: backendUser, isLoading: isLoadingUser } = useCurrentUser()

  // ── État ───────────────────────────────────────────────────────────────────
  const [conversations,   setConversations]   = useState([])
  const [activeConv,      setActiveConv]      = useState(null)
  const [messages,        setMessages]        = useState([])
  const [isLoadingConvs,  setIsLoadingConvs]  = useState(false)
  const [isLoadingMsgs,   setIsLoadingMsgs]   = useState(false)
  const [error,           setError]           = useState(null)

  /**
   * typingUsers : { [userId: string]: userName: string }
   * Stocke qui est en train d'écrire dans la conversation active.
   * Format identique à celui attendu par le ChatRoom.jsx du camarade.
   */
  const [typingUsers, setTypingUsers] = useState({})

  // activeConv ref pour les handlers socket (évite les closures périmées)
  const activeConvRef = useRef(null)
  useEffect(() => { activeConvRef.current = activeConv }, [activeConv])

  // ── 1. Charger les conversations dès que le user backend est prêt ──────────
  useEffect(() => {
    if (isLoadingUser || !backendUser?.id) return
    setIsLoadingConvs(true)
    getConversationsByUtilisateur(backendUser.id)
      .then(data => setConversations(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('[useChat] Conversations:', err)
        setError('Impossible de charger les conversations.')
      })
      .finally(() => setIsLoadingConvs(false))
  }, [backendUser, isLoadingUser])

  // ── 2. Abonnements socket globaux ─────────────────────────────────────────
  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    /**
     * new_message — DTO format (toMessageDTOPmo) :
     * { id, conversationId, senderId, content, createdAt, senderName, readBy, readCount }
     */
    const onNewMessage = (msg) => {
      setMessages(prev => {
        // Remplacer le message optimiste (_tempId) par la version confirmée
        const tempIdx = prev.findIndex(m => m._tempId && m._tempId === msg._tempId)
        if (tempIdx !== -1) {
          const next = [...prev]
          next[tempIdx] = msg
          return next
        }
        // Déduplique par id
        if (prev.some(m => m.id && m.id === msg.id)) return prev
        return [...prev, msg]
      })
    }

    /**
     * user_typing — émis par typing.socket.js.
     * { userId, userName, isTyping, conversationId }
     * On ne met à jour que si c'est la conversation active.
     */
    const onUserTyping = ({ userId, userName, isTyping, conversationId }) => {
      if (String(conversationId) !== String(activeConvRef.current?.Id)) return
      setTypingUsers(prev => {
        const next = { ...prev }
        if (isTyping) {
          next[String(userId)] = userName
        } else {
          delete next[String(userId)]
        }
        return next
      })
    }

    /** messages_read — mise à jour des accusés de lecture */
    const onMessagesRead = ({ userId }) => {
      setMessages(prev => prev.map(m => ({
        ...m,
        readBy: m.readBy?.includes(userId) ? m.readBy : [...(m.readBy || []), userId],
      })))
    }

    socket.on('new_message',   onNewMessage)
    socket.on('user_typing',   onUserTyping)
    socket.on('messages_read', onMessagesRead)

    return () => {
      socket.off('new_message',   onNewMessage)
      socket.off('user_typing',   onUserTyping)
      socket.off('messages_read', onMessagesRead)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketRef.current])

  // ── 3. Rejoindre une conversation → historique via callback ───────────────
  const openConversation = useCallback((conv) => {
    const socket = socketRef.current
    if (!socket || !conv) return

    setActiveConv(conv)
    setMessages([])
    setError(null)
    setTypingUsers({})     // Réinitialiser les indicateurs typing
    setIsLoadingMsgs(true)

    /**
     * join_conversation avec callback (chat.socket.js).
     * Retourne : { success, history: MessageDTO[] }
     */
    socket.emit('join_conversation', { conversationId: conv.Id }, (response) => {
      setIsLoadingMsgs(false)
      if (response?.success && Array.isArray(response.history)) {
        setMessages(response.history)
      } else {
        setError(response?.error || 'Impossible de rejoindre la conversation.')
        console.warn('[useChat] join_conversation refusé :', response?.error)
      }
    })

    // Marquer les messages comme lus à l'ouverture
    socket.emit('mark_read', { conversationId: conv.Id })
  }, [socketRef])

  // ── 4. Envoyer un message ─────────────────────────────────────────────────
  const sendMessage = useCallback((content) => {
    const socket = socketRef.current
    if (!content?.trim() || !activeConvRef.current || !socket || !backendUser) return

    const tempId = `temp_${Date.now()}`

    // Message optimiste en format DTO pour cohérence du rendu
    const optimisticMsg = {
      _tempId:        tempId,
      content:        content.trim(),
      senderId:       backendUser.id,
      senderName:     `${backendUser.prenom || ''} ${backendUser.nom || ''}`.trim(),
      createdAt:      new Date().toISOString(),
      conversationId: activeConvRef.current.Id,
      readBy:         [],
      _pending:       true,
    }
    setMessages(prev => [...prev, optimisticMsg])

    /**
     * send_message avec callback.
     * Backend attend : { conversationId, content }
     */
    socket.emit('send_message', {
      conversationId: activeConvRef.current.Id,
      content: content.trim()
    }, (response) => {
      if (response?.success && response.message) {
        setMessages(prev => {
          const next = [...prev]
          const tempIdx = next.findIndex(m => m._tempId === tempId)
          if (tempIdx !== -1) {
            next[tempIdx] = response.message
            return next
          }
          if (next.some(m => m.id === response.message.id)) return next
          return [...next, response.message]
        })
      } else {
        console.error('[useChat] Échec envoi :', response?.error)
        setMessages(prev => prev.filter(m => m._tempId !== tempId))
      }
    })
  }, [backendUser, socketRef])

  // ── 5. Indicateur "en train d'écrire" ─────────────────────────────────────
  /**
   * sendTyping(isTyping: boolean) — Interface identique au ChatRoom du camarade.
   * Émet l'événement typing avec le booléen fourni.
   */
  const sendTyping = useCallback((isTyping) => {
    const socket = socketRef.current
    if (!socket || !activeConvRef.current) return
    socket.emit('typing', {
      conversationId: activeConvRef.current.Id,
      isTyping: Boolean(isTyping)
    })
  }, [socketRef])

  // ── 6. Marquer comme lu ───────────────────────────────────────────────────
  /**
   * markAsRead(messageId) — Interface identique au ChatRoom du camarade.
   */
  const markAsRead = useCallback((messageId) => {
    const socket = socketRef.current
    if (!socket || !activeConvRef.current) return
    socket.emit('mark_read', {
      conversationId: activeConvRef.current.Id,
      messageId
    })
  }, [socketRef])

  return {
    // Alias pour compatibilité avec ChatRoom.jsx du camarade
    dbUser:          backendUser,
    // Données
    conversations,
    activeConv,
    messages,
    isLoadingConvs,
    isLoading:       isLoadingMsgs,   // alias attendu par ChatRoom
    error,
    isConnected,
    typingUsers,
    // Actions
    openConversation,
    sendMessage,
    sendTyping,
    markAsRead,
  }
}
