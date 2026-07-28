// src/types/divisi.ts

export interface Divisi {
  id: string;
  nama_divisi: string;
  kode_divisi: string;
  pimpinan_id?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDivisiDto {
  nama_divisi: string;
  kode_divisi: string;
  pimpinan_id?: string;
}

export interface UpdateDivisiDto {
  nama_divisi?: string;
  kode_divisi?: string;
  pimpinan_id?: string;
}