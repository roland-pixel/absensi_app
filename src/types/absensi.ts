// src/types/absensi.ts

export interface CheckInDto {
  latitude: number;
  longitude: number;
  nfc_uid: string;
  device_info?: string;
}

export interface CheckOutDto {
  latitude: number;
  longitude: number;
  device_info?: string;
}

export interface AbsensiData {
  id: string;
  user_id: string;
  tanggal: string; // format YYYY-MM-DD
  waktu_masuk?: string; // ISO string atau HH:mm:ss
  waktu_keluar?: string;
  status_masuk?: 'TEPAT_WAKTU' | 'TERLAMBAT' | string;
  latitude_masuk?: number;
  longitude_masuk?: number;
  latitude_keluar?: number;
  longitude_keluar?: number;
  nfc_uid?: string;
  device_info?: string;
}