// src/types/user.ts

export type UserRole = 'ADMIN' | 'PEGAWAI' | 'PIMPINAN';

export interface User {
  id: string;
  nik: string;
  nama_lengkap: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  nfc_card_id?: string;
  divisi_id?: string;
  jabatan_id?: string;
  kantor_id?: string;
  divisi?: { id: string; nama_divisi: string };
  jabatan?: { id: string; nama_jabatan: string };
  kantor?: { id: string; nama_kantor: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  nik: string;
  nama_lengkap: string;
  email: string;
  password: string;
  role?: UserRole;
  nfc_card_id?: string;
  divisi_id?: string;
  jabatan_id?: string;
  kantor_id?: string;
}

export interface UpdateUserDto {
  nik?: string;
  nama_lengkap?: string;
  email?: string;
  role?: UserRole;
  is_active?: boolean;
  nfc_card_id?: string;
  divisi_id?: string;
  jabatan_id?: string;
  kantor_id?: string;
}

export interface ResetPasswordDto {
  new_password: string;
}