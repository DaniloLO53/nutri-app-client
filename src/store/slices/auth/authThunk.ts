import { createAsyncThunk } from '@reduxjs/toolkit';
import type {
  AuthenticatedUser,
  UserSignInDTO,
  UserSignUpDTO,
  UserWithoutId,
} from '../../../types/user';
import { checkAuthApi, registerApi, signInApi, signOutApi } from '../../../services/authService';
import axios from 'axios';

type Options = {
  // Because "rejectWithValue" receives a string
  rejectValue: string;
};

interface BackendError {
  message: string;
}

// It's the identity for the specific redux action. It helps to trace the action with this prefix
const registerPatientActionTypePrefix = 'auth/signup/patient';

export const registerPatient = createAsyncThunk<
  UserWithoutId, // returned data
  UserSignUpDTO, // data passed as argument
  Options
>(registerPatientActionTypePrefix, async (userData: UserSignUpDTO, thunkAPI) => {
  try {
    const response = await registerApi(userData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data as BackendError;

      if (serverError && serverError.message) {
        return thunkAPI.rejectWithValue(serverError.message);
      }
    }

    return thunkAPI.rejectWithValue('Erro ao registrar usuário');
  }
});

export const signInUser = createAsyncThunk<AuthenticatedUser, UserSignInDTO, Options>(
  'auth/signin',
  async (userData: UserSignInDTO, thunkAPI) => {
    try {
      const response = await signInApi(userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error.response?.data as BackendError;

        if (serverError && serverError.message) {
          return thunkAPI.rejectWithValue(serverError.message);
        }
      }

      return thunkAPI.rejectWithValue('Erro ao autenticar usuário');
    }
  },
);

export const signOutUser = createAsyncThunk('auth/signout/user', async (_, thunkAPI) => {
  try {
    await signOutApi();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data as BackendError;

      if (serverError && serverError.message) {
        return thunkAPI.rejectWithValue(serverError.message);
      }
    }

    return thunkAPI.rejectWithValue('Erro ao fazer logout');
  }
});

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      // O cookie será enviado automaticamente pelo axios se configurado com withCredentials
      const response = await checkAuthApi();
      return response.data; // Retorna os dados do usuário
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error.response?.data as BackendError;

        if (serverError && serverError.message) {
          return rejectWithValue(serverError.message);
        }
      }

      return rejectWithValue('Sessão inválida ou expirada');
    }
  },
);
