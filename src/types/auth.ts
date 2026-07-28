// src/types/auth.ts

// Enum Role sesuai spesifikasi OpenAPI
export type UserRole = 'ADMIN' | 'PEGAWAI' | 'PIMPINAN';

// Payload LoginDto
export interface LoginDto {
  email: string;
  password: string;
}

// Response dari /api/v1/auth/login
export interface LoginResponse {
  access_token: string;
}

// Struktur data user yang di-decode dari JWT atau disimpan di state
export interface AuthUser {
  id?: string;
  email: string;
  role: UserRole;
  nama_lengkap?: string;
}