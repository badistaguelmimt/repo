import { useState } from 'react'
import Modal from '../../../components/ui/Modal'
import { Badge, ActionBtn, EmptyRow, THead, SectionTable, Field } from './AdminHelpers'
import { adminUpdatePrestataire, adminDeletePrestataire } from '../../../services/authApi'

const STATUT_OPTIONS = [
  { value: 'Actif', label: 'Actif' },
  { value: 'Suspendu', label: 'Suspendu' },
  { value: 'En attente', label: 'En attente' },
]

export const PrestatairesSection = ({ prestataires, setPrestataires, showToast, reload }) => {
  const [editModal, setEditModal] = useState(null)

  const handleUpdate = async (e) => {
    e.preventDefault()
    const d = editModal
    try {
      await adminUpdatePrestataire(d.id, {
        Statut: d.Statut,
        TarifHoraire: d.TarifHoraire ?? d.prixHeure,
        ZoneIntervention: d.ZoneIntervention ?? d.ville,
        Bio: d.Bio ?? d.description,
      })
      setPrestataires(prev => prev.map(p => p.id === d.id ? { ...p, ...d } : p))
      setEditModal(null)
      showToast('Prestataire mis à jour')
      if (reload) reload()
    } catch { showToast('Erreur lors de la mise à jour', 'error') }
  }

  const handleDelete = async (p) => {
    if (!window.confirm(`Supprimer le profil de "${p.nom}" ?`)) return
    try {
      await adminDeletePrestataire(p.id)
      setPrestataires(prev => prev.filter(x => x.id !== p.id))
      showToast('Profil prestataire supprimé')
      if (reload) reload()
    } catch { showToast('Erreur lors de la suppression', 'error') }
  }

  const f = (key, label, options) => (
    <Field key={key} label={label} name={key}
      value={editModal?.[key] ?? ''}
      onChange={e => setEditModal(prev => ({ ...prev, [key]: e.target.value }))}
      options={options}
    />
  )

  return (
    <>
      <div className="space-y-4">
        <p className="text-on-surface-variant font-bold text-sm">{prestataires.length} prestataire(s)</p>
        <SectionTable>
          <THead cols={['Prestataire', 'Service', 'Zone', 'Tarif', 'Note', 'Statut', 'Actions']} />
          <tbody className="divide-y divide-outline-variant">
            {prestataires.length === 0
              ? <EmptyRow colSpan={7} icon="handshake" message="Aucun prestataire trouvé." />
              : prestataires.map(p => (
                  <tr key={p.id} className="hover:bg-surface-container transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.photo} alt={p.nom}
                          className="w-9 h-9 rounded-full object-cover border-2 border-black"
                          onError={e => { e.target.src = 'https://via.placeholder.com/36' }} />
                        <p className="font-bold text-sm">{p.nom}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{p.service || p.typeService || '—'}</td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">{p.ville || p.ZoneIntervention || '—'}</td>
                    <td className="px-4 py-3 font-mono text-sm">{Number(p.prixHeure || p.TarifHoraire || 0).toFixed(0)} DZA/h</td>
                    <td className="px-4 py-3 font-extrabold text-primary text-sm">{Number(p.note || 0).toFixed(1)} ★</td>
                    <td className="px-4 py-3">
                      <Badge
                        label={p.Statut ?? (p.disponible ? 'Actif' : 'Indisponible')}
                        color={p.Statut === 'Actif' || p.disponible ? 'success' : 'warning'}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <ActionBtn icon="edit" title="Modifier" onClick={() => setEditModal({ ...p })} />
                        <ActionBtn icon="delete" title="Supprimer" variant="danger" onClick={() => handleDelete(p)} />
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </SectionTable>
      </div>

      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title={`Modifier — ${editModal?.nom}`}>
        <form onSubmit={handleUpdate} className="space-y-4">
          {f('Statut', 'Statut', STATUT_OPTIONS)}
          {f('TarifHoraire', 'Tarif horaire (DZA/h)')}
          {f('ZoneIntervention', "Zone d'intervention")}
          {f('Bio', 'Bio / Description')}
          <button type="submit" className="w-full py-3 bg-primary text-white font-bold border-2 border-black rounded shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            Enregistrer
          </button>
        </form>
      </Modal>
    </>
  )
}
