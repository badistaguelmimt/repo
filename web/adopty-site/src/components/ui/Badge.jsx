const Badge = ({ variant = 'default', children, className = '' }) => {
  const variants = {
    urgent: 'bg-[#ba1a1a] text-white border-white',
    espece: 'bg-[#fbfbe2] text-primary border-black',
    eco: 'bg-primary-fixed text-on-primary-fixed border-black',
    promo: 'bg-secondary text-white border-black',
    nouveau: 'bg-tertiary text-white border-black',
    default: 'bg-surface-container text-on-surface border-black',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border-2 shadow-sm ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
