// src/context/auth-context.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { storage } from '../utils/storage';
import { LoginDto, AuthUser, UserRole } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<UserRole>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper sederhana untuk decode payload JWT (tanpa library tambahan)
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cek apakah user sudah pernah login sebelumnya
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const token = await storage.getToken();
        const savedUser = await storage.getUserData();

        if (token && savedUser) {
          setUser(savedUser);
        }
      } catch (e) {
        console.error('Gagal memuat auth session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const login = async (dto: LoginDto): Promise<UserRole> => {
    // 1. Panggil endpoint /api/v1/auth/login
    const res = await authService.login(dto);
    const token = res.access_token;

    // 2. Decode payload dari JWT untuk mendapatkan role dan email
    const decoded = parseJwt(token);
    const role: UserRole = decoded?.role || 'PEGAWAI';

    const userData: AuthUser = {
      email: dto.email,
      role: role,
      id: decoded?.sub,
    };

    // 3. Simpan token & data user ke Secure Store
    await storage.setToken(token);
    await storage.setUserData(userData);

    setUser(userData);
    return role;
  };

  const logout = async () => {
    await storage.clearAuthSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};