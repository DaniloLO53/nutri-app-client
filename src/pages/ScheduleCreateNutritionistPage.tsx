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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogActions,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import type { AppDispatch, RootState } from '../store';
import {
  createSchedule,
  deleteSchedule,
  fetchOwnSchedule,
  deleteCanceledAppointment,
  clearError,
} from '../store/slices/schedules/scheduleSlice';
import CalendarGrid from '../components/CalendarGrid';
import AppointmentCreateNutritionist from '../components/AppointmentCreateNutritionist';
import {
  EventType,
  type CalendarNutritionistAppointment,
  type CalendarSchedule,
} from '../types/schedule';
import { fetchLocations } from '../store/slices/locations/locationSlice';
import { green } from '@mui/material/colors';
import { AppointmentStatus } from '../types/appointment';
import { toast } from 'react-toastify';
import { cancelAppointment } from '../store/slices/appointments/appointmentFromNutritionistSlice';
import CalendarGridSkeleton from '../components/CalendarGridSkeleton';

const DURATIONS = [15, 30, 45, 60];

const ScheduleCreateNutritionistPage = () => {
  const dispatch = useDispatch<AppDispatch>();

  const state = useSelector((state: RootState) => state);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  const [currentDate, setCurrentDate] = useState(dayjs());
  const [slotDuration, setSlotDuration] = useState(30);

  const [isAppointmentActionDialogOpen, setIsAppointmentActionDialogOpen] = useState(false);
  const [isAppointmentDetailOpen, setIsAppointmentDetailOpen] = useState(false);
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
  const startDate = startOfWeek.format('YYYY-MM-DD');
  const endDate = endOfWeek.format('YYYY-MM-DD');

  const legendItems = [
    { label: 'Disponível', color: 'primary.light' }, // Azul claro
    { label: 'Agendado', color: green[200] }, // Verde bem claro
    { label: 'Esperando Confirmação', color: 'success.light' }, // Verde claro
    { label: 'Confirmado', color: 'success.dark' }, // Verde escuro
    { label: 'Concluído', color: 'grey.500' }, // Cinza
    { label: 'Cancelado', color: 'error.light' }, // Vermelho claro
    { label: 'Não Compareceu', color: 'error.dark' }, // Vermelho escuro
  ];

  useEffect(() => {
    if (state.schedule.error) {
      toast.error(state.schedule.error);
      dispatch(clearError());
    }

    dispatch(fetchOwnSchedule({ startDate, endDate }));
  }, [dispatch, startDate, endDate, state.schedule.error]);

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
    setIsAppointmentDetailOpen(false);
    setSelectedLocationId('');
    setSelectedSlot(null);
    setSelectedSchedule(null);
    setSelectedAppointment(null);
  };

  const handleViewAppointmentDetails = () => {
    setIsAppointmentActionDialogOpen(false); // Fecha o modal de ação
    setIsAppointmentDetailOpen(true); // Abre o modal de detalhes
  };

  const handleEventClick = (event: CalendarSchedule | CalendarNutritionistAppointment) => {
    if (event.type === EventType.SCHEDULE) {
      setSelectedSchedule(event as CalendarSchedule);
      setIsScheduleActionDialogOpen(true);
    } else if (event.type === EventType.APPOINTMENT) {
      const appointment = event as CalendarNutritionistAppointment;
      setSelectedAppointment(appointment);

      // Lógica condicional baseada no status
      if (
        appointment.status === AppointmentStatus.AGENDADO ||
        appointment.status === AppointmentStatus.CONFIRMADO
      ) {
        // Abre o diálogo de ações para consultas ativas
        setIsAppointmentActionDialogOpen(true);
      } else if (appointment.status === AppointmentStatus.CANCELADO) {
        // Abre o diálogo de recriar/excluir para consultas canceladas
        setIsDeleteCanceledAppointmentDialogOpen(true);
      } else {
        // Para outros status (CONCLUIDO, etc.), abre os detalhes diretamente
        setIsAppointmentDetailOpen(true);
      }
    }
  };

  const handleConfirmCancelAppointment = () => {
    if (!selectedAppointment) return;

    dispatch(cancelAppointment({ appointmentId: selectedAppointment.id })).then(() =>
      dispatch(fetchOwnSchedule({ startDate, endDate })),
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
    ).then(() => dispatch(fetchOwnSchedule({ startDate, endDate })));
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
          alignItems: 'start',
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
      {state.schedule.status === 'loading' ? (
        <CalendarGridSkeleton startOfWeek={startOfWeek} slotDuration={slotDuration} />
      ) : (
        <CalendarGrid
          startOfWeek={startOfWeek}
          slotDuration={slotDuration}
          events={state.schedule.schedules}
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
              {state.locations.status === 'loading' ? (
                <MenuItem disabled>Carregando locais...</MenuItem>
              ) : (
                state.locations.locations.map((location) => (
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
      <Dialog open={isAppointmentActionDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Ações para Consulta</DialogTitle>
        <DialogContent>
          <DialogContentText>
            O que deseja fazer com a consulta do paciente{' '}
            <strong>{selectedAppointment?.patient?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          {/* ✅ NOVO BOTÃO DE VER INFORMAÇÕES */}
          <Button onClick={handleViewAppointmentDetails} variant="outlined">
            Ver Informações
          </Button>
          <Box>
            <Button onClick={handleCloseDialogs} color="secondary">
              Manter Consulta
            </Button>
            <Button onClick={handleConfirmCancelAppointment} variant="contained" color="error">
              Cancelar Consulta
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      <Dialog open={isAppointmentDetailOpen} onClose={handleCloseDialogs} fullWidth maxWidth="xs">
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Detalhes da Consulta
          <IconButton onClick={handleCloseDialogs} sx={{ p: 0 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedAppointment && ( // Garante que há uma consulta selecionada
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Paciente
                </Typography>
                <Typography variant="body1">{selectedAppointment.patient?.name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Local de Atendimento
                </Typography>
                <Typography variant="body1">{selectedAppointment.location?.address}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Data e Horário
                </Typography>
                <Typography variant="body1">
                  {`${dayjs(selectedAppointment.startTime).format('dddd, D [de] MMMM [de] YYYY')}`}
                  <br />
                  {'Das '}
                  <strong>{dayjs(selectedAppointment.startTime).format('HH:mm')}</strong>
                  {' às '}
                  <strong>
                    {dayjs(selectedAppointment.startTime)
                      .add(selectedAppointment.durationMinutes, 'minute')
                      .format('HH:mm')}
                  </strong>
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Modalidade
                </Typography>
                <Typography variant="body1">
                  {selectedAppointment.isRemote ? 'Teleconsulta' : 'Presencial'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {selectedAppointment.status}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Fechar</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isDeleteCanceledAppointmentDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Ações para Consulta Cancelada</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Esta consulta já está cancelada. O que você deseja fazer?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
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
        currentDate={currentDate}
      />
    </Container>
  );
};

export default ScheduleCreateNutritionistPage;
