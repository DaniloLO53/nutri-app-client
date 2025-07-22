import type { StartLocalDateTime } from '../store/slices/schedules/scheduleSlice';
import type { NutritionistProfile } from '../types/nutritionistProfile';
import type { CalendarSchedule } from '../types/schedule';
import { apiClient } from './config/axiosConfig';

export const getNutritionistProfileApi = () => {
  return apiClient.get<NutritionistProfile>('/nutritionists/me');
};

export const updateNutritionistProfileApi = (profileData: Partial<NutritionistProfile>) => {
  return apiClient.put<NutritionistProfile>('/nutritionists/me', profileData);
};

export const fetchOwnNutritionistScheduleApi = (startDate: string, endDate: string) => {
  const params = new URLSearchParams({ startDate, endDate });
  return apiClient.get<CalendarSchedule[]>(`/nutritionists/me/schedules?${params.toString()}`);
};

export const fetchNutritionistScheduleApi = (
  startDate: string,
  endDate: string,
  nutritionistId: string,
) => {
  const params = new URLSearchParams({ startDate, endDate });
  return apiClient.get<CalendarSchedule[]>(
    `/nutritionists/${nutritionistId}/schedules?${params.toString()}`,
  );
};

export const createScheduleApi = (data: {
  startLocalDateTime: StartLocalDateTime;
  durationMinutes: number;
}) => {
  return apiClient.post<CalendarSchedule>('/nutritionists/me/schedules', data);
};

export const deleteScheduleApi = (scheduleId: string) => {
  return apiClient.delete(`/nutritionists/me/schedules/${scheduleId}`);
};
