import { Link as RouterLink } from 'react-router-dom';
import { Typography, Button, Container } from '@mui/material';

const NotFoundPage = () => {
  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{ textAlign: 'center', mt: 8, py: 4 }}
    >
      <Typography
        variant="h1"
        component="h1"
        fontWeight="bold"
        color="primary"
        gutterBottom
      >
        404
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Página Não Encontrada
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Desculpe, a página que você está procurando não existe ou foi movida.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained" size="large">
        Voltar para a Página Inicial
      </Button>
    </Container>
  );
};

export default NotFoundPage;
