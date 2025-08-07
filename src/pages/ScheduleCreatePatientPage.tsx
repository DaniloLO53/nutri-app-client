import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
dayjs.locale('pt-br');

import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogActions,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Importe um ícone de sucesso

import type { AppDispatch, RootState } from '../store';
import { fetchNutritionistSchedule } from '../store/slices/schedules/scheduleSlice';
import CalendarGrid from '../components/CalendarGrid';
import {
  EventType,
  type CalendarNutritionistAppointment,
  type CalendarSchedule,
} from '../types/schedule';
import { useNavigate, useParams } from 'react-router-dom';
import { createAppointment } from '../store/slices/appointments/appointmentFromPatientSlice';
import CalendarGridSkeleton from '../components/CalendarGridSkeleton';

const DURATIONS = [15, 30, 45, 60];

const ScheduleCreatePagePatient = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userInfo } = useSelector((state: RootState) => state.signIn);

  const { nutricionistaId: nutritionistId, localidadeId: locationId } = useParams();

  console.log({ locationId });

  const { schedules, status: scheduleStatus } = useSelector((state: RootState) => state.schedule);

  const [currentDate, setCurrentDate] = useState(dayjs());
  const [slotDuration, setSlotDuration] = useState(30);

  const [isRemote, setIsRemote] = useState(false);

  const navigate = useNavigate(); // Hook para navegação
  const [isBookingSuccess, setIsBookingSuccess] = useState(false); // Estado para controlar a tela de sucesso

  const [isScheduleActionDialogOpen, setIsScheduleActionDialogOpen] = useState(false);

  const [selectedSchedule, setSelectedSchedule] = useState<CalendarSchedule | null>(null); // NOVO: Estado para o evento selecionado

  const startOfWeek = useMemo(() => currentDate.startOf('week'), [currentDate]);
  const endOfWeek = useMemo(() => currentDate.endOf('week'), [currentDate]);

  useEffect(() => {
    // Se o agendamento foi um sucesso, espere 3 segundos e redirecione
    if (isBookingSuccess) {
      const timer = setTimeout(() => {
        navigate('/dashboard/paciente');
      }, 3000); // 3000ms = 3 segundos

      // Função de limpeza: se o componente for desmontado, limpa o temporizador
      return () => clearTimeout(timer);
    }
  }, [isBookingSuccess, navigate]);

  useEffect(() => {
    dispatch(
      fetchNutritionistSchedule({
        startDate: startOfWeek.format('YYYY-MM-DD'), // Envia apenas a data. Ex: "2025-07-13"
        endDate: endOfWeek.format('YYYY-MM-DD'), // Ex: "2025-07-19"
        nutritionistId: nutritionistId || '',
      }),
    );
  }, [dispatch, startOfWeek, endOfWeek, nutritionistId]);

  // Em ScheduleCreatePagePatient.tsx

  const handleConfirmAppointment = async () => {
    if (!selectedSchedule || !userInfo?.id) {
      console.error('Horário ou ID do paciente não encontrado!');
      return;
    }

    try {
      await dispatch(
        createAppointment({
          scheduleId: selectedSchedule.id,
          patientId: userInfo.id,
          isRemote: isRemote,
        }),
      ).unwrap();

      setIsBookingSuccess(true);
    } catch (error) {
      console.error('Falha ao agendar a consulta:', error);
    }
  };

  const handleCloseDialogs = () => {
    setIsScheduleActionDialogOpen(false);
    setSelectedSchedule(null);
  };

  const handleEventClick = (event: CalendarSchedule | CalendarNutritionistAppointment) => {
    if (event.type === EventType.SCHEDULE) {
      setSelectedSchedule(event as CalendarSchedule);
      setIsScheduleActionDialogOpen(true);
    }
  };

  if (isBookingSuccess) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          height: '80vh',
        }}
      >
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Consulta Agendada com Sucesso!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Você será redirecionado para o seu painel em alguns segundos...
        </Typography>
        <CircularProgress sx={{ mt: 4 }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Horários Disponíveis
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            onClick={() => setCurrentDate(currentDate.subtract(1, 'week'))}
            startIcon={<ArrowBackIosNewIcon />}
          >
            Semana Anterior
          </Button>
          <Typography variant="h6">
            {startOfWeek.format('D MMM')} - {endOfWeek.format('D MMM, YYYY')}
          </Typography>
          <Button
            onClick={() => setCurrentDate(currentDate.add(1, 'week'))}
            endIcon={<ArrowForwardIosIcon />}
          >
            Próxima Semana
          </Button>
        </Box>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Duração do Atendimento</InputLabel>
          <Select
            value={slotDuration}
            label="Duração do Atendimento"
            onChange={(e) => setSlotDuration(e.target.value as number)}
            size="small"
          >
            {DURATIONS.map((d) => (
              <MenuItem key={d} value={d}>
                {d} minutos
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {scheduleStatus === 'loading' ? (
        <CalendarGridSkeleton startOfWeek={startOfWeek} slotDuration={slotDuration} />
      ) : (
        <CalendarGrid
          startOfWeek={startOfWeek}
          slotDuration={slotDuration}
          events={schedules}
          onEventClick={handleEventClick}
          forPatient={true}
        />
      )}

      <Dialog open={isScheduleActionDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Confirmar Agendamento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja agendar uma consulta no horário das{' '}
            <strong>{dayjs(selectedSchedule?.startTime).format('HH:mm')}</strong> do dia{' '}
            <strong>{dayjs(selectedSchedule?.startTime).format('DD/MM/YYYY')}</strong>?
          </DialogContentText>
          <FormControlLabel
            control={
              <Checkbox checked={isRemote} onChange={(e) => setIsRemote(e.target.checked)} />
            }
            label="Marcar como Teleconsulta"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialogs} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmAppointment} variant="contained">
            Confirmar Agendamento
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ScheduleCreatePagePatient;
