import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createSignalementApi } from '../services/authApi';
import { useRoleAccess } from '../hooks/useRoleAccess';

const ReportModal = ({ isOpen, onClose, targetType, targetId, targetName }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { isSignedIn } = useRoleAccess();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSignedIn) {
      setError("Vous devez être connecté pour faire un signalement.");
      return;
    }
    if (reason.trim().length < 10) {
      setError("La raison doit contenir au moins 10 caractères.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createSignalementApi({
        TypeCible: targetType,
        IdCible: targetId,
        Raison: `Signalement de ${targetName}\n\nRaison: ${reason}`,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReason('');
      }, 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-surface-container-lowest border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] z-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Chewy'] text-2xl text-[#1a1a1a] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ba1a1a]">policy</span>
                Signaler ce profil
              </h2>
              <button onClick={onClose} className="hover:bg-surface-container p-2 rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-primary-fixed border-4 border-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="material-symbols-outlined text-3xl text-primary">check</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Signalement envoyé</h3>
                <p className="text-on-surface-variant text-sm">Notre équipe va examiner ce profil rapidement. Merci !</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-on-surface-variant">
                  Vous êtes sur le point de signaler <strong>{targetName}</strong>. 
                  Veuillez décrire le problème (spam, comportement inapproprié, arnaque...).
                </p>

                {error && (
                  <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm font-bold border-2 border-error">
                    {error}
                  </div>
                )}

                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Expliquez-nous le problème en détails..."
                  className="w-full bg-white border-2 border-black px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] rounded-lg h-32 resize-none"
                />

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 py-3 border-4 border-black font-bold uppercase text-sm hover:bg-surface-container transition-all rounded-lg">
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-[#1a1a1a] text-white font-bold uppercase text-sm border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 rounded-lg"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-sm">flag</span>
                    )}
                    Signaler
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReportModal;
