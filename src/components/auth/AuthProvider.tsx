import { createContext, useContext, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../lib/logger';

const AuthContext = createContext<ReturnType<typeof useAuth>>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  useEffect(() => {
    logger.debug('Auth state changed:', { 
      isAuthenticated: !!auth.user,
      loading: auth.loading 
    });
  }, [auth.user, auth.loading]);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    logger.error('useAuthContext must be used within an AuthProvider');
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};