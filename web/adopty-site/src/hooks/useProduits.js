/**
 * useProduits.js
 * Charge et transforme la liste des produits (ex-mapProduits).
 * Utilisé par : Boutique, RefugeDashboard.
 */

import { useEffect, useState } from 'react'
import { getProduits, getProduitsByRefuge } from '../services/publicApi'
import { mapProduits } from './useProduit'   // mapProduits défini dans useProduit.js

export { mapProduits }

/**
 * Charge et transforme la liste complète des produits de la boutique.
 *
 * @returns {{ produits, isLoading, error, reload }}
 */
export const useProduits = () => {
  const [produits,  setProduits]  = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const raw    = await getProduits()
      const mapped = Array.isArray(raw) ? mapProduits(raw) : []
      setProduits(mapped)
    } catch (err) {
      console.error('[useProduits]', err)
      setError(err?.message ?? 'Impossible de charger les produits.')
      setProduits([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { produits, isLoading, error, reload: load }
}

/**
 * Charge et transforme les produits d'un refuge spécifique.
 *
 * @param {string|number} refugeId
 * @returns {{ produits, isLoading, error }}
 */
export const useProduitsByRefuge = (refugeId) => {
  const [produits,  setProduits]  = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    if (!refugeId) { setIsLoading(false); return }
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const raw    = await getProduitsByRefuge(refugeId)
        const mapped = Array.isArray(raw) ? mapProduits(raw) : []
        if (!cancelled) setProduits(mapped)
      } catch (err) {
        if (!cancelled) {
          setError(err?.message ?? 'Impossible de charger les produits du refuge.')
          setProduits([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [refugeId])

  return { produits, isLoading, error }
}
