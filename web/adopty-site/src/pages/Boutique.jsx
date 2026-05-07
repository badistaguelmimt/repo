import { useState, useEffect, useMemo } from 'react'
import { PageTransition, FadeIn } from '../components/Animations'
import ProductCard from '../components/ui/ProductCard'
import Pagination from '../components/ui/Pagination'
import { useProduits } from '../hooks/useProduits'

const CATEGORIES = ['Tous', 'Alimentation', 'Jouets', 'Accessoires', 'Hygiène', 'Santé']
const SORTS = [
  { value: 'nom-asc',   label: 'Nom A → Z',       icon: 'sort_by_alpha' },
  { value: 'prix-asc',  label: 'Prix croissant',   icon: 'arrow_upward' },
  { value: 'prix-desc', label: 'Prix décroissant', icon: 'arrow_downward' },
]
const ITEMS_PER_PAGE = 6

const Boutique = () => {
  const [categorie,   setCategorie]   = useState('Tous')
  const [search,      setSearch]      = useState('')
  const [sortBy,      setSortBy]      = useState('nom-asc')
  const [prixMin,     setPrixMin]     = useState('')
  const [prixMax,     setPrixMax]     = useState('')
  const [stockOnly,   setStockOnly]   = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const { produits: productsData, isLoading } = useProduits()

  const maxPrixData = useMemo(
    () => Math.ceil(Math.max(0, ...productsData.map(p => Number(p.prix) || 0))),
    [productsData]
  )

  useEffect(() => { setCurrentPage(1) }, [categorie, search, sortBy, prixMin, prixMax, stockOnly])

  const filtered = useMemo(() => {
    let r = [...productsData]
    if (categorie !== 'Tous') r = r.filter(p => p.categorie === categorie)
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(p => p.nom?.toLowerCase().includes(q) || p.categorie?.toLowerCase().includes(q))
    }
    if (prixMin !== '') r = r.filter(p => Number(p.prix) >= Number(prixMin))
    if (prixMax !== '') r = r.filter(p => Number(p.prix) <= Number(prixMax))
    if (stockOnly) r = r.filter(p => Number(p.stock ?? p.Stock ?? 1) > 0)
    r.sort((a, b) => {
      if (sortBy === 'prix-asc')  return Number(a.prix) - Number(b.prix)
      if (sortBy === 'prix-desc') return Number(b.prix) - Number(a.prix)
      return (a.nom || '').localeCompare(b.nom || '')
    })
    return r
  }, [productsData, categorie, search, sortBy, prixMin, prixMax, stockOnly])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const activeFilterCount = [categorie !== 'Tous', search.trim(), prixMin !== '', prixMax !== '', stockOnly].filter(Boolean).length
  const reset = () => { setCategorie('Tous'); setSearch(''); setSortBy('nom-asc'); setPrixMin(''); setPrixMax(''); setStockOnly(false) }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <FadeIn className="mb-8">
          <h1 className="font-['Chewy'] text-5xl md:text-6xl text-primary leading-tight">Boutique Naturelle</h1>
          <p className="text-on-surface-variant mt-2 font-body text-lg">Des produits sains sélectionnés pour le bien-être de vos compagnons.</p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10">
          {/* Sidebar */}
          <aside>
            <FadeIn className="p-6 bg-white border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(21,66,18,1)] sticky top-28 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary text-lg flex items-center gap-2">
                  <span className="material-symbols-outlined">filter_list</span>
                  Filtres
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 bg-secondary text-white text-[11px] font-extrabold rounded-full flex items-center justify-center border border-black">
                      {activeFilterCount}
                    </span>
                  )}
                </h3>
                {activeFilterCount > 0 && (
                  <button onClick={reset} className="text-xs font-bold text-secondary hover:underline uppercase tracking-wider">Reset</button>
                )}
              </div>

              {/* Recherche */}
              <div>
                <span className="font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">Rechercher</span>
                <div className="relative">
                  <input
                    value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom du produit..."
                    className="w-full border-2 border-black px-4 py-2.5 pr-9 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
                  />
                  {search ? (
                    <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5">
                      <span className="material-symbols-outlined text-primary text-lg">close</span>
                    </button>
                  ) : (
                    <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-primary text-lg">search</span>
                  )}
                </div>
              </div>

              {/* Catégories */}
              <div>
                <span className="font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">Catégories</span>
                <div className="flex flex-col gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setCategorie(c)}
                      className={`w-full text-left px-4 py-2.5 text-sm font-extrabold border-2 border-black rounded-xl transition-all
                        ${categorie === c ? 'bg-primary text-white shadow-none translate-x-[2px] translate-y-[2px]' : 'bg-white text-on-surface hover:bg-primary/5 shadow-[2px_2px_0px_0px_rgba(21,66,18,1)]'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prix */}
              <div>
                <span className="font-bold text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">
                  Prix (DZD){maxPrixData > 0 && <span className="font-normal normal-case ml-1">jusqu'à {maxPrixData.toLocaleString('fr-DZ')}</span>}
                </span>
                <div className="flex gap-2 items-center">
                  <input type="number" min="0" placeholder="Min" value={prixMin} onChange={e => setPrixMin(e.target.value)}
                    className="w-full border-2 border-black px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary rounded-lg" />
                  <span className="text-on-surface-variant font-bold">—</span>
                  <input type="number" min="0" placeholder="Max" value={prixMax} onChange={e => setPrixMax(e.target.value)}
                    className="w-full border-2 border-black px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary rounded-lg" />
                </div>
              </div>

              {/* Stock */}
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 border-black hover:bg-surface-container transition-colors select-none">
                <div className="relative flex-shrink-0">
                  <input type="checkbox" checked={stockOnly} onChange={e => setStockOnly(e.target.checked)}
                    className="peer appearance-none w-6 h-6 border-2 border-black rounded-md checked:bg-primary transition-all cursor-pointer" />
                  <span className="material-symbols-outlined absolute opacity-0 peer-checked:opacity-100 text-white pointer-events-none inset-0 flex items-center justify-center text-sm">check</span>
                </div>
                <span className="text-sm font-bold">En stock uniquement</span>
              </label>
            </FadeIn>
          </aside>

          {/* Grille */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-on-surface-variant text-sm font-bold">
                <span className="font-extrabold text-primary text-lg">{filtered.length}</span>
                {' '}produit{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
              </p>
              <div className="flex gap-2 flex-wrap">
                {SORTS.map(s => (
                  <button key={s.value} onClick={() => setSortBy(s.value)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-2 border-black rounded-xl transition-all
                      ${sortBy === s.value ? 'bg-secondary text-white shadow-none translate-x-[1px] translate-y-[1px]' : 'bg-white text-on-surface hover:bg-secondary/5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}>
                    <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="font-bold text-on-surface-variant">Chargement des produits...</p>
              </div>
            ) : filtered.length === 0 ? (
              <FadeIn className="text-center py-20 text-on-surface-variant bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
                <span className="material-symbols-outlined text-7xl mb-4 block opacity-25">search_off</span>
                <p className="font-['Chewy'] text-3xl text-primary mb-3">Aucun produit trouvé</p>
                <p className="text-sm mb-6">Essayez d'élargir vos critères de recherche.</p>
                <button onClick={reset} className="px-8 py-3 bg-primary text-white font-extrabold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-xl text-sm">
                  Réinitialiser les filtres
                </button>
              </FadeIn>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                  {paginated.map((p, i) => <ProductCard key={p.id} produit={p} delay={i * 0.07} />)}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages}
                  onPageChange={page => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
              </>
            )}
          </section>
        </div>
      </div>
    </PageTransition>
  )
}

export default Boutique
