// Composants UI partagés pour le dashboard admin

export const Badge = ({ label, color = 'default' }) => {
  const c = {
    success: 'bg-primary-fixed text-on-primary-fixed-variant',
    danger:  'bg-error-container text-on-error-container',
    warning: 'bg-secondary-fixed text-on-secondary-fixed',
    default: 'bg-surface-container text-on-surface',
  }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border border-black ${c[color] ?? c.default}`}>
      {label}
    </span>
  )
}

export const ActionBtn = ({ icon, onClick, title, variant = 'default', disabled }) => {
  const v = {
    default: 'hover:bg-surface-container border-black',
    danger:  'hover:bg-error-container text-error border-red-300',
    success: 'hover:bg-primary-fixed text-primary border-green-300',
    warn:    'hover:bg-orange-50 text-orange-600 border-orange-300',
  }
  return (
    <button
      onClick={onClick} title={title} disabled={disabled}
      className={`p-1.5 border rounded transition-colors disabled:opacity-40 ${v[variant] ?? v.default}`}
    >
      <span className="material-symbols-outlined text-base">{icon}</span>
    </button>
  )
}

export const EmptyRow = ({ colSpan, icon = 'inbox', message = 'Aucune donnée.' }) => (
  <tr>
    <td colSpan={colSpan} className="px-5 py-10 text-center text-on-surface-variant">
      <span className="material-symbols-outlined text-5xl mb-2 block opacity-30">{icon}</span>
      <p className="font-bold text-sm">{message}</p>
    </td>
  </tr>
)

export const THead = ({ cols }) => (
  <thead className="bg-surface-container border-b-4 border-black">
    <tr>
      {cols.map(h => (
        <th key={h} className="px-4 py-3 text-left font-extrabold text-xs uppercase tracking-wider text-on-surface-variant">
          {h}
        </th>
      ))}
    </tr>
  </thead>
)

export const Field = ({ label, name, value, onChange, type = 'text', options }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{label}</label>
    {options ? (
      <select name={name} value={value ?? ''} onChange={onChange}
        className="border-2 border-black rounded px-3 py-2 text-sm bg-surface-container-lowest focus:outline-none focus:border-primary">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    ) : (
      <input type={type} name={name} value={value ?? ''} onChange={onChange}
        className="border-2 border-black rounded px-3 py-2 text-sm bg-surface-container-lowest focus:outline-none focus:border-primary" />
    )}
  </div>
)

export const SectionTable = ({ children, className = '' }) => (
  <div className={`bg-surface-container-lowest border-4 border-black rounded-xl overflow-x-auto shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${className}`}>
    <table className="w-full text-sm">{children}</table>
  </div>
)
