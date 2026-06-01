import { useState } from 'react'

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
 * ConversationList — Sidebar avec onglets :
 *   - "Demandes" : conversations pending (style Instagram DM Request)
 *   - "Messages" : conversations acceptées
 */
export const ConversationList = ({
  conversations = [],
  activeConv,
  onSelect,
  isLoading,
  onAccept,
  onDecline,
}) => {
  const [tab, setTab] = useState('messages') // 'messages' | 'requests'

  const pending  = conversations.filter(c => c.MyStatut === 'pending')
  const accepted = conversations.filter(c => c.MyStatut !== 'pending')

  const shown = tab === 'requests' ? pending : accepted

  return (
    <aside className="flex-shrink-0 border-r-4 border-black flex flex-col h-full w-full lg:w-72">

      {/* ── Onglets ─────────────────────────────────────────────────── */}
      <div className="flex border-b-4 border-black flex-shrink-0">
        <button
          onClick={() => setTab('messages')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors
            ${tab === 'messages'
              ? 'bg-primary text-white'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'}`}
        >
          Messages
          {accepted.length > 0 && (
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold border border-black
              ${tab === 'messages' ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
              {accepted.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('requests')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-l-4 border-black relative
            ${tab === 'requests'
              ? 'bg-secondary text-white'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'}`}
        >
          Demandes
          {pending.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-error text-white text-[10px] font-bold rounded-full border-2 border-black flex items-center justify-center">
              {pending.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Liste ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : shown.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 px-6 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">
              {tab === 'requests' ? 'mark_chat_read' : 'forum'}
            </span>
            <p className="text-sm font-bold text-on-surface-variant">
              {tab === 'requests' ? 'Aucune demande en attente' : 'Aucune conversation'}
            </p>
            {tab === 'messages' && (
              <p className="text-xs text-on-surface-variant/60">
                Contactez un refuge ou un prestataire pour démarrer
              </p>
            )}
          </div>
        ) : tab === 'requests' ? (
          /* ── Vue Demandes (DM Request like Instagram) ── */
          <div className="p-3 space-y-3">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider px-1">
              Vous pouvez accepter ou refuser chaque message reçu.
            </p>
            {shown.map(conv => (
              <div
                key={conv.Id}
                className="bg-surface-container-lowest border-2 border-black rounded-xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                {/* Aperçu */}
                <div className="flex items-center gap-3 p-3 border-b-2 border-black">
                  <div className="w-9 h-9 rounded-full bg-secondary border-2 border-black flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {(conv.Nom || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{conv.Nom || `Conv #${conv.Id}`}</p>
                    <p className="text-xs text-on-surface-variant truncate italic">
                      {conv.DernierMessage || 'A envoyé une demande de message…'}
                    </p>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex">
                  <button
                    onClick={() => onAccept?.(conv)}
                    className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-primary border-r-2 border-black bg-primary-fixed hover:bg-primary hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Accepter
                  </button>
                  <button
                    onClick={() => onDecline?.(conv)}
                    className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-error hover:bg-error hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">cancel</span>
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── Vue Messages normaux ── */
          shown.map(conv => (
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
