import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { getStoredToken, removeStoredToken, storeToken } from '../utils/tokenStorage';

export type Role = 'ADMIN_DIRECCION' | 'ADMIN_RRHH' | 'EMPLEADO';

export type AuthState = {
  token: string | null;
  role: Role | null;
  userId: string | null;
  nombre?: string;
  apellido?: string;
};

type AuthContextValue = {
  auth: AuthState;
  login: (params: { token: string; role: Role; userId: string; nombre: string; apellido: string }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ token: null, role: null, userId: null });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const stored = getStoredToken();
    if (stored) {
      setAuth(stored);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    auth,
    login: (params) => {
      setAuth(params);
      storeToken(params);
    },
    logout: () => {
      setAuth({ token: null, role: null, userId: null });
      removeStoredToken();
      queryClient.clear();
      navigate('/login');
    },
  }), [auth, navigate, queryClient]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('AuthContext debe usarse dentro de AuthProvider');
  }
  return ctx;
};

export const useRequireRole = (allowed: Role[]) => {
  const { auth } = useAuth();
  return allowed.includes(auth.role ?? 'EMPLEADO');
};
