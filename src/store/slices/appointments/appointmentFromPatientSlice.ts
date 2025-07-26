import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import {
  cancelAppointmentByPatientApi,
  confirmAppointmentApi,
  createAppointmentApi,
  fetchPatientAppointmentsApi,
} from '../../../services/appointmentService';
import type { AppointmentStatePatient } from '../../../types/appointment';
import type { CalendarPatientAppointment } from '../../../types/schedule';
import type { PaginatedResponse } from '../../../types/pagination';

export const createAppointment = createAsyncThunk<
  PaginatedResponse<CalendarPatientAppointment> | null,
  { scheduleId: string; patientId: string; isRemote: boolean },
  { rejectValue: string }
>('patient/appointments/create', async (data, { rejectWithValue }) => {
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
>('patient/appointments/cancel', async ({ appointmentId }, { rejectWithValue }) => {
  try {
    await cancelAppointmentByPatientApi(appointmentId);
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao buscar a agenda.');
  }
});

export const confirmAppointment = createAsyncThunk<
  void,
  { appointmentId: string },
  { rejectValue: string }
>('patient/appointments/confirmAppointment', async ({ appointmentId }, { rejectWithValue }) => {
  try {
    await confirmAppointmentApi(appointmentId);
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao confirmar agendamento.');
  }
});

export const fetchAppointments = createAsyncThunk<
  PaginatedResponse<CalendarPatientAppointment>,
  { page: number; size: number },
  { rejectValue: string }
>('patient/appointments/fetchAll', async ({ page, size }, { rejectWithValue }) => {
  try {
    const response = await fetchPatientAppointmentsApi(page, size);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao buscar agendamentos.');
  }
});

const initialState: AppointmentStatePatient = {
  appointmentsPage: null,
  status: 'idle',
  error: null,
};

const nutritionistAppointmentSlice = createSlice({
  name: 'nutritionistAppointments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
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

      // CONFIRM APPOINTMENT
      .addCase(confirmAppointment.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(confirmAppointment.rejected, (state, action) => {
        state.error = action.payload ?? 'Falha ao confirmar consulta.';
        state.status = 'failed';
      })
      .addCase(confirmAppointment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })

      .addCase(fetchAppointments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Se já houver consultas e não for a primeira página, anexe os novos resultados
        if (state.appointmentsPage && action.payload.number > 0) {
          state.appointmentsPage.content.push(...action.payload.content);
          // Atualiza os metadados de paginação com os da última requisição
          state.appointmentsPage.last = action.payload.last;
          state.appointmentsPage.number = action.payload.number;
          state.appointmentsPage.totalPages = action.payload.totalPages;
        } else {
          // Se for a primeira carga, apenas define o estado
          state.appointmentsPage = action.payload;
        }
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? null;
      });
  },
});

export const { clearError } = nutritionistAppointmentSlice.actions;
export default nutritionistAppointmentSlice.reducer;
