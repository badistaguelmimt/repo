import { Link } from 'react-router-dom'
import { PageTransition, FadeIn } from '../../components/Animations'

const valeurs = [
  {
    icon: 'favorite',
    couleur: 'bg-secondary-fixed',
    titre: 'Le Respect du Vivant',
    texte: "Chez Adopty, chaque animal est un être sensible à part entière. Nous refusons toute forme de maltraitance et militons pour une cohabitation harmonieuse entre l'humain et l'animal. Respecter la vie animale, c'est respecter la vie tout court.",
  },
  {
    icon: 'nature',
    couleur: 'bg-primary-fixed',
    titre: "L'Éveil par la Nature",
    texte: "Le nom «\u00a0L'Éveil Naturel\u00a0» n'est pas un hasard. Nous croyons que le contact avec la nature et les animaux éveille en l'humain ses meilleures qualités : empathie, patience, bienveillance. Notre refuge est conçu comme un espace de reconnexion profonde.",
  },
  {
    icon: 'handshake',
    couleur: 'bg-tertiary-fixed',
    titre: 'La Responsabilité Partagée',
    texte: "Adopter c'est s'engager. Nous accompagnons chaque adoptant tout au long de l'aventure, en avant comme en après. L'abandon ne doit jamais être une option — nous existons pour que ça ne le soit jamais.",
  },
  {
    icon: 'groups',
    couleur: 'bg-surface-container-high',
    titre: 'La Force de la Communauté',
    texte: "Seuls, nous sauvons quelques vies. Ensemble, nous transformons tout un écosystème. Bénévoles, vétérinaires, familles d'accueil, prestataires et donateurs forment la grande famille Adopty. Chaque geste compte.",
  },
  {
    icon: 'lightbulb',
    couleur: 'bg-primary-fixed',
    titre: "L'Innovation au Service du Bien",
    texte: "Adopty est la preuve que la technologie peut être mise au service des causes qui comptent. Notre plateforme digitale modernise un secteur longtemps laissé à l'abandon en Algérie et offre transparence, efficacité et traçabilité à toutes les parties prenantes.",
  },
  {
    icon: 'balance',
    couleur: 'bg-secondary-fixed',
    titre: 'L\'Équité & L\'Inclusion',
    texte: "Chaque animal mérite une chance, quelle que soit son espèce, son âge ou son état de santé. Chaque humain mérite un compagnon, quelle que soit sa situation. Adopty œuvre pour que l'adoption soit accessible, juste et humaine.",
  },
]

const equipe = [
  { nom: 'Tafoukt Zakaria' },
  { nom: 'Taguelmimt Badis' },
  { nom: 'Rahem Imene' },
  { nom: 'Ouaret Rayel' },
  { nom: 'Oughlis Mohand Arab' },
]

import { useState, useEffect } from 'react'

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

