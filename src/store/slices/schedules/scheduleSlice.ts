import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import {
  createScheduleApi,
  deleteScheduleApi,
  fetchNutritionistScheduleApi,
  fetchOwnNutritionistScheduleApi,
  deleteCanceledAppointmentApi,
} from '../../../services/nutritionistService';
import type {
  CalendarNutritionistAppointment,
  CalendarPatientAppointment,
  CalendarSchedule,
  ScheduleState,
} from '../../../types/schedule';
import dayjs from 'dayjs';

/**
 * Thunk para buscar os eventos (consultas e disponibilidades) de uma semana.
 */
export const fetchOwnSchedule = createAsyncThunk<
  (CalendarSchedule | CalendarNutritionistAppointment | CalendarPatientAppointment)[], // Tipo do retorno em caso de sucesso
  { startDate: string; endDate: string }, // Tipo do argumento de entrada
  { rejectValue: string } // Tipo do retorno em caso de falha
>('schedule/me/fetch', async ({ startDate, endDate }, { rejectWithValue }) => {
  try {
    const response = await fetchOwnNutritionistScheduleApi(startDate, endDate);
    console.log({ response: response.data });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    console.error(axiosError);
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao buscar a agenda.');
  }
});

export const fetchNutritionistSchedule = createAsyncThunk<
  CalendarNutritionistAppointment[], // Tipo do retorno em caso de sucesso
  { startDate: string; endDate: string; nutritionistId: string }, // Tipo do argumento de entrada
  { rejectValue: string } // Tipo do retorno em caso de falha
>('schedule/fetch', async ({ startDate, endDate, nutritionistId }, { rejectWithValue }) => {
  try {
    if (!nutritionistId) return [];
    const response = await fetchNutritionistScheduleApi(startDate, endDate, nutritionistId);
    console.log({ response: response.data });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    console.error(axiosError);
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao buscar a agenda.');
  }
});

export const deleteSchedule = createAsyncThunk<
  string, // Tipo do retorno em caso de sucesso (o ID do item deletado)
  string, // Tipo do argumento de entrada (o ID do item a ser deletado)
  { rejectValue: string }
>('schedule/delete', async (scheduleId, { rejectWithValue }) => {
  try {
    await deleteScheduleApi(scheduleId);
    return scheduleId; // Retorna o ID para o reducer poder remover do estado
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao deletar horário.');
  }
});

/**
 * Thunk para criar um novo horário de disponibilidade.
 */
export interface StartLocalDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export const convertFromIsoString = (isoString: string): StartLocalDateTime => {
  // 1. O dayjs parseia a string e a converte para o fuso horário local do navegador.
  const d = dayjs(isoString);

  // 2. Extrai cada componente.
  const year = d.year();
  const month = d.month() + 1; // IMPORTANTE: .month() é 0-indexado (0 = Janeiro), então somamos 1.
  const day = d.date(); // .date() retorna o dia do mês.
  const hour = d.hour();
  const minute = d.minute();

  // 3. Retorna o novo objeto.
  return {
    year,
    month,
    day,
    hour,
    minute,
  };
};

export const createSchedule = createAsyncThunk<
  CalendarSchedule, // Retorna o novo evento criado em caso de sucesso
  { startTime: string; durationMinutes: number; locationId: string }, // Argumentos para a criação
  { rejectValue: string }
>('schedule/create', async (scheduleData, { rejectWithValue }) => {
  try {
    const startLocalDateTime = convertFromIsoString(scheduleData.startTime);

    const response = await createScheduleApi({
      startLocalDateTime,
      durationMinutes: scheduleData.durationMinutes,
      locationId: scheduleData.locationId,
    });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao criar disponibilidade.');
  }
});

export const deleteCanceledAppointment = createAsyncThunk<
  CalendarSchedule, // Retorna o novo evento criado em caso de sucesso
  { appointmentId: string }, // Argumentos para a criação
  { rejectValue: string }
>('schedule/recreate', async ({ appointmentId }, { rejectWithValue }) => {
  try {
    const response = await deleteCanceledAppointmentApi({ appointmentId });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao criar disponibilidade.');
  }
});

// --- ESTADO INICIAL ---

const initialStateSchedule: ScheduleState = {
  schedules: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// --- O SLICE ---

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState: initialStateSchedule,
  reducers: {
    clearSchedule: (state) => {
      state.schedules = [];
      state.status = 'idle';
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH NUTRTITIONIST SCHEDULE
      .addCase(fetchNutritionistSchedule.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        fetchNutritionistSchedule.fulfilled,
        (state, action: PayloadAction<CalendarNutritionistAppointment[]>) => {
          state.status = 'succeeded';
          state.schedules = action.payload.map(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ({ patient, ...scheduleWithoutPatient }) => scheduleWithoutPatient,
          );
        },
      )
      .addCase(fetchNutritionistSchedule.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Ocorreu um erro desconhecido.';
      })

      // FETCH OWN NUTRITIONIST SCHEDULE
      .addCase(fetchOwnSchedule.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        fetchOwnSchedule.fulfilled,
        (
          state,
          action: PayloadAction<
            (CalendarSchedule | CalendarNutritionistAppointment | CalendarPatientAppointment)[]
          >,
        ) => {
          state.status = 'succeeded';
          state.schedules = action.payload;
        },
      )
      .addCase(fetchOwnSchedule.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Ocorreu um erro desconhecido.';
      })

      // CREATE SCHEDULE
      .addCase(createSchedule.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createSchedule.fulfilled, (state, action: PayloadAction<CalendarSchedule>) => {
        state.status = 'succeeded';
        state.schedules.push(action.payload);
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.error = action.payload ?? 'Falha ao criar horário.';
        state.status = 'failed';
      })

      // DELETE CANCELED APPOINTMENT
      .addCase(deleteCanceledAppointment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        deleteCanceledAppointment.fulfilled,
        (state, action: PayloadAction<CalendarSchedule>) => {
          // Adiciona o novo evento à lista existente para feedback imediato
          state.status = 'succeeded';
          state.schedules.push(action.payload);
        },
      )
      .addCase(deleteCanceledAppointment.rejected, (state, action) => {
        // Apenas armazena o erro. Um toast de erro pode ser exibido na UI.
        state.error = action.payload ?? 'Falha ao criar horário.';
        state.status = 'failed';
      })

      // DELETE SCHEDULE
      .addCase(deleteSchedule.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        // Remove o evento do estado local sem precisar de um refetch
        state.schedules = state.schedules.filter(({ id }) => id !== action.payload);
        state.status = 'succeeded';
      })
      .addCase(deleteSchedule.rejected, (state, action) => {
        state.error = action.payload ?? 'Falha ao deletar horário.';
        state.status = 'failed';
      });
  },
});

export const { clearSchedule, clearError } = scheduleSlice.actions;
export default scheduleSlice.reducer;
