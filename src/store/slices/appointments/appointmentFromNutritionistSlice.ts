import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import type { AppointmentStateNutritionist } from '../../../types/appointment';
import {
  createAppointmentApi,
  cancelAppointmentByNutritionistApi,
  requestAppointmentConfirmationApi,
  fetchNutritionistAppointmentsApi,
} from '../../../services/appointmentService';
import type { CalendarNutritionistAppointment } from '../../../types/schedule';
import type { NutritionistAppointment } from '../../../types/nutritionistsAppointment';
import type { PaginatedResponse } from '../../../types/pagination';

export const createAppointment = createAsyncThunk<
  PaginatedResponse<CalendarNutritionistAppointment> | null,
  { scheduleId: string; patientId: string; isRemote: boolean },
  { rejectValue: string }
>('nutritionist/appointments/create', async (data, { rejectWithValue }) => {
  const { scheduleId, patientId, isRemote } = data;
  try {
    const response = await createAppointmentApi(scheduleId, {
      patientId,
      isRemote,
    });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao buscar a agenda.');
  }
});

export const cancelAppointment = createAsyncThunk<
  void,
  { appointmentId: string },
  { rejectValue: string }
>('nutritionist/appointments/cancel', async ({ appointmentId }, { rejectWithValue }) => {
  try {
    await cancelAppointmentByNutritionistApi(appointmentId);
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao buscar a agenda.');
  }
});

export const fetchAppointments = createAsyncThunk<
  PaginatedResponse<NutritionistAppointment>,
  { page: number; size: number },
  { rejectValue: string }
>('nutritionist/appointments/fetchAll', async ({ page, size }, { rejectWithValue }) => {
  try {
    const response = await fetchNutritionistAppointmentsApi(page, size);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    console.log({ error });
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao buscar agendamentos.');
  }
});

export const requestAppointmentConfirmation = createAsyncThunk<
  void,
  { appointmentId: string },
  { rejectValue: string }
>(
  'nutritionist/appointments/requestAppointmentConfirmation',
  async ({ appointmentId }, { rejectWithValue }) => {
    try {
      await requestAppointmentConfirmationApi(appointmentId);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue(axiosError.response?.data?.message || 'Erro ao pedir confirmação.');
    }
  },
);

const initialState: AppointmentStateNutritionist = {
  appointmentsPage: null,
  status: 'idle',
  error: null,
};

const appointmentFromNutritionistSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearAppointments: (state) => {
      state.appointmentsPage = null;
      state.status = 'idle';
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET APPOINTMENTS
      .addCase(fetchAppointments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.appointmentsPage = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? null;
      })

      // DELETE APPOINTMENT
      .addCase(cancelAppointment.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.error = action.payload ?? 'Falha ao deletar consulta.';
        state.status = 'failed';
      })
      .addCase(cancelAppointment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })

      // CREATE APPOINTMENT
      .addCase(createAppointment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.error = action.payload ?? 'Falha ao deletar consulta.';
        state.status = 'failed';
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.appointmentsPage = action.payload;
        state.status = 'succeeded';
      })

      // REQUEST APPOINTMENT CONFIRMATION
      .addCase(requestAppointmentConfirmation.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(requestAppointmentConfirmation.rejected, (state, action) => {
        state.error = action.payload ?? 'Falha pedir confirmação de consulta.';
        state.status = 'failed';
      })
      .addCase(requestAppointmentConfirmation.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      });
  },
});

export const { clearAppointments, clearError } = appointmentFromNutritionistSlice.actions;
export default appointmentFromNutritionistSlice.reducer;
