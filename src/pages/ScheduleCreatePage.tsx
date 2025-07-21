import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs, { Dayjs } from 'dayjs';
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
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import type { AppDispatch, RootState } from '../store';
import {
  createSchedule,
  deleteSchedule,
  fetchSchedule,
} from '../store/slices/schedules/scheduleSlice';
import CalendarGrid from '../components/CalendarGrid';
import AppointmentCreateNutritionist from '../components/AppointmentCreateNutritionist';
import {
  EventType,
  type CalendarAppointment,
  type CalendarSchedule,
} from '../types/schedule';
import { deleteAppointment } from '../store/slices/appointments/appointmentSlice';

const DURATIONS = [15, 30, 45, 60];

const ScheduleCreatePage = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { schedules, status: scheduleStatus } = useSelector(
    (state: RootState) => state.schedule,
  );
  const { appointments, status: appointmentStatus } = useSelector(
    (state: RootState) => state.appointments, // Supondo que o slice se chama 'appointment'
  );
  const combinedEvents = useMemo(() => {
    // O spread operator (...) é uma forma limpa de unir arrays
    return [...schedules, ...appointments];
  }, [schedules, appointments]); // A lista de dependências

  const [currentDate, setCurrentDate] = useState(dayjs());
  const [slotDuration, setSlotDuration] = useState(30);

  const [isAppointmentActionDialogOpen, setIsAppointmentActionDialogOpen] =
    useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<CalendarAppointment | null>(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isScheduleActionDialogOpen, setIsScheduleActionDialogOpen] =
    useState(false);
  const [isAppointmentCreateOpen, setIsAppointmentCreateOpen] = useState(false);

  const [selectedSchedule, setSelectedSchedule] =
    useState<CalendarSchedule | null>(null); // NOVO: Estado para o evento selecionado
  const [selectedSlot, setSelectedSlot] = useState<Dayjs | null>(null);

  const startOfWeek = useMemo(() => currentDate.startOf('week'), [currentDate]);
  const endOfWeek = useMemo(() => currentDate.endOf('week'), [currentDate]);

  useEffect(() => {
    dispatch(
      fetchSchedule({
        startDate: startOfWeek.format('YYYY-MM-DD'), // Envia apenas a data. Ex: "2025-07-13"
        endDate: endOfWeek.format('YYYY-MM-DD'), // Ex: "2025-07-19"
      }),
    );
  }, [dispatch, startOfWeek, endOfWeek]);

  const handleSlotClick = (slotDate: Dayjs) => {
    setSelectedSlot(slotDate); // Salva o slot clicado
    setIsCreateDialogOpen(true); // Abre o diálogo
  };

  const handleCloseDialogs = () => {
    setIsCreateDialogOpen(false);
    setIsScheduleActionDialogOpen(false);
    setIsAppointmentCreateOpen(false);
    setIsAppointmentActionDialogOpen(false); // <-- NOVO
    setSelectedSlot(null);
    setSelectedSchedule(null);
    setSelectedAppointment(null); // <-- NOVO
  };

  const handleEventClick = (event: CalendarSchedule | CalendarAppointment) => {
    if (event.type === EventType.SCHEDULE) {
      // Lógica antiga para horários disponíveis
      setSelectedSchedule(event as CalendarSchedule);
      setIsScheduleActionDialogOpen(true);
    } else if (event.type === EventType.APPOINTMENT) {
      // Lógica nova para consultas marcadas
      setSelectedAppointment(event as CalendarAppointment);
      setIsAppointmentActionDialogOpen(true);
    }
  };

  const handleConfirmAppointmentDelete = () => {
    if (!selectedAppointment) return;

    // Você precisará criar esta ação no seu 'appointmentSlice' (veja Passo 4)
    dispatch(deleteAppointment(selectedAppointment.id));
    handleCloseDialogs();
  };

  const handleConfirmDelete = () => {
    if (!selectedSchedule) return;

    dispatch(deleteSchedule(selectedSchedule.id));
    handleCloseDialogs();
  };

  const handleCreateSchedule = () => {
    if (!selectedSlot) return;

    dispatch(
      createSchedule({
        startTime: selectedSlot.toISOString(),
        durationMinutes: slotDuration,
      }),
    );
    handleCloseDialogs();
  };

  const handleCreateAppointment = () => {
    // Usa o slot clicado, seja de uma área vazia ou de uma disponibilidade
    const targetSlot =
      selectedSlot ||
      (selectedSchedule ? dayjs(selectedSchedule.startTime) : null);
    if (!targetSlot) return;

    setSelectedSlot(targetSlot); // Garante que o slot esteja salvo
    setIsCreateDialogOpen(false); // Fecha o diálogo de criação
    setIsScheduleActionDialogOpen(false); // Fecha o diálogo de ações
    setIsAppointmentCreateOpen(true); // ABRE O NOVO DIÁLOGO DE BUSCA
  };

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
          Criar Horários
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

      {scheduleStatus === 'loading' || appointmentStatus === 'loading' ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <CalendarGrid
          startOfWeek={startOfWeek}
          slotDuration={slotDuration}
          events={combinedEvents}
          onSlotClick={handleSlotClick}
          onEventClick={handleEventClick}
        />
      )}

      <Dialog
        open={isCreateDialogOpen}
        onClose={handleCloseDialogs}
        aria-labelledby="action-dialog-title"
      >
        <DialogTitle id="action-dialog-title">Confirme sua ação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você selecionou o horário de {selectedSlot?.format('HH:mm')} do dia{' '}
            {selectedSlot?.format('DD/MM/YYYY')}.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialogs} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleCreateSchedule} variant="contained" autoFocus>
            Criar Disponibilidade
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isScheduleActionDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Ação para Horário Disponível</DialogTitle>
        <DialogContent>
          <DialogContentText>
            O que você deseja fazer com o horário das{' '}
            <strong>
              {dayjs(selectedSchedule?.startTime).format('HH:mm')}
            </strong>{' '}
            do dia{' '}
            <strong>
              {dayjs(selectedSchedule?.startTime).format('DD/MM/YYYY')}
            </strong>
            ?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button onClick={handleConfirmDelete} color="error">
            Excluir Horário
          </Button>
          <Box>
            <Button onClick={handleCloseDialogs} color="secondary">
              Cancelar
            </Button>
            <Button onClick={handleCreateAppointment} variant="contained">
              Agendar para Paciente
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog open={isAppointmentActionDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Ação para Consulta Marcada</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você selecionou a consulta com o paciente{' '}
            <strong>{selectedAppointment?.patient?.name}</strong>, marcada para
            as{' '}
            <strong>
              {dayjs(selectedAppointment?.startTime).format('HH:mm')}
            </strong>{' '}
            do dia{' '}
            <strong>
              {dayjs(selectedAppointment?.startTime).format('DD/MM/YYYY')}
            </strong>
            . Deseja excluir esta consulta?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialogs} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmAppointmentDelete}
            variant="contained"
            color="error"
          >
            Excluir Consulta
          </Button>
        </DialogActions>
      </Dialog>

      <AppointmentCreateNutritionist
        open={isAppointmentCreateOpen}
        onClose={handleCloseDialogs}
        schedule={selectedSchedule}
      />
    </Container>
  );
};

export default ScheduleCreatePage;
