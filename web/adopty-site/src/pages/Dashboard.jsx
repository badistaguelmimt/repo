import { useEffect, useState } from 'react'
import { PageTransition, FadeIn } from '../components/Animations'
import StatCard from '../components/ui/StatCard'
import { adoptionsMensuelles } from '../data/mockData'
import { getAnimaux, getAnnonces, getPrestataires, getRefuges, getSignalements } from '../services/publicApi'
import { verifyRefuge, resolveSignalement, getAllUsers, banUser, deleteAnimal, updateAnimal, getAdminStats } from '../services/authApi'
import { mapAnimals } from '../hooks/useAnimal'
import { mapCommandes } from '../hooks/useCommandes'
import { mapPrestataires } from '../hooks/usePrestataires'
import { normalizeApiError, apiAuthRequest } from '../lib/http'
import Modal from '../components/ui/Modal'
import AnimalForm from '../components/forms/AnimalForm'

const NAV_ITEMS = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: 'dashboard' },
  { id: 'animaux', label: 'Animaux', icon: 'pets' },
  { id: 'commandes', label: 'Commandes', icon: 'shopping_bag' },
  { id: 'signalements', label: 'Signalements', icon: 'report' },
  { id: 'prestataires', label: 'Prestataires', icon: 'handshake' },
  { id: 'refuges', label: 'Refuges à valider', icon: 'verified_user' },
  { id: 'utilisateurs', label: 'Utilisateurs', icon: 'group' },
]

