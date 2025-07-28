import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

// Componentes do Material-UI
import {
  Container,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Tipos e Ações (que você irá criar)
import type { AppDispatch, RootState } from '../store';
// Supondo que você criará um thunk chamado 'fetchNutritionistPatients' em um 'patientSlice'
import { fetchNutritionistPatients } from '../store/slices/patients/nutritionistPatientsSlice';
import NutritionistPatientCreate from '../components/NutritionistPatientCreate';

// Interface de exemplo para o tipo Paciente
interface Patient {
  id: string;
  name: string;
  profilePictureUrl?: string; // URL da foto de perfil
  lastAppointmentDate: string; // Data da última consulta no formato ISO (ex: "2025-07-26T10:00:00Z")
}

const MyPatientsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Supondo que o estado dos pacientes no Redux terá esta estrutura
  const { nutritionistPatientsPage, status } = useSelector(
    (state: RootState) => state.nutritionistPatients,
  );
  const patients = nutritionistPatientsPage?.content ?? [];
  const hasMore = !nutritionistPatientsPage?.last;

  const [isNutritionistPatientCreateOpen, setIsNutritionistPatientCreateOpen] = useState(false);
  const [page, setPage] = useState(0);

  // Efeito para buscar a primeira página de pacientes ao montar o componente
  useEffect(() => {
    // Apenas busca na primeira vez
    if (page === 0) {
      dispatch(fetchNutritionistPatients({ page: 0, size: 20 }));
    }
  }, [dispatch, page]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    // Busca a próxima página de pacientes
    // O seu slice do Redux deve ser configurado para ANEXAR esses novos pacientes à lista existente
    dispatch(fetchNutritionistPatients({ page: nextPage, size: 20 }));
  };

  const handlePatientClick = (patientId: string) => {
    // Redireciona para a página de detalhes do paciente
    navigate(`/pacientes/${patientId}`);
  };

  const handleOpenCreateDialog = () => {
    setIsNutritionistPatientCreateOpen(true);
  };

  const handleCloseDialogs = () => {
    setIsNutritionistPatientCreateOpen(false);
  };

  // Renderiza o esqueleto de carregamento
  const renderSkeletons = () => (
    <List>
      {Array.from(new Array(5)).map((_, index) => (
        <ListItem key={index} disablePadding>
          <ListItemButton>
            <ListItemAvatar>
              <Skeleton animation="wave" variant="circular" width={40} height={40} />
            </ListItemAvatar>
            <ListItemText
              primary={<Skeleton animation="wave" height={20} width="40%" />}
              secondary={<Skeleton animation="wave" height={15} width="30%" />}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      {/* Cabeçalho da página com Título e Botão de Adicionar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Meus Pacientes
        </Typography>

        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
          Adicionar Paciente
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Lógica de Renderização: Carregando, Vazio ou Lista de Pacientes */}
      {status === 'loading' && patients.length === 0 ? (
        renderSkeletons()
      ) : patients.length === 0 ? (
        <Typography sx={{ textAlign: 'center', mt: 5 }}>
          Você ainda não possui pacientes cadastrados.
        </Typography>
      ) : (
        <List sx={{ bgcolor: 'background.paper' }}>
          {patients.map((patient: Patient, index: number) => (
            <div key={patient.id}>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handlePatientClick(patient.id)}>
                  <ListItemAvatar>
                    <Avatar alt={patient.name} src={patient.profilePictureUrl} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={patient.name}
                    secondary={`Última consulta: ${dayjs(patient.lastAppointmentDate).format('DD [de] MMMM [de] YYYY')}`}
                  />
                </ListItemButton>
              </ListItem>
              {index < patients.length - 1 && <Divider variant="inset" component="li" />}
            </div>
          ))}
        </List>
      )}

      <NutritionistPatientCreate
        open={isNutritionistPatientCreateOpen}
        onClose={handleCloseDialogs}
      />

      {/* Botão de "Carregar Mais" e Indicador de Carregamento */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        {status === 'loading' && patients.length > 0 && <CircularProgress />}
        {status !== 'loading' && hasMore && (
          <Button variant="text" onClick={handleLoadMore}>
            Carregar mais
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default MyPatientsPage;
