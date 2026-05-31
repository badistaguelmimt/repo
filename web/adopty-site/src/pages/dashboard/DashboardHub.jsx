import Dashboard from './Dashboard'
import PrestataireDashboard from './PrestataireDashboard'
import RefugeDashboard from './RefugeDashboard'
import { useRoleAccess, ROLE_KEYS } from '../../hooks/useRoleAccess'

const DashboardHub = () => {
  const { role } = useRoleAccess()

  if (role === ROLE_KEYS.ADMIN) {
    return <Dashboard />
  }

  if (role === ROLE_KEYS.PRESTATAIRE) {
    return <PrestataireDashboard />
  }

  if (role === ROLE_KEYS.REFUGE) {
    return <RefugeDashboard />
  }

  return null
}

export default DashboardHub
