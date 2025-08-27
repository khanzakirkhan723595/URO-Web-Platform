// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../services/api'; // Your configured axios instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      console.log('AuthContext: Starting to check user status on mount/refresh...');
      setLoadingAuth(true);
      try {
        console.log('AuthContext: Making API call to /users/me');
        const response = await apiClient.get('/users/me');
        console.log('AuthContext: Response from /users/me:', response);
        
        if (response.data.status === 'success' && response.data.data.user) {
          console.log('AuthContext: User data received from /me, setting user:', response.data.data.user);
          setUser(response.data.data.user);
        } else {
          // This might happen if /me returns success but no user for some reason (unlikely with protect middleware)
          console.log('AuthContext: /users/me call successful but no user data found. Setting user to null.');
          setUser(null);
        }
      } catch (error) {
        console.log('AuthContext: Error fetching user status from /users/me.');
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log('AuthContext: Error response data:', error.response.data);
          console.log('AuthContext: Error response status:', error.response.status);
        } else if (error.request) {
          // The request was made but no response was received
          console.log('AuthContext: No response received for /users/me:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('AuthContext: Error setting up /users/me request:', error.message);
        }
        setUser(null);
      } finally {
        console.log('AuthContext: Finished checking user status. LoadingAuth set to false.');
        setLoadingAuth(false);
      }
    };
    checkUserStatus();
  }, []); // Empty dependency array ensures this runs only once on mount

  const login = async (email, password) => {
    console.log('AuthContext: Attempting login...');
    setLoadingAuth(true);
    try {
      const response = await apiClient.post('/users/login', { email, password });
      if (response.data.status === 'success') {
        console.log('AuthContext: Login successful, setting user:', response.data.data.user);
        setUser(response.data.data.user);
        setLoadingAuth(false);
        return response.data.data.user;
      }
      // If status is not 'success' but no error was thrown by axios (e.g. backend returns 200 with fail status)
      // This part might not be reached if backend sends proper error codes for login failure.
      // throw new Error(response.data.message || 'Login attempt failed.');
    } catch (error) {
      setLoadingAuth(false);
      console.error('AuthContext: Login failed:', error.response ? error.response.data : error.message);
      throw error.response?.data || new Error('Login failed due to an unexpected error.');
    }
  };

  const signup = async (name, email, password) => {
    console.log('AuthContext: Attempting signup...');
    setLoadingAuth(true);
    try {
      const response = await apiClient.post('/users/signup', { name, email, password });
      if (response.data.status === 'success') {
        console.log('AuthContext: Signup successful, setting user:', response.data.data.user);
        setUser(response.data.data.user);
        setLoadingAuth(false);
        return response.data.data.user;
      }
    } catch (error) {
      setLoadingAuth(false);
      console.error('AuthContext: Signup failed:', error.response ? error.response.data : error.message);
      throw error.response?.data || new Error('Signup failed due to an unexpected error.');
    }
  };

  const logout = async () => {
    console.log('AuthContext: Attempting logout...');
    setLoadingAuth(true);
    try {
      await apiClient.get('/users/logout');
      console.log('AuthContext: Logout successful, clearing user.');
      setUser(null);
    } catch (error) {
      console.error('AuthContext: Logout API call failed:', error.response ? error.response.data : error.message);
      // Still clear user on frontend for better UX, even if backend call has issues
      setUser(null);
    } finally {
      setLoadingAuth(false);
    }
  };
  
  const updateUserInContext = (updatedUserData) => {
    console.log('AuthContext: Updating user in context:', updatedUserData);
    setUser(prevUser => ({ ...prevUser, ...updatedUserData }));
  };

  return (
    <AuthContext.Provider value={{ user, setUser: updateUserInContext, login, signup, logout, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
