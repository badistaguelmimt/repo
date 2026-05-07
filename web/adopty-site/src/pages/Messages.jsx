import { useState, useEffect } from 'react'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Link, useLocation } from 'react-router-dom'
import { PageTransition, FadeIn } from '../components/Animations'
import { useChat } from '../hooks/useChat'
import { ConversationList } from '../components/chat/ConversationList'
import { ChatRoom } from '../components/chat/ChatRoom'

/**
 * Messages — Page de messagerie temps réel.
 *
 * Supporte l'auto-ouverture d'une conversation via location.state :
 *   navigate('/messages', { state: { openConvId: 42, targetName: 'Alice' } })
 */
const Messages = () => {
  const location = useLocation()

  const {
    conversations,
    activeConv,
    messages,
    isLoadingConvs,
    isLoading,
    error,
    isConnected,
    typingUsers,
    dbUser,
    openConversation,
    sendMessage,
    sendTyping,
    markAsRead,
  } = useChat()

  // État mobile : afficher la sidebar ou le chat
  const [mobileShowChat, setMobileShowChat] = useState(false)

  const handleSelectConv = (conv) => {
    openConversation(conv)
    setMobileShowChat(true)
  }

  const handleBack = () => setMobileShowChat(false)

  // ── Auto-ouvrir une conversation depuis location.state ─────────────────────
  useEffect(() => {
    const { openConvId } = location.state || {}
    if (!openConvId || isLoadingConvs || conversations.length === 0) return

    const target = conversations.find(c => String(c.Id) === String(openConvId))
    if (target && (!activeConv || activeConv.Id !== target.Id)) {
      handleSelectConv(target)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, conversations, isLoadingConvs])

  return (
    <PageTransition>

      {/* Écran non connecté */}
      <SignedOut>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
          <span className="material-symbols-outlined text-7xl text-on-surface-variant/30">chat</span>
          <h2 className="font-['Chewy'] text-4xl text-primary">
            Connectez-vous pour accéder à la messagerie
          </h2>
          <Link
            to="/auth"
            className="px-8 py-4 bg-primary text-white font-bold border-2 border-black
              shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]
              hover:shadow-none transition-all"
          >
            Se connecter
          </Link>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col" style={{ minHeight: 'calc(100vh - 120px)' }}>

          {/* En-tête page */}
          <FadeIn className="mb-6 flex items-center justify-between flex-shrink-0">
            <div>
              <h1 className="font-['Chewy'] text-4xl text-primary flex items-center gap-3">
                <span className="material-symbols-outlined text-4xl">chat</span>
                Messagerie
              </h1>
              <p className="text-on-surface-variant text-sm mt-1">
                Communiquez avec les refuges et prestataires en temps réel
              </p>
            </div>

            {/* Pastille statut WebSocket */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-black text-xs font-bold
              ${isConnected ? 'bg-green-100 text-green-800' : 'bg-surface-container text-on-surface-variant'}`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              {isConnected ? 'En ligne' : 'Déconnecté'}
            </div>
          </FadeIn>

          {/* ── Conteneur principal (flex, hauteur fixe) ────────────────────── */}
          <div className="flex-1 bg-surface-container-lowest border-4 border-black shadow-[8px_8px_0px_0px_rgba(21,66,18,1)] rounded-2xl overflow-hidden flex min-h-0" style={{ height: '72vh' }}>

            {/* Sidebar */}
            <div className={`${mobileShowChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-72 flex-shrink-0 min-h-0`}>
              <ConversationList
                conversations={conversations}
                activeConv={activeConv}
                onSelect={handleSelectConv}
                isLoading={isLoadingConvs}
              />
            </div>

            {/* Zone de chat */}
            <div className={`${!mobileShowChat ? 'hidden lg:flex' : 'flex'} flex-1 flex-col min-h-0`}>
              {!activeConv ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
                  <span className="material-symbols-outlined text-8xl text-on-surface-variant/20">chat_bubble</span>
                  <p className="font-['Chewy'] text-3xl text-primary">Sélectionnez une conversation</p>
                  <p className="text-sm text-on-surface-variant max-w-xs">
                    Choisissez une conversation dans la liste de gauche pour commencer à échanger
                  </p>
                  {conversations.length === 0 && !isLoadingConvs && (
                    <p className="text-xs text-on-surface-variant/60 mt-2 bg-surface-container px-4 py-2 rounded-full border border-outline-variant">
                      💡 Rendez-vous sur la page <strong>Services</strong> pour contacter un prestataire
                    </p>
                  )}
                </div>
              ) : (
                <ChatRoom
                  activeConv={activeConv}
                  messages={messages}
                  dbUser={dbUser}
                  isLoading={isLoading}
                  error={error}
                  isConnected={isConnected}
                  typingUsers={typingUsers}
                  sendMessage={sendMessage}
                  sendTyping={sendTyping}
                  markAsRead={markAsRead}
                  onBack={handleBack}
                />
              )}
            </div>

          </div>
        </div>
      </SignedIn>

    </PageTransition>
  )
}

export default Messages
