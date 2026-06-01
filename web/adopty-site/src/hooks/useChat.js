import { useCallback, useEffect, useRef, useState } from 'react'
import { useSocket } from '../context/SocketContext'
import { useCurrentUser } from './useCurrentUser'
import { getConversationsByUtilisateur, acceptConversation, declineConversation } from '../services/authApi'

/**
 * useChat — Hook métier de la messagerie temps réel.
 *
 * Expose : dbUser, messages, isLoading, error, isConnected,
 *          typingUsers, sendMessage, sendTyping, markAsRead,
 *          conversations, activeConv, openConversation, isLoadingConvs
 *          acceptConv, declineConv (système DM style Instagram)
 */
export const useChat = () => {
  const { socketRef, isConnected } = useSocket()
  const { user: backendUser, isLoading: isLoadingUser } = useCurrentUser()

  const [conversations,  setConversations]  = useState([])
  const [activeConv,     setActiveConv]     = useState(null)
  const [messages,       setMessages]       = useState([])
  const [isLoadingConvs, setIsLoadingConvs] = useState(false)
  const [isLoadingMsgs,  setIsLoadingMsgs]  = useState(false)
  const [error,          setError]          = useState(null)
  const [typingUsers,    setTypingUsers]    = useState({})

  const activeConvRef = useRef(null)
  useEffect(() => { activeConvRef.current = activeConv }, [activeConv])

  // ── Charger / recharger la liste des conversations ─────────────────────────
  const loadConversations = useCallback(() => {
    if (!backendUser?.id) return
    setIsLoadingConvs(true)
    getConversationsByUtilisateur(backendUser.id)
      .then(data => setConversations(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('[useChat] Conversations:', err)
        setError('Impossible de charger les conversations.')
      })
      .finally(() => setIsLoadingConvs(false))
  }, [backendUser])

  // ── 1. Chargement initial ──────────────────────────────────────────────────
  useEffect(() => {
    if (isLoadingUser || !backendUser?.id) return
    loadConversations()
  }, [backendUser, isLoadingUser, loadConversations])

  // ── 2. Abonnements socket globaux ─────────────────────────────────────────
  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    const onNewMessage = (msg) => {
      setMessages(prev => {
        const tempIdx = prev.findIndex(m => m._tempId && m._tempId === msg._tempId)
        if (tempIdx !== -1) {
          const next = [...prev]
          next[tempIdx] = msg
          return next
        }
        if (prev.some(m => m.id && m.id === msg.id)) return prev
        return [...prev, msg]
      })
      // Rafraîchir la sidebar pour mettre à jour le dernier message
      loadConversations()
    }

    const onUserTyping = ({ userId, userName, isTyping, conversationId }) => {
      if (String(conversationId) !== String(activeConvRef.current?.Id)) return
      setTypingUsers(prev => {
        const next = { ...prev }
        if (isTyping) next[String(userId)] = userName
        else delete next[String(userId)]
        return next
      })
    }

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
  }, [socketRef.current, loadConversations])

  // ── 3. Ouvrir une conversation ─────────────────────────────────────────────
  const openConversation = useCallback((conv) => {
    const socket = socketRef.current
    if (!socket || !conv) return

    setActiveConv(conv)
    setMessages([])
    setError(null)
    setTypingUsers({})
    setIsLoadingMsgs(true)

    socket.emit('join_conversation', { conversationId: conv.Id }, (response) => {
      setIsLoadingMsgs(false)
      if (response?.success && Array.isArray(response.history)) {
        setMessages(response.history)
      } else {
        setError(response?.error || 'Impossible de rejoindre la conversation.')
        console.warn('[useChat] join_conversation refusé :', response?.error)
      }
    })

    socket.emit('mark_read', { conversationId: conv.Id })
  }, [socketRef])

  // ── 4. Envoyer un message ─────────────────────────────────────────────────
  const sendMessage = useCallback((content) => {
    const socket = socketRef.current
    if (!content?.trim() || !activeConvRef.current || !socket || !backendUser) return

    const tempId = `temp_${Date.now()}`
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

    socket.emit('send_message', {
      conversationId: activeConvRef.current.Id,
      content: content.trim()
    }, (response) => {
      if (response?.success && response.message) {
        setMessages(prev => {
          const next = [...prev]
          const tempIdx = next.findIndex(m => m._tempId === tempId)
          if (tempIdx !== -1) { next[tempIdx] = response.message; return next }
          if (next.some(m => m.id === response.message.id)) return next
          return [...next, response.message]
        })
      } else {
        console.error('[useChat] Échec envoi :', response?.error)
        setMessages(prev => prev.filter(m => m._tempId !== tempId))
      }
    })
  }, [backendUser, socketRef])

  // ── 5. Typing indicator ───────────────────────────────────────────────────
  const sendTyping = useCallback((isTyping) => {
    const socket = socketRef.current
    if (!socket || !activeConvRef.current) return
    socket.emit('typing', { conversationId: activeConvRef.current.Id, isTyping: Boolean(isTyping) })
  }, [socketRef])

  // ── 6. Marquer comme lu ───────────────────────────────────────────────────
  const markAsRead = useCallback((messageId) => {
    const socket = socketRef.current
    if (!socket || !activeConvRef.current) return
    socket.emit('mark_read', { conversationId: activeConvRef.current.Id, messageId })
  }, [socketRef])

  // ── 7. Accepter une demande DM ────────────────────────────────────────────
  const acceptConv = useCallback(async (conv) => {
    try {
      await acceptConversation(conv.Id)
      setConversations(prev =>
        prev.map(c => c.Id === conv.Id ? { ...c, MyStatut: 'accepted' } : c)
      )
    } catch (err) {
      console.error('[useChat] acceptConv:', err)
    }
  }, [])

  // ── 8. Refuser / supprimer une demande DM ─────────────────────────────────
  const declineConv = useCallback(async (conv) => {
    try {
      await declineConversation(conv.Id)
      setConversations(prev => prev.filter(c => c.Id !== conv.Id))
      if (activeConvRef.current?.Id === conv.Id) {
        setActiveConv(null)
        setMessages([])
      }
    } catch (err) {
      console.error('[useChat] declineConv:', err)
    }
  }, [])

  return {
    dbUser:          backendUser,
    conversations,
    activeConv,
    messages,
    isLoadingConvs,
    isLoading:       isLoadingMsgs,
    error,
    isConnected,
    typingUsers,
    openConversation,
    sendMessage,
    sendTyping,
    markAsRead,
    acceptConv,
    declineConv,
  }
}
