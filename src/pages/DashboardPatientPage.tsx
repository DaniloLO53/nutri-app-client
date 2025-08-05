import { Container, Typography, Box } from '@mui/material';

import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardCard from '../components/DashboardCard';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import type { RootState } from '../store';

const dashboardItems = [
  {
    icon: <EventNoteIcon />,
    title: 'Agendamentos',
    description: 'Veja seus próximos agendamentos e marque novas consultas.',
    path: '/agendamentos/paciente',
  },
  {
    icon: <AccountCircleIcon />,
    title: 'Meu Perfil',
    description: 'Atualize suas informações pessoais e de contato.',
    path: '/perfil',
  },
];

const DashboardPage = () => {
  const { userInfo } = useSelector((state: RootState) => state.signIn);
  const [firstName, setFirstName] = useState<string>('');

  useEffect(() => {
    setFirstName(userInfo?.firstName || '');
  }, [userInfo]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bem-vindo(a), {firstName}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Acesse rapidamente os serviços disponíveis.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          justifyContent: 'center',
        }}
      >
        {dashboardItems.map((item) => (
          <DashboardCard
            key={item.title}
            icon={item.icon}
            title={item.title}
            description={item.description}
            path={item.path}
          />
        ))}
      </Box>
    </Container>
  );
};

export default DashboardPage;
