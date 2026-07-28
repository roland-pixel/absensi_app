// src/services/divisi.ts
import { CreateDivisiDto, Divisi, UpdateDivisiDto } from '../types/divisi';
import { apiClient } from './api';

export const divisiService = {
  // Ambil semua data divisi
  getAll: async (): Promise<Divisi[]> => {
    const response = await apiClient.get<Divisi[]>('/divisi');
    return response.data;
  },

  // Ambil detail 1 divisi
  getById: async (id: string): Promise<Divisi> => {
    const response = await apiClient.get<Divisi>(`/divisi/${id}`);
    return response.data;
  },

  // Tambah divisi baru
  create: async (dto: CreateDivisiDto): Promise<Divisi> => {
    const response = await apiClient.post<Divisi>('/divisi', dto);
    return response.data;
  },

  // Edit divisi
  update: async (id: string, dto: UpdateDivisiDto): Promise<Divisi> => {
    const response = await apiClient.patch<Divisi>(`/divisi/${id}`, dto);
    return response.data;
  },

  // Hapus divisi
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/divisi/${id}`);
  },
};