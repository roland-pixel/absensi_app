// src/types/tipe-cuti.ts

export interface TipeCuti {
  id: string;
  nama_tipe: string;
  kuota_per_tahun: number;
  perlu_lampiran: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTipeCutiDto {
  nama_tipe: string;
  kuota_per_tahun: number;
  perlu_lampiran?: boolean;
}

export interface UpdateTipeCutiDto {
  nama_tipe?: string;
  kuota_per_tahun?: number;
  perlu_lampiran?: boolean;
}