import { FadeIn } from '../Animations'

const StatCard = ({ icon, label, value, sub, color = 'primary', delay = 0 }) => {
  const colorMap = {
    primary: 'bg-primary-fixed text-on-primary-fixed-variant border-primary',
    secondary: 'bg-secondary-fixed text-on-secondary-fixed border-secondary',
    tertiary: 'bg-tertiary-fixed text-on-tertiary-fixed border-tertiary',
    surface: 'bg-surface-container-high text-on-surface border-outline-variant',
  }

  return (
    <FadeIn delay={delay} className={`p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${colorMap[color]}`}>
      <div className="flex items-start justify-between mb-4">
        <span className="material-symbols-outlined text-3xl opacity-70">{icon}</span>
        {sub && <span className="text-xs font-bold uppercase tracking-wider opacity-60 bg-black/10 px-2 py-0.5 rounded-full">{sub}</span>}
      </div>
      <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-4xl mb-1">{value}</p>
      <p className="text-sm font-bold uppercase tracking-wider opacity-70">{label}</p>
    </FadeIn>
  )
}

export default StatCard
