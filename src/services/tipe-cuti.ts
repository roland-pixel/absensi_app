// src/services/tipe-cuti.ts
import { CreateTipeCutiDto, TipeCuti, UpdateTipeCutiDto } from '../types/tipe-cuti';
import { apiClient } from './api';

export const tipeCutiService = {
  // Ambil semua daftar tipe cuti
  getAll: async (): Promise<TipeCuti[]> => {
    const response = await apiClient.get<TipeCuti[]>('/tipe-cuti');
    return response.data;
  },

  // Detail 1 tipe cuti
  getById: async (id: string): Promise<TipeCuti> => {
    const response = await apiClient.get<TipeCuti>(`/tipe-cuti/${id}`);
    return response.data;
  },

  // Tambah tipe cuti baru
  create: async (dto: CreateTipeCutiDto): Promise<TipeCuti> => {
    const response = await apiClient.post<TipeCuti>('/tipe-cuti', dto);
    return response.data;
  },

  // Update data tipe cuti
  update: async (id: string, dto: UpdateTipeCutiDto): Promise<TipeCuti> => {
    const response = await apiClient.patch<TipeCuti>(`/tipe-cuti/${id}`, dto);
    return response.data;
  },

  // Hapus tipe cuti
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tipe-cuti/${id}`);
  },
};