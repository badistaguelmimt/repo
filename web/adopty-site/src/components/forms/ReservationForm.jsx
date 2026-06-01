import { useState, useEffect, useMemo } from 'react'
import { createReservation } from '../../services/authApi'
import { getDisponibilitesByProfil } from '../../services/publicApi'
import { useRoleAccess } from '../../hooks/useRoleAccess'

// Map complet des types de service (synchronisé avec la DB)
const TYPE_SERVICE_MAP = {
  1: 'Toilettage',
  2: 'Éducation canine',
  3: 'Pet-sitting',
  4: 'Promenade',
  5: 'Vétérinaire',
}

// Durées proposées en heures
const DUREES = [
  { value: '0.5', label: '30 min' },
  { value: '1',   label: '1h' },
  { value: '1.5', label: '1h30' },
  { value: '2',   label: '2h' },
  { value: '3',   label: '3h' },
  { value: '4',   label: '4h' },
]

/**
 * Vérifie si une date/heure tombe dans un créneau disponible (Disponibilite=true)
 */
function isDateInDisponibilite(dateISO, dureeH, disponibilites) {
  if (!dateISO || !disponibilites?.length) return { valid: false, creneauId: null }
  const start = new Date(dateISO)
  const end   = new Date(start.getTime() + Number(dureeH) * 3600000)

  for (const d of disponibilites) {
    if (!d.Disponibilite && d.Disponibilite !== 1 && d.Disponibilite !== '1') continue
    if (!d.DateDebut) continue
    const dStart = new Date(d.DateDebut)
    const dEnd   = d.DateFin ? new Date(d.DateFin) : new Date(dStart.getTime() + 3600000)
    // Le créneau doit contenir entièrement la réservation demandée
    if (start >= dStart && end <= dEnd) {
      return { valid: true, creneauId: d.Id }
    }
  }
  return { valid: false, creneauId: null }
}

/**
 * ReservationForm — Formulaire de réservation chez un prestataire.
 *
 * Améliorations v2 :
 * - Charge les disponibilités réelles du prestataire
 * - Affiche les créneaux disponibles pour guider le choix
 * - Valide que la date/heure choisie est dans un créneau disponible
 * - Calcul du prix automatique (TarifHoraire × durée)
 * - Envoi du bon TypeService (le type du prestataire)
 */
