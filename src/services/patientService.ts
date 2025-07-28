import type {
  NutritionistPatient,
  NutritionistPatientCreate,
  NutritionistScheduledPatient,
} from '../types/nutritionistPatient';
import type { PaginatedResponse } from '../types/pagination';
import type { PatientSearchResult } from '../types/patient';
import { apiClient } from './config/axiosConfig';

export const searchPatientsByNameApi = (name: string) => {
  return apiClient.get<PatientSearchResult[]>(`/patients/search?name=${name}`);
};

export const fetchNutritionistPatientsApi = (page: number, size: number) => {
  return apiClient.get<PaginatedResponse<NutritionistPatient>>(
    `/nutritionists/me/patients?page=${page}&size=${size}`,
  );
};

export const createNutritionistPatientsApi = (data: { patientId: string }) => {
  return apiClient.post<NutritionistPatientCreate>(`/nutritionists/me/patients`, data);
};

export const searchNutritionistScheduledPatientsApi = (
  name: string,
  page: number,
  size: number,
) => {
  return apiClient.get<PaginatedResponse<NutritionistScheduledPatient>>(
    `/nutritionists/me/patients/scheduled?name=${name ?? ''}&page=${page}&size=${size}`,
  );
};
