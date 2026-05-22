import { useEffect, useMemo, useState, useCallback } from 'react'
import { PageTransition, FadeIn } from '../components/Animations'
import { getMyPrestataireProfile, getMyPrestataireReservations, updateReservationStatusAsPrestataire, deleteDisponibilite, getDisponibilitesByProfil } from '../services/authApi'
import { normalizeApiError } from '../lib/http'
import { useRoleAccess } from '../hooks/useRoleAccess'
import Modal from '../components/ui/Modal'
import PrestataireProfileForm from '../components/forms/PrestataireProfileForm'
import AvailabilityForm from '../components/forms/AvailabilityForm'
import AvailabilityCalendar from '../components/ui/AvailabilityCalendar'

const toCurrency = (value) => `${Number(value || 0).toLocaleString('fr-FR')} DZD`

const toDateLabel = (value) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'N/A'
  return parsed.toLocaleDateString('fr-FR')
}

const STATUS_MAP = {
  'En attente': { label: 'En attente', cls: 'bg-surface-container text-on-surface' },
  'Confirmée': { label: 'Confirmée', cls: 'bg-tertiary-fixed text-on-tertiary-fixed' },
  'En cours': { label: 'En cours', cls: 'bg-secondary-fixed text-on-secondary-fixed' },
  'Terminée': { label: 'Terminée', cls: 'bg-primary-fixed text-on-primary-fixed-variant' },
  'Annulée': { label: 'Annulée', cls: 'bg-error-container text-on-error-container' },
}

const getStatusStyle = (statut) => STATUS_MAP[statut] || { label: statut || 'Inconnu', cls: 'bg-surface-container' }

// Labels correspondant aux IDs de la table `type_service` en DB
const TYPE_SERVICE_LABELS = {
  1: 'Toilettage',
  2: 'Éducation canine',
  3: 'Pet-sitting',
  4: 'Promenade',
  5: 'Vétérinaire',
}

