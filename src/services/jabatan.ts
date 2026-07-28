// src/services/jabatan.ts
import { CreateJabatanDto, Jabatan, UpdateJabatanDto } from '../types/jabatan';
import { apiClient } from './api';

export const jabatanService = {
  // Ambil semua jabatan
  getAll: async (): Promise<Jabatan[]> => {
    const response = await apiClient.get<Jabatan[]>('/jabatan');
    return response.data;
  },

  // Ambil jabatan berdasarkan divisi
  getByDivisi: async (divisiId: string): Promise<Jabatan[]> => {
    const response = await apiClient.get<Jabatan[]>(`/jabatan/divisi/${divisiId}`);
    return response.data;
  },

  // Detail 1 jabatan
  getById: async (id: string): Promise<Jabatan> => {
    const response = await apiClient.get<Jabatan>(`/jabatan/${id}`);
    return response.data;
  },

  // Tambah jabatan baru
  create: async (dto: CreateJabatanDto): Promise<Jabatan> => {
    const response = await apiClient.post<Jabatan>('/jabatan', dto);
    return response.data;
  },

  // Edit jabatan
  update: async (id: string, dto: UpdateJabatanDto): Promise<Jabatan> => {
    const response = await apiClient.patch<Jabatan>(`/jabatan/${id}`, dto);
    return response.data;
  },

  // Hapus jabatan
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/jabatan/${id}`);
  },
};