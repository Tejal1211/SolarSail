import { create } from 'zustand';
import { authAPI } from '../services/api.js';

/**
 * Zustand Auth Store
 * Manages authentication state globally
 */
export const useAuthStore = create((set, get) => ({
  // State
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),

  // Actions
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  signup: async (email, name, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.signup(email, name, password);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Signup failed';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  googleAuth: async (tokenId) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.googleAuth(tokenId);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Google auth failed';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updateProfile: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.updateProfile(data);
      const { user } = response.data;

      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        loading: false,
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Update failed';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  getCurrentUser: async () => {
    set({ loading: true });
    try {
      const response = await authAPI.getCurrentUser();
      set({ user: response.data.user, loading: false });
      return response.data.user;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));

export default useAuthStore;
