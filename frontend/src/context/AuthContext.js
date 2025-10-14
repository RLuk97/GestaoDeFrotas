import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'auth_state';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setIsAuthenticated(!!parsed?.isAuthenticated);
        setUser(parsed?.user || null);
      }
    } catch (_) {
      // ignore storage errors
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((username, password) => {
    // Credenciais fixas conforme solicitação
    if (username === 'Admin' && password === 'admin123') {
      const next = { isAuthenticated: true, user: { name: 'Administrador', username: 'Admin' } };
      setIsAuthenticated(true);
      setUser(next.user);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (_) {}
      return { success: true };
    }
    return { success: false, message: 'Credenciais inválidas' };
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }, []);

  const value = { isAuthenticated, user, login, logout, isLoading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
};

export default AuthContext;