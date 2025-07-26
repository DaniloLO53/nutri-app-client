import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '../../../types/notification';
import {
  getNotificationsApi,
  markNotificationAsReadApi,
} from '../../../services/notificationService';
import type { AxiosError } from 'axios';

interface NotificationsState {
  notifications: Notification[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  status: 'idle',
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getNotificationsApi();
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue(axiosError.response?.data?.message || 'Erro ao buscar notificações.');
    }
  },
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await markNotificationAsReadApi(notificationId);
      return notificationId; // Retorna o ID no sucesso para o reducer poder usá-lo
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      return rejectWithValue(
        axiosError.response?.data?.message || 'Erro ao marcar notificaçao como lida.',
      );
    }
  },
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Ação para adicionar uma nova notificação recebida via WebSocket
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload); // Adiciona no início da lista
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notifications = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const existingNotification = state.notifications.find((n) => n.id === notificationId);
        if (existingNotification) {
          existingNotification.read = true;
        }
      });
  },
});

export const { addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
