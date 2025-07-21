import type { CalendarAppointment } from './schedule';

export const AppointmentStatus = {
  AGENDADO: 'AGENDADO',
  CONFIRMADO: 'CONFIRMADO',
  CONCLUIDO: 'CONCLUIDO',
  CANCELADO: 'CANCELADO',
  NAO_COMPARECEU: 'NAO_COMPARECEU',
} as const;

export type AppointmentStatusEnum = keyof typeof AppointmentStatus;
export type AppointmentStatusValue =
  (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

// export interface Appointment {
//   id: string;
//   nutritionistName: string;
//   isRemote: boolean;
//   durationMinutes: number;
//   startTime: Date;
//   status: AppointmentStatusEnum;
// }

export interface AppointmentState {
  appointments: CalendarAppointment[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
