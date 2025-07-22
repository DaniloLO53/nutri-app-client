import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import type { AppointmentState } from '../../../types/appointment';
import {
  createAppointmentApi,
  deleteAppointmentApi,
  fetchFutureAppointmentsApi,
} from '../../../services/appointmentService';
import type { CalendarAppointment } from '../../../types/schedule';
import { fetchSchedule } from '../schedules/scheduleSlice';

export const createAppointmentForPatient = createAsyncThunk<
  CalendarAppointment, // <-- 2. Use o novo tipo como tipo de retorno
  { scheduleId: string; patientId: string; isRemote: boolean; startDate: string; endDate: string },
  { rejectValue: string }
>('schedule/createAppointment', async (data, { rejectWithValue, dispatch }) => {
  const { scheduleId, patientId, isRemote, startDate, endDate } = data;
  try {
    const response = await createAppointmentApi(scheduleId, {
      patientId,
      isRemote,
    });
    dispatch(fetchSchedule({ startDate, endDate }));

    // 3. Retorne o objeto composto com a resposta da API e o ID original
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao buscar a agenda.');
  }
});

export const deleteAppointment = createAsyncThunk<
  void,
  { appointmentId: string; startDate: string; endDate: string },
  { rejectValue: string }
>(
  'schedule/deleteAppointment',
  async ({ startDate, endDate, appointmentId }, { rejectWithValue, dispatch }) => {
    try {
      await deleteAppointmentApi(appointmentId);
      dispatch(fetchSchedule({ startDate, endDate }));
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
      .addCase(deleteAppointment.fulfilled, (state) => {
        // state.appointments = state.appointments.filter(({ id }) => id !== action.payload);
        state.status = 'succeeded';
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.error = action.payload ?? 'Falha ao deletar consulta.';
        state.status = 'failed';
      })

      // CREATE APPOINTMENT
      .addCase(
        createAppointmentForPatient.fulfilled,
        (state, action: PayloadAction<CalendarAppointment>) => {
          state.appointments.push(action.payload);
          state.status = 'succeeded';
        },
      );
  },
});

export const { clearAppointments } = appointmentSlice.actions;
export default appointmentSlice.reducer;
