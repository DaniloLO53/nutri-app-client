import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type {
  NutritionistProfile,
  NutritionistProfileState,
} from '../../../types/nutritionistProfile';
import type { AxiosError } from 'axios';
import {
  getNutritionistProfileApi,
  updateNutritionistProfileApi,
} from '../../../services/nutritionistService';

export const fetchNutritionistProfile = createAsyncThunk<
  NutritionistProfile,
  void,
  { rejectValue: string }
>('nutritionist/profile/me', async (_, { rejectWithValue }) => {
  try {
    const response = await getNutritionistProfileApi();
    console.log({ response: response.data });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao buscar perfil.');
  }
});

export const updateNutritionistProfile = createAsyncThunk<
  NutritionistProfile,
  Partial<NutritionistProfile>,
  { rejectValue: string }
>('nutritionist/profile/me/update', async (data, { rejectWithValue }) => {
  try {
    const response = await updateNutritionistProfileApi(data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
    return rejectWithValue(axiosError.response?.data?.message || 'Erro ao atualizar perfil.');
  }
});

const nutritionistProfileInitialState: NutritionistProfileState = {
  profile: null,
  allHealthPlans: [],
  status: 'idle',
  updateStatus: 'idle',
  error: null,
};

const nutritionistProfileSlice = createSlice({
  name: 'nutritionistProfile',
  initialState: nutritionistProfileInitialState,
  reducers: {},
  extraReducers: (builder) => {
    // Profile reducers
    builder
      .addCase(fetchNutritionistProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNutritionistProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(fetchNutritionistProfile.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = action.payload;
        }
      });

    // update Nutritionist profiles
    builder
      .addCase(updateNutritionistProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateNutritionistProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
      })
      .addCase(updateNutritionistProfile.rejected, (state, action) => {
        state.status = 'failed';
        if (action.payload) {
          state.error = action.payload;
        }
      });
  },
});

export default nutritionistProfileSlice.reducer;