const PrestataireDashboard = () => {
  const { backendUserId } = useRoleAccess()
  const [isLoading, setIsLoading] = useState(true)
  const [apiIssues, setApiIssues] = useState([])
  const [myProfile, setMyProfile] = useState(null)
  const [myReservations, setMyReservations] = useState([])
  // Créneaux de disponibilité réels chargés depuis la BDD
  const [myDisponibilites, setMyDisponibilites] = useState([])

  // Vue calendrier / liste pour les disponibilités
  const [calView, setCalView] = useState('calendrier')

  // Modales
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isAvailModalOpen, setIsAvailModalOpen] = useState(false)
  const [editingAvail, setEditingAvail] = useState(null)

  // Ouvre le formulaire pré-rempli avec le créneau sélectionné dans le calendrier
  const handleSlotSelected = useCallback((slotInfo) => {
    setEditingAvail({
      DateDebut: slotInfo.start.toISOString(),
      DateFin: slotInfo.end.toISOString(),
    })
    setIsAvailModalOpen(true)
  }, [])

  const loadData = useCallback(async () => {
    if (!backendUserId) return
    setIsLoading(true)
    const issues = []

    const [profileResult, reservationsResult] = await Promise.allSettled([
      getMyPrestataireProfile(),
      getMyPrestataireReservations(),
    ])

    if (profileResult.status === 'fulfilled') {
      const profile = profileResult.value
      setMyProfile(profile)
      // Dès que le profil est connu, on charge les vraies disponibilités
      if (profile?.Id) {
        getDisponibilitesByProfil(profile.Id)
          .then(dispos => setMyDisponibilites(Array.isArray(dispos) ? dispos : []))
          .catch(() => setMyDisponibilites([]))
      }
    } else {
      issues.push('Profil prestataire')
      normalizeApiError(profileResult.reason)
    }

    if (reservationsResult.status === 'fulfilled') {
      setMyReservations(Array.isArray(reservationsResult.value) ? reservationsResult.value : [])
    } else {
      issues.push('Réservations')
      normalizeApiError(reservationsResult.reason)
    }

    setApiIssues(issues)
    setIsLoading(false)
  }, [backendUserId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const stats = useMemo(() => ({
    total: myReservations.length,
    enAttente: myReservations.filter(r => r.Statut === 'En attente').length,
    terminees: myReservations.filter(r => r.Statut === 'Terminée').length,
    revenu: myReservations
      .filter(r => r.Statut === 'Terminée')
      .reduce((sum, r) => sum + Number(r.PrixFinal ?? 0), 0),
  }), [myReservations])

  const handleUpdateStatus = async (id, statut) => {
    try {
      await updateReservationStatusAsPrestataire(id, statut)
      loadData()
    } catch {
      alert('Erreur lors de la mise à jour du statut')
    }
  }

  const handleDeleteAvail = async (id) => {
    if (!window.confirm('Supprimer cette disponibilité ?')) return
    try {
      await deleteDisponibilite(id)
      // Mise à jour locale sans recharger toute la page
      setMyDisponibilites(prev => prev.filter(d => d.Id !== id))
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  const openAddAvail = () => { setEditingAvail(null); setIsAvailModalOpen(true) }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* En-tête */}
        <div>
          {apiIssues.length > 0 && (
            <div className="inline-block px-3 py-1 bg-[#fff1c2] text-[#7a4a00] border-2 border-black font-bold text-[10px] uppercase tracking-wider mb-3">
              ⚠ Sources indisponibles: {apiIssues.join(', ')}
            </div>
          )}
          <h1 className="font-['Chewy'] text-5xl text-primary">Dashboard Prestataire</h1>
          <p className="text-on-surface-variant mt-2">
            Gérez votre profil, vos disponibilités et suivez vos réservations en temps réel.
          </p>
        </div>

        {isLoading && (
          <FadeIn className="flex items-center gap-3 px-4 py-3 bg-surface-container-lowest border-2 border-black rounded-xl">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-primary">Chargement des données...</p>
          </FadeIn>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Réservations', value: stats.total, color: 'text-primary' },
            { label: 'En attente', value: stats.enAttente, color: 'text-secondary' },
            { label: 'Terminées', value: stats.terminees, color: 'text-primary' },
            { label: 'Revenu total', value: toCurrency(stats.revenu), color: 'text-tertiary', small: true },
          ].map(({ label, value, color, small }) => (
            <div key={label} className="bg-surface-container-lowest border-4 border-black rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs uppercase font-bold text-on-surface-variant">{label}</p>
              <p className={`font-['Chewy'] ${small ? 'text-2xl' : 'text-4xl'} ${color} mt-2`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Mon profil prestataire */}
        <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="px-6 py-4 border-b-4 border-black bg-surface-container flex items-center justify-between">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">badge</span>
              Mon profil prestataire
            </h2>
            {myProfile && (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="px-4 py-2 bg-primary text-white border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
              >
                Éditer
              </button>
            )}
          </div>
          <div className="p-6">
            {!myProfile ? (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">badge</span>
                <p className="text-sm font-bold text-on-surface-variant mb-4">
                  Aucun profil prestataire lié à ce compte.
                </p>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="px-6 py-3 bg-primary text-white border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  Créer mon profil
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-black rounded-xl p-4 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-lg text-primary">
                      {TYPE_SERVICE_LABELS[myProfile.TypeService] || `Service #${myProfile.TypeService}`}
                    </p>
                    <span className="px-2 py-0.5 bg-primary-fixed text-xs font-extrabold border border-black rounded-full">
                      ★ {Number(myProfile.NoteMoyenne || 0).toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant">{myProfile.ZoneIntervention}</p>
                  <p className="text-sm font-extrabold text-primary">
                    {Number(myProfile.TarifHoraire || 0).toLocaleString('fr-FR')} DZD / heure
                  </p>
                  {myProfile.Bio && (
                    <p className="text-sm text-on-surface-variant border-t border-outline-variant pt-2 mt-2">
                      {myProfile.Bio}
                    </p>
                  )}
                </div>
                <div className="border-2 border-black rounded-xl p-4 bg-white space-y-2">
                  <p className="font-extrabold text-sm uppercase tracking-wider text-on-surface-variant">Infos complémentaires</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-base text-primary">work</span>
                    <span>{myProfile.Experience || 0} année(s) d'expérience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-base text-primary">star</span>
                    <span>Note moyenne : {Number(myProfile.NoteMoyenne || 0).toFixed(1)} / 5</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-base text-primary">event_available</span>
                    <span>{stats.terminees} mission(s) terminée(s)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </FadeIn>

        {/* Disponibilités — vue tabulée Calendrier / Liste */}
        <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          {/* En-tête avec onglets */}
          <div className="px-6 py-4 border-b-4 border-black bg-surface-container flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">schedule</span>
              Mes disponibilités
              <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full border border-black">
                {myDisponibilites.length}
              </span>
            </h2>
            <div className="flex items-center gap-2">
              {/* Onglets vue */}
              <div className="flex border-2 border-black rounded-lg overflow-hidden">
                <button
                  onClick={() => setCalView('calendrier')}
                  className={`px-3 py-1.5 text-xs font-bold transition-colors flex items-center gap-1 ${
                    calView === 'calendrier' ? 'bg-primary text-white' : 'bg-white text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">calendar_month</span> Calendrier
                </button>
                <button
                  onClick={() => setCalView('liste')}
                  className={`px-3 py-1.5 text-xs font-bold transition-colors border-l-2 border-black flex items-center gap-1 ${
                    calView === 'liste' ? 'bg-primary text-white' : 'bg-white text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">list</span> Liste
                </button>
              </div>
              <button
                onClick={openAddAvail}
                className="px-4 py-2 bg-secondary text-white border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
              >
                + Ajouter
              </button>
            </div>
          </div>

          <div className="p-4">
            {calView === 'calendrier' ? (
              /* ─── Vue Calendrier react-big-calendar ─── */
              <AvailabilityCalendar
                disponibilites={myDisponibilites}
                onSlotClick={handleSlotSelected}
                onEventClick={(event) => {
                  setEditingAvail(event.resource)
                  setIsAvailModalOpen(true)
                }}
              />
            ) : (
              /* ─── Vue Liste ─── */
              <>
                <p className="text-xs font-bold text-on-surface-variant italic mb-4">
                  Définissez vos créneaux pour que les clients puissent réserver vos services.
                </p>
                {myDisponibilites.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">
                    Aucune disponibilité enregistrée. Cliquez sur « + Ajouter » pour commencer.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {myDisponibilites.map(dispo => {
                      const debut = dispo.DateDebut
                        ? new Date(dispo.DateDebut).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                        : '?'
                      const fin = dispo.DateFin
                        ? new Date(dispo.DateFin).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                        : '?'
                      const isAvailable = dispo.Disponibilite
                      return (
                        <span
                          key={dispo.Id}
                          className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black rounded-full text-xs font-bold ${
                            isAvailable ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isAvailable ? 'bg-green-600' : 'bg-red-600'}`} />
                          {debut} → {fin}
                          {dispo.Recurrence && <span className="opacity-60 ml-1 text-[10px]">↻ {dispo.Recurrence}</span>}
                          <button
                            onClick={() => handleDeleteAvail(dispo.Id)}
                            className="ml-1 hover:opacity-60 transition-opacity"
                            title="Supprimer ce créneau"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </FadeIn>

        {/* Activité Réservations */}
        <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="px-6 py-4 border-b-4 border-black bg-surface-container">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">event</span>
              Mes réservations ({myReservations.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead className="bg-surface-container border-b-2 border-black">
              <tr>
                {['ID', 'Client', 'Service', 'Date début', 'Date fin', 'Statut', 'Montant', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-['Plus_Jakarta_Sans'] font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {myReservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">event_busy</span>
                    <p className="font-bold text-sm">Aucune réservation pour le moment.</p>
                    <p className="text-xs mt-1">Les clients peuvent réserver depuis la page Services.</p>
                  </td>
                </tr>
              ) : (
                myReservations.map((r, idx) => {
                  const statutLabel = r.StatutLabel ?? r.Statut ?? 'Inconnu'
                  const { label, cls } = getStatusStyle(statutLabel)
                  const serviceLabel = r.TypeServiceLabel ?? TYPE_SERVICE_LABELS[r.TypeService] ?? `#${r.TypeService}`
                  return (
                    <tr key={r.Id ? `res-${r.Id}` : `res-idx-${idx}`} className="hover:bg-surface-container transition-colors">
                      <td className="px-4 py-4 font-mono font-bold text-on-surface-variant text-xs">
                        #{String(r.Id).padStart(4, '0')}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-bold text-sm">{r.UtilisateurPrenom} {r.UtilisateurNom}</p>
                        {r.UtilisateurEmail && <p className="text-xs text-on-surface-variant">{r.UtilisateurEmail}</p>}
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 bg-primary-fixed text-xs font-bold border border-black rounded-full">{serviceLabel}</span>
                      </td>
                      <td className="px-4 py-4 text-on-surface-variant text-sm">{toDateLabel(r.DateDebut)}</td>
                      <td className="px-4 py-4 text-on-surface-variant text-sm">{toDateLabel(r.DateFin)}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-black ${cls}`}>
                          {label}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-extrabold text-primary">{toCurrency(r.PrixFinal)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          {statutLabel === 'En attente' && (
                            <>
                              <button onClick={() => handleUpdateStatus(r.Id, 'Confirmée')} className="p-1.5 border border-black bg-primary text-white rounded transition-colors" title="Confirmer">
                                <span className="material-symbols-outlined text-base">check_circle</span>
                              </button>
                              <button onClick={() => handleUpdateStatus(r.Id, 'Annulée')} className="p-1.5 border border-black bg-error text-white rounded transition-colors" title="Annuler">
                                <span className="material-symbols-outlined text-base">cancel</span>
                              </button>
                            </>
                          )}
                          {statutLabel === 'Confirmée' && (
                            <button onClick={() => handleUpdateStatus(r.Id, 'En cours')} className="px-2 py-1 border border-black bg-secondary-fixed font-bold text-[10px] uppercase rounded">
                              Démarrer
                            </button>
                          )}
                          {statutLabel === 'En cours' && (
                            <button onClick={() => handleUpdateStatus(r.Id, 'Terminée')} className="px-2 py-1 border border-black bg-primary-fixed font-bold text-[10px] uppercase rounded">
                              Terminer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          </div>
        </FadeIn>

        {/* Modale profil */}
        <Modal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          title={myProfile ? 'Modifier mon profil' : 'Créer mon profil prestataire'}
          size="lg"
        >
          <PrestataireProfileForm
            initialData={myProfile}
            onClose={() => setIsProfileModalOpen(false)}
            onSuccess={loadData}
          />
        </Modal>

        {/* Modale disponibilités */}
        <Modal
          isOpen={isAvailModalOpen}
          onClose={() => setIsAvailModalOpen(false)}
          title="Gérer mes disponibilités"
          size="lg"
        >
          <AvailabilityForm
            initialData={editingAvail}
            profilId={myProfile?.Id}
            onClose={() => setIsAvailModalOpen(false)}
            onSuccess={loadData}
          />
        </Modal>
      </div>
    </PageTransition>
  )
}

export default PrestataireDashboard
