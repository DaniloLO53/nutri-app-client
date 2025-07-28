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
  DialogActions,
  Button,
} from '@mui/material';

import type { AppDispatch, RootState } from '../store';
import { useDebounce } from '../hooks/useDebounce';
import { clearError } from '../store/slices/appointments/appointmentFromNutritionistSlice';
import { toast } from 'react-toastify';
import {
  clearNutritionistScheduledPatients,
  searchNutritionistScheduledPatients,
} from '../store/slices/patients/nutritionistScheduledPatientsSlice';
import type { NutritionistScheduledPatient } from '../types/nutritionistPatient';
import {
  createNutritionistPatient,
  fetchNutritionistPatients,
} from '../store/slices/patients/nutritionistPatientsSlice';

interface NutritionistPatientCreateProps {
  open: boolean;
  onClose: () => void;
}

const NutritionistPatientCreate = ({ open, onClose }: NutritionistPatientCreateProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { nutritionistScheduledPatientsPage, status, error } = useSelector(
    (state: RootState) => state.nutritionistScheduledPatients,
  );
  const [searchTerm, setSearchTerm] = useState('');

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<NutritionistScheduledPatient | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleLoadMore = () => {
    // Apenas busca mais se não estiver carregando e se não for a última página
    if (status !== 'loading' && !nutritionistScheduledPatientsPage?.last) {
      const nextPage = (nutritionistScheduledPatientsPage?.number ?? 0) + 1;
      dispatch(
        searchNutritionistScheduledPatients({
          name: debouncedSearchTerm,
          page: nextPage,
          size: 20,
        }),
      );
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length >= 3) {
      dispatch(
        searchNutritionistScheduledPatients({ name: debouncedSearchTerm, page: 0, size: 20 }),
      );
    } else {
      dispatch(clearNutritionistScheduledPatients());
    }
  }, [debouncedSearchTerm, dispatch]);

  const handleClose = () => {
    setSearchTerm('');
    dispatch(clearNutritionistScheduledPatients());
    onClose();
  };

  const handlePatientSelect = (patient: NutritionistScheduledPatient) => {
    setSelectedPatient(patient);
    setIsConfirmOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setIsConfirmOpen(false);
    setSelectedPatient(null);
  };

  const handleConfirmCreatePatient = () => {
    if (!selectedPatient) return;

    dispatch(
      createNutritionistPatient({
        patientId: selectedPatient.id,
      }),
    ).then(() => dispatch(fetchNutritionistPatients({ page: 0, size: 20 })));

    handleCloseConfirmDialog(); // Fecha o modal de confirmação
    handleClose(); // Fecha o modal de busca
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Adicionar paciente</DialogTitle>
        <DialogContent>
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
            {status === 'loading' && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            )}
            {status === 'succeeded' && (
              <List>
                {nutritionistScheduledPatientsPage?.content &&
                nutritionistScheduledPatientsPage?.content.length > 0
                  ? nutritionistScheduledPatientsPage?.content.map((patient) => (
                      <ListItemButton key={patient.id} onClick={() => handlePatientSelect(patient)}>
                        <ListItemText primary={patient.name} />
                      </ListItemButton>
                    ))
                  : debouncedSearchTerm && <Typography>Nenhum paciente encontrado.</Typography>}
              </List>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            {status === 'loading' ? (
              <CircularProgress />
            ) : (
              !nutritionistScheduledPatientsPage?.last &&
              nutritionistScheduledPatientsPage?.content?.length &&
              nutritionistScheduledPatientsPage?.content?.length > 0 && (
                <Button variant="text" onClick={handleLoadMore}>
                  Carregar mais
                </Button>
              )
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* SEGUNDO MODAL: Confirmação do Agendamento */}
      <Dialog open={isConfirmOpen} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Confirmar Ação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja adicionar o paciente <strong>{selectedPatient?.name}</strong> a sua lista?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancelar</Button>
          <Button onClick={handleConfirmCreatePatient} variant="contained" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NutritionistPatientCreate;
