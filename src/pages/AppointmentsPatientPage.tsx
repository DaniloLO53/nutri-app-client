import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Fab,
} from '@mui/material';

import dayjs from 'dayjs';
import { AppointmentStatus, type AppointmentStatusEnum } from '../types/appointment';
import type { AppDispatch, RootState } from '../store';
import { fetchFutureAppointments } from '../store/slices/appointments/appointmentSlice';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import type { CalendarPatientAppointment } from '../types/schedule';

const AppointmentsPatientPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { appointments, status, error } = useSelector((state: RootState) => state.appointments);

  useEffect(() => {
    // mudar para enum
    if (status === 'idle') {
      dispatch(fetchFutureAppointments());
    }
  }, [status, dispatch]);

  // Função para determinar a cor do Chip com base no status
  const getStatusChipColor = (status: AppointmentStatusEnum) => {
    switch (status) {
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

  const renderContent = () => {
    if (status === 'loading') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (status === 'failed') {
      return (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Não foi possível carregar os agendamentos.'}
        </Alert>
      );
    }

    if (status === 'succeeded' && appointments.length === 0) {
      return (
        <>
          <Typography sx={{ mt: 4 }}>Você ainda não possui agendamentos.</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'left', mt: 4 }}>
            <Fab
              variant="extended"
              color="primary"
              aria-label="criar nova consulta"
              component={RouterLink}
              to="/agendamentos/novo"
            >
              <AddIcon sx={{ mr: 1 }} />
              Criar Nova Consulta
            </Fab>
          </Box>
        </>
      );
    }

    return (
      <>
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table sx={{ minWidth: 650 }} aria-label="tabela de agendamentos">
            <TableHead>
              <TableRow>
                <TableCell>Especialidade</TableCell>
                <TableCell>Profissional</TableCell>
                <TableCell>Data e Hora</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(appointments as CalendarPatientAppointment[]).map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.isRemote ? 'TELECONSULTA' : 'PRESENCIAL'}</TableCell>
                  <TableCell>{appointment.nutritionist?.name}</TableCell>
                  <TableCell>
                    {dayjs(appointment.startTime).format('DD/MM/YYYY - HH:mm')} -{' '}
                    {dayjs(appointment.startTime)
                      .add(appointment.durationMinutes, 'minute')
                      .format('HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.status}
                      color={getStatusChipColor(appointment.status ?? 'CANCELADO')}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Fab
            variant="extended"
            color="primary"
            aria-label="criar nova consulta"
            component={RouterLink}
            to="/agendamentos/novo"
          >
            <AddIcon sx={{ mr: 1 }} />
            Criar Nova Consulta
          </Fab>
        </Box>
      </>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Meus Agendamentos
      </Typography>
      {renderContent()}
    </Container>
  );
};

export default AppointmentsPatientPage;
