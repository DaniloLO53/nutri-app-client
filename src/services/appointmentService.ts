import type { NutritionistAppointment } from '../types/nutritionistsAppointment';
import type { CalendarPatientAppointment } from '../types/schedule';
import { apiClient } from './config/axiosConfig';

export const fetchFutureAppointmentsApi = () => {
  return apiClient.get<CalendarPatientAppointment[]>('/patients/me/appointments');
};

export const fetchNutritionistAppointmentsApi = () => {
  return apiClient.get<NutritionistAppointment[]>('/nutritionists/me/appointments');
};

export const deleteAppointmentApi = (appointmentId: string) => {
  return apiClient.delete(`/nutritionists/me/appointments/${appointmentId}`);
};

export interface CreateAppointmentPayload {
  patientId: string;
  isRemote: boolean;
}

// Função para criar uma consulta preenchendo uma disponibilidade existente
export const createAppointmentApi = (scheduleId: string, payload: CreateAppointmentPayload) => {
  console.log(scheduleId);
  return apiClient.post(`/appointments/schedules/${scheduleId}`, payload);
};
