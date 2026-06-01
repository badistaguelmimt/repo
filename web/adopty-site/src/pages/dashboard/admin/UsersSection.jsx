import { useState } from 'react'
import Modal from '../../../components/ui/Modal'
import { Badge, ActionBtn, EmptyRow, THead, SectionTable, Field } from './AdminHelpers'
import {
  banUser, adminDeleteUser, adminUpdateUser,
  adminAddRole, adminRemoveRole, getAllRoles,
} from '../../../services/authApi'

const STATUT_COLOR = (s) =>
  s === 'banned' ? 'danger' : 'success'

export const UsersSection = ({ users, setUsers, showToast, reload }) => {
  const [editModal, setEditModal] = useState(null)
  const [rolesModal, setRolesModal] = useState(null)
  const [allRoles, setAllRoles] = useState([])

  const refresh = (updated) => setUsers(updated)

  const handleBan = async (user) => {
    if (!window.confirm(`Bannir ${user.Prenom} ${user.Nom} ?`)) return
    try {
      await banUser(user.Id)
      refresh(users.map(u => u.Id === user.Id ? { ...u, stripeAccountStatus: 'banned' } : u))
      showToast('Utilisateur banni')
      if (reload) reload()
    } catch { showToast('Erreur', 'error') }
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Supprimer définitivement ${user.Prenom} ${user.Nom} ? Irréversible.`)) return
    try {
      await adminDeleteUser(user.Id)
      refresh(users.filter(u => u.Id !== user.Id))
      showToast('Utilisateur supprimé')
      if (reload) reload()
    } catch { showToast('Erreur lors de la suppression', 'error') }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    const d = editModal
    try {
      await adminUpdateUser(d.Id, { Nom: d.Nom, Prenom: d.Prenom, AddresseEmail: d.AddresseEmail, Wilaya: d.Wilaya, Addresse: d.Addresse })
      refresh(users.map(u => u.Id === d.Id ? { ...u, ...d } : u))
      setEditModal(null)
      showToast('Utilisateur mis à jour')
      if (reload) reload()
    } catch { showToast('Erreur', 'error') }
  }

  const openRolesModal = async (user) => {
    const roles = await getAllRoles().catch(() => [])
    setAllRoles(Array.isArray(roles) ? roles.filter(r => r.Id <= 4) : [])
    setRolesModal(user)
  }

  const handleAddRole = async (roleId) => {
    try {
      await adminAddRole(rolesModal.Id, roleId)
      showToast('Rôle ajouté')
      if (reload) reload()
    } catch { showToast('Erreur', 'error') }
  }

  const handleRemoveRole = async (roleId) => {
    try {
      await adminRemoveRole(rolesModal.Id, roleId)
      showToast('Rôle retiré')
      if (reload) reload()
    } catch { showToast('Erreur', 'error') }
  }

  const f = (key, label, opts) => (
    <Field key={key} label={label} name={key}
      value={editModal?.[key] ?? ''}
      onChange={e => setEditModal(p => ({ ...p, [key]: e.target.value }))}
      options={opts}
    />
  )

  return (
    <>
      <div className="space-y-4">
        <p className="text-on-surface-variant font-bold text-sm">{users.length} utilisateur(s)</p>
        <SectionTable>
          <THead cols={['#', 'Nom / Prénom', 'Email', 'Wilaya', 'Statut', 'Actions']} />
          <tbody className="divide-y divide-outline-variant">
            {users.length === 0
              ? <EmptyRow colSpan={6} icon="group" message="Aucun utilisateur trouvé." />
              : users.map(u => (
                  <tr key={u.Id} className="hover:bg-surface-container transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">#{u.Id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full border-2 border-black flex items-center justify-center font-bold text-xs text-primary">
                          {String(u.Nom || 'U').charAt(0)}
                        </div>
                        <p className="font-bold">{u.Prenom} {u.Nom}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{u.AddresseEmail}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{u.Wilaya || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge label={u.stripeAccountStatus === 'banned' ? 'Banni' : 'Actif'}
                        color={STATUT_COLOR(u.stripeAccountStatus)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <ActionBtn icon="edit" title="Modifier" onClick={() => setEditModal({ ...u })} />
                        <ActionBtn icon="manage_accounts" title="Gérer rôles" variant="warn" onClick={() => openRolesModal(u)} />
                        {u.stripeAccountStatus !== 'banned' && (
                          <ActionBtn icon="block" title="Bannir" variant="warn" onClick={() => handleBan(u)} />
                        )}
                        <ActionBtn icon="delete" title="Supprimer" variant="danger" onClick={() => handleDelete(u)} />
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </SectionTable>
      </div>

      {/* Modal Édition utilisateur */}
      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title={`Modifier — ${editModal?.Prenom} ${editModal?.Nom}`}>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {f('Prenom', 'Prénom')}
            {f('Nom', 'Nom')}
          </div>
          {f('AddresseEmail', 'Email', undefined)}
          {f('Wilaya', 'Wilaya')}
          {f('Addresse', 'Adresse')}
          <button type="submit" className="w-full py-3 bg-primary text-white font-bold border-2 border-black rounded shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            Enregistrer
          </button>
        </form>
      </Modal>

      {/* Modal Gestion rôles */}
      <Modal isOpen={!!rolesModal} onClose={() => setRolesModal(null)} title={`Rôles — ${rolesModal?.Prenom} ${rolesModal?.Nom}`}>
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant font-bold">Attribuer / retirer un rôle :</p>
          <div className="grid grid-cols-2 gap-2">
            {allRoles.map(role => (
              <div key={role.Id} className="flex items-center justify-between border-2 border-black rounded px-3 py-2">
                <span className="font-bold text-sm">{role.Nom}</span>
                <div className="flex gap-1">
                  <ActionBtn icon="add_circle" title="Ajouter" variant="success" onClick={() => handleAddRole(role.Id)} />
                  <ActionBtn icon="remove_circle" title="Retirer" variant="danger" onClick={() => handleRemoveRole(role.Id)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  )
}
