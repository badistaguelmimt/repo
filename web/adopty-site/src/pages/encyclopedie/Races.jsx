import { useState, useMemo } from 'react'
import { PageTransition, FadeIn } from '../../components/Animations'
import BreedDetailModal from '../../components/ui/BreedDetailModal'
import { useRaces } from '../../hooks/useRaces'
import { useAnimaux } from '../../hooks/useAnimaux'

const ITEMS_PER_PAGE = 12

const Races = () => {
  const [search,          setSearch]          = useState('')
  const [selectedSpecies, setSelectedSpecies] = useState('Tous')
  const [selectedBreed,   setSelectedBreed]   = useState(null)
  const [isModalOpen,     setIsModalOpen]     = useState(false)
  const [currentPage,     setCurrentPage]     = useState(1)

  const { races: racesData, isLoading } = useRaces()
  const { animaux: animalsData }        = useAnimaux()

  const filtered = useMemo(() => {
    return racesData.filter(r => {
      const matchesSearch  = r.nom.toLowerCase().includes(search.toLowerCase())
      const matchesSpecies = selectedSpecies === 'Tous' || r.espece === selectedSpecies
      return matchesSearch && matchesSpecies
    })
  }, [racesData, search, selectedSpecies])

  const totalPages   = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage     = Math.min(currentPage, totalPages)
  const paginated    = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  const changeFilter = (val) => { setSelectedSpecies(val); setCurrentPage(1) }
  const changeSearch = (val) => { setSearch(val); setCurrentPage(1) }

  const openModal = (breed) => {
    setSelectedBreed(breed)
    setIsModalOpen(true)
  }

  const SPECIES = ['Tous', 'Chien', 'Chat', 'Lapin', 'Hamster']

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <FadeIn className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="bg-secondary text-white px-4 py-1 rounded-full border-2 border-black font-black text-xs uppercase tracking-widest mb-4 inline-block shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">Encyclopédie Adopty</span>
              <h1 className="font-['Chewy'] text-5xl md:text-8xl text-primary leading-none mb-6">Découvrez les Races</h1>
              <p className="font-['Plus_Jakarta_Sans'] text-xl text-on-surface-variant">
                Apprenez-en plus sur les besoins, le caractère et l'histoire de chaque espèce pour une adoption réussie.
                <span className="ml-2 font-bold text-primary">{racesData.length} races</span> dans notre encyclopédie.
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="w-full md:w-80">
              <div className="relative group">
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => changeSearch(e.target.value)}
                  placeholder="Chercher une race..."
                  className="w-full bg-white border-4 border-black p-4 pr-12 rounded-2xl font-bold focus:outline-none focus:ring-0 group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                />
                {search ? (
                  <button onClick={() => changeSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                    <span className="material-symbols-outlined text-primary text-2xl">close</span>
                  </button>
                ) : (
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary text-3xl">search</span>
                )}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Species Filters */}
        <FadeIn delay={0.1} className="flex flex-wrap gap-3 mb-10">
          {SPECIES.map(s => (
            <button
              key={s}
              onClick={() => changeFilter(s)}
              className={`px-5 py-2.5 rounded-lg font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-wider border-[3px] border-black transition-all
                ${selectedSpecies === s 
                  ? 'bg-primary text-white shadow-none translate-x-[2px] translate-y-[2px]' 
                  : 'bg-white text-primary hover:bg-primary/5 shadow-[4px_4px_0px_0px_rgba(21,66,18,1)] hover:shadow-[6px_6px_0px_0px_rgba(21,66,18,1)] hover:-translate-x-[1px] hover:-translate-y-[1px]'}`}
            >
              {s}
              {s !== 'Tous' && (
                <span className="ml-1.5 text-xs opacity-60">
                  ({racesData.filter(r => r.espece === s).length})
                </span>
              )}
            </button>
          ))}
        </FadeIn>

        {/* Results count */}
        <FadeIn delay={0.15} className="mb-6">
          <p className="text-sm text-on-surface-variant font-medium">
            {filtered.length === 0 ? 'Aucun résultat' : `${filtered.length} race${filtered.length > 1 ? 's' : ''} trouvée${filtered.length > 1 ? 's' : ''}`}
            {totalPages > 1 && ` · Page ${safePage} / ${totalPages}`}
          </p>
        </FadeIn>

        {/* Breed Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginated.length > 0 ? (
            paginated.map((breed, i) => (
              <FadeIn key={breed.id} delay={i * 0.04}>
                <div 
                  onClick={() => openModal(breed)}
                  className="group bg-surface-container-lowest border-[3px] border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_0px_rgba(21,66,18,1)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(21,66,18,1)] transition-all duration-200 cursor-pointer h-full flex flex-col"
                >
                  <div className="h-48 overflow-hidden relative border-b-[3px] border-black">
                    <img src={breed.photo} alt={breed.nom} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="bg-secondary text-white px-3 py-1 border-2 border-black font-bold text-[10px] uppercase tracking-widest rounded-lg">{breed.espece}</span>
                    </div>
                    {breed.origine && (
                      <div className="absolute bottom-2 right-2">
                        <span className="bg-white/90 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold border border-black/20">
                          {breed.origine}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-lg text-primary mb-1 group-hover:underline">{breed.nom}</h3>
                    {breed.esperanceVie && (
                      <p className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-secondary">favorite</span>
                        {breed.esperanceVie}
                      </p>
                    )}
                    <p className="text-sm text-on-surface-variant line-clamp-2 flex-grow">{breed.description}</p>
                  </div>
                  <div className="px-4 pb-4 mt-auto flex items-center justify-end">
                    <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:text-secondary transition-colors">
                      Découvrir <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 block mb-4">search_off</span>
              <p className="font-['Chewy'] text-4xl text-on-surface-variant/30">Aucun résultat trouvé...</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <FadeIn className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="flex items-center gap-1 px-4 py-2.5 border-3 border-black font-bold text-sm bg-white rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed border-2"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 border-2 border-black font-['Chewy'] text-lg rounded-xl transition-all
                  ${page === safePage
                    ? 'bg-primary text-white shadow-none translate-x-[1px] translate-y-[1px]'
                    : 'bg-white text-primary shadow-[3px_3px_0px_0px_rgba(21,66,18,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none'}`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="flex items-center gap-1 px-4 py-2.5 border-2 border-black font-bold text-sm bg-white rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </FadeIn>
        )}

        {/* Breed Modal */}
        <BreedDetailModal 
          breed={selectedBreed} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          animals={animalsData}
        />
      </div>
    </PageTransition>
  )
}

export default Races
