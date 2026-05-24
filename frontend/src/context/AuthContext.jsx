import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/apiServices';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('devtrackr_token'));
  const [loading, setLoading] = useState(true);

  // Load user on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('devtrackr_token');
      const savedUser = localStorage.getItem('devtrackr_user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Verify token is still valid
          const res = await authApi.getProfile();
          setUser(res.data.data);
          localStorage.setItem('devtrackr_user', JSON.stringify(res.data.data));
        } catch (err) {
          // Token invalid — clear
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const res = await authApi.login({ email, password });
    const { user: userData, token: newToken } = res.data.data;

    localStorage.setItem('devtrackr_token', newToken);
    localStorage.setItem('devtrackr_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    return userData;
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    const res = await authApi.signup({ name, email, password });
    const { user: userData, token: newToken } = res.data.data;

    localStorage.setItem('devtrackr_token', newToken);
    localStorage.setItem('devtrackr_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('devtrackr_token');
    localStorage.removeItem('devtrackr_user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('devtrackr_user', JSON.stringify(updated));
  }, [user]);

  // Re-fetch profile from backend — used after GitHub OAuth callback
  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.getProfile();
      const freshUser = res.data.data;
      setUser(freshUser);
      localStorage.setItem('devtrackr_user', JSON.stringify(freshUser));
      return freshUser;
    } catch (err) {
      console.error('refreshUser failed:', err);
    }
  }, []);

  /**
   * Update profile fields (name, preferences etc.) — persists to DB + updates global state
   */
  const updateProfile = useCallback(async (fields) => {
    const res = await authApi.updateProfile(fields);
    const updatedUser = res.data.data;
    setUser(updatedUser);
    localStorage.setItem('devtrackr_user', JSON.stringify(updatedUser));
    return updatedUser;
  }, []);

  /**
   * Upload a profile picture as base64 data URL — persists to DB + updates global state
   */
  const uploadAvatar = useCallback(async (base64DataUrl) => {
    const res = await authApi.uploadAvatar(base64DataUrl);
    const updatedUser = res.data.data;
    setUser(updatedUser);
    localStorage.setItem('devtrackr_user', JSON.stringify(updatedUser));
    return updatedUser;
  }, []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated,
      login,
      signup,
      logout,
      updateUser,
      updateProfile,
      uploadAvatar,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
