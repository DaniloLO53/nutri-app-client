import dayjs, { Dayjs } from 'dayjs';
import { alpha, Box, Paper, Typography } from '@mui/material';
import {
  EventType,
  type CalendarNutritionistAppointment,
  type CalendarPatientAppointment,
  type CalendarSchedule,
} from '../types/schedule';
import { AppointmentStatus, type AppointmentStatusValue } from '../types/appointment';
import { green } from '@mui/material/colors';

interface CalendarGridProps {
  startOfWeek: dayjs.Dayjs;
  slotDuration: number;
  showLocation: boolean;
  events: (CalendarSchedule | CalendarNutritionistAppointment | CalendarPatientAppointment)[];
  onSlotClick?: (slotDate: dayjs.Dayjs) => void;
  onEventClick: (event: CalendarSchedule | CalendarNutritionistAppointment) => void;
}

const statusStyleMap: Record<AppointmentStatusValue, { bg: string; border: string }> = {
  [AppointmentStatus.AGENDADO]: { bg: green[200], border: green[400] },
  [AppointmentStatus.ESPERANDO_CONFIRMACAO]: {
    bg: 'success.light',
    border: 'success.main',
  },
  [AppointmentStatus.CONFIRMADO]: {
    bg: 'success.dark',
    border: 'success.dark',
  },
  [AppointmentStatus.CONCLUIDO]: { bg: 'grey.500', border: 'grey.700' },
  [AppointmentStatus.CANCELADO]: { bg: 'error.light', border: 'error.dark' },
  [AppointmentStatus.NAO_COMPARECEU]: {
    bg: 'error.dark',
    border: 'error.dark',
  },
};

const CalendarGrid = ({
  startOfWeek,
  slotDuration,
  events,
  onSlotClick,
  onEventClick,
  showLocation,
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
    // A lógica de cálculo de posição permanece a mesma
    const eventStart = dayjs(event.startTime);
    const dayIndex = eventStart.diff(startOfWeek.startOf('day'), 'day');
    const startOfDay = eventStart.startOf('day').hour(8);
    const minutesFromStart = eventStart.diff(startOfDay, 'minute');
    const startRow = Math.floor(minutesFromStart / gridInterval) + 2;
    const eventEndMinutes = minutesFromStart + event.durationMinutes;
    const endRow = Math.floor(eventEndMinutes / gridInterval) + 2;
    const gridRowValue = `${startRow} / ${endRow}`;

    // Lógica de estilo condicional
    let styleProps = {
      backgroundColor: 'primary.light',
      color: 'primary.contrastText',
      borderLeft: `3px solid primary.dark`,
    };

    if (event.type === EventType.APPOINTMENT) {
      const appointment = event as CalendarNutritionistAppointment;
      const statusStyle = statusStyleMap[appointment.status as AppointmentStatusValue] || null;

      if (statusStyle) {
        styleProps = {
          backgroundColor: statusStyle.bg,
          color: 'common.white', // Assumindo texto branco/claro para todas as cores
          borderLeft: `3px solid ${statusStyle.border}`,
        };
      }
    }

    return {
      gridColumn: dayIndex + 2,
      gridRow: gridRowValue,
      ...styleProps,
      p: 0.5,
      borderRadius: '4px',
      fontSize: '11px',
      overflow: 'hidden',
      zIndex: 1,
    };
  };

  return (
    <Paper sx={{ overflow: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto repeat(7, 1fr)',
          gridTemplateRows: `auto repeat(${timeSlots.length}, 70px)`,
          minWidth: '800px',
        }}
      >
        {/* Canto Vazio */}
        <Box sx={{ gridColumn: 1, gridRow: 1 }} />

        {days.map((day, i) => (
          <Box
            key={i}
            sx={{
              gridColumn: i + 2,
              gridRow: 1,
              textAlign: 'center',
              p: 1,
              borderBottom: '1px solid #ddd',
              position: 'sticky', // Garante que o cabeçalho fique visível ao rolar
              top: 0,
              backgroundColor: 'background.paper',
              zIndex: 3,
            }}
          >
            <Typography variant="subtitle2">{day.format('ddd').toUpperCase()}</Typography>
            <Typography variant="h6">{day.format('D')}</Typography>
          </Box>
        ))}

        {timeSlots.map((time, i) => (
          <Box
            key={i}
            sx={{
              gridColumn: 1,
              gridRow: i + 2,
              textAlign: 'right',
              pr: 1,
              borderRight: '1px solid #ddd',
              position: 'sticky', // Garante que os horários fiquem visíveis ao rolar
              left: 0,
              backgroundColor: 'background.paper',
              zIndex: 3,
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

        {days.map((day, dayIndex) =>
          timeSlots.map((time, timeIndex) => {
            const slotStart = day.hour(time.hour()).minute(time.minute());
            const slotEnd = slotStart.add(slotDuration, 'minute');
            const isCurrentSlot = now.isAfter(slotStart) && now.isBefore(slotEnd);

            return (
              <Box
                key={`${dayIndex}-${timeIndex}`}
                sx={{
                  gridColumn: dayIndex + 2,
                  gridRow: timeIndex + 2,
                  borderBottom: '1px solid #eee',
                  borderRight: '1px solid #eee',
                  cursor: onSlotClick ? 'pointer' : 'default', // Cursor só se a função for passada
                  '&:hover': {
                    backgroundColor: onSlotClick ? 'action.hover' : undefined,
                  },
                  backgroundColor: isCurrentSlot ? alpha('#ffc107', 0.2) : undefined,
                }}
                onClick={() => (onSlotClick ? onSlotClick(slotStart) : null)}
              />
            );
          }),
        )}

        {/* Eventos Existentes (CORRETO) */}
        {events.map((event, index) => {
          const isAppointment = event.type === EventType.APPOINTMENT;
          const isClickable = onEventClick !== undefined; // Exemplo simples, pode ser mais complexo

          return (
            <Box
              key={event.id + index}
              sx={{
                ...getEventStyle(event),
                cursor: isClickable ? 'pointer' : 'default',
                '&:hover': {
                  filter: isClickable ? 'brightness(0.9)' : 'none',
                },
                position: 'relative',
                zIndex: 2,
                // Adicionado para um melhor layout interno
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                p: 0.5, // Um pequeno preenchimento interno
              }}
              onClick={(e) => {
                if (!isClickable) return;
                e.stopPropagation();
                onEventClick(event);
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: '1',
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {isAppointment
                  ? (event as CalendarNutritionistAppointment).patient?.name ||
                    (event as CalendarPatientAppointment).nutritionist?.name
                  : 'Disponível'}
              </Typography>

              {showLocation && (
                <Typography
                  title={event.location?.address}
                  sx={{
                    mt: 1,
                    fontSize: '0.875rem',
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: '1',
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {event.location?.address}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default CalendarGrid;
