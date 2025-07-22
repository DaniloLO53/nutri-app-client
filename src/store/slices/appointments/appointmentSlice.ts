import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import type { AppointmentState } from '../../../types/appointment';
import {
  createAppointmentApi,
  deleteAppointmentApi,
  fetchFutureAppointmentsApi,
} from '../../../services/appointmentService';
import type { CalendarAppointment } from '../../../types/schedule';

export const createAppointmentForPatient = createAsyncThunk<
  CalendarAppointment, // <-- 2. Use o novo tipo como tipo de retorno
  { scheduleId: string; patientId: string; isRemote: boolean },
  { rejectValue: string }
>('schedule/createAppointment', async (data, { rejectWithValue }) => {
  const { scheduleId, patientId, isRemote } = data;
  try {
    const response = await createAppointmentApi(scheduleId, {
      patientId,
      isRemote,
    });

    // 3. Retorne o objeto composto com a resposta da API e o ID original
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao buscar a agenda.');
  }
});

export const deleteAppointment = createAsyncThunk<string, string, { rejectValue: string }>(
  'schedule/deleteAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      await deleteAppointmentApi(appointmentId);
      return appointmentId; // Retorna o ID para o reducer
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue(axiosError.response?.data?.message || 'Erro ao buscar a agenda.');
    }
  },
);

export const fetchFutureAppointments = createAsyncThunk<
  CalendarAppointment[],
  // Appointment[],
  void,
  { rejectValue: string }
>('appointments/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await fetchFutureAppointmentsApi();
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao buscar agendamentos.');
  }
});

const initialState: AppointmentState = {
  appointments: [],
  // TODO: mudar para enum
  status: 'idle',
  error: null,
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearAppointments: (state) => {
      state.appointments = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // GET APPOINTMENTS
      .addCase(fetchFutureAppointments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFutureAppointments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.appointments = action.payload;
      })
      .addCase(fetchFutureAppointments.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = action.payload;
        }
      })

      // DELETE APPOINTMENT
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        // A lógica é a mesma: remover o evento do estado
        state.appointments = state.appointments.filter(
          (appointment) => appointment.id !== action.payload,
        );
      })

      // CREATE APPOINTMENT
      .addCase(
        createAppointmentForPatient.fulfilled,
        (state, action: PayloadAction<CalendarAppointment>) => {
          state.appointments.push(action.payload);
        },
      );
  },
});

export const { clearAppointments } = appointmentSlice.actions;
export default appointmentSlice.reducer;
