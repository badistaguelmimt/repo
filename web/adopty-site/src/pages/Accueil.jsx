import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageTransition, FadeIn } from '../components/Animations'
import { useAnimaux } from '../hooks/useAnimaux'

const HERO_IMAGES = [
  '/04et05B_MondouChatsRefuges1.jpeg',
  '/2000005545891.webp',
  '/B9723964194Z.1_20200708223738_000+G6HGA5Q6J.1-0.jpg',
  '/B9727898820Z.1_20210804173826_000+GE1IMEK0I.1-0.jpg',
  '/Kaninchen im Freigehege (2)-4440x3072-1920x1328.jpg',
  '/LKQBNJHAK5DXRNNEDV2WEQOP4Q.jpg',
  '/chatterie_association_du_chat_libre-1-1024x664.jpg',
  '/chien-loup-animaux-domestiques-sauvages-evolution-cerveau-intelligence-domestication-moteur-de-recherche.jpg',
  '/contenu4_abdd4e5c6d_duuW3kG9s.webp',
  '/dog-g3f8bcf435_720.jpg',
  '/dog-g6e68fc723-1280-696x464.jpg',
  '/istockphoto-577960242-170667a.jpg',
  '/les-animaux-domestiques-sont-ils-doues-dintuition.webp',
  '/pets 3 flickr.jpg',
  '/photo-1450778869180-41d0601e046e.avif'
]

const getRandomImage = () => HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)]

