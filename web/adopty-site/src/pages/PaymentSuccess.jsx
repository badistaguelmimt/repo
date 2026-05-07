import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { PageTransition, FadeIn } from '../components/Animations'

const METHODE_LABELS = {
  carte:    { icon: 'credit_card',    label: 'Carte Bancaire' },
  virement: { icon: 'account_balance', label: 'Virement Bancaire' },
  especes:  { icon: 'payments',        label: 'Paiement à la livraison' },
}

const PaymentSuccess = () => {
  const location = useLocation()
  const { commandeId, total, prenom, methode } = location.state || {}
  const methodeInfo = METHODE_LABELS[methode] ?? { icon: 'check_circle', label: 'Paiement confirmé' }

  useEffect(() => {
    document.title = 'Commande confirmée — Adopty'
    return () => { document.title = 'Adopty' }
  }, [])

  return (
    <PageTransition>
      <div className="min-h-[85vh] flex items-center justify-center px-6 py-16">
        <div className="max-w-xl w-full">

          {/* Carte principale */}
          <FadeIn>
            <div className="bg-white border-4 border-black rounded-3xl shadow-[12px_12px_0px_0px_rgba(21,66,18,1)] overflow-hidden">

              {/* Bandeau supérieur */}
              <div className="bg-primary px-8 pt-10 pb-8 text-center">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-secondary rounded-full animate-ping opacity-30" />
                  <div className="relative w-20 h-20 bg-secondary rounded-full border-4 border-white flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
                    <span className="material-symbols-outlined text-white text-4xl">check</span>
                  </div>
                </div>
                <h1 className="font-['Chewy'] text-5xl text-white mb-2">
                  Merci{prenom ? `, ${prenom}` : ''} !
                </h1>
                <p className="text-white/80 font-medium text-lg">
                  Votre commande a été confirmée avec succès. 🐾
                </p>
              </div>

              {/* Corps */}
              <div className="p-8 space-y-5">
                <div className="space-y-0 divide-y divide-outline-variant">
                  {commandeId && (
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-2 text-on-surface-variant font-medium text-sm">
                        <span className="material-symbols-outlined text-base">receipt</span>
                        Numéro de commande
                      </div>
                      <span className="font-mono font-bold">#{String(commandeId).padStart(6, '0')}</span>
                    </div>
                  )}

                  {total != null && (
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-2 text-on-surface-variant font-medium text-sm">
                        <span className="material-symbols-outlined text-base">payments</span>
                        Montant total
                      </div>
                      <span className="font-extrabold text-primary text-lg">{Number(total).toLocaleString('fr-DZ')} DZD</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-2 text-on-surface-variant font-medium text-sm">
                      <span className="material-symbols-outlined text-base">{methodeInfo.icon}</span>
                      Mode de paiement
                    </div>
                    <span className="font-bold text-sm">{methodeInfo.label}</span>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-2 text-on-surface-variant font-medium text-sm">
                      <span className="material-symbols-outlined text-base">local_shipping</span>
                      Livraison estimée
                    </div>
                    <span className="font-bold text-sm">3 – 5 jours ouvrés</span>
                  </div>
                </div>

                {/* Message solidarité */}
                <div className="bg-secondary-fixed border-2 border-black rounded-xl p-4 text-center">
                  <p className="text-sm font-medium leading-relaxed">
                    Votre achat soutient directement nos refuges partenaires.<br />
                    <strong>Merci pour votre geste solidaire !</strong>
                  </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-3 pt-2">
                  <Link
                    to="/boutique"
                    className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-white font-extrabold text-base border-4 border-black rounded-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                  >
                    <span className="material-symbols-outlined">store</span>
                    Continuer mes achats
                  </Link>
                  <Link
                    to="/profil"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-surface-container text-on-surface font-bold text-sm border-2 border-black rounded-xl hover:bg-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined">receipt_long</span>
                    Voir mes commandes
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Badges sécurité */}
          <FadeIn delay={0.2} className="mt-6 flex items-center justify-center gap-6 text-on-surface-variant">
            {[{i:'lock',t:'Sécurisé'},{i:'verified',t:'Chiffré SSL'},{i:'eco',t:'Impact positif'}].map(({i,t}) => (
              <div key={i} className="flex items-center gap-2 text-xs font-medium">
                <span className="material-symbols-outlined text-base">{i}</span>{t}
              </div>
            ))}
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  )
}

export default PaymentSuccess
