import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import dayjs from 'dayjs';

// Componentes do MUI
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

import { AppointmentStatus, type AppointmentStatusEnum } from '../types/appointment';
import type { AppDispatch, RootState } from '../store';
import {
  fetchNutritionistAppointments,
  clearError as nutritionistAppointmentsClearError,
} from '../store/slices/appointments/nutritionistAppointmentSlice';
import {
  cancelAppointment,
  clearError as appointmentsClearError,
  requestAppointmentConfirmation,
} from '../store/slices/appointments/appointmentSlice';
import { toast } from 'react-toastify';
import type { CalendarNutritionistAppointment } from '../types/schedule';

const AppointmentsNutritionistPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    appointments: nutritionistAppointments,
    status: nutritionistAppointmentsStatus,
    error: nutritionistAppointmentsError,
  } = useSelector((state: RootState) => state.nutritionistAppointments);
  const { status: appointmentsStatus, error: appointmentsError } = useSelector(
    (state: RootState) => state.appointments,
  );

  useEffect(() => {
    if (appointmentsError) {
      toast.error(appointmentsError);
      dispatch(appointmentsClearError());
    }
    if (nutritionistAppointmentsError) {
      toast.error(nutritionistAppointmentsError);
      dispatch(nutritionistAppointmentsClearError());
    }
  }, [nutritionistAppointmentsError, appointmentsError, dispatch]);

  useEffect(() => {
    // Busca os agendamentos apenas na primeira carga do componente
    if (nutritionistAppointmentsStatus === 'idle') {
      dispatch(fetchNutritionistAppointments());
    }
  }, [nutritionistAppointmentsStatus, dispatch]);

  const handleRequestConfirmation = (appointmentId: string) => {
    console.log('Pedir confirmação para a consulta:', appointmentId);
    // TODO: Despachar a ação para pedir confirmação
    dispatch(requestAppointmentConfirmation({ appointmentId }));
  };

  const handleCancelAppointment = (appointmentId: string) => {
    console.log('Cancelar consulta:', appointmentId);
    dispatch(cancelAppointment({ appointmentId, isNutritionist: true }));
  };

  const getStatusChipColor = (status: AppointmentStatusEnum) => {
    switch (status) {
      case AppointmentStatus.ESPERANDO_CONFIRMACAO:
        return 'warning';
      case AppointmentStatus.CONFIRMADO:
        return 'primary';
      case AppointmentStatus.AGENDADO:
        return 'primary';
      case AppointmentStatus.CONCLUIDO:
        return 'success';
      case AppointmentStatus.CANCELADO:
        return 'error';
      default:
        return 'default';
    }
  };

  const mapStatusName = (status: AppointmentStatusEnum) => {
    switch (status) {
      case AppointmentStatus.ESPERANDO_CONFIRMACAO:
        return 'ESPERANDO CONFIRMAÇÃO';
      case AppointmentStatus.CONFIRMADO:
        return 'CONFIRMADO';
      case AppointmentStatus.AGENDADO:
        return 'AGENDADO';
      case AppointmentStatus.CONCLUIDO:
        return 'CONCLUÍDO';
      case AppointmentStatus.CANCELADO:
        return 'CANCELADO';
      case AppointmentStatus.NAO_COMPARECEU:
        return 'NÃO COMPARECEU';
      default:
        return 'ERRO';
    }
  };

  const renderAppointmentsList = () => {
    if (nutritionistAppointmentsStatus === 'loading' || appointmentsStatus === 'loading') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    if (nutritionistAppointmentsStatus === 'succeeded' && nutritionistAppointments.length === 0) {
      return (
        <Typography sx={{ my: 4, textAlign: 'center' }}>
          Você ainda não possui consultas agendadas.
        </Typography>
      );
    }
    return (
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table aria-label="tabela de agendamentos">
          <TableHead>
            <TableRow
              sx={{
                '& .MuiTableCell-root': { fontWeight: 'bold' },
                backgroundColor: 'lightgrey',
              }}
            >
              <TableCell>Modalidade</TableCell>
              <TableCell>Paciente</TableCell>
              <TableCell>Data e Hora</TableCell>
              <TableCell>Local</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {nutritionistAppointments.map((appt) => (
              <TableRow key={appt.id}>
                <TableCell>{appt.isRemote ? 'TELECONSULTA' : 'PRESENCIAL'}</TableCell>
                <TableCell>{appt.patient.name}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {(() => {
                      const dateString = dayjs(appt.startTime).format(
                        'dddd, D [de] MMMM [de] YYYY',
                      );
                      return dateString.charAt(0).toUpperCase() + dateString.slice(1);
                    })()}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {`${dayjs(appt.startTime).format('HH:mm')} - ${dayjs(appt.startTime)
                      .add(appt.durationMinutes, 'minute')
                      .format('HH:mm')}`}
                  </Typography>
                </TableCell>
                <TableCell>{appt.address}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={mapStatusName(appt.status)}
                    color={getStatusChipColor(appt.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">{renderActionsCell(appt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderActionsCell = (appointment: CalendarNutritionistAppointment) => {
    switch (appointment.status) {
      case AppointmentStatus.AGENDADO:
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              color="primary"
              onClick={() => handleRequestConfirmation(appointment.id)}
            >
              Pedir Confirmação
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleCancelAppointment(appointment.id)}
            >
              Cancelar
            </Button>
          </Box>
        );

      case AppointmentStatus.CONFIRMADO:
      case AppointmentStatus.ESPERANDO_CONFIRMACAO:
        return (
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleCancelAppointment(appointment.id)}
          >
            Cancelar
          </Button>
        );

      case AppointmentStatus.CANCELADO:
      case AppointmentStatus.CONCLUIDO:
      case AppointmentStatus.NAO_COMPARECEU:
      default:
        return (
          <Typography component="span" sx={{ color: 'text.secondary' }}>
            —
          </Typography>
        );
    }
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Meus Agendamentos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<EventAvailableIcon />}
            component={RouterLink}
            to="/nutricionista/horarios/novo" // Rota para criar novos horários
          >
            Gerenciar Horários / Agendamentos
          </Button>
        </Box>
      </Box>

      <Divider />
      {renderAppointmentsList()}
    </Container>
  );
};

export default AppointmentsNutritionistPage;
