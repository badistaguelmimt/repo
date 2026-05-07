import { useState } from 'react'
import { PageTransition, FadeIn } from '../components/Animations'
import BreedDetailModal from '../components/ui/BreedDetailModal'
import { useRaces } from '../hooks/useRaces'
import { useAnimaux } from '../hooks/useAnimaux'

const Races = () => {
  const [search,          setSearch]          = useState('')
  const [selectedSpecies, setSelectedSpecies] = useState('Tous')
  const [selectedBreed,   setSelectedBreed]   = useState(null)
  const [isModalOpen,     setIsModalOpen]     = useState(false)

  const { races: racesData,    isLoading } = useRaces()
  const { animaux: animalsData }           = useAnimaux()

  const filterRaces = racesData.filter(r => {
    const matchesSearch = r.nom.toLowerCase().includes(search.toLowerCase())
    const matchesSpecies = selectedSpecies === 'Tous' || r.espece === selectedSpecies
    return matchesSearch && matchesSpecies
  })

  const openModal = (breed) => {
    setSelectedBreed(breed)
    setIsModalOpen(true)
  }

  const SPECIES = ['Tous', 'Chien', 'Chat', 'Lapin']

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <FadeIn className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="bg-secondary text-white px-4 py-1 rounded-full border-2 border-black font-black text-xs uppercase tracking-widest mb-4 inline-block shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">Encyclopédie Adopty</span>
              <h1 className="font-['Chewy'] text-5xl md:text-8xl text-primary leading-none mb-6">Découvrez les Races</h1>
              <p className="font-['Plus_Jakarta_Sans'] text-xl text-on-surface-variant">Apprenez-en plus sur les besoins, le caractère et l'histoire de chaque espèce pour une adoption réussie.</p>
            </div>
            
            {/* Search Bar */}
            <div className="w-full md:w-80">
              <div className="relative group">
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Chercher une race..."
                  className="w-full bg-white border-4 border-black p-4 pr-12 rounded-2xl font-bold focus:outline-none focus:ring-0 group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary text-3xl">search</span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Species Filters */}
        <FadeIn delay={0.1} className="flex flex-wrap gap-4 mb-12">
          {SPECIES.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSpecies(s)}
              className={`px-6 py-2.5 rounded-lg font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-wider border-[3px] border-black transition-all
                ${selectedSpecies === s 
                  ? 'bg-primary text-white shadow-none translate-x-[2px] translate-y-[2px]' 
                  : 'bg-white text-primary hover:bg-primary/5 shadow-[4px_4px_0px_0px_rgba(21,66,18,1)] hover:shadow-[6px_6px_0px_0px_rgba(21,66,18,1)] hover:-translate-x-[1px] hover:-translate-y-[1px]'}`}
            >
              {s}
            </button>
          ))}
        </FadeIn>

        {/* Breed Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filterRaces.length > 0 ? (
            filterRaces.map((breed, i) => (
              <FadeIn key={breed.id} delay={i * 0.05}>
                <div 
                  onClick={() => openModal(breed)}
                  className="group bg-surface-container-lowest border-[3px] border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(21,66,18,1)] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(21,66,18,1)] transition-all duration-200 cursor-pointer h-full flex flex-col"
                >
                  <div className="h-56 overflow-hidden relative border-b-[3px] border-black">
                    <img src={breed.photo} alt={breed.nom} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-3 left-3">
                       <span className="bg-secondary text-white px-3 py-1 border-2 border-black font-bold text-[10px] uppercase tracking-widest rounded-lg">{breed.espece}</span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-primary mb-2 group-hover:underline">{breed.nom}</h3>
                    <p className="text-sm text-on-surface-variant line-clamp-3 mb-4 flex-grow">{breed.description}</p>
                  </div>
                  <div className="px-5 pb-5 mt-auto flex items-center justify-end">
                    <span className="text-sm font-bold text-primary flex items-center gap-1 group-hover:text-secondary transition-colors">
                      Découvrir la race <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="font-['Chewy'] text-4xl text-on-surface-variant/30">Aucun résultat trouvé...</p>
            </div>
          )}
        </div>

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
