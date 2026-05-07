import { useState, useEffect } from 'react'
import { createAnimal, updateAnimal } from '../../services/authApi'
import { getRaces, getStatuts } from '../../services/publicApi'

// ─── Constantes ────────────────────────────────────────────────────────────
const ETATS_SANTE = ['Mauvais', 'Bon', 'Excellent']
const NIVEAUX_ENERGIE = ['Bas', 'Moyen', 'Haut']
const TEMPERAMENTS = [
  'Calme', 'Joueur', 'Sociable', 'Affectueux',
  'Indépendant', 'Curieux', 'Protecteur', 'Sportif',
]

// ─── Helpers ──────────────────────────────────────────────────────────────
const boolFromBdd = (val) => {
  if (typeof val === 'boolean') return val
  if (typeof val === 'number') return val === 1
  if (typeof val === 'string') return val.toLowerCase() === 'oui'
  return false
}

const genreFromBdd = (val) => {
  // DB stocke 'oui' = Mâle, 'non' = Femelle.
  // Le formulaire envoie 'Male'/'Femelle' (le backend se charge de la conversion).
  if (!val) return 'Male'
  const v = String(val).toLowerCase()
  if (v === 'oui' || v === 'male' || v === 'mâle') return 'Male'
  return 'Femelle'
}

// ─── Composant champ numérique avec boutons +/- ────────────────────────────
const NumberSpinner = ({ label, name, value, onChange, min = 0, max = 999, step = 1, unit = '' }) => {
  const numVal = Number(value) || 0

  const decrement = () => {
    const newVal = Math.max(min, parseFloat((numVal - step).toFixed(2)))
    onChange({ target: { name, value: String(newVal), type: 'number' } })
  }
  const increment = () => {
    const newVal = Math.min(max, parseFloat((numVal + step).toFixed(2)))
    onChange({ target: { name, value: String(newVal), type: 'number' } })
  }
  const handleInput = (e) => {
    const raw = e.target.value
    if (raw === '' || raw === '-') {
      onChange({ target: { name, value: raw, type: 'number' } })
      return
    }
    const num = parseFloat(raw)
    if (!isNaN(num)) {
      const clamped = Math.min(max, Math.max(min, parseFloat(num.toFixed(2))))
      onChange({ target: { name, value: String(clamped), type: 'number' } })
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
        {label}{unit && <span className="text-on-surface-variant/60 ml-1 normal-case">({unit})</span>}
      </label>
      <div className="flex items-center border-2 border-black rounded-lg overflow-hidden bg-white">
        <button
          type="button"
          onClick={decrement}
          className="w-11 h-11 flex items-center justify-center bg-surface-container hover:bg-primary hover:text-white font-extrabold text-xl border-r-2 border-black transition-colors flex-shrink-0"
          tabIndex={-1}
        >
          −
        </button>
        <input
          type="number"
          name={name}
          value={value}
          onChange={handleInput}
          min={min}
          max={max}
          step={step}
          className="flex-1 text-center font-extrabold text-lg py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={increment}
          className="w-11 h-11 flex items-center justify-center bg-surface-container hover:bg-primary hover:text-white font-extrabold text-xl border-l-2 border-black transition-colors flex-shrink-0"
          tabIndex={-1}
        >
          +
        </button>
      </div>
    </div>
  )
}

// ─── Sélecteur de tempérament multi-choix ─────────────────────────────────
const TemperamentPicker = ({ selected, onChange }) => {
  const toggle = (t) => {
    const next = selected.includes(t)
      ? selected.filter(x => x !== t)
      : [...selected, t]
    onChange(next)
  }

  const tempIcons = {
    'Calme': 'self_improvement',
    'Joueur': 'sports_esports',
    'Sociable': 'group',
    'Affectueux': 'favorite',
    'Indépendant': 'explore',
    'Curieux': 'search',
    'Protecteur': 'shield',
    'Sportif': 'fitness_center'
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
        Tempérament <span className="text-on-surface-variant/60 normal-case">(plusieurs choix)</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {TEMPERAMENTS.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => toggle(t)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-2 border-black rounded-xl transition-all
              ${selected.includes(t)
                ? 'bg-secondary text-white shadow-none translate-x-[1px] translate-y-[1px]'
                : 'bg-white text-on-surface hover:bg-primary/5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
          >
            {tempIcons[t] && <span className="material-symbols-outlined text-[16px]">{tempIcons[t]}</span>}
            <span>{t}</span>
          </button>
        ))}
      </div>
      {selected.length === 0 && (
        <p className="text-xs text-on-surface-variant/60">Sélectionnez au moins un tempérament</p>
      )}
    </div>
  )
}

