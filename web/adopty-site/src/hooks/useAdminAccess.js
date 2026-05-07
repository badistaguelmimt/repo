import { useRoleAccess } from './useRoleAccess'

export const useAdminAccess = () => {
  const { loading, isAdmin, error, source } = useRoleAccess()

  return {
    loading,
    isAdmin,
    error,
    source,
  }
}
