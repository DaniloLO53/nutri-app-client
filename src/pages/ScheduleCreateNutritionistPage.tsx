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
  fetchOwnSchedule,
  deleteCanceledAppointment,
} from '../store/slices/schedules/scheduleSlice';
import CalendarGrid from '../components/CalendarGrid';
import AppointmentCreateNutritionist from '../components/AppointmentCreateNutritionist';
import {
  EventType,
  type CalendarNutritionistAppointment,
  type CalendarSchedule,
} from '../types/schedule';
import { cancelAppointment } from '../store/slices/appointments/appointmentSlice';
import { fetchLocations } from '../store/slices/locations/locationSlice';
import { orange } from '@mui/material/colors';
import { AppointmentStatus } from '../types/appointment';

const DURATIONS = [15, 30, 45, 60];

const ScheduleCreateNutritionistPage = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { schedules, status: scheduleStatus } = useSelector((state: RootState) => state.schedule);
  const { locations, status: locationsStatus } = useSelector((state: RootState) => state.locations);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  const [currentDate, setCurrentDate] = useState(dayjs());
  const [slotDuration, setSlotDuration] = useState(30);

  const [isAppointmentActionDialogOpen, setIsAppointmentActionDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<CalendarNutritionistAppointment | null>(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isScheduleActionDialogOpen, setIsScheduleActionDialogOpen] = useState(false);
  const [isDeleteCanceledAppointmentDialogOpen, setIsDeleteCanceledAppointmentDialogOpen] =
    useState(false);

  const [isAppointmentCreateOpen, setIsAppointmentCreateOpen] = useState(false);

  const [selectedSchedule, setSelectedSchedule] = useState<CalendarSchedule | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Dayjs | null>(null);

  const startOfWeek = useMemo(() => currentDate.startOf('week'), [currentDate]);
  const endOfWeek = useMemo(() => currentDate.endOf('week'), [currentDate]);

  const legendItems = [
    { label: 'Disponível', color: 'primary.light' },
    { label: 'Agendado', color: 'warning.light' },
    { label: 'Confirmado', color: 'success.light' },
    { label: 'Concluído', color: 'grey.400' },
    { label: 'Cancelado', color: 'error.light' },
    { label: 'Não Compareceu', color: orange[300] },
  ];

  useEffect(() => {
    dispatch(
      fetchOwnSchedule({
        startDate: startOfWeek.format('YYYY-MM-DD'), // Envia apenas a data. Ex: "2025-07-13"
        endDate: endOfWeek.format('YYYY-MM-DD'), // Ex: "2025-07-19"
      }),
    );
  }, [dispatch, startOfWeek, endOfWeek]);

  const handleSlotClick = (slotDate: Dayjs) => {
    setSelectedSlot(slotDate);
    setIsCreateDialogOpen(true);
    setSelectedLocationId('');
  };

  useEffect(() => {
    dispatch(fetchLocations());
  }, [dispatch]);

  const handleCloseDialogs = () => {
    setIsCreateDialogOpen(false);
    setIsScheduleActionDialogOpen(false);
    setIsAppointmentCreateOpen(false);
    setIsAppointmentActionDialogOpen(false);
    setIsDeleteCanceledAppointmentDialogOpen(false);
    setSelectedLocationId('');
    setSelectedSlot(null);
    setSelectedSchedule(null);
    setSelectedAppointment(null);
  };

  const handleEventClick = (event: CalendarSchedule | CalendarNutritionistAppointment) => {
    if (event.type === EventType.SCHEDULE) {
      setSelectedSchedule(event as CalendarSchedule);
      setIsScheduleActionDialogOpen(true);
    } else if (event.type === EventType.APPOINTMENT) {
      const appointment = event as CalendarNutritionistAppointment;
      setSelectedAppointment(appointment); // Salva o appointment selecionado em ambos os casos

      if (appointment.status === AppointmentStatus.CANCELADO) {
        setIsDeleteCanceledAppointmentDialogOpen(true);
      } else {
        setIsAppointmentActionDialogOpen(true);
      }
    }
  };

  const handleConfirmCancelAppointment = () => {
    if (!selectedAppointment) return;

    dispatch(
      cancelAppointment({
        appointmentId: selectedAppointment.id,
        startDate: startOfWeek.format('YYYY-MM-DD'),
        endDate: endOfWeek.format('YYYY-MM-DD'),
      }),
    );
    handleCloseDialogs();
  };

  const handleConfirmDeleteSchedule = () => {
    if (!selectedSchedule) return;

    dispatch(deleteSchedule(selectedSchedule.id));
    handleCloseDialogs();
  };

  const handleCreateSchedule = () => {
    if (!selectedSlot || !selectedLocationId) return;

    dispatch(
      createSchedule({
        startTime: selectedSlot.toISOString(),
        durationMinutes: slotDuration,
        locationId: selectedLocationId,
      }),
    );
    handleCloseDialogs();
  };

  const handleConfirmPermanentDeleteAppointment = () => {
    if (!selectedAppointment?.location?.id) {
      console.error('A consulta cancelada não possui ID de local para recriar o horário.');
      handleCloseDialogs();
      return;
    }

    dispatch(
      deleteCanceledAppointment({
        appointmentId: selectedAppointment.id,
      }),
    );
    handleCloseDialogs();
  };

  const handleCreateAppointment = () => {
    // Usa o slot clicado, seja de uma área vazia ou de uma disponibilidade
    const targetSlot =
      selectedSlot || (selectedSchedule ? dayjs(selectedSchedule.startTime) : null);
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
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 3,
          my: 2,
        }}
      >
        {legendItems.map((item) => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              component="span"
              sx={{
                width: 18,
                height: 18,
                backgroundColor: item.color,
                mr: 1,
                borderRadius: '4px',
                border: '1px solid rgba(0,0,0,0.2)',
              }}
            />
            <Typography variant="body2">{item.label}</Typography>
          </Box>
        ))}
      </Box>
      {scheduleStatus === 'loading' ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <CalendarGrid
          startOfWeek={startOfWeek}
          slotDuration={slotDuration}
          events={schedules}
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
          <DialogContentText>Escolha o local para a disponibilidade.</DialogContentText>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="location-select-label">Local de Atendimento</InputLabel>
            <Select
              labelId="location-select-label"
              label="Local de Atendimento"
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value as string)}
            >
              {locationsStatus === 'loading' ? (
                <MenuItem disabled>Carregando locais...</MenuItem>
              ) : (
                locations.map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.address}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialogs} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleCreateSchedule}
            variant="contained"
            autoFocus
            disabled={!selectedLocationId}
          >
            Criar Disponibilidade
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isScheduleActionDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Ação para Horário Disponível</DialogTitle>
        <DialogContent>
          <DialogContentText>
            O que você deseja fazer com o horário das{' '}
            <strong>{dayjs(selectedSchedule?.startTime).format('HH:mm')}</strong> do dia{' '}
            <strong>{dayjs(selectedSchedule?.startTime).format('DD/MM/YYYY')}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button onClick={handleConfirmDeleteSchedule} color="error">
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
      // Dentro do return de ScheduleCreateNutritionistPage.tsx
      {/* Diálogo para consultas AGENDADAS, CONFIRMADAS, etc. */}
      <Dialog open={isAppointmentActionDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Cancelar Consulta</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você tem certeza que deseja <strong>cancelar</strong> a consulta com o paciente{' '}
            <strong>{selectedAppointment?.patient?.name}</strong>? Esta ação não poderá ser
            desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialogs} color="secondary">
            Manter Consulta
          </Button>
          {/* ✅ BOTÃO E FUNÇÃO MODIFICADOS */}
          <Button onClick={handleConfirmCancelAppointment} variant="contained" color="error">
            Sim, Cancelar Consulta
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isDeleteCanceledAppointmentDialogOpen} onClose={handleCloseDialogs}>
        {/* ✅ TÍTULO MODIFICADO */}
        <DialogTitle>Ações para Consulta Cancelada</DialogTitle>
        <DialogContent>
          {/* ✅ TEXTO MODIFICADO */}
          <DialogContentText>
            Esta consulta já está cancelada. O que você deseja fazer?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          {/* ✅ BOTÃO DE EXCLUSÃO PERMANENTE */}
          <Button onClick={handleConfirmPermanentDeleteAppointment} color="error">
            Excluir Registro
          </Button>
          <Box>
            <Button onClick={handleCloseDialogs} color="secondary">
              Nada, manter registro
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      <AppointmentCreateNutritionist
        open={isAppointmentCreateOpen}
        onClose={handleCloseDialogs}
        schedule={selectedSchedule}
        startDate={startOfWeek.format('YYYY-MM-DD')}
        endDate={endOfWeek.format('YYYY-MM-DD')}
      />
    </Container>
  );
};

export default ScheduleCreateNutritionistPage;
