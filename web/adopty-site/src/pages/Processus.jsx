import { Link } from 'react-router-dom'
import { PageTransition, FadeIn } from '../components/Animations'

const Processus = () => {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <header className="mb-20 text-center relative">
          <FadeIn className="inline-block relative">
            <h1 className="font-['Chewy'] text-6xl md:text-8xl text-primary mb-6 relative z-10">Comment adopter chez nous</h1>
            <div className="absolute -bottom-2 left-0 w-full h-8 bg-secondary-container/30 -rotate-1 -z-0"></div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="font-['Plus_Jakarta_Sans'] text-xl md:text-2xl text-on-surface-variant max-w-2xl mx-auto mt-6 leading-relaxed">
                Le chemin vers une nouvelle vie commence ici. Découvrez les quatre étapes simples pour rencontrer votre nouveau compagnon pour la vie.
            </p>
          </FadeIn>
        </header>

        {/* Process Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24">
          {/* Step 1 */}
          <FadeIn delay={0.2} className="md:col-span-7 bg-surface-container rounded-xl p-8 border-2 border-primary/10 relative overflow-hidden group transition-all duration-300 hover:border-primary">
            <div className="absolute top-4 right-8 font-['Chewy'] text-8xl text-primary/5 select-none">1</div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mb-6 brutalist-shadow">
                <span className="material-symbols-outlined text-on-primary-fixed text-3xl">pets</span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl text-primary mb-4">Choix de l'animal</h3>
              <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
                Explorez notre galerie de compagnons en attente d'une famille. Filtrez par espèce, âge ou caractère pour trouver celui qui correspond à votre mode de vie.
              </p>
            </div>
            <div className="mt-8 rounded-xl overflow-hidden brutalist-shadow rotate-1 group-hover:rotate-0 transition-transform duration-500">
              <img className="w-full h-64 object-cover" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="/>
            </div>
          </FadeIn>

          {/* Step 2 */}
          <FadeIn delay={0.3} className="md:col-span-5 bg-secondary-container/10 rounded-xl p-8 border-2 border-secondary/10 relative overflow-hidden group transition-all duration-300 hover:border-secondary">
            <div className="absolute top-4 right-8 font-['Chewy'] text-8xl text-secondary/5 select-none">2</div>
            <div className="w-16 h-16 bg-secondary-fixed rounded-full flex items-center justify-center mb-6 brutalist-shadow border-2 border-secondary">
              <span className="material-symbols-outlined text-on-secondary-fixed text-3xl">chat</span>
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl text-secondary mb-4">Premier contact</h3>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Remplissez notre formulaire de pré-adoption. Notre équipe étudiera votre profil pour s'assurer que les besoins de l'animal et vos attentes sont en parfaite harmonie.
            </p>
            <div className="mt-8 p-6 bg-white/50 backdrop-blur rounded-xl border border-secondary/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">check</span>
                </div>
                <div className="h-2 w-full bg-secondary/10 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-3/4"></div>
                </div>
              </div>
              <p className="text-xs font-bold text-secondary uppercase tracking-wider">Analyse du dossier en cours</p>
            </div>
          </FadeIn>

          {/* Step 3 */}
          <FadeIn delay={0.4} className="md:col-span-5 bg-tertiary-container/10 rounded-xl p-8 border-2 border-tertiary/10 relative overflow-hidden group transition-all duration-300 hover:border-tertiary">
            <div className="absolute top-4 right-8 font-['Chewy'] text-8xl text-tertiary/5 select-none">3</div>
            <div className="w-16 h-16 bg-tertiary-fixed rounded-full flex items-center justify-center mb-6 brutalist-shadow border-2 border-tertiary">
              <span className="material-symbols-outlined text-on-tertiary-fixed text-3xl">home_pin</span>
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl text-tertiary mb-4">Visite au refuge</h3>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              La rencontre magique ! Venez passer du temps avec l'animal dans notre environnement bienveillant. C'est le moment de laisser opérer le coup de foudre.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="relative">
                <img className="w-48 h-48 rounded-full border-4 border-white brutalist-shadow object-cover" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="/>
                <div className="absolute -bottom-2 -right-2 bg-white p-3 rounded-xl border border-tertiary/20 brutalist-shadow">
                  <span className="material-symbols-outlined text-tertiary">favorite</span>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Step 4 */}
          <FadeIn delay={0.5} className="md:col-span-7 bg-primary-container rounded-xl p-8 relative overflow-hidden group transition-all duration-300">
            <div className="absolute top-4 right-8 font-['Chewy'] text-8xl text-white/10 select-none">4</div>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-6 brutalist-shadow">
                  <span className="material-symbols-outlined text-primary text-3xl">volunteer_activism</span>
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl text-white mb-4">Adoption</h3>
                <p className="text-white/80 text-lg leading-relaxed">
                  Félicitations ! Après signature du contrat et conseils personnalisés, votre nouveau compagnon peut rejoindre son foyer pour toujours. Nous restons à vos côtés pour le suivi.
                </p>
                <button className="mt-8 bg-secondary-fixed text-on-secondary-fixed px-8 py-4 font-bold text-xl brutalist-shadow brutalist-shadow-hover transition-all border-2 border-black uppercase">
                  Démarrer mon projet
                </button>
              </div>
              <div className="w-full md:w-64 h-64 bg-[#fbfbe2] p-4 rounded-xl border-4 border-black -rotate-2 group-hover:rotate-0 transition-transform duration-500 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="font-['Chewy'] text-primary">Certificat d'Adoption</div>
                  <span className="material-symbols-outlined text-secondary">verified</span>
                </div>
                <div className="space-y-2">
                  <div className="h-1 bg-primary/20 w-full"></div>
                  <div className="h-1 bg-primary/20 w-3/4"></div>
                  <div className="h-1 bg-primary/20 w-5/6"></div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="w-12 h-12 bg-primary/10 rounded-full"></div>
                  <div className="font-['Chewy'] text-xs text-primary/40">Sceau Adopty</div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* FAQ or Info Section */}
        <section className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-4xl text-primary text-center mb-12">Ce que vous devez savoir</h2>
            <div className="space-y-6">
              <div className="p-6 bg-surface-container-high rounded-xl flex gap-6 items-start">
                <span className="material-symbols-outlined text-secondary text-3xl">info</span>
                <div>
                  <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-on-surface mb-2">Quels documents préparer ?</h4>
                  <p className="text-on-surface-variant">Une pièce d'identité et un justificatif de domicile de moins de 3 mois sont nécessaires pour finaliser toute procédure d'adoption.</p>
                </div>
              </div>
              <div className="p-6 bg-surface-container-high rounded-xl flex gap-6 items-start">
                <span className="material-symbols-outlined text-secondary text-3xl">payments</span>
                <div>
                  <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-on-surface mb-2">Frais de participation</h4>
                  <p className="text-on-surface-variant">Ces frais servent à couvrir les soins vétérinaires, l'identification par puce, les vaccins et la stérilisation de l'animal.</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>
      </div>
    </PageTransition>
  )
}

export default Processus
