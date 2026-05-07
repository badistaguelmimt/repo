import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useCart } from '../context/CartContext'
import { PageTransition, FadeIn } from '../components/Animations'
import { useRequireAuthAction } from '../hooks/useRequireAuthAction'
import { placeOrder } from '../services/authApi'

const STEPS = [
  { id: 1, label: 'Coordonnées', icon: 'person' },
  { id: 2, label: 'Livraison',   icon: 'local_shipping' },
  { id: 3, label: 'Paiement',    icon: 'payments' },
]

const PAYMENT_METHODS = [
  { id: 'carte',    icon: 'credit_card',     label: 'Carte Bancaire',           desc: 'Visa, Mastercard, CIB' },
  { id: 'virement', icon: 'account_balance',  label: 'Virement Bancaire',        desc: 'Paiement sous 2 jours ouvrés' },
  { id: 'especes',  icon: 'payments',         label: 'Paiement à la livraison',  desc: 'Espèces ou chèque' },
]

const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center gap-0 mb-10">
    {STEPS.map((step, idx) => (
      <div key={step.id} className="flex items-center flex-1 last:flex-none">
        <div className="flex flex-col items-center gap-1">
          <div className={`w-10 h-10 rounded-full border-[3px] border-black flex items-center justify-center font-extrabold text-sm transition-all duration-300 ${currentStep > step.id ? 'bg-secondary text-white border-secondary' : currentStep === step.id ? 'bg-primary text-white border-primary scale-110 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-surface-container text-on-surface-variant border-outline-variant'}`}>
            {currentStep > step.id ? <span className="material-symbols-outlined text-base">check</span> : <span className="material-symbols-outlined text-base">{step.icon}</span>}
          </div>
          <span className={`text-xs font-bold whitespace-nowrap ${currentStep === step.id ? 'text-primary' : 'text-on-surface-variant'}`}>{step.label}</span>
        </div>
        {idx < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-5 ${currentStep > step.id ? 'bg-secondary' : 'bg-outline-variant'}`} />}
      </div>
    ))}
  </div>
)

const FormSection = ({ icon, title, step, children }) => (
  <section className="bg-surface-container p-8 border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
    <h2 className="font-['Chewy'] text-3xl text-primary mb-6 flex items-center gap-3">
      <span className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-xl flex-shrink-0">{step}</span>
      <span className="material-symbols-outlined text-2xl">{icon}</span>
      {title}
    </h2>
    {children}
  </section>
)

const Field = ({ label, required, ...props }) => (
  <div className="space-y-2">
    <label className="font-bold text-sm uppercase tracking-wider text-on-surface">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
    <input required={required} {...props} className="w-full border-2 border-black p-3 bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none rounded-xl font-medium transition-all" />
  </div>
)

const Paiement = () => {
  const { cartItems, totalPrice, clearCart } = useCart()
  const { user } = useUser()
  const navigate = useNavigate()
  const { requireAuthAction } = useRequireAuthAction()

  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('carte')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    prenom: user?.firstName || '',
    nom: user?.lastName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    adresse: '',
    ville: '',
    codePostal: '',
    wilaya: '',
  })

  const upd = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  const scroll = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const goStep2 = (e) => { e.preventDefault(); setStep(2); scroll() }
  const goStep3 = (e) => { e.preventDefault(); setStep(3); scroll() }

  const handlePay = useCallback(async (e) => {
    e.preventDefault()
    requireAuthAction(async () => {
      setIsProcessing(true); setError(null)
      try {
        await new Promise(r => setTimeout(r, 1800))
        const items = cartItems.map(item => ({
          IdProduit: Number(item.id),
          Quantite: item.qty,
          Prix: item.prix,
          IdRefuge: Number(item.idRefuge) || 1,
        }))
        const result = await placeOrder({
          adresseLivraison: { adresse: form.adresse, ville: form.ville, codePostal: form.codePostal, wilaya: form.wilaya },
          items,
        })
        clearCart()
        navigate('/paiement/success', { state: { commandeId: result?.commandeId, total: result?.total ?? totalPrice, prenom: form.prenom, methode: paymentMethod } })
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Erreur lors du traitement de votre commande.')
        setIsProcessing(false)
      }
    })
  }, [cartItems, form, paymentMethod, totalPrice, clearCart, navigate, requireAuthAction])

  const OrderSummary = () => (
    <div className="bg-primary text-white p-8 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sticky top-28">
      <h2 className="font-['Chewy'] text-3xl mb-6 flex items-center gap-2"><span className="material-symbols-outlined">receipt_long</span> Récapitulatif</h2>
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-6">
        {cartItems.map(item => (
          <div key={item.id} className="flex gap-3 items-center bg-white/10 p-3 border border-white/20 rounded-xl">
            <img src={item.photo} alt={item.nom} className="w-14 h-14 object-cover rounded-lg border-2 border-white/30 flex-shrink-0" />
            <div className="flex-1 min-w-0"><p className="font-bold text-sm truncate">{item.nom}</p><p className="text-xs text-white/60">Qté : {item.qty}</p></div>
            <p className="font-bold text-sm flex-shrink-0">{(item.prix * item.qty).toLocaleString('fr-DZ')} DZD</p>
          </div>
        ))}
      </div>
      <div className="border-t-2 border-white/20 pt-5 space-y-3">
        <div className="flex justify-between text-sm"><span className="opacity-70">Sous-total</span><span className="font-bold">{totalPrice.toLocaleString('fr-DZ')} DZD</span></div>
        <div className="flex justify-between text-sm"><span className="opacity-70">Livraison</span><span className="font-bold text-secondary">Gratuite</span></div>
        <div className="flex justify-between text-4xl font-['Chewy'] pt-2 text-secondary"><span>TOTAL</span><span>{totalPrice.toLocaleString('fr-DZ')} DZD</span></div>
      </div>
      <div className="mt-6 space-y-3">
        {[{i:'verified_user',t:'Paiement sécurisé'},{i:'eco',t:'Soutient nos refuges'},{i:'local_shipping',t:'Livraison offerte'}].map(({i,t}) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-white/10 border border-white/20 rounded-xl">
            <span className="material-symbols-outlined text-secondary text-xl">{i}</span><p className="text-xs font-bold">{t}</p>
          </div>
        ))}
      </div>
    </div>
  )

  if (cartItems.length === 0) return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <span className="material-symbols-outlined text-8xl text-on-surface-variant opacity-30 block mb-4">shopping_cart</span>
        <h1 className="font-['Chewy'] text-5xl text-primary mb-4">Panier vide</h1>
        <p className="text-on-surface-variant mb-8">Ajoutez des produits avant de passer commande.</p>
        <Link to="/boutique" className="inline-flex items-center gap-2 bg-primary text-white font-bold py-3 px-8 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-xl">
          <span className="material-symbols-outlined">store</span> Aller à la boutique
        </Link>
      </div>
    </PageTransition>
  )

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <FadeIn className="mb-10">
          <h1 className="font-['Chewy'] text-5xl md:text-7xl text-primary mb-3">Commande</h1>
          <p className="text-xl text-on-surface-variant flex items-center gap-2">
            <Link to="/boutique" className="text-secondary hover:underline">Boutique</Link>
            <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
            <span>Finaliser</span>
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-6">
            <StepIndicator currentStep={step} />

            {/* ÉTAPE 1 */}
            {step === 1 && (
              <FadeIn>
                <form onSubmit={goStep2} className="space-y-6">
                  <FormSection icon="person" title="Vos Coordonnées" step="1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="Prénom" required type="text" placeholder="Mohamed" value={form.prenom} onChange={upd('prenom')} />
                      <Field label="Nom" required type="text" placeholder="Benali" value={form.nom} onChange={upd('nom')} />
                      <div className="md:col-span-2">
                        <Field label="Email" required type="email" placeholder="vous@email.com" value={form.email} onChange={upd('email')} />
                      </div>
                    </div>
                  </FormSection>
                  <button type="submit" disabled={!form.prenom || !form.nom || !form.email}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white font-extrabold text-lg border-4 border-black rounded-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    Continuer vers la livraison <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </form>
              </FadeIn>
            )}

            {/* ÉTAPE 2 */}
            {step === 2 && (
              <FadeIn>
                <form onSubmit={goStep3} className="space-y-6">
                  <FormSection icon="local_shipping" title="Adresse de Livraison" step="2">
                    <div className="space-y-5">
                      <Field label="Adresse" required type="text" placeholder="12 Rue des Fleurs" value={form.adresse} onChange={upd('adresse')} />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="md:col-span-2"><Field label="Ville" required type="text" placeholder="Alger" value={form.ville} onChange={upd('ville')} /></div>
                        <Field label="Code Postal" required type="text" placeholder="16000" value={form.codePostal} onChange={upd('codePostal')} />
                      </div>
                      <Field label="Wilaya" type="text" placeholder="Alger" value={form.wilaya} onChange={upd('wilaya')} />
                    </div>
                  </FormSection>
                  <div className="p-5 bg-primary-fixed border-2 border-black rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-2xl">local_shipping</span>
                    <div><p className="font-bold">Livraison Standard Gratuite</p><p className="text-xs text-on-surface-variant">Estimée à 3 – 5 jours ouvrés</p></div>
                    <span className="ml-auto font-extrabold text-secondary">Gratuite</span>
                  </div>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 px-6 py-4 border-4 border-black rounded-2xl font-bold bg-surface-container shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
                      <span className="material-symbols-outlined">arrow_back</span> Retour
                    </button>
                    <button type="submit" disabled={!form.adresse || !form.ville || !form.codePostal}
                      className="flex-1 flex items-center justify-center gap-3 py-4 bg-primary text-white font-extrabold text-lg border-4 border-black rounded-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      Continuer vers le paiement <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                </form>
              </FadeIn>
            )}

            {/* ÉTAPE 3 */}
            {step === 3 && (
              <FadeIn>
                <form onSubmit={handlePay} className="space-y-6">
                  <FormSection icon="payments" title="Mode de Paiement" step="3">
                    <div className="mb-5 p-4 bg-primary/5 border-2 border-black/10 rounded-xl grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-on-surface-variant">Nom</p><p className="font-bold">{form.prenom} {form.nom}</p></div>
                      <div><p className="text-on-surface-variant">Email</p><p className="font-bold truncate">{form.email}</p></div>
                      <div className="col-span-2"><p className="text-on-surface-variant">Adresse</p><p className="font-bold">{form.adresse}, {form.ville} {form.codePostal}</p></div>
                    </div>
                    <div className="space-y-3">
                      {PAYMENT_METHODS.map(m => (
                        <label key={m.id} onClick={() => setPaymentMethod(m.id)}
                          className={`flex items-center gap-4 p-4 border-2 border-black rounded-xl cursor-pointer transition-all ${paymentMethod === m.id ? 'bg-primary-fixed border-primary shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:bg-surface-container'}`}>
                          <input type="radio" name="payment" checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="accent-primary" />
                          <span className="material-symbols-outlined text-primary text-2xl">{m.icon}</span>
                          <div><p className="font-bold">{m.label}</p><p className="text-xs text-on-surface-variant">{m.desc}</p></div>
                          {paymentMethod === m.id && <span className="ml-auto material-symbols-outlined text-primary">check_circle</span>}
                        </label>
                      ))}
                    </div>
                    {paymentMethod === 'carte' && (
                      <div className="mt-4 p-4 bg-surface-container border-2 border-dashed border-black/30 rounded-xl space-y-3">
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-secondary">info</span> Simulation — aucune donnée réelle collectée
                        </p>
                        <input readOnly value="1234 5678 9012 3456" className="w-full border-2 border-black/20 p-3 bg-white/60 rounded-xl font-mono text-sm text-on-surface-variant" />
                        <div className="grid grid-cols-2 gap-3">
                          <input readOnly value="12/28" className="border-2 border-black/20 p-3 bg-white/60 rounded-xl font-mono text-sm text-center text-on-surface-variant" />
                          <input readOnly value="•••" className="border-2 border-black/20 p-3 bg-white/60 rounded-xl font-mono text-sm text-center text-on-surface-variant" />
                        </div>
                      </div>
                    )}
                    {error && (
                      <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-300 rounded-xl mt-4">
                        <span className="material-symbols-outlined text-red-500 flex-shrink-0">error</span>
                        <p className="text-red-600 text-sm font-bold">{error}</p>
                      </div>
                    )}
                  </FormSection>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => { setStep(2); setError(null) }} className="flex items-center gap-2 px-6 py-4 border-4 border-black rounded-2xl font-bold bg-surface-container shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
                      <span className="material-symbols-outlined">arrow_back</span> Retour
                    </button>
                    <button type="submit" disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-3 py-4 bg-primary text-white font-extrabold text-xl border-4 border-black rounded-2xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                      {isProcessing ? (<><span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> Traitement…</>) : (<><span className="material-symbols-outlined">lock</span>Payer {totalPrice.toLocaleString('fr-DZ')} DZD</>)}
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-6 text-on-surface-variant text-xs">
                    {[{i:'lock',t:'Sécurisé'},{i:'verified',t:'Chiffré'},{i:'eco',t:'Soutient nos refuges'}].map(({i,t}) => (
                      <div key={i} className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-secondary">{i}</span>{t}</div>
                    ))}
                  </div>
                </form>
              </FadeIn>
            )}
          </div>
          <div className="lg:col-span-5"><OrderSummary /></div>
        </div>
      </div>
    </PageTransition>
  )
}

export default Paiement
