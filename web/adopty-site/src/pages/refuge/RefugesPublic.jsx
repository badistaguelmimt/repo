import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PageTransition, FadeIn } from '../../components/Animations'
import Pagination from '../../components/ui/Pagination'
import { useRefuges } from '../../hooks/useRefuge'
import { useAnimaux } from '../../hooks/useAnimaux'

// Mini animal card for refuge pages
const MiniAnimalCard = ({ animal }) => (
  <Link
    to={`/profil/${animal.id}`}
    className="flex items-center gap-3 p-3 bg-white border-2 border-black rounded-xl hover:bg-primary-fixed/30 hover:translate-x-[2px] hover:translate-y-[2px] transition-all shadow-[3px_3px_0px_0px_rgba(21,66,18,1)] hover:shadow-none group"
  >
    <div className="w-12 h-12 rounded-lg bg-surface-container border-2 border-black flex-shrink-0 overflow-hidden">
      <img src={animal.photo} alt={animal.nom} className="w-full h-full object-cover" />
    </div>
    <div className="flex-grow min-w-0">
      <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-sm text-primary truncate">{animal.nom}</p>
      <p className="text-xs text-on-surface-variant font-medium">{animal.race} · {animal.ageLabel}</p>
    </div>
    {animal.urgent && (
      <span className="flex-shrink-0 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
        Urgent
      </span>
    )}
    <span className="material-symbols-outlined text-sm text-secondary group-hover:translate-x-1 transition-transform">
      arrow_forward
    </span>
  </Link>
)


