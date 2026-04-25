/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AxiosResponse } from 'axios';
import {
  api,
  ensureCsrfToken,
  normalizeApiError,
} from '../services/api';
import { useAppDispatch } from '../hooks/redux';
import { clearUser as clearAuthUser, setUser as setAuthUser } from '../store/slices/authSlice';

export type LearnSpaceRole = 'student' | 'instructor' | 'admin' | 'content_manager';

export interface AuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: LearnSpaceRole;
  avatar?: string;
  bio?: string;
  phone?: string;
  preferences?: {
    language?: string;
    timezone?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
    };
    themeMode?: 'light' | 'dark' | 'system';
  };
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'student' | 'instructor';
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AxiosResponse<unknown>>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<AuthUser | null>;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const bootstrappedRef = useRef(false);

  const clearSession = useCallback(() => {
    setUser(null);
    dispatch(clearAuthUser());
  }, [dispatch]);

  const refreshSession = useCallback(async () => {
    try {
      await ensureCsrfToken();
      const response = await api.get<AuthUser>('/api/auth/me');
      setUser(response.data);
      dispatch(setAuthUser(response.data));
      return response.data;
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession, dispatch]);

  useEffect(() => {
    if (bootstrappedRef.current) {
      return;
    }

    bootstrappedRef.current = true;

    const bootstrap = async () => {
      setIsLoading(true);

      try {
        await ensureCsrfToken();
        await refreshSession();
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, [clearSession, refreshSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    await ensureCsrfToken();
    const response = await api.post<{ message: string; user?: AuthUser }>('/api/auth/login', payload);

    if (response.data.user) {
      setUser(response.data.user);
      dispatch(setAuthUser(response.data.user));
      return response.data.user;
    }

    const sessionResponse = await api.get<AuthUser>('/api/auth/me');
    setUser(sessionResponse.data);
    dispatch(setAuthUser(sessionResponse.data));
    return sessionResponse.data;
  }, [dispatch]);

  const register = useCallback(async (payload: RegisterPayload) => {
    await ensureCsrfToken();
    return api.post('/api/auth/register', payload);
  }, []);

  const logout = useCallback(async () => {
    try {
      await ensureCsrfToken();
      await api.post('/api/auth/logout');
    } catch (error) {
      throw normalizeApiError(error);
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      refreshSession,
      clearSession,
    }),
    [clearSession, isLoading, login, logout, refreshSession, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
