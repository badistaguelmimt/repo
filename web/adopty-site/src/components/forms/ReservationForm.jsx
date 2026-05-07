import { useState, useEffect } from 'react'
import { createReservation } from '../../services/authApi'
import { useRoleAccess } from '../../hooks/useRoleAccess'
import { TYPE_SERVICE_ID } from '../../hooks/usePrestataires'

const ReservationForm = ({ prestataire, onClose }) => {
  const { isSignedIn, backendUserId } = useRoleAccess()
  const [step, setStep] = useState(0) // 0=détails, 1=récap, 2=succès
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reservationId, setReservationId] = useState(null)

  const [form, setForm] = useState({
    dateDebut: '',
    heureDebut: '09:00',
    duree: '2',
    notes: '',
    idAnimal: '',
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  // Calcul dates
  const dateDebutISO = form.dateDebut && form.heureDebut
    ? `${form.dateDebut}T${form.heureDebut}:00`
    : null

  const dateFinISO = dateDebutISO
    ? new Date(new Date(dateDebutISO).getTime() + Number(form.duree) * 60 * 60 * 1000).toISOString()
    : null

  const prixEstime = prestataire
    ? (prestataire.prixHeure * parseFloat(form.duree || 1)).toFixed(2)
    : 0

  const inputCls = "w-full bg-surface-container-lowest border-2 border-black px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary rounded-lg"
  const labelCls = "block font-['Plus_Jakarta_Sans'] font-bold text-sm mb-1.5 text-on-surface"

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isSignedIn) {
      setError('Vous devez être connecté pour réserver.')
      return
    }
    if (!form.dateDebut || !form.heureDebut) {
      setError('Veuillez choisir une date et une heure.')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const typeServiceId = prestataire?.typeServiceId
        ?? TYPE_SERVICE_ID[prestataire?.service]
        ?? null

      const result = await createReservation({
        IdProfil: Number(prestataire.id),
        IdAnimal: form.idAnimal ? Number(form.idAnimal) : 0,
        TypeService: typeServiceId,
        DateDebut: dateDebutISO,
        DateFin: dateFinISO,
        Notes: form.notes || null,
        PrixFinal: Number(prixEstime),
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

  // ── Succès ────────────────────────────────────────────────────────────────
  if (step === 2) return (
    <div className="text-center py-8 space-y-4">
      <div className="w-20 h-20 bg-secondary-fixed border-4 border-black rounded-full flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <span className="material-symbols-outlined text-4xl text-secondary">event_available</span>
      </div>
      <h3 className="font-['Chewy'] text-3xl text-primary">Réservation envoyée !</h3>
      {reservationId && (
        <p className="text-xs font-mono text-on-surface-variant">Référence #{String(reservationId).padStart(4, '0')}</p>
      )}
      <p className="text-on-surface-variant max-w-sm mx-auto text-sm">
        <strong>{prestataire?.nom}</strong> a reçu votre demande et vous contactera sous 24h pour confirmer le créneau.
      </p>
      <div className="bg-surface-container border-2 border-black rounded-xl p-4 text-sm text-left space-y-1">
        <p><span className="font-bold">Service :</span> {prestataire?.service}</p>
        <p><span className="font-bold">Date :</span> {form.dateDebut} à {form.heureDebut}</p>
        <p><span className="font-bold">Durée :</span> {form.duree}h</p>
        <p><span className="font-bold">Prix estimé :</span> <span className="text-primary font-extrabold">{prixEstime} DZD</span></p>
      </div>
      <button onClick={onClose} className="mt-4 px-8 py-3 bg-primary text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-lg">
        Fermer
      </button>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Résumé prestataire */}
      {prestataire && (
        <div className="flex items-center gap-3 p-3 bg-primary-fixed border-2 border-black rounded-lg">
          <img src={prestataire.photo} alt={prestataire.nom} className="w-12 h-12 rounded-full border-2 border-black object-cover flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-primary truncate">{prestataire.nom}</p>
            <p className="text-xs text-on-surface-variant">{prestataire.service} • {prestataire.ville}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-extrabold text-primary">{prestataire.prixHeure.toLocaleString('fr-FR')} DZD/h</span>
              <span className="text-xs text-on-surface-variant">★ {Number(prestataire.note || 0).toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}

      {!isSignedIn && (
        <div className="bg-error-container border-2 border-error text-on-error-container p-3 rounded-lg text-sm font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">warning</span>
          Vous devez être <a href="/sign-in" className="underline ml-1">connecté</a> pour réserver.
        </div>
      )}

      {error && (
        <div className="bg-error-container border-2 border-error text-on-error-container p-3 rounded-lg text-sm font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      {/* Date et heure */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className={labelCls}>Date *</label>
          <input
            required type="date"
            min={new Date().toISOString().split('T')[0]}
            className={inputCls}
            value={form.dateDebut}
            onChange={e => update('dateDebut', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Heure *</label>
          <input
            required type="time"
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
              className={`flex items-center justify-center gap-1.5 px-3 py-2 border-2 border-black font-bold text-sm rounded-xl transition-all
                ${form.duree === d
                  ? 'bg-primary text-white shadow-none translate-x-[1px] translate-y-[1px]'
                  : 'bg-white text-on-surface hover:bg-primary/5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              <span>{Number(d) < 1 ? `${Number(d) * 60}min` : `${d}h`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className={labelCls}>Notes / Instructions particulières</label>
        <textarea
          className={inputCls + ' h-20 resize-none'}
          value={form.notes}
          onChange={e => update('notes', e.target.value)}
          placeholder="Allergies, comportement particulier, accès au logement..."
        />
      </div>

      {/* Prix estimé */}
      {prestataire && (
        <div className="p-4 bg-surface-container border-2 border-black rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Prix estimé</p>
              <p className="font-['Chewy'] text-3xl text-primary mt-1">{prixEstime} DZD</p>
            </div>
            <div className="text-right text-xs text-on-surface-variant">
              <p>{prestataire.prixHeure.toLocaleString('fr-FR')} DZD/h × {form.duree}h</p>
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
        className="w-full py-4 bg-primary text-white font-['Plus_Jakarta_Sans'] font-extrabold uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
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
