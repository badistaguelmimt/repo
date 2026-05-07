import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageTransition, FadeIn } from '../components/Animations'
import Modal from '../components/ui/Modal'
import ReservationForm from '../components/forms/ReservationForm'
import { prestataires } from '../data/mockData'
import { useRequireAuthAction } from '../hooks/useRequireAuthAction'

const StarRating = ({ note, size = 'text-lg' }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`${size} ${i < Math.round(note) ? 'text-secondary' : 'text-black/15'}`}>★</span>
    ))}
  </div>
)

const ProfilPrestataire = () => {
  const { id } = useParams()
  const [reservationOpen, setReservationOpen] = useState(false)
  const { requireAuthAction } = useRequireAuthAction()

  const prestataire = prestataires.find(p => p.id === id) || prestataires[0]
  const openReservationModal = () => requireAuthAction(() => setReservationOpen(true))

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Back */}
        <Link to="/services" className="inline-flex items-center gap-2 mb-8 text-primary font-bold group">
          <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
          <span className="font-['Plus_Jakarta_Sans'] uppercase tracking-wider text-sm">Retour aux services</span>
        </Link>

        {/* Hero card */}
        <FadeIn>
          <div className="bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[10px_10px_0px_0px_rgba(21,66,18,1)] mb-10">
            {/* Header band */}
            <div className="bg-[#154212] px-8 py-6 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl border-4 border-white bg-surface-container overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
                    <img src={prestataire.photo} alt={prestataire.nom} className="w-full h-full object-cover" />
                  </div>
                  {prestataire.certifiée && (
                    <span className="absolute -bottom-2 -right-2 w-7 h-7 bg-secondary rounded-full border-2 border-white flex items-center justify-center shadow">
                      <span className="material-symbols-outlined text-white text-sm" style={{ fontSize: '14px' }}>verified</span>
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h1 className="font-['Chewy'] text-4xl text-white leading-none">{prestataire.nom}</h1>
                    <span className={`text-xs font-black px-3 py-1 rounded-full border-2 border-white/30 uppercase tracking-wider flex-shrink-0
                      ${prestataire.disponible ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-white/10 text-white/60'}`}>
                      {prestataire.disponible ? '● Disponible' : '○ Indisponible'}
                    </span>
                  </div>
                  <p className="text-white/70 font-['Plus_Jakarta_Sans'] font-bold text-sm">
                    {prestataire.service} · {prestataire.ville}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating note={prestataire.note} />
                    <span className="text-white font-bold text-sm">{prestataire.note}</span>
                    <span className="text-white/50 text-xs">({prestataire.avis} avis)</span>
                  </div>
                </div>
              </div>

              {/* Price + CTA */}
              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <span className="font-['Chewy'] text-4xl text-white">{prestataire.prixHeure}€</span>
                  <span className="text-white/60 text-sm font-bold ml-1">/ heure</span>
                </div>
                <button
                  onClick={openReservationModal}
                  disabled={!prestataire.disponible}
                  className={`px-6 py-3 font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-wider border-2 border-white transition-all
                    ${prestataire.disponible
                      ? 'bg-secondary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                      : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
                >
                  {prestataire.disponible ? 'Réserver maintenant' : 'Actuellement indisponible'}
                </button>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left column — content */}
          <div className="lg:col-span-8 space-y-10">

            {/* Description */}
            <FadeIn>
              <h2 className="font-['Chewy'] text-3xl text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl">person</span>
                À propos de {prestataire.nom.split(' ')[0]}
              </h2>
              <div className="bg-surface-container-lowest border-l-8 border-secondary p-6 rounded-xl shadow-sm leading-relaxed text-base text-on-surface-variant">
                {prestataire.description}
              </div>
            </FadeIn>

            {/* Spécialités */}
            <FadeIn delay={0.05}>
              <h2 className="font-['Chewy'] text-3xl text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl">stars</span>
                Spécialités
              </h2>
              <div className="flex flex-wrap gap-3">
                {prestataire.specialites?.map(s => (
                  <span key={s} className="bg-primary-fixed text-on-primary-fixed-variant border-2 border-black px-5 py-2.5 rounded-full font-bold text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    {s}
                  </span>
                ))}
              </div>
            </FadeIn>

            {/* Avis clients */}
            <FadeIn delay={0.1}>
              <h2 className="font-['Chewy'] text-3xl text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-3xl">rate_review</span>
                Avis clients
              </h2>
              <div className="space-y-4">
                {prestataire.avisClients?.map((avis, i) => (
                  <div key={i} className="bg-white border-4 border-black rounded-2xl p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed border-2 border-black flex items-center justify-center flex-shrink-0">
                          <span className="font-['Chewy'] text-primary text-lg">{avis.auteur[0]}</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-primary">{avis.auteur}</p>
                          <p className="text-xs text-on-surface-variant">{avis.date}</p>
                        </div>
                      </div>
                      <StarRating note={avis.note} size="text-base" />
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed italic">"{avis.commentaire}"</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Right sidebar */}
          <aside className="lg:col-span-4 space-y-6">

            {/* Infos pratiques */}
            <FadeIn>
              <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(21,66,18,1)] space-y-4">
                <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold uppercase text-sm tracking-widest text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">info</span>
                  Informations pratiques
                </h3>
                {[
                  { icon: 'location_on',    label: 'Ville',           value: prestataire.adresse },
                  { icon: 'schedule',       label: 'Horaires',        value: prestataire.horaires },
                  { icon: 'work_history',   label: 'Expérience',      value: prestataire.experience },
                  { icon: 'pets',           label: 'Capacité max',    value: `${prestataire.capaciteMax} animaux simultanés` },
                  { icon: 'school',         label: 'Formation',       value: prestataire.formation },
                  { icon: 'phone',          label: 'Téléphone',       value: prestataire.telephone },
                  { icon: 'email',          label: 'Email',           value: prestataire.email },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-lg mt-0.5 flex-shrink-0">{icon}</span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{label}</p>
                      <p className="font-bold text-sm break-all">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Langues & animaux */}
            <FadeIn delay={0.1}>
              <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Animaux acceptés</p>
                  <div className="flex flex-wrap gap-2">
                    {prestataire.animauxAcceptes.map(a => (
                      <span key={a} className="bg-secondary-fixed border-2 border-black px-3 py-1.5 rounded-full font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{a}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Langues parlées</p>
                  <div className="flex flex-wrap gap-2">
                    {prestataire.langues.map(l => (
                      <span key={l} className="bg-primary-fixed border-2 border-black px-3 py-1.5 rounded-full font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{l}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-black/10">
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${prestataire.assurance ? 'bg-primary' : 'bg-black/20'}`} />
                  <p className="text-sm font-bold">{prestataire.assurance ? 'Couverture assurance incluse' : 'Sans assurance'}</p>
                </div>
              </div>
            </FadeIn>

            {/* CTA block */}
            <FadeIn delay={0.2}>
              <div className="bg-[#154212] text-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(254,158,114,1)] space-y-4">
                <h3 className="font-['Chewy'] text-2xl">Réserver {prestataire.nom.split(' ')[0]}</h3>
                <ul className="space-y-3">
                  {['Confirmation immédiate', 'Annulation gratuite 24h avant', 'Compte-rendu par message'].map((step, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-secondary-fixed text-base">check_circle</span>
                      {step}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={openReservationModal}
                  disabled={!prestataire.disponible}
                  className={`w-full py-3 font-['Plus_Jakarta_Sans'] font-extrabold text-sm uppercase tracking-wider border-2 border-white transition-all
                    ${prestataire.disponible
                      ? 'bg-secondary text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.4)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none'
                      : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
                >
                  {prestataire.disponible ? 'Réserver →' : 'Indisponible'}
                </button>
              </div>
            </FadeIn>
          </aside>
        </div>
      </div>

      {/* Modal réservation */}
      <Modal
        isOpen={reservationOpen}
        onClose={() => setReservationOpen(false)}
        title={`Réserver — ${prestataire.nom}`}
        size="md"
      >
        <ReservationForm prestataire={prestataire} onClose={() => setReservationOpen(false)} />
      </Modal>
    </PageTransition>
  )
}

export default ProfilPrestataire
