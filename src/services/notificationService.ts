import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { addNotification } from '../store/slices/notifications/notificationsSlice';
import type { AppDispatch } from '../store';
import { apiClient } from './config/axiosConfig';
import type { Notification } from '../types/notification';

let stompClient: Client | null = null;

export const connectWebSocket = (userId: string, token: string, dispatch: AppDispatch) => {
  if (stompClient?.active) {
    return; // Já conectado
  }

  // Cria um novo cliente STOMP
  stompClient = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/ws'), // URL do seu backend
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('WebSocket Conectado!');
      // Inscreve-se no tópico de notificações específico do usuário
      stompClient?.subscribe(`/topic/notifications/${userId}`, (message) => {
        const newNotification = JSON.parse(message.body);
        // Despacha a ação para adicionar a nova notificação ao estado do Redux
        dispatch(addNotification(newNotification));
      });
    },
    onStompError: (frame) => {
      console.error('Erro no Broker:', frame.headers['message'], frame.body);
    },
  });

  stompClient.activate();
};

export const disconnectWebSocket = () => {
  stompClient?.deactivate();
  stompClient = null;
  console.log('WebSocket Desconectado.');
};

export const getNotificationsApi = () => {
  return apiClient.get<Notification[]>('/notifications');
};

export const markNotificationAsReadApi = (notificationId: string) => {
  return apiClient.patch<void>(`/notifications/${notificationId}/read`);
};
