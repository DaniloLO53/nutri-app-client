import { type AppointmentStatusValue } from './appointment';
import type { EventTypeValue } from './schedule';

export interface AppointmentPatient {
  id: string;
  name: string;
  email: string;
}

export interface NutritionistAppointment {
  id: string;
  isRemote: boolean;
  patient: AppointmentPatient;
  startTime: string; // Formato ISO 8601
  durationMinutes: number;
  address: string;
  type: EventTypeValue;
  status: AppointmentStatusValue;
}

// O estado para o slice do Redux
export interface NutritionistAppointmentState {
  appointments: NutritionistAppointment[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
