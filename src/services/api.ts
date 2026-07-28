  // src/services/api.ts
  import axios from 'axios';
  import { LoginDto, LoginResponse } from '../types/auth';
  import { storage } from '../utils/storage';

  // Ganti IP ini sesuai IP lokal server NestJS kamu (Port default NestJS biasanya 3000)
  const BASE_URL = 'https://absensiapi.kharisraihan.my.id/api/v1';

  export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor: Otomatis tempelkan JWT Token pada setiap request jika ada
  apiClient.interceptors.request.use(async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  // Service khusus Autentikasi
  export const authService = {
    login: async (dto: LoginDto): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>('/auth/login', dto);
      return response.data;
    },
  };