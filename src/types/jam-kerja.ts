// src/types/jam-kerja.ts

export interface JamKerja {
  id: string;
  nama_shift: string;
  jam_masuk: string;
  jam_keluar: string;
  toleransi_terlambat_menit: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateJamKerjaDto {
  nama_shift: string;
  jam_masuk: string;
  jam_keluar: string;
  toleransi_terlambat_menit?: number;
}

export interface UpdateJamKerjaDto {
  nama_shift?: string;
  jam_masuk?: string;
  jam_keluar?: string;
  toleransi_terlambat_menit?: number;
}