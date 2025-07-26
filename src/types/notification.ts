export interface NotificationParticipant {
  id: string; // Corresponde ao UUID do participante
  email: string;
  name: string;
}

export interface Notification {
  id: string; // Corresponde ao UUID da própria notificação
  from: NotificationParticipant | null; // Remetente (pode ser nulo para notificações do sistema)
  to: NotificationParticipant; // Destinatário
  message: string;
  read: boolean; // Status de leitura (no frontend usamos 'read', não 'isRead')
  relatedEntityId: string | null; // ID da entidade relacionada (ex: consulta), pode ser nulo
  createdAt: string; // Datas são serializadas como string no formato ISO 8601 (ex: "2025-07-26T14:30:00")
}
