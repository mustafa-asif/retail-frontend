import { useAuthStore } from '@/lib/auth';

export function useBranchFilter() {
  const { user } = useAuthStore();
  return {
    storeId:   user?.role === 'manager' ? user.storeId : null,
    isAdmin:   user?.role === 'admin',
    isManager: user?.role === 'manager',
    branch:    user?.branch ?? null,
  };
}
