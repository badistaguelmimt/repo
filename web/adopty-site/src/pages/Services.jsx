import { useState, useEffect, useMemo } from 'react'
import { PageTransition, FadeIn } from '../components/Animations'
import ServiceCard from '../components/ui/ServiceCard'
import Modal from '../components/ui/Modal'
import ReservationForm from '../components/forms/ReservationForm'
import { usePrestataires, SERVICES_DISPONIBLES } from '../hooks/usePrestataires'
import { useRequireAuthAction } from '../hooks/useRequireAuthAction'
import { useRoleAccess } from '../hooks/useRoleAccess'

const TAB_ICONS = { 'Pet-sitting': 'home', 'Promenade': 'directions_walk' }
const TAB_DESCRIPTIONS = {
  'Pet-sitting': 'Garde à domicile ou chez le prestataire. Votre animal est choyé en votre absence.',
  'Promenade': 'Sorties quotidiennes adaptées à votre compagnon avec un promeneur certifié.',
}
const SORTS = [
  { value: 'note-desc', label: 'Meilleures notes',  icon: 'star' },
  { value: 'prix-asc',  label: 'Prix croissant',    icon: 'arrow_upward' },
  { value: 'prix-desc', label: 'Prix décroissant',  icon: 'arrow_downward' },
  { value: 'nom-asc',   label: 'Nom A → Z',         icon: 'sort_by_alpha' },
]

const StarFilter = ({ minNote, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} onClick={() => onChange(minNote === n ? 0 : n)} title={`${n} étoile${n > 1 ? 's' : ''} min.`}>
        <span className={`material-symbols-outlined text-2xl transition-colors ${n <= minNote ? 'text-amber-400' : 'text-outline-variant hover:text-amber-300'}`}>
          star
        </span>
      </button>
    ))}
    {minNote > 0 && (
      <button onClick={() => onChange(0)} className="ml-1 text-xs text-secondary font-bold hover:underline self-center">Reset</button>
    )}
  </div>
)

