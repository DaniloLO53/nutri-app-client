import type { Location } from '../types/location';
import { apiClient } from './config/axiosConfig';

export const fetchLocationsApi = () => {
  return apiClient.get<Location[]>(`/nutritionists/me/locations`);
};
