import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setToken = (token) => { window.__accessToken = token; };

  // Try to restore session on mount via refresh token cookie
  useEffect(() => {
    api.post('/auth/refresh-token')
      .then(({ data }) => {
        setToken(data.accessToken);
        return api.get('/auth/me');
      })
      .then(({ data }) => setUser(data.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Listen for forced logout from interceptor
  useEffect(() => {
    const handler = () => { setUser(null); setToken(null); };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  // Handle OAuth token from URL fragment
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#token=')) {
      const token = hash.replace('#token=', '');
      setToken(token);
      window.history.replaceState(null, '', window.location.pathname);
      api.get('/auth/me').then(({ data }) => setUser(data.user)).catch(() => {});
    }
  }, []);

  const register = useCallback(async (form) => {
    const { data } = await api.post('/auth/register', form);
    setToken(data.accessToken);
    setUser(data.user);
    return data;
  }, []);

  const login = useCallback(async (form) => {
    const { data } = await api.post('/auth/login', form);
    setToken(data.accessToken);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch {}
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
