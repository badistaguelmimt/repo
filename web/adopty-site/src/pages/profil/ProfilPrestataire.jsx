import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageTransition, FadeIn } from '../../components/Animations'
import Modal from '../../components/ui/Modal'
import ReservationForm from '../../components/forms/ReservationForm'
import AvailabilityCalendar from '../../components/ui/AvailabilityCalendar'
import ReportModal from '../../components/ReportModal'
import { useRequireAuthAction } from '../../hooks/useRequireAuthAction'
import { useRoleAccess } from '../../hooks/useRoleAccess'
import { getDisponibilitesByProfil } from '../../services/publicApi'
import { mapPrestataire } from '../../hooks/usePrestataires'
import { apiRequest } from '../../lib/http'

const StarRating = ({ note, size = 'text-lg' }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`${size} ${i < Math.round(note) ? 'text-secondary' : 'text-black/15'}`}>★</span>
    ))}
  </div>
)

const TYPE_SERVICE_LABELS = {
  1: 'Toilettage',
  2: 'Éducation canine',
  3: 'Pet-sitting',
  4: 'Promenade',
  5: 'Vétérinaire',
}

const ProfilPrestataire = () => {
  const { id } = useParams()
  const [reservationOpen, setReservationOpen] = useState(false)
  const [calendarView, setCalendarView]       = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const { requireAuthAction }                 = useRequireAuthAction()
  const { backendUserId, isSignedIn }         = useRoleAccess()

  // ── Données réelles du prestataire ───────────────────────────────────
  const [prestataire, setPrestataire]       = useState(null)
  const [disponibilites, setDisponibilites] = useState([])
  const [isLoading, setIsLoading]           = useState(true)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)

    // Charger le profil prestataire + ses disponibilités en parallèle
    Promise.allSettled([
      apiRequest(`/api/profil_prestataires/${id}`),
      getDisponibilitesByProfil(id),
    ]).then(([profileResult, dispoResult]) => {
      if (profileResult.status === 'fulfilled' && profileResult.value) {
        setPrestataire(mapPrestataire(profileResult.value))
      }
      if (dispoResult.status === 'fulfilled' && Array.isArray(dispoResult.value)) {
        setDisponibilites(dispoResult.value)
      }
    }).finally(() => setIsLoading(false))
  }, [id])

  const openReservationModal = () => requireAuthAction(() => setReservationOpen(true))

  // Anti-réflexivité : ce prestataire EST l'utilisateur connecté ?
  // On compare via idUtilisateur (clé DB du prestataire) et backendUserId
  const isSelf = isSignedIn
    && backendUserId
    && prestataire
    && String(backendUserId) === String(prestataire.idUtilisateur)

  // Fallback si encore en chargement
  if (isLoading) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 py-24 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-bold text-primary text-sm">Chargement du profil...</p>
          </div>
        </div>
      </PageTransition>
    )
  }

  if (!prestataire) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <span className="material-symbols-outlined text-6xl opacity-20 block mb-4">person_off</span>
          <h2 className="font-['Chewy'] text-3xl text-primary mb-2">Prestataire introuvable</h2>
          <p className="text-on-surface-variant mb-6">Ce profil n'existe pas ou a été supprimé.</p>
          <Link to="/services" className="px-6 py-3 bg-primary text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Retour aux services
          </Link>
        </div>
      </PageTransition>
    )
  }

  const serviceLabel = TYPE_SERVICE_LABELS[prestataire.typeServiceId] ?? prestataire.service ?? 'Service'
  // Nombre de créneaux disponibles
  const nbDisponibles = disponibilites.filter(d => d.Disponibilite).length

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Back */}
        <Link to="/services" className="inline-flex items-center gap-2 mb-8 text-primary font-bold group">
          <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
          <span className="font-['Plus_Jakarta_Sans'] uppercase tracking-wider text-sm">Retour aux services</span>
        </Link>

        {/* Hero card */}
        <FadeIn>
          <div className="bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[10px_10px_0px_0px_rgba(21,66,18,1)] mb-10">
            {/* Header band */}
            <div className="bg-[#154212] px-8 py-6 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl border-4 border-white bg-surface-container overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
                    <img src={prestataire.photo} alt={prestataire.nom} className="w-full h-full object-cover" />
                  </div>
                  {prestataire.certifiee && (
                    <span className="absolute -bottom-2 -right-2 w-7 h-7 bg-secondary rounded-full border-2 border-white flex items-center justify-center shadow">
                      <span className="material-symbols-outlined text-white text-sm" style={{ fontSize: '14px' }}>verified</span>
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h1 className="font-['Chewy'] text-4xl text-white leading-none">{prestataire.nom}</h1>
                    <span className={`text-xs font-black px-3 py-1 rounded-full border-2 border-white/30 uppercase tracking-wider flex-shrink-0
                      ${nbDisponibles > 0 ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-white/10 text-white/60'}`}>
                      {nbDisponibles > 0 ? `● ${nbDisponibles} créneaux dispo` : '○ Indisponible'}
                    </span>
                  </div>
                  <p className="text-white/70 font-['Plus_Jakarta_Sans'] font-bold text-sm">
                    {serviceLabel} · {prestataire.ville}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating note={prestataire.note} />
                    <span className="text-white font-bold text-sm">{Number(prestataire.note).toFixed(1)}</span>
                    {prestataire.avis > 0 && <span className="text-white/50 text-xs">({prestataire.avis} avis)</span>}
                  </div>
                </div>
              </div>

              {/* Price + CTA */}
              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <span className="font-['Chewy'] text-4xl text-white">{Number(prestataire.prixHeure || 0).toLocaleString('fr-FR')} DZD</span>
                  <span className="text-white/60 text-sm font-bold ml-1">/ heure</span>
                </div>
                {isSelf ? (
                  <Link to="/dashboard"
                    className="px-6 py-3 font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-wider border-2 border-white bg-white/20 hover:bg-white/30 text-white transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">manage_accounts</span>
                    Gérer mon profil
                  </Link>
                ) : (
                  <button
                    onClick={openReservationModal}
                    disabled={nbDisponibles === 0}
                    className={`px-6 py-3 font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-wider border-2 border-white transition-all
                      ${nbDisponibles > 0
                        ? 'bg-secondary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                        : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
                  >
                    {nbDisponibles > 0 ? 'Réserver maintenant' : 'Actuellement indisponible'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left column — content */}
          <div className="lg:col-span-8 space-y-10">

            {/* Description */}
            {prestataire.description && (
              <FadeIn>
                <h2 className="font-['Chewy'] text-3xl text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-3xl">person</span>
                  À propos de {prestataire.nom.split(' ')[0]}
                </h2>
                <div className="bg-surface-container-lowest border-l-8 border-secondary p-6 rounded-xl shadow-sm leading-relaxed text-base text-on-surface-variant">
                  {prestataire.description}
                </div>
              </FadeIn>
            )}

            {/* ── Calendrier des disponibilités ── */}
            <FadeIn delay={0.05}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-['Chewy'] text-3xl text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-3xl">calendar_month</span>
                  Disponibilités
                </h2>
                <div className="flex border-2 border-black rounded-lg overflow-hidden">
                  <button
                    onClick={() => setCalendarView(false)}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors flex items-center gap-1 ${
                      !calendarView ? 'bg-primary text-white' : 'bg-white text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">list</span> Liste
                  </button>
                  <button
                    onClick={() => setCalendarView(true)}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors border-l-2 border-black flex items-center gap-1 ${
                      calendarView ? 'bg-primary text-white' : 'bg-white text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">calendar_month</span> Calendrier
                  </button>
                </div>
              </div>

              {disponibilites.length === 0 ? (
                <div className="bg-surface-container-lowest border-2 border-black rounded-xl p-8 text-center">
                  <span className="material-symbols-outlined text-4xl opacity-20 block mb-2">event_busy</span>
                  <p className="text-sm font-bold text-on-surface-variant">Aucune disponibilité renseignée pour le moment.</p>
                </div>
              ) : calendarView ? (
                /* Vue calendrier react-big-calendar — toujours lecture seule sur le profil public */
                <AvailabilityCalendar disponibilites={disponibilites} readOnly />
              ) : (
                /* Vue liste */
                <div className="flex flex-wrap gap-2">
                  {disponibilites.map(d => {
                    const dispo = d.Disponibilite === true || d.Disponibilite === 1 || d.Disponibilite === '1'
                    const debut = d.DateDebut ? new Date(d.DateDebut).toLocaleString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '?'
                    const fin   = d.DateFin   ? new Date(d.DateFin).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '?'
                    return (
                      <span key={d.Id} className={`flex items-center gap-2 px-4 py-2 border-2 border-black rounded-full text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                        dispo ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800 opacity-60'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${dispo ? 'bg-green-600' : 'bg-red-500'}`} />
                        {debut} → {fin}
                        {d.Recurrence && d.Recurrence !== 'Aucune' && (
                          <span className="opacity-50 text-xs">↻ {d.Recurrence}</span>
                        )}
                      </span>
                    )
                  })}
                </div>
              )}
            </FadeIn>
          </div>

          {/* Right sidebar */}
          <aside className="lg:col-span-4 space-y-6">

            {/* Infos pratiques */}
            <FadeIn>
              <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(21,66,18,1)] space-y-4">
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold uppercase text-sm tracking-widest text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">info</span>
                  Informations pratiques
                </h3>
                {[
                  { icon: 'location_on',  label: 'Zone d\'intervention', value: prestataire.ville || 'N/A' },
                  { icon: 'work_history', label: 'Expérience',           value: `${prestataire.experience || 0} an(s)` },
                  { icon: 'star',         label: 'Note moyenne',         value: `${Number(prestataire.note || 0).toFixed(1)} / 5` },
                  { icon: 'payments',     label: 'Tarif horaire',        value: `${Number(prestataire.prixHeure || 0).toLocaleString('fr-FR')} DZD/h` },
                  { icon: 'event_available', label: 'Créneaux disponibles', value: `${nbDisponibles} créneau(x)` },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-lg mt-0.5 flex-shrink-0">{icon}</span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{label}</p>
                      <p className="font-bold text-sm">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* CTA block — masqué si c'est le profil du prestataire connecté */}
            <FadeIn delay={0.1}>
              {isSelf ? (
                <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(21,66,18,1)] text-center space-y-3">
                  <span className="material-symbols-outlined text-4xl text-primary block">manage_accounts</span>
                  <p className="font-['Chewy'] text-2xl text-primary">C'est votre profil</p>
                  <p className="text-sm text-on-surface-variant">Gérez vos disponibilités, réservations et tarifs depuis votre tableau de bord.</p>
                  <Link to="/dashboard"
                    className="block w-full py-3 bg-primary text-white font-extrabold uppercase tracking-widest text-sm border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                    Accéder au Dashboard →
                  </Link>
                </div>
              ) : (
                <div className="bg-[#154212] text-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(254,158,114,1)] space-y-4">
                  <h3 className="font-['Chewy'] text-2xl">Réserver {prestataire.nom.split(' ')[0]}</h3>
                  <ul className="space-y-3">
                    {['Confirmation rapide', 'Annulation gratuite 24h avant', 'Compte-rendu par message'].map((step, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-secondary-fixed text-base">check_circle</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={openReservationModal}
                    disabled={nbDisponibles === 0}
                    className={`w-full py-3 font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-wider border-2 border-white transition-all
                      ${nbDisponibles > 0
                        ? 'bg-secondary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                        : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
                  >
                    {nbDisponibles > 0 ? 'Réserver →' : 'Indisponible'}
                  </button>
                </div>
              )}
            </FadeIn>

            {/* Bouton Signaler (uniquement si pas le sien) */}
            {!isSelf && (
              <FadeIn delay={0.2}>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="flex items-center gap-2 justify-center w-full px-5 py-3 bg-[#ba1a1a] text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all font-['Plus_Jakarta_Sans'] font-bold text-sm rounded-lg mt-4"
                >
                  <span className="material-symbols-outlined text-base">warning</span>
                  Signaler ce profil
                </button>
              </FadeIn>
            )}
          </aside>
        </div>
      </div>

      {/* Modal réservation */}
      <Modal
        isOpen={reservationOpen}
        onClose={() => setReservationOpen(false)}
        title={`Réserver — ${prestataire.nom}`}
        size="md"
      >
        <ReservationForm prestataire={prestataire} onClose={() => setReservationOpen(false)} />
      </Modal>

      {prestataire && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          targetType="prestataire"
          targetId={prestataire.idUtilisateur}
          targetName={prestataire.nom}
        />
      )}
    </PageTransition>
  )
}

export default ProfilPrestataire
