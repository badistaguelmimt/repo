import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { updateRace } from '../../services/publicApi'

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
    if (breed) {
      setEditedBreed({ ...breed })
    }
    setIsEditing(false)
  }, [breed, isOpen])

  if (!breed || !editedBreed) return null

  const availableAnimals = animals.filter(a => a.race === breed.nom)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateRace(breed.id, editedBreed)
      setIsEditing(false)
      alert("Modifications enregistrées ! (Rechargez la page pour voir les changements)")
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      alert("Erreur lors de la sauvegarde.")
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
            className="fixed inset-4 md:inset-x-8 md:top-16 md:bottom-8 max-w-3xl mx-auto bg-white z-[101] border-4 border-black rounded-3xl shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col"
          >
            <div className="absolute top-5 right-5 z-10 flex gap-2">
              {isSignedIn && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`w-12 h-12 ${isEditing ? 'bg-secondary' : 'bg-tertiary'} text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-xl flex items-center justify-center`}
                  title={isEditing ? "Annuler" : "Modifier l'article (Wikipedia Vision)"}
                >
                  <span className="material-symbols-outlined text-2xl">{isEditing ? 'close' : 'edit'}</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="w-12 h-12 bg-[#154212] text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all rounded-xl flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="bg-[#154212] px-10 py-8 pr-32">
                <span className="bg-white/10 border border-white/20 text-white/80 font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-widest mb-3 inline-block">
                  Encyclopédie Adopty · {breed.espece}
                </span>
                
                {isEditing ? (
                  <input
                    name="nom"
                    value={editedBreed.nom}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b-2 border-white/30 text-5xl lg:text-6xl text-white font-['Chewy'] focus:outline-none focus:border-white mb-4"
                  />
                ) : (
                  <h2 className="font-['Chewy'] text-5xl lg:text-6xl text-white leading-none">
                    {breed.nom}
                  </h2>
                )}

                <div className="flex flex-wrap gap-6 mt-5">
                  {[
                    { icon: 'public', label: 'Origine', name: 'origine' },
                    { icon: 'favorite', label: 'Espérance de vie', name: 'esperanceVie' },
                    { icon: 'straighten', label: 'Taille adulte', name: 'tailleAdulte' },
                  ].map(({ icon, label, name }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary-fixed text-base">{icon}</span>
                      <div>
                        <p className="text-white/50 text-[9px] uppercase tracking-widest font-black">{label}</p>
                        {isEditing ? (
                          <input
                            name={name}
                            value={editedBreed[name]}
                            onChange={handleChange}
                            className="bg-transparent border-b border-white/20 text-white font-bold text-sm focus:outline-none focus:border-white"
                          />
                        ) : (
                          <p className="text-white font-bold text-sm">{breed[name]}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-8 lg:px-12 py-10 space-y-10">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-secondary">history_edu</span>
                    Histoire & Caractéristiques
                  </h3>
                  {isEditing ? (
                    <textarea
                      name="description"
                      value={editedBreed.description}
                      onChange={handleChange}
                      className="w-full h-40 bg-surface-container border-2 border-black p-4 rounded-xl font-['Plus_Jakarta_Sans'] text-[15px] focus:outline-none"
                    />
                  ) : (
                    <p className="font-['Plus_Jakarta_Sans'] text-[15px] text-on-surface-variant leading-[1.9] tracking-wide">
                      {breed.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-black/10" />
                  <span className="material-symbols-outlined text-primary/30 text-xl">pets</span>
                  <div className="flex-1 h-px bg-black/10" />
                </div>

                <div className="bg-[#154212]/5 border-2 border-[#154212]/20 p-7 rounded-2xl">
                  <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-primary flex items-center gap-2 mb-4 uppercase tracking-widest text-sm">
                    <span className="material-symbols-outlined text-lg">medical_services</span>
                    Santé &amp; Soins au quotidien
                  </h3>
                  {isEditing ? (
                    <textarea
                      name="soins"
                      value={editedBreed.soins}
                      onChange={handleChange}
                      className="w-full h-32 bg-white border-2 border-black p-4 rounded-xl text-sm focus:outline-none"
                    />
                  ) : (
                    <p className="text-sm text-on-surface-variant leading-[1.85]">
                      {breed.soins}
                    </p>
                  )}
                </div>

                {isEditing && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-3"
                  >
                    {isSaving ? 'Sauvegarde...' : (
                      <>
                        <span className="material-symbols-outlined">save</span>
                        Publier les modifications (Vision Wikipedia)
                      </>
                    )}
                  </button>
                )}

                {!isEditing && (
                  <div>
                    <h3 className="font-['Chewy'] text-3xl text-primary mb-5 flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary text-3xl">volunteer_activism</span>
                      Ils attendent une famille
                    </h3>

                    {availableAnimals.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {availableAnimals.map(animal => (
                          <Link
                            key={animal.id}
                            to={`/profil/${animal.id}`}
                            onClick={onClose}
                            className="bg-surface-container-lowest border-4 border-black p-4 rounded-2xl flex items-center gap-4 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(21,66,18,1)] transition-all group"
                          >
                            <div className="w-16 h-16 rounded-xl border-2 border-black bg-white flex-shrink-0 overflow-hidden">
                              <img src={animal.photo} alt={animal.nom} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="font-black text-primary group-hover:text-secondary transition-colors">{animal.nom}</p>
                              <p className="text-xs font-bold text-on-surface-variant">{animal.ageLabel} · {animal.poids}</p>
                            </div>
                            <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-all">arrow_forward</span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-surface-container rounded-2xl p-8 text-center border-2 border-dashed border-black/20">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 block mb-3">search_off</span>
                        <p className="font-bold text-on-surface-variant text-sm mb-4">
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
