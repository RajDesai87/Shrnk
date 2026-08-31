import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('shrnk_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('shrnk_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    try {
      if (token) {
        api.logout().catch(() => {});
      }
    } finally {
      localStorage.removeItem('shrnk_token');
      localStorage.removeItem('shrnk_user');
      setToken(null);
      setUser(null);
    }
  }, [token]);

  // Re-verify and hydrate user state on application launch
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const savedToken = localStorage.getItem('shrnk_token');
      if (savedToken) {
        try {
          const freshUser = await api.getMe();
          if (isMounted) {
            setUser(freshUser);
            localStorage.setItem('shrnk_user', JSON.stringify(freshUser));
          }
        } catch (err) {
          // Only invalidate and clear session if server explicitly returned 401 Unauthorized
          if (isMounted && err.status === 401) {
            logout();
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    // Listen to unauthorized events from API layer
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('shrnk:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('shrnk:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('shrnk_token', data.access_token);
    localStorage.setItem('shrnk_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password) => {
    const data = await api.register(name, email, password);
    localStorage.setItem('shrnk_token', data.access_token);
    localStorage.setItem('shrnk_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const updateProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('shrnk_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
