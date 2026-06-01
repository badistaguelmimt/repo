import { useState } from 'react'
import Modal from '../../../components/ui/Modal'
import { Badge, ActionBtn, EmptyRow, THead, SectionTable, Field } from './AdminHelpers'
import { verifyRefuge, adminUpdateRefuge, adminDeleteRefuge } from '../../../services/authApi'

const statusColor = (s) => {
  if (!s || s === 'pending') return 'warning'
  if (s === 'verified') return 'success'
  if (s === 'rejected') return 'danger'
  return 'default'
}

const statusLabel = (s) => {
  if (!s || s === 'pending') return 'En attente'
  if (s === 'verified') return 'Vérifié'
  if (s === 'rejected') return 'Rejeté'
  return s
}

export const RefugesSection = ({ refuges, setRefuges, showToast, reload }) => {
  const [editModal, setEditModal] = useState(null)

  const handleVerify = async (id, status) => {
    try {
      await verifyRefuge(id, status)
      setRefuges(prev => prev.map(r => r.Id === id ? { ...r, stripeAccountStatus: status } : r))
      showToast(status === 'verified' ? 'Refuge approuvé ✓' : 'Refuge rejeté')
      if (reload) reload()
    } catch { showToast('Erreur lors de la validation', 'error') }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    const d = editModal
    try {
      await adminUpdateRefuge(d.Id, { Nom: d.Nom, Addresse: d.Addresse, Telephone: d.Telephone, Email: d.Email, Description: d.Description })
      setRefuges(prev => prev.map(r => r.Id === d.Id ? { ...r, ...d } : r))
      setEditModal(null)
      showToast('Refuge mis à jour')
      if (reload) reload()
    } catch { showToast('Erreur lors de la mise à jour', 'error') }
  }

  const handleDelete = async (refuge) => {
    if (!window.confirm(`Supprimer le refuge "${refuge.Nom}" ? Irréversible.`)) return
    try {
      await adminDeleteRefuge(refuge.Id)
      setRefuges(prev => prev.filter(r => r.Id !== refuge.Id))
      showToast('Refuge supprimé')
      if (reload) reload()
    } catch { showToast('Erreur lors de la suppression', 'error') }
  }

  const f = (key, label) => (
    <Field key={key} label={label} name={key}
      value={editModal?.[key] ?? ''}
      onChange={e => setEditModal(p => ({ ...p, [key]: e.target.value }))}
    />
  )

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-on-surface-variant font-bold text-sm">
            {refuges.length} refuge(s) — {refuges.filter(r => !r.stripeAccountStatus || r.stripeAccountStatus === 'pending').length} en attente
          </p>
        </div>
        <SectionTable>
          <THead cols={['#', 'Nom', 'Adresse / Tél.', 'Email', 'Statut', 'Actions']} />
          <tbody className="divide-y divide-outline-variant">
            {refuges.length === 0
              ? <EmptyRow colSpan={6} icon="house" message="Aucun refuge trouvé." />
              : refuges.map(r => (
                  <tr key={r.Id} className="hover:bg-surface-container transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">#{r.Id}</td>
                    <td className="px-4 py-3 font-bold">{r.Nom}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm">{r.Addresse || r.AddresseGPS || '—'}</p>
                      <p className="text-xs text-on-surface-variant font-mono">{r.Telephone || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">{r.Email || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge label={statusLabel(r.stripeAccountStatus)} color={statusColor(r.stripeAccountStatus)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <ActionBtn icon="edit" title="Modifier" onClick={() => setEditModal({ ...r })} />
                        {r.stripeAccountStatus !== 'verified' && (
                          <ActionBtn icon="check_circle" title="Approuver" variant="success" onClick={() => handleVerify(r.Id, 'verified')} />
                        )}
                        {r.stripeAccountStatus !== 'rejected' && (
                          <ActionBtn icon="cancel" title="Rejeter" variant="warn" onClick={() => handleVerify(r.Id, 'rejected')} />
                        )}
                        <ActionBtn icon="delete" title="Supprimer" variant="danger" onClick={() => handleDelete(r)} />
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </SectionTable>
      </div>

      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title={`Modifier — ${editModal?.Nom}`}>
        <form onSubmit={handleUpdate} className="space-y-4">
          {f('Nom', 'Nom du refuge')}
          {f('Addresse', 'Adresse')}
          {f('Telephone', 'Téléphone')}
          {f('Email', 'Email')}
          {f('Description', 'Description')}
          <button type="submit" className="w-full py-3 bg-primary text-white font-bold border-2 border-black rounded shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            Enregistrer
          </button>
        </form>
      </Modal>
    </>
  )
}
