import { useState, useEffect } from 'react'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '../../hooks/useChat'
import { ConversationList } from '../../components/chat/ConversationList'
import { ChatRoom } from '../../components/chat/ChatRoom'

const Messages = ({ isOpen, onClose }) => {
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
    acceptConv,
    declineConv,
  } = useChat()

  const pendingCount = conversations.filter(c => c.MyStatut === 'pending').length

  const [mobileShowChat, setMobileShowChat] = useState(false)

  const handleSelectConv = (conv) => {
    openConversation(conv)
    setMobileShowChat(true)
  }

  const handleBack = () => setMobileShowChat(false)

  // ── Auto-ouvrir une conversation depuis location.state
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[190] pointer-events-none">
          {/* Backdrop avec un léger blur qui ne capture pas les clics */}
          <div className="absolute inset-0 backdrop-blur-[2px] bg-background/20" />
          
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute left-0 top-0 bottom-0 w-[90vw] max-w-2xl bg-surface-container-lowest border-r-4 border-black shadow-[8px_0_0_0_rgba(0,0,0,0.3)] flex flex-col pointer-events-auto"
          >
            <SignedIn>
              {/* En-tête du Drawer */}
              <div className="flex items-center justify-between p-5 border-b-4 border-black bg-surface-container flex-shrink-0">
                <div className="flex items-center gap-4">
                  <h2 className="font-['Chewy'] text-3xl text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-3xl">chat</span>
                    Messagerie
                    {pendingCount > 0 && (
                      <span className="ml-1 px-2 py-0.5 bg-error text-white text-xs font-bold rounded-full border-2 border-black animate-pulse">
                        {pendingCount}
                      </span>
                    )}
                  </h2>
                  <div className={`hidden sm:flex items-center gap-2 px-2 py-1 rounded-full border-2 border-black text-[10px] font-bold
                    ${isConnected ? 'bg-green-100 text-green-800' : 'bg-surface-container text-on-surface-variant'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    {isConnected ? 'En ligne' : 'Déconnecté'}
                  </div>
                </div>
                <button onClick={onClose} className="p-2 border-2 border-black hover:bg-error hover:text-white transition-colors rounded-lg">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* ── Conteneur principal du chat ────────────────────── */}
              <div className="flex-1 overflow-hidden flex min-h-0 bg-[#fbfbe2]">
                {/* Sidebar */}
                <div className={`${mobileShowChat ? 'hidden sm:flex' : 'flex'} w-full sm:w-64 md:w-72 border-r-4 border-black flex-shrink-0 min-h-0`}>
                  <ConversationList
                    conversations={conversations}
                    activeConv={activeConv}
                    onSelect={handleSelectConv}
                    isLoading={isLoadingConvs}
                    onAccept={acceptConv}
                    onDecline={declineConv}
                  />
                </div>

                {/* Zone de chat */}
                <div className={`${!mobileShowChat ? 'hidden sm:flex' : 'flex'} flex-1 flex-col min-h-0`}>
                  {!activeConv ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4 bg-surface-container-lowest">
                      <span className="material-symbols-outlined text-6xl text-on-surface-variant/20">chat_bubble</span>
                      <p className="font-['Chewy'] text-2xl text-primary">Sélectionnez une conversation</p>
                      {conversations.length === 0 && !isLoadingConvs && (
                        <p className="text-xs text-on-surface-variant/60 mt-2 bg-surface-container px-4 py-2 rounded-xl border border-outline-variant max-w-xs">
                          💡 Rendez-vous sur la page <strong>Services</strong> ou sur le profil d'un <strong>Refuge</strong> pour démarrer une discussion
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
            </SignedIn>

            <SignedOut>
              <div className="flex items-center justify-between p-5 border-b-4 border-black bg-surface-container flex-shrink-0">
                <h2 className="font-['Chewy'] text-3xl text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-3xl">chat</span> Messagerie
                </h2>
                <button onClick={onClose} className="p-2 border-2 border-black hover:bg-error hover:text-white transition-colors rounded-lg">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6 text-center">
                <span className="material-symbols-outlined text-7xl text-on-surface-variant/30">chat</span>
                <h2 className="font-['Chewy'] text-3xl text-primary">
                  Connectez-vous pour accéder à la messagerie
                </h2>
                <Link
                  to="/auth"
                  onClick={onClose}
                  className="px-8 py-4 bg-primary text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  Se connecter
                </Link>
              </div>
            </SignedOut>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

export default Messages
