import { AbsensiData, CheckInDto, CheckOutDto } from '../types/absensi';
import { apiClient } from './api';

export const absensiService = {
  getTodayStatus: async (): Promise<AbsensiData | null> => {
    const response = await apiClient.get('/absensi/today');
    return response.data;
  },

  getMyAbsensi: async (
    month?: number,
    year?: number,
  ): Promise<AbsensiData[]> => {
    const response = await apiClient.get('/absensi/me', {
      params: { month, year },
    });
    return response.data;
  },

  checkIn: async (data: CheckInDto): Promise<AbsensiData> => {
    const response = await apiClient.post('/absensi/check-in', data);
    return response.data;
  },

  checkOut: async (data: CheckOutDto): Promise<AbsensiData> => {
    const response = await apiClient.patch('/absensi/check-out', data);
    return response.data;
  },
};