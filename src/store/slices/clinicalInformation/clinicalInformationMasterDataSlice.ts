import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import type { MasterData, MasterDataState } from '../../../types/clinicalInformation';
import { fetchMasterDataApi } from '../../../services/clinicalInformationService';

export const fetchMasterData = createAsyncThunk<MasterData, void, { rejectValue: string }>(
  'clinicalInformation/masterData/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchMasterDataApi();
      console.log({ response });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      console.error({ error });
      return rejectWithValue(
        axiosError.response?.data?.message || 'Erro ao buscar informações clínicas.',
      );
    }
  },
);

const initialMasterData = {
  symptoms: [],
  allergens: [],
  diseases: [],
  medications: [],
  foodPreferencesAndAversions: [],
};

const initialState: MasterDataState = {
  data: initialMasterData,
  status: 'idle',
  error: null,
};

const clinicalInformationMasterDataSlice = createSlice({
  name: 'clinicalInformationMasterData',
  initialState,
  reducers: {
    clearClinicalInformationMasterData: (state) => {
      state.data = initialMasterData;
      state.status = 'idle';
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET CLINICAL INFORMATION MASTER DATA
      .addCase(fetchMasterData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMasterData.fulfilled, (state, action) => {
        state.data = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchMasterData.rejected, (state, action) => {
        state.error = action.payload ?? 'Faalha ao carregar informações clínicas';
        state.status = 'failed';
      });
  },
});

export const { clearClinicalInformationMasterData, clearError } =
  clinicalInformationMasterDataSlice.actions;
export default clinicalInformationMasterDataSlice.reducer;
