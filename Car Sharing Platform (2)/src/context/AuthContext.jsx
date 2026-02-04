import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import * as userService from '../Service/userservice';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize auth from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    let parsedUser = null;
    if (storedUser) {
      try {
        parsedUser = JSON.parse(storedUser);
      } catch (e) {
        parsedUser = null;
      }
    }
    if (storedToken && parsedUser) {
      setToken(storedToken);
      setUser(parsedUser);
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  // Setup axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await userService.refreshAccessToken(refreshToken);
            
            const { accessToken, refreshToken: newRefreshToken } = response.data;
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            
            setToken(accessToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            
            return axios(originalRequest);
          } catch (err) {
            // Refresh failed, logout user
            logout();
            return Promise.reject(err);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userService.registerUser(userData);
      console.log('Registration response:', response);
      const { user: newUser, accessToken, refreshToken } = response.data;

      // Store tokens and user data
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      setToken(accessToken);
      setUser(newUser);

      return { success: true, user: newUser };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
   console.log('Attempting login with credentials:', credentials);
    try {
      const response = await userService.loginUser(credentials);
      const { user: loggedInUser, accessToken, refreshToken } = response.data;

      // Store tokens and user data
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      setToken(accessToken);
      setUser(loggedInUser);

      return { success: true, user: loggedInUser };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
      console.log('Login attempt finished');
    }
  };

  const logout = async () => {
    console.log('Logging out user');
    try {
      await userService.logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Clear axios default header
      delete axios.defaults.headers.common['Authorization'];

      setToken(null);
      setUser(null);
      console.log('User logged out successfully');
    }

  };

  const updateProfile = async (userId, profileData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await userService.updateUserProfile(userId, profileData);
      const updatedUser = response.data.user;

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPhone = async (userId, phone) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await userService.sendPhoneOTP(userId, phone);
      return { success: true, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send OTP';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const confirmPhoneOTP = async (userId, otp) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await userService.verifyPhoneOTP(userId, otp);
      const updatedUser = response.data.user;
      console.log(`Phone OTP verified, updated user:`, updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'OTP verification failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (userId, email) => {
    setIsLoading(true);
    setError(null);

    try {
        console.log(`Sending email verification for userId: ${userId}, email: ${email}`);
      const response = await userService.sendEmailVerification(userId, email);
      return { success: true, message: response.data.message };
    } catch (err) {
        console.error('Error sending email verification:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send email verification';
      setError(errorMessage);
      console.log(`Returning failure from verifyEmail ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const confirmEmailVerification = async (userId, token) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await userService.verifyEmail(userId, token);
      const updatedUser = response.data.user;

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Email verification failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!token,
    register,
    login,
    logout,
    updateProfile,
    verifyPhone,
    confirmPhoneOTP,
    verifyEmail,
    confirmEmailVerification,
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
