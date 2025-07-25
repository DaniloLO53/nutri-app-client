import type { PaginatedResponse } from './pagination';
import type { CalendarNutritionistAppointment, CalendarPatientAppointment } from './schedule';

export const AppointmentStatus = {
  AGENDADO: 'AGENDADO',
  ESPERANDO_CONFIRMACAO: 'ESPERANDO_CONFIRMACAO',
  CONFIRMADO: 'CONFIRMADO',
  CONCLUIDO: 'CONCLUIDO',
  CANCELADO: 'CANCELADO',
  NAO_COMPARECEU: 'NAO_COMPARECEU',
} as const;

export type AppointmentStatusEnum = keyof typeof AppointmentStatus;
export type AppointmentStatusValue = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export interface AppointmentStateNutritionist {
  appointmentsPage: PaginatedResponse<CalendarNutritionistAppointment> | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface AppointmentStatePatient {
  appointmentsPage: PaginatedResponse<CalendarPatientAppointment> | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
