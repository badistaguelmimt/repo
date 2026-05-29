// frontend/src/components/chat/ChatRoom.jsx
// Logique reprise du repo du camarade (Adopty-Org/adopty)
// UI adaptée au design system Adopty (Tailwind + classes du site)

import { useState, useRef, useEffect, useMemo } from 'react'

// ── Helpers de formatage ───────────────────────────────────────────────────

const formatDate = (date) => {
  const now         = new Date()
  const messageDate = new Date(date)
  if (messageDate.toDateString() === now.toDateString()) return "Aujourd'hui"
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (messageDate.toDateString() === yesterday.toDateString()) return 'Hier'
  return messageDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formatTime = (date) =>
  new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

/** Vrai si deux messages sont séparés de plus de 30 minutes */
const shouldShowTimeSeparator = (currentMsg, prevMsg) => {
  if (!prevMsg) return true
  const diff = new Date(currentMsg.createdAt) - new Date(prevMsg.createdAt)
  return diff / (1000 * 60) > 30
}

// ── Animation keyframes injectée une seule fois ────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('chat-pulse-style')) {
  const s = document.createElement('style')
  s.id = 'chat-pulse-style'
  s.textContent = `
    @keyframes chat-pulse { 0%,100%{opacity:.3} 50%{opacity:1} }
    .typing-dot { animation: chat-pulse 1.5s ease-in-out infinite; }
  `
  document.head.appendChild(s)
}

// ── Composant ──────────────────────────────────────────────────────────────

/**
 * ChatRoom — Zone de chat active.
 * Reçoit toutes les données et actions depuis useChat() via Messages.jsx.
 *
 * @param {object}   activeConv     - Conversation active (avec .Id et .Nom)
 * @param {object[]} messages       - Tableau de MessageDTO
 * @param {object}   dbUser         - Utilisateur courant (backendUser)
 * @param {boolean}  isLoading      - Chargement de l'historique
 * @param {string|null} error       - Message d'erreur éventuel
 * @param {boolean}  isConnected    - État de la connexion WebSocket
 * @param {object}   typingUsers    - { [userId]: userName } en train d'écrire
 * @param {function} sendMessage    - sendMessage(content: string)
 * @param {function} sendTyping     - sendTyping(isTyping: boolean)
 * @param {function} markAsRead     - markAsRead(messageId)
 * @param {function} onBack         - Retour mobile (afficher sidebar)
 */
