import { createSlice } from '@reduxjs/toolkit';
import { registerPatient } from './authThunk';

interface AuthState {
  loading: boolean;
  error: string | null;
  registrationSuccess: boolean;
}

const initialState: AuthState = {
  loading: false,
  error: null,
  registrationSuccess: false,
};

const registerPatientSlice = createSlice({
  name: 'registerPatient',
  initialState,
  reducers: {
    // Ações síncronas
    clearError(state) {
      state.error = null;
    },
    resetRegistrationStatus(state) {
      state.registrationSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Quando a requisição está pendente
      .addCase(registerPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      // Quando a requisição é bem-sucedida
      .addCase(registerPatient.fulfilled, (state) => {
        state.loading = false;
        state.registrationSuccess = true;
      })
      // Quando a requisição falha
      .addCase(registerPatient.rejected, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.error = action.payload;
          state.registrationSuccess = false;
        } else {
          state.error = action.error.message || 'Falha ao registrar usuário';
          state.registrationSuccess = false;
        }
      });
  },
});

export const { clearError, resetRegistrationStatus } =
  registerPatientSlice.actions;
export default registerPatientSlice.reducer;
