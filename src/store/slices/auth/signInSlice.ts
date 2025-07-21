import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { checkAuthStatus, signInUser, signOutUser } from './authThunk';
import type { AuthenticatedUser } from '../../../types/user';
import { StateStatus, type StateStatusValue } from '../statusEnum';

interface State {
  userInfo: AuthenticatedUser | null;
  loading: boolean;
  error: string | null;
  signInSuccess: boolean;
  authStatus: StateStatusValue;
}

const initialState: State = {
  userInfo: null,
  loading: false,
  error: null,
  signInSuccess: false,
  authStatus: StateStatus.IDLE,
};

const signInUserSlice = createSlice({
  name: 'signInUser',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Sign In reducers
    builder
      .addCase(signInUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.signInSuccess = false;
      })
      .addCase(
        signInUser.fulfilled,
        (state, action: PayloadAction<AuthenticatedUser>) => {
          state.loading = false;
          state.userInfo = action.payload;
          state.signInSuccess = true;
        },
      )
      .addCase(signInUser.rejected, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.error = action.payload;
          state.signInSuccess = false;
        } else {
          state.error = action.error.message || 'Falha ao autenticar usuário';
          state.signInSuccess = false;
        }
      });

    // Signout user
    builder
      .addCase(signOutUser.pending, (state) => {
        state.authStatus = StateStatus.LOADING;
        state.loading = true;
      })
      .addCase(signOutUser.fulfilled, (state) => {
        state.authStatus = StateStatus.IDLE;
        state.userInfo = null; // this is what makes user sign out?
        state.signInSuccess = false;
        state.loading = false;
      })
      .addCase(signOutUser.rejected, (state) => {
        state.authStatus = StateStatus.IDLE;
        state.loading = false;
      });

    // Check auth status reducers
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.authStatus = StateStatus.LOADING;
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.authStatus = StateStatus.SUCCEEDED;
        state.userInfo = action.payload; // Restaura a sessão do usuário
        state.loading = false;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.authStatus = StateStatus.FAILED;
        state.userInfo = null;
        state.loading = false;
      });
  },
});

export const { clearError } = signInUserSlice.actions;
export default signInUserSlice.reducer;
