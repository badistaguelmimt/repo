import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { updateRace } from '../../services/publicApi'

const InfoChip = ({ icon, label, value }) => {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 bg-white rounded-xl p-3 border-2 border-black/10">
      <span className="material-symbols-outlined text-primary text-lg flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">{label}</p>
        <p className="text-sm font-bold text-on-surface">{value}</p>
      </div>
    </div>
  )
}

const SectionTitle = ({ icon, children }) => (
  <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
    <span className="material-symbols-outlined text-lg text-secondary">{icon}</span>
    {children}
  </h3>
)

const BreedDetailModal = ({ breed, isOpen, onClose, animals = [] }) => {
  const { isSignedIn } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editedBreed, setEditedBreed] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    if (breed) setEditedBreed({ ...breed })
    setIsEditing(false)
  }, [breed, isOpen])

  if (!breed || !editedBreed) return null

  const availableAnimals = animals.filter(a => a.race === breed.nom)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateRace(breed.id, editedBreed)
      setIsEditing(false)
      alert('Modifications enregistrées ! (Rechargez la page pour voir les changements)')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditedBreed(prev => ({ ...prev, [name]: value }))
  }

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="fixed inset-4 md:inset-x-8 md:top-12 md:bottom-8 max-w-3xl mx-auto bg-[#f5f2eb] z-[101] border-4 border-black rounded-3xl shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col"
          >
            {/* Close + Edit buttons */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              {isSignedIn && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`w-10 h-10 ${isEditing ? 'bg-secondary' : 'bg-tertiary'} text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all rounded-xl flex items-center justify-center`}
                  title={isEditing ? 'Annuler' : 'Modifier'}
                >
                  <span className="material-symbols-outlined text-lg">{isEditing ? 'close' : 'edit'}</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="w-10 h-10 bg-[#154212] text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all rounded-xl flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Hero Header */}
              <div className="relative h-52 overflow-hidden border-b-4 border-black flex-shrink-0">
                <img src={breed.photo} alt={breed.nom} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 pr-20">
                  <span className="bg-secondary text-white px-3 py-1 border-2 border-white/30 font-black text-[10px] uppercase tracking-widest rounded-full inline-block mb-2">
                    Encyclopédie Adopty · {breed.espece}
                  </span>
                  {isEditing ? (
                    <input
                      name="nom"
                      value={editedBreed.nom}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b-2 border-white/50 text-4xl text-white font-['Chewy'] focus:outline-none"
                    />
                  ) : (
                    <h2 className="font-['Chewy'] text-4xl md:text-5xl text-white leading-none">{breed.nom}</h2>
                  )}
                </div>
              </div>

              {/* Quick stats bar */}
              <div className="bg-[#154212] px-6 py-3 flex flex-wrap gap-5 border-b-4 border-black">
                {[
                  { icon: 'public', label: 'Origine', value: breed.origine },
                  { icon: 'favorite', label: 'Espérance de vie', value: breed.esperanceVie },
                  { icon: 'straighten', label: 'Taille', value: breed.tailleMoyenne ? `${breed.tailleMoyenne} cm` : null },
                  { icon: 'monitor_weight', label: 'Poids', value: breed.poidsMoyen ? `${breed.poidsMoyen} kg` : null },
                ].map(({ icon, label, value }) => value ? (
                  <div key={label} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary-fixed text-sm">{icon}</span>
                    <div>
                      <p className="text-white/50 text-[9px] uppercase tracking-widest font-black leading-none">{label}</p>
                      <p className="text-white font-bold text-sm leading-tight">{value}</p>
                    </div>
                  </div>
                ) : null)}
              </div>

              <div className="px-6 py-7 space-y-8">

                {/* Description */}
                <div>
                  <SectionTitle icon="history_edu">Histoire &amp; Caractère</SectionTitle>
                  {isEditing ? (
                    <textarea
                      name="description"
                      value={editedBreed.description}
                      onChange={handleChange}
                      className="w-full h-40 bg-white border-2 border-black p-4 rounded-xl font-['Plus_Jakarta_Sans'] text-sm focus:outline-none"
                    />
                  ) : (
                    <p className="text-[15px] text-on-surface-variant leading-[1.9] tracking-wide">
                      {breed.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-black/10" />
                  <span className="material-symbols-outlined text-primary/20 text-xl">pets</span>
                  <div className="flex-1 h-px bg-black/10" />
                </div>

                {/* Fiche identité */}
                <div>
                  <SectionTitle icon="description">Fiche d'identité</SectionTitle>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <InfoChip icon="category" label="Classification" value={breed.classification} />
                    <InfoChip icon="palette" label="Couleurs" value={breed.couleurs} />
                    <InfoChip icon="home" label="Habitat idéal" value={breed.habitat} />
                    <InfoChip icon="psychology" label="Intelligence" value={breed.intelligence} />
                    <InfoChip icon="content_cut" label="Type de pelage" value={breed.taillePelage} />
                    <InfoChip icon="settings" label="Entretien" value={breed.maintenance} />
                  </div>
                </div>

                {/* Santé */}
                {(breed.immunite || breed.alergies) && (
                  <div className="bg-white border-2 border-black/10 rounded-2xl p-5">
                    <SectionTitle icon="medical_services">Santé &amp; Prédispositions</SectionTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <InfoChip icon="shield" label="Immunité" value={breed.immunite} />
                      <InfoChip icon="warning" label="Prédispositions connues" value={breed.alergies} />
                    </div>
                  </div>
                )}

                {isEditing && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3"
                  >
                    {isSaving ? 'Sauvegarde...' : (
                      <>
                        <span className="material-symbols-outlined">save</span>
                        Publier les modifications
                      </>
                    )}
                  </button>
                )}

                {/* Animaux disponibles */}
                {!isEditing && (
                  <div>
                    <h3 className="font-['Chewy'] text-2xl text-primary mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-2xl">volunteer_activism</span>
                      Ils attendent une famille
                    </h3>
                    {availableAnimals.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {availableAnimals.map(animal => (
                          <Link
                            key={animal.id}
                            to={`/profil/${animal.id}`}
                            onClick={onClose}
                            className="bg-white border-3 border-black p-3 rounded-2xl flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(21,66,18,1)] transition-all group border-2"
                          >
                            <div className="w-14 h-14 rounded-xl border-2 border-black flex-shrink-0 overflow-hidden">
                              <img src={animal.photo} alt={animal.nom} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="font-black text-primary text-sm group-hover:text-secondary transition-colors">{animal.nom}</p>
                              <p className="text-xs font-bold text-on-surface-variant">{animal.ageLabel} · {animal.poids}</p>
                            </div>
                            <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-all text-sm">arrow_forward</span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl p-6 text-center border-2 border-dashed border-black/20">
                        <span className="material-symbols-outlined text-3xl text-on-surface-variant/30 block mb-2">search_off</span>
                        <p className="font-bold text-on-surface-variant text-sm mb-3">
                          Aucun {breed.nom} au refuge en ce moment.
                        </p>
                        <Link
                          to="/animaux"
                          onClick={onClose}
                          className="text-xs font-black uppercase text-primary underline underline-offset-4"
                        >
                          Découvrir nos autres compagnons →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}

export default BreedDetailModal
