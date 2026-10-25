// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import apiClient from '../services/api';

// `undefined` default lets useAuth() detect usage outside the provider.
const AuthContext = createContext(undefined);

const errorFrom = (error, fallback) => error.response?.data || new Error(error.message || fallback);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // true ONLY during the first "who am I?" check; login/logout do not flip it,
  // so route guards and pages never unmount in the middle of a form submit.
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Restore the session on page load: the httpOnly cookie is sent automatically.
  useEffect(() => {
    let ignore = false;
    apiClient
      .get('/users/me')
      .then((res) => {
        if (!ignore) setUser(res.data?.status === 'success' ? res.data.data.user : null);
      })
      .catch(() => !ignore && setUser(null)) // 401 simply means "not logged in"
      .finally(() => !ignore && setLoadingAuth(false));
    return () => { ignore = true; };
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await apiClient.post('/users/login', { email, password });
      setUser(res.data.data.user);
      return res.data.data.user;
    } catch (error) {
      throw errorFrom(error, 'Login failed due to an unexpected error.');
    }
  }, []);

  const signup = useCallback(async (name, email, password) => {
    try {
      const res = await apiClient.post('/users/signup', { name, email, password });
      setUser(res.data.data.user);
      return res.data.data.user;
    } catch (error) {
      throw errorFrom(error, 'Signup failed due to an unexpected error.');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.get('/users/logout');
    } catch {
      // clear the UI anyway; the cookie expires on its own
    } finally {
      setUser(null);
    }
  }, []);

  // Merge partial updates into the current user
  const updateUserInContext = useCallback((data) => setUser((prev) => (prev ? { ...prev, ...data } : prev)), []);

  // Memoised so consumers only re-render when something they use actually changes
  const value = useMemo(
    () => ({ user, setUser: updateUserInContext, login, signup, logout, loadingAuth }),
    [user, updateUserInContext, login, signup, logout, loadingAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
