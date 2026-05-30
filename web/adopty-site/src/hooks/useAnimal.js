/**
 * useAnimal.js
 * Charge la fiche complète d'un animal et son refuge.
 * La logique de mappage (ex-animalMapper + refugeMapper) est inline ici.
 */

import { useEffect, useState } from 'react'
import { getAnimalById, getRefuges } from '../services/publicApi'
import { animaux as mockAnimaux, refuges as mockRefuges } from '../data/mockData'

// ── Helpers animal (ex-animalMapper) ─────────────────────────────────────────

const fallbackPhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII='

const toAgeLabel = (age) => {
  const n = Number(age)
  if (!Number.isFinite(n)) return 'Âge inconnu'
  if (n === 0) return "Moins d'1 an"
  return `${n} ${n > 1 ? 'ans' : 'an'}`
}

const toTailleLabel = (taille) => {
  if (taille == null) return 'Moyen'
  const num = parseFloat(taille)
  if (isNaN(num)) {
    const s = String(taille).toLowerCase()
    if (s.includes('petit')) return 'Petit'
    if (s.includes('grand')) return 'Grand'
    return 'Moyen'
  }
  if (num < 5) {
    if (num <= 0.4) return 'Petit'
    if (num >= 1.0) return 'Grand'
    return 'Moyen'
  }
  if (num < 35) return 'Petit'
  if (num > 70) return 'Grand'
  return 'Moyen'
}

const normalizeList = (value) => {
  if (Array.isArray(value)) return value.map(s => String(s).trim()).filter(Boolean)
  if (typeof value === 'string') return value.split(/[,\-/|]/g).map(s => s.trim()).filter(Boolean)
  return []
}

const toBool = (value) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') return ['true', '1', 'oui'].includes(value.toLowerCase())
  return false
}

const toDaysInRefuge = (value, fallback) => {
  const n = Number(value)
  if (Number.isFinite(n) && n >= 0) return n
  const d = new Date(fallback)
  if (isNaN(d.getTime())) return 0
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000))
}

const toUrgent = (animal) => {
  if (animal.urgent != null) return Boolean(animal.urgent)
  const s = String(animal.StatutNom ?? animal.Statut ?? '').toLowerCase()
  return s.includes('urgent')
}

const toRef = (animal, id) => {
  if (animal.ref) return animal.ref
  return `#AD-${String(id).replace(/\D/g, '').padStart(4, '0').slice(-4) || '0000'}`
}

const toSante = (animal) => {
  const etat   = animal.EtatSantee ?? animal.etatSante ?? null
  const valide = ['Mauvais', 'Bon', 'Excellent']
  const etatLabel  = valide.includes(etat) ? etat : null
  const sterilise  = toBool(animal.Sterilise) ? 'Stérilisé' : null
  return [etatLabel, sterilise].filter(Boolean).join(' · ') || 'N/A'
}

const toHabitat = (animal, taille) => {
  if (animal.habitat) return animal.habitat
  if (taille === 'Petit') return 'Appartement ou maison'
  if (taille === 'Grand') return 'Maison avec jardin'
  return 'Maison ou appartement'
}

const toTraits = (animal, taille, temperamentList) => {
  if (Array.isArray(animal.traits) && animal.traits.length > 0) return animal.traits
  const traits = []
  if (toBool(animal.SociableEnfant)) traits.push('Enfants')
  if (taille === 'Petit') traits.push('Appartement')
  if (toBool(animal.SociableAnimaux)) traits.push('Sociable')
  if (String(animal.NiveauEnergetique ?? '').toLowerCase().includes('haut')) traits.push('Sportif')
  if (temperamentList.some(t => t.toLowerCase().includes('calme'))) traits.push('Calme')
  return Array.from(new Set(traits))
}

