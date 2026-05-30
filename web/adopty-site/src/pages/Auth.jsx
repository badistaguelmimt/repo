import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSignUp, useSignIn, useAuth } from '@clerk/clerk-react'
import { PageTransition, FadeIn } from '../components/Animations'
import { motion, AnimatePresence } from 'framer-motion'
import { bootstrapCurrentUtilisateur } from '../services/authApi'

// ── Étapes inscription ──────────────────────────────────────
const STEPS_SIGNUP = ['Compte', 'Informations', 'Rôle']

// ── Composants utilitaires ──────────────────────────────────
const InputField = ({ label, type = 'text', value, onChange, placeholder, required }) => (
  <div>
    <label className="block font-['Plus_Jakarta_Sans'] font-bold text-sm mb-1.5 text-on-surface">
      {label} {required && <span className="text-error">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full bg-white border-2 border-black px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary rounded-lg"
    />
  </div>
)

// ── Page principale ─────────────────────────────────────────
const Auth = () => {
  const navigate = useNavigate()
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp()
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn()
  const { getToken } = useAuth()

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Champs
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [wilaya, setWilaya] = useState('')
  const [adresse, setAdresse] = useState('')
  const [role, setRole] = useState('') // '' | 'refuge' | 'prestataire'

  // Champs rôle avancé
  const [nomRefuge, setNomRefuge] = useState('')
  const [siret, setSiret] = useState('')
  const [capacite, setCapacite] = useState('')
  const [experience, setExperience] = useState('')
  const [service, setService] = useState('')
  const [zone, setZone] = useState('')

  const [verificationCode, setVerificationCode] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)

  const resetSignup = () => {
    setStep(0); setRole(''); setError('')
    setEmail(''); setPassword(''); setConfirmPassword('')
    setPrenom(''); setNom(''); setWilaya(''); setAdresse('')
    setNomRefuge(''); setSiret(''); setCapacite('')
    setExperience(''); setService(''); setZone('')
    setPendingVerification(false); setVerificationCode('')
  }

  // ── GOOGLE OAuth ────────────────────────────────────────
  const handleGoogleAuth = async () => {
    if (!signInLoaded) return
    setLoading(true); setError('')
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/'
      })
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || 'Erreur lors de la connexion Google.')
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    if (!signUpLoaded) return
    setLoading(true); setError('')
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/'
      })
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || 'Erreur lors de l\'inscription Google.')
      setLoading(false)
    }
  }

  // ── LOGIN ───────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!signInLoaded) return
    setLoading(true); setError('')
    try {
      const result = await signIn.create({ identifier: email, password })
      if (result.status === 'complete') {
        await setActiveSignIn({ session: result.createdSessionId })
        try {
          await bootstrapCurrentUtilisateur()
        } catch (bootstrapError) {
          console.warn('Bootstrap utilisateur indisponible apres connexion:', bootstrapError)
        }
        navigate('/')
      }
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || 'Email ou mot de passe incorrect.')
    } finally { setLoading(false) }
  }

  // ── SIGNUP Step 0 → crée le compte Clerk ───────────────
  const handleStep0 = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return }
    if (!signUpLoaded) return
    setLoading(true); setError('')
    try {
      await signUp.create({ emailAddress: email, password })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || 'Erreur lors de la création du compte.')
    } finally { setLoading(false) }
  }

  // ── Vérification email ──────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault()
    if (!signUpLoaded) return
    setLoading(true); setError('')
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verificationCode })
      if (result.status === 'complete') {
        // ✅ Activer la session IMMÉDIATEMENT ici pendant que le token est frais
        await setActiveSignUp({ session: result.createdSessionId })
        setPendingVerification(false)
        setStep(1)
      } else {
        setError('Code invalide. Vérifiez votre email.')
      }
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || 'Code invalide.')
    } finally { setLoading(false) }
  }

  // ── SIGNUP Step 1 → infos perso ────────────────────────
  const handleStep1 = async (e) => {
    e.preventDefault()
    setStep(2)
  }

  // ── SIGNUP Step 2 → rôle + finalisation ──────────────────────
  const handleFinalize = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')

    try {
      // ✅ La session a déjà été activée dans handleVerify — on récupère juste le token
      console.log('⏳ Récupération du token (session déjà active)...')
      let token = null
      for (let attempt = 1; attempt <= 6; attempt++) {
        token = await getToken()
        if (!token) token = await window.Clerk?.session?.getToken() ?? null
        console.log(`   Tentative ${attempt}/6 — token: ${token ? '✅ OK' : '⏳...'}`)
        if (token) break
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      if (!token) {
        setError('Session expirée. Veuillez vous reconnecter.')
        setLoading(false)
        return
      }

      // Envoyer toutes les infos au backend
      console.log('🚀 Bootstrap avec rôle:', role || 'utilisateur')
      try {
        const result = await bootstrapCurrentUtilisateur({
          prenom, nom, adresse, email, wilaya,
          role: role || 'utilisateur',
          nomRefuge, siret, capacite, experience, service, zone,
          token,
        })
        console.log('✅ Bootstrap réussi — rôles:', result?.roles?.map(r => r.Nom || r.nom))
      } catch (bootstrapError) {
        console.error('❌ Bootstrap échoué:', bootstrapError?.response?.data || bootstrapError.message)
        // Non bloquant — l'utilisateur est déjà connecté
      }

      // Redirection vers l'accueil
      console.log('➡️ Redirection vers l\'accueil...')
      window.location.href = '/'
    } catch (err) {
      console.error('❌ Erreur finalisation:', err)
      setError(err.errors?.[0]?.longMessage || 'Erreur lors de la finalisation.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full bg-white border-2 border-black px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary rounded-lg"

  return (
    <div className="min-h-screen bg-[#fbfbe2] flex">
      {/* Panel gauche — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-primary border-r-4 border-black p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute -bottom-10 -left-10 text-[300px] leading-none">🐾</div>
        </div>
        <Link to="/" className="font-['Chewy'] text-4xl text-white relative z-10">Adopty</Link>
        <div className="relative z-10">
          <h2 className="font-['Chewy'] text-5xl text-white mb-6 leading-tight">
            Rejoignez la famille<br /><span className="text-secondary-container">L'Éveil Naturel</span>
          </h2>
          <div className="space-y-4">
            {[
              { icon: 'pets', text: '500+ animaux attendent leur famille' },
              { icon: 'volunteer_activism', text: 'Une communauté bienveillante' },
              { icon: 'verified', text: 'Adoptions suivies de A à Z' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-secondary-container">{item.icon}</span>
                </div>
                <p className="text-white/80 font-bold text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-xs relative z-10">© 2024 Adopty — L'Éveil Naturel</p>
      </div>

      {/* Panel droit — formulaires */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Logo mobile */}
          <Link to="/" className="font-['Chewy'] text-3xl text-primary mb-8 block lg:hidden">← Adopty</Link>

          {/* Tabs login/signup */}
          <div className="flex border-4 border-black mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {[{ id: 'login', label: 'Se connecter' }, { id: 'signup', label: "S'inscrire" }].map(tab => (
              <button key={tab.id} onClick={() => { setMode(tab.id); resetSignup(); setError('') }}
                className={`flex-1 py-3 font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-wider transition-colors
                  ${mode === tab.id ? 'bg-primary text-white' : 'bg-white text-on-surface-variant hover:bg-surface-container'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ── LOGIN ─────────────────────────────────── */}
            {mode === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="font-['Chewy'] text-4xl text-primary mb-2">Bon retour !</h1>
                <p className="text-on-surface-variant text-sm mb-8">Connectez-vous pour accéder à votre espace.</p>
                {/* Bouton Google */}
                <button type="button" onClick={handleGoogleAuth} disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-['Plus_Jakarta_Sans'] font-bold text-sm disabled:opacity-60 rounded-lg mb-4">
                  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  Continuer avec Google
                </button>

                {/* Séparateur */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-black/20" />
                  <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">ou</span>
                  <div className="flex-1 h-px bg-black/20" />
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="vous@email.com" required />
                  <InputField label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
                  {error && <p className="text-error text-sm font-bold bg-error-container px-4 py-3 rounded-lg border border-error">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full py-4 bg-primary text-white font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-60">
                    {loading ? 'Connexion...' : 'Se connecter →'}
                  </button>
                  <p className="text-center text-sm text-on-surface-variant">
                    Pas encore de compte ?{' '}
                    <button type="button" onClick={() => { setMode('signup'); resetSignup() }} className="font-bold text-primary underline">S'inscrire</button>
                  </p>
                </form>
              </motion.div>
            )}

            {/* ── SIGNUP ────────────────────────────────── */}
            {mode === 'signup' && (
              <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <h1 className="font-['Chewy'] text-4xl text-primary mb-1">
                    {step === 0 ? 'Créer un compte' : step === 1 ? 'Vos informations' : 'Votre rôle'}
                  </h1>
                  <p className="text-on-surface-variant text-sm">Étape {step + 1} sur {STEPS_SIGNUP.length}</p>
                  {/* Progress bar */}
                  <div className="flex gap-1.5 mt-3">
                    {STEPS_SIGNUP.map((_, i) => (
                      <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-surface-container-high'}`} />
                    ))}
                  </div>
                </div>

                {/* STEP 0 — Email/Mot de passe */}
                {step === 0 && !pendingVerification && (
                  <div>
                    {/* Bouton Google */}
                    <button type="button" onClick={handleGoogleSignUp} disabled={loading}
                      className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all font-['Plus_Jakarta_Sans'] font-bold text-sm disabled:opacity-60 rounded-lg mb-4">
                      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                        <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                      </svg>
                      S'inscrire avec Google
                    </button>

                    {/* Séparateur */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-px bg-black/20" />
                      <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">ou avec email</span>
                      <div className="flex-1 h-px bg-black/20" />
                    </div>

                    <form onSubmit={handleStep0} className="space-y-4">
                      <InputField label="Adresse email" type="email" value={email} onChange={setEmail} placeholder="vous@email.com" required />
                      <InputField label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="Minimum 8 caractères" required />
                      <InputField label="Confirmer le mot de passe" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" required />
                      {error && <p className="text-error text-sm font-bold bg-error-container px-4 py-3 rounded-lg border border-error">{error}</p>}
                      <button type="submit" disabled={loading}
                        className="w-full py-4 bg-primary text-white font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-60">
                        {loading ? 'Création...' : 'Continuer →'}
                      </button>
                    </form>
                  </div>
                )}

                {/* STEP 0 — Vérification email */}
                {step === 0 && pendingVerification && (
                  <form onSubmit={handleVerify} className="space-y-4">
                    <div className="bg-primary-fixed border-2 border-black rounded-xl p-4 text-center">
                      <span className="material-symbols-outlined text-primary text-3xl mb-2 block">mark_email_read</span>
                      <p className="font-bold text-sm text-primary">Code envoyé à <strong>{email}</strong></p>
                      <p className="text-xs text-on-surface-variant mt-1">Vérifiez votre boîte de réception.</p>
                    </div>
                    <InputField label="Code de vérification" value={verificationCode} onChange={setVerificationCode} placeholder="123456" required />
                    {error && <p className="text-error text-sm font-bold bg-error-container px-4 py-3 rounded-lg border border-error">{error}</p>}
                    <button type="submit" disabled={loading}
                      className="w-full py-4 bg-primary text-white font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-60">
                      {loading ? 'Vérification...' : 'Vérifier →'}
                    </button>
                  </form>
                )}

                {/* STEP 1 — Informations personnelles */}
                {step === 1 && (
                  <form onSubmit={handleStep1} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Prénom" value={prenom} onChange={setPrenom} placeholder="Marie" required />
                      <InputField label="Nom" value={nom} onChange={setNom} placeholder="Martin" required />
                    </div>
                    <InputField label="Wilaya" value={wilaya} onChange={setWilaya} placeholder="Ex: Alger, Oran, Constantine..." required />
                    <div>
                      <InputField label="Adresse" value={adresse} onChange={setAdresse} placeholder="Ex: 12 rue de la Forêt, Alger" required />
                      <p className="text-xs text-on-surface-variant mt-1">Format: Adresse, Ville (séparé par une virgule pour les refuges)</p>
                    </div>
                    {error && <p className="text-error text-sm font-bold bg-error-container px-4 py-3 rounded-lg border border-error">{error}</p>}
                    <button type="submit" disabled={loading}
                      className="w-full py-4 bg-primary text-white font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-60">
                      {loading ? 'Enregistrement...' : 'Continuer →'}
                    </button>
                  </form>
                )}

                {/* STEP 2 — Choix du rôle */}
                {step === 2 && (
                  <form onSubmit={handleFinalize} className="space-y-5">
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Quel est votre rôle sur la plateforme ? Si vous êtes un visiteur, vous pouvez finaliser votre inscription directement.
                    </p>

                    {/* Boutons rôle */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'refuge', icon: 'home_work', label: 'Refuge', desc: 'Je gère un centre d\'accueil animal' },
                        { id: 'prestataire', icon: 'handshake', label: 'Prestataire', desc: 'Je propose des services (garde, promenade)' },
                      ].map(opt => (
                        <button key={opt.id} type="button" onClick={() => setRole(r => r === opt.id ? '' : opt.id)}
                          className={`p-5 border-4 border-black text-center transition-all rounded-xl
                            ${role === opt.id ? 'bg-primary text-white shadow-none translate-x-[3px] translate-y-[3px]' : 'bg-white hover:bg-surface-container shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}>
                          <span className="material-symbols-outlined text-3xl mb-2 block">{opt.icon}</span>
                          <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-sm">{opt.label}</p>
                          <p className={`text-xs mt-1 leading-tight ${role === opt.id ? 'text-white/70' : 'text-on-surface-variant'}`}>{opt.desc}</p>
                        </button>
                      ))}
                    </div>

                    {/* Remarque utilisateur simple */}
                    <div className="bg-surface-container border-2 border-dashed border-black rounded-xl p-4 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary align-middle mr-1 text-base">info</span>
                      Si vous êtes un <strong>utilisateur classique</strong>, vous pouvez finaliser votre inscription maintenant.
                    </div>

                    {/* Champs Refuge */}
                    {role === 'refuge' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2 border-t-2 border-dashed border-primary">
                        <p className="font-bold text-sm text-primary uppercase tracking-wider">Informations du refuge</p>
                        <InputField label="Nom du refuge" value={nomRefuge} onChange={setNomRefuge} placeholder="Refuge de l'Éveil" required />
                        <InputField label="N° SIRET / Registre commercial" value={siret} onChange={setSiret} placeholder="12345678900012" required />
                        <InputField label="Capacité d'accueil (animaux)" value={capacite} onChange={setCapacite} placeholder="Ex: 50" required />
                      </motion.div>
                    )}

                    {/* Champs Prestataire */}
                    {role === 'prestataire' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2 border-t-2 border-dashed border-secondary">
                        <p className="font-bold text-sm text-secondary uppercase tracking-wider">Informations prestataire</p>
                        <InputField label="Expérience (années)" type="number" value={experience} onChange={setExperience} placeholder="Ex: 5" required />
                        <div>
                          <label className="block font-['Plus_Jakarta_Sans'] font-bold text-sm mb-1.5">Service proposé <span className="text-error">*</span></label>
                          <select value={service} onChange={e => setService(e.target.value)} required className={inputCls}>
                            <option value="">Sélectionner...</option>
                            <option value="promenade">Promenade</option>
                            <option value="baby-sitting">Baby-sitting</option>
                            <option value="les-deux">Promenade + Baby-sitting</option>
                          </select>
                        </div>
                        <InputField label="Zone d'intervention" value={zone} onChange={setZone} placeholder="Ex: Montpellier et alentours" required />
                      </motion.div>
                    )}

                    {error && <p className="text-error text-sm font-bold bg-error-container px-4 py-3 rounded-lg border border-error">{error}</p>}

                    <button type="submit" disabled={loading}
                      className="w-full py-4 bg-primary text-white font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined">check_circle</span>
                      {loading ? 'Finalisation...' : role ? 'Continuer →' : 'Finaliser mon inscription'}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Auth
