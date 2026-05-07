/**
 * useRefuge.js
 * Charge et transforme un ou plusieurs refuges (ex-refugeMapper).
 * Utilisé par : Refuges, RefugeProfile, RefugeDashboard, Profil, ProductDetail.
 */

import { useEffect, useState } from 'react'
import { getRefuges, getRefugeById } from '../services/publicApi'
import { mapRefuge } from './useProduit'   // mapRefuge est défini dans useProduit.js (DRY)

export { mapRefuge }
export const mapRefuges = (refuges = []) => refuges.map(mapRefuge)

/**
 * Charge et transforme la liste complète des refuges.
 *
 * @returns {{ refuges, isLoading, error, reload }}
 */
export const useRefuges = () => {
  const [refuges,   setRefuges]   = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const raw    = await getRefuges()
      const mapped = Array.isArray(raw) ? mapRefuges(raw) : []
      setRefuges(mapped)
    } catch (err) {
      console.error('[useRefuges]', err)
      setError(err?.message ?? 'Impossible de charger les refuges.')
      setRefuges([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { refuges, isLoading, error, reload: load }
}

/**
 * Charge et transforme un refuge unique par son id.
 *
 * @param {string|number} id
 * @returns {{ refuge, isLoading, error }}
 */
export const useRefuge = (id) => {
  const [refuge,    setRefuge]    = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    if (!id) { setIsLoading(false); return }
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const raw = await getRefugeById(id)
        if (!cancelled) setRefuge(mapRefuge(raw))
      } catch (err) {
        if (!cancelled) {
          setError(err?.message ?? 'Refuge introuvable.')
          setRefuge(null)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id])

  return { refuge, isLoading, error }
}