/** Transforme un objet animal brut (DB) en objet normalisé frontend */
export const mapAnimal = (input, index = 0) => {
  const animal = input && typeof input === 'object' ? input : {}
  const rawId  = animal.Id ?? animal.id ?? animal.IdAnimal ?? ''
  const id     = String(rawId || `animal-${index + 1}`)
  const temperamentList = normalizeList(animal.caractere ?? animal.Temperament)
  const taille = toTailleLabel(animal.Taille ?? animal.taille)

  const poidsNum      = parseFloat(animal.Poids ?? animal.poids)
  const poids         = Number.isFinite(poidsNum) && poidsNum > 0 ? `${poidsNum} kg` : 'N/A'
  const tailleRaw     = parseFloat(animal.Taille ?? animal.taille)
  const tailleDisplay = !isNaN(tailleRaw) && tailleRaw >= 5
    ? `${tailleRaw} cm (${taille})`
    : taille
  const description   = (animal.Prenom && animal.Prenom !== animal.Nom)
    ? animal.Prenom
    : (animal.description ?? '')
  const raceData = {
    nom:          animal.RaceNom ?? animal.race ?? null,
    habitat:      animal.RaceHabitat ?? null,
    esperanceVie: animal.RaceEsperanceVie ?? null,
    maintenance:  animal.RaceMaintenance ?? null,
    intelligence: animal.RaceInteligence ?? null,
    description:  animal.RaceDescription ?? null,
    poidsMoyen:   animal.RacePoidsMoyen ?? null,
    tailleMoyenne:animal.RaceTailleMoyenne ?? null,
  }

  return {
    id,
    idRefuge:    animal.IdRefuge ?? animal.idRefuge ?? animal.Refuge ?? null,
    nom:         animal.Nom ?? animal.nom ?? 'Sans nom',
    espece:      animal.EspeceNom ?? animal.espece ?? null,
    race:        animal.RaceNom ?? animal.race ?? 'Race inconnue',
    raceId:      animal.Race ?? animal.raceId ?? null,
    statutId:    animal.Statut ?? animal.statutId ?? null,
    raceData,
    age:         Number(animal.Age ?? animal.age ?? 0),
    ageLabel:    animal.ageLabel ?? toAgeLabel(animal.Age ?? animal.age),
    taille,
    tailleDisplay,
    poids,
    caractere:   temperamentList.length > 0 ? temperamentList : ['Calme'],
    traits:      toTraits(animal, taille, temperamentList),
    lieu:        animal.lieu ?? animal.RefugeNom ?? 'Refuge',
    urgent:      toUrgent(animal),
    description,
    photo:       animal.photo ?? fallbackPhoto,
    ref:         toRef(animal, id),
    joursRefuge: toDaysInRefuge(animal.joursRefuge, animal.Date_ajout ?? animal.dateAjout ?? animal.createdAt),
    sante:       toSante(animal),
    habitat:     toHabitat(animal, taille),
    // Champs bruts conservés pour le formulaire d'édition (AnimalForm)
    Nom:               animal.Nom ?? animal.nom ?? '',
    Prenom:            animal.Prenom ?? '',
    Age:               animal.Age ?? animal.age ?? 0,
    Genre:             animal.Genre ?? null,
    Poids:             animal.Poids ?? animal.poids ?? 0,
    Taille:            animal.Taille ?? animal.taille ?? 50,
    Couleur:           animal.Couleur ?? animal.couleur ?? '',
    EtatSantee:        animal.EtatSantee ?? null,
    Sterilise:         animal.Sterilise ?? null,
    Temperament:       animal.Temperament ?? animal.caractere ?? '',
    NiveauEnergetique: animal.NiveauEnergetique ?? null,
    SociableEnfant:    animal.SociableEnfant ?? null,
    SociableAnimaux:   animal.SociableAnimaux ?? null,
    Statut:            animal.Statut ?? animal.statutId ?? 1,
    Race:              animal.Race ?? animal.raceId ?? null,
    IdRefuge:          animal.IdRefuge ?? animal.idRefuge ?? null,
  }
}

export const mapAnimals = (animals = []) => animals.map((a, i) => mapAnimal(a, i))

// ── Helper refuge (ex-refugeMapper) ──────────────────────────────────────────

export const mapRefuge = (refuge) => ({
  id:             String(refuge.Id ?? refuge.id ?? ''),
  nom:            refuge.Nom ?? refuge.nom ?? 'Refuge',
  lieu:           refuge.Nom ?? refuge.lieu ?? 'Refuge',
  ville:          refuge.Ville ?? refuge.ville ?? 'Ville inconnue',
  codePostal:     refuge.codePostal ?? '',
  adresse:        refuge.Addresse ?? refuge.adresse ?? 'Adresse inconnue',
  telephone:      refuge.Telephone ?? refuge.telephone ?? 'N/A',
  email:          refuge.email ?? 'contact@adopty.local',
  horaires:       refuge.horaires ?? 'Horaires non renseignes',
  description:    refuge.Description ?? refuge.description ?? 'Refuge partenaire Adopty.',
  capacite:       refuge.capacite ?? 0,
  surface:        refuge.surface ?? 'N/A',
  bénévoles:      refuge['bénévoles'] ?? refuge.benevoles ?? 0,
  animauxTotal:   refuge.animauxTotal ?? 0,
  specialites:    refuge.specialites ?? [],
  certifications: refuge.certifications ?? ['Refuge partenaire'],
})

export const mapRefuges = (refuges = []) => refuges.map(mapRefuge)

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Charge la fiche complète d'un animal et son refuge.
 * Bascule sur les données mock si le backend est indisponible.
 *
 * @param {string|number} id
 * @returns {{ animal, refuge, isLoading, isMockMode, error }}
 */
export const useAnimal = (id) => {
  const [animal,    setAnimal]    = useState(mockAnimaux.find(a => a.id === id) || mockAnimaux[0])
  const [refuge,    setRefuge]    = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMockMode,setIsMockMode]= useState(false)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const raw    = await getAnimalById(id)
        const mapped = mapAnimal(raw)
        if (cancelled) return
        setAnimal(mapped)
        setIsMockMode(false)

        const refugesRaw    = await getRefuges()
        const refugesMapped = Array.isArray(refugesRaw) ? mapRefuges(refugesRaw) : []
        const matched =
          refugesMapped.find(r => String(r.id) === String(mapped.idRefuge)) ||
          refugesMapped.find(r => r.nom === mapped.lieu || r.lieu === mapped.lieu)
        if (!cancelled) setRefuge(matched || null)
      } catch (err) {
        if (!cancelled) {
          const fallback = mockAnimaux.find(a => a.id === id) || mockAnimaux[0]
          setAnimal(fallback)
          setRefuge(mockRefuges.find(r => r.lieu === fallback?.lieu) || null)
          setIsMockMode(true)
          setError(err?.message ?? 'Chargement en mode hors-ligne')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id])

  return { animal, refuge, isLoading, isMockMode, error }
}
