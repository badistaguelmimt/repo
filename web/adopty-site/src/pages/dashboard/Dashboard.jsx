import { useCallback, useEffect, useState } from 'react'
import { PageTransition, FadeIn } from '../../components/Animations'
import StatCard from '../../components/ui/StatCard'
import Modal from '../../components/ui/Modal'
import AnimalForm from '../../components/forms/AnimalForm'
import { getAnimaux, getRefuges, getPrestataires, getSignalements } from '../../services/publicApi'
import {
  getAllUsers, getAdminStats, resolveSignalement,
  deleteAnimal, updateAnimal,
  adminDeleteUser, adminUpdateUser, adminAddRole, adminRemoveRole, getAllRoles,
  verifyRefuge, adminUpdateRefuge, adminDeleteRefuge,
  adminUpdatePrestataire, adminDeletePrestataire,
} from '../../services/authApi'
import { mapAnimals } from '../../hooks/useAnimal'
import { mapCommandes } from '../../hooks/useCommandes'
import { mapPrestataires } from '../../hooks/usePrestataires'
import { apiAuthRequest } from '../../lib/http'
import { UsersSection } from './admin/UsersSection'
import { RefugesSection } from './admin/RefugesSection'
import { PrestatairesSection } from './admin/PrestatairesSection'
import { Badge, ActionBtn, EmptyRow, THead, SectionTable } from './admin/AdminHelpers'

const NAV = [
  { id: 'overview',      label: "Vue d'ensemble", icon: 'dashboard' },
  { id: 'utilisateurs',  label: 'Utilisateurs',   icon: 'group' },
  { id: 'refuges',       label: 'Refuges',         icon: 'house' },
  { id: 'prestataires',  label: 'Prestataires',    icon: 'handshake' },
  { id: 'animaux',       label: 'Animaux',         icon: 'pets' },
  { id: 'signalements',  label: 'Signalements',    icon: 'report' },
  { id: 'commandes',     label: 'Commandes',       icon: 'shopping_bag' },
]

