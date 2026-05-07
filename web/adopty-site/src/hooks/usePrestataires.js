/**
 * usePrestataires.js
 * Charge et transforme la liste des prestataires (ex-prestataireMapper).
 * Utilisé par : Services, Dashboard.
 * 
 * Constantes TYPE_SERVICE_* disponibles ici au lieu du mapper.
 */

import { useEffect, useState } from 'react'
import { getPrestataires } from '../services/publicApi'

// ── Constantes type de service (ex-prestataireMapper) ─────────────────────────

export const TYPE_SERVICE_MAP = {
  1: 'Toilettage',
  2: 'Éducation canine',
  3: 'Pet-sitting',
  4: 'Promenade',
  5: 'Vétérinaire',
}

export const TYPE_SERVICE_ID = {
  'Toilettage':      1,
  'Éducation canine':2,
  'Pet-sitting':     3,
  'Promenade':       4,
  'Vétérinaire':     5,
}

export const SERVICES_DISPONIBLES = ['Pet-sitting', 'Promenade']

// ── Helpers (ex-prestataireMapper) ────────────────────────────────────────────

const fallbackPhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII='

const toServiceLabel = (typeService) => {
  if (!isNaN(typeService)) return TYPE_SERVICE_MAP[Number(typeService)] ?? `Service #${typeService}`
  const str = String(typeService ?? '').toLowerCase()
  if (str.includes('promen'))                          return 'Promenade'
  if (str.includes('pet') || str.includes('sitting') || str.includes('garde')) return 'Pet-sitting'
  if (str.includes('toilet'))                          return 'Toilettage'
  if (str.includes('educ') || str.includes('dressage'))return 'Éducation canine'
  if (str.includes('vét') || str.includes('vet'))      return 'Vétérinaire'
  return typeService ?? 'Service'
}

export const mapPrestataire = (prestataire) => ({
  id:              String(prestataire.Id ?? prestataire.id ?? ''),
  idUtilisateur:   String(prestataire.IdUtilisateur ?? prestataire.idUtilisateur ?? ''),
  nom:             prestataire.NomComplet ?? prestataire.nom ?? `Prestataire #${prestataire.Id ?? ''}`,
  service:         prestataire.TypeServiceLabel ?? toServiceLabel(prestataire.TypeService),
  typeServiceId:   Number(prestataire.TypeService ?? 0),
  ville:           prestataire.ZoneIntervention ?? prestataire.ville ?? 'Zone inconnue',
  note:            Number(prestataire.NoteMoyenne ?? prestataire.note ?? 0),
  avis:            Number(prestataire.avis ?? 0),
  prixHeure:       Number(prestataire.TarifHoraire ?? prestataire.prixHeure ?? 0),
  disponible:      prestataire.disponible ?? true,
  animauxAcceptes: prestataire.animauxAcceptes ?? ['Chiens', 'Chats'],
  photo:           prestataire.photo ?? fallbackPhoto,
  description:     prestataire.Bio ?? prestataire.description ?? 'Prestataire partenaire Adopty.',
  certifiee:       prestataire.certifiee ?? true,
  experience:      prestataire.Experience ?? prestataire.experience ?? 0,
})

export const mapPrestataires = (prestataires = []) => prestataires.map(mapPrestataire)

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Charge et transforme la liste complète des prestataires.
 *
 * @returns {{ prestataires, isLoading, error, reload }}
 */
export const usePrestataires = () => {
  const [prestataires, setPrestataires] = useState([])
  const [isLoading,    setIsLoading]    = useState(true)
  const [error,        setError]        = useState(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const raw    = await getPrestataires()
      const mapped = Array.isArray(raw) ? mapPrestataires(raw) : []
      setPrestataires(mapped)
    } catch (err) {
      console.error('[usePrestataires]', err)
      setError(err?.message ?? 'Impossible de charger les prestataires.')
      setPrestataires([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { prestataires, isLoading, error, reload: load }
}
