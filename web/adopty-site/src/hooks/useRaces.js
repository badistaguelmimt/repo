/**
 * useRaces.js
 * Charge et transforme la liste des races (ex-raceMapper).
 * Utilisé par : Races.jsx.
 */

import { useEffect, useState } from 'react'
import { getRaces } from '../services/publicApi'

// ── Helpers (ex-raceMapper) ───────────────────────────────────────────────────

const fallbackPhoto = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800'

const HARDCODED_PHOTOS = {
  // Chiens
  'Berger Allemand':       'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=800',
  'Golden':                'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&q=80&w=800',
  'Labrador':              'https://images.unsplash.com/photo-1611003229186-4f7cc29a6ba4?auto=format&fit=crop&q=80&w=800',
  'Bouledogue Français':   'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
  'Husky Sibérien':        'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&q=80&w=800',
  'Caniche':               'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800',
  'Chihuahua':             'https://images.unsplash.com/photo-1540492649367-c8565a571e4b?auto=format&fit=crop&q=80&w=800',
  'Beagle':                'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&q=80&w=800',
  'Shih Tzu':              'https://images.unsplash.com/photo-1625794084867-8ddd239946b1?auto=format&fit=crop&q=80&w=800',
  'Border Collie':         'https://images.unsplash.com/photo-1551717743-49959800b1f6?auto=format&fit=crop&q=80&w=800',
  'Rottweiler':            'https://images.unsplash.com/photo-1567752881298-894bb81f9379?auto=format&fit=crop&q=80&w=800',
  'Dalmatien':             'https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?auto=format&fit=crop&q=80&w=800',
  'Dobermann':             'https://images.unsplash.com/photo-1601289031489-b6b7f8ce25f0?auto=format&fit=crop&q=80&w=800',
  'Cavalier King Charles': 'https://images.unsplash.com/photo-1648044348815-e6c07cb61d4d?auto=format&fit=crop&q=80&w=800',
  'Teckel':                'https://images.unsplash.com/photo-1612195583950-b8fd34c87093?auto=format&fit=crop&q=80&w=800',
  // Chats
  'Siamois':               'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80&w=800',
  'Main Coon':             'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=800',
  'Bengal':                'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=800',
  'Russe':                 'https://images.unsplash.com/photo-1568152950566-c1bf43f4ab28?auto=format&fit=crop&q=80&w=800',
  'Persan':                'https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&q=80&w=800',
  'Sacré de Birmanie':     'https://images.unsplash.com/photo-1520315342629-6ea920342047?auto=format&fit=crop&q=80&w=800',
  'Abyssin':               'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&q=80&w=800',
  'Ragdoll':               'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&q=80&w=800',
  'Sphynx':                'https://images.unsplash.com/photo-1577023311546-cdc07a8454d9?auto=format&fit=crop&q=80&w=800',
  'British Shorthair':     'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?auto=format&fit=crop&q=80&w=800',
  'Scottish Fold':         'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
  // Lapins
  'Bélier':                'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&q=80&w=800',
  'Nain de Hollande':      'https://images.unsplash.com/photo-1518796745738-41048802f99a?auto=format&fit=crop&q=80&w=800',
  'Rex':                   'https://images.unsplash.com/photo-1559214369-a6b1d7919865?auto=format&fit=crop&q=80&w=800',
  'Angora Anglais':        'https://images.unsplash.com/photo-1520808663317-647b476a81b9?auto=format&fit=crop&q=80&w=800',
  // Hamsters
  'Hamster Doré':          'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&q=80&w=800',
  'Hamster Russe Nain':    'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&q=80&w=800',
  // Par défaut par espèce
  'DEFAULT_Chien':   'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
  'DEFAULT_Chat':    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
  'DEFAULT_Lapin':   'https://images.unsplash.com/photo-1559214369-a6b1d7919865?auto=format&fit=crop&q=80&w=800',
  'DEFAULT_Hamster': 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&q=80&w=800',
}

export const mapRace = (input, index = 0) => {
  const race = input && typeof input === 'object' ? input : {}
  const id   = String(race.Id ?? race.id ?? `race-${index + 1}`)
  const especeNum = Number(race.Espece)
  const especeLabel = race.EspeceNom ?? race.espece ??
    (especeNum === 1 ? 'Chien' : especeNum === 2 ? 'Chat' : especeNum === 3 ? 'Lapin' : 'Autre')

  const nom = race.Nom ?? race.nom ?? 'Race Inconnue'
  const finalPhoto = HARDCODED_PHOTOS[nom] || HARDCODED_PHOTOS[`DEFAULT_${especeLabel}`] || fallbackPhoto

  return {
    id,
    nom,
    espece:           especeLabel,
    description:      race.Description ?? race.description ?? 'Pas de description disponible.',
    photo:            finalPhoto,
    origine:          race.Origine ?? race.origine ?? 'Inconnue',
    esperanceVie:     race.EsperanceVie ?? race.esperanceVie ?? 'N/A',
    tailleMoyenne:    race.TailleMoyenne ?? race.tailleMoyenne ?? null,
    poidsMoyen:       race.PoidsMoyen ?? race.poidsMoyen ?? null,
    couleurs:         race.Couleurs ?? race.couleurs ?? null,
    classification:   race.Classification ?? race.classification ?? null,
    pelage:           race.Pelage ?? null,
    taillePelage:     race.TaillePelageMoyen ?? race.taillePelage ?? null,
    habitat:          race.Habitat ?? race.habitat ?? null,
    intelligence:     race.Inteligence ?? race.intelligence ?? null,
    immunite:         race.Imunite ?? race.immunite ?? null,
    alergies:         race.Alergies ?? race.alergies ?? null,
    maintenance:      race.Maintenance ?? race.soins ?? null,
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
