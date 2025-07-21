import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { type AppDispatch, type RootState } from '../store';
import { clearError } from '../store/slices/auth/registerPatientSlice';
import { UserRole, type UserSignInDTO } from '../types/user';
import { toast } from 'react-toastify';
import { signInUser } from '../store/slices/auth/authThunk';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const SignInPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error, userInfo, signInSuccess } = useSelector(
    (state: RootState) => state.signIn,
  );
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserSignInDTO>({
    defaultValues: {
      role: UserRole.ROLE_PATIENT,
    },
  });

  const onSubmitDispatchSlice: SubmitHandler<UserSignInDTO> = (data) => {
    dispatch(signInUser(data));
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }

    if (signInSuccess) {
      toast.success('Paciente logado com sucesso!');
    }
  }, [error, userInfo, signInSuccess, navigate, dispatch]);

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
          Faça seu login
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

          <FormControl fullWidth margin="normal">
            <InputLabel id="role-select-label">Eu sou</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              label="Eu sou"
              {...register('role', { required: 'Selecione um perfil' })}
              defaultValue={UserRole.ROLE_PATIENT}
            >
              <MenuItem value={UserRole.ROLE_PATIENT}>Paciente</MenuItem>
              <MenuItem value={UserRole.ROLE_NUTRITIONIST}>
                Nutricionista
              </MenuItem>
            </Select>
          </FormControl>

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
                'Entrar'
              )}
            </Button>
            <Button
              component={RouterLink}
              to="/cadastro/pacientes"
              variant="text"
              size="large"
            >
              Não possui cadastro? Faça já o seu!
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default SignInPage;