// ─── Checkbox stylée ───────────────────────────────────────────────────────
const CheckboxField = ({ name, checked, onChange, label, icon }) => (
  <label className={`flex flex-col items-center gap-2 cursor-pointer p-4 rounded-xl border-2 transition-all select-none
    ${checked ? 'border-primary bg-primary/5 shadow-none' : 'border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]'}
  `}>
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="sr-only"
    />
    <span className={`material-symbols-outlined text-3xl ${checked ? 'text-primary' : 'text-on-surface-variant'}`}>
      {icon}
    </span>
    <span className={`text-xs font-extrabold uppercase tracking-wide ${checked ? 'text-primary' : 'text-on-surface-variant'}`}>
      {label}
    </span>
    <div className={`w-5 h-5 rounded-md border-2 border-black flex items-center justify-center ${checked ? 'bg-primary' : 'bg-white'}`}>
      {checked && <span className="material-symbols-outlined text-white text-sm">check</span>}
    </div>
  </label>
)

// ─── Composant principal ───────────────────────────────────────────────────
const AnimalForm = ({ initialData = null, refugeId, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [races, setRaces] = useState([])
  const [statuts, setStatuts] = useState([])

  const animalId = initialData?.id ?? initialData?.Id ?? null

  // Extraire les tempéraments initiaux
  const initialTemperaments = (() => {
    const raw = initialData?.Temperament ?? initialData?.caractere ?? ''
    if (Array.isArray(raw)) return raw.filter(t => TEMPERAMENTS.includes(t))
    if (typeof raw === 'string') return raw.split(/[,\-/|]/).map(s => s.trim()).filter(t => TEMPERAMENTS.includes(t))
    return []
  })()

  // Espèce détectée automatiquement depuis la race
  const [especeLabel, setEspeceLabel] = useState('')

  const [formData, setFormData] = useState({
    Nom: initialData?.nom ?? initialData?.Nom ?? '',
    // Prenom = description/histoire (varchar 1024 en BDD)
    Prenom: initialData?.Prenom ?? initialData?.prenom ?? initialData?.description ?? '',
    Age: String(initialData?.age ?? initialData?.Age ?? 0),
    // DB Genre enum: 'oui'=Mâle / 'non'=Femelle — formulaire envoie 'Male'/'Femelle'
    Genre: genreFromBdd(initialData?.Genre),
    // Poids en kg (float)
    Poids: String(initialData?.Poids ?? (initialData?.poids
      ? parseFloat(String(initialData.poids).replace('kg', ''))
      : 0.0)
    ),
    // Taille en cm (float) — le backend détermine Petit/Moyen/Grand
    Taille: String(initialData?.Taille ?? 50),
    Couleur: initialData?.Couleur ?? '',
    EtatSantee: initialData?.EtatSantee ?? 'Bon',
    NiveauEnergetique: initialData?.NiveauEnergetique ?? 'Moyen',
    Statut: initialData?.statutId ?? initialData?.Statut ?? 1,
    Race: initialData?.raceId ?? initialData?.Race ?? '',
    IdRefuge: refugeId ?? initialData?.idRefuge ?? initialData?.IdRefuge,
    Sterilise: boolFromBdd(initialData?.Sterilise),
    SociableEnfant: boolFromBdd(initialData?.SociableEnfant),
    SociableAnimaux: boolFromBdd(initialData?.SociableAnimaux),
  })

  // Tempérament séparé (liste)
  const [temperaments, setTemperaments] = useState(initialTemperaments)
  const [photos, setPhotos] = useState([])

  // Quand la liste des races est chargée, déduire l'espèce de la race sélectionnée
  const updateEspece = (raceId, racesList) => {
    const found = racesList.find(r => String(r.Id) === String(raceId))
    setEspeceLabel(found?.EspeceNom ?? '')
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [racesData, statutsData] = await Promise.all([getRaces(), getStatuts()])
        const racesList = Array.isArray(racesData) ? racesData : []
        setRaces(racesList)
        setStatuts(Array.isArray(statutsData) ? statutsData : [])
        // Sélectionner la première race si aucune n'est définie
        const currentRace = formData.Race || (racesList[0]?.Id ?? '')
        if (!formData.Race && racesList.length > 0) {
          setFormData(prev => ({ ...prev, Race: racesList[0].Id }))
        }
        updateEspece(currentRace, racesList)
      } catch (err) {
        console.error('Erreur chargement listes:', err)
      }
    }
    fetchData()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Si on change la race, mettre à jour l'espèce affichée
    if (name === 'Race') {
      updateEspece(value, races)
    }
  }

  const handlePhotoChange = (e) => {
    setPhotos(Array.from(e.target.files))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Construire le payload
    const payload = {
      ...formData,
      Age: parseInt(formData.Age, 10) || 0,
      Poids: parseFloat(formData.Poids) || 0,
      // Taille en cm (float) — le backend la catégorise en Petit/Moyen/Grand
      Taille: parseFloat(formData.Taille) || 50,
      // Genre : 'Male'/'Femelle' → backend convertit en 'oui'/'non'
      // Sterilise/SociableEnfant/SociableAnimaux : le backend accepte true/false
      Temperament: temperaments.join(', '),
      Race: parseInt(formData.Race, 10),
      Statut: parseInt(formData.Statut, 10),
    }

    try {
      if (animalId) {
        await updateAnimal(animalId, payload)
      } else {
        const data = new FormData()
        Object.entries(payload).forEach(([key, val]) => {
          data.append(key, val)
        })
        photos.forEach(photo => data.append('photos', photo))
        await createAnimal(data)
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
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto px-1 pb-2">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border-2 border-red-400 rounded-xl font-bold text-sm flex items-start gap-2">
          <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">error</span>
          {error}
        </div>
      )}

      {/* ── Identité ─────────────────────────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-black uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1 w-full">
          Identité
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nom *</label>
            <input
              required
              name="Nom"
              value={formData.Nom}
              onChange={handleChange}
              className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
              placeholder="Ex: Barnabé"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Prénom / Alias</label>
            <input
              name="Prenom"
              value={formData.Prenom}
              onChange={handleChange}
              className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
              placeholder="Ex: Le petit roi"
            />
          </div>
        </div>

        {/* Race + Espèce auto, Genre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Race *</label>
            <select
              required
              name="Race"
              value={formData.Race}
              onChange={handleChange}
              className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
            >
              <option value="">-- Choisir une race --</option>
              {races.map(r => (
                <option key={r.Id} value={r.Id}>{r.Nom}</option>
              ))}
            </select>
            {especeLabel && (
              <p className="text-xs font-bold text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">category</span>
                Espèce : {especeLabel}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Genre *</label>
            <select
              name="Genre"
              value={formData.Genre}
              onChange={handleChange}
              className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
            >
          {/* DB: 'oui' = Mâle, 'non' = Femelle — le backend valide 'Male'/'Femelle' et convertit */}
              <option value="Male">Mâle</option>
              <option value="Femelle">Femelle</option>
            </select>
          </div>
        </div>

        {/* Couleur, Statut */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Couleur</label>
            <input
              name="Couleur"
              value={formData.Couleur}
              onChange={handleChange}
              className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
              placeholder="Ex: Noir et Blanc"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Statut</label>
            <select
              name="Statut"
              value={formData.Statut}
              onChange={handleChange}
              className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
            >
              {statuts.map(s => (
                <option key={s.Id} value={s.Id}>{s.Statut}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* ── Physique ──────────────────────────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-black uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1 w-full">
          Caractéristiques physiques
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Âge — entier */}
          <NumberSpinner
            label="Âge"
            name="Age"
            value={formData.Age}
            onChange={handleChange}
            min={0}
            max={30}
            step={1}
            unit="ans"
          />
          {/* Poids — float kg */}
          <NumberSpinner
            label="Poids"
            name="Poids"
            value={formData.Poids}
            onChange={handleChange}
            min={0}
            max={200}
            step={0.5}
            unit="kg"
          />
          {/* Taille en cm (float) — le backend catégorise automatiquement */}
          <NumberSpinner
            label="Taille"
            name="Taille"
            value={formData.Taille}
            onChange={handleChange}
            min={1}
            max={300}
            step={1}
            unit="cm"
          />
        </div>
        <p className="text-xs text-on-surface-variant/60 italic">
          💡 La taille est automatiquement classée : &lt;35 cm = Petit · 35–70 cm = Moyen · &gt;70 cm = Grand
        </p>
      </fieldset>

      {/* ── Santé & Comportement ──────────────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-black uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1 w-full">
          Santé & Comportement
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* État de santé */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">État de santé *</label>
            <div className="grid grid-cols-3 gap-2">
              {ETATS_SANTE.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, EtatSantee: e }))}
                  className={`flex flex-col items-center justify-center gap-1 py-2 text-xs font-extrabold border-2 border-black rounded-xl transition-all
                    ${formData.EtatSantee === e
                      ? e === 'Mauvais'
                        ? 'bg-red-500 text-white shadow-none translate-x-[1px] translate-y-[1px]'
                        : e === 'Bon'
                          ? 'bg-amber-500 text-white shadow-none translate-x-[1px] translate-y-[1px]'
                          : 'bg-green-600 text-white shadow-none translate-x-[1px] translate-y-[1px]'
                      : 'bg-white text-on-surface hover:bg-primary/5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {e === 'Mauvais' ? 'sick' : e === 'Bon' ? 'health_and_safety' : 'favorite'}
                  </span>
                  <span>{e}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Niveau d'énergie */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Niveau d'énergie</label>
            <div className="grid grid-cols-3 gap-2">
              {NIVEAUX_ENERGIE.map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, NiveauEnergetique: n }))}
                  className={`flex flex-col items-center justify-center gap-1 py-2 text-xs font-extrabold border-2 border-black rounded-xl transition-all
                    ${formData.NiveauEnergetique === n
                      ? 'bg-secondary text-white shadow-none translate-x-[1px] translate-y-[1px]'
                      : 'bg-white text-on-surface hover:bg-primary/5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {n === 'Bas' ? 'mode_night' : n === 'Moyen' ? 'directions_walk' : 'bolt'}
                  </span>
                  <span>{n}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tempérament multi-sélection */}
        <TemperamentPicker selected={temperaments} onChange={setTemperaments} />
      </fieldset>

      {/* ── Compatibilités ─────────────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-black uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1 w-full">
          Compatibilités
        </legend>
        <div className="grid grid-cols-3 gap-3">
          <CheckboxField
            name="Sterilise"
            checked={formData.Sterilise}
            onChange={handleChange}
            label="Stérilisé"
            icon="content_cut"
          />
          <CheckboxField
            name="SociableEnfant"
            checked={formData.SociableEnfant}
            onChange={handleChange}
            label="Ok Enfants"
            icon="child_care"
          />
          <CheckboxField
            name="SociableAnimaux"
            checked={formData.SociableAnimaux}
            onChange={handleChange}
            label="Ok Animaux"
            icon="pets"
          />
        </div>
      </fieldset>

      {/* ── Photos ─────────────────────────────────────────────────────────── */}
      {!initialData && (
        <fieldset className="space-y-2">
          <legend className="text-xs font-black uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1 w-full mb-2">
            Photos
          </legend>
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Photos * <span className="normal-case font-normal text-on-surface-variant/60">(min. 1)</span>
          </label>
          <input
            required
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white"
          />
          {photos.length > 0 && (
            <p className="text-xs font-bold text-secondary">{photos.length} photo(s) sélectionnée(s)</p>
          )}
        </fieldset>
      )}

      {/* ── Histoire / Description ──────────────────────────────────────────── */}
      <fieldset className="space-y-2">
        <legend className="text-xs font-black uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1 w-full mb-2">
          Histoire
        </legend>
        <p className="text-xs text-on-surface-variant/60">Ce texte s'affichera dans la section « L'histoire de l'animal » de sa fiche.</p>
        <textarea
          name="Prenom"
          value={formData.Prenom}
          onChange={handleChange}
          rows="4"
          className="w-full bg-white border-2 border-black px-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          placeholder="Racontez son histoire, ses habitudes, ce qu'il aime, ses besoins particuliers..."
        />
      </fieldset>

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex gap-3 sticky bottom-0 bg-white py-3 border-t-2 border-black -mx-1 px-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3.5 border-2 border-black font-bold uppercase tracking-widest hover:bg-surface-container transition-all rounded-lg text-sm"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading || temperaments.length === 0 || !formData.Race}
          className="flex-1 py-3.5 bg-primary text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-extrabold uppercase tracking-widest hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-lg text-sm flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-base">sync</span>
              Enregistrement…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">{initialData ? 'edit' : 'add_circle'}</span>
              {initialData ? 'Modifier' : 'Ajouter l\'animal'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default AnimalForm
