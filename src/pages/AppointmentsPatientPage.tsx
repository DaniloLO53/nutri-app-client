import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Container,
  Typography,
  Box,
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
  Skeleton,
  CircularProgress,
} from '@mui/material';

import dayjs from 'dayjs';
import { AppointmentStatus, type AppointmentStatusEnum } from '../types/appointment';
import type { AppDispatch, RootState } from '../store';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import type { CalendarPatientAppointment } from '../types/schedule';
import {
  cancelAppointment,
  confirmAppointment,
  fetchAppointments,
  clearError as appointmentsClearError,
} from '../store/slices/appointments/appointmentFromPatientSlice';
import { toast } from 'react-toastify';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const AppointmentsPatientPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { appointmentsPage, status, error } = useSelector(
    (state: RootState) => state.appointmentFromPatient,
  );
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [appointmentToCancelId, setAppointmentToCancelId] = useState<string | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [appointmentToConfirmId, setAppointmentToConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(appointmentsClearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    // Carrega a página 0 apenas se não houver dados no estado
    if (!appointmentsPage) {
      dispatch(fetchAppointments({ page: 0, size: 15 }));
    }
  }, [dispatch, appointmentsPage]);

  const handleLoadMore = () => {
    if (status !== 'loading' && !appointmentsPage?.last) {
      const nextPage = (appointmentsPage?.number ?? 0) + 1;
      dispatch(fetchAppointments({ page: nextPage, size: 15 }));
    }
  };

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
      dispatch(cancelAppointment({ appointmentId: appointmentToCancelId })).then(() =>
        dispatch(fetchAppointments({ page: 0, size: 15 })),
      );
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
      dispatch(confirmAppointment({ appointmentId: appointmentToConfirmId })).then(() =>
        dispatch(fetchAppointments({ page: 0, size: 15 })),
      );
    }
    handleCloseConfirmationDialog();
  };

  const getStatusChipColor = (status: AppointmentStatusEnum) => {
    switch (status) {
      case AppointmentStatus.ESPERANDO_CONFIRMACAO:
        return 'warning';
      case AppointmentStatus.CONFIRMADO:
        return 'success';
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
    if (status === 'loading' && !appointmentsPage?.content?.length) {
      return renderLoadingSkeleton();
    }

    if (status === 'failed') {
      return (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Não foi possível carregar os agendamentos.'}
        </Alert>
      );
    }

    if (
      status === 'succeeded' &&
      (appointmentsPage === null || appointmentsPage.content.length === 0)
    ) {
      return (
        <>
          <Typography sx={{ mt: 4 }}>Você ainda não possui agendamentos.</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'left', mt: 4 }}>
            <Fab
              variant="extended"
              color="primary"
              aria-label="agendar consulta"
              component={RouterLink}
              to="/agendamentos/novo"
            >
              <AddIcon sx={{ mr: 1 }} />
              Agendar Consulta
            </Fab>
          </Box>
        </>
      );
    }

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
              {appointmentsPage?.content.map((appt) => (
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

                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="caption" color="text.secondary">
                        {`${dayjs(appt.startTime).format('HH:mm')} - ${dayjs(appt.startTime)
                          .add(appt.durationMinutes, 'minute')
                          .format('HH:mm')}`}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {appt.location.address}
                      </Typography>
                    </Box>
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

        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          {status === 'loading' ? (
            <CircularProgress />
          ) : (
            !appointmentsPage?.last &&
            appointmentsPage?.content?.length &&
            appointmentsPage?.content?.length > 0 && (
              <Button variant="text" onClick={handleLoadMore}>
                Carregar mais
              </Button>
            )
          )}
        </Box>
      </>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Últimos Agendamentos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<EventAvailableIcon />}
            component={RouterLink}
            to="/agendamentos/novo" // Rota para criar novos horários
          >
            Agendar Consulta
          </Button>
        </Box>
      </Box>

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

const renderLoadingSkeleton = () => {
  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table aria-label="carregando agendamentos">
        <TableHead>
          <TableRow
            sx={{
              '& .MuiTableCell-root': { fontWeight: 'bold' },
              backgroundColor: 'grey.100', // Um cinza bem clarinho
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
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton variant="text" width="80%" />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width="90%" />
              </TableCell>
              <TableCell>
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="60%" />
              </TableCell>
              <TableCell align="center">
                <Skeleton
                  variant="rectangular"
                  width={80}
                  height={24}
                  sx={{ borderRadius: '16px', mx: 'auto' }}
                />
              </TableCell>
              <TableCell align="center">
                <Skeleton variant="rectangular" width={100} height={32} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AppointmentsPatientPage;
