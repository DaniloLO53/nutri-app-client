import type { PatientSearchResult } from '../types/patient';
import { apiClient } from './config/axiosConfig';

export const searchPatientsByNameApi = (name: string) => {
  return apiClient.get<PatientSearchResult[]>(`/patients/search?name=${name}`);
};
