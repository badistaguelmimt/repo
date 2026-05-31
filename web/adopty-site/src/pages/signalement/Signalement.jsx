import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageTransition, FadeIn } from '../../components/Animations'
import { useRoleAccess } from '../../hooks/useRoleAccess'
import { createSignalementApi } from '../../services/authApi'

const STEPS = ['Situation', 'Description', 'Envoi']

const Signalement = () => {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [submittedId, setSubmittedId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { isSignedIn } = useRoleAccess()

  const [form, setForm] = useState({
    typeAnimal: '',
    lieu: '',
    ville: '',
    dateObservation: '',
    heureObservation: '',
    etatSante: '',
    description: '',
    anonyme: false,
    prenom: '',
    nom: '',
    telephone: '',
    email: '',
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  const isStep0Valid = form.lieu.trim() && form.ville.trim() && form.dateObservation
  const isStep1Valid = form.typeAnimal && form.etatSante && form.description.trim().length >= 20

  const handleNext = () => {
    setError(null)
    if (step === 0 && !isStep0Valid) {
      setError('Veuillez remplir le lieu, la ville et la date d\'observation.')
      return
    }
    if (step === 1 && !isStep1Valid) {
      setError('Veuillez sélectionner le type d\'animal, l\'état de santé et fournir une description (min 20 caractères).')
      return
    }
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    if (!isSignedIn) {
      setError('Vous devez être connecté pour soumettre un signalement.')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      // Construire la raison complète à partir du formulaire
      const raisonParts = [
        `[${form.typeAnimal}] État: ${form.etatSante}`,
        `Lieu: ${form.lieu}, ${form.ville}`,
        form.dateObservation ? `Date: ${form.dateObservation}${form.heureObservation ? ` à ${form.heureObservation}` : ''}` : '',
        `\nDescription: ${form.description}`,
        !form.anonyme && (form.prenom || form.nom) ? `\nContact: ${form.prenom} ${form.nom}${form.telephone ? ` — ${form.telephone}` : ''}${form.email ? ` — ${form.email}` : ''}` : '',
      ].filter(Boolean).join(' | ')

      const result = await createSignalementApi({
        TypeCible: `animal-${form.typeAnimal.toLowerCase()}`,
        IdCible: 0,
        Raison: raisonParts,
      })

      setSubmittedId(result?.id ?? null)
      setSubmitted(true)
    } catch (err) {
      console.error('Erreur soumission signalement:', err)
      setError(err?.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputCls = 'w-full bg-white border-2 border-black px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary rounded-lg'
  const labelCls = "block font-['Plus_Jakarta_Sans'] font-bold text-sm mb-1.5 text-on-surface"

  if (submitted) return (
    <div className="min-h-screen bg-[#fbfbe2] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-primary-fixed border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <span className="material-symbols-outlined text-5xl text-primary">check_circle</span>
        </div>
        <h1 className="font-['Chewy'] text-5xl text-primary mb-4">Signalement reçu !</h1>
        <p className="text-on-surface-variant leading-relaxed mb-8">
          Merci pour votre vigilance. Notre équipe a bien reçu votre signalement et va le traiter en priorité.
        </p>
        {submittedId && (
          <div className="bg-surface-container border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 rounded-xl mb-8 text-left">
            <p className="font-bold text-sm uppercase tracking-wider text-on-surface-variant mb-2">Référence de signalement</p>
            <p className="font-['Chewy'] text-3xl text-primary">#SIG-{submittedId}</p>
          </div>
        )}
        <div className="flex gap-4">
          <a href="tel:15" className="flex-1 py-3 border-4 border-black bg-[#ba1a1a] text-white font-bold flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="material-symbols-outlined">call</span> Urgence vét.
          </a>
          <a href="/" className="flex-1 py-3 border-4 border-black bg-primary text-white font-bold flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="material-symbols-outlined">home</span> Accueil
          </a>
        </div>
      </div>
    </div>
  )

  return (
    <PageTransition>
      {/* Hero */}
      <section className="bg-[#ba1a1a] py-10 px-6 border-b-4 border-black relative overflow-hidden">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
          <div className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center flex-shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse">
            <span className="material-symbols-outlined text-3xl text-[#ba1a1a]">warning</span>
          </div>
          <div>
            <FadeIn>
              <h1 className="font-['Chewy'] text-4xl md:text-5xl text-white mb-2">Signaler un animal en danger</h1>
              <p className="text-white/80 font-body">Votre alerte peut sauver une vie. Notre équipe est disponible 7j/7.</p>
            </FadeIn>
          </div>
          <div className="ml-auto hidden md:block">
            <a href="tel:015" className="flex items-center gap-2 bg-white border-4 border-black px-5 py-3 font-['Plus_Jakarta_Sans'] font-extrabold text-[#ba1a1a] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              <span className="material-symbols-outlined">call</span> Appeler le refuge
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Progress steps */}
        <FadeIn className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-full border-2 border-black flex items-center justify-center font-['Plus_Jakarta_Sans'] font-extrabold text-sm transition-all
                  ${i < step ? 'bg-primary text-white' : i === step ? 'bg-[#ba1a1a] text-white' : 'bg-surface-container text-on-surface-variant'}`}>
                  {i < step ? <span className="material-symbols-outlined text-base">check</span> : i + 1}
                </div>
                <span className={`hidden sm:block text-sm font-bold transition-colors ${i === step ? 'text-[#ba1a1a]' : i < step ? 'text-primary' : 'text-on-surface-variant'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 border-t-2 border-dashed mx-2 transition-colors ${i < step ? 'border-primary' : 'border-outline-variant'}`} />
              )}
            </div>
          ))}
        </FadeIn>

        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-error-container border-2 border-error text-on-error-container px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-bold">
            <span className="material-symbols-outlined flex-shrink-0">error</span>
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {/* STEP 0: Situation */}
            {step === 0 && (
              <div className="bg-surface-container-lowest border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(186,26,26,0.3)]">
                <h2 className="font-['Chewy'] text-3xl text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-3xl text-[#ba1a1a]">location_on</span>
                  Où avez-vous observé l'animal ?
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Description du lieu *</label>
                    <input className={inputCls} value={form.lieu} onChange={e => update('lieu', e.target.value)}
                      placeholder="Ex: Parc Montcalm, près des jeux pour enfants" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Ville *</label>
                      <input className={inputCls} value={form.ville} onChange={e => update('ville', e.target.value)} placeholder="Alger" />
                    </div>
                    <div>
                      <label className={labelCls}>Code postal / Wilaya</label>
                      <input className={inputCls} value={form.codePostal} onChange={e => update('codePostal', e.target.value)} placeholder="16000" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Date d'observation *</label>
                      <input required type="date" className={inputCls} value={form.dateObservation} onChange={e => update('dateObservation', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Heure approximative</label>
                      <input type="time" className={inputCls} value={form.heureObservation} onChange={e => update('heureObservation', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: Description */}
            {step === 1 && (
              <div className="bg-surface-container-lowest border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(186,26,26,0.3)]">
                <h2 className="font-['Chewy'] text-3xl text-primary mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-3xl text-[#ba1a1a]">description</span>
                  Décrivez l'animal
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Type d'animal *</label>
                    <div className="flex flex-wrap gap-3 mt-1">
                      {['Chien', 'Chat', 'Oiseau', 'Lapin', 'Autre'].map(t => (
                        <button key={t} type="button" onClick={() => update('typeAnimal', t)}
                          className={`px-4 py-2 border-2 border-black font-bold text-sm transition-all rounded-lg
                            ${form.typeAnimal === t ? 'bg-[#ba1a1a] text-white shadow-none translate-x-[2px] translate-y-[2px]' : 'bg-surface-container-lowest hover:bg-surface-container shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>État de santé apparent *</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {[
                        { label: '🩸 Blessé', value: 'blessé' },
                        { label: '😰 Apeuré', value: 'apeuré' },
                        { label: '⚠️ Maigre/malnutri', value: 'malnutri' },
                        { label: '🏃 Fugué/perdu', value: 'perdu' },
                        { label: '😴 Inconscient', value: 'inconscient' },
                        { label: '❓ Bonne santé', value: 'bon' },
                      ].map(opt => (
                        <label key={opt.value} className={`flex items-center gap-2 p-3 border-2 border-black cursor-pointer transition-all rounded-lg
                          ${form.etatSante === opt.value ? 'bg-[#ba1a1a]/10 border-[#ba1a1a]' : 'bg-surface-container-lowest hover:bg-surface-container'}`}>
                          <input type="radio" name="etatSante" value={opt.value} checked={form.etatSante === opt.value} onChange={e => update('etatSante', e.target.value)} className="sr-only" />
                          <span className="font-bold text-sm">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Description détaillée * <span className="font-normal text-on-surface-variant">(min. 20 caractères)</span></label>
                    <textarea className={inputCls + ' h-28 resize-none'} value={form.description} onChange={e => update('description', e.target.value)}
                      placeholder="Couleur, taille, comportement, collier, blessures visibles..." />
                    <p className={`text-xs mt-1 ${form.description.length >= 20 ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {form.description.length}/20 caractères minimum
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Envoi */}
            {step === 2 && (
              <div className="bg-surface-container-lowest border-4 border-black rounded-xl p-8 shadow-[8px_8px_0px_0px_rgba(186,26,26,0.3)]">
                <h2 className="font-['Chewy'] text-3xl text-primary mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-3xl text-[#ba1a1a]">contact_phone</span>
                  Vos coordonnées
                </h2>
                <p className="text-on-surface-variant text-sm mb-6">Facultatif mais recommandé pour qu'on puisse vous joindre si besoin.</p>

                {!isSignedIn && (
                  <div className="mb-6 bg-secondary-fixed border-2 border-black p-4 rounded-xl text-sm font-bold text-on-secondary-fixed flex items-center gap-3">
                    <span className="material-symbols-outlined">info</span>
                    <span>Vous devez être <a href="/sign-in" className="underline">connecté</a> pour soumettre un signalement.</span>
                  </div>
                )}

                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 border-2 border-dashed border-outline cursor-pointer rounded-lg hover:bg-surface-container transition-colors">
                    <input type="checkbox" checked={form.anonyme} onChange={e => update('anonyme', e.target.checked)} className="w-5 h-5 border-2 border-black text-primary" />
                    <div>
                      <p className="font-bold text-sm">Signalement anonyme</p>
                      <p className="text-xs text-on-surface-variant">Nous traiterons votre signalement sans conserver vos coordonnées.</p>
                    </div>
                  </label>

                  {!form.anonyme && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelCls}>Prénom</label><input className={inputCls} value={form.prenom} onChange={e => update('prenom', e.target.value)} /></div>
                        <div><label className={labelCls}>Nom</label><input className={inputCls} value={form.nom} onChange={e => update('nom', e.target.value)} /></div>
                      </div>
                      <div><label className={labelCls}>Téléphone</label><input className={inputCls} value={form.telephone} onChange={e => update('telephone', e.target.value)} placeholder="06 XX XX XX XX" /></div>
                      <div><label className={labelCls}>Email</label><input type="email" className={inputCls} value={form.email} onChange={e => update('email', e.target.value)} /></div>
                    </div>
                  )}

                  {/* Récapitulatif */}
                  <div className="bg-surface-container border-2 border-black rounded-xl p-4 space-y-1 text-sm">
                    <p className="font-bold text-xs uppercase text-on-surface-variant mb-2">Récapitulatif du signalement</p>
                    <p><span className="font-bold">Animal :</span> {form.typeAnimal} — {form.etatSante}</p>
                    <p><span className="font-bold">Lieu :</span> {form.lieu}, {form.ville}</p>
                    <p><span className="font-bold">Date :</span> {form.dateObservation}{form.heureObservation ? ` à ${form.heureObservation}` : ''}</p>
                  </div>

                  <div className="bg-tertiary-fixed border-2 border-black rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-tertiary text-xl flex-shrink-0">info</span>
                      <p className="text-sm text-on-tertiary-fixed leading-relaxed">
                        En soumettant ce formulaire, vous confirmez avoir observé un animal en difficulté et que les informations fournies sont exactes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          {step > 0 && (
            <button onClick={() => { setStep(s => s - 1); setError(null) }}
              className="px-8 py-4 border-4 border-black font-['Plus_Jakarta_Sans'] font-bold uppercase tracking-wider hover:bg-surface-container transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
              ← Retour
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={handleNext}
              className="flex-1 py-4 bg-[#ba1a1a] text-white font-['Plus_Jakarta_Sans'] font-extrabold uppercase tracking-widest border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              Étape suivante →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading || !isSignedIn}
              className="flex-1 py-4 bg-[#ba1a1a] text-white font-['Plus_Jakarta_Sans'] font-extrabold uppercase tracking-widest border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-xl">report</span>
                  Envoyer le signalement
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </PageTransition>
  )
}

export default Signalement
