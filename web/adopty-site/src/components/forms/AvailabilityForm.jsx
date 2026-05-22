import { useState } from 'react'
import { createDisponibilite, updateDisponibilite } from '../../services/authApi'

const RECURRENCE_OPTIONS = ['Aucune', 'Journalier', 'Hebdomadaire', 'Mensuel']

/**
 * AvailabilityForm — Création / édition d'un créneau de disponibilité.
 *
 * Champs DB : IdProfil, DateDebut, DateFin, Recurrence, Frequence, Disponibilite, RecurrenceFin
 *
 * initialData peut venir :
 *  - d'un clic sur un événement existant (champs DB : Id, DateDebut, DateFin, Recurrence...)
 *  - d'un clic sur une plage vide du calendrier (DateDebut, DateFin pré-remplis)
 */
const AvailabilityForm = ({ initialData = null, profilId, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState(null)

  const toDatetimeLocal = (val) => {
    if (!val) return ''
    try { return new Date(val).toISOString().slice(0, 16) } catch { return '' }
  }

  const [formData, setFormData] = useState({
    IdProfil:     profilId,
    DateDebut:    toDatetimeLocal(initialData?.DateDebut ?? initialData?.dateDebut),
    DateFin:      toDatetimeLocal(initialData?.DateFin   ?? initialData?.dateFin),
    Recurrence:   initialData?.Recurrence ?? 'Aucune',
    Frequence:    Number(initialData?.Frequence ?? 1),
    Disponibilite: initialData?.Disponibilite !== undefined
      ? Boolean(Number(initialData.Disponibilite))
      : true,
    RecurrenceFin: toDatetimeLocal(initialData?.RecurrenceFin)?.slice(0, 10) ?? '',
  })

  const hasRecurrence = formData.Recurrence !== 'Aucune'

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Durée en heures pour affichage
  const durationLabel = () => {
    if (!formData.DateDebut || !formData.DateFin) return null
    const diff = new Date(formData.DateFin) - new Date(formData.DateDebut)
    if (isNaN(diff) || diff <= 0) return null
    const h = Math.floor(diff / 3600000)
    const m = Math.round((diff % 3600000) / 60000)
    return h > 0 ? `${h}h${m > 0 ? m + 'min' : ''}` : `${m}min`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validations
    if (!formData.DateDebut) {
      setError('La date de début est requise.')
      return
    }
    if (formData.DateFin && new Date(formData.DateFin) <= new Date(formData.DateDebut)) {
      setError('La date de fin doit être après la date de début.')
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        IdProfil:     Number(profilId),
        DateDebut:    formData.DateDebut ? new Date(formData.DateDebut).toISOString() : null,
        DateFin:      formData.DateFin   ? new Date(formData.DateFin).toISOString()   : null,
        Recurrence:   formData.Recurrence,
        Frequence:    hasRecurrence ? Number(formData.Frequence) : null,
        Disponibilite: formData.Disponibilite,
        RecurrenceFin: hasRecurrence && formData.RecurrenceFin
          ? new Date(formData.RecurrenceFin).toISOString()
          : null,
      }

      if (initialData?.Id || initialData?.id) {
        await updateDisponibilite(initialData.Id ?? initialData.id, payload)
      } else {
        await createDisponibilite(payload)
      }

      onSuccess?.()
      onClose?.()
    } catch (err) {
      setError(err?.response?.data?.message || "Une erreur est survenue lors de l'enregistrement.")
    } finally {
      setIsLoading(false)
    }
  }

  const inputCls = "w-full bg-white border-2 border-black px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
  const labelCls = "text-xs font-bold uppercase tracking-wider text-on-surface-variant"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-error-container text-on-error-container border-2 border-black rounded-lg text-sm font-bold flex items-start gap-2">
          <span className="material-symbols-outlined text-base flex-shrink-0">error</span>
          {error}
        </div>
      )}

      {/* Disponible / Indisponible */}
      <div className="flex items-center gap-3 p-3 bg-surface-container border-2 border-black rounded-xl">
        <button
          type="button"
          role="switch"
          aria-checked={formData.Disponibilite}
          onClick={() => setFormData(prev => ({ ...prev, Disponibilite: !prev.Disponibilite }))}
          className={`relative w-12 h-6 rounded-full border-2 border-black transition-colors ${
            formData.Disponibilite ? 'bg-green-500' : 'bg-red-400'
          }`}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-white border border-black rounded-full transition-transform ${
            formData.Disponibilite ? 'translate-x-6' : 'translate-x-0.5'
          }`} />
        </button>
        <div>
          <p className={`font-extrabold text-sm ${formData.Disponibilite ? 'text-green-700' : 'text-red-600'}`}>
            {formData.Disponibilite ? '✅ Disponible' : '❌ Indisponible'}
          </p>
          <p className="text-[10px] text-on-surface-variant">
            {formData.Disponibilite
              ? 'Ce créneau sera visible comme disponible pour les clients.'
              : 'Ce créneau sera marqué comme non disponible.'}
          </p>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Date & heure de début *</label>
          <input
            required
            type="datetime-local"
            name="DateDebut"
            value={formData.DateDebut}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>
            Date & heure de fin
            {durationLabel() && (
              <span className="ml-2 px-1.5 py-0.5 bg-primary text-white rounded text-[10px] normal-case">
                {durationLabel()}
              </span>
            )}
          </label>
          <input
            type="datetime-local"
            name="DateFin"
            value={formData.DateFin}
            min={formData.DateDebut}
            onChange={handleChange}
            className={inputCls}
          />
        </div>
      </div>

      {/* Récurrence */}
      <div className="space-y-2">
        <label className={labelCls}>Récurrence</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RECURRENCE_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, Recurrence: opt }))}
              className={`py-2 px-3 border-2 border-black rounded-lg text-xs font-bold transition-all ${
                formData.Recurrence === opt
                  ? 'bg-primary text-white shadow-none'
                  : 'bg-white hover:bg-primary/5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Fréquence + Date de fin de récurrence (conditionnel) */}
      {hasRecurrence && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-surface-container border-2 border-black rounded-xl">
          <div className="space-y-2">
            <label className={labelCls}>Fréquence (tous les N...)</label>
            <input
              type="number"
              min="1"
              max="30"
              name="Frequence"
              value={formData.Frequence}
              onChange={handleChange}
              className={inputCls}
            />
            <p className="text-[10px] text-on-surface-variant">
              Ex: 1 = chaque {formData.Recurrence === 'Journalier' ? 'jour' : formData.Recurrence === 'Hebdomadaire' ? 'semaine' : 'mois'}
            </p>
          </div>
          <div className="space-y-2">
            <label className={labelCls}>Fin de récurrence (optionnel)</label>
            <input
              type="date"
              name="RecurrenceFin"
              value={formData.RecurrenceFin}
              onChange={handleChange}
              className={inputCls}
            />
            <p className="text-[10px] text-on-surface-variant">Laissez vide pour une récurrence indéfinie.</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3.5 border-2 border-black font-bold uppercase tracking-widest text-sm hover:bg-surface-container transition-all rounded-lg"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3.5 bg-primary text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-extrabold uppercase tracking-widest text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 transition-all rounded-lg"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enregistrement...
            </span>
          ) : (
            initialData?.Id || initialData?.id ? '✏️ Modifier' : '+ Ajouter le créneau'
          )}
        </button>
      </div>
    </form>
  )
}

export default AvailabilityForm
