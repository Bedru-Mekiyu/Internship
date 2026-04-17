import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

export const useAuthSession = () => {
  const auth = useAuth();

  return useMemo(
    () => ({
      user: auth.user,
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      login: auth.login,
      register: auth.register,
      logout: auth.logout,
      refreshSession: auth.refreshSession,
      clearSession: auth.clearSession,
    }),
    [auth],
  );
};
