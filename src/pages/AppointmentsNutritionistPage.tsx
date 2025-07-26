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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Skeleton,
  CircularProgress,
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

import { AppointmentStatus, type AppointmentStatusEnum } from '../types/appointment';
import type { AppDispatch, RootState } from '../store';
import {
  cancelAppointment,
  clearError as appointmentsClearError,
  requestAppointmentConfirmation,
  fetchAppointments,
} from '../store/slices/appointments/appointmentFromNutritionistSlice';
import { toast } from 'react-toastify';
import type { CalendarNutritionistAppointment } from '../types/schedule';

const AppointmentsNutritionistPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { appointmentsPage, status, error } = useSelector(
    (state: RootState) => state.appointmentFromNutritionist,
  );

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(appointmentsClearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    // Carrega a página 0 apenas se não houver dados
    if (!appointmentsPage) {
      dispatch(fetchAppointments({ page: 0, size: 15 }));
    }
  }, [dispatch, appointmentsPage]);

  const handleLoadMore = () => {
    // Apenas busca mais se não estiver carregando e se não for a última página
    if (status !== 'loading' && !appointmentsPage?.last) {
      const nextPage = (appointmentsPage?.number ?? 0) + 1;
      dispatch(fetchAppointments({ page: nextPage, size: 15 }));
    }
  };

  const handleRequestConfirmation = (appointmentId: string) => {
    console.log('Pedir confirmação para a consulta:', appointmentId);
    dispatch(requestAppointmentConfirmation({ appointmentId })).then(() =>
      dispatch(fetchAppointments({ page: 0, size: 15 })),
    );
  };

  const handleCancelAppointment = (appointmentId: string) => {
    console.log('Cancelar consulta:', appointmentId);
    dispatch(cancelAppointment({ appointmentId })).then(() =>
      dispatch(fetchAppointments({ page: 0, size: 15 })),
    );
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

  const renderAppointmentsList = () => {
    if (status === 'loading' && !appointmentsPage?.content?.length) {
      return renderLoadingSkeleton();
    }
    if (
      status === 'succeeded' &&
      (appointmentsPage === null || appointmentsPage?.content?.length === 0)
    ) {
      return (
        <Typography sx={{ my: 4, textAlign: 'center' }}>
          Você ainda não possui consultas agendadas.
        </Typography>
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
                <TableCell>Paciente</TableCell>
                <TableCell>Data e Hora</TableCell>
                <TableCell>Local</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointmentsPage?.content?.map((appt) => (
                <TableRow key={appt.id}>
                  <TableCell>{appt.isRemote ? 'TELECONSULTA' : 'PRESENCIAL'}</TableCell>
                  <TableCell>{appt.patient?.name}</TableCell>
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
                  <TableCell>{appt.location?.address}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={mapStatusName(appt.status)}
                      color={getStatusChipColor(appt.status ?? 'AGENDADO')}
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
          Últimos Agendamentos
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

const renderLoadingSkeleton = () => (
  <TableContainer component={Paper} sx={{ mt: 3 }}>
    <Table aria-label="carregando agendamentos">
      <TableHead>
        <TableRow
          sx={{
            '& .MuiTableCell-root': { fontWeight: 'bold' },
            backgroundColor: 'grey.100',
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
        {/* Cria 5 linhas de esqueleto como placeholder */}
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton variant="text" width="90%" />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width="80%" />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" />
              <Skeleton variant="text" width="70%" />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width="90%" />
            </TableCell>
            <TableCell align="center">
              <Skeleton
                variant="rectangular"
                width={100}
                height={24}
                sx={{ borderRadius: '16px', mx: 'auto' }}
              />
            </TableCell>
            <TableCell align="center">
              <Skeleton variant="rectangular" width={120} height={36} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default AppointmentsNutritionistPage;
