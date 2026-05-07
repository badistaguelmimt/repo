/**
 * useCommandes.js
 * Charge et transforme la liste des commandes (ex-commandeMapper).
 * Utilisé par : Dashboard.jsx.
 */

import { useEffect, useState } from 'react'
import { getCommandes } from '../services/authApi'

// ── Helpers (ex-commandeMapper) ───────────────────────────────────────────────

const toStatusLabel = (statusValue) => {
  const statusAsNumber = Number(statusValue)
  if (Number.isFinite(statusAsNumber)) {
    if (statusAsNumber === 1) return 'En attente'
    if (statusAsNumber === 2) return 'En cours'
    if (statusAsNumber === 3) return 'Livre'
    if (statusAsNumber === 4) return 'Annulee'
  }
  const normalized = String(statusValue ?? '').toLowerCase()
  if (normalized.includes('livr'))     return 'Livre'
  if (normalized.includes('cours'))    return 'En cours'
  if (normalized.includes('attente'))  return 'En attente'
  if (normalized.includes('traitement')) return 'En cours'
  if (normalized.includes('resolu'))   return 'Resolu'
  if (normalized.includes('annul'))    return 'Annulee'
  return 'En attente'
}

const toDateLabel = (dateValue) => {
  if (!dateValue) return 'N/A'
  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) return 'N/A'
  return parsed.toLocaleDateString('fr-FR')
}

const toCommandeId = (rawId) => {
  const numeric = String(rawId ?? '').replace(/\D/g, '')
  const suffix  = numeric.padStart(3, '0').slice(-3)
  return `#CMD-${suffix || '000'}`
}

export const mapCommande = (commande, index = 0) => {
  const item         = commande && typeof commande === 'object' ? commande : {}
  const rawId        = item.commandeId ?? item.Id ?? item.id ?? index + 1
  const montant      = Number(item.MontantTotal ?? item.Montant ?? item.montant ?? item.Total_prix ?? 0)
  const clientPrenom = item.ClientPrenom ?? ''
  const clientNom    = item.ClientNom ?? ''
  const clientFull   = clientPrenom || clientNom
    ? `${clientPrenom} ${clientNom}`.trim()
    : item.client ?? item.ClientNom ?? item.UtilisateurNom ?? `Utilisateur #${item.IdUtilisateur ?? 'N/A'}`
  const statutRaw    = item.StatutLabel ?? item.PaiementStatutLabel ?? item.Statut ?? item.statut ?? ''

  return {
    id:            toCommandeId(rawId),
    idRaw:         String(rawId),
    idUtilisateur: String(item.IdUtilisateur ?? ''),
    client:        clientFull,
    produit:       item.NomRefuge ?? item.produit ?? item.ProduitNom ?? 'Commande boutique',
    montant:       Number.isFinite(montant) ? montant : 0,
    statut:        statutRaw ? toStatusLabel(statutRaw) : 'En attente',
    date:          toDateLabel(item.DateCommande ?? item.date ?? item.CreeLe ?? item.createdAt),
    paymentRef:    item.PaymentRef ?? '',
  }
}

export const mapCommandes = (commandes = []) => commandes.map((c, i) => mapCommande(c, i))

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Charge et transforme la liste complète des commandes.
 *
 * @returns {{ commandes, isLoading, error, reload }}
 */
export const useCommandes = () => {
  const [commandes,  setCommandes]  = useState([])
  const [isLoading,  setIsLoading]  = useState(true)
  const [error,      setError]      = useState(null)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const raw    = await getCommandes()
      const mapped = Array.isArray(raw) ? mapCommandes(raw) : []
      setCommandes(mapped)
    } catch (err) {
      console.error('[useCommandes]', err)
      setError(err?.message ?? 'Impossible de charger les commandes.')
      setCommandes([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { commandes, isLoading, error, reload: load }
}
