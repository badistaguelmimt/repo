import { Link } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import { useUser, useClerk, useAuth, SignedIn, SignedOut } from '@clerk/clerk-react'
import { PageTransition, FadeIn } from '../components/Animations'
import { getMyReservations, getMesDemandesAdoption, annulerDemandeAdoption, getMesCommandes, cancelReservation, updateUtilisateurProfil, getMesAnimauxPersonnels, addAnimalPersonnel, removeAnimalPersonnel } from '../services/authApi'
import { getAnimaux } from '../services/publicApi'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { normalizeApiError } from '../lib/http'
import { useRoleAccess, ROLE_KEYS } from '../hooks/useRoleAccess'
import Modal from '../components/ui/Modal'

const NAV_ITEMS = [
  { id: 'profil',      label: 'Mon Profil',        icon: 'person' },
  { id: 'animaux',    label: 'Mes Animaux',        icon: 'pets' },
  { id: 'commandes',  label: 'Mes Commandes',      icon: 'receipt_long' },
  { id: 'reservations', label: 'Mes Réservations', icon: 'event' },
  { id: 'adoptions',  label: 'Mes Adoptions',      icon: 'favorite' },
]

const StatutBadge = ({ statut }) => {
  const s = String(statut ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  let cls = 'bg-surface-container text-on-surface'
  if (s.includes('accept') || s.includes('valide') || s.includes('livre')) cls = 'bg-primary-fixed text-on-primary-fixed-variant'
  if (s.includes('attente') || s.includes('cours')) cls = 'bg-secondary-fixed text-on-secondary-fixed'
  if (s.includes('refuse') || s.includes('annul')) cls = 'bg-error-container text-on-error-container'
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-black ${cls}`}>
      {statut || 'En attente'}
    </span>
  )
}

const EmptyState = ({ icon, message, linkTo, linkLabel }) => (
  <div className="py-14 flex flex-col items-center gap-4 text-center text-on-surface-variant">
    <span className="material-symbols-outlined text-6xl opacity-25">{icon}</span>
    <p className="font-bold">{message}</p>
    {linkTo && (
      <Link
        to={linkTo}
        className="px-5 py-2.5 bg-primary text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm"
      >
        {linkLabel}
      </Link>
    )}
  </div>
)

const UserProfile = () => {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const { userId } = useAuth()
  const { role } = useRoleAccess()

  const [activeSection, setActiveSection] = useState('profil')
  const [reservations,  setReservations]  = useState([])
  const [adoptions,     setAdoptions]     = useState([])
  const [commandes,     setCommandes]     = useState([])
  const [isLoading,     setIsLoading]     = useState(true)

  // Edition profil
  const [editMode,      setEditMode]      = useState(false)
  const [editForm,      setEditForm]      = useState({})
  const [editLoading,   setEditLoading]   = useState(false)
  const [editSuccess,   setEditSuccess]   = useState(false)
  const [editError,     setEditError]     = useState(null)

  // Animaux personnels
  const [mesAnimaux,       setMesAnimaux]       = useState([])
  const [animauxDispo,     setAnimauxDispo]     = useState([])
  const [showAddAnimal,    setShowAddAnimal]    = useState(false)
  const [searchAnimal,     setSearchAnimal]     = useState('')
  const [animauxLoading,   setAnimauxLoading]   = useState(false)

  const { user: backendProfile } = useCurrentUser()

  const roleMeta = role === ROLE_KEYS.ADMIN
    ? { icon: 'admin_panel_settings', label: 'Administrateur', color: 'bg-error text-white' }
    : role === ROLE_KEYS.REFUGE
      ? { icon: 'home_work', label: 'Gestionnaire de Refuge', color: 'bg-secondary text-white' }
      : role === ROLE_KEYS.PRESTATAIRE
        ? { icon: 'handshake', label: 'Prestataire', color: 'bg-tertiary text-white' }
        : { icon: 'person', label: 'Utilisateur', color: 'bg-primary-fixed text-on-primary-fixed-variant' }

  // Charge les animaux personnels de l'utilisateur
  const loadMesAnimaux = useCallback(async () => {
    if (!backendProfile?.id) return
    setAnimauxLoading(true)
    try {
      const data = await getMesAnimauxPersonnels(backendProfile.id).catch(() => [])
      setMesAnimaux(Array.isArray(data) ? data : [])
    } finally {
      setAnimauxLoading(false)
    }
  }, [backendProfile?.id])

  useEffect(() => {
    if (backendProfile?.id) {
      loadMesAnimaux()
      // Pré-remplir le formulaire d'édition
      setEditForm({
        Nom: backendProfile.nom || '',
        Prenom: backendProfile.prenom || '',
        AddresseEmail: backendProfile.email || '',
        Addresse: backendProfile.adresse || '',
        Wilaya: backendProfile.wilaya || '',
        MotDePasse: '',
      })
    }
  }, [backendProfile?.id, loadMesAnimaux])

  // Charge tous les animaux disponibles pour l'ajout (catalogue)
  useEffect(() => {
    if (showAddAnimal && animauxDispo.length === 0) {
      getAnimaux().then(data => setAnimauxDispo(Array.isArray(data) ? data : [])).catch(() => {})
    }
  }, [showAddAnimal])

  const handleSaveProfil = async (e) => {
    e.preventDefault()
    if (!backendProfile?.id) return
    setEditLoading(true)
    setEditError(null)
    try {
      await updateUtilisateurProfil(backendProfile.id, {
        Nom: editForm.Nom,
        Prenom: editForm.Prenom,
        AddresseEmail: editForm.AddresseEmail,
        Addresse: editForm.Addresse,
        Wilaya: (editForm.Wilaya || '').substring(0, 15),
        MotDePasse: editForm.MotDePasse || undefined,
        ModifieePar: backendProfile.id,
      })
      setEditSuccess(true)
      setEditMode(false)
      setTimeout(() => setEditSuccess(false), 3000)
    } catch (err) {
      setEditError(err?.response?.data?.message || "Erreur lors de la mise à jour")
    } finally {
      setEditLoading(false)
    }
  }

  const handleAddAnimal = async (animal) => {
    if (!backendProfile?.id) return
    try {
      await addAnimalPersonnel(backendProfile.id, animal.Id ?? animal.id)
      await loadMesAnimaux()
      setShowAddAnimal(false)
    } catch (err) {
      alert(err?.response?.data?.message || 'Erreur lors de l\'ajout')
    }
  }

  const handleRemoveAnimal = async (animalId) => {
    if (!backendProfile?.id) return
    if (!window.confirm('Retirer cet animal de votre profil ?')) return
    try {
      await removeAnimalPersonnel(backendProfile.id, animalId)
      setMesAnimaux(prev => prev.filter(a => (a.Id ?? a.id) !== animalId))
    } catch (err) {
      alert('Erreur lors du retrait')
    }
  }

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return
      setIsLoading(true)
      try {
        const adoptionsData = await getMesDemandesAdoption().catch(() => [])
        setAdoptions(Array.isArray(adoptionsData) ? adoptionsData : [])
        const reservationsData = await getMyReservations().catch(() => [])
        const allReservations = Array.isArray(reservationsData) ? reservationsData : []
        setReservations(allReservations.filter(r => r.IdProfil && !r.IdAnimal))
        const commandesData = await getMesCommandes().catch(() => [])
        setCommandes(Array.isArray(commandesData) ? commandesData : [])
      } catch (error) {
        normalizeApiError(error)
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [userId])

  if (!isLoaded) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <PageTransition>
      <SignedOut>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
          <span className="material-symbols-outlined text-7xl text-on-surface-variant/30">account_circle</span>
          <h2 className="font-['Chewy'] text-4xl text-primary">Vous n'êtes pas connecté</h2>
          <Link to="/auth" className="px-8 py-4 bg-primary text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
            Se connecter / S'inscrire
          </Link>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">

          {/* Hero header */}
          <FadeIn className="bg-primary border-4 border-black shadow-[8px_8px_0px_0px_rgba(148,73,37,1)] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-8">
            <div className="relative flex-shrink-0">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt={user.fullName} className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white bg-secondary flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="font-['Chewy'] text-4xl text-white">
                    {(user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || '?').toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-fixed border-2 border-black rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '12px' }}>verified</span>
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="font-['Chewy'] text-3xl md:text-4xl text-white mb-1">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Mon Profil'}
              </h1>
              <p className="text-white/70 font-bold text-sm mb-3">{user?.primaryEmailAddress?.emailAddress}</p>
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 text-xs font-bold uppercase tracking-wider ${roleMeta.color}`}>
                <span className="material-symbols-outlined text-base">{roleMeta.icon}</span>
                {roleMeta.label}
              </span>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {(role === ROLE_KEYS.ADMIN || role === ROLE_KEYS.REFUGE || role === ROLE_KEYS.PRESTATAIRE) && (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary border-2 border-black font-bold text-sm hover:bg-primary-fixed transition-colors rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  <span className="material-symbols-outlined text-base">dashboard</span>
                  Mon Dashboard
                </Link>
              )}
              <button
                onClick={() => signOut(() => window.location.href = '/')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 border-2 border-white/30 text-white font-bold text-sm hover:bg-white/20 transition-colors rounded-lg"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Déconnexion
              </button>
            </div>
          </FadeIn>

          {/* Layout 2 colonnes */}
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Sidebar navigation */}
            <aside className="lg:w-56 flex-shrink-0">
              <nav className="bg-surface-container-lowest border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
                {NAV_ITEMS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-left transition-colors border-b border-outline-variant last:border-0
                      ${activeSection === item.id
                        ? 'bg-primary text-white'
                        : 'hover:bg-surface-container text-on-surface'
                      }`}
                  >
                    <span className="material-symbols-outlined text-base">{item.icon}</span>
                    {item.label}
                    {item.id === 'adoptions' && adoptions.length > 0 && (
                      <span className={`ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-black ${activeSection === 'adoptions' ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                        {adoptions.length}
                      </span>
                    )}
                    {item.id === 'reservations' && reservations.length > 0 && (
                      <span className={`ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-black ${activeSection === 'reservations' ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                        {reservations.length}
                      </span>
                    )}
                    {item.id === 'commandes' && commandes.length > 0 && (
                      <span className={`ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-black ${activeSection === 'commandes' ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                        {commandes.length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Raccourcis */}
              <div className="mt-4 bg-secondary-fixed border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl p-4">
                <p className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant mb-3">Raccourcis</p>
                <div className="space-y-1.5">
                  {[
                    { to: '/animaux', icon: 'pets', label: 'Animaux' },
                    { to: '/boutique', icon: 'shopping_bag', label: 'Boutique' },
                    { to: '/services', icon: 'handshake', label: 'Services' },
                    { to: '/signalement', icon: 'report', label: 'Signaler' },
                  ].map(link => (
                    <Link key={link.to} to={link.to} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/60 transition-colors text-sm font-bold">
                      <span className="material-symbols-outlined text-primary text-base">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">

              {/* SECTION PROFIL */}
              {activeSection === 'profil' && (
                <FadeIn className="space-y-5">
                  {editSuccess && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-primary-fixed border-2 border-black rounded-xl font-bold text-sm text-on-primary-fixed-variant">
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                      Profil mis à jour avec succès !
                    </div>
                  )}
                  <div className="bg-surface-container-lowest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
                    <div className="bg-surface-container border-b-4 border-black px-6 py-4 flex items-center justify-between">
                      <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined">person</span>
                        Informations personnelles
                      </h2>
                      {!editMode && (
                        <button onClick={() => setEditMode(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-white border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-lg">
                          <span className="material-symbols-outlined text-base">edit</span>
                          Modifier
                        </button>
                      )}
                    </div>

                    {!editMode ? (
                      <div className="p-6 divide-y divide-outline-variant">
                        {[
                          { label: 'Prénom',  value: backendProfile?.prenom || user?.firstName, icon: 'badge' },
                          { label: 'Nom',     value: backendProfile?.nom    || user?.lastName,  icon: 'badge' },
                          { label: 'Email',   value: backendProfile?.email  || user?.primaryEmailAddress?.emailAddress, icon: 'mail' },
                          { label: 'Wilaya',  value: backendProfile?.wilaya,  icon: 'location_on' },
                          { label: 'Adresse', value: backendProfile?.adresse, icon: 'home' },
                        ].map(({ label, value, icon }) => (
                          <div key={label} className="flex items-center justify-between gap-4 py-4">
                            <div className="flex items-center gap-3 text-on-surface-variant">
                              <span className="material-symbols-outlined text-base">{icon}</span>
                              <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
                            </div>
                            <span className="font-bold text-sm text-right">{value || <span className="text-on-surface-variant font-normal italic">Non renseigné</span>}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <form onSubmit={handleSaveProfil} className="p-6 space-y-4">
                        {editError && (
                          <div className="p-3 bg-error-container border-2 border-black rounded-lg text-sm font-bold text-on-error-container flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">error</span>{editError}
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[{ name: 'Prenom', label: 'Prénom', type: 'text' }, { name: 'Nom', label: 'Nom', type: 'text' }].map(f => (
                            <div key={f.name} className="space-y-1.5">
                              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{f.label}</label>
                              <input type={f.type} value={editForm[f.name] || ''}
                                onChange={e => setEditForm(p => ({ ...p, [f.name]: e.target.value }))}
                                className="w-full border-2 border-black rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Email</label>
                          <input type="email" value={editForm.AddresseEmail || ''}
                            onChange={e => setEditForm(p => ({ ...p, AddresseEmail: e.target.value }))}
                            className="w-full border-2 border-black rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Adresse</label>
                            <input type="text" value={editForm.Addresse || ''}
                              onChange={e => setEditForm(p => ({ ...p, Addresse: e.target.value }))}
                              className="w-full border-2 border-black rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Wilaya</label>
                            <input type="text" maxLength={15} value={editForm.Wilaya || ''}
                              onChange={e => setEditForm(p => ({ ...p, Wilaya: e.target.value }))}
                              className="w-full border-2 border-black rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nouveau mot de passe <span className="font-normal normal-case">(laisser vide pour ne pas changer)</span></label>
                          <input type="password" value={editForm.MotDePasse || ''} autoComplete="new-password"
                            onChange={e => setEditForm(p => ({ ...p, MotDePasse: e.target.value }))}
                            placeholder="••••••••"
                            className="w-full border-2 border-black rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div className="flex gap-3 pt-1">
                          <button type="button" onClick={() => setEditMode(false)}
                            className="flex-1 py-3 border-2 border-black font-bold text-sm rounded-lg hover:bg-surface-container transition-colors">
                            Annuler
                          </button>
                          <button type="submit" disabled={editLoading}
                            className="flex-1 py-3 bg-primary text-white font-extrabold text-sm border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50">
                            {editLoading ? 'Enregistrement...' : 'Sauvegarder'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </FadeIn>
              )}

              {/* SECTION MES ANIMAUX PERSONNELS */}
              {activeSection === 'animaux' && (
                <FadeIn className="bg-surface-container-lowest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
                  <div className="bg-surface-container border-b-4 border-black px-6 py-4 flex items-center justify-between">
                    <div>
                      <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined">pets</span>
                        Mes animaux à la maison
                      </h2>
                      <p className="text-xs text-on-surface-variant mt-0.5">Ces animaux sont pré-sélectionnés lors de vos réservations de services.</p>
                    </div>
                    <button onClick={() => setShowAddAnimal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-lg">
                      <span className="material-symbols-outlined text-base">add</span>
                      Ajouter
                    </button>
                  </div>
                  <div className="p-6">
                    {animauxLoading ? (
                      <div className="py-10 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
                    ) : mesAnimaux.length === 0 ? (
                      <div className="py-12 flex flex-col items-center gap-4 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-6xl opacity-25">pets</span>
                        <p className="font-bold">Aucun animal enregistré.</p>
                        <p className="text-sm">Ajoutez vos animaux pour simplifier vos réservations de services.</p>
                        <button onClick={() => setShowAddAnimal(true)}
                          className="px-5 py-2.5 bg-primary text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm rounded-lg">
                          + Ajouter mon premier animal
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {mesAnimaux.map((a, idx) => (
                          <div key={a.Id ?? a.id ?? idx} className="flex items-center gap-4 p-4 bg-white border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
                            <div className="w-12 h-12 rounded-full bg-primary-fixed border-2 border-black flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-primary text-xl">pets</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-extrabold text-sm truncate">{a.Nom ?? a.nom ?? 'Animal'}</p>
                              <p className="text-xs text-on-surface-variant">{a.EspeceNom ?? a.espece ?? ''}{a.RaceNom ? ` · ${a.RaceNom}` : ''}</p>
                              <p className="text-xs text-on-surface-variant">{a.Age != null ? `${a.Age} an${a.Age > 1 ? 's' : ''}` : ''}</p>
                            </div>
                            <button onClick={() => handleRemoveAnimal(a.Id ?? a.id)}
                              className="p-2 border border-black hover:bg-error-container text-error rounded-lg transition-colors" title="Retirer">
                              <span className="material-symbols-outlined text-base">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Modal recherche & ajout animal */}
                  <Modal isOpen={showAddAnimal} onClose={() => { setShowAddAnimal(false); setSearchAnimal('') }} title="Ajouter un animal" size="md">
                    <div className="space-y-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-base">search</span>
                        <input type="text" placeholder="Rechercher par nom, race, espèce..."
                          value={searchAnimal} onChange={e => setSearchAnimal(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 border-2 border-black rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                        {animauxDispo
                          .filter(a => {
                            const q = searchAnimal.toLowerCase()
                            return !q || (a.Nom ?? '').toLowerCase().includes(q) ||
                              (a.EspeceNom ?? '').toLowerCase().includes(q) ||
                              (a.RaceNom ?? '').toLowerCase().includes(q)
                          })
                          .filter(a => !mesAnimaux.some(m => (m.Id ?? m.id) === (a.Id ?? a.id)))
                          .slice(0, 20)
                          .map((a, idx) => (
                            <div key={a.Id ?? a.id ?? idx}
                              onClick={() => handleAddAnimal(a)}
                              className="flex items-center gap-3 p-3 border-2 border-black rounded-xl cursor-pointer hover:bg-primary hover:text-white transition-all group">
                              <div className="w-10 h-10 rounded-full bg-primary-fixed border border-black flex items-center justify-center flex-shrink-0 group-hover:bg-white/20">
                                <span className="material-symbols-outlined text-primary text-base group-hover:text-white">pets</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{a.Nom ?? 'Animal'}</p>
                                <p className="text-xs opacity-70">{a.EspeceNom ?? ''}{a.RaceNom ? ` · ${a.RaceNom}` : ''} {a.Age != null ? `· ${a.Age} an${a.Age > 1 ? 's' : ''}` : ''}</p>
                              </div>
                              <span className="material-symbols-outlined text-base opacity-50 group-hover:opacity-100">add_circle</span>
                            </div>
                          ))}
                        {animauxDispo.length === 0 && (
                          <div className="py-8 text-center text-on-surface-variant">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            Chargement des animaux...
                          </div>
                        )}
                      </div>
                    </div>
                  </Modal>
                </FadeIn>
              )}

              {/* SECTION COMMANDES BOUTIQUE */}
              {activeSection === 'commandes' && (
                <FadeIn className="bg-surface-container-lowest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
                  <div className="bg-surface-container border-b-4 border-black px-6 py-4 flex items-center justify-between">
                    <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined">receipt_long</span>
                      Mes commandes
                    </h2>
                    <Link to="/boutique" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                      <span className="material-symbols-outlined text-base">store</span>
                      Boutique
                    </Link>
                  </div>

                  {isLoading ? (
                    <div className="py-10 flex justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : commandes.length === 0 ? (
                    <EmptyState
                      icon="shopping_bag"
                      message="Vous n'avez encore passé aucune commande."
                      linkTo="/boutique"
                      linkLabel="Découvrir la boutique"
                    />
                  ) : (
                    <div className="divide-y divide-outline-variant">
                      {/* Regrouper par commandeId pour éviter doublons */}
                      {Object.values(
                        commandes.reduce((acc, row) => {
                          const id = row.commandeId ?? row.Id
                          if (!acc[id]) acc[id] = { ...row, refuges: [] }
                          if (row.NomRefuge) acc[id].refuges.push(row.NomRefuge)
                          return acc
                        }, {})
                      ).map((cmd, idx) => {
                        const statutLabel = cmd.StatutLabel ?? cmd.Statut ?? 'En cours'
                        const paiementLabel = cmd.PaiementStatutLabel ?? 'Validé'
                        const ref = cmd.PaymentRef ?? ''
                        const isSimulated = ref.startsWith('SIM-')
                        return (
                          <div key={cmd.commandeId ?? `cmd-${idx}`} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary-fixed rounded-full border-2 border-black flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-primary text-xl">shopping_bag</span>
                              </div>
                              <div>
                                <p className="font-extrabold text-sm">Commande #{String(cmd.commandeId ?? idx + 1).padStart(6, '0')}</p>
                                <p className="text-xs text-on-surface-variant mt-0.5">
                                  {cmd.refuges?.length > 0 ? cmd.refuges.filter(Boolean).join(', ') : 'Refuge partenaire'}
                                </p>
                                <p className="text-xs text-on-surface-variant">
                                  {isSimulated ? 'Paiement simulé' : ref}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                              {cmd.Total_prix != null && (
                                <span className="font-extrabold text-primary">{Number(cmd.Total_prix).toLocaleString('fr-DZ')} DZD</span>
                              )}
                              {/* Un seul badge pertinent : statut livraison, sinon statut paiement en fallback */}
                              <StatutBadge statut={statutLabel && statutLabel !== 'En cours' ? statutLabel : paiementLabel} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </FadeIn>
              )}

              {/* SECTION ADOPTIONS */}
              {activeSection === 'adoptions' && (
                <FadeIn className="bg-surface-container-lowest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
                  <div className="bg-surface-container border-b-4 border-black px-6 py-4 flex items-center justify-between">
                    <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined">pets</span>
                      Mes demandes d'adoption
                    </h2>
                    <Link to="/animaux" className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                      <span className="material-symbols-outlined text-base">add</span>
                      Faire une demande
                    </Link>
                  </div>

                  {isLoading ? (
                    <div className="py-10 flex justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : adoptions.length === 0 ? (
                    <EmptyState
                      icon="pets"
                      message="Vous n'avez encore fait aucune demande d'adoption."
                      linkTo="/animaux"
                      linkLabel="Voir les animaux disponibles"
                    />
                  ) : (
                    <div className="divide-y divide-outline-variant">
                      {adoptions.map((adop, idx) => {
                        const isEnAttente = String(adop.StatutLabel ?? adop.Statut ?? '').toLowerCase().includes('attente')
                        const isAccepted = String(adop.StatutLabel ?? adop.Statut ?? '').toLowerCase().includes('accept')
                        const isRefused = String(adop.StatutLabel ?? adop.Statut ?? '').toLowerCase().includes('refus')
                        return (
                          <div key={adop.Id ? `adop-${adop.Id}` : `adop-idx-${idx}`} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center flex-shrink-0
                                ${isAccepted ? 'bg-primary-fixed' : isRefused ? 'bg-error-container' : 'bg-secondary-fixed'}`}>
                                <span className={`material-symbols-outlined text-xl
                                  ${isAccepted ? 'text-primary' : isRefused ? 'text-error' : 'text-secondary'}`}>pets</span>
                              </div>
                              <div>
                                <p className="font-extrabold text-sm">{adop.AnimalNom || `Animal #${adop.IdAnimal}`}</p>
                                <p className="text-xs text-on-surface-variant mt-0.5">
                                  {adop.RefugeNom && <span>{adop.RefugeNom} · </span>}
                                  {adop.DateDemande
                                    ? new Date(adop.DateDemande).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                                    : 'Date inconnue'}
                                </p>
                                {adop.CommentaireRetour && (
                                  <p className="text-xs text-on-surface-variant mt-1 italic border-l-2 border-outline-variant pl-2">
                                    Réponse du refuge : "{adop.CommentaireRetour}"
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <StatutBadge statut={adop.StatutLabel || adop.Statut || 'En attente'} />
                              {isAccepted && (
                                <span className="text-[10px] text-primary font-bold flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">celebration</span>
                                  Félicitations !
                                </span>
                              )}
                              {isEnAttente && (
                                <button
                                  onClick={async () => {
                                    if (!window.confirm('Annuler cette demande ?')) return
                                    try {
                                      await annulerDemandeAdoption(adop.Id)
                                      setAdoptions(prev => prev.map(a => a.Id === adop.Id ? { ...a, StatutLabel: 'Annulé', Statut: 'Annulé' } : a))
                                    } catch (err) {
                                      alert(`Erreur lors de l'annulation: ${err?.response?.data?.message || err.message}`);
                                    }
                                  }}
                                  className="text-[10px] text-error font-bold flex items-center gap-1 hover:underline"
                                >
                                  <span className="material-symbols-outlined text-xs">cancel</span>
                                  Annuler
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </FadeIn>
              )}

              {/* SECTION RESERVATIONS SERVICES */}
              {activeSection === 'reservations' && (
                <FadeIn className="bg-surface-container-lowest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden">
                  <div className="bg-surface-container border-b-4 border-black px-6 py-4 flex items-center justify-between">
                    <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined">event</span>
                      Mes réservations de services
                    </h2>
                    <Link
                      to="/services"
                      className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                      <span className="material-symbols-outlined text-base">add</span>
                      Réserver un service
                    </Link>
                  </div>

                  {isLoading ? (
                    <div className="py-10 flex justify-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : reservations.length === 0 ? (
                    <EmptyState
                      icon="event"
                      message="Vous n'avez encore aucune réservation de service."
                      linkTo="/services"
                      linkLabel="Voir les prestataires"
                    />
                  ) : (
                    <div className="divide-y divide-outline-variant">
                      {reservations.map((res, idx) => {
                        const sLabel = res.StatutLabel ?? res.Statut ?? 'En attente'
                        const isEnAttente = sLabel.toLowerCase().includes('attente')
                        return (
                          <div key={res.Id ? `res-${res.Id}` : `res-idx-${idx}`} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-secondary-fixed rounded-full border-2 border-black flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-secondary text-xl">handshake</span>
                              </div>
                              <div>
                                <p className="font-bold text-sm">
                                  {res.TypeServiceLabel ?? res.TypeService ?? `Réservation #${String(res.Id || idx + 1).padStart(4, '0')}`}
                                </p>
                                <p className="text-xs text-on-surface-variant mt-0.5">
                                  {res.PrestataireNom && <span className="font-bold">{res.PrestataireNom} · </span>}
                                  {res.DateDebut
                                    ? new Date(res.DateDebut).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                                    : 'Date à confirmer'}
                                  {res.PrixFinal && ` · ${Number(res.PrixFinal).toLocaleString('fr-DZ')} DZD`}
                                </p>
                                {res.Notes && (
                                  <p className="text-xs text-on-surface-variant mt-1 italic">"{res.Notes}"</p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <StatutBadge statut={sLabel} />
                              {isEnAttente && (
                                <button
                                  onClick={async () => {
                                    if (!window.confirm('Annuler cette réservation ?')) return
                                    try {
                                      await cancelReservation(res.Id)
                                      setReservations(prev => prev.map(r => r.Id === res.Id ? { ...r, StatutLabel: 'Annulée', Statut: 'Annulée' } : r))
                                    } catch { alert('Erreur lors de l\'annulation') }
                                  }}
                                  className="text-[10px] text-error font-bold flex items-center gap-1 hover:underline"
                                >
                                  <span className="material-symbols-outlined text-xs">cancel</span>
                                  Annuler
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </FadeIn>
              )}

            </main>
          </div>
        </div>
      </SignedIn>
    </PageTransition>
  )
}

export default UserProfile
