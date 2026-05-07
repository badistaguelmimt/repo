/**
 * useRaces.js
 * Charge et transforme la liste des races (ex-raceMapper).
 * Utilisé par : Races.jsx.
 */

import { useEffect, useState } from 'react'
import { getRaces } from '../services/publicApi'

// ── Helpers (ex-raceMapper) ───────────────────────────────────────────────────

const fallbackPhoto = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800'

export const mapRace = (input, index = 0) => {
  const race = input && typeof input === 'object' ? input : {}
  const id   = String(race.Id ?? race.id ?? `race-${index + 1}`)
  const especeNum = Number(race.Espece)
  const especeLabel = race.EspeceNom ?? race.espece ??
    (especeNum === 1 ? 'Chien' : especeNum === 2 ? 'Chat' : especeNum === 3 ? 'Lapin' : 'Autre')

  return {
    id,
    nom:          race.Nom ?? race.nom ?? 'Race Inconnue',
    espece:       especeLabel,
    description:  race.Description ?? race.description ?? 'Pas de description disponible.',
    photo:        race.Photo ?? race.photo ?? fallbackPhoto,
    origine:      race.Origine ?? race.origine ?? 'Inconnue',
    esperanceVie: race.EsperanceVie ?? race.esperanceVie ?? 'N/A',
    tailleAdulte: race.TailleMoyenne ?? race.tailleAdulte ?? 'Moyenne',
    soins:        race.Maintenance ?? race.soins ?? 'Modérés',
  }
}

export const mapRaces = (races = []) => races.map((r, i) => mapRace(r, i))

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Charge et transforme la liste complète des races.
 *
 * @returns {{ races, isLoading, error, reload }}
 */
export const useRaces = () => {
  const [races,     setRaces]     = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const raw    = await getRaces()
      const mapped = Array.isArray(raw) ? mapRaces(raw) : []
      setRaces(mapped)
    } catch (err) {
      console.error('[useRaces]', err)
      setError(err?.message ?? 'Impossible de charger les races.')
      setRaces([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { races, isLoading, error, reload: load }
}
