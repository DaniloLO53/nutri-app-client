// src/store/slices/nutritionistAppointmentSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { fetchNutritionistAppointmentsApi } from '../../../services/appointmentService';
import type {
  NutritionistAppointment,
  NutritionistAppointmentState,
} from '../../../types/nutritionistsAppointment';

export const fetchNutritionistAppointments = createAsyncThunk<
  NutritionistAppointment[],
  void,
  { rejectValue: string }
>('nutritionistAppointments/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await fetchNutritionistAppointmentsApi();
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    console.log({ error });
    return rejectWithValue(
      axiosError.response?.data?.message || 'Erro ao buscar agendamentos.',
    );
  }
});

const initialState: NutritionistAppointmentState = {
  appointments: [],
  status: 'idle',
  error: null,
};

const nutritionistAppointmentSlice = createSlice({
  name: 'nutritionistAppointments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNutritionistAppointments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNutritionistAppointments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.appointments = action.payload;
      })
      .addCase(fetchNutritionistAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? null;
      });
  },
});

export default nutritionistAppointmentSlice.reducer;
