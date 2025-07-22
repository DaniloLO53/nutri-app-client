import type { AvailableNutritionist } from '../types/schedule';
import { apiClient } from './config/axiosConfig';

// Define os parâmetros de busca que podem ser enviados
export interface AvailableNutritionistSearchParams {
  nutritionistName?: string;
  ibgeApiCity?: string;
  ibgeApiState?: string;
  acceptsRemote?: boolean;
}

export const searchAvailableNutritionistsApi = (params: AvailableNutritionistSearchParams) => {
  const queryParams = new URLSearchParams();

  if (params.nutritionistName) {
    queryParams.append('nutritionistName', params.nutritionistName);
  }
  if (params.ibgeApiCity) {
    queryParams.append('ibgeApiCity', params.ibgeApiCity);
  }

  if (params.ibgeApiState) {
    queryParams.append('ibgeApiState', params.ibgeApiState);
  }

  if (params.acceptsRemote) {
    queryParams.append('acceptsRemote', 'true');
  }

  return apiClient.get<AvailableNutritionist[]>(`/nutritionists/search?${queryParams.toString()}`);
};
