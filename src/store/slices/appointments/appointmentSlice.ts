import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import type { AppointmentState } from '../../../types/appointment';
import {
  createAppointmentApi,
  fetchPatientAppointmentsApi,
  cancelAppointmentByNutritionistApi,
  cancelAppointmentByPatientApi,
  requestAppointmentConfirmationApi,
  confirmAppointmentApi,
  fetchNutritionistAppointmentsApi,
} from '../../../services/appointmentService';
import type { CalendarNutritionistAppointment } from '../../../types/schedule';
import { fetchOwnSchedule } from '../schedules/scheduleSlice';
import type { RootState } from '../..';
import { UserRole } from '../../../types/user';
import type { NutritionistAppointment } from '../../../types/nutritionistsAppointment';

export const createAppointmentForPatient = createAsyncThunk<
  CalendarNutritionistAppointment,
  { scheduleId: string; patientId: string; isRemote: boolean; startDate: string; endDate: string },
  { rejectValue: string }
>('schedule/createAppointment', async (data, { rejectWithValue, dispatch, getState }) => {
  const { scheduleId, patientId, isRemote, startDate, endDate } = data;
  const state = getState() as RootState;
  const { userInfo } = state.signIn;

  try {
    const response = await createAppointmentApi(scheduleId, {
      patientId,
      isRemote,
    });
    if (userInfo?.role === UserRole.ROLE_NUTRITIONIST) {
      dispatch(fetchOwnSchedule({ startDate, endDate }));
    }

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao buscar a agenda.');
  }
});

// TODO: melhorar esse codigo horroroso
export const cancelAppointment = createAsyncThunk<
  void,
  { appointmentId: string; startDate?: string; endDate?: string; isNutritionist: boolean },
  { rejectValue: string }
>(
  'schedule/cancelAppointment',
  async ({ startDate, endDate, appointmentId, isNutritionist }, { rejectWithValue, dispatch }) => {
    try {
      if (isNutritionist) {
        await cancelAppointmentByNutritionistApi(appointmentId);
      } else {
        await cancelAppointmentByPatientApi(appointmentId);
      }
      if (startDate && endDate) {
        dispatch(fetchOwnSchedule({ startDate, endDate }));
      } else {
        if (isNutritionist) {
          dispatch(fetchNutritionistAppointments());
        } else {
          dispatch(fetchFutureAppointments());
        }
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue(axiosError.response?.data?.message || 'Erro ao buscar a agenda.');
    }
  },
);

export const requestAppointmentConfirmation = createAsyncThunk<
  void,
  { appointmentId: string },
  { rejectValue: string }
>(
  'schedule/requestAppointmentConfirmation',
  async ({ appointmentId }, { rejectWithValue, dispatch }) => {
    try {
      await requestAppointmentConfirmationApi(appointmentId);
      dispatch(fetchNutritionistAppointments());
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue(axiosError.response?.data?.message || 'Erro ao pedir confirmação.');
    }
  },
);

export const confirmAppointment = createAsyncThunk<
  void,
  { appointmentId: string },
  { rejectValue: string }
>('schedule/confirmAppointment', async ({ appointmentId }, { rejectWithValue, dispatch }) => {
  try {
    await confirmAppointmentApi(appointmentId);
    dispatch(fetchFutureAppointments());
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao confirmar agendamento.');
  }
});

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
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao buscar agendamentos.');
  }
});

export const fetchFutureAppointments = createAsyncThunk<
  CalendarNutritionistAppointment[],
  void,
  { rejectValue: string }
>('appointments/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await fetchPatientAppointmentsApi();
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
    clearError: (state) => {
      state.error = null;
      state.status = 'idle';
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
      })

      // DELETE APPOINTMENT
      .addCase(cancelAppointment.fulfilled, (state) => {
        // state.appointments = state.appointments.filter(({ id }) => id !== action.payload);
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
      .addCase(createAppointmentForPatient.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createAppointmentForPatient.rejected, (state, action) => {
        state.error = action.payload ?? 'Falha ao deletar consulta.';
        state.status = 'failed';
      })
      .addCase(
        createAppointmentForPatient.fulfilled,
        (state, action: PayloadAction<CalendarNutritionistAppointment>) => {
          state.appointments.push(action.payload);
          state.status = 'succeeded';
        },
      )

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

export const { clearAppointments, clearError } = appointmentSlice.actions;
export default appointmentSlice.reducer;
