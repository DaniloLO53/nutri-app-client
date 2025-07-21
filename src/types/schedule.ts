import type { AppointmentStatusValue } from './appointment';

interface Patient {
  id: string;
  name: string;
  email: string;
}

export interface Schedule {
  id: string;
  nutritionistName: string;
  ibgeApiCity: string;
  ibgeApiState: string;
  acceptsRemote: string;
}

export interface ScheduleSearchState {
  schedules: Schedule[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export const EventType = {
  APPOINTMENT: 'APPOINTMENT',
  SCHEDULE: 'SCHEDULE',
} as const;

export type EventTypeEnum = keyof typeof EventType;
export type EventTypeValue = (typeof EventType)[keyof typeof EventType];

export interface CalendarSchedule {
  type: EventTypeValue;
  id: string;
  startTime: string; // Formato ISO 8601: "2025-07-21T10:00:00Z"
  durationMinutes: number;
}

export interface CalendarAppointment {
  type: EventTypeValue;
  id: string;
  patient?: Patient;
  startTime: string; // Formato ISO 8601: "2025-07-21T10:00:00Z"
  durationMinutes: number;
  status?: AppointmentStatusValue;
}

// O estado para o slice do Redux
export interface ScheduleState {
  schedules: CalendarSchedule[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface AppointmentState {
  appointments: CalendarAppointment[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface CreateAppointmentSuccessPayload {
  /** O novo objeto de consulta retornado pelo backend. */
  newAppointment: CalendarAppointment;

  /** O ID da disponibilidade que foi substituída pela nova consulta. */
  oldscheduleId: string;
}