const ReservationForm = ({ prestataire, onClose }) => {
  const { isSignedIn } = useRoleAccess()

  const [step, setStep]               = useState(0)    // 0=créneaux, 1=formulaire, 2=succès
  const [isLoading, setIsLoading]     = useState(false)
  const [loadingDispos, setLoadingDispos] = useState(true)
  const [error, setError]             = useState(null)
  const [reservationId, setReservationId] = useState(null)
  const [disponibilites, setDisponibilites] = useState([])

  const [form, setForm] = useState({
    dateDebut:  '',
    heureDebut: '09:00',
    duree:      '1',
    notes:      '',
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  // ID du profil prestataire
  const profilId = prestataire?.id ?? prestataire?.Id

  // Charger les disponibilités du prestataire
  useEffect(() => {
    if (!profilId) return
    setLoadingDispos(true)
    getDisponibilitesByProfil(profilId)
      .then(data => setDisponibilites(Array.isArray(data) ? data : []))
      .catch(() => setDisponibilites([]))
      .finally(() => setLoadingDispos(false))
  }, [profilId])

  // Créneaux disponibles uniquement (Disponibilite=true)
  const creneauxDispos = useMemo(() =>
    disponibilites.filter(d =>
      d.Disponibilite === true || d.Disponibilite === 1 || d.Disponibilite === '1'
    ).filter(d => d.DateDebut && new Date(d.DateDebut) > new Date()),
  [disponibilites])

  // Construction dates ISO
  const dateDebutISO = form.dateDebut && form.heureDebut
    ? `${form.dateDebut}T${form.heureDebut}:00`
    : null

  const dateFinISO = dateDebutISO
    ? new Date(new Date(dateDebutISO).getTime() + Number(form.duree) * 3600000).toISOString()
    : null

  // Validation : date dans un créneau dispo
  const conflictCheck = useMemo(() => {
    if (!dateDebutISO || !creneauxDispos.length) return { valid: false, creneauId: null }
    return isDateInDisponibilite(dateDebutISO, form.duree, creneauxDispos)
  }, [dateDebutISO, form.duree, creneauxDispos])

  // Prix estimé
  const prixHeure = Number(prestataire?.prixHeure ?? prestataire?.TarifHoraire ?? 0)
  const prixEstime = (prixHeure * parseFloat(form.duree || 1)).toFixed(0)

  // Label service
  const typeServiceId = prestataire?.typeServiceId ?? prestataire?.TypeService
  const serviceLabel = TYPE_SERVICE_MAP[typeServiceId] ?? prestataire?.service ?? 'Service'

  // Date min = aujourd'hui
  const today = new Date().toISOString().split('T')[0]

  const inputCls = "w-full bg-surface-container-lowest border-2 border-black px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
  const labelCls = "block font-bold text-sm mb-1.5 text-on-surface"

  // Clic sur un créneau → pré-remplir la date/heure
  const handleSelectSlot = (dispo) => {
    const debut = new Date(dispo.DateDebut)
    const dateStr = debut.toISOString().split('T')[0]
    const heureStr = debut.toTimeString().slice(0, 5)
    update('dateDebut', dateStr)
    update('heureDebut', heureStr)
    setStep(1)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isSignedIn) { setError('Vous devez être connecté pour réserver.'); return }
    if (!form.dateDebut || !form.heureDebut) { setError('Veuillez choisir une date et une heure.'); return }

    // Si des créneaux existent, vérifier que la date est dans un créneau dispo
    if (creneauxDispos.length > 0 && !conflictCheck.valid) {
      setError('La date et l\'heure choisies ne correspondent à aucun créneau disponible du prestataire. Consultez les créneaux disponibles ci-dessous.')
      return
    }

    // Tronquer les notes à 95 chars pour respecter la limite DB
    const notesTrunc = form.notes.trim().length > 95
      ? form.notes.trim().substring(0, 92) + '...'
      : form.notes.trim() || null

    setIsLoading(true)
    setError(null)
    try {
      const result = await createReservation({
        IdProfil:    Number(profilId),
        TypeService: Number(typeServiceId),    // ID numérique du type de service du prestataire
        DateDebut:   dateDebutISO,
        DateFin:     dateFinISO,
        Notes:       notesTrunc,
        PrixFinal:   Number(prixEstime),
      })

      setReservationId(result?.reservation?.Id ?? result?.id ?? null)
      setStep(2)
    } catch (err) {
      console.error('Erreur réservation:', err)
      setError(err?.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── ÉTAPE 2 : Succès ────────────────────────────────────────────────────────
  if (step === 2) return (
    <div className="text-center py-8 space-y-5">
      <div className="w-20 h-20 bg-secondary-fixed border-4 border-black rounded-full flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <span className="material-symbols-outlined text-4xl text-secondary">event_available</span>
      </div>
      <div>
        <h3 className="font-['Chewy'] text-3xl text-primary">Réservation envoyée !</h3>
        {reservationId && (
          <p className="text-xs font-mono text-on-surface-variant mt-1">
            Réf. #{String(reservationId).padStart(4, '0')}
          </p>
        )}
      </div>
      <p className="text-on-surface-variant max-w-sm mx-auto text-sm">
        <strong>{prestataire?.nom ?? prestataire?.NomComplet}</strong> a reçu votre demande et vous contactera pour confirmer.
      </p>
      <div className="bg-surface-container border-2 border-black rounded-xl p-4 text-sm text-left space-y-1.5 max-w-xs mx-auto">
        <p><span className="font-bold">Service :</span> {serviceLabel}</p>
        {dateDebutISO && (
          <p><span className="font-bold">Date :</span> {new Date(dateDebutISO).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        )}
        <p><span className="font-bold">Heure :</span> {form.heureDebut}</p>
        <p><span className="font-bold">Durée :</span> {Number(form.duree) < 1 ? `${Number(form.duree)*60}min` : `${form.duree}h`}</p>
        <p><span className="font-bold">Prix estimé :</span> <span className="text-primary font-extrabold">{Number(prixEstime).toLocaleString('fr-FR')} DZD</span></p>
      </div>
      <button
        onClick={onClose}
        className="px-8 py-3 bg-primary text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-lg"
      >
        Fermer
      </button>
    </div>
  )

  // ── ÉTAPE 0 : Sélection d'un créneau ────────────────────────────────────────
  if (step === 0) return (
    <div className="space-y-5">
      {/* Résumé prestataire */}
      {prestataire && (
        <div className="flex items-center gap-3 p-3 bg-primary-fixed border-2 border-black rounded-xl">
          {prestataire.photo && (
            <img src={prestataire.photo} alt={prestataire.nom} className="w-12 h-12 rounded-full border-2 border-black object-cover flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-primary truncate">{prestataire.nom ?? prestataire.NomComplet}</p>
            <p className="text-xs text-on-surface-variant">{serviceLabel} • {prestataire.ville ?? prestataire.ZoneIntervention}</p>
            <p className="text-xs font-extrabold text-primary mt-0.5">
              {prixHeure > 0 ? `${prixHeure.toLocaleString('fr-FR')} DZD/h` : 'Tarif sur demande'}
            </p>
          </div>
        </div>
      )}

      {/* Alerte non connecté */}
      {!isSignedIn && (
        <div className="bg-error-container border-2 border-error text-on-error-container p-3 rounded-lg text-sm font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">warning</span>
          Vous devez être <a href="/sign-in" className="underline ml-1">connecté</a> pour réserver.
        </div>
      )}

      <h3 className="font-bold text-sm uppercase tracking-wider text-on-surface-variant flex items-center gap-2">
        <span className="material-symbols-outlined text-base">calendar_month</span>
        Créneaux disponibles
      </h3>

      {loadingDispos ? (
        <div className="flex items-center gap-2 text-sm text-on-surface-variant py-4 justify-center">
          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Chargement des disponibilités...
        </div>
      ) : creneauxDispos.length === 0 ? (
        <div className="bg-surface-container border-2 border-black rounded-xl p-6 text-center space-y-2">
          <span className="material-symbols-outlined text-3xl opacity-30 block">event_busy</span>
          <p className="font-bold text-sm text-on-surface-variant">Aucun créneau disponible pour le moment.</p>
          <p className="text-xs text-on-surface-variant">Ce prestataire n'a pas encore défini ses disponibilités.</p>
          <button
            onClick={() => setStep(1)}
            className="mt-2 px-4 py-2 bg-surface-container-lowest border-2 border-black rounded-lg text-sm font-bold hover:bg-primary hover:text-white transition-all"
          >
            Entrer une date manuellement quand même
          </button>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {creneauxDispos.map(dispo => {
            const debut = new Date(dispo.DateDebut)
            const fin   = dispo.DateFin ? new Date(dispo.DateFin) : null
            const isToday = debut.toDateString() === new Date().toDateString()
            return (
              <button
                key={dispo.Id}
                type="button"
                onClick={() => handleSelectSlot(dispo)}
                className="w-full flex items-center justify-between p-3 bg-green-50 border-2 border-green-600 rounded-xl hover:bg-green-100 hover:shadow-[2px_2px_0px_0px_rgba(22,163,74,1)] transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-green-600 rounded-full flex-shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-green-800">
                      {isToday ? "Aujourd'hui" : debut.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-xs text-green-700">
                      {debut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      {fin ? ` → ${fin.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : ''}
                      {dispo.Recurrence && dispo.Recurrence !== 'Aucune' && (
                        <span className="ml-2 opacity-60">↻ {dispo.Recurrence}</span>
                      )}
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-green-600 group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            )
          })}
        </div>
      )}

      {creneauxDispos.length > 0 && (
        <button
          type="button"
          onClick={() => setStep(1)}
          className="w-full py-2 text-xs text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container transition-colors"
        >
          Entrer une date/heure personnalisée →
        </button>
      )}
    </div>
  )

  // ── ÉTAPE 1 : Formulaire de réservation ─────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Résumé prestataire */}
      {prestataire && (
        <div className="flex items-center gap-3 p-3 bg-primary-fixed border-2 border-black rounded-xl">
          {prestataire.photo && (
            <img src={prestataire.photo} alt={prestataire.nom} className="w-12 h-12 rounded-full border-2 border-black object-cover flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-primary truncate">{prestataire.nom ?? prestataire.NomComplet}</p>
            <p className="text-xs text-on-surface-variant">{serviceLabel} • {prestataire.ville ?? prestataire.ZoneIntervention}</p>
          </div>
          {creneauxDispos.length > 0 && (
            <button type="button" onClick={() => setStep(0)} className="text-xs text-primary font-bold hover:underline flex-shrink-0">
              ← Créneaux
            </button>
          )}
        </div>
      )}

      {/* Alerte non connecté */}
      {!isSignedIn && (
        <div className="bg-error-container border-2 border-error text-on-error-container p-3 rounded-lg text-sm font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">warning</span>
          Vous devez être <a href="/sign-in" className="underline ml-1">connecté</a> pour réserver.
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="bg-error-container border-2 border-error text-on-error-container p-3 rounded-lg text-sm font-bold flex items-start gap-2">
          <span className="material-symbols-outlined text-base flex-shrink-0">error</span>
          {error}
        </div>
      )}

      {/* Date + Heure */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className={labelCls}>Date *</label>
          <input
            required
            type="date"
            min={today}
            className={inputCls}
            value={form.dateDebut}
            onChange={e => update('dateDebut', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Heure *</label>
          <input
            required
            type="time"
            step="900"
            className={inputCls}
            value={form.heureDebut}
            onChange={e => update('heureDebut', e.target.value)}
          />
        </div>
      </div>

      {/* Indicateur de validité créneau */}
      {dateDebutISO && creneauxDispos.length > 0 && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-bold ${
          conflictCheck.valid
            ? 'bg-green-50 border-green-500 text-green-700'
            : 'bg-red-50 border-red-400 text-red-600'
        }`}>
          <span className="material-symbols-outlined text-base">
            {conflictCheck.valid ? 'check_circle' : 'cancel'}
          </span>
          {conflictCheck.valid
            ? '✓ Ce créneau est disponible'
            : 'Ce créneau ne correspond pas aux disponibilités du prestataire'}
        </div>
      )}

      {/* Durée */}
      <div>
        <label className={labelCls}>Durée</label>
        <div className="grid grid-cols-3 gap-2">
          {DUREES.map(d => (
            <button
              key={d.value}
              type="button"
              onClick={() => update('duree', d.value)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-black font-bold text-sm rounded-xl transition-all
                ${form.duree === d.value
                  ? 'bg-primary text-white shadow-none translate-x-[1px] translate-y-[1px]'
                  : 'bg-white text-on-surface hover:bg-primary/5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              <span>{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className={labelCls}>Notes / Instructions (optionnel)</label>
        <textarea
          className={inputCls + ' h-20 resize-none'}
          value={form.notes}
          onChange={e => update('notes', e.target.value)}
          placeholder="Allergies, comportement de l'animal, accès au logement..."
          maxLength={95}
        />
        {form.notes.length > 70 && (
          <p className="text-xs text-on-surface-variant mt-1">{form.notes.length}/95 caractères</p>
        )}
      </div>

      {/* Prix estimé */}
      {prixHeure > 0 && (
        <div className="p-4 bg-surface-container border-2 border-black rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Prix estimé</p>
              <p className="font-['Chewy'] text-3xl text-primary mt-1">{Number(prixEstime).toLocaleString('fr-FR')} DZD</p>
            </div>
            <div className="text-right text-xs text-on-surface-variant">
              <p>{prixHeure.toLocaleString('fr-FR')} DZD/h × {form.duree}h</p>
              {dateDebutISO && (
                <p className="font-bold mt-1">
                  {new Date(dateDebutISO).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !isSignedIn}
        className="w-full py-4 bg-primary text-white font-extrabold uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
      >
        {isLoading ? (
          <>
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined">event</span>
            Confirmer la réservation
          </>
        )}
      </button>
    </form>
  )
}

export default ReservationForm
