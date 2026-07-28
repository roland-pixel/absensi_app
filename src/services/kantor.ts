// src/services/kantor.ts
import { CreateKantorDto, Kantor, UpdateKantorDto } from '../types/kantor';
import { apiClient } from './api';

export const kantorService = {
  // Ambil semua daftar kantor
  getAll: async (): Promise<Kantor[]> => {
    const response = await apiClient.get<Kantor[]>('/kantor');
    return response.data;
  },

  // Detail 1 kantor
  getById: async (id: string): Promise<Kantor> => {
    const response = await apiClient.get<Kantor>(`/kantor/${id}`);
    return response.data;
  },

  // Tambah kantor baru
  create: async (dto: CreateKantorDto): Promise<Kantor> => {
    const response = await apiClient.post<Kantor>('/kantor', dto);
    return response.data;
  },

  // Update data kantor
  update: async (id: string, dto: UpdateKantorDto): Promise<Kantor> => {
    const response = await apiClient.patch<Kantor>(`/kantor/${id}`, dto);
    return response.data;
  },

  // Hapus kantor
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/kantor/${id}`);
  },
};