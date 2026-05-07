import { FadeIn } from '../Animations'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const showMax = 5 // Maximum number of page buttons to show
    
    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      // Always show first, last, and pages around current
      pages.push(1)
      
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)
      
      if (currentPage === 1) end = 3
      if (currentPage === totalPages) start = totalPages - 2
      
      if (start > 2) pages.push('...')
      
      for (let i = start; i <= end; i++) pages.push(i)
      
      if (end < totalPages - 1) pages.push('...')
      
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <FadeIn className="flex flex-wrap items-center justify-center gap-2 mt-12 mb-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-4 py-2 bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold text-sm transition-all"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Précédent
      </button>

      <div className="flex items-center gap-2 hidden sm:flex">
        {getPageNumbers().map((pageNum, idx) => (
          pageNum === '...' ? (
            <span key={`dots-${idx}`} className="px-2 font-bold text-on-surface-variant">...</span>
          ) : (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-10 h-10 flex items-center justify-center border-2 border-black rounded-lg font-bold transition-all ${
                currentPage === pageNum 
                  ? 'bg-primary text-white shadow-none translate-x-[2px] translate-y-[2px]' 
                  : 'bg-white hover:bg-surface-container shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              {pageNum}
            </button>
          )
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-4 py-2 bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold text-sm transition-all"
      >
        Suivant
        <span className="material-symbols-outlined text-base">arrow_forward</span>
      </button>
    </FadeIn>
  )
}

export default Pagination
