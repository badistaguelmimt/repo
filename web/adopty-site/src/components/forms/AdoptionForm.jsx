import { useState } from 'react'
import { createDemandeAdoption } from '../../services/authApi'

const AdoptionForm = ({ animal, onClose }) => {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    typeLogement: '',
    jardin: '',
    animauxActuels: '',
    enfants: '',
    motivations: '',
    disponibilite: '',
    acceptConditions: false,
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.acceptConditions) {
      setError("Vous devez accepter les conditions d'adoption.")
      return
    }
    setIsLoading(true)
    setError(null)

    try {
      await createDemandeAdoption({
        IdAnimal: animal.id ?? animal.Id,
        TypeLogement: form.typeLogement,
        Jardin: form.jardin || null,
        Animaux: form.animauxActuels || null,
        Enfants: form.enfants || null,
        CommentaireDepart: form.motivations,
        Disponibilite: form.disponibilite || null,
      })
      setSubmitted(true)
    } catch (err) {
      const msg = err?.response?.data?.message || 'Une erreur est survenue lors de l\'envoi.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const inputCls = 'w-full bg-surface-container-lowest border-2 border-black px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary rounded-lg'
  const labelCls = "block font-['Plus_Jakarta_Sans'] font-bold text-sm mb-1.5 text-on-surface"

  const STEPS = ['Votre foyer', 'Motivation', 'Confirmation']

  const canNext = () => {
    if (step === 1) return !!form.typeLogement
    if (step === 2) return form.motivations.trim().length >= 30
    return true
  }

  if (submitted) return (
    <div className="text-center py-8 space-y-4">
      <div className="w-20 h-20 bg-primary-fixed border-4 border-black rounded-full flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <span className="material-symbols-outlined text-4xl text-primary">favorite</span>
      </div>
      <h3 className="font-['Chewy'] text-3xl text-primary">Demande envoyée !</h3>
      <p className="text-on-surface-variant max-w-sm mx-auto text-sm leading-relaxed">
        Votre dossier a été transmis au refuge. L'équipe vous contactera sous <strong>48h</strong> pour organiser
        une rencontre avec <strong>{animal?.nom || 'l\'animal'}</strong>.
      </p>
      <div className="bg-surface-container rounded-xl border-2 border-black p-4 text-left text-sm space-y-2 max-w-sm mx-auto">
        <p className="font-bold text-on-surface">📋 Prochaines étapes :</p>
        <p className="text-on-surface-variant">1. Étude de votre dossier par le refuge</p>
        <p className="text-on-surface-variant">2. Contact téléphonique sous 48h</p>
        <p className="text-on-surface-variant">3. Rencontre physique au refuge</p>
      </div>
      <button
        onClick={onClose}
        className="mt-4 px-8 py-3 bg-primary text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-lg"
      >
        Fermer
      </button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* En-tête animal */}
      {animal && (
        <div className="flex items-center gap-3 p-3 bg-primary-fixed rounded-xl border-2 border-black">
          <img src={animal.photo} alt={animal.nom} className="w-12 h-12 rounded-lg object-cover border-2 border-black" />
          <div>
            <p className="font-extrabold text-primary">{animal.nom}</p>
            <p className="text-xs text-on-surface-variant">{animal.race} · {animal.ageLabel}</p>
          </div>
        </div>
      )}

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => {
          const s = i + 1
          return (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors
                ${step > s ? 'bg-primary text-white' : step === s ? 'bg-secondary text-white' : 'bg-surface-container text-on-surface-variant'}`}>
                {step > s ? <span className="material-symbols-outlined text-base">check</span> : s}
              </div>
              {s < STEPS.length && (
                <div className={`h-0.5 flex-1 ${step > s ? 'bg-primary' : 'bg-outline-variant'}`} />
              )}
            </div>
          )
        })}
        <span className="ml-2 text-xs text-on-surface-variant font-bold whitespace-nowrap">{STEPS[step - 1]}</span>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 border-2 border-red-300 rounded-lg font-bold text-sm flex items-start gap-2">
          <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">error</span>
          {error}
        </div>
      )}

      {/* Étape 1 — Votre foyer */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Type de logement *</label>
            <select required className={inputCls} value={form.typeLogement} onChange={e => update('typeLogement', e.target.value)}>
              <option value="">Sélectionner...</option>
              <option>Appartement</option>
              <option>Maison</option>
              <option>Maison avec jardin</option>
              <option>Villa</option>
              <option>Ferme / terrain</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Espace extérieur</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              {[
                { label: 'Jardin privatif', icon: 'yard' },
                { label: 'Terrasse', icon: 'deck' },
                { label: 'Balcon', icon: 'balcony' },
                { label: 'Aucun', icon: 'apartment' }
              ].map(opt => (
                <label key={opt.label} className={`flex flex-col items-center justify-center gap-1 cursor-pointer px-3 py-3 rounded-xl border-2 transition-all text-sm font-bold
                  ${form.jardin === opt.label 
                    ? 'border-black bg-primary text-white shadow-none translate-x-[1px] translate-y-[1px]' 
                    : 'border-black bg-white text-on-surface hover:bg-primary/5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}>
                  <input type="radio" name="jardin" value={opt.label} checked={form.jardin === opt.label} onChange={e => update('jardin', e.target.value)} className="sr-only" />
                  <span className="material-symbols-outlined text-2xl">{opt.icon}</span>
                  <span className="text-center">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Animaux déjà présents dans le foyer</label>
            <input className={inputCls} value={form.animauxActuels} onChange={e => update('animauxActuels', e.target.value)} placeholder="Ex: 1 chat de 3 ans, aucun..." />
          </div>

          <div>
            <label className={labelCls}>Enfants à la maison</label>
            <input className={inputCls} value={form.enfants} onChange={e => update('enfants', e.target.value)} placeholder="Ex: 2 enfants de 5 et 8 ans..." />
          </div>
        </div>
      )}

      {/* Étape 2 — Motivation */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>
              Pourquoi souhaitez-vous adopter <strong>{animal?.nom}</strong> ? *
            </label>
            <textarea
              required
              className={inputCls + ' h-32 resize-none'}
              value={form.motivations}
              onChange={e => update('motivations', e.target.value)}
              placeholder="Décrivez votre situation, votre mode de vie, pourquoi cet animal vous correspond..."
            />
            <p className={`text-xs mt-1 ${form.motivations.length < 30 ? 'text-red-500' : 'text-secondary'}`}>
              {form.motivations.length < 30 ? `Minimum 30 caractères (${form.motivations.length}/30)` : '✓ Suffisamment détaillé'}
            </p>
          </div>

          <div>
            <label className={labelCls}>Vos disponibilités</label>
            <select className={inputCls} value={form.disponibilite} onChange={e => update('disponibilite', e.target.value)}>
              <option value="">Sélectionner...</option>
              <option>Je suis à la maison toute la journée</option>
              <option>Je travaille mais rentre le midi</option>
              <option>Je suis absent 8h par jour</option>
              <option>Horaires variables</option>
              <option>Télétravail partiel</option>
            </select>
          </div>
        </div>
      )}

      {/* Étape 3 — Confirmation */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-surface-container rounded-xl border-2 border-black p-4 space-y-3 text-sm">
            <h4 className="font-extrabold uppercase tracking-wide text-xs text-on-surface-variant">Récapitulatif</h4>
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-on-surface-variant">Animal :</span> <span className="font-bold">{animal?.nom}</span></div>
              <div><span className="text-on-surface-variant">Logement :</span> <span className="font-bold">{form.typeLogement}</span></div>
              {form.jardin && <div><span className="text-on-surface-variant">Extérieur :</span> <span className="font-bold">{form.jardin}</span></div>}
              {form.disponibilite && <div><span className="text-on-surface-variant">Dispo :</span> <span className="font-bold text-xs">{form.disponibilite}</span></div>}
            </div>
            <div>
              <span className="text-on-surface-variant">Motivation :</span>
              <p className="font-medium mt-1 text-on-surface italic line-clamp-3">"{form.motivations}"</p>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border-2 border-black hover:bg-surface-container transition-colors">
            <input
              required
              type="checkbox"
              checked={form.acceptConditions}
              onChange={e => update('acceptConditions', e.target.checked)}
              className="w-5 h-5 mt-0.5 border-2 border-black text-primary flex-shrink-0"
            />
            <span className="text-sm text-on-surface-variant">
              J'accepte les <strong className="text-primary">conditions d'adoption</strong> et m'engage à offrir un foyer stable, aimant et responsable.
            </span>
          </label>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            className="flex-1 py-3 border-2 border-black font-bold text-sm uppercase tracking-wider hover:bg-surface-container transition-colors rounded-lg"
          >
            ← Retour
          </button>
        )}
        {step < 3 ? (
          <button
            type="button"
            disabled={!canNext()}
            onClick={() => setStep(s => s + 1)}
            className="flex-1 py-3 bg-primary text-white font-bold text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continuer →
          </button>
        ) : (
          <button
            type="submit"
            disabled={isLoading || !form.acceptConditions}
            className="flex-1 py-3 bg-[#154212] text-white font-bold text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-lg ${isLoading ? 'animate-spin' : ''}`}>
              {isLoading ? 'sync' : 'send'}
            </span>
            {isLoading ? 'Envoi en cours...' : 'Soumettre ma demande'}
          </button>
        )}
      </div>
    </form>
  )
}

export default AdoptionForm
