// src/types/kantor.ts

export interface Kantor {
  id: string;
  nama_kantor: string;
  alamat: string;
  latitude: number;
  longitude: number;
  radius_meter: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateKantorDto {
  nama_kantor: string;
  alamat: string;
  latitude: number;
  longitude: number;
  radius_meter?: number;
}

export interface UpdateKantorDto {
  nama_kantor?: string;
  alamat?: string;
  latitude?: number;
  longitude?: number;
  radius_meter?: number;
}