/**
 * useAnimaux.js
 * Liste complète des animaux, transformée (ex-mapAnimals).
 * Utilisé par : Accueil, Refuges, RefugeProfile, RefugeDashboard, Races, Dashboard.
 */

import { useEffect, useState } from 'react'
import { getAnimaux, getAnimauxByRefuge } from '../services/publicApi'
import { mapAnimals } from './useAnimal'

/**
 * Charge et transforme la liste complète des animaux.
 *
 * @returns {{ animaux: object[], isLoading: boolean, error: string|null, reload: Function }}
 */
export const useAnimaux = () => {
  const [animaux,   setAnimaux]   = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const raw    = await getAnimaux()
      const mapped = Array.isArray(raw) ? mapAnimals(raw) : []
      setAnimaux(mapped)
    } catch (err) {
      console.error('[useAnimaux]', err)
      setError(err?.message ?? 'Impossible de charger les animaux.')
      setAnimaux([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { animaux, isLoading, error, reload: load }
}

/**
 * Charge et transforme les animaux d'un refuge spécifique.
 *
 * @param {string|number} refugeId
 * @returns {{ animaux, isLoading, error }}
 */
export const useAnimauxByRefuge = (refugeId) => {
  const [animaux,   setAnimaux]   = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    if (!refugeId) { setIsLoading(false); return }
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const raw    = await getAnimauxByRefuge(refugeId)
        const mapped = Array.isArray(raw) ? mapAnimals(raw) : []
        if (!cancelled) setAnimaux(mapped)
      } catch (err) {
        if (!cancelled) {
          setError(err?.message ?? 'Impossible de charger les animaux du refuge.')
          setAnimaux([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [refugeId])

  return { animaux, isLoading, error }
}
