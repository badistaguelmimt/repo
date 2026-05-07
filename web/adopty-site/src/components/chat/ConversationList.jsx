// frontend/src/components/chat/ConversationList.jsx

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d    = new Date(dateStr)
  const now  = new Date()
  const diff = new Date(now.setHours(0,0,0,0)) - new Date(new Date(dateStr).setHours(0,0,0,0))
  if (diff === 0)        return "Aujourd'hui"
  if (diff === 86400000) return 'Hier'
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

/**
 * ConversationList — Sidebar listant les conversations de l'utilisateur.
 */
export const ConversationList = ({ conversations = [], activeConv, onSelect, isLoading }) => {
  return (
    <aside className="flex-shrink-0 border-r-4 border-black flex flex-col h-full w-full lg:w-72">

      {/* En-tête */}
      <div className="bg-primary px-4 py-4 border-b-4 border-black flex-shrink-0">
        <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-white text-sm uppercase tracking-widest">
          Mes conversations ({conversations.length})
        </p>
      </div>

      {/* Liste — prend tout l'espace restant */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 px-6 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">forum</span>
            <p className="text-sm font-bold text-on-surface-variant">Aucune conversation</p>
            <p className="text-xs text-on-surface-variant/60">
              Contactez un refuge ou un prestataire pour démarrer
            </p>
          </div>
        ) : (
          conversations.map(conv => (
            <button
              key={conv.Id}
              onClick={() => onSelect(conv)}
              className={`w-full text-left px-4 py-4 border-b border-outline-variant transition-colors flex items-center gap-3
                hover:bg-surface-container
                ${activeConv?.Id === conv.Id ? 'bg-primary-fixed border-l-4 border-l-primary' : ''}`}
            >
              {/* Avatar initiales */}
              <div className="w-10 h-10 rounded-full bg-secondary border-2 border-black flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {(conv.Nom || '?').charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Infos conversation */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">
                  {conv.Nom || `Conversation #${conv.Id}`}
                </p>
                <p className="text-xs text-on-surface-variant truncate">
                  {conv.DernierMessage || 'Démarrer la conversation…'}
                </p>
              </div>

              {/* Date relative */}
              {(conv.DernierMessageAt || conv.CreatedAt) && (
                <span className="text-[10px] text-on-surface-variant flex-shrink-0">
                  {formatDate(conv.DernierMessageAt || conv.CreatedAt)}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </aside>
  )
}
