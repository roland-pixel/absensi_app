// src/services/jam-kerja.ts
import { apiClient } from './api';
import { JamKerja, CreateJamKerjaDto, UpdateJamKerjaDto } from '../types/jam-kerja';

export const jamKerjaService = {
  // Ambil semua data jam kerja
  getAll: async (): Promise<JamKerja[]> => {
    const response = await apiClient.get<JamKerja[]>('/jam-kerja');
    return response.data;
  },

  // Detail 1 jam kerja
  getById: async (id: string): Promise<JamKerja> => {
    const response = await apiClient.get<JamKerja>(`/jam-kerja/${id}`);
    return response.data;
  },

  // Tambah jam kerja
  create: async (dto: CreateJamKerjaDto): Promise<JamKerja> => {
    const response = await apiClient.post<JamKerja>('/jam-kerja', dto);
    return response.data;
  },

  // Update jam kerja
  update: async (id: string, dto: UpdateJamKerjaDto): Promise<JamKerja> => {
    const response = await apiClient.patch<JamKerja>(`/jam-kerja/${id}`, dto);
    return response.data;
  },

  // Hapus jam kerja
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/jam-kerja/${id}`);
  },
};