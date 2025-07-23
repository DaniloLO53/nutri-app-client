import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import type { Location, LocationsState } from '../../../types/location';
import { fetchLocationsApi } from '../../../services/locationService';

export const fetchLocations = createAsyncThunk<Location[], void, { rejectValue: string }>(
  'locations/getLocations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchLocationsApi();
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue(axiosError.response?.data?.message || 'Erro ao buscar localidades.');
    }
  },
);

const initialStateLocation: LocationsState = {
  locations: [],
  status: 'idle',
  error: null,
};

const locationSlice = createSlice({
  name: 'schedule',
  initialState: initialStateLocation,
  reducers: {
    clearLocation: (state) => {
      state.locations = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH LOCATIONS
      .addCase(fetchLocations.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action: PayloadAction<Location[]>) => {
        state.status = 'succeeded';
        state.locations = action.payload;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Ocorreu um erro desconhecido.';
      });
  },
});

export const { clearLocation } = locationSlice.actions;
export default locationSlice.reducer;
