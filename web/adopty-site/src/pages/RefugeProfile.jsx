import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { PageTransition, FadeIn } from '../components/Animations'
import Pagination from '../components/ui/Pagination'
import { getRefugeById, getAnimauxByRefuge } from '../services/publicApi'
import { mapRefuge } from '../hooks/useRefuge'
import { mapAnimals } from '../hooks/useAnimal'
import { normalizeApiError } from '../lib/http'

const AnimalCard = ({ animal }) => (
  <Link
    to={`/profil/${animal.id}`}
    className="flex flex-col h-full bg-surface-container-lowest border-4 border-black rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(21,66,18,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group"
  >
    <div className="aspect-square bg-surface-container relative overflow-hidden">
      {animal.photo ? (
        <img src={animal.photo} alt={animal.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/20">pets</span>
        </div>
      )}
      {animal.urgent && (
        <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-black">
          🚨 Urgent
        </div>
      )}
      {animal.statut && (
        <div className="absolute top-3 right-3 bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-black">
          {animal.statut}
        </div>
      )}
    </div>
    <div className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-['Chewy'] text-xl text-primary">{animal.nom}</h3>
          <p className="text-xs text-on-surface-variant font-bold mt-0.5">{animal.race} · {animal.ageLabel}</p>
        </div>
        <span className="material-symbols-outlined text-secondary group-hover:translate-x-1 transition-transform mt-0.5">arrow_forward</span>
      </div>
      {animal.traits && animal.traits.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {animal.traits.slice(0, 3).map(t => (
            <span key={t} className="bg-secondary-fixed text-xs font-bold px-2 py-0.5 rounded-full border border-black">{t}</span>
          ))}
        </div>
      )}
    </div>
  </Link>
)

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-outline-variant last:border-0">
    <span className="material-symbols-outlined text-primary text-lg mt-0.5 flex-shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>
      <p className="font-bold text-sm mt-0.5 break-words">{value || <span className="text-on-surface-variant font-normal italic">Non renseigné</span>}</p>
    </div>
  </div>
)

const ITEMS_PER_PAGE = 6

const RefugeProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [refuge, setRefuge] = useState(null)
  const [animaux, setAnimaux] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatut, setFilterStatut] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const [refugeData, animauxData] = await Promise.all([
          getRefugeById(id),
          getAnimauxByRefuge(id),
        ])

        if (!refugeData) {
          setError('Refuge introuvable')
          return
        }

        const mapped = mapRefuge(refugeData)
        setRefuge(mapped)

        const mappedAnimaux = Array.isArray(animauxData) ? mapAnimals(animauxData) : []
        setAnimaux(mappedAnimaux)
      } catch (err) {
        const e = normalizeApiError(err)
        setError(e.message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filterStatut])

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || !refuge) return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <span className="material-symbols-outlined text-7xl text-on-surface-variant/20 block mb-4">home_work</span>
        <h1 className="font-['Chewy'] text-4xl text-primary mb-3">Refuge introuvable</h1>
        <p className="text-on-surface-variant mb-6">{error || 'Ce refuge n\'existe pas ou a été supprimé.'}</p>
        <Link to="/refuges" className="px-6 py-3 bg-primary text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
          Voir tous les refuges
        </Link>
      </div>
    </PageTransition>
  )

  const urgents = animaux.filter(a => a.urgent).length
  const filteredAnimaux = filterStatut === 'all'
    ? animaux
    : filterStatut === 'urgent'
      ? animaux.filter(a => a.urgent)
      : animaux.filter(a => (a.statut || '').toLowerCase().includes(filterStatut))

  const totalPages = Math.ceil(filteredAnimaux.length / ITEMS_PER_PAGE)
  const paginatedAnimaux = filteredAnimaux.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">

        {/* Fil d'Ariane */}
        <FadeIn className="flex items-center gap-2 text-sm font-bold text-on-surface-variant mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <Link to="/refuges" className="hover:text-primary transition-colors">Refuges</Link>
          <span className="material-symbols-outlined text-base">chevron_right</span>
          <span className="text-primary">{refuge.nom}</span>
        </FadeIn>

        {/* Hero Section */}
        <FadeIn className="bg-[#154212] border-4 border-black rounded-3xl overflow-hidden shadow-[10px_10px_0px_0px_rgba(21,66,18,1)] mb-10">
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary-container text-sm">verified</span>
                    Refuge Partenaire Adopty
                  </span>
                  {refuge.stripeAccountStatus === 'verified' && (
                    <span className="bg-primary-fixed text-on-primary-fixed-variant border border-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Vérifié
                    </span>
                  )}
                  {urgents > 0 && (
                    <span className="bg-red-500 text-white border border-black text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
                      🚨 {urgents} adoption(s) urgente(s)
                    </span>
                  )}
                </div>
                <h1 className="font-['Chewy'] text-4xl md:text-6xl text-white mb-2">{refuge.nom}</h1>
                <p className="text-white/70 flex items-center gap-2 font-bold">
                  <span className="material-symbols-outlined text-base text-secondary-container">location_on</span>
                  {refuge.adresse || refuge.ville}
                </p>
              </div>

              {/* Stats rapides */}
              <div className="flex gap-4 md:gap-6 flex-shrink-0">
                {[
                  { value: animaux.length, label: 'Animaux', icon: 'pets' },
                  { value: refuge.capacite || '—', label: 'Capacité', icon: 'home' },
                ].map(s => (
                  <div key={s.label} className="text-center bg-white/10 border border-white/20 rounded-2xl px-5 py-4">
                    <span className="material-symbols-outlined text-secondary-container text-lg block mb-1">{s.icon}</span>
                    <p className="font-['Chewy'] text-4xl text-white">{s.value}</p>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {refuge.description && (
              <p className="mt-6 text-white/80 text-base leading-relaxed max-w-3xl border-t border-white/10 pt-6">
                {refuge.description}
              </p>
            )}
          </div>
        </FadeIn>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Colonne principale : Animaux */}
          <div className="lg:col-span-8">
            <FadeIn>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 className="font-['Chewy'] text-3xl text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">pets</span>
                  Animaux disponibles
                  <span className="ml-2 text-xl text-on-surface-variant font-normal font-['Plus_Jakarta_Sans']">({filteredAnimaux.length})</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'Tous' },
                    { key: 'urgent', label: '🚨 Urgents' },
                    { key: 'disponible', label: 'Disponibles' },
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setFilterStatut(f.key)}
                      className={`px-4 py-2 text-xs font-extrabold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-lg
                        ${filterStatut === f.key ? 'bg-primary text-white' : 'bg-white text-on-surface'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredAnimaux.length === 0 ? (
                <div className="bg-surface-container-lowest border-4 border-black rounded-2xl p-14 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <span className="material-symbols-outlined text-7xl text-on-surface-variant/20 block mb-4">pets</span>
                  <p className="font-bold text-on-surface-variant mb-2">Aucun animal dans cette catégorie</p>
                  <p className="text-sm text-on-surface-variant">Revenez prochainement !</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {paginatedAnimaux.map((a, i) => (
                      <FadeIn key={a.id} delay={i * 0.05} className="h-full">
                        <AnimalCard animal={a} />
                      </FadeIn>
                    ))}
                  </div>
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      setCurrentPage(page)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  />
                </>
              )}
            </FadeIn>
          </div>

          {/* Colonne latérale : Infos refuge */}
          <div className="lg:col-span-4 space-y-6">

            {/* Contact */}
            <FadeIn delay={0.1}>
              <div className="bg-surface-container-lowest border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden">
                <div className="bg-surface-container border-b-4 border-black px-5 py-4">
                  <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">contact_phone</span>
                    Nous contacter
                  </h3>
                </div>
                <div className="px-5 pb-2">
                  <InfoRow icon="location_on" label="Adresse" value={refuge.adresse} />
                  <InfoRow icon="location_city" label="Ville" value={refuge.ville} />
                  <InfoRow icon="phone" label="Téléphone" value={refuge.telephone} />
                  <InfoRow icon="mail" label="Email" value={refuge.email} />
                  <InfoRow icon="schedule" label="Horaires" value={refuge.horaires} />
                </div>
              </div>
            </FadeIn>

            {/* Spécialités */}
            {refuge.specialites && refuge.specialites.length > 0 && (
              <FadeIn delay={0.2}>
                <div className="bg-primary-fixed border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-5">
                  <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">star</span>
                    Spécialités
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {refuge.specialites.map(s => (
                      <span key={s} className="bg-white border-2 border-black px-3 py-1.5 text-xs font-bold rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}

            {/* CTA Adoption */}
            <FadeIn delay={0.3}>
              <div className="bg-secondary border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-6 text-center">
                <span className="material-symbols-outlined text-5xl text-white block mb-3">favorite</span>
                <h3 className="font-['Chewy'] text-2xl text-white mb-2">Adopter un animal</h3>
                <p className="text-white/80 text-sm mb-4">Cliquez sur un animal pour faire votre demande d'adoption.</p>
                <Link
                  to="/animaux"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white text-secondary font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-sm"
                >
                  <span className="material-symbols-outlined text-base">search</span>
                  Voir tous les animaux
                </Link>
              </div>
            </FadeIn>

            {/* Lien retour */}
            <FadeIn delay={0.4}>
              <Link
                to="/refuges"
                className="flex items-center gap-2 justify-center w-full px-5 py-3 bg-surface-container-lowest border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-bold text-sm rounded-2xl"
              >
                <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Tous les refuges
              </Link>
            </FadeIn>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

export default RefugeProfile
