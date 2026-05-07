import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Style élégant pour l'iframe CardElement de Stripe
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      fontSize: '16px',
      color: '#1a1a1a',
      fontWeight: '500',
      letterSpacing: '0.02em',
      '::placeholder': {
        color: '#9ca3af',
        fontWeight: '400',
      },
      iconColor: '#154212',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
    complete: {
      color: '#154212',
      iconColor: '#154212',
    },
  },
  hidePostalCode: false,
}

/**
 * StripePaymentForm
 *
 * Props :
 * - clientSecret {string}  : Le client_secret du PaymentIntent (depuis le backend)
 * - amount       {number}  : Montant en EUR (pour affichage uniquement)
 * - onSuccess    {fn}      : Appelé avec { paymentIntent } si paiement OK
 * - onError      {fn}      : Appelé avec { message } si erreur
 * - billingDetails {object}: { name, email, address: { line1, city, postal_code } }
 * - disabled     {boolean} : Désactive le bouton
 */
const StripePaymentForm = ({
  clientSecret,
  amount,
  onSuccess,
  onError,
  billingDetails = {},
  disabled = false,
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardError, setCardError] = useState(null)
  const [cardComplete, setCardComplete] = useState(false)

  const handleCardChange = (event) => {
    setCardError(event.error ? event.error.message : null)
    setCardComplete(event.complete)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!stripe || !elements || !clientSecret) return

    setIsProcessing(true)
    setCardError(null)

    const cardElement = elements.getElement(CardElement)

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: billingDetails.name || '',
            email: billingDetails.email || '',
            address: {
              line1: billingDetails.address?.line1 || '',
              city: billingDetails.address?.city || '',
              postal_code: billingDetails.address?.postal_code || '',
              country: 'DZ', // Algérie par défaut
            },
          },
        },
      })

      if (error) {
        setCardError(getFriendlyErrorMessage(error))
        onError?.({ message: error.message })
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess?.({ paymentIntent })
      } else {
        // Statut intermédiaire (requires_action, processing, etc.)
        setCardError(`Statut inattendu : ${paymentIntent.status}. Veuillez réessayer.`)
        onError?.({ message: `Statut : ${paymentIntent.status}` })
      }
    } catch (err) {
      const msg = err.message || 'Une erreur inattendue est survenue.'
      setCardError(msg)
      onError?.({ message: msg })
    } finally {
      setIsProcessing(false)
    }
  }

  const canSubmit = stripe && elements && clientSecret && cardComplete && !disabled && !isProcessing

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Champ Carte Stripe */}
      <div className="space-y-2">
        <label className="font-bold text-sm uppercase tracking-wider text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-primary">credit_card</span>
          Informations de carte bancaire
        </label>

        <div
          className={`
            relative border-2 rounded-xl p-4 bg-white transition-all duration-200
            ${cardError
              ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
              : cardComplete
              ? 'border-green-600 shadow-[0_0_0_3px_rgba(21,66,18,0.1)]'
              : 'border-black focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(21,66,18,0.1)]'
            }
          `}
        >
          <CardElement options={CARD_ELEMENT_OPTIONS} onChange={handleCardChange} />

          {/* Indicateur de complétion */}
          {cardComplete && !cardError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className="material-symbols-outlined text-green-600 text-xl">check_circle</span>
            </div>
          )}
        </div>

        {/* Message d'erreur Stripe */}
        {cardError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <span className="material-symbols-outlined text-red-500 text-base flex-shrink-0 mt-0.5">
              error
            </span>
            <p className="text-sm font-medium text-red-700">{cardError}</p>
          </div>
        )}
      </div>

      {/* Badges de sécurité */}
      <div className="flex items-center gap-3 p-3 bg-surface-container border border-outline-variant rounded-xl">
        <span className="material-symbols-outlined text-primary text-xl">lock</span>
        <div>
          <p className="text-xs font-bold text-on-surface">Paiement 100% sécurisé par Stripe</p>
          <p className="text-xs text-on-surface-variant">Vos données bancaires ne transitent jamais par nos serveurs</p>
        </div>
        {/* Logo Stripe texte */}
        <div className="ml-auto flex-shrink-0">
          <span className="text-xs font-black text-[#635bff] tracking-tight">stripe</span>
        </div>
      </div>

      {/* Bouton de paiement */}
      <button
        type="submit"
        disabled={!canSubmit}
        className={`
          w-full flex items-center justify-center gap-4 py-5
          font-['Plus_Jakarta_Sans'] font-extrabold text-xl uppercase tracking-wide
          border-4 border-black rounded-2xl transition-all duration-200
          ${canSubmit
            ? 'bg-secondary text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none cursor-pointer'
            : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-60 shadow-none'
          }
        `}
      >
        {isProcessing ? (
          <>
            <span className="material-symbols-outlined animate-spin text-2xl">sync</span>
            Traitement en cours…
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-2xl">security</span>
            Payer {amount != null ? `${Number(amount).toFixed(2)} €` : ''}
          </>
        )}
      </button>
    </form>
  )
}

// Traduit les codes d'erreur Stripe en messages clairs
function getFriendlyErrorMessage(error) {
  const map = {
    card_declined: 'Votre carte a été refusée. Vérifiez vos informations ou utilisez une autre carte.',
    insufficient_funds: 'Fonds insuffisants sur votre carte.',
    expired_card: 'Votre carte est expirée.',
    incorrect_cvc: 'Le code CVC est incorrect.',
    incorrect_number: 'Le numéro de carte est incorrect.',
    invalid_expiry_month: "Le mois d'expiration est invalide.",
    invalid_expiry_year: "L'année d'expiration est invalide.",
    processing_error: 'Une erreur de traitement est survenue. Réessayez dans quelques instants.',
  }
  return map[error.code] || error.message || 'Une erreur est survenue lors du paiement.'
}

export default StripePaymentForm
