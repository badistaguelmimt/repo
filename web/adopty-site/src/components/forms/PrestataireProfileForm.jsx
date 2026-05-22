import { useState } from 'react'
import { createPrestataireProfile, updatePrestataireProfile } from '../../services/authApi'

// Seuls les 2 types de service disponibles sur la plateforme
// IDs correspondant à la table `type_service` en DB
const TYPE_SERVICE_OPTIONS = [
  { value: 3, label: 'Pet-sitting',  icon: 'home',            desc: 'Garde à domicile ou chez vous' },
  { value: 4, label: 'Promenade',    icon: 'directions_walk', desc: 'Sorties et balades quotidiennes' },
]

/**
 * Formulaire de création / édition d'un profil prestataire.
 * Champs exposés : TypeService, Experience, TarifHoraire, ZoneIntervention, Bio
 * Champs serveur (non exposés) : NoteMoyenne, Statut, IdUtilisateur
 */
const PrestataireProfileForm = ({ initialData = null, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState(null)

  const profileId = initialData?.Id ?? initialData?.id ?? null

  const [formData, setFormData] = useState({
    TypeService:      Number(initialData?.TypeService ?? initialData?.typeServiceId ?? 3),
    Experience:       String(initialData?.Experience ?? initialData?.experience ?? ''),
    TarifHoraire:     String(initialData?.TarifHoraire ?? initialData?.prixHeure ?? ''),
    ZoneIntervention: initialData?.ZoneIntervention ?? initialData?.ville ?? '',
    Bio:              initialData?.Bio ?? initialData?.description ?? '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!formData.ZoneIntervention.trim()) {
      setError("La zone d'intervention est requise.")
      setIsLoading(false)
      return
    }
    if (Number(formData.TarifHoraire) < 100) {
      setError('Le tarif horaire minimum est de 100 DZD.')
      setIsLoading(false)
      return
    }

    try {
      const payload = {
        TypeService:      Number(formData.TypeService),
        Experience:       Number(formData.Experience) || 0,
        TarifHoraire:     Number(formData.TarifHoraire),
        ZoneIntervention: formData.ZoneIntervention.trim(),
        Bio:              formData.Bio.trim() || null,
      }

      if (profileId) {
        await updatePrestataireProfile(profileId, payload)
      } else {
        await createPrestataireProfile(payload)
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Une erreur est survenue lors de l'enregistrement.")
    } finally {
      setIsLoading(false)
    }
  }

  const inputCls = "w-full bg-white border-2 border-black px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
  const labelCls = "text-xs font-bold uppercase tracking-wider text-on-surface-variant"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-error-container text-on-error-container border-2 border-black rounded-lg font-bold text-sm flex items-start gap-2">
          <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">error</span>
          {error}
        </div>
      )}

      {/* Type de service */}
      <div className="space-y-2">
        <label className={labelCls}>Type de service *</label>
        <div className="grid grid-cols-2 gap-3">
          {TYPE_SERVICE_OPTIONS.map(({ value, label, icon, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, TypeService: value }))}
              className={`flex flex-col items-center gap-2 p-4 border-2 border-black rounded-xl text-sm font-bold transition-all ${
                Number(formData.TypeService) === value
                  ? 'bg-primary text-white shadow-none translate-x-[1px] translate-y-[1px]'
                  : 'bg-white text-on-surface hover:bg-primary/5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <span className={`material-symbols-outlined text-3xl ${Number(formData.TypeService) === value ? 'text-white' : 'text-primary'}`}>{icon}</span>
              <span className="font-extrabold">{label}</span>
              <span className={`text-[10px] text-center font-normal ${Number(formData.TypeService) === value ? 'text-white/80' : 'text-on-surface-variant'}`}>{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Expérience + Tarif */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className={labelCls}>Expérience (années)</label>
          <input
            type="number" min="0" max="50"
            name="Experience"
            value={formData.Experience}
            onChange={handleChange}
            className={inputCls}
            placeholder="Ex: 5"
          />
        </div>
        <div className="space-y-2">
          <label className={labelCls}>Tarif horaire (DZD) *</label>
          <div className="relative">
            <input
              required type="number" min="100" step="50"
              name="TarifHoraire"
              value={formData.TarifHoraire}
              onChange={handleChange}
              className={inputCls + ' pr-16'}
              placeholder="Ex: 1500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant">DZD/h</span>
          </div>
        </div>
      </div>

      {/* Zone d'intervention */}
      <div className="space-y-2">
        <label className={labelCls}>Zone d'intervention *</label>
        <input
          required
          name="ZoneIntervention"
          value={formData.ZoneIntervention}
          onChange={handleChange}
          className={inputCls}
          placeholder="Ex: Alger, Oran, Tizi-Ouzou..."
        />
        <p className="text-[10px] text-on-surface-variant">Ville ou wilaya où vous proposez vos services.</p>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label className={labelCls}>Présentation</label>
        <textarea
          name="Bio"
          value={formData.Bio}
          onChange={handleChange}
          rows={4}
          className={inputCls}
          placeholder="Décrivez votre expérience, votre approche et ce qui vous distingue..."
          maxLength={1000}
        />
        <p className="text-[10px] text-on-surface-variant text-right">{formData.Bio.length}/1000</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose}
          className="flex-1 py-3.5 border-2 border-black font-bold uppercase tracking-widest text-sm hover:bg-surface-container transition-all rounded-lg">
          Annuler
        </button>
        <button type="submit" disabled={isLoading}
          className="flex-1 py-3.5 bg-primary text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-extrabold uppercase tracking-widest text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 transition-all rounded-lg">
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enregistrement...
            </span>
          ) : (
            profileId ? 'Modifier le profil' : 'Créer mon profil'
          )}
        </button>
      </div>
    </form>
  )
}

export default PrestataireProfileForm
