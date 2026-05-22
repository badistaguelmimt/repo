import { useState } from 'react'
import { createReservation } from '../../services/authApi'
import { useRoleAccess } from '../../hooks/useRoleAccess'
import { TYPE_SERVICE_MAP } from '../../hooks/usePrestataires'

/**
 * ReservationForm
 *
 * Crée une réservation chez un prestataire.
 * Le backend calcule le prix si non fourni (TarifHoraire × durée en heures).
 * IdAnimal est optionnel : envoyé uniquement si renseigné (sinon non inclus = NULL en DB).
 */
const ReservationForm = ({ prestataire, onClose }) => {
  const { isSignedIn } = useRoleAccess()
  const [step, setStep] = useState(0) // 0=formulaire, 1=succès
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reservationId, setReservationId] = useState(null)

  const [form, setForm] = useState({
    dateDebut:  '',
    heureDebut: '09:00',
    duree:      '2',
    notes:      '',
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  // Construction des dates ISO
  const dateDebutISO = form.dateDebut && form.heureDebut
    ? `${form.dateDebut}T${form.heureDebut}:00`
    : null

  const dateFinISO = dateDebutISO
    ? new Date(new Date(dateDebutISO).getTime() + Number(form.duree) * 3600000).toISOString()
    : null

  // Prix estimé côté client (le backend recalcule si besoin)
  const prixHeure = Number(prestataire?.prixHeure ?? prestataire?.TarifHoraire ?? 0)
  const prixEstime = (prixHeure * parseFloat(form.duree || 1)).toFixed(0)

  // Label du service
  const serviceLabel = prestataire?.service
    ?? TYPE_SERVICE_MAP[prestataire?.typeServiceId]
    ?? TYPE_SERVICE_MAP[prestataire?.TypeService]
    ?? 'Service'

  const inputCls = "w-full bg-surface-container-lowest border-2 border-black px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
  const labelCls = "block font-bold text-sm mb-1.5 text-on-surface"

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isSignedIn) { setError('Vous devez être connecté pour réserver.'); return }
    if (!form.dateDebut || !form.heureDebut) { setError('Veuillez choisir une date et une heure.'); return }

    setIsLoading(true)
    setError(null)
    try {
      // TypeService : on envoie l'ID numérique si disponible, sinon le label string (le backend résout)
      const typeServiceId = prestataire?.typeServiceId ?? prestataire?.TypeService ?? serviceLabel

      const result = await createReservation({
        IdProfil:    Number(prestataire.id ?? prestataire.Id),
        TypeService: typeServiceId,
        DateDebut:   dateDebutISO,
        DateFin:     dateFinISO,
        Notes:       form.notes.trim() || null,
        PrixFinal:   Number(prixEstime),
        // IdAnimal omis volontairement (optionnel, NULL si absent)
      })

      setReservationId(result?.reservation?.Id ?? result?.id ?? null)
      setStep(1)
    } catch (err) {
      console.error('Erreur réservation:', err)
      setError(err?.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Succès ──────────────────────────────────────────────────────────────────
  if (step === 1) return (
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
        <p><span className="font-bold">Date :</span> {new Date(dateDebutISO).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
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

  // ── Formulaire ──────────────────────────────────────────────────────────────
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
            <p className="text-xs font-extrabold text-primary mt-0.5">
              {prixHeure > 0 ? `${prixHeure.toLocaleString('fr-FR')} DZD/h` : 'Tarif sur demande'}
              {' '}<span className="font-normal text-on-surface-variant">★ {Number(prestataire.note ?? 0).toFixed(1)}</span>
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

      {/* Erreur */}
      {error && (
        <div className="bg-error-container border-2 border-error text-on-error-container p-3 rounded-lg text-sm font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
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
            min={new Date().toISOString().split('T')[0]}
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

      {/* Durée */}
      <div>
        <label className={labelCls}>Durée</label>
        <div className="grid grid-cols-3 gap-2">
          {['0.5', '1', '1.5', '2', '3', '4'].map(d => (
            <button
              key={d}
              type="button"
              onClick={() => update('duree', d)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-black font-bold text-sm rounded-xl transition-all
                ${form.duree === d
                  ? 'bg-primary text-white shadow-none translate-x-[1px] translate-y-[1px]'
                  : 'bg-white text-on-surface hover:bg-primary/5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              <span>{Number(d) < 1 ? `${Number(d)*60}min` : `${d}h`}</span>
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
          maxLength={500}
        />
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
