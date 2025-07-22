import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import {
  searchAvailableNutritionistsApi,
  type AvailableNutritionistSearchParams,
} from '../../../services/scheduleService';
import type { AvailableNutritionist, AvailableNutritionistState } from '../../../types/schedule';

// O AsyncThunk para realizar a busca
export const searchAvailableNutritionists = createAsyncThunk<
  AvailableNutritionist[],
  AvailableNutritionistSearchParams,
  { rejectValue: string }
>('profiles/search', async (params, { rejectWithValue }) => {
  try {
    const response = await searchAvailableNutritionistsApi(params);
    // O backend já deve retornar a lista ordenada
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao buscar nutricionista.');
  }
});

const initialState: AvailableNutritionistState = {
  nuritionists: [],
  status: 'idle',
  error: null,
};

const availableNutritionistsSearchSlice = createSlice({
  name: 'availableNutritionistsSearch',
  initialState,
  reducers: {
    // Ação para limpar os resultados ao sair da página, por exemplo
    clearSearchResults: (state) => {
      state.nuritionists = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchAvailableNutritionists.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(searchAvailableNutritionists.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.nuritionists = action.payload;
      })
      .addCase(searchAvailableNutritionists.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = action.payload;
        }
      });
  },
});

export const { clearSearchResults } = availableNutritionistsSearchSlice.actions;
export default availableNutritionistsSearchSlice.reducer;