const APropos = () => {
  const [randomImg, setRandomImg] = useState(HERO_IMAGES[0])

  useEffect(() => {
    setRandomImg(HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)])
  }, [])

  return (
    <PageTransition>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="bg-primary py-20 px-6 border-b-4 border-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-4 right-16 text-[200px] font-['Chewy'] text-white rotate-12 leading-none">🌿</div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-white/10 border-2 border-white/30 px-4 py-2 rounded-full mb-6">
              <span className="material-symbols-outlined text-secondary-container text-lg">eco</span>
              <span className="text-white/80 text-sm font-bold uppercase tracking-widest">L'Éveil Naturel</span>
            </div>
            <h1 className="font-['Chewy'] text-6xl md:text-8xl text-white mb-6 leading-tight">
              Qui sommes-<span className="text-secondary-container">nous</span> ?
            </h1>
            <p className="text-white/75 text-xl leading-relaxed max-w-2xl mx-auto">
              Adopty est née d'un constat simple et douloureux : en Algérie, des milliers d'animaux
              abandonnés souffrent, faute d'une structure capable de les accueillir, les soigner et
              les replacer dans des familles aimantes.
            </p>
          </FadeIn>

          <FadeIn delay={0.2} className="flex flex-wrap items-center justify-center gap-8 mt-14">
            {[
              { value: '2.4k+', label: 'Familles heureuses' },
              { value: '15+', label: "Ans d'engagement" },
              { value: '500+', label: 'Animaux en refuge' },
              { value: '97%', label: 'Adoptions réussies' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="font-['Chewy'] text-5xl text-secondary-container">{stat.value}</p>
                <p className="text-white/60 text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* ── NOTRE HISTOIRE ────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#fbfbe2]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeIn className="relative">
            <img
              alt="Fondation du refuge Adopty"
              src={randomImg}
              className="w-full rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(148,73,37,1)] object-cover h-80"
            />
            <div className="absolute -bottom-5 -right-5 bg-secondary text-white p-5 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-2">
              <p className="font-['Chewy'] text-2xl">Fondé en 2009</p>
              <p className="text-white/70 text-xs font-bold uppercase">Montpellier, France</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <h2 className="font-['Chewy'] text-5xl text-primary mb-6">Notre Histoire</h2>
            <div className="space-y-4 text-on-surface-variant leading-relaxed">
              <p>
                Adopty est avant tout l'histoire d'un <strong className="text-primary">groupe d'amis</strong> passionnés, unis par un amour profond pour les animaux et une volonté farouche de changer les choses. En Algérie, nous avons tous été témoins de la détresse de milliers de compagnons errants, invisibles et sans protection dans nos rues.
              </p>
              <p>
                Plutôt que de rester spectateurs, nous avons choisi l'action. Notre ambition est de <strong className="text-primary">professionnaliser le secteur animalier</strong> en Algérie. Nous ne nous contentons pas de sauver des vies ; nous construisons un écosystème où chaque animal mérite une seconde chance, encadrée par des standards de soins et de gestion modernes.
              </p>
              <p>
                En <strong className="text-primary">2026</strong>, nous avons lancé la plateforme <strong className="text-primary">Adopty</strong> : le premier SaaS d'adoption animalière du pays. Ce n'est que le début de notre voyage. Notre horizon est clair : s'élargir pour ouvrir un réseau de refuges à travers tout le territoire national, car nous croyons qu'adopter un animal, c'est transformer une vie — la sienne, et la nôtre.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── NOS VALEURS ───────────────────────────────────────── */}
      <section className="bg-surface-container-low py-24 px-6 border-y-4 border-black">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="font-['Chewy'] text-5xl md:text-6xl text-primary mb-4">Nos Valeurs</h2>
            <p className="text-on-surface-variant text-xl max-w-2xl mx-auto">
              Les principes fondateurs qui guident chacun de nos actes, chaque jour.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {valeurs.map((valeur, i) => (
              <FadeIn key={valeur.titre} delay={i * 0.1} className={`${valeur.couleur} border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 rounded-xl hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-200`}>
                <div className="w-12 h-12 bg-white border-2 border-black rounded-lg flex items-center justify-center mb-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="material-symbols-outlined text-primary text-2xl">{valeur.icon}</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-primary mb-3">{valeur.titre}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{valeur.texte}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOTRE ÉQUIPE ──────────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#fbfbe2]">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="font-['Chewy'] text-5xl md:text-6xl text-primary mb-4">L'Équipe</h2>
            <p className="text-on-surface-variant text-xl">Des passionnés au service des animaux et des familles.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {equipe.map((membre, i) => (
              <FadeIn key={membre.nom} delay={i * 0.1} className="bg-white border-4 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(21,66,18,1)] text-center group hover:-translate-y-1 transition-all">
                <div className="w-16 h-16 bg-primary-fixed rounded-full border-2 border-black flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                  <span className="material-symbols-outlined text-primary text-2xl">person</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-lg text-primary">{membre.nom}</h3>
                <p className="text-secondary font-bold text-xs uppercase tracking-widest mt-1">Co-Fondateur</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENGAGEMENT / CTA ──────────────────────────────────── */}
      <section className="bg-primary py-20 px-6 border-t-4 border-black">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <span className="text-6xl mb-6 block">🐾</span>
            <h2 className="font-['Chewy'] text-5xl md:text-6xl text-white mb-6">
              Rejoignez le mouvement
            </h2>
            <p className="text-white/75 text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
              Adoptez, bénévolisez, achetez solidaire ou simplement partagez. Chaque geste compte dans la construction d'un monde meilleur pour les animaux.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-5">
              <Link
                to="/animaux"
                className="bg-white text-primary px-8 py-4 font-['Plus_Jakarta_Sans'] font-extrabold text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all flex items-center gap-3"
              >
                <span className="material-symbols-outlined">pets</span>
                Adopter maintenant
              </Link>
              <Link
                to="/boutique"
                className="bg-secondary text-white px-8 py-4 font-['Plus_Jakarta_Sans'] font-extrabold text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all flex items-center gap-3"
              >
                <span className="material-symbols-outlined">volunteer_activism</span>
                Soutenir le refuge
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

    </PageTransition>
  )
}

export default APropos
