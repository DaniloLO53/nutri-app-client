import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
  Typography,
  Container,
  Paper,
  TextField,
  Button,
  Divider,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

import type { AppDispatch, RootState } from '../store';
import type { IBGEState, IBGECity } from '../types/ibgeApiRegions';
import {
  clearSearchResults,
  searchAvailableNutritionists,
} from '../store/slices/schedules/availableNutritionistSearchSlice';
import AvailableNutritionistResultCard from '../components/AvailableNutritionistResultCard';

interface SearchFormInputs {
  nutritionistName: string;
  ibgeApiState: string;
  ibgeApiCity: string;
  acceptsRemote: boolean;
}

const AppointmentCreatePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { nuritionists, status, error } = useSelector(
    (state: RootState) => state.availableNutritionistSearch,
  );

  const [states, setStates] = useState<IBGEState[]>([]);
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const { register, handleSubmit, watch, setValue } = useForm<SearchFormInputs>({
    defaultValues: {
      nutritionistName: '',
      ibgeApiState: '',
      ibgeApiCity: '',
      acceptsRemote: false,
    },
  });

  const selectedState = watch('ibgeApiState');
  const isRemote = watch('acceptsRemote');

  useEffect(() => {
    if (isRemote) {
      setValue('ibgeApiState', '');
      setValue('ibgeApiCity', '');
    }
  }, [isRemote, setValue]);

  // useEffect para buscar estados
  // UseEffect para buscar os estados do IBGE quando o componente montar
  useEffect(() => {
    const fetchStates = async () => {
      setIsLoadingStates(true);
      try {
        const response = await axios.get<IBGEState[]>(
          'http://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome',
        );
        setStates(response.data);
      } catch (err) {
        console.error('Erro ao buscar estados do IBGE', err);
        // Opcional: setar um estado de erro para a busca de estados
      } finally {
        setIsLoadingStates(false);
      }
    };

    fetchStates();
  }, []); // O array vazio [] garante que isso só rode uma vez

  useEffect(() => {
    // Se nenhum estado for selecionado, limpe a lista de municípios e retorne
    if (!selectedState) {
      setCities([]);
      return;
    }

    const fetchCities = async () => {
      const stateObj = states.find((s) => s.sigla === selectedState);
      if (!stateObj) return;

      setIsLoadingCities(true);
      try {
        const response = await axios.get<IBGECity[]>(
          `http://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateObj.id}/municipios`,
        );
        setCities(response.data);
      } catch (err) {
        console.error('Erro ao buscar municípios do IBGE', err);
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
    // Reseta o valor do campo de município sempre que o estado mudar
    setValue('ibgeApiCity', '');
  }, [selectedState, states, setValue]); // <-- Roda este efeito quando 'selectedState' mudar

  useEffect(() => {
    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch]);

  const onSubmit: SubmitHandler<SearchFormInputs> = (data) => {
    dispatch(searchAvailableNutritionists(data));
  };

  const renderResults = () => {
    if (status === 'loading') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (status === 'failed') {
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      );
    }

    if (status === 'succeeded' && nuritionists.length === 0) {
      return (
        <Typography sx={{ mt: 2 }}>
          Nenhum nutricionista encontrado com os critérios informados.
        </Typography>
      );
    }

    return (
      <Box sx={{ mt: 4 }}>
        {nuritionists.map((nutritionist, index) => (
          <AvailableNutritionistResultCard
            key={`${nutritionist.id}-${index}`}
            nutritionist={nutritionist}
          />
        ))}
      </Box>
    );
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Nova Consulta
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Encontre um nutricionista disponível para você.
      </Typography>

      <Paper component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Buscar por
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            mb: 2,
          }}
        >
          <TextField fullWidth label="Nome do Profissional" {...register('nutritionistName')} />

          <FormControlLabel
            control={<Checkbox {...register('acceptsRemote')} />}
            label="Apenas Teleconsulta"
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth disabled={isLoadingStates || isRemote}>
            <InputLabel id="state-select-label">Estado</InputLabel>
            <Select
              labelId="state-select-label"
              label="Estado"
              defaultValue=""
              {...register('ibgeApiState')}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {states.map((state) => (
                <MenuItem key={state.id} value={state.sigla}>
                  {state.nome} ({state.sigla})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={!selectedState || isLoadingCities || isRemote}>
            <InputLabel id="city-select-label">Município</InputLabel>
            <Select
              labelId="city-select-label"
              label="Município"
              defaultValue=""
              {...register('ibgeApiCity')}
            >
              <MenuItem value="">
                <em>Todos</em>
              </MenuItem>
              {cities.map((city) => (
                <MenuItem key={city.id} value={city.nome}>
                  {city.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Button type="submit" variant="contained" disabled={status === 'loading'}>
          Buscar
        </Button>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {renderResults()}
    </Container>
  );
};

export default AppointmentCreatePage;
