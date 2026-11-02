import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient, { setAuthToken } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);

  // Restore persisted auth session on app startup
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedToken = window.localStorage.getItem('smartbox_token');
        const savedUser = window.localStorage.getItem('smartbox_user');
        if (savedToken && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setToken(savedToken);
          setUser(parsedUser);
          setAuthToken(savedToken);
        }
      }
    } catch (e) {
      console.warn('Could not restore auth token from storage:', e.message);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data.success) {
        const { user: userData, token: userToken } = response.data.data;
        setUser(userData);
        setToken(userToken);
        setAuthToken(userToken);

        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('smartbox_token', userToken);
          window.localStorage.setItem('smartbox_user', JSON.stringify(userData));
        }

        return { success: true };
      } else {
        setError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể đăng nhập. Vui lòng kiểm tra lại kết nối và tài khoản.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email, password, fullName) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/register', { email, password, fullName });
      if (response.data.success) {
        const { user: userData, token: userToken } = response.data.data;
        setUser(userData);
        setToken(userToken);
        setAuthToken(userToken);

        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('smartbox_token', userToken);
          window.localStorage.setItem('smartbox_user', JSON.stringify(userData));
        }

        return { success: true };
      } else {
        setError(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể đăng ký. Vui lòng kiểm tra lại thông tin.';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('smartbox_token');
      window.localStorage.removeItem('smartbox_user');
    }
  };

  const updateSettings = async (settings) => {
    try {
      const response = await apiClient.put('/users/settings', settings);
      if (response.data.success) {
        setUser((prev) => {
          const updated = { ...prev, settings: response.data.data };
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('smartbox_user', JSON.stringify(updated));
          }
          return updated;
        });
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await apiClient.put('/users/change-password', {
        currentPassword,
        newPassword
      });
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Đổi mật khẩu thất bại'
      };
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await apiClient.get('/users/profile');
      if (res.data.success) {
        setUser(res.data.data);
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('smartbox_user', JSON.stringify(res.data.data));
        }
      }
    } catch (err) {
      console.warn('Failed to refresh profile:', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        isInitializing,
        error,
        login,
        register,
        logout,
        updateSettings,
        changePassword,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
