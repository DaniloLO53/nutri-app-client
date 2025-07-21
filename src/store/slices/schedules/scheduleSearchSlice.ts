import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import {
  searchSchedulesApi,
  type SearchParams,
} from '../../../services/scheduleService';
import type { Schedule, ScheduleSearchState } from '../../../types/schedule';

// O AsyncThunk para realizar a busca
export const searchschedules = createAsyncThunk<
  Schedule[],
  SearchParams,
  { rejectValue: string }
>('profiles/search', async (params, { rejectWithValue }) => {
  try {
    const response = await searchSchedulesApi(params);
    // O backend já deve retornar a lista ordenada
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(
      axiosError.response?.data?.message || 'Erro ao buscar nutricionista.',
    );
  }
});

const initialState: ScheduleSearchState = {
  schedules: [],
  status: 'idle',
  error: null,
};

const scheduleSearchSlice = createSlice({
  name: 'scheduleSearch',
  initialState,
  reducers: {
    // Ação para limpar os resultados ao sair da página, por exemplo
    clearSearchResults: (state) => {
      state.schedules = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchschedules.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(searchschedules.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.schedules = action.payload;
      })
      .addCase(searchschedules.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = action.payload;
        }
      });
  },
});

export const { clearSearchResults } = scheduleSearchSlice.actions;
export default scheduleSearchSlice.reducer;