export const ChatRoom = ({
  activeConv,
  messages,
  dbUser,
  isLoading,
  error,
  isConnected,
  typingUsers,
  sendMessage,
  sendTyping,
  markAsRead,
  onBack,
}) => {
  const [input, setInput] = useState('')
  const messagesEndRef       = useRef(null)
  const messagesContainerRef = useRef(null)

  // ── Grouper les messages par date + séparateurs temporels ─────────────────
  // Logique identique au repo du camarade
  const groupedMessages = useMemo(() => {
    if (!messages.length) return []
    const groups = []

    messages.forEach((msg, index) => {
      const prevMsg  = index > 0 ? messages[index - 1] : null
      const msgDate  = new Date(msg.createdAt).toDateString()
      const prevDate = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null

      // Séparateur de date
      if (index === 0 || msgDate !== prevDate) {
        groups.push({ type: 'date_separator', date: msg.createdAt, formattedDate: formatDate(msg.createdAt) })
      }

      // Séparateur de temps (écart > 30 min, même jour)
      if (prevMsg && msgDate === prevDate && shouldShowTimeSeparator(msg, prevMsg)) {
        groups.push({ type: 'time_separator', time: formatTime(prevMsg.createdAt), nextTime: formatTime(msg.createdAt) })
      }

      // Message avec flag showTime
      groups.push({ type: 'message', ...msg, showTime: !prevMsg || shouldShowTimeSeparator(msg, prevMsg) })
    })

    return groups
  }, [messages])

  // ── Utilisateurs en train d'écrire (exclu soi-même) ──────────────────────
  const otherTypingUsers = Object.entries(typingUsers)
    .filter(([userId]) => String(userId) !== String(dbUser?.id))
    .map(([userId, userName]) => ({ userId, userName }))

  const getTypingText = () => {
    if (otherTypingUsers.length === 0) return null
    if (otherTypingUsers.length === 1) return `${otherTypingUsers[0].userName} est en train d'écrire…`
    if (otherTypingUsers.length === 2) return `${otherTypingUsers[0].userName} et ${otherTypingUsers[1].userName} écrivent…`
    return 'Plusieurs personnes écrivent…'
  }

  // ── Accusé de lecture (✓ / ✓✓) ───────────────────────────────────────────
  const getReadReceipt = (msg) => {
    if (String(msg.senderId) !== String(dbUser?.id)) return null
    const readCount = msg.readBy?.length || 0
    const color     = readCount > 0 ? 'text-blue-300' : 'text-white/50'
    return (
      <span className={`text-[10px] ml-1 ${color}`}>
        {readCount > 0 ? '✓✓' : '✓'}
        {readCount > 1 && ` (${readCount})`}
      </span>
    )
  }

  // ── Envoi ─────────────────────────────────────────────────────────────────
  const handleSend = () => {
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
    sendTyping(false)
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    sendTyping(e.target.value.trim().length > 0)
  }

  const handleBlur = () => sendTyping(false)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // ── Auto-scroll + mark as read ────────────────────────────────────────────
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }

    if (messages.length > 0 && dbUser) {
      const unread = messages.filter(
        msg => String(msg.senderId) !== String(dbUser.id) && !msg.readBy?.includes(dbUser.id)
      )
      if (unread.length > 0) {
        markAsRead(unread[unread.length - 1].id)
      }
    }
  }, [messages, dbUser, markAsRead])

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col min-h-0">

      {/* Header conversation */}
      <div className="bg-surface-container border-b-4 border-black px-5 py-4 flex items-center gap-3 flex-shrink-0">
        {/* Bouton retour mobile */}
        <button
          onClick={onBack}
          className="lg:hidden mr-1 p-1.5 rounded-lg hover:bg-surface-container-high"
        >
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </button>

        <div className="w-10 h-10 rounded-full bg-secondary border-2 border-black flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-white text-base">person</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-sm truncate">
            {activeConv?.Nom || `Conversation #${activeConv?.Id}`}
          </p>
          {/* Indicateur typing (prioritaire) ou statut connexion */}
          {otherTypingUsers.length > 0 ? (
            <p className="text-xs text-primary animate-pulse truncate">{getTypingText()}</p>
          ) : (
            <p className="text-xs text-on-surface-variant">
              {isConnected ? 'En ligne' : 'Hors ligne'}
            </p>
          )}
        </div>

        {/* Pastille connexion */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-black text-[10px] font-bold
          ${isConnected ? 'bg-green-100 text-green-800' : 'bg-surface-container text-on-surface-variant'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          {isConnected ? 'Connecté' : 'Déconnecté'}
        </div>
      </div>

      {/* Zone messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-1 bg-[#fafaf7] min-h-0"
      >
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <span className="material-symbols-outlined text-5xl text-red-400">error</span>
            <p className="text-sm font-bold text-red-500">{error}</p>
          </div>
        ) : groupedMessages.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/20">forum</span>
            <p className="text-sm font-bold text-on-surface-variant">Démarrez la conversation !</p>
          </div>
        ) : (
          groupedMessages.map((item, idx) => {

            // ── Séparateur de date ──────────────────────────────────────────
            if (item.type === 'date_separator') {
              return (
                <div key={`date-${idx}`} className="flex items-center justify-center gap-3 my-4">
                  <div className="flex-1 h-px bg-outline-variant" />
                  <span className="text-[11px] text-on-surface-variant bg-[#fafaf7] px-3 py-1 rounded-full font-medium border border-outline-variant">
                    {item.formattedDate}
                  </span>
                  <div className="flex-1 h-px bg-outline-variant" />
                </div>
              )
            }

            // ── Séparateur de temps ─────────────────────────────────────────
            if (item.type === 'time_separator') {
              return (
                <div key={`time-${idx}`} className="flex justify-center my-2">
                  <span className="text-[10px] text-on-surface-variant/60 bg-outline-variant/20 px-2 py-0.5 rounded-full">
                    {item.time} → {item.nextTime}
                  </span>
                </div>
              )
            }

            // ── Bulle de message ────────────────────────────────────────────
            const isOwn = String(item.senderId) === String(dbUser?.id)

            return (
              <div key={item.id || item._tempId || idx} className={`flex mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                {/* Message reçu */}
                {!isOwn && (
                  <div className="flex flex-col items-start gap-0.5 max-w-[72%]">
                    {item.senderName && (
                      <span className="text-[10px] font-bold text-on-surface-variant px-1">
                        {item.senderName}
                      </span>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl rounded-bl-none border-2 border-black
                      shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm bg-white text-on-surface
                      ${item._pending ? 'opacity-60' : ''}`}>
                      <p className="leading-relaxed whitespace-pre-wrap break-words">{item.content}</p>
                      <p className="text-[10px] mt-1 text-right text-on-surface-variant/60">
                        {formatTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Message envoyé */}
                {isOwn && (
                  <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl rounded-br-none border-2 border-black
                    shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm bg-primary text-white
                    ${item._pending ? 'opacity-60' : ''}`}>
                    <p className="leading-relaxed whitespace-pre-wrap break-words">{item.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-white/60">{formatTime(item.createdAt)}</span>
                      {item._pending && <span className="text-[10px] text-white/40">· envoi…</span>}
                      {!item._pending && getReadReceipt(item)}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Indicateur typing (sous les messages) */}
      {getTypingText() && (
        <div className="px-5 py-2 flex items-center gap-2 text-xs text-on-surface-variant italic border-t border-outline-variant bg-surface-container flex-shrink-0">
          <span className="typing-dot text-primary">●</span>
          {getTypingText()}
        </div>
      )}

      {/* Zone de saisie */}
      <div className="border-t-4 border-black bg-white px-4 py-3 flex gap-3 items-end flex-shrink-0">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Votre message… (Entrée pour envoyer)"
          rows={1}
          disabled={!isConnected}
          className="flex-1 resize-none border-2 border-black rounded-xl px-4 py-3 text-sm
            focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed
            max-h-32 overflow-y-auto disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || !isConnected}
          className="w-12 h-12 bg-primary text-white rounded-xl border-2 border-black
            shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]
            hover:shadow-none transition-all flex items-center justify-center
            disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>
    </div>
  )
}
