import type { AppointmentStatusEnum } from './appointment';

interface PatientOrNutritionist {
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

export interface CalendarNutritionistAppointment {
  type: EventTypeValue;
  id: string;
  patient?: PatientOrNutritionist;
  startTime: string; // Formato ISO 8601: "2025-07-21T10:00:00Z"
  durationMinutes: number;
  isRemote: boolean;
  status?: AppointmentStatusEnum;
}

export interface CalendarPatientAppointment {
  type: EventTypeValue;
  id: string;
  nutritionist?: PatientOrNutritionist;
  startTime: string; // Formato ISO 8601: "2025-07-21T10:00:00Z"
  durationMinutes: number;
  isRemote: boolean;
  status?: AppointmentStatusEnum;
}

// O estado para o slice do Redux
export interface ScheduleState {
  schedules: CalendarSchedule[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface AppointmentState {
  appointments: CalendarPatientAppointment[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
