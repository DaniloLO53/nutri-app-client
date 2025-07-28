import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import type {
  NutritionistScheduledPatient,
  NutritionistScheduledPatientState,
} from '../../../types/nutritionistPatient';
import type { PaginatedResponse } from '../../../types/pagination';
import { searchNutritionistScheduledPatientsApi } from '../../../services/patientService';

export const searchNutritionistScheduledPatients = createAsyncThunk<
  PaginatedResponse<NutritionistScheduledPatient>,
  { page: number; size: number; name: string },
  { rejectValue: string }
>('nutritionist/patients/scheduled/fetchAll', async ({ page, size, name }, { rejectWithValue }) => {
  try {
    const response = await searchNutritionistScheduledPatientsApi(name, page, size);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    console.log({ error });
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao buscar pacientes.');
  }
});

const initialState: NutritionistScheduledPatientState = {
  nutritionistScheduledPatientsPage: null,
  status: 'idle',
  error: null,
};

const nutritionistScheduledPatientsSlice = createSlice({
  name: 'nutritionistScheduledPatients',
  initialState,
  reducers: {
    clearNutritionistScheduledPatients: (state) => {
      state.nutritionistScheduledPatientsPage = null;
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
      .addCase(searchNutritionistScheduledPatients.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(searchNutritionistScheduledPatients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Se já houver consultas e não for a primeira página, anexe os novos resultados
        if (state.nutritionistScheduledPatientsPage && action.payload.number > 0) {
          state.nutritionistScheduledPatientsPage.content.push(...action.payload.content);
          // Atualiza os metadados de paginação com os da última requisição
          state.nutritionistScheduledPatientsPage.last = action.payload.last;
          state.nutritionistScheduledPatientsPage.number = action.payload.number;
          state.nutritionistScheduledPatientsPage.totalPages = action.payload.totalPages;
        } else {
          // Se for a primeira carga, apenas define o estado
          state.nutritionistScheduledPatientsPage = action.payload;
        }
      })
      .addCase(searchNutritionistScheduledPatients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? null;
      });
  },
});

export const { clearNutritionistScheduledPatients, clearError } =
  nutritionistScheduledPatientsSlice.actions;
export default nutritionistScheduledPatientsSlice.reducer;
