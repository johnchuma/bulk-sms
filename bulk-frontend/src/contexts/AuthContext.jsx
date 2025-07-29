import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUserType = localStorage.getItem('userType');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUserType && storedUser) {
        try {
          setToken(storedToken);
          setUserType(storedUserType);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid
          await api.get('/auth/verify');
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password, loginType = 'client') => {
    try {
      let endpoint;
      switch (loginType) {
        case 'admin':
          endpoint = '/auth/admin/login';
          break;
        case 'client':
          endpoint = '/auth/client/login';
          break;
        case 'client_user':
          endpoint = '/auth/client-user/login';
          break;
        default:
          throw new Error('Invalid login type');
      }

      const response = await api.post(endpoint, { email, password });
      const { user: userData, token: userToken, userType: userUserType } = response.data.data;

      setUser(userData);
      setUserType(userUserType);
      setToken(userToken);

      // Store in localStorage
      localStorage.setItem('token', userToken);
      localStorage.setItem('userType', userUserType);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, userType: userUserType };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    userType,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: userType === 'admin',
    isClient: userType === 'client' || userType === 'client_user'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
