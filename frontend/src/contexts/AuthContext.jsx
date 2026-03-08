/**
 * AuthContext.jsx — Global auth state with role support
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('roadwatch_user');
      if (stored) setUser(JSON.parse(stored));
    } catch { localStorage.removeItem('roadwatch_user'); }
    finally { setIsLoading(false); }
  }, []);

  const login = (userData) => {
    localStorage.setItem('roadwatch_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('roadwatch_user');
    setUser(null);
  };

  const updateUser = (userData) => {
    // Keep existing auth tokens/fields and just override with updated user data
    const updated = { ...user, ...userData };
    localStorage.setItem('roadwatch_user', JSON.stringify(updated));
    setUser(updated);
  };

  const isLoggedIn = !!user;
  const isAdmin    = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isAdmin, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