const Dashboard = () => {
  const [section, setSection]         = useState('overview')
  const [loading, setLoading]         = useState(true)
  const [toast, setToast]             = useState(null)
  const [animauxData, setAnimaux]     = useState([])
  const [commandesData, setCommandes] = useState([])
  const [sigData, setSignalements]    = useState([])
  const [prestData, setPrestataires]  = useState([])
  const [refugesData, setRefuges]     = useState([])
  const [usersData, setUsers]         = useState([])
  const [stats, setStats]             = useState({})
  const [animalModal, setAnimalModal] = useState({ open: false, data: null })

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    const arr = r => r.status === 'fulfilled' && Array.isArray(r.value) ? r.value : []
    try {
      const [sR, aR, sigR, pR, rR, cR, uR] = await Promise.allSettled([
        getAdminStats(), getAnimaux(), getSignalements(),
        getPrestataires(), getRefuges(),
        apiAuthRequest({ url: '/api/checkout/all-orders', method: 'get' }),
        getAllUsers(),
      ])
      if (sR.status === 'fulfilled') setStats(sR.value ?? {})
      setAnimaux(mapAnimals(arr(aR)))
      setSignalements(arr(sigR))
      setPrestataires(mapPrestataires(arr(pR)))
      setRefuges(arr(rR))
      setCommandes(mapCommandes(arr(cR)))
      setUsers(arr(uR))
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ── Animal handlers
  const handleDeleteAnimal = async (id) => {
    if (!window.confirm('Supprimer cet animal ?')) return
    try { await deleteAnimal(id); setAnimaux(p => p.filter(a => a.id !== id)); showToast('Animal supprimé'); loadData(false); }
    catch { showToast('Erreur', 'error') }
  }
  const handleMarkAdopted = async (a) => {
    if (!window.confirm(`Marquer ${a.nom} comme adopté ?`)) return
    try {
      await updateAnimal(a.id, { Nom: a.nom, Age: a.age ?? 0, Genre: a.Genre ?? 'M', Poids: a.Poids ?? 0, Taille: a.Taille ?? 50, Couleur: a.Couleur ?? '', EtatSantee: a.EtatSantee ?? 'Bon', Sterilise: false, Temperament: '', NiveauEnergetique: 'Moyen', SociableEnfant: false, SociableAnimaux: false, Statut: 3, Race: a.raceId ?? 1 })
      setAnimaux(p => p.map(x => x.id === a.id ? { ...x, statut: 'Adopté' } : x))
      showToast('Marqué adopté')
      loadData(false)
    } catch { showToast('Erreur', 'error') }
  }

  // ── Signalements handler
  const handleResolve = async (id, status) => {
    try { await resolveSignalement(id, status); setSignalements(p => p.map(s => s.Id === id ? { ...s, Statut: status } : s)); showToast(status === 'Validé' ? 'Résolu' : 'Rejeté'); loadData(false); }
    catch { showToast('Erreur', 'error') }
  }

  return (
    <PageTransition>
      <div className="flex min-h-screen bg-surface-container-low">

        {/* Sidebar */}
        <aside className="w-64 bg-primary border-r-4 border-black flex-shrink-0 hidden md:flex flex-col">
          <div className="p-6 border-b-4 border-black/20">
            <p className="font-['Chewy'] text-3xl text-white mb-1">Adopty</p>
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Admin</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {NAV.map(item => (
              <button key={item.id} onClick={() => setSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all
                  ${section === item.id ? 'bg-white text-primary shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t-4 border-black/20 flex items-center gap-3 px-7">
            <div className="w-9 h-9 bg-secondary rounded-full border-2 border-white flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">admin_panel_settings</span>
            </div>
            <div><p className="text-white font-bold text-sm">Admin</p><p className="text-white/50 text-xs">Adopty Platform</p></div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 overflow-x-hidden">
          <div className="bg-[#fbfbe2] border-b-4 border-black px-8 py-5 sticky top-0 z-30">
            <h1 className="font-extrabold text-2xl text-primary">{NAV.find(n => n.id === section)?.label}</h1>
            <p className="text-xs text-on-surface-variant font-bold">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>

          <div className="p-8">
            {/* Toast */}
            {toast && (
              <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl border-2 border-black font-bold text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                ${toast.type === 'error' ? 'bg-error-container text-on-error-container' : 'bg-primary-fixed text-on-primary-fixed-variant'}`}>
                {toast.msg}
              </div>
            )}
            {loading && (
              <FadeIn className="mb-6 flex items-center gap-3 px-4 py-3 bg-surface-container-lowest border-2 border-black rounded-xl">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-bold text-primary">Chargement...</p>
              </FadeIn>
            )}

            {/* ── VUE D'ENSEMBLE ── */}
            {section === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  <StatCard icon="group"     label="Utilisateurs"  value={stats.utilisateurs ?? 0}      sub="inscrits"             color="primary"   delay={0}   />
                  <StatCard icon="house"     label="Refuges"        value={stats.refuges ?? 0}            sub="enregistrés"          color="secondary" delay={0.1} />
                  <StatCard icon="handshake" label="Prestataires"   value={stats.prestatairesActifs ?? 0} sub="actifs"               color="tertiary"  delay={0.2} />
                  <StatCard icon="pets"      label="Animaux"        value={stats.animauxTotal ?? 0}       sub={`${stats.animauxUrgent ?? 0} urgents`} color="surface" delay={0.3} />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                  <StatCard icon="favorite"     label="Adoptions (mois)" value={stats.adoptionsMois ?? 0}      sub={`Total: ${stats.adoptionsTotal ?? 0}`}     color="primary"   delay={0.1} />
                  <StatCard icon="shopping_bag" label="CA Boutique"       value={`${(stats.caBoutique ?? 0).toLocaleString()} DZA`} sub={`${stats.commandesEnAttente ?? 0} en attente`} color="secondary" delay={0.2} />
                  <StatCard icon="report"       label="Signalements"      value={stats.signalementsEnAttente ?? 0} sub={`Total: ${stats.signalementsTotal ?? 0}`} color="tertiary"  delay={0.3} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="px-6 py-4 border-b-4 border-black bg-surface-container flex items-center justify-between">
                      <h3 className="font-extrabold text-primary flex items-center gap-2"><span className="material-symbols-outlined">group</span>Derniers inscrits</h3>
                      <button onClick={() => setSection('utilisateurs')} className="text-xs font-bold text-secondary hover:underline">Voir tout →</button>
                    </div>
                    <div className="divide-y divide-outline-variant">
                      {usersData.slice(0, 5).map(u => (
                        <div key={u.Id} className="px-6 py-3 flex items-center justify-between">
                          <p className="font-bold text-sm">{u.Prenom} {u.Nom}</p>
                          <span className="text-xs text-on-surface-variant">{u.AddresseEmail}</span>
                        </div>
                      ))}
                    </div>
                  </FadeIn>
                  <FadeIn className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="px-6 py-4 border-b-4 border-black bg-surface-container flex items-center justify-between">
                      <h3 className="font-extrabold text-primary flex items-center gap-2"><span className="material-symbols-outlined">report</span>Signalements récents</h3>
                      <button onClick={() => setSection('signalements')} className="text-xs font-bold text-secondary hover:underline">Voir tout →</button>
                    </div>
                    <div className="divide-y divide-outline-variant">
                      {sigData.slice(0, 5).map((s, i) => (
                        <div key={s.Id ?? i} className="px-6 py-3 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm">{s.TypeCible}</p>
                            <p className="text-xs text-on-surface-variant">{String(s.Raison ?? '').slice(0, 40)}</p>
                          </div>
                          <Badge label={s.StatutLabel ?? 'En attente'} color={String(s.StatutLabel ?? '').toLowerCase().includes('attente') ? 'danger' : 'success'} />
                        </div>
                      ))}
                    </div>
                  </FadeIn>
                </div>
              </div>
            )}

            {/* ── UTILISATEURS ── */}
            {section === 'utilisateurs' && <UsersSection users={usersData} setUsers={setUsers} showToast={showToast} reload={() => loadData(false)} />}

            {/* ── REFUGES ── */}
            {section === 'refuges' && <RefugesSection refuges={refugesData} setRefuges={setRefuges} showToast={showToast} reload={() => loadData(false)} />}

            {/* ── PRESTATAIRES ── */}
            {section === 'prestataires' && <PrestatairesSection prestataires={prestData} setPrestataires={setPrestataires} showToast={showToast} reload={() => loadData(false)} />}

            {/* ── ANIMAUX ── */}
            {section === 'animaux' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-on-surface-variant font-bold text-sm">{animauxData.length} animal/animaux</p>
                  <button onClick={() => setAnimalModal({ open: true, data: null })}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white border-2 border-black font-bold text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all rounded">
                    <span className="material-symbols-outlined text-xl">add</span>Ajouter
                  </button>
                </div>
                <SectionTable>
                  <THead cols={['Animal', 'Espèce', 'Âge', 'Statut', 'Refuge (jours)', 'Actions']} />
                  <tbody className="divide-y divide-outline-variant">
                    {animauxData.length === 0 ? <EmptyRow colSpan={6} icon="pets" message="Aucun animal." /> : animauxData.map(a => (
                      <tr key={a.id} className="hover:bg-surface-container transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={a.photo} alt={a.nom} className="w-9 h-9 rounded-full object-cover border-2 border-black" onError={e => { e.target.src = 'https://via.placeholder.com/36' }} />
                            <p className="font-bold text-sm">{a.nom}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{a.espece}</td>
                        <td className="px-4 py-3 text-sm">{a.ageLabel}</td>
                        <td className="px-4 py-3"><Badge label={a.urgent ? 'Urgent' : (a.statut || 'En refuge')} color={a.urgent ? 'danger' : 'default'} /></td>
                        <td className="px-4 py-3 text-sm text-on-surface-variant">{a.joursRefuge ?? '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <ActionBtn icon="edit" title="Modifier" onClick={() => setAnimalModal({ open: true, data: a })} />
                            <ActionBtn icon="check_circle" title="Marquer adopté" variant="success" onClick={() => handleMarkAdopted(a)} />
                            <ActionBtn icon="delete" title="Supprimer" variant="danger" onClick={() => handleDeleteAnimal(a.id)} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </SectionTable>
              </div>
            )}

            {/* ── SIGNALEMENTS ── */}
            {section === 'signalements' && (
              <div className="space-y-4">
                <p className="text-on-surface-variant font-bold text-sm">
                  {sigData.length} signalement(s) — <span className="text-error">{sigData.filter(s => String(s.Statut ?? '').toLowerCase().includes('attente')).length} en attente</span>
                </p>
                <SectionTable>
                  <THead cols={['#', 'Par', 'Type', 'Raison', 'Date', 'Statut', 'Actions']} />
                  <tbody className="divide-y divide-outline-variant">
                    {sigData.length === 0 ? <EmptyRow colSpan={7} icon="report" message="Aucun signalement." /> : sigData.map((s, i) => {
                      const enAttente = String(s.StatutLabel ?? '').toLowerCase().includes('attente') || !s.StatutLabel
                      return (
                        <tr key={s.Id ?? i} className={`hover:bg-surface-container transition-colors ${enAttente ? 'border-l-4 border-l-error' : ''}`}>
                          <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">#{s.Id}</td>
                          <td className="px-4 py-3 text-sm font-bold">{s.UtilisateurPrenom} {s.UtilisateurNom}</td>
                          <td className="px-4 py-3"><Badge label={s.TypeCible} color="danger" /></td>
                          <td className="px-4 py-3 text-xs text-on-surface-variant max-w-xs truncate">{String(s.Raison ?? '').slice(0, 60)}</td>
                          <td className="px-4 py-3 text-xs text-on-surface-variant">{s.DateSignalement ? new Date(s.DateSignalement).toLocaleDateString('fr-FR') : '—'}</td>
                          <td className="px-4 py-3"><Badge label={s.StatutLabel ?? 'En attente'} color={enAttente ? 'danger' : 'success'} /></td>
                          <td className="px-4 py-3">
                            {enAttente ? (
                              <div className="flex gap-1">
                                <ActionBtn icon="check_circle" title="Résoudre" variant="success" onClick={() => handleResolve(s.Id, 'Validé')} />
                                <ActionBtn icon="cancel" title="Rejeter" variant="danger" onClick={() => handleResolve(s.Id, 'Rejeté')} />
                              </div>
                            ) : <span className="text-xs italic text-on-surface-variant">Traité</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </SectionTable>
              </div>
            )}

            {/* ── COMMANDES ── */}
            {section === 'commandes' && (
              <div className="space-y-4">
                <p className="text-on-surface-variant font-bold text-sm">{commandesData.length} commande(s)</p>
                <SectionTable>
                  <THead cols={['ID', 'Client', 'Produit', 'Montant', 'Statut', 'Date']} />
                  <tbody className="divide-y divide-outline-variant">
                    {commandesData.length === 0 ? <EmptyRow colSpan={6} icon="receipt_long" message="Aucune commande." /> : commandesData.map(c => (
                      <tr key={c.id} className="hover:bg-surface-container transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{c.id}</td>
                        <td className="px-4 py-3 font-bold text-sm">{c.client}</td>
                        <td className="px-4 py-3 text-sm text-on-surface-variant">{c.produit}</td>
                        <td className="px-4 py-3 font-extrabold text-primary text-sm">{Number(c.montant ?? 0).toFixed(2)} DZA</td>
                        <td className="px-4 py-3"><Badge label={c.statut} color={String(c.statut ?? '').toLowerCase().includes('livr') ? 'success' : 'warning'} /></td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant">{c.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </SectionTable>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Animal */}
      <Modal isOpen={animalModal.open} onClose={() => setAnimalModal({ open: false, data: null })}
        title={animalModal.data ? `Modifier ${animalModal.data.nom}` : 'Ajouter un animal'}>
        <AnimalForm
          initialData={animalModal.data}
          refugeId={animalModal.data?.idRefuge ?? animalModal.data?.IdRefuge ?? null}
          onSuccess={() => { setAnimalModal({ open: false, data: null }); loadData(false); }}
          onClose={() => setAnimalModal({ open: false, data: null })}
        />
      </Modal>
    </PageTransition>
  )
}

export default Dashboard
