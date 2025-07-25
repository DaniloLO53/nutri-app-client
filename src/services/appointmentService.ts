import type { NutritionistAppointment } from '../types/nutritionistsAppointment';
import type { CalendarPatientAppointment } from '../types/schedule';
import { apiClient } from './config/axiosConfig';

export const fetchPatientAppointmentsApi = () => {
  return apiClient.get<CalendarPatientAppointment[]>('/patients/me/appointments');
};

export const fetchNutritionistAppointmentsApi = () => {
  return apiClient.get<NutritionistAppointment[]>('/nutritionists/me/appointments');
};

export const cancelAppointmentByNutritionistApi = (appointmentId: string) => {
  return apiClient.post(`/nutritionists/me/appointments/${appointmentId}`);
};

export const requestAppointmentConfirmationApi = (appointmentId: string) => {
  return apiClient.post(`/appointments/${appointmentId}/request-confirmation`);
};

export const confirmAppointmentApi = (appointmentId: string) => {
  return apiClient.post(`/appointments/${appointmentId}/confirm`);
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
