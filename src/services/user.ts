// src/services/user.ts
import { CreateUserDto, ResetPasswordDto, UpdateUserDto, User } from '../types/user';
import { apiClient } from './api';

export const userService = {
  // Ambil seluruh data user
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },

  // Detail 1 user
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  // Tambah user baru
  create: async (dto: CreateUserDto): Promise<User> => {
    const response = await apiClient.post<User>('/users', dto);
    return response.data;
  },

  // Update status user (is_active)
  update: async (id: string, dto: UpdateUserDto): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}`, dto);
    return response.data;
  },

  // Reset password user
  resetPassword: async (id: string, dto: ResetPasswordDto): Promise<void> => {
    await apiClient.patch(`/users/${id}/reset-password`, dto);
  },

  // Hapus user
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};