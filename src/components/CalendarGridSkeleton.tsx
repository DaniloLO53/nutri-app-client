import dayjs from 'dayjs';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';

interface CalendarGridSkeletonProps {
  startOfWeek: dayjs.Dayjs;
  slotDuration: number;
}

const CalendarGridSkeleton = ({ startOfWeek, slotDuration }: CalendarGridSkeletonProps) => {
  const days = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
  const gridInterval = slotDuration === 15 || slotDuration === 45 ? 15 : 30;
  const timeSlots: dayjs.Dayjs[] = [];
  for (let hour = 8; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += gridInterval) {
      timeSlots.push(dayjs().hour(hour).minute(minute).second(0));
    }
  }

  return (
    // ✅ 1. O container principal agora tem position: relative
    <Paper sx={{ overflow: 'auto', position: 'relative' }}>
      {/* O Box da grade agora é apenas para a estrutura de fundo */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto repeat(7, 1fr)',
          gridTemplateRows: `auto repeat(${timeSlots.length}, 40px)`,
          minWidth: '800px',
        }}
      >
        {/* Renderiza cabeçalhos, coluna de tempo e células de fundo (sem alteração) */}
        {/* Canto Vazio */}
        <Box sx={{ gridColumn: 1, gridRow: 1 }} />
        {/* Cabeçalho dos Dias */}
        {days.map((day, i) => (
          <Box
            key={i}
            sx={{
              gridColumn: i + 2,
              gridRow: 1,
              textAlign: 'center',
              p: 1,
              borderBottom: '1px solid #ddd',
              position: 'sticky',
              top: 0,
              backgroundColor: 'background.paper',
              zIndex: 3,
            }}
          >
            <Typography variant="subtitle2">{day.format('ddd').toUpperCase()}</Typography>
            <Typography variant="h6">{day.format('D')}</Typography>
          </Box>
        ))}
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
              position: 'sticky',
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
        {/* Células de fundo */}
        {days.map((day, dayIndex) =>
          timeSlots.map((time, timeIndex) => (
            <Box
              key={`${dayIndex}-${timeIndex}`}
              sx={{
                gridColumn: dayIndex + 2,
                gridRow: timeIndex + 2,
                borderBottom: '1px solid #eee',
                borderRight: '1px solid #eee',
              }}
            />
          )),
        )}
      </Box>

      {/* Nao funciona!!! */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)', // Fundo branco semi-transparente
          zIndex: 5, // zIndex alto para garantir que fique no topo
        }}
      >
        <CircularProgress color="primary" size={300} />
      </Box>
    </Paper>
  );
};

export default CalendarGridSkeleton;
