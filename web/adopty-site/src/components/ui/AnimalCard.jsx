import { Link } from 'react-router-dom'
import { FadeIn } from '../Animations'
import Badge from './Badge'

// Badges de compatibilité : icône + label + condition
const COMPAT_BADGES = [
  { key: 'sociableEnfant', icon: 'child_care', label: 'Enfants', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { key: 'sociableAnimaux', icon: 'pets', label: 'Animaux', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { key: 'sterilise', icon: 'content_cut', label: 'Stérilisé', color: 'bg-purple-100 text-purple-700 border-purple-300' },
]

// Badge santé avec couleur selon l'état
const SanteColor = {
  'Mauvais': 'bg-red-100 text-red-700 border-red-300',
  'Bon': 'bg-amber-100 text-amber-700 border-amber-300',
  'Excellent': 'bg-green-100 text-green-700 border-green-300',
}

const AnimalCard = ({ animal, delay = 0 }) => {
  // Normaliser les booléens de compatibilité
  const toBool = (val) => {
    if (typeof val === 'boolean') return val
    if (typeof val === 'string') return val.toLowerCase() === 'oui' || val === '1' || val === 'true'
    if (typeof val === 'number') return val === 1
    return false
  }

  const sociableEnfant = toBool(animal.SociableEnfant ?? animal.sociableEnfant)
  const sociableAnimaux = toBool(animal.SociableAnimaux ?? animal.sociableAnimaux)
  const sterilise = toBool(animal.Sterilise ?? animal.sterilise)

  // État de santé normalisé
  const etatSante = animal.EtatSantee ?? animal.etatSante ?? animal.sante ?? null
  const santeNorm = typeof etatSante === 'string' && ['Mauvais', 'Bon', 'Excellent'].includes(etatSante)
    ? etatSante : null

  // Genre : 'oui' = Mâle, 'non' = Femelle, ou valeur directe
  const genreLabel = (() => {
    const g = animal.Genre ?? animal.genre ?? ''
    if (g === 'oui' || g.toLowerCase() === 'male' || g.toLowerCase() === 'mâle') return '♂ Mâle'
    if (g === 'non' || g.toLowerCase() === 'femelle') return '♀ Femelle'
    return null
  })()

  const compatActive = [
    sociableEnfant && { ...COMPAT_BADGES[0] },
    sociableAnimaux && { ...COMPAT_BADGES[1] },
    sterilise && { ...COMPAT_BADGES[2] },
  ].filter(Boolean)

  return (
    <FadeIn delay={delay} className="bg-surface-container-lowest border-4 border-black rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(21,66,18,1)] group hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(21,66,18,1)] transition-all duration-200 flex flex-col">
      {/* Photo */}
      <div className="h-52 overflow-hidden relative flex-shrink-0">
        <img
          alt={animal.nom}
          src={animal.photo}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {animal.urgent && (
          <Badge variant="urgent" className="absolute top-3 right-3">Urgent</Badge>
        )}
        <Badge variant="espece" className="absolute top-3 left-3">{animal.espece}</Badge>

        {/* Genre badge en bas de l'image */}
        {genreLabel && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
            {genreLabel}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4 flex flex-col flex-grow gap-2">
        {/* Nom + Age */}
        <div className="flex justify-between items-start">
          <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-primary leading-tight">{animal.nom}</h3>
          <span className="text-secondary font-bold text-sm flex-shrink-0 ml-2">{animal.ageLabel}</span>
        </div>

        {/* Race + Taille */}
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{animal.race}</p>
          <span className="text-on-surface-variant/40">·</span>
          <span className="text-xs font-bold text-on-surface-variant">{animal.taille}</span>
        </div>

        {/* Description */}
        <p className="text-on-surface-variant text-sm line-clamp-2 font-body flex-grow">{animal.description}</p>

        {/* Tempérament */}
        <div className="flex flex-wrap gap-1.5">
          {animal.caractere.slice(0, 3).map(c => (
            <span key={c} className="text-xs font-bold uppercase tracking-tight bg-surface-variant px-2 py-0.5 border border-black/20 rounded-md">
              {c}
            </span>
          ))}
        </div>

        {/* Compatibilités + Santé */}
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-outline-variant">
          {/* État de santé */}
          {santeNorm && (
            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 border rounded-full ${SanteColor[santeNorm]}`}>
              <span className="material-symbols-outlined text-xs">
                {santeNorm === 'Mauvais' ? 'sentiment_dissatisfied' : santeNorm === 'Bon' ? 'sentiment_neutral' : 'sentiment_satisfied'}
              </span>
              {santeNorm}
            </span>
          )}

          {/* Badges compatibilité */}
          {compatActive.map(badge => (
            <span
              key={badge.key}
              title={badge.label}
              className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 border rounded-full ${badge.color}`}
            >
              <span className="material-symbols-outlined text-xs">{badge.icon}</span>
              {badge.label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <Link
          to={`/profil/${animal.id}`}
          className="block text-center w-full py-3 bg-primary text-white font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-widest border-2 border-black hover:translate-x-[2px] hover:translate-y-[2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all rounded-lg mt-auto"
        >
          En savoir plus
        </Link>
      </div>
    </FadeIn>
  )
}

export default AnimalCard
