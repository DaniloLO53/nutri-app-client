import dayjs, { Dayjs } from 'dayjs';
import { alpha, Box, Paper, Typography } from '@mui/material';
import {
  EventType,
  type CalendarNutritionistAppointment,
  type CalendarSchedule,
} from '../types/schedule';

interface CalendarGridProps {
  startOfWeek: dayjs.Dayjs;
  slotDuration: number;
  events: (CalendarSchedule | CalendarNutritionistAppointment)[];
  onSlotClick?: (slotDate: dayjs.Dayjs) => void;
  onEventClick: (event: CalendarSchedule | CalendarNutritionistAppointment) => void;
}

const CalendarGrid = ({
  startOfWeek,
  slotDuration,
  events,
  onSlotClick,
  onEventClick,
}: CalendarGridProps) => {
  const now = dayjs(); // "Fotografa" a hora atual no momento da renderização
  const days = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
  const gridInterval = slotDuration === 15 || slotDuration === 45 ? 15 : 30;

  const timeSlots: Dayjs[] = [];
  for (let hour = 8; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += gridInterval) {
      timeSlots.push(dayjs().hour(hour).minute(minute).second(0));
    }
  }

  // Função para calcular a posição e tamanho de um evento no grid
  const getEventStyle = (event: CalendarSchedule | CalendarNutritionistAppointment) => {
    const eventStart = dayjs(event.startTime);
    const dayIndex = eventStart.diff(startOfWeek.startOf('day'), 'day');
    const startOfDay = eventStart.startOf('day').hour(8);
    const minutesFromStart = eventStart.diff(startOfDay, 'minute');

    const startRow = Math.floor(minutesFromStart / gridInterval) + 2;
    const eventEndMinutes = minutesFromStart + event.durationMinutes;
    const endRow = Math.floor(eventEndMinutes / gridInterval) + 2;

    // Em vez de 'span', definimos explicitamente a linha de início e de fim
    const gridRowValue = `${startRow} / ${endRow}`;

    return {
      gridColumn: dayIndex + 2, // Coluna do dia da semana (permanece igual)
      gridRow: gridRowValue, // Linha de início / Linha de fim
      backgroundColor: event.type === EventType.APPOINTMENT ? 'error.light' : 'primary.light',
      color: event.type === EventType.APPOINTMENT ? 'error.contrastText' : 'primary.contrastText',
      borderLeft: `3px solid ${event.type === EventType.APPOINTMENT ? 'error.dark' : 'primary.dark'}`,
      p: 0.5,
      borderRadius: '4px',
      fontSize: '12px',
      overflow: 'hidden',
      zIndex: 1, // Garante que o evento fique sobre as linhas da grade
    };
  };

  return (
    <Paper sx={{ overflow: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto repeat(7, 1fr)',
          // A altura das linhas é fixa, mas o número de linhas agora é dinâmico
          gridTemplateRows: `auto repeat(${timeSlots.length}, 40px)`,
          minWidth: '800px',
        }}
      >
        {/* Canto Vazio */}
        <Box sx={{ gridColumn: 1, gridRow: 1 }} />

        {/* Cabeçalho dos Dias */}
        {days.map((day, dayIndex) =>
          timeSlots.map((time, timeIndex) => {
            const slotStart = day.hour(time.hour()).minute(time.minute());
            const slotEnd = slotStart.add(slotDuration, 'minute');

            // Verifica se a hora atual está dentro do intervalo deste slot
            const isCurrentSlot = now.isAfter(slotStart) && now.isBefore(slotEnd);

            if (isCurrentSlot) console.log(time.hour(), time.minute());

            return (
              <Box
                key={`${dayIndex}-${timeIndex}`}
                sx={{
                  gridColumn: dayIndex + 2,
                  gridRow: timeIndex + 2,
                  borderBottom: '1px solid #eee',
                  borderRight: '1px solid #eee',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' },
                  // ✅ APLICA O ESTILO CONDICIONAL AQUI
                  backgroundColor: isCurrentSlot
                    ? alpha('#ffc107', 0.2) // Uma cor de destaque sutil (amarelo)
                    : undefined,
                }}
                onClick={() => (onSlotClick ? onSlotClick(slotStart) : null)} // Reutiliza a variável `slotStart`
              />
            );
          }),
        )}

        {/* Coluna de Horários */}
        {timeSlots.map((time, i) => (
          <Box
            key={i}
            sx={{
              gridColumn: 1,
              gridRow: i + 2,
              textAlign: 'right',
              pr: 1,
              borderRight: '1px solid #ddd',
              fontSize: '12px',
              color: 'text.secondary',
            }}
          >
            <Typography
              component="span"
              sx={{
                transform: 'translateY(-50%)',
                display: 'inline-block',
                fontSize: 'small',
                p: 1,
              }}
            >
              {time.format('HH:mm')}
            </Typography>
          </Box>
        ))}

        {/* Slots Clicáveis */}
        {days.map((day, dayIndex) =>
          timeSlots.map((time, timeIndex) => (
            <Box
              key={`${dayIndex}-${timeIndex}`}
              sx={{
                gridColumn: dayIndex + 2,
                gridRow: timeIndex + 2,
                borderBottom: '1px solid #eee',
                borderRight: '1px solid #eee',
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
              onClick={() =>
                onSlotClick ? onSlotClick(day.hour(time.hour()).minute(time.minute())) : null
              }
            />
          )),
        )}

        {/* Eventos Existentes */}
        {events.map((event, index) => {
          return (
            <Box
              key={event.id + index}
              sx={{
                ...getEventStyle(event),
                // Cursor de ponteiro para todos os eventos
                cursor: 'pointer',
                '&:hover': {
                  filter: 'brightness(0.9)',
                },
                position: 'relative',
                zIndex: 2, // garante que os eventos sejam clicaveis
              }}
              // O onClick agora funciona para qualquer evento
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event);
              }}
            >
              {event.type === EventType.APPOINTMENT
                ? (event as CalendarNutritionistAppointment).patient?.name
                : 'Disponível'}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default CalendarGrid;
