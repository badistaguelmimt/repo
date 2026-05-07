import { Link, Navigate, useLocation } from 'react-router-dom'
import { useRoleAccess } from '../hooks/useRoleAccess'

const AdminRouteGuard = ({ children }) => {
  const location = useLocation()
  const { loading, isSignedIn, canAccessDashboard, error } = useRoleAccess()

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  if (!canAccessDashboard) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-14">
        <div className="bg-surface-container-lowest border-4 border-black rounded-xl p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <span className="material-symbols-outlined text-5xl text-error block mb-4">lock</span>
          <h1 className="font-['Chewy'] text-4xl text-primary mb-3">Acces dashboard restreint</h1>
          <p className="text-on-surface-variant mb-6">
            Le dashboard est reserve aux comptes Prestataire, Refuge et Admin.
          </p>
          {error && (
            <p className="text-xs font-bold text-[#7a4a00] bg-[#fff1c2] border-2 border-black px-3 py-2 inline-block mb-6">
              Verification backend: {error}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <Link
              to="/"
              className="px-5 py-3 bg-primary text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              Retour accueil
            </Link>
            <Link
              to="/mon-profil"
              className="px-5 py-3 bg-surface-container border-2 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              Voir mon profil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return children
}

export default AdminRouteGuard