const StatutBadge = ({ statut }) => {
  const statusKey = String(statut ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  let colorClass = 'bg-surface-container text-on-surface'
  if (statusKey.includes('livr')) colorClass = 'bg-primary-fixed text-on-primary-fixed-variant'
  if (statusKey.includes('cours') || statusKey.includes('traitement')) colorClass = 'bg-secondary-fixed text-on-secondary-fixed'
  if (statusKey.includes('attente')) colorClass = 'bg-tertiary-fixed text-on-tertiary-fixed'
  if (statusKey.includes('resolu')) colorClass = 'bg-primary-fixed text-on-primary-fixed-variant'
  if (statusKey.includes('annul')) colorClass = 'bg-error-container text-on-error-container'
  if (statusKey.includes('actif')) colorClass = 'bg-primary-fixed text-on-primary-fixed-variant'
  if (statusKey.includes('indisponible')) colorClass = 'bg-surface-container-high text-on-surface'

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-black ${colorClass}`}>
      {statut}
    </span>
  )
}

const TableEmptyState = ({ colSpan, icon = 'inbox', message = 'Aucune donnee disponible.' }) => (
  <tr>
    <td colSpan={colSpan} className="px-5 py-10 text-center text-on-surface-variant">
      <span className="material-symbols-outlined text-5xl mb-2 block opacity-30">{icon}</span>
      <p className="font-bold text-sm">{message}</p>
    </td>
  </tr>
)

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [animauxData, setAnimauxData] = useState([])
  const [commandesData, setCommandesData] = useState([])
  const [signalementsData, setSignalementsData] = useState([])
  const [prestatairesData, setPrestatairesData] = useState([])
  const [refugesData, setRefugesData] = useState([])
  const [usersData, setUsersData] = useState([])
  const [dashboardStats, setDashboardStats] = useState({
    animauxTotal: 0, animauxUrgent: 0, adoptionsMois: 0, adoptionsTotal: 0,
    caBoutique: 0, commandesEnAttente: 0, signalementsMois: 0, signalementsTotal: 0,
    prestatairesActifs: 0, utilisateurs: 0,
  })

  // États pour l'édition Admin
  const [editingAnimal, setEditingAnimal] = useState(null)
  const [isAnimalModalOpen, setIsAnimalModalOpen] = useState(false)
  // Données brutes des annonces pour le graphique mensuel
  const [annoncesRaw, setAnnoncesRaw] = useState([])

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true)
      try {
        // Chargement parallèle : stats réelles + listes pour les tableaux
        const [statsRes, animauxRes, signalementsRes, prestatairesRes, refugesRes, commandesRes, usersRes, annoncesRes] =
          await Promise.allSettled([
            getAdminStats(),
            getAnimaux(),
            getSignalements(),
            getPrestataires(),
            getRefuges(),
            apiAuthRequest({ url: '/api/checkout/all-orders', method: 'get' }),
            getAllUsers(),
            getAnnonces(),
          ])

        const toArray = (result) =>
          result.status === 'fulfilled' && Array.isArray(result.value) ? result.value : []

        // Stats réelles depuis l'endpoint dédié
        if (statsRes.status === 'fulfilled' && statsRes.value) {
          const s = statsRes.value
          setDashboardStats({
            animauxTotal:       s.animauxTotal        ?? 0,
            animauxUrgent:      s.animauxUrgent       ?? 0,
            adoptionsMois:      s.adoptionsMois       ?? 0,
            adoptionsTotal:     s.adoptionsTotal      ?? 0,
            caBoutique:         s.caBoutique          ?? 0,
            commandesEnAttente: s.commandesEnAttente  ?? 0,
            signalementsMois:   s.signalementsEnAttente ?? 0,
            signalementsTotal:  s.signalementsTotal   ?? 0,
            prestatairesActifs: s.prestatairesActifs  ?? 0,
            utilisateurs:       s.utilisateurs        ?? 0,
          })
        }

        // Données pour les tableaux
        const mappedAnimaux     = mapAnimals(toArray(animauxRes))
        const mappedCommandes   = mapCommandes(toArray(commandesRes))
        const mappedPrestataires = mapPrestataires(toArray(prestatairesRes))
        const allAnnonces       = toArray(annoncesRes)
        setAnnoncesRaw(allAnnonces)

        setAnimauxData(mappedAnimaux)
        setCommandesData(mappedCommandes)
        setSignalementsData(toArray(signalementsRes))
        setPrestatairesData(mappedPrestataires)
        setRefugesData(toArray(refugesRes))
        setUsersData(toArray(usersRes))

      } catch (err) {
        normalizeApiError(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const handleVerifyRefuge = async (id, status) => {
    try {
      await verifyRefuge(id, status)
      // Recharger tout pour simplifier ou juste mettre a jour l'etat local
      setRefugesData(prev => prev.map(r => r.Id === id ? { ...r, stripeAccountStatus: status } : r))
    } catch (err) {
      alert('Erreur lors de la validation du refuge')
    }
  }

  const handleResolveSignalement = async (id, status) => {
    try {
      await resolveSignalement(id, status)
      setSignalementsData(prev => prev.map(s => s.Id === id ? { ...s, Statut: status } : s))
    } catch (err) {
      alert('Erreur lors de la resolution du signalement')
    }
  }

  const handleBanUser = async (id) => {
    if (!window.confirm('Voulez-vous vraiment bannir cet utilisateur ?')) return
    try {
      await banUser(id)
      setUsersData(prev => prev.map(u => u.Id === id ? { ...u, stripeAccountStatus: 'banned' } : u))
    } catch (err) {
      alert('Erreur lors du bannissement')
    }
  }

  /** Ouvre la modale pour AJOUTER un nouvel animal (mode création) */
  const openAddAnimal = () => {
    setEditingAnimal(null)
    setIsAnimalModalOpen(true)
  }

  const openEditAnimal = (animal) => {
    setEditingAnimal(animal)
    setIsAnimalModalOpen(true)
  }

  /**
   * Supprime un animal (admin).
   * Appelle DELETE /api/animaux/:id via deleteAnimal() de authApi.
   */
  const handleDeleteAnimalAdmin = async (id) => {
    if (!window.confirm('Supprimer définitivement cet animal ?')) return
    try {
      await deleteAnimal(id)
      setAnimauxData(prev => prev.filter(a => a.id !== id))
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  /**
   * Marque un animal comme adopté.
   * Appelle PUT /api/animaux/:id avec { Statut: 'Adopté' }.
   */
  const handleMarkAdopted = async (animal) => {
    if (!window.confirm(`Marquer ${animal.nom} comme adopté ?`)) return
    try {
      await updateAnimal(animal.id, { Statut: 'Adopté' })
      setAnimauxData(prev => prev.map(a => a.id === animal.id ? { ...a, statut: 'Adopté', urgent: false } : a))
    } catch {
      alert('Erreur lors de la mise à jour')
    }
  }

  const handleAnimalSuccess = () => {
    setIsAnimalModalOpen(false)
    setEditingAnimal(null)
    window.location.reload()
  }

  /**
   * Calcule un graphique mensuel à partir des vraies annonces (12 derniers mois).
   * Si pas de données réelles, retourne les données mock.
   */
  const computedAdoptionChart = (() => {
    if (annoncesRaw.length === 0) return adoptionsMensuelles
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
      const mois = d.toLocaleDateString('fr-FR', { month: 'short' })
      const count = annoncesRaw.filter(a => {
        const date = new Date(a.DateCreation ?? a.CreatedAt ?? '')
        return date.getFullYear() === d.getFullYear() && date.getMonth() === d.getMonth()
      }).length
      return { mois, count: count || 0 }
    })
  })()

  const maxAdoptions = Math.max(...computedAdoptionChart.map(m => m.count), 1)

  return (
    <PageTransition>
      <div className="flex min-h-screen bg-surface-container-low">
        {/* Sidebar */}
        <aside className="w-64 bg-primary border-r-4 border-black flex-shrink-0 hidden md:flex flex-col">
          <div className="p-6 border-b-4 border-black/20">
            <p className="font-['Chewy'] text-3xl text-white mb-1">Adopty</p>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Tableau de bord Admin</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-['Plus_Jakarta_Sans'] font-bold text-sm transition-all
                  ${activeSection === item.id
                    ? 'bg-white text-primary shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t-4 border-black/20">
            <div className="flex items-center gap-3 px-3 py-3">
              <div className="w-9 h-9 bg-secondary rounded-full border-2 border-white flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-lg">admin_panel_settings</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm">Admin</p>
                <p className="text-white/50 text-xs">admin@adopty.fr</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-x-hidden">
          {/* Top bar */}
          <div className="bg-[#fbfbe2] border-b-4 border-black px-8 py-5 flex items-center justify-between sticky top-0 z-30">
            <div>
              <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-primary">
                {NAV_ITEMS.find(n => n.id === activeSection)?.label || 'Dashboard'}
              </h1>
              <p className="text-xs text-on-surface-variant font-bold">Aujourd'hui : {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-surface-container font-bold text-sm hover:bg-surface-variant transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="material-symbols-outlined text-lg">download</span> Export CSV
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-tertiary text-white font-bold text-sm hover:opacity-90 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="material-symbols-outlined text-lg">picture_as_pdf</span> Export PDF
              </button>
            </div>
          </div>


          <div className="p-8">
            {isLoading && (
              <FadeIn className="mb-6 flex items-center gap-3 px-4 py-3 bg-surface-container-lowest border-2 border-black rounded-xl">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-primary">Chargement des donnees dashboard...</p>
              </FadeIn>
            )}

            {/* VUE D'ENSEMBLE */}
            {activeSection === 'overview' && (
              <div className="space-y-8">
                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  <StatCard icon="pets" label="Animaux en refuge" value={dashboardStats.animauxTotal} sub={`${dashboardStats.animauxUrgent} urgents`} color="primary" delay={0} />
                  <StatCard icon="favorite" label="Adoptions ce mois" value={dashboardStats.adoptionsMois} sub={`Total: ${dashboardStats.adoptionsTotal}`} color="secondary" delay={0.1} />
                  <StatCard icon="shopping_bag" label="CA Boutique (EUR)" value={`${dashboardStats.caBoutique.toLocaleString()} EUR`} sub={`${dashboardStats.commandesEnAttente} en attente`} color="tertiary" delay={0.2} />
                  <StatCard icon="report" label="Signalements" value={dashboardStats.signalementsMois} sub={`Total: ${dashboardStats.signalementsTotal}`} color="surface" delay={0.3} />
                </div>

                {/* Graphique adoptions */}
                <FadeIn delay={0.2} className="bg-surface-container-lowest border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(21,66,18,1)]">
                  <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-primary mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined">bar_chart</span>
                    Adoptions mensuelles
                  </h2>
                  {/* Graphique adoptions — données réelles si dispo, sinon mock */}
                  <div className="flex items-end gap-4 h-40">
                    {computedAdoptionChart.map((m, i) => (
                      <div key={m.mois} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-sm font-extrabold text-primary">{m.count}</span>
                        <div
                          className="w-full border-2 border-black transition-all duration-700"
                          style={{
                            height: `${(m.count / maxAdoptions) * 100}%`,
                            background: i === computedAdoptionChart.length - 1 ? '#154212' : '#a1d494',
                          }}
                        />
                        <span className="text-xs font-bold text-on-surface-variant">{m.mois}</span>
                      </div>
                    ))}
                  </div>
                </FadeIn>

                {/* Tables rapides */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Commandes recentes */}
                  <FadeIn delay={0.3} className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="px-6 py-4 border-b-4 border-black bg-surface-container flex items-center justify-between">
                      <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">receipt_long</span>
                        Commandes recentes
                      </h3>
                      <button onClick={() => setActiveSection('commandes')} className="text-xs font-bold text-secondary hover:underline">Voir tout -&gt;</button>
                    </div>
                    <div className="divide-y divide-outline-variant">
                      {commandesData.length === 0 ? (
                        <div className="px-6 py-8 text-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">receipt_long</span>
                          <p className="font-bold text-sm">Aucune commande a afficher.</p>
                        </div>
                      ) : (
                        commandesData.slice(0, 3).map(cmd => (
                          <div key={cmd.id} className="px-6 py-3 flex items-center justify-between gap-3">
                            <div>
                              <p className="font-bold text-sm">{cmd.client}</p>
                              <p className="text-xs text-on-surface-variant">{cmd.produit}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-extrabold text-sm text-primary">{cmd.montant.toFixed(2)} EUR</p>
                              <StatutBadge statut={cmd.statut} />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </FadeIn>

                  {/* Signalements */}
                  <FadeIn delay={0.4} className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="px-6 py-4 border-b-4 border-black bg-surface-container flex items-center justify-between">
                      <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl">report</span>
                        Signalements recents
                      </h3>
                      <button onClick={() => setActiveSection('signalements')} className="text-xs font-bold text-secondary hover:underline">Voir tout -&gt;</button>
                    </div>
                    <div className="divide-y divide-outline-variant">
                      {signalementsData.slice(0, 3).map((sig, idx) => (
                        <div key={sig.id || idx} className="px-6 py-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-sm">{sig.animal || sig.TypeCible || 'Signalement'}</p>
                            <p className="text-xs text-on-surface-variant">{sig.lieu || sig.Raison || 'Non renseigne'}</p>
                          </div>
                          <StatutBadge statut={sig.statut || sig.Statut || 'En traitement'} />
                        </div>
                      ))}
                    </div>
                  </FadeIn>
                </div>
              </div>
            )}

            {/* SECTION ANIMAUX */}
            {activeSection === 'animaux' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-on-surface-variant font-bold">{animauxData.length} animaux enregistres</p>
                  <button
                    onClick={openAddAnimal}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white border-2 border-black font-bold text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                    <span className="material-symbols-outlined text-xl">add</span> Ajouter un animal
                  </button>
                </div>
                <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-container border-b-4 border-black">
                      <tr>
                        {['Animal', 'Espece', 'Age', 'Statut', 'En refuge depuis', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-3 text-left font-['Plus_Jakarta_Sans'] font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {animauxData.length === 0 ? (
                        <TableEmptyState colSpan={6} icon="pets" message="Aucun animal enregistre." />
                      ) : (
                        animauxData.map(a => (
                          <tr key={a.id} className="hover:bg-surface-container transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <img src={a.photo} alt={a.nom} className="w-10 h-10 rounded-full object-cover border-2 border-black" />
                                <div>
                                  <p className="font-bold">{a.nom}</p>
                                  <p className="text-xs text-on-surface-variant">{a.ref}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 font-bold">{a.espece}</td>
                            <td className="px-5 py-4">{a.ageLabel}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border border-black ${a.urgent ? 'bg-error-container text-on-error-container' : 'bg-primary-fixed text-on-primary-fixed-variant'}`}>
                                {a.urgent ? 'Urgent' : 'En attente'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-on-surface-variant">{a.joursRefuge} jours</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                              {/* Éditer l'animal */}
                                <button 
                                  onClick={() => openEditAnimal(a)}
                                  className="p-1.5 border border-black hover:bg-surface-container rounded transition-colors" 
                                  title="Editer"
                                >
                                  <span className="material-symbols-outlined text-base">edit</span>
                                </button>
                                {/* Marquer comme adopté */}
                                <button
                                  onClick={() => handleMarkAdopted(a)}
                                  className="p-1.5 border border-black hover:bg-primary-fixed rounded transition-colors text-primary"
                                  title="Marquer adopté"
                                >
                                  <span className="material-symbols-outlined text-base">check_circle</span>
                                </button>
                                {/* Supprimer définitivement */}
                                <button
                                  onClick={() => handleDeleteAnimalAdmin(a.id)}
                                  className="p-1.5 border border-black hover:bg-error-container rounded transition-colors text-error"
                                  title="Supprimer"
                                >
                                  <span className="material-symbols-outlined text-base">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </FadeIn>
              </div>
            )}

            {/* SECTION COMMANDES */}
            {activeSection === 'commandes' && (
              <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <table className="w-full text-sm">
                  <thead className="bg-surface-container border-b-4 border-black">
                    <tr>
                      {['ID', 'Client', 'Produit', 'Montant', 'Statut', 'Date'].map(h => (
                        <th key={h} className="px-5 py-4 text-left font-['Plus_Jakarta_Sans'] font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {commandesData.length === 0 ? (
                      <TableEmptyState colSpan={6} icon="receipt_long" message="Aucune commande disponible." />
                    ) : (
                      commandesData.map(cmd => (
                        <tr key={cmd.id} className="hover:bg-surface-container transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-on-surface-variant">{cmd.id}</td>
                          <td className="px-5 py-4 font-bold">{cmd.client}</td>
                          <td className="px-5 py-4 text-on-surface-variant">{cmd.produit}</td>
                          <td className="px-5 py-4 font-extrabold text-primary">{cmd.montant.toFixed(2)} EUR</td>
                          <td className="px-5 py-4"><StatutBadge statut={cmd.statut} /></td>
                          <td className="px-5 py-4 text-on-surface-variant">{cmd.date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </FadeIn>
            )}

            {/* SECTION SIGNALEMENTS */}
            {activeSection === 'signalements' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-on-surface-variant font-bold text-sm">
                    {signalementsData.length} signalement(s) au total —{' '}
                    <span className="text-[#ba1a1a]">
                      {signalementsData.filter(s => {
                        const label = String(s.StatutLabel ?? s.Statut ?? '').toLowerCase()
                        return label.includes('attente')
                      }).length} en attente
                    </span>
                  </p>
                </div>
                <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-surface-container border-b-4 border-black">
                        <tr>
                          {['#', 'Signalé par', 'Type / Lieu', 'Description', 'Date', 'Statut', 'Actions'].map(h => (
                            <th key={h} className="px-5 py-4 text-left font-['Plus_Jakarta_Sans'] font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {signalementsData.length === 0 ? (
                          <TableEmptyState colSpan={7} icon="report" message="Aucun signalement disponible." />
                        ) : (
                          signalementsData.map((sig, idx) => {
                            const statutLabel = sig.StatutLabel ?? sig.Statut ?? 'En attente'
                            const isEnAttente = String(statutLabel).toLowerCase().includes('attente')
                            const isResolu = String(statutLabel).toLowerCase().includes('valid') || String(statutLabel).toLowerCase().includes('resolu')
                            // Extraire lieu depuis la raison (format: [...] État: ... | Lieu: xxx | ...)
                            const lieuMatch = String(sig.Raison ?? '').match(/Lieu:\s*([^|]+)/)
                            const lieuDisplay = lieuMatch ? lieuMatch[1].trim() : '—'
                            const descMatch = String(sig.Raison ?? '').match(/Description:\s*(.+)/)
                            const descDisplay = descMatch ? descMatch[1].trim().slice(0, 60) + (descMatch[1].length > 60 ? '…' : '') : String(sig.Raison ?? '').slice(0, 60)
                            return (
                              <tr key={`sig-${sig.Id ?? idx}`} className={`hover:bg-surface-container transition-colors ${isEnAttente ? 'border-l-4 border-l-[#ba1a1a]' : ''}`}>
                                <td className="px-5 py-4 font-mono font-bold text-on-surface-variant text-xs">#{sig.Id}</td>
                                <td className="px-5 py-4">
                                  <div className="flex flex-col">
                                    <span className="font-bold">{sig.UtilisateurPrenom} {sig.UtilisateurNom}</span>
                                    <span className="text-xs text-on-surface-variant">{sig.UtilisateurEmail}</span>
                                  </div>
                                </td>
                                <td className="px-5 py-4">
                                  <span className="inline-block px-2 py-0.5 bg-error-container text-on-error-container border border-black text-xs font-bold rounded mb-1">{sig.TypeCible}</span>
                                  <p className="text-xs text-on-surface-variant">{lieuDisplay}</p>
                                </td>
                                <td className="px-5 py-4 text-on-surface-variant max-w-xs">{descDisplay}</td>
                                <td className="px-5 py-4 text-on-surface-variant text-xs whitespace-nowrap">
                                  {sig.DateSignalement ? new Date(sig.DateSignalement).toLocaleDateString('fr-FR') : '—'}
                                </td>
                                <td className="px-5 py-4">
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-black
                                    ${isEnAttente ? 'bg-error-container text-on-error-container'
                                      : isResolu ? 'bg-primary-fixed text-on-primary-fixed-variant'
                                      : 'bg-surface-container text-on-surface'}`}>
                                    {statutLabel}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  {isEnAttente ? (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleResolveSignalement(sig.Id, 'Validé')}
                                        className="p-1.5 border border-black bg-primary text-white rounded transition-colors"
                                        title="Marquer résolu">
                                        <span className="material-symbols-outlined text-base">check_circle</span>
                                      </button>
                                      <button
                                        onClick={() => handleResolveSignalement(sig.Id, 'Rejeté')}
                                        className="p-1.5 border border-black bg-error text-white rounded transition-colors"
                                        title="Rejeter">
                                        <span className="material-symbols-outlined text-base">cancel</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-on-surface-variant italic">Traité</span>
                                  )}
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </FadeIn>
              </div>
            )}


            {/* SECTION PRESTATAIRES */}
            {activeSection === 'prestataires' && (
              <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <table className="w-full text-sm">
                  <thead className="bg-surface-container border-b-4 border-black">
                    <tr>
                      {['Prestataire', 'Service', 'Ville', 'Note', 'Tarif', 'Statut'].map((h) => (
                        <th key={h} className="px-5 py-4 text-left font-['Plus_Jakarta_Sans'] font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {prestatairesData.length === 0 ? (
                      <TableEmptyState colSpan={6} icon="handshake" message="Aucun prestataire disponible." />
                    ) : (
                      prestatairesData.map((prestataire) => (
                        <tr key={prestataire.id} className="hover:bg-surface-container transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <img src={prestataire.photo} alt={prestataire.nom} className="w-10 h-10 rounded-full object-cover border-2 border-black" />
                              <p className="font-bold">{prestataire.nom}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-bold">{prestataire.service}</td>
                          <td className="px-5 py-4 text-on-surface-variant">{prestataire.ville}</td>
                          <td className="px-5 py-4 font-extrabold text-primary">{Number(prestataire.note || 0).toFixed(1)}</td>
                          <td className="px-5 py-4 text-on-surface-variant">{Number(prestataire.prixHeure || 0).toFixed(2)} EUR/h</td>
                          <td className="px-5 py-4">
                            <StatutBadge statut={prestataire.disponible ? 'Actif' : 'Indisponible'} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </FadeIn>
            )}

            {/* SECTION REFUGES A VALIDER */}
            {activeSection === 'refuges' && (
              <div className="space-y-6">
                <p className="text-on-surface-variant font-bold">
                  {refugesData.filter(r => r.stripeAccountStatus !== 'verified').length} refuges en attente de validation
                </p>
                <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-container border-b-4 border-black">
                      <tr>
                        {['Nom', 'Ville', 'Telephone', 'Statut', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-4 text-left font-['Plus_Jakarta_Sans'] font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {refugesData.length === 0 ? (
                        <TableEmptyState colSpan={5} icon="verified_user" message="Aucun refuge à valider." />
                      ) : (
                        refugesData.map(refuge => (
                          <tr key={refuge.Id} className="hover:bg-surface-container transition-colors">
                            <td className="px-5 py-4 font-bold">{refuge.Nom}</td>
                            <td className="px-5 py-4 text-on-surface-variant">{refuge.Addresse || refuge.AddresseGPS}</td>
                            <td className="px-5 py-4 font-mono">{refuge.Telephone}</td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border border-black 
                                ${refuge.stripeAccountStatus === 'verified' ? 'bg-primary-fixed' : 
                                  refuge.stripeAccountStatus === 'rejected' ? 'bg-error-container' : 'bg-secondary-fixed'}`}>
                                {refuge.stripeAccountStatus || 'En attente'}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex gap-2">
                                {refuge.stripeAccountStatus !== 'verified' && (
                                  <button 
                                    onClick={() => handleVerifyRefuge(refuge.Id, 'verified')}
                                    className="px-3 py-1 bg-primary text-white border border-black font-bold text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                                  >
                                    Approuver
                                  </button>
                                )}
                                {refuge.stripeAccountStatus !== 'rejected' && (
                                  <button 
                                    onClick={() => handleVerifyRefuge(refuge.Id, 'rejected')}
                                    className="px-3 py-1 bg-error text-white border border-black font-bold text-xs shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                                  >
                                    Rejeter
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </FadeIn>
              </div>
            )}

            {/* SECTION UTILISATEURS */}
            {activeSection === 'utilisateurs' && (
              <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <table className="w-full text-sm">
                  <thead className="bg-surface-container border-b-4 border-black">
                    <tr>
                      {['Utilisateur', 'Email', 'Ville', 'Statut'].map(h => (
                        <th key={h} className="px-5 py-4 text-left font-['Plus_Jakarta_Sans'] font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {usersData.length === 0 ? (
                      <TableEmptyState colSpan={4} icon="group" message="Aucun utilisateur trouvé." />
                    ) : (
                      usersData.map(user => (
                        <tr key={user.Id} className="hover:bg-surface-container transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-surface-container rounded-full border-2 border-black flex items-center justify-center font-bold text-xs">
                                {String(user.Nom || 'U').charAt(0)}
                              </div>
                              <p className="font-bold">{user.Nom} {user.Prenom}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-on-surface-variant">{user.AddresseEmail}</td>
                          <td className="px-5 py-4 text-on-surface-variant">{user.Wilaya || 'Non renseigné'}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border border-black 
                                ${user.stripeAccountStatus === 'banned' ? 'bg-error-container text-on-error-container' : 'bg-primary-fixed'}`}>
                                {user.stripeAccountStatus === 'banned' ? 'Banni' : 'Actif'}
                              </span>
                              {user.stripeAccountStatus !== 'banned' && (
                                <button 
                                  onClick={() => handleBanUser(user.Id)}
                                  className="text-[10px] font-bold text-error hover:underline"
                                >
                                  Bannir
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </FadeIn>
            )}

          </div>
        </div>

        {/* Modal Edition Animal */}
        <Modal 
          isOpen={isAnimalModalOpen} 
          onClose={() => setIsAnimalModalOpen(false)}
          title="Modifier l'animal"
        >
          <AnimalForm 
            initialData={editingAnimal} 
            onSuccess={handleAnimalSuccess} 
            onCancel={() => setIsAnimalModalOpen(false)} 
          />
        </Modal>
      </div>
    </PageTransition>
  )
}

export default Dashboard
