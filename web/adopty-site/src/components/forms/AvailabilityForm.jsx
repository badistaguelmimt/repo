import { useState } from 'react'
import { createDisponibilite, updateDisponibilite } from '../../services/authApi'

const AvailabilityForm = ({ initialData = null, profilId, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    IdProfil: profilId,
    DateDebut: initialData?.dateDebut || '',
    DateFin: initialData?.dateFin || '',
    Recurrence: initialData?.recurrence || 'Journalier',
    Frequence: initialData?.frequence || 1,
    Disponibilite: initialData?.disponible !== undefined ? initialData.disponible : true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (initialData?.id) {
        await updateDisponibilite(initialData.id, formData)
      } else {
        await createDisponibilite(formData)
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'enregistrement.')
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
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Date de début</label>
          <input
            required
            type="datetime-local"
            name="DateDebut"
            value={formData.DateDebut}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Date de fin (optionnel)</label>
          <input
            type="datetime-local"
            name="DateFin"
            value={formData.DateFin}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Récurrence</label>
          <select
            name="Recurrence"
            value={formData.Recurrence}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          >
            <option value="Aucune">Aucune</option>
            <option value="Journalier">Journalier</option>
            <option value="Hebdomadaire">Hebdomadaire</option>
            <option value="Mensuel">Mensuel</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Fréquence</label>
          <input
            type="number"
            min="1"
            name="Frequence"
            value={formData.Frequence}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 py-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="Disponibilite"
            checked={formData.Disponibilite}
            onChange={handleChange}
            className="w-5 h-5 border-2 border-black rounded text-primary focus:ring-0"
          />
          <span className="text-sm font-bold">Actif / Disponible</span>
        </label>
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
          {isLoading ? 'Enregistrement...' : initialData ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  )
}

export default AvailabilityForm
