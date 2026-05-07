/**
 * useProduit.js
 * Charge les données complètes d'un produit (détail, photos, matériaux, refuge vendeur).
 * La logique de mappage (ex-produitMapper + refugeMapper) est inline ici.
 */

import { useEffect, useState } from 'react'
import {
  getProduitById,
  getProduitPhotos,
  getProduitMateriaux,
  getRefugeById,
} from '../services/publicApi'

// ── Helpers (ex-produitMapper) ────────────────────────────────────────────────

const fallbackPhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII='

export const mapProduit = (produit) => ({
  id:          String(produit.Id ?? produit.id ?? ''),
  idRefuge:    String(produit.IdRefuge ?? produit.idRefuge ?? ''),
  nom:         produit.Nom ?? produit.nom ?? 'Produit',
  categorie:   produit.Categorie ?? produit.categorie ?? 'Accessoires',
  prix:        Number(produit.Prix ?? produit.prix ?? 0),
  stock:       Number(produit.Stock ?? produit.stock ?? 0),
  disponible:  produit.Disponibilite !== 0,
  prixOriginal:produit.prixOriginal ?? null,
  reduction:   produit.Reduction ?? produit.reduction ?? null,
  badge:       produit.badge ?? null,
  description: produit.description ?? 'Produit disponible dans la boutique Adopty.',
  photo:       produit.photo ?? fallbackPhoto,
})

export const mapProduits = (produits = []) => produits.map(mapProduit)

// ── Helpers (ex-refugeMapper) ─────────────────────────────────────────────────

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

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Charge toutes les données d'un produit (principal + photos + matériaux + refuge).
 *
 * @param {string|number} id
 * @returns {{ produit, photos, materiaux, refuge, isLoading, error }}
 */
export const useProduit = (id) => {
  const [produit,   setProduit]   = useState(null)
  const [photos,    setPhotos]    = useState([])
  const [materiaux, setMateriaux] = useState([])
  const [refuge,    setRefuge]    = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // 1. Produit principal
        const raw    = await getProduitById(id)
        const mapped = mapProduit(raw)
        if (cancelled) return
        setProduit(mapped)

        // 2. Photos (non bloquant)
        getProduitPhotos(id)
          .then(data => { if (!cancelled) setPhotos(Array.isArray(data) ? data : []) })
          .catch(() => {})

        // 3. Matériaux (non bloquant)
        getProduitMateriaux(id)
          .then(data => { if (!cancelled) setMateriaux(Array.isArray(data) ? data : []) })
          .catch(() => {})

        // 4. Refuge vendeur (si connu)
        if (mapped?.idRefuge) {
          getRefugeById(mapped.idRefuge)
            .then(r => { if (!cancelled) setRefuge(mapRefuge(r)) })
            .catch(() => {})
        }
      } catch (err) {
        if (!cancelled) setError(err?.message ?? 'Erreur lors du chargement du produit')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id])

  return { produit, photos, materiaux, refuge, isLoading, error }
}
