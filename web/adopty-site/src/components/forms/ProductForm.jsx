import { useState } from 'react'
import { createProduit, updateProduit } from '../../services/authApi'

// initialData contient les champs du mapper (lowercase) ou directement de la DB (uppercase)
const ProductForm = ({ initialData = null, refugeId, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const productId = initialData?.id ?? initialData?.Id ?? null

  const [formData, setFormData] = useState({
    Nom: initialData?.nom ?? initialData?.Nom ?? '',
    Prix: initialData?.prix ?? initialData?.Prix ?? '',
    Stock: initialData?.stock ?? initialData?.Stock ?? '',
    Categorie: initialData?.categorie ?? initialData?.Categorie ?? 'Accessoires',
    Reduction: initialData?.reduction ?? initialData?.Reduction ?? 0,
    Disponibilite: initialData?.disponibilite ?? initialData?.Disponibilite ?? true,
    IdRefuge: refugeId ?? initialData?.idRefuge ?? initialData?.IdRefuge,
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

    // Normaliser les types numériques avant envoi (les inputs HTML retournent des strings)
    const payload = {
      ...formData,
      Prix: parseFloat(formData.Prix) || 0,
      Stock: parseInt(formData.Stock, 10) || 0,
      Reduction: parseFloat(formData.Reduction) || 0,
      Disponibilite: Boolean(formData.Disponibilite),
      IdRefuge: Number(formData.IdRefuge),
    }

    try {
      if (productId) {
        await updateProduit(productId, payload)
      } else {
        await createProduit(payload)
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

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nom du produit</label>
        <input
          required
          name="Nom"
          value={formData.Nom}
          onChange={handleChange}
          className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          placeholder="Ex: Croquettes Bio Premium"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Prix (DZD)</label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            name="Prix"
            value={formData.Prix}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Stock</label>
          <input
            required
            type="number"
            min="0"
            name="Stock"
            value={formData.Stock}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Catégorie</label>
          <select
            name="Categorie"
            value={formData.Categorie}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          >
            <option value="Alimentation">Alimentation</option>
            <option value="Accessoires">Accessoires</option>
            <option value="Hygiène">Hygiène</option>
            <option value="Jouets">Jouets</option>
            <option value="Santé">Santé</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Réduction (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            name="Reduction"
            value={formData.Reduction}
            onChange={handleChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 py-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="Disponibilite"
            checked={Boolean(formData.Disponibilite)}
            onChange={handleChange}
            className="w-5 h-5 border-2 border-black rounded text-primary focus:ring-0"
          />
          <span className="text-sm font-bold">Disponible en ligne</span>
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
          {isLoading ? 'Enregistrement...' : productId ? 'Modifier le produit' : 'Ajouter le produit'}
        </button>
      </div>
    </form>
  )
}

export default ProductForm
