import type { NutritionistAppointment } from '../types/nutritionistsAppointment';
import { type PaginatedResponse } from '../types/pagination';
import type { CalendarPatientAppointment } from '../types/schedule';
import { apiClient } from './config/axiosConfig';

export const fetchPatientAppointmentsApi = (page: number, size: number) => {
  return apiClient.get<PaginatedResponse<CalendarPatientAppointment>>(
    `/patients/me/appointments?page=${page}&size=${size}`,
  );
};

export const fetchNutritionistAppointmentsApi = (page: number, size: number) => {
  return apiClient.get<PaginatedResponse<NutritionistAppointment>>(
    `/nutritionists/me/appointments?page=${page}&size=${size}`,
  );
};

export const cancelAppointmentByNutritionistApi = (appointmentId: string) => {
  return apiClient.post(`/nutritionists/me/appointments/${appointmentId}`);
};

export const requestAppointmentConfirmationApi = (appointmentId: string) => {
  return apiClient.patch(`/appointments/${appointmentId}/request-confirmation`);
};

export const confirmAppointmentApi = (appointmentId: string) => {
  return apiClient.patch(`/appointments/${appointmentId}/confirm`);
};

export const finishAppointmentApi = (
  appointmentId: string,
  { attended }: { attended: boolean },
) => {
  return apiClient.patch(`/appointments/${appointmentId}/finish?attended=${attended}`);
};

export const cancelAppointmentByPatientApi = (appointmentId: string) => {
  return apiClient.post(`/patients/me/appointments/${appointmentId}`);
};

export interface CreateAppointmentPayload {
  patientId: string;
  isRemote: boolean;
}

// Função para criar uma consulta preenchendo uma disponibilidade existente
export const createAppointmentApi = (scheduleId: string, payload: CreateAppointmentPayload) => {
  return apiClient.post(`/appointments/schedules/${scheduleId}`, payload);
};
