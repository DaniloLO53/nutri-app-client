import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type AppDispatch, type RootState } from '../store';
import {
  clearError,
  resetRegistrationStatus,
} from '../store/slices/auth/registerPatientSlice';
import { type UserSignUpDTO } from '../types/user';
import { toast } from 'react-toastify';
import { registerPatient } from '../store/slices/auth/authThunk';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';

const RegisterPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, registrationSuccess } = useSelector(
    (state: RootState) => state.register,
  );
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<UserSignUpDTO>();

  const onSubmitDispatchSlice: SubmitHandler<UserSignUpDTO> = (data) => {
    dispatch(registerPatient(data));
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }

    if (registrationSuccess) {
      toast.success('Cadastro realizado! Por favor, faça seu login.');
      navigate('/signin');
      dispatch(resetRegistrationStatus());
    }
  }, [error, registrationSuccess, navigate, dispatch]);

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Cadastro
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitDispatchSlice)}
          sx={{ mt: 3 }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="firstName"
            label="Primeiro Nome"
            autoFocus
            {...register('firstName', { required: 'O nome é obrigatório' })}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="lastName"
            label="Sobrenome"
            autoFocus
            {...register('lastName', { required: 'O sobrenome é obrigatório' })}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Endereço de Email"
            type="email"
            {...register('email', {
              required: 'O email é obrigatório',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Endereço de email inválido',
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            id="password"
            {...register('password', {
              required: 'A senha é obrigatória',
              minLength: {
                value: 3,
                message: 'A senha deve ter no mínimo 3 caracteres',
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((show) => !show)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirme a Senha"
            type={showPassword ? 'text' : 'password'}
            id="password-confirmation"
            {...register('passwordConfirmation', {
              required: 'A senha é obrigatória',
              validate: (value) =>
                value === getValues('password') || 'As senhas não correspondem',
            })}
            error={!!errors.passwordConfirmation}
            helperText={errors.passwordConfirmation?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((show) => !show)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="CPF"
            type="text"
            id="cpf"
            {...register('cpf', {
              required: 'O CPF é obrigatório',
              pattern: {
                value: /^\d{11}$/,
                message: 'CPF deve conter apenas 11 números',
              },
            })}
            error={!!errors.cpf}
            helperText={errors.cpf?.message}
          />

          <Box
            sx={{
              marginTop: 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 1 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Cadastrar'
              )}
            </Button>
            <Button
              component={RouterLink}
              to="/signin"
              variant="text"
              size="large"
            >
              Já possui cadastro? Faça o login!
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterPage;
