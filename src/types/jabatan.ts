// src/types/jabatan.ts
import { Divisi } from './divisi';

export interface Jabatan {
  id: string;
  nama_jabatan: string;
  divisi_id: string;
  divisi?: Divisi; // Relasi divisi jika dikembalikan oleh backend
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateJabatanDto {
  nama_jabatan: string;
  divisi_id: string;
}

export interface UpdateJabatanDto {
  nama_jabatan?: string;
  divisi_id?: string;
}