// Full refuge card with anchor id
const RefugeCard = ({ refuge, allAnimals }) => {
  const animauxRefuge = allAnimals.filter(a => {
    if (a.idRefuge != null && refuge.id) return String(a.idRefuge) === String(refuge.id)
    return a.lieu === refuge.lieu || a.lieu === refuge.nom
  })

  // Optional: paginate mini animal cards inside refuge card if there are too many
  const [currentAnimauxPage, setCurrentAnimauxPage] = useState(1)
  const ITEMS_PER_ANIMAUX_PAGE = 4
  const totalAnimauxPages = Math.ceil(animauxRefuge.length / ITEMS_PER_ANIMAUX_PAGE)
  const paginatedAnimaux = animauxRefuge.slice(
    (currentAnimauxPage - 1) * ITEMS_PER_ANIMAUX_PAGE,
    currentAnimauxPage * ITEMS_PER_ANIMAUX_PAGE
  )

  return (
    <section
      id={`refuge-${refuge.id}`}
      className="scroll-mt-28 bg-surface-container-lowest border-4 border-black rounded-3xl overflow-hidden shadow-[10px_10px_0px_0px_rgba(21,66,18,1)]"
    >
      {/* Header band */}
      <div className="bg-[#154212] px-8 py-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-['Plus_Jakarta_Sans'] text-secondary-fixed text-xs uppercase tracking-widest font-bold mb-1">
            {refuge.ville} · {refuge.codePostal}
          </p>
          <h2 className="font-['Chewy'] text-3xl lg:text-4xl text-white">{refuge.nom}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {refuge.certifications.map(c => (
            <span
              key={c}
              className="bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full"
            >
              {c}
            </span>
          ))}
          <Link
            to={`/refuge/${refuge.id}`}
            className="flex items-center gap-2 bg-white text-primary border-2 border-white font-bold text-xs px-4 py-2 rounded-full hover:bg-primary-fixed transition-colors"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            Profil complet
          </Link>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Description */}
          {refuge.description && refuge.description.trim() !== '' && (
            <div className="bg-white/50 rounded-2xl p-5 border-2 border-black/10">
              <p className="text-on-surface-variant leading-relaxed text-base">{refuge.description}</p>
            </div>
          )}

          {/* Specialites */}
          {refuge.specialites && refuge.specialites.length > 0 && (
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-widest text-on-surface-variant mb-3">
                Spécialités
              </h3>
              <div className="flex flex-wrap gap-2">
                {refuge.specialites.map(s => (
                  <span
                    key={s}
                    className="bg-primary-fixed text-on-primary-fixed-variant border-2 border-black px-4 py-2 rounded-full font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Contact card */}
          <div className="bg-white border-4 border-black rounded-2xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-3">
            <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold uppercase text-sm tracking-widest text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">contact_phone</span> Contact
            </h3>
            {[
              { icon: 'location_on', text: refuge.adresse },
              { icon: 'phone', text: refuge.telephone },
              { icon: 'email', text: refuge.email },
            ].map(({ icon, text }) => (
              <div key={icon} className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-lg mt-0.5 flex-shrink-0">{icon}</span>
                <span className="text-sm font-medium text-on-surface-variant break-all">{text}</span>
              </div>
            ))}
          </div>

          {/* Animaux du refuge */}
          <div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold uppercase text-sm tracking-widest text-on-surface-variant mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-lg">hotel_class</span>
              Animaux disponibles ({animauxRefuge.length})
            </h3>
            {animauxRefuge.length > 0 ? (
              <>
                <div className="space-y-2">
                  {paginatedAnimaux.map(a => (
                    <MiniAnimalCard key={a.id} animal={a} />
                  ))}
                </div>
                {totalAnimauxPages > 1 && (
                  <div className="mt-3 flex justify-center gap-2">
                    <button
                      onClick={() => setCurrentAnimauxPage(p => Math.max(1, p - 1))}
                      disabled={currentAnimauxPage === 1}
                      className="px-2 py-1 text-xs border border-black rounded bg-white disabled:opacity-50 font-bold"
                    >
                      &lt;
                    </button>
                    <span className="text-xs font-bold self-center">{currentAnimauxPage} / {totalAnimauxPages}</span>
                    <button
                      onClick={() => setCurrentAnimauxPage(p => Math.min(totalAnimauxPages, p + 1))}
                      disabled={currentAnimauxPage === totalAnimauxPages}
                      className="px-2 py-1 text-xs border border-black rounded bg-white disabled:opacity-50 font-bold"
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-surface-container border-2 border-black/20 rounded-xl p-6 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 block mb-2">pets</span>
                <p className="text-sm text-on-surface-variant font-medium">
                  Tous les animaux ont été adoptés !
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

const ITEMS_PER_PAGE = 3

const Refuges = () => {
  const location = useLocation()
  const initialScrollDone = useRef(false)
  const [currentPage, setCurrentPage] = useState(1)
  const { refuges: refugesData } = useRefuges()
  const { animaux: animauxData }  = useAnimaux()

  useEffect(() => {
    if (initialScrollDone.current) return
    const params = new URLSearchParams(location.search)
    const refugeId = params.get('refuge')
    if (refugeId) {
      // Find page containing refuge
      const index = refugesData.findIndex(r => String(r.id) === refugeId)
      if (index !== -1) {
        const pageNum = Math.floor(index / ITEMS_PER_PAGE) + 1
        setCurrentPage(pageNum)
      }

      // Small delay to let the page render fully before scrolling
      const timer = setTimeout(() => {
        const el = document.getElementById(`refuge-${refugeId}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          // Pulse highlight animation
          el.classList.add('ring-4', 'ring-secondary', 'ring-offset-2')
          setTimeout(() => el.classList.remove('ring-4', 'ring-secondary', 'ring-offset-2'), 2000)
        }
      }, 400)
      initialScrollDone.current = true
      return () => clearTimeout(timer)
    }
  }, [location.search, refugesData])

  const totalPages = Math.ceil(refugesData.length / ITEMS_PER_PAGE)
  const paginatedRefuges = refugesData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <FadeIn className="mb-12">

          <Link
            to="/animaux"
            className="inline-flex items-center gap-2 mb-8 text-primary font-bold group"
          >
            <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
            <span className="font-['Plus_Jakarta_Sans'] uppercase tracking-wider text-sm">Nos compagnons</span>
          </Link>
          <h1 className="font-['Chewy'] text-5xl lg:text-7xl text-primary leading-tight">
            Nos Refuges Partenaires
          </h1>
          <p className="mt-4 text-xl text-on-surface-variant max-w-2xl">
            Découvrez les refuges associés à Adopty, leur équipe et les animaux qui y cherchent une famille.
          </p>

          {/* Refuges quick-nav */}
          <div className="flex flex-wrap gap-3 mt-8">
            {refugesData.map((r, index) => {
              const targetPage = Math.floor(index / ITEMS_PER_PAGE) + 1
              return (
                <a
                  key={r.id}
                  href={`#refuge-${r.id}`}
                  onClick={(e) => {
                    if (currentPage !== targetPage) {
                      e.preventDefault()
                      setCurrentPage(targetPage)
                      setTimeout(() => {
                        const el = document.getElementById(`refuge-${r.id}`)
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }, 100)
                    }
                  }}
                  className="inline-flex items-center gap-2 bg-white border-2 border-black px-5 py-2.5 rounded-full font-['Plus_Jakarta_Sans'] font-bold text-sm hover:bg-primary hover:text-white transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                >
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {r.nom}
                </a>
              )
            })}
          </div>
        </FadeIn>

        {/* Global stats banner */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 gap-4 mb-16 bg-[#154212] rounded-2xl p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-center border-r-2 border-white/10">
              <p className="font-['Chewy'] text-5xl text-white">{refugesData.length}</p>
              <p className="text-secondary-fixed text-xs uppercase tracking-widest font-bold mt-1">Refuges partenaires</p>
            </div>
            <div className="text-center">
              <p className="font-['Chewy'] text-5xl text-white">{animauxData.length}</p>
              <p className="text-secondary-fixed text-xs uppercase tracking-widest font-bold mt-1">Animaux à adopter</p>
            </div>
          </div>
        </FadeIn>

        {/* Refuge cards */}
        <div className="space-y-14">
          {paginatedRefuges.map((refuge, i) => (
            <FadeIn key={refuge.id} delay={i * 0.1}>
              <RefugeCard refuge={refuge} allAnimals={animauxData} />
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
      </div>
    </PageTransition>
  )
}

export default Refuges
