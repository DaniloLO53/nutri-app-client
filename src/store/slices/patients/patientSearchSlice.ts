import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { searchPatientsByNameApi } from '../../../services/patientService';
import type { AxiosError } from 'axios';
import type {
  PatientSearchResult,
  PatientSearchState,
} from '../../../types/patient';

export const searchPatientsByName = createAsyncThunk<
  PatientSearchResult[],
  string,
  { rejectValue: string }
>('patients/searchByName', async (name, { rejectWithValue }) => {
  // Não busca se o termo for muito curto
  if (name.length < 3) return [];
  try {
    const response = await searchPatientsByNameApi(name);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Erro ao criar disponibilidade.',
    );
  }
});

const initialState: PatientSearchState = {
  patients: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const patientSearchSlice = createSlice({
  name: 'patientSearch',
  initialState,
  reducers: {
    clearPatientSearch: (state) => {
      state.patients = [];
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchPatientsByName.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        searchPatientsByName.fulfilled,
        (state, action: PayloadAction<PatientSearchResult[]>) => {
          state.status = 'succeeded';
          state.patients = action.payload;
        },
      )
      .addCase(searchPatientsByName.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Ocorreu um erro desconhecido.';
      });
  },
});

export const { clearPatientSearch } = patientSearchSlice.actions;
export default patientSearchSlice.reducer;
