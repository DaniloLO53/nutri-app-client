import type { PaginatedResponse } from './pagination';

export interface NutritionistPatientCreate {
  id: string;
  patientId: string;
}

export interface NutritionistPatient {
  id: string;
  name: string;
  profilePictureUrl: string;
  lastAppointmentDate: string;
}

export interface NutritionistScheduledPatient {
  id: string;
  name: string;
}

export interface NutritionistScheduledPatientState {
  nutritionistScheduledPatientsPage: PaginatedResponse<NutritionistScheduledPatient> | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface NutritionistPatientState {
  nutritionistPatientsPage: PaginatedResponse<NutritionistPatient> | null;
  createdPatient?: NutritionistPatientCreate | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
