import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from './api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      authAPI.verify(storedToken)
        .then(data => {
          if (data.user) {
            setUser(data.user);
          } else {
            localStorage.removeItem('token');
          }
        })
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    if (response.token && response.user) {
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response.user);
      return response;
    }
    throw new Error(response.error || 'Login failed');
  };

  const register = async (data) => {
    const response = await authAPI.register(data);
    if (response.token && response.user) {
      localStorage.setItem('token', response.token);
      setToken(response.token);
      setUser(response.user);
      return response;
    }
    throw new Error(response.error || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
