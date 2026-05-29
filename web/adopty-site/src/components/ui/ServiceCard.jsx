import { Link } from 'react-router-dom'
import { FadeIn } from '../Animations'
import { useStartConversation } from '../../hooks/useStartConversation'
import { useRoleAccess } from '../../hooks/useRoleAccess'

/**
 * ServiceCard
 *
 * Règle anti-réflexivité :
 *  - Un prestataire NE peut PAS se contacter lui-même → bouton "Contacter" masqué
 *  - Un prestataire NE peut PAS se réserver lui-même → bouton "Réserver" masqué
 *
 * La comparaison se fait via backendUserId (Id SQL) vs prestataire.idUtilisateur.
 */
const ServiceCard = ({ prestataire, delay = 0, onReserver }) => {
  const etoiles = Array.from({ length: 5 }, (_, i) => i < Math.round(prestataire.note))
  const { startConversation, isLoading: isStarting } = useStartConversation()
  const { backendUserId, isSignedIn } = useRoleAccess()

  // Vrai si le visiteur connecté EST ce prestataire
  const isSelf = isSignedIn
    && backendUserId
    && String(backendUserId) === String(prestataire.idUtilisateur)

  const handleContact = () => startConversation(prestataire.idUtilisateur, prestataire.nom)

  return (
    <FadeIn delay={delay} className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(21,66,18,1)] group hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(21,66,18,1)] transition-all duration-200">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative flex-shrink-0">
            <img
              alt={prestataire.nom}
              src={prestataire.photo}
              className="w-16 h-16 rounded-full border-4 border-black object-cover"
            />
            {prestataire.certifiee && (
              <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full border-2 border-white flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xs" style={{ fontSize: '14px' }}>verified</span>
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-lg text-primary truncate">{prestataire.nom}</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border-2 border-black flex-shrink-0 ${prestataire.disponible ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-error-container text-on-error-container'}`}>
                {isSelf ? '👤 Vous' : prestataire.disponible ? 'Disponible' : 'Occupé'}
              </span>
            </div>
            <p className="text-sm text-on-surface-variant font-bold">{prestataire.service} • {prestataire.ville}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex">
                {etoiles.map((filled, i) => (
                  <span key={i} className={`text-sm ${filled ? 'text-secondary' : 'text-outline-variant'}`}>★</span>
                ))}
              </div>
              <span className="text-sm font-bold text-on-surface">{prestataire.note}</span>
              <span className="text-xs text-on-surface-variant">({prestataire.avis} avis)</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-on-surface-variant mb-4 leading-relaxed line-clamp-2">{prestataire.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {prestataire.animauxAcceptes.map(a => (
            <span key={a} className="text-xs font-bold bg-surface-variant px-2 py-0.5 border border-black/20 rounded-sm uppercase tracking-tight">{a}</span>
          ))}
        </div>

        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between border-t-2 border-black/10 pt-4 gap-3">
          <div>
            <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-primary">
              {Number(prestataire.prixHeure || 0).toLocaleString('fr-FR')} DZD
            </span>
            <span className="text-sm text-on-surface-variant font-bold"> / h</span>
          </div>

          <div className="flex flex-wrap gap-2 w-full xl:w-auto justify-start xl:justify-end">
            {/* Bouton Profil — toujours visible */}
            <Link
              to={`/prestataire/${prestataire.id}`}
              className="px-4 py-2 font-['Plus_Jakarta_Sans'] font-bold text-sm uppercase tracking-wider border-2 border-black bg-white hover:bg-surface-container transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
            >
              Profil
            </Link>

            {/* Bouton Contacter — masqué si isSelf */}
            {!isSelf && (
              <button
                onClick={handleContact}
                disabled={isStarting}
                title="Envoyer un message"
                className="px-3 py-2 font-bold text-sm border-2 border-black bg-secondary-fixed text-on-secondary-fixed
                  shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none
                  transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStarting
                  ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  : <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chat</span>
                }
                <span className="hidden sm:inline">Contacter</span>
              </button>
            )}

            {/* Bouton Réserver — masqué si isSelf */}
            {!isSelf && (
              <button
                onClick={() => onReserver(prestataire)}
                disabled={!prestataire.disponible}
                className={`px-4 py-2 font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-wider border-2 border-black transition-all
                  ${prestataire.disponible
                    ? 'bg-primary text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                    : 'bg-surface-container text-on-surface-variant cursor-not-allowed opacity-60'
                  }`}
              >
                {prestataire.disponible ? 'Réserver' : 'Indisponible'}
              </button>
            )}
          </div>
        </div>

        {/* Badge "Mon profil" pour le prestataire lui-même */}
        {isSelf && (
          <div className="mt-3 pt-3 border-t-2 border-black/10 flex items-center justify-center gap-2 text-xs font-bold text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">manage_accounts</span>
            C'est votre profil — <Link to="/dashboard" className="text-primary underline">Gérer depuis le Dashboard</Link>
          </div>
        )}
      </div>
    </FadeIn>
  )
}

export default ServiceCard
