// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0D99FF', // Seu azul primário
    },
    secondary: {
      main: '#6c757d', // Seu cinza secundário
    },
    error: {
      main: '#dc3545',
    },
    background: {
      default: '#f4f6f8',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    button: {
      textTransform: 'none', // Remove o uppercase padrão dos botões
      fontWeight: 'bold',
    },
  },
  spacing: 8, // O fator de espaçamento base (1 = 8px)
  shape: {
    borderRadius: 8, // Bordas arredondadas
  },
});

export default theme;
