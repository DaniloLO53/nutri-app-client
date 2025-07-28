import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import type {
  NutritionistPatient,
  NutritionistPatientCreate,
  NutritionistPatientState,
} from '../../../types/nutritionistPatient';
import type { PaginatedResponse } from '../../../types/pagination';
import {
  createNutritionistPatientsApi,
  fetchNutritionistPatientsApi,
} from '../../../services/patientService';

export const fetchNutritionistPatients = createAsyncThunk<
  PaginatedResponse<NutritionistPatient>,
  { page: number; size: number },
  { rejectValue: string }
>('nutritionist/patients/fetchAll', async ({ page, size }, { rejectWithValue }) => {
  try {
    const response = await fetchNutritionistPatientsApi(page, size);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    console.log({ error });
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao buscar paciente.');
  }
});

export const createNutritionistPatient = createAsyncThunk<
  NutritionistPatientCreate,
  { patientId: string },
  { rejectValue: string }
>('nutritionist/patients/create', async ({ patientId }, { rejectWithValue }) => {
  try {
    const response = await createNutritionistPatientsApi({ patientId });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    console.log({ error });
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao criar pacientes.');
  }
});

const initialState: NutritionistPatientState = {
  nutritionistPatientsPage: null,
  createdPatient: null,
  status: 'idle',
  error: null,
};

const nutritionistPatientsSlice = createSlice({
  name: 'nutritionistPatients',
  initialState,
  reducers: {
    clearNutritionistPatients: (state) => {
      state.nutritionistPatientsPage = null;
      state.status = 'idle';
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET NUTRIIONIST PATIENTS
      .addCase(fetchNutritionistPatients.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNutritionistPatients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Se já houver consultas e não for a primeira página, anexe os novos resultados
        if (state.nutritionistPatientsPage && action.payload.number > 0) {
          state.nutritionistPatientsPage.content.push(...action.payload.content);
          // Atualiza os metadados de paginação com os da última requisição
          state.nutritionistPatientsPage.last = action.payload.last;
          state.nutritionistPatientsPage.number = action.payload.number;
          state.nutritionistPatientsPage.totalPages = action.payload.totalPages;
        } else {
          // Se for a primeira carga, apenas define o estado
          state.nutritionistPatientsPage = action.payload;
        }
      })
      .addCase(fetchNutritionistPatients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? null;
      })

      // CREATE NUTRITIONIST PATIENT
      .addCase(createNutritionistPatient.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createNutritionistPatient.rejected, (state, action) => {
        state.error = action.payload ?? 'Falha ao deletar consulta.';
        state.status = 'failed';
      })
      .addCase(createNutritionistPatient.fulfilled, (state, action) => {
        state.createdPatient = action.payload;
        state.status = 'succeeded';
      });
  },
});

export const { clearNutritionistPatients, clearError } = nutritionistPatientsSlice.actions;
export default nutritionistPatientsSlice.reducer;