const Services = () => {
  const [activeTab,           setActiveTab]           = useState('Pet-sitting')
  const [selectedPrestataire, setSelectedPrestataire] = useState(null)
  const [search,              setSearch]              = useState('')
  const [minNote,             setMinNote]             = useState(0)
  const [prixMax,             setPrixMax]             = useState('')
  const [sortBy,              setSortBy]              = useState('note-desc')
  const { requireAuthAction } = useRequireAuthAction()
  const { isPrestataire, isRefuge } = useRoleAccess()
  const { prestataires: providersData, isLoading } = usePrestataires()

  // Reset filters on tab change
  useEffect(() => { setSearch(''); setMinNote(0); setPrixMax('') }, [activeTab])

  const filtered = useMemo(() => {
    let r = providersData.filter(p => p.service === activeTab)
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(p =>
        p.nom?.toLowerCase().includes(q) ||
        p.ville?.toLowerCase().includes(q) ||
        p.bio?.toLowerCase().includes(q)
      )
    }
    if (minNote > 0) r = r.filter(p => Number(p.note || 0) >= minNote)
    if (prixMax !== '') r = r.filter(p => Number(p.prixHeure || 0) <= Number(prixMax))
    r.sort((a, b) => {
      if (sortBy === 'note-desc') return Number(b.note || 0) - Number(a.note || 0)
      if (sortBy === 'prix-asc')  return Number(a.prixHeure || 0) - Number(b.prixHeure || 0)
      if (sortBy === 'prix-desc') return Number(b.prixHeure || 0) - Number(a.prixHeure || 0)
      return (a.nom || '').localeCompare(b.nom || '')
    })
    return r
  }, [providersData, activeTab, search, minNote, prixMax, sortBy])

  const handleReserve = (p) => requireAuthAction(() => setSelectedPrestataire(p))
  const activeFilterCount = [search.trim(), minNote > 0, prixMax !== ''].filter(Boolean).length
  const resetFilters = () => { setSearch(''); setMinNote(0); setPrixMax('') }

  return (
    <PageTransition>
      {/* Hero */}
      <section className="bg-primary py-16 px-6 border-b-4 border-black">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-secondary text-white px-4 py-1.5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-6">
              <span className="material-symbols-outlined text-sm">pets</span>
              <span className="font-bold text-sm uppercase tracking-widest">Nos Services</span>
            </div>
            <h1 className="font-['Chewy'] text-5xl md:text-7xl text-white mb-4 leading-tight">
              Des services de<br /><span className="text-secondary-container">confiance</span>
            </h1>
            <p className="text-white/80 max-w-xl text-lg font-body">
              Des prestataires certifiés et passionnés prennent soin de votre compagnon quand vous en avez besoin.
            </p>
          </FadeIn>
          <FadeIn delay={0.2} className="flex flex-wrap gap-6 mt-10">
            {[
              { icon: 'verified_user', label: 'Prestataires certifiés', value: `${providersData.length}+` },
              { icon: 'star', label: 'Note moyenne', value: providersData.length ? `${(providersData.reduce((s, p) => s + p.note, 0) / providersData.length).toFixed(1)}/5` : '—' },
              { icon: 'event_available', label: 'Services disponibles', value: SERVICES_DISPONIBLES.length.toString() },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-3 bg-white/10 border-2 border-white/30 px-5 py-3 rounded-xl">
                <span className="material-symbols-outlined text-secondary-container text-2xl">{stat.icon}</span>
                <div>
                  <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-white text-xl">{stat.value}</p>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Tabs */}
        <FadeIn className="flex gap-3 mb-6">
          {SERVICES_DISPONIBLES.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-7 py-3 font-['Plus_Jakarta_Sans'] font-extrabold text-lg border-4 border-black transition-all rounded-lg
                ${activeTab === tab
                  ? 'bg-primary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]'
                  : 'bg-surface-container-lowest text-primary hover:bg-surface-container shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'}`}>
              <span className="material-symbols-outlined">{TAB_ICONS[tab]}</span>
              {tab}
            </button>
          ))}
        </FadeIn>
        <p className="text-on-surface-variant font-body mb-6">{TAB_DESCRIPTIONS[activeTab]}</p>

        {/* Barre de filtres */}
        <FadeIn className="bg-surface-container-lowest border-2 border-black rounded-2xl p-4 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-wrap gap-4 items-end">

            {/* Recherche */}
            <div className="flex-1 min-w-[180px]">
              <label className="font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-1.5 block">Rechercher</label>
              <div className="relative">
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Nom, ville..."
                  className="w-full border-2 border-black px-4 py-2.5 pr-9 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary rounded-xl bg-white"
                />
                {search ? (
                  <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5">
                    <span className="material-symbols-outlined text-primary text-lg">close</span>
                  </button>
                ) : (
                  <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-primary/50 text-lg">search</span>
                )}
              </div>
            </div>

            {/* Note min */}
            <div>
              <label className="font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-1.5 block">Note min.</label>
              <StarFilter minNote={minNote} onChange={setMinNote} />
            </div>

            {/* Prix max */}
            <div className="min-w-[130px]">
              <label className="font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-1.5 block">Prix max (DZD/h)</label>
              <input
                type="number" min="0" placeholder="Ex: 5000" value={prixMax} onChange={e => setPrixMax(e.target.value)}
                className="w-full border-2 border-black px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary rounded-xl bg-white"
              />
            </div>

            {/* Tri */}
            <div>
              <label className="font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-1.5 block">Trier par</label>
              <div className="flex flex-wrap gap-1.5">
                {SORTS.map(s => (
                  <button key={s.value} onClick={() => setSortBy(s.value)}
                    className={`flex items-center gap-1 px-3 py-2 text-xs font-bold border-2 border-black rounded-xl transition-all
                      ${sortBy === s.value ? 'bg-secondary text-white shadow-none translate-x-[1px] translate-y-[1px]' : 'bg-white text-on-surface hover:bg-secondary/5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}>
                    <span className="material-symbols-outlined text-[15px]">{s.icon}</span>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            {activeFilterCount > 0 && (
              <button onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 border-2 border-black rounded-xl text-xs font-bold bg-white hover:bg-error-container transition-colors">
                <span className="material-symbols-outlined text-[15px]">filter_list_off</span>
                Reset ({activeFilterCount})
              </button>
            )}
          </div>
        </FadeIn>

        {/* Résultats */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-on-surface-variant">
            <span className="font-extrabold text-primary text-lg">{filtered.length}</span>
            {' '}prestataire{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-24">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-bold text-on-surface-variant">Chargement des prestataires...</p>
          </div>
        ) : filtered.length === 0 ? (
          <FadeIn className="text-center py-24 text-on-surface-variant bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
            <span className="material-symbols-outlined text-7xl mb-4 block opacity-25">search_off</span>
            <p className="font-['Chewy'] text-3xl text-primary mb-2">Aucun prestataire trouvé</p>
            <p className="text-sm mb-6 max-w-xs mx-auto">Essayez d'élargir vos critères.</p>
            {activeFilterCount > 0 && (
              <button onClick={resetFilters}
                className="px-8 py-3 bg-primary text-white font-extrabold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-xl text-sm">
                Réinitialiser les filtres
              </button>
            )}
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p, i) => (
              <ServiceCard key={`prestataire-${p.id}`} prestataire={p} delay={i * 0.1} onReserver={handleReserve} />
            ))}
          </div>
        )}

        {/* Section Devenir Prestataire */}
        {!isPrestataire && !isRefuge && (
          <FadeIn delay={0.3} className="mt-20 bg-secondary-fixed border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-10 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="text-5xl mb-4 block">🐾</span>
                <h2 className="font-['Chewy'] text-4xl text-primary mb-4">Devenez Prestataire Adopty !</h2>
                <p className="text-on-surface-variant leading-relaxed mb-6">
                  Vous aimez les animaux et souhaitez partager votre passion tout en générant des revenus ? Rejoignez notre réseau de prestataires certifiés.
                </p>
                <ul className="space-y-2 mb-6">
                  {['Horaires flexibles', 'Rémunération attractive', 'Formation offerte', 'Assurance incluse'].map(item => (
                    <li key={item} className="flex items-center gap-2 font-bold text-sm">
                      <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="p-6 bg-white border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-3">
                  <span className="material-symbols-outlined text-5xl text-primary">handshake</span>
                  <h3 className="font-['Chewy'] text-2xl text-primary">Prêt à nous rejoindre ?</h3>
                  <p className="text-sm text-on-surface-variant">Créez votre profil prestataire depuis votre espace personnel après inscription.</p>
                  <a href="/sign-up"
                    className="block w-full py-3 bg-primary text-white font-['Plus_Jakarta_Sans'] font-extrabold uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm">
                    S'inscrire comme Prestataire →
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>
        )}
      </div>

      {/* Modal réservation */}
      <Modal isOpen={!!selectedPrestataire} onClose={() => setSelectedPrestataire(null)}
        title={`Réserver — ${selectedPrestataire?.nom || ''}`} size="md">
        <ReservationForm prestataire={selectedPrestataire} onClose={() => setSelectedPrestataire(null)} />
      </Modal>
    </PageTransition>
  )
}

export default Services
