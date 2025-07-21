import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const LandingPage = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="calc(100vh - 64px)"
    >
      <Typography variant="h2" component="h1" gutterBottom>
        Bem-vindo ao NutriApp
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        Sua plataforma de conexão com nutricionistas.
      </Typography>
      <Box>
        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="/signin"
          sx={{ mr: 2 }}
        >
          Fazer Login
        </Button>
        <Button
          variant="outlined"
          size="large"
          component={RouterLink}
          to="/cadastro/pacientes"
        >
          Criar Conta
        </Button>
      </Box>
    </Box>
  );
};

export default LandingPage;
