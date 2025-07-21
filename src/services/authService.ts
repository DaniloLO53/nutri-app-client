import {
  UserRole,
  type UserSignInDTO,
  type UserSignUpDTO,
} from '../types/user';
import { apiClient } from './config/axiosConfig';

export const registerApi = (userData: UserSignUpDTO) => {
  return apiClient.post('/auth/signup/patient', userData);
};

export const signInApi = (userData: UserSignInDTO) => {
  const { role } = userData;
  const userType =
    role === UserRole.ROLE_NUTRITIONIST ? 'nutritionist' : 'patient';
  const endpoint = `/auth/signin/${userType}`;

  return apiClient.post(endpoint, userData);
};

export const signOutApi = () => {
  return apiClient.post('/signout');
};

export const checkAuthApi = () => {
  return apiClient.get('/me');
};
