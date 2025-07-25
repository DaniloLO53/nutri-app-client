import { useEffect, useState } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Divider,
} from '@mui/material';

import dayjs from 'dayjs';
import { AppointmentStatus, type AppointmentStatusEnum } from '../types/appointment';
import type { AppDispatch, RootState } from '../store';
import {
  cancelAppointment,
  confirmAppointment,
  fetchFutureAppointments,
} from '../store/slices/appointments/appointmentSlice';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import type { CalendarPatientAppointment } from '../types/schedule';

const AppointmentsPatientPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { appointments, status, error } = useSelector((state: RootState) => state.appointments);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [appointmentToCancelId, setAppointmentToCancelId] = useState<string | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [appointmentToConfirmId, setAppointmentToConfirmId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchFutureAppointments());
  }, [dispatch]);

  const handleCancelAppointment = (appointmentId: string) => {
    setAppointmentToCancelId(appointmentId); // Guarda o ID da consulta
    setIsCancelConfirmOpen(true); // Abre o diálogo
  };

  const handleCloseConfirmDialog = () => {
    setIsCancelConfirmOpen(false);
    setAppointmentToCancelId(null); // Limpa o ID guardado
  };

  const handleConfirmCancellation = () => {
    if (appointmentToCancelId) {
      dispatch(cancelAppointment({ appointmentId: appointmentToCancelId, isNutritionist: false }));
    }
    handleCloseConfirmDialog(); // Fecha o diálogo após confirmar
  };

  const handleConfirmAppointment = (appointmentId: string) => {
    setAppointmentToConfirmId(appointmentId);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirmationDialog = () => {
    setIsConfirmOpen(false);
    setAppointmentToConfirmId(null);
  };

  const handleConfirmFinal = () => {
    if (appointmentToConfirmId) {
      dispatch(confirmAppointment({ appointmentId: appointmentToConfirmId }));
    }
    handleCloseConfirmationDialog();
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

  const mapStatusName = (status?: AppointmentStatusEnum) => {
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

  const renderActionsCell = (appointment: CalendarPatientAppointment) => {
    switch (appointment.status) {
      case AppointmentStatus.ESPERANDO_CONFIRMACAO:
        return (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              color="primary"
              onClick={() => handleConfirmAppointment(appointment.id)}
            >
              Confirmar
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

      case AppointmentStatus.AGENDADO:
      case AppointmentStatus.CONFIRMADO:
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

    console.log({ appointments });

    return (
      <>
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
                <TableCell>Profissional</TableCell>
                <TableCell>Data e Hora</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(appointments as CalendarPatientAppointment[]).map((appt) => (
                <TableRow key={appt.id}>
                  <TableCell>{appt.isRemote ? 'TELECONSULTA' : 'PRESENCIAL'}</TableCell>
                  <TableCell>{appt.nutritionist?.name}</TableCell>
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

                  <TableCell align="center">
                    <Chip
                      label={mapStatusName(appt.status)}
                      color={getStatusChipColor(appt.status ?? 'CANCELADO')}
                      size="small"
                    />
                  </TableCell>

                  <TableCell align="center">{renderActionsCell(appt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Fab
            variant="extended"
            color="primary"
            aria-label="agendar nova consulta"
            component={RouterLink}
            to="/agendamentos/novo"
          >
            <AddIcon sx={{ mr: 1 }} />
            Agendar Nova Consulta
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
      <Divider />
      {renderContent()}

      <Dialog
        open={isCancelConfirmOpen}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmar Cancelamento</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Você tem certeza que deseja cancelar esta consulta? Esta ação não poderá ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Voltar</Button>
          <Button onClick={handleConfirmCancellation} color="error" variant="contained" autoFocus>
            Sim, Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isConfirmOpen} onClose={handleCloseConfirmationDialog}>
        <DialogTitle>Confirmar Consulta</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja confirmar sua presença nesta consulta? Um email de confirmação será enviado ao
            profissional.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmationDialog}>Voltar</Button>
          <Button onClick={handleConfirmFinal} variant="contained" color="primary" autoFocus>
            Sim, Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AppointmentsPatientPage;
