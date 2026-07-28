// src/utils/storage.ts
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'user_access_token';
const USER_DATA_KEY = 'user_data_info';

// Helper internal untuk cek apakah running di web
const isWeb = Platform.OS === 'web';

export const storage = {
  // Simpan Token
  setToken: async (token: string) => {
    if (isWeb) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  },

  // Ambil Token
  getToken: async () => {
    if (isWeb) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  // Hapus Token (Logout)
  removeToken: async () => {
    if (isWeb) {
      localStorage.removeItem(TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  },

  // Simpan info user
  setUserData: async (userData: object) => {
    const jsonValue = JSON.stringify(userData);
    if (isWeb) {
      localStorage.setItem(USER_DATA_KEY, jsonValue);
    } else {
      await SecureStore.setItemAsync(USER_DATA_KEY, jsonValue);
    }
  },

  // Ambil info user
  getUserData: async () => {
    if (isWeb) {
      const data = localStorage.getItem(USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    }
    const data = await SecureStore.getItemAsync(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Clear semua session (Logout)
  clearAuthSession: async () => {
    if (isWeb) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_DATA_KEY);
    }
  },
};