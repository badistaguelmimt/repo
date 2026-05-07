import { useState } from 'react'
import { createPrestataireProfile, updatePrestataireProfile } from '../../services/authApi'

// initialData contient les champs tels que retournés par la DB :
// { Id, IdUtilisateur, Experience, TarifHoraire, ZoneIntervention, TypeService, Statut, Bio, NoteMoyenne }
const PrestataireProfileForm = ({ initialData = null, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // On utilise Id (majuscule) comme la DB le retourne
  const profileId = initialData?.Id ?? initialData?.id ?? null

  const [formData, setFormData] = useState({
    Experience: initialData?.Experience ?? initialData?.experience ?? '',
    TarifHoraire: initialData?.TarifHoraire ?? initialData?.prixHeure ?? '',
    ZoneIntervention: initialData?.ZoneIntervention ?? initialData?.ville ?? '',
    TypeService: initialData?.TypeService ?? initialData?.typeServiceId ?? 1,
    Bio: initialData?.Bio ?? initialData?.description ?? '',
    Statut: initialData?.Statut ?? initialData?.statutId ?? 1,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (profileId) {
        // Édition
        await updatePrestataireProfile(profileId, formData)
      } else {
        // Création
        await createPrestataireProfile(formData)
      }
      onSuccess()
      onClose()
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Une erreur est survenue lors de l'enregistrement."
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-error-container text-on-error-container border-2 border-black rounded-lg font-bold text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Expérience (années)
          </label>
          <input
            required
            type="number"
            min="0"
            name="Experience"
            value={formData.Experience}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
            placeholder="Ex: 5"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Tarif horaire (DZD)
          </label>
          <input
            required
            type="number"
            min="0"
            step="100"
            name="TarifHoraire"
            value={formData.TarifHoraire}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
            placeholder="Ex: 1500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Zone d'intervention
          </label>
          <input
            required
            name="ZoneIntervention"
            value={formData.ZoneIntervention}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
            placeholder="Ex: Alger, Oran..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Type de service
          </label>
          <select
            name="TypeService"
            value={formData.TypeService}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          >
            <option value="1">Baby-sitting</option>
            <option value="2">Promenade</option>
            <option value="3">Toilettage</option>
            <option value="4">Vétérinaire</option>
            <option value="5">Dressage</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          Bio / Présentation
        </label>
        <textarea
          name="Bio"
          value={formData.Bio}
          onChange={handleChange}
          rows={4}
          className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          placeholder="Présentez-vous et décrivez vos services..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-4 border-2 border-black font-bold uppercase tracking-widest hover:bg-surface-container transition-all"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-4 bg-primary text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-extrabold uppercase tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 transition-all"
        >
          {isLoading ? 'Enregistrement...' : profileId ? 'Modifier le profil' : 'Créer mon profil'}
        </button>
      </div>
    </form>
  )
}

export default PrestataireProfileForm
