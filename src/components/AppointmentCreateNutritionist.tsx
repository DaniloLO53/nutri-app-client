import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItemText,
  CircularProgress,
  Typography,
  Box,
  ListItemButton,
  DialogContentText,
  FormControlLabel,
  Checkbox,
  DialogActions,
  Button,
} from '@mui/material';

import type { AppDispatch, RootState } from '../store';
import { useDebounce } from '../hooks/useDebounce';
import {
  clearPatientSearch,
  searchPatientsByName,
} from '../store/slices/patients/patientSearchSlice';
import type { PatientSearchResult } from '../types/patient';
import dayjs from 'dayjs';
import {
  clearError,
  createAppointmentForPatient,
} from '../store/slices/appointments/appointmentSlice';
import type { CalendarSchedule } from '../types/schedule';
import { toast } from 'react-toastify';

interface AppointmentCreateNutritionistProps {
  open: boolean;
  onClose: () => void;
  schedule: CalendarSchedule | null;
  startDate: string;
  endDate: string;
}

const AppointmentCreateNutritionist = ({
  open,
  onClose,
  schedule,
  startDate,
  endDate,
}: AppointmentCreateNutritionistProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { patients, status: patientSearchStatus } = useSelector(
    (state: RootState) => state.patientSearch,
  );
  const { error: appointmentsError } = useSelector((state: RootState) => state.appointments);
  const [searchTerm, setSearchTerm] = useState('');

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientSearchResult | null>(null);
  const [isRemote, setIsRemote] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 2000);

  useEffect(() => {
    if (appointmentsError) {
      toast.error(appointmentsError);
      dispatch(clearError());
    }
  }, [appointmentsError, dispatch]);

  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length >= 3) {
      dispatch(searchPatientsByName(debouncedSearchTerm));
    } else {
      dispatch(clearPatientSearch());
    }
  }, [debouncedSearchTerm, dispatch]);

  const handleClose = () => {
    setSearchTerm('');
    dispatch(clearPatientSearch());
    onClose();
  };

  const handlePatientSelect = (patient: PatientSearchResult) => {
    setSelectedPatient(patient);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setIsConfirmOpen(false);
    setSelectedPatient(null);
    setIsRemote(false);
  };

  // Dispara a ação final de criação da consulta
  const handleConfirmAppointment = () => {
    if (!schedule || !selectedPatient) return;

    dispatch(
      createAppointmentForPatient({
        scheduleId: schedule.id,
        patientId: selectedPatient.id,
        isRemote: isRemote,
        startDate,
        endDate,
      }),
    );

    handleCloseConfirmDialog(); // Fecha o modal de confirmação
    handleClose(); // Fecha o modal de busca
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Agendar para um Paciente</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Horário selecionado: {dayjs(schedule?.startTime).format('DD/MM/YYYY [às] HH:mm')}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Buscar paciente pelo nome"
            type="text"
            fullWidth
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Box sx={{ mt: 2, minHeight: '200px' }}>
            {patientSearchStatus === 'loading' && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            )}
            {patientSearchStatus === 'succeeded' && (
              <List>
                {patients.length > 0
                  ? patients.map((patient) => (
                      <ListItemButton key={patient.id} onClick={() => handlePatientSelect(patient)}>
                        <ListItemText primary={patient.fullName} secondary={patient.email} />
                      </ListItemButton>
                    ))
                  : debouncedSearchTerm && <Typography>Nenhum paciente encontrado.</Typography>}
              </List>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* SEGUNDO MODAL: Confirmação do Agendamento */}
      <Dialog open={isConfirmOpen} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Confirmar Agendamento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja confirmar o agendamento para o paciente{' '}
            <strong>{selectedPatient?.fullName}</strong> no dia{' '}
            <strong>{dayjs(schedule?.startTime).format('DD/MM/YYYY [às] HH:mm')}</strong>?
          </DialogContentText>
          <FormControlLabel
            control={
              <Checkbox checked={isRemote} onChange={(e) => setIsRemote(e.target.checked)} />
            }
            label="Marcar como Teleconsulta"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancelar</Button>
          <Button onClick={handleConfirmAppointment} variant="contained" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AppointmentCreateNutritionist;
