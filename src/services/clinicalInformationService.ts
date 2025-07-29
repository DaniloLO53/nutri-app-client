import type { ClinicalInformationForm, MasterData } from '../types/clinicalInformation';
import { apiClient } from './config/axiosConfig';

export const fetchMasterDataApi = () => {
  return apiClient.get<MasterData>(`/clinical-information/master-data`);
};

export const fetchClinicalInformationApi = (payload: { patientId: string }) => {
  return apiClient.get<ClinicalInformationForm>(
    `/patients/${payload.patientId}/clinical-information`,
  );
};

export const saveClinicalInformationApi = (patientId: string, payload: ClinicalInformationForm) => {
  return apiClient.post(`/patients/${patientId}/clinical-information`, payload);
};
