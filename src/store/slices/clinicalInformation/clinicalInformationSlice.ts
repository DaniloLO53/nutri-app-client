import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import type {
  ClinicalInformationForm,
  ClinicalInformationState,
} from '../../../types/clinicalInformation';
import {
  fetchClinicalInformationApi,
  saveClinicalInformationApi,
} from '../../../services/clinicalInformationService';

export const saveClinicalInformation = createAsyncThunk<
  Partial<ClinicalInformationForm>,
  { clinicalInformation: ClinicalInformationForm; patientId: string },
  { rejectValue: string }
>('patient/clinicalInformation/save', async (data, { rejectWithValue }) => {
  const { clinicalInformation, patientId } = data;
  try {
    const response = await saveClinicalInformationApi(patientId, clinicalInformation);

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Erro ao salvar informações clínicas.',
    );
  }
});

export const fetchClinicalInformation = createAsyncThunk<
  ClinicalInformationForm,
  { patientId: string },
  { rejectValue: string }
>('patient/clinicalInformation/fetchAll', async ({ patientId }, { rejectWithValue }) => {
  try {
    const response = await fetchClinicalInformationApi({ patientId });
    console.log({ response });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    console.error({ error });
    return rejectWithValue(
      axiosError.response?.data?.message || 'Erro ao buscar informações clínicas.',
    );
  }
});

const initialState: ClinicalInformationState = {
  clinicalInformation: null,
  status: 'idle',
  error: null,
};

const clinicalInformationSlice = createSlice({
  name: 'clinicalInformation',
  initialState,
  reducers: {
    clearClinicalInformation: (state) => {
      state.clinicalInformation = null;
      state.status = 'idle';
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET CLINICAL INFORMATION
      .addCase(fetchClinicalInformation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchClinicalInformation.fulfilled, (state, action) => {
        state.clinicalInformation = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchClinicalInformation.rejected, (state, action) => {
        state.error = action.payload ?? 'Faalha ao carregar informações clínicas';
        state.status = 'failed';
      })

      // CREATE CLINICAL INFORMATION
      .addCase(saveClinicalInformation.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(saveClinicalInformation.rejected, (state, action) => {
        state.error = action.payload ?? 'Falha ao salvar informações clínicas.';
        state.status = 'failed';
      })
      .addCase(saveClinicalInformation.fulfilled, (state, action) => {
        state.clinicalInformation = action.payload;
        state.status = 'succeeded';
      });
  },
});

export const { clearClinicalInformation, clearError } = clinicalInformationSlice.actions;
export default clinicalInformationSlice.reducer;