const Accueil = () => {
  const [images, setImages] = useState({
    hero: HERO_IMAGES[0],
    step1: HERO_IMAGES[1],
    step3: HERO_IMAGES[2],
    mission1: HERO_IMAGES[3],
    mission2: HERO_IMAGES[4]
  })

  const { animaux, isLoading } = useAnimaux()
  const animauxVedette = animaux.slice(0, 3)

  useEffect(() => {
    setImages({
      hero: getRandomImage(),
      step1: getRandomImage(),
      step3: getRandomImage(),
      mission1: getRandomImage(),
      mission2: getRandomImage()
    })
  }, [])

  const scrollToAdoption = () => {
    document.getElementById('comment-adopter')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <PageTransition>

      {/* ── 1. HERO ─────────────────────────────────────────────── */}
      <section className="relative px-6 py-14 md:py-24 overflow-hidden bg-[#fbfbe2]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <FadeIn className="z-10">

            <span className="inline-block px-4 py-1.5 bg-secondary-container text-on-secondary-container font-bold text-xs uppercase tracking-widest mb-6 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              Plus de 500 compagnons attendent
            </span>
            <h1 className="font-['Chewy'] text-6xl md:text-8xl text-primary leading-none mb-8">
              Trouvez votre <span className="text-secondary">nouveau</span> meilleur ami
            </h1>
            <p className="text-xl text-on-surface-variant mb-10 max-w-xl leading-relaxed">
              Adopty connecte les cœurs solitaires avec des animaux en quête d'un foyer aimant. Une adoption
              responsable pour une vie de bonheur partagé.
            </p>
            <div className="flex flex-wrap gap-5">
              <Link
                to="/animaux"
                className="bg-primary text-white px-8 py-4 font-['Plus_Jakarta_Sans'] font-extrabold text-sm md:text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all flex items-center gap-3 uppercase"
              >
                Découvrir les animaux
                <span className="material-symbols-outlined">pets</span>
              </Link>
              <button
                onClick={scrollToAdoption}
                className="bg-surface-container-highest text-primary px-8 py-4 font-['Plus_Jakarta_Sans'] font-extrabold text-sm md:text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all uppercase"
              >
                Comment adopter ?
              </button>
            </div>
          </FadeIn>

          {/* Right — image with badge */}
          <FadeIn delay={0.2} className="relative">
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-secondary rounded-full opacity-10 blur-3xl pointer-events-none" />
            <div className="relative z-10 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden rounded-xl rotate-2 hover:rotate-0 transition-transform duration-500">
              <img
                alt="Compagnon Adopty"
                className="w-full h-[480px] object-cover"
                src={images.hero}
              />
            </div>
            <div className="absolute -bottom-5 -left-5 bg-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20 -rotate-2">
              <p className="font-['Chewy'] text-2xl text-tertiary">"Adoptez, n'achetez pas !"</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 2. NOTRE MISSION ────────────────────────────────────── */}
      <section className="bg-primary py-20 px-6 border-y-4 border-black">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-14">
            <h2 className="font-['Chewy'] text-5xl md:text-6xl text-white mb-4">Notre Mission</h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">La solution que nous apportons à la problématique de l'adoption animale en Algérie.</p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: 'crisis_alert',
                titre: 'Un problème réel',
                texte: "En Algérie, des milliers d'animaux errants vivent dans des conditions précaires. L'abandon et la maltraitance restent des réalités quotidiennes, faute d'une structure centralisée pour les accueillir et les placer.",
              },
              {
                icon: 'hub',
                titre: 'Notre réponse',
                texte: "Adopty est la première plateforme digitale algérienne de gestion d'un centre d'adoption animalier. Nous centralisons les demandes, automatisons le matching famille-animal et accompagnons chaque adoption de A à Z.",
              },
              {
                icon: 'volunteer_activism',
                titre: 'L\'impact visé',
                texte: "Chaque adoption via Adopty libère une place au refuge, réduit la souffrance animale et crée un lien durable entre une famille et son compagnon. Nous visons 1 000 adoptions responsables d'ici 2025.",
              },
            ].map((item, i) => (
              <FadeIn key={item.titre} delay={i * 0.15} className="bg-white/10 border-2 border-white/20 rounded-xl p-7 hover:bg-white/15 transition-colors">
                <div className="w-12 h-12 bg-secondary-container border-2 border-black rounded-lg flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-on-secondary-container text-2xl">{item.icon}</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-white mb-3">{item.titre}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{item.texte}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. COMMENT ADOPTER ? ─────────────────────────────────── */}
      <section id="comment-adopter" className="bg-[#fbfbe2] py-24 px-6 border-b-4 border-black">
         <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-20 text-center relative">
            <FadeIn className="inline-block relative">
              <h2 className="font-['Chewy'] text-5xl md:text-7xl text-primary mb-4 relative z-10">Comment adopter chez nous</h2>
              <div className="absolute -bottom-2 left-0 w-full h-6 bg-secondary-container/50 -rotate-1 -z-0"></div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="font-['Plus_Jakarta_Sans'] text-lg text-on-surface-variant max-w-2xl mx-auto mt-4 leading-relaxed">
                  Découvrez les quatre étapes simples pour rencontrer votre nouveau compagnon pour la vie.
              </p>
            </FadeIn>
          </header>

          {/* Process Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20">
            {/* Step 1 */}
            <FadeIn delay={0.2} className="md:col-span-7 bg-surface-container rounded-xl p-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
              <div className="absolute top-4 right-8 font-['Chewy'] text-8xl text-black/5 select-none transition-transform group-hover:scale-110">1</div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-primary-fixed border-2 border-black rounded-full flex items-center justify-center mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <span className="material-symbols-outlined text-primary text-3xl">pets</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl text-primary mb-4">Choix de l'animal</h3>
                <p className="text-on-surface-variant text-base leading-relaxed max-w-md">
                  Explorez notre galerie de compagnons en attente d'une famille. Filtrez par espèce, âge ou caractère pour trouver celui qui correspond à votre mode de vie.
                </p>
              </div>
              <div className="mt-8 rounded-xl overflow-hidden border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1 group-hover:rotate-0 transition-transform duration-500">
                <img className="w-full h-56 object-cover" src={images.step1} alt="Chien au refuge" />
              </div>
            </FadeIn>

            {/* Step 2 */}
            <FadeIn delay={0.3} className="md:col-span-5 bg-secondary-container/30 rounded-xl p-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
              <div className="absolute top-4 right-8 font-['Chewy'] text-8xl text-black/5 select-none transition-transform group-hover:scale-110">2</div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-secondary-fixed border-2 border-black rounded-full flex items-center justify-center mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <span className="material-symbols-outlined text-secondary text-3xl">chat</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl text-secondary mb-4">Premier contact</h3>
                <p className="text-on-surface-variant text-base leading-relaxed">
                  Remplissez notre formulaire de pré-adoption. Notre équipe étudiera votre profil pour s'assurer que les besoins de l'animal et vos attentes sont en parfaite harmonie.
                </p>
                <div className="mt-8 p-6 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center border-2 border-black">
                      <span className="material-symbols-outlined text-sm">check</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden border border-black/10">
                      <div className="h-full bg-secondary w-3/4"></div>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-secondary uppercase tracking-wider">Analyse du dossier en cours</p>
                </div>
              </div>
            </FadeIn>

            {/* Step 3 */}
            <FadeIn delay={0.4} className="md:col-span-5 bg-tertiary-container/30 rounded-xl p-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
              <div className="absolute top-4 right-8 font-['Chewy'] text-8xl text-black/5 select-none transition-transform group-hover:scale-110">3</div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-tertiary-fixed border-2 border-black rounded-full flex items-center justify-center mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  <span className="material-symbols-outlined text-tertiary text-3xl">home_pin</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl text-tertiary mb-4">Visite au refuge</h3>
                <p className="text-on-surface-variant text-base leading-relaxed">
                  La rencontre magique ! Venez passer du temps avec l'animal. C'est le moment de laisser opérer le coup de foudre avant l'adoption.
                </p>
                <div className="mt-8 flex justify-center">
                  <div className="relative">
                    <img className="w-48 h-48 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] object-cover group-hover:scale-105 transition-transform" src={images.step3} alt="Chat" />
                    <div className="absolute -bottom-2 -right-2 bg-white p-3 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <span className="material-symbols-outlined text-tertiary">favorite</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Step 4 */}
            <FadeIn delay={0.5} className="md:col-span-7 bg-primary rounded-xl p-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
              <div className="absolute top-4 right-8 font-['Chewy'] text-8xl text-white/10 select-none transition-transform group-hover:scale-110">4</div>
              <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                <div className="flex-1">
                  <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <span className="material-symbols-outlined text-primary text-3xl">volunteer_activism</span>
                  </div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl text-white mb-4">Adoption</h3>
                  <p className="text-white/80 text-base leading-relaxed">
                    Félicitations ! Après signature du contrat, votre nouveau compagnon peut rejoindre son foyer. Nous restons à vos côtés pour le suivi.
                  </p>
                  <Link to="/animaux" className="inline-block mt-8 bg-secondary text-white px-8 py-4 font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                    Démarrer mon projet
                  </Link>
                </div>
                <div className="w-full md:w-56 h-64 bg-white p-5 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-3 group-hover:rotate-0 transition-transform duration-500 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="font-['Chewy'] text-primary text-lg">Certificat<br />d'Adoption</div>
                    <span className="material-symbols-outlined text-secondary">verified</span>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="h-2 bg-surface-container rounded w-full"></div>
                    <div className="h-2 bg-surface-container rounded w-3/4"></div>
                    <div className="h-2 bg-surface-container rounded w-5/6"></div>
                  </div>
                  <div className="flex items-end justify-between mt-auto pt-4">
                    <div className="w-12 h-12 bg-primary-fixed rounded-full border-2 border-primary"></div>
                    <div className="font-['Chewy'] text-xs text-on-surface-variant">Sceau Adopty</div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
          
          <FadeIn className="max-w-4xl mx-auto space-y-6">
            <h4 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-primary text-center mb-6">Ce que vous devez savoir</h4>
            <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl flex gap-6 items-start">
              <span className="material-symbols-outlined text-secondary text-3xl">info</span>
              <div>
                <h5 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-primary mb-1">Quels documents préparer ?</h5>
                <p className="text-on-surface-variant text-sm">Une pièce d'identité et un justificatif de domicile de moins de 3 mois sont nécessaires pour finaliser l'adoption.</p>
              </div>
            </div>
            <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl flex gap-6 items-start">
              <span className="material-symbols-outlined text-secondary text-3xl">payments</span>
              <div>
                <h5 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-primary mb-1">Frais de participation</h5>
                <p className="text-on-surface-variant text-sm">Ces frais servent à couvrir les soins vétérinaires, l'identification, les vaccins et la stérilisation.</p>
              </div>
            </div>
          </FadeIn>
         </div>
      </section>

      {/* ── 4. RECHERCHE RAPIDE ─────────────────────────────────── */}
      <section className="bg-surface-container-low py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="mb-12">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-4xl text-primary mb-2">Recherche rapide</h2>
            <p className="text-on-surface-variant text-lg">Quel type de compagnon recherchez-vous aujourd'hui ?</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Chiens — grande carte */}
            <FadeIn delay={0.1} className="md:col-span-2 group relative overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-surface-container-lowest p-8 cursor-pointer hover:bg-primary hover:text-white transition-colors duration-200">
              <div className="flex justify-between items-start mb-14">
                <span className="material-symbols-outlined text-5xl">pets</span>
              </div>
              <h3 className="font-['Chewy'] text-5xl mb-4">Chiens</h3>
              <p className="text-lg opacity-70 mb-6">Des fidèles compagnons de toutes tailles et de tous âges pour vos aventures.</p>
              <Link
                to="/animaux"
                className="inline-flex items-center gap-2 font-['Plus_Jakarta_Sans'] font-bold group-hover:gap-4 transition-all"
                onClick={e => e.stopPropagation()}
              >
                VOIR TOUS LES CHIENS <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </FadeIn>

            {/* Chats */}
            <Link to="/animaux" className="group relative overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-secondary-container p-8 cursor-pointer hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 block">
              <FadeIn delay={0.2} className="h-full flex flex-col">
                <div className="flex justify-between items-start mb-14">
                  <span className="material-symbols-outlined text-5xl text-on-secondary-container">pets</span>
                </div>
                <h3 className="font-['Chewy'] text-4xl mb-auto text-on-secondary-container">Chats</h3>
                <div className="mt-6 w-12 h-12 rounded-full border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-on-secondary-container group-hover:text-white">north_east</span>
                </div>
              </FadeIn>
            </Link>

            {/* NAC */}
            <Link to="/animaux" className="group relative overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-tertiary-container text-on-tertiary-container p-8 cursor-pointer hover:bg-tertiary hover:text-white transition-colors duration-200 block">
              <FadeIn delay={0.3} className="h-full flex flex-col">
                <div className="flex justify-between items-start mb-14">
                  <span className="material-symbols-outlined text-5xl">pet_supplies</span>
                </div>
                <h3 className="font-['Chewy'] text-4xl mb-3">NAC</h3>
                <p className="text-sm opacity-80">Lapins, rongeurs et autres petits trésors.</p>
              </FadeIn>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. LE REFUGE : L'ÉVEIL NATUREL ──────────────────────── */}
      <section className="py-24 px-6 bg-[#fbfbe2] border-y-4 border-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Images Bento */}
          <FadeIn className="grid grid-cols-2 gap-4">
            <div className="col-span-2 relative">
              <img
                alt="Famille heureuse avec leur animal adopté"
                className="w-full h-64 object-cover border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl"
                src={images.mission1}
              />
              <div className="absolute -top-4 -left-4 bg-primary text-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="font-['Chewy'] text-3xl">2.4k</p>
                <p className="text-xs font-bold uppercase tracking-widest text-white/80">Familles heureuses</p>
              </div>
            </div>
            <img
              alt="Intérieur du refuge"
              className="w-full h-48 object-cover border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl"
              src={images.mission2}
            />
            <div className="bg-secondary-fixed border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl p-6 flex flex-col justify-center items-center">
              <p className="font-['Chewy'] text-5xl text-primary">15+</p>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Ans d'engagement</p>
            </div>
          </FadeIn>

          {/* Text */}
          <FadeIn delay={0.15}>
            <h2 className="font-['Chewy'] text-5xl md:text-6xl text-primary mb-6 leading-tight">
              L'Ambition<br />
              <span className="text-secondary">Adopty</span>
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-6">
              Plus qu'un simple projet, Adopty est une mission pour transformer le paysage de la protection animale en Algérie. Nous combinons passion et professionnalisme pour offrir un avenir à ceux qui n'en ont pas, avec l'ambition d'ouvrir un réseau de refuges modernes et connectés à travers tout le pays.
            </p>
            <ul className="space-y-3 mb-10">
              {[
                'Éducation positive et bienveillante',
                'Suivi post-adoption personnalisé',
                'Soins vétérinaires de pointe sur place',
              ].map(item => (
                <li key={item} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary bg-primary-fixed rounded-full p-0.5 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-on-surface">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/apropos"
              className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 font-['Plus_Jakarta_Sans'] font-extrabold text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all uppercase tracking-wider"
            >
              Découvrir nos valeurs
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ── 6. COUP DE FOUDRE ASSURÉ ─────────────────────────────── */}
      <section className="bg-surface-variant py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="font-['Chewy'] text-5xl md:text-6xl text-primary mb-4">Coup de foudre assuré</h2>
            <p className="text-on-surface-variant text-xl">Ces petits cœurs n'attendent que vous pour commencer une nouvelle vie.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {animauxVedette.map((animal, i) => (
              <FadeIn key={animal.id} delay={i * 0.12} className="bg-surface border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden group flex flex-col">
                <div className="relative h-72 overflow-hidden flex-shrink-0">
                  <img
                    src={animal.photo}
                    alt={animal.nom}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 border-2 border-black font-bold text-sm">{animal.ageLabel.toUpperCase()}</div>
                  {animal.urgent && (
                    <div className="absolute top-4 left-4 bg-[#ba1a1a] text-white px-3 py-1 border-2 border-black font-bold text-xs uppercase">Urgent</div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl">{animal.nom}</h3>
                    <div className="flex gap-1">
                      {animal.caractere.slice(0, 1).map(c => (
                        <span key={c} className="px-3 py-1 bg-secondary-container text-xs font-bold rounded-full border border-black uppercase">{c}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-on-surface-variant mb-6 line-clamp-2 text-sm leading-relaxed flex-1">{animal.description}</p>
                  <Link
                    to={`/profil/${animal.id}`}
                    className="w-full py-4 border-4 border-black font-['Plus_Jakarta_Sans'] font-black text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                  >
                    RENCONTRER {animal.nom.toUpperCase()}
                    <span className="material-symbols-outlined">favorite</span>
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4} className="mt-16 text-center">
            <Link
              to="/animaux"
              className="font-['Plus_Jakarta_Sans'] font-black text-2xl text-primary border-b-4 border-secondary hover:text-secondary transition-colors"
            >
              VOIR TOUTES NOS BOUILLES À ADOPTER →
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ── 7. NOS SERVICES ──────────────────────────────────────── */}
      <section className="bg-[#fbfbe2] py-24 px-6 border-t-4 border-black">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="font-['Chewy'] text-5xl md:text-6xl text-primary mb-4">Nos Services</h2>
            <p className="text-on-surface-variant text-xl">Nous prenons soin de vos compagnons, même après l'adoption.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {/* Promenade */}
            <FadeIn delay={0.1} className="bg-primary-fixed border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 group hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
              <div className="w-14 h-14 bg-primary border-2 border-black flex items-center justify-center mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-6 transition-transform">
                <span className="material-symbols-outlined text-white text-3xl">directions_run</span>
              </div>
              <h3 className="font-['Chewy'] text-4xl text-primary mb-3">Promenade</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                Pour que votre chien garde les pattes en forme et le cœur en joie avec nos promeneurs passionnés.
              </p>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-3 font-['Plus_Jakarta_Sans'] font-bold text-sm border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                RÉSERVER <span className="material-symbols-outlined text-base">calendar_today</span>
              </Link>
            </FadeIn>

            {/* Pet-sitting */}
            <FadeIn delay={0.2} className="bg-secondary-fixed border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 group hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
              <div className="w-14 h-14 bg-secondary border-2 border-black flex items-center justify-center mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-6 transition-transform">
                <span className="material-symbols-outlined text-white text-3xl">home</span>
              </div>
              <h3 className="font-['Chewy'] text-4xl text-primary mb-3">Pet-sitting</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                Une garde attentionnée à domicile ou au refuge quand vous êtes absent et devez vous absenter.
              </p>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 bg-secondary text-white px-5 py-3 font-['Plus_Jakarta_Sans'] font-bold text-sm border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                EN SAVOIR PLUS <span className="material-symbols-outlined text-base">favorite</span>
              </Link>
            </FadeIn>
          </div>

          <FadeIn delay={0.3} className="text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-3 bg-primary text-white px-10 py-5 font-['Plus_Jakarta_Sans'] font-extrabold text-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all"
            >
              DÉCOUVRIR TOUS NOS SERVICES
              <span className="material-symbols-outlined text-2xl">arrow_forward</span>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ── 8. BANDEAU SIGNALEMENT ───────────────────────────────── */}
      <section className="bg-[#ba1a1a] py-10 px-6 border-t-4 border-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white border-2 border-black rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
              <span className="material-symbols-outlined text-[#ba1a1a] text-2xl">warning</span>
            </div>
            <div>
              <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-white text-xl">Vous avez vu un animal en danger ?</p>
              <p className="text-white/70 text-sm">Signalez-le immédiatement — notre équipe intervient 7j/7.</p>
            </div>
          </div>
          <Link
            to="/signalement"
            className="flex-shrink-0 bg-white text-[#ba1a1a] px-7 py-3 font-['Plus_Jakarta_Sans'] font-extrabold text-sm border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase tracking-wider"
          >
            Signaler maintenant →
          </Link>
        </div>
      </section>

    </PageTransition>
  )
}

export default Accueil
