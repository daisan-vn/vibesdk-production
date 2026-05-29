/**
 * Enhanced Auth Context
 * Provides OAuth + Email/Password authentication with backward compatibility
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { apiClient, ApiError } from '@/lib/api-client';
import { useSentryUser } from '@/hooks/useSentryUser';
import type { AuthSession, AuthUser } from '../api-types';
import {
	ENABLE_DEMO_WITHOUT_AUTH,
	DEMO_USER_ID,
	DEMO_ACCESS_TOKEN,
	DEMO_SESSION_ID,
	DEMO_EMAIL,
	DEMO_DISPLAY_NAME,
} from '../../shared/constants/demo-auth';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  authProviders: {
    google: boolean;
    github: boolean;
    email: boolean;
  } | null;
  hasOAuth: boolean;
  requiresEmailAuth: boolean;

  login: (provider: 'google' | 'github', redirectUrl?: string) => void;
  loginWithEmail: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; name?: string }) => Promise<void>;

  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;

  setIntendedUrl: (url: string) => void;
  getIntendedUrl: () => string | null;
  clearIntendedUrl: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_REFRESH_INTERVAL = 60 * 60 * 1000;

function createDemoUser(): AuthUser {
  return {
    id: DEMO_USER_ID,
    email: DEMO_EMAIL,
    name: DEMO_DISPLAY_NAME,
    displayName: DEMO_DISPLAY_NAME,
    isAnonymous: false,
  } as AuthUser;
}

function createDemoSession(): AuthSession {
  return {
    userId: DEMO_USER_ID,
    email: DEMO_EMAIL,
    sessionId: DEMO_SESSION_ID,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authProviders, setAuthProviders] = useState<{ google: boolean; github: boolean; email: boolean; } | null>(null);
  const [hasOAuth, setHasOAuth] = useState<boolean>(false);
  const [requiresEmailAuth, setRequiresEmailAuth] = useState<boolean>(true);
  const navigate = useNavigate();

  useSentryUser(user);

  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const INTENDED_URL_KEY = 'auth_intended_url';

  const setIntendedUrl = useCallback((url: string) => {
    try {
      sessionStorage.setItem(INTENDED_URL_KEY, url);
    } catch (err) {
      console.warn('Failed to store intended URL:', err);
    }
  }, []);

  const getIntendedUrl = useCallback((): string | null => {
    try {
      return sessionStorage.getItem(INTENDED_URL_KEY);
    } catch (err) {
      console.warn('Failed to retrieve intended URL:', err);
      return null;
    }
  }, []);

  const clearIntendedUrl = useCallback(() => {
    try {
      sessionStorage.removeItem(INTENDED_URL_KEY);
    } catch (err) {
      console.warn('Failed to clear intended URL:', err);
    }
  }, []);

  const applyDemoUser = useCallback(() => {
    setUser(createDemoUser());
    setToken(DEMO_ACCESS_TOKEN);
    setSession(createDemoSession());
    try {
      localStorage.setItem('auth_token', DEMO_ACCESS_TOKEN);
    } catch (err) {
      console.warn('Failed to persist demo auth token:', err);
    }
  }, []);

  const fetchAuthProviders = useCallback(async () => {
    try {
      const response = await apiClient.getAuthProviders();
      if (response.success && response.data) {
        setAuthProviders(response.data.providers);
        setHasOAuth(response.data.hasOAuth);
        setRequiresEmailAuth(response.data.requiresEmailAuth);
      }
    } catch (err) {
      console.warn('Failed to fetch auth providers:', err);
      setAuthProviders({ google: false, github: false, email: true });
      setHasOAuth(false);
      setRequiresEmailAuth(true);
    }
  }, []);

  const setupTokenRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }

    if (ENABLE_DEMO_WITHOUT_AUTH) {
      return;
    }

    refreshTimerRef.current = setInterval(async () => {
      try {
        const response = await apiClient.getProfile(true);
        if (!response.success) {
          setUser(null);
          setToken(null);
          setSession(null);
          clearInterval(refreshTimerRef.current!);
        }
      } catch (err) {
        console.error('Session validation failed:', err);
      }
    }, TOKEN_REFRESH_INTERVAL);
  }, []);

  const checkAuth = useCallback(async () => {
    if (ENABLE_DEMO_WITHOUT_AUTH) {
      applyDemoUser();
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.getProfile(true);

      if (response.success && response.data?.user) {
        const userData = { ...response.data.user, isAnonymous: false } as AuthUser;
        setUser(userData);
        setToken(null);
        setSession({
          userId: response.data.user.id,
          email: response.data.user.email,
          sessionId: response.data.sessionId || response.data.user.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        setupTokenRefresh();
      } else {
        setUser(null);
        setToken(null);
        setSession(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
      setToken(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [applyDemoUser, setupTokenRefresh]);

  useEffect(() => {
    fetchAuthProviders();
    checkAuth();

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [fetchAuthProviders, checkAuth]);

  const login = useCallback((provider: 'google' | 'github', redirectUrl?: string) => {
    const target = redirectUrl || window.location.href;
    window.location.href = `/api/auth/oauth/${provider}?redirect=${encodeURIComponent(target)}`;
  }, []);

  const loginWithEmail = useCallback(async (credentials: { email: string; password: string }) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiClient.loginWithEmail(credentials);

      if (response.success && response.data) {
        setUser({ ...response.data.user, isAnonymous: false } as AuthUser);
        setToken(null);
        setSession({
          userId: response.data.user.id,
          email: response.data.user.email,
          sessionId: response.data.sessionId,
          expiresAt: response.data.expiresAt,
        });
        setupTokenRefresh();

        const intendedUrl = getIntendedUrl();
        clearIntendedUrl();
        navigate(intendedUrl || '/');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Connection error. Please try again.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setupTokenRefresh, getIntendedUrl, clearIntendedUrl]);

  const register = useCallback(async (data: { email: string; password: string; name?: string }) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiClient.register(data);

      if (response.success && response.data) {
        setUser({ ...response.data.user, isAnonymous: false } as AuthUser);
        setToken(null);
        setSession({
          userId: response.data.user.id,
          email: response.data.user.email,
          sessionId: response.data.sessionId,
          expiresAt: response.data.expiresAt,
        });
        setupTokenRefresh();

        const intendedUrl = getIntendedUrl();
        clearIntendedUrl();
        navigate(intendedUrl || '/');
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Connection error. Please try again.');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setupTokenRefresh, getIntendedUrl, clearIntendedUrl]);

  const logout = useCallback(async () => {
    if (ENABLE_DEMO_WITHOUT_AUTH) {
      applyDemoUser();
      return;
    }

    try {
      await apiClient.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setToken(null);
      setSession(null);
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      navigate('/');
    }
  }, [applyDemoUser, navigate]);

  const refreshUser = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    session,
    isAuthenticated: ENABLE_DEMO_WITHOUT_AUTH || !!user,
    isLoading,
    error,
    authProviders,
    hasOAuth,
    requiresEmailAuth,
    login,
    loginWithEmail,
    register,
    logout,
    refreshUser,
    clearError,
    setIntendedUrl,
    getIntendedUrl,
    clearIntendedUrl,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRequireAuth(_redirectTo = '/') {
  const { isAuthenticated, isLoading } = useAuth();

  return { isAuthenticated, isLoading };
}
