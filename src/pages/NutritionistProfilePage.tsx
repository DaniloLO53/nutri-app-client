import { useEffect, useState } from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIcon from '@mui/icons-material/Phone';
import type { AppDispatch, RootState } from '../store';
import type { IBGECity, IBGEState } from '../types/ibgeApiRegions';
import {
  fetchNutritionistProfile,
  updateNutritionistProfile,
} from '../store/slices/nutritionistProfiles/nutritionistProfileSlice';
import type { NutritionistLocation, NutritionistProfile } from '../types/nutritionistProfile';

const NutritionistProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, status, error } = useSelector((state: RootState) => state.nutritionistProfile);

  const [ibgeStates, setIbgeStates] = useState<IBGEState[]>([]);
  const [ibgeCities, setIbgeCities] = useState<IBGECity[]>([]);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);

  const [newSelectedState, setNewSelectedState] = useState<IBGEState | null>(null);
  const [newSelectedCity, setNewSelectedCity] = useState<IBGECity | null>(null);
  const [newAddress, setNewAddress] = useState('');
  const [newPhone1, setNewPhone1] = useState('');
  const [newPhone2, setNewPhone2] = useState('');
  const [newPhone3, setNewPhone3] = useState('');

  const { register, control, handleSubmit, reset } = useForm<NutritionistProfile>({
    // Define a estrutura inicial do formulário
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      crf: '',
      acceptsRemote: false, // Importante para o checkbox
      locations: [], // MUITO importante para o useFieldArray
    },
  });

  const { fields, append, remove } = useFieldArray<NutritionistProfile>({
    control,
    name: 'locations',
  });

  // useEffect para popular o formulário quando os dados do perfil chegarem
  useEffect(() => {
    // Define uma função async para poder usar await e tratar erros
    const loadInitialData = async () => {
      // 1. Despacha as ações para buscar dados do seu backend via Redux
      dispatch(fetchNutritionistProfile());

      // 2. Busca os dados externos do IBGE com tratamento de erro
      try {
        const response = await axios.get<IBGEState[]>(
          'http://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome',
        );
        setIbgeStates(response.data);
      } catch (error) {
        console.error('Erro ao buscar estados do IBGE:', error);
        // Opcional: você pode setar um estado de erro para notificar o usuário
      }
    };

    // Chama a função para carregar os dados
    loadInitialData();
  }, [dispatch, reset]); // 3. O array de dependências correto

  useEffect(() => {
    if (!newSelectedState) {
      setIbgeCities([]);
      return;
    }
    const fetchCities = async () => {
      setIsCitiesLoading(true);
      try {
        const response = await axios.get<IBGECity[]>(
          `http://servicodados.ibge.gov.br/api/v1/localidades/estados/${newSelectedState.id}/municipios`,
        );
        setIbgeCities(response.data);
      } finally {
        setIsCitiesLoading(false);
      }
    };
    fetchCities();
  }, [newSelectedState]);

  // Efeito para popular o formulário quando os dados do perfil chegarem
  useEffect(() => {
    // 'profile' são os dados que vieram da sua API via Redux
    if (profile) {
      // 'reset(profile)' preenche todo o formulário com os dados do perfil.
      // Ele faz a correspondência das chaves do objeto 'profile' com os nomes
      // dos campos que você registrou (ex: 'fullName', 'email', 'healthPlans').
      reset(profile);
    }
  }, [profile, reset]); // Roda sempre que 'profile' mudar

  const onSubmit: SubmitHandler<NutritionistProfile> = (data) => {
    const transformedData = {
      ...data,
      locations: data.locations?.map((location) => ({
        ...location,
        phone2: location.phone2 || null, // Converte "" para null
        phone3: location.phone3 || null, // Converte "" para null
      })),
    };

    dispatch(updateNutritionistProfile(transformedData));
  };

  const handleAddLocation = () => {
    if (newSelectedState && newSelectedCity && newAddress && newPhone1) {
      const newLocation: NutritionistLocation = {
        ibgeApiState: newSelectedState.sigla,
        ibgeApiCity: newSelectedCity.nome,
        ibgeApiIdentifierState: newSelectedState.id,
        address: newAddress,
        phone1: newPhone1,
        phone2: newPhone2 || null,
        phone3: newPhone3 || null,
      };
      append(newLocation);

      // Limpa os campos do formulário de adição
      setNewSelectedState(null);
      setNewSelectedCity(null);
      setNewAddress('');
      setNewPhone1('');
      setNewPhone2('');
      setNewPhone3('');
      setIbgeCities([]);
    }
  };

  if (status === 'loading') return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Editar Perfil
      </Typography>

      <Paper component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3 }}>
        <Typography variant="h6">Informações Pessoais</Typography>
        <TextField fullWidth margin="normal" label="Nome Completo" {...register('firstName')} />
        <TextField fullWidth margin="normal" label="Nome Completo" {...register('lastName')} />
        <TextField fullWidth margin="normal" label="Email" type="email" {...register('email')} />
        <TextField fullWidth margin="normal" label="CRF" {...register('crf')} />
        <FormControlLabel
          control={<Checkbox {...register('acceptsRemote')} />}
          label="Aceita Teleconsulta"
        />

        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Locais de Atendimento
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {fields.map((field, index) => (
            <Paper key={field.id} variant="outlined" sx={{ p: 2, position: 'relative' }}>
              <IconButton
                onClick={() => remove(index)}
                color="error"
                size="small"
                sx={{ position: 'absolute', top: 8, right: 8 }}
              >
                <DeleteIcon />
              </IconButton>
              <Typography fontWeight="bold">{field.address}</Typography>
              <Typography
                variant="body2"
                color="text.secondary"
              >{`${field.ibgeApiCity}, ${field.ibgeApiState}`}</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} /> {field.phone1}
                </Typography>
                {field.phone2 && (
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} /> {field.phone2}
                  </Typography>
                )}
                {field.phone3 && (
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} /> {field.phone3}
                  </Typography>
                )}
              </Box>
            </Paper>
          ))}
        </Box>

        <Box sx={{ mt: 3, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Adicionar Novo Local de Atendimento
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                label="Estado"
                value={newSelectedState?.sigla || ''}
                onChange={(e) =>
                  setNewSelectedState(ibgeStates.find((s) => s.sigla === e.target.value) || null)
                }
              >
                {ibgeStates.map((s) => (
                  <MenuItem key={s.id} value={s.sigla}>
                    {s.sigla}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth disabled={!newSelectedState || isCitiesLoading}>
              <InputLabel>Município</InputLabel>
              <Select
                label="Município"
                value={newSelectedCity?.nome || ''}
                onChange={(e) =>
                  setNewSelectedCity(ibgeCities.find((c) => c.nome === e.target.value) || null)
                }
              >
                {isCitiesLoading ? (
                  <MenuItem disabled>Carregando...</MenuItem>
                ) : (
                  ibgeCities.map((c) => (
                    <MenuItem key={c.id} value={c.nome}>
                      {c.nome}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Endereço Completo"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              sx={{ gridColumn: '1 / -1' }}
            />
            <TextField
              fullWidth
              label="Telefone 1"
              value={newPhone1}
              onChange={(e) => setNewPhone1(e.target.value)}
            />
            <TextField
              fullWidth
              label="Telefone 2 (Opcional)"
              value={newPhone2}
              onChange={(e) => setNewPhone2(e.target.value)}
            />
            <TextField
              fullWidth
              label="Telefone 3 (Opcional)"
              value={newPhone3}
              onChange={(e) => setNewPhone3(e.target.value)}
            />
          </Box>
          <Button
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleAddLocation}
            disabled={!newSelectedState || !newSelectedCity || !newAddress || !newPhone1}
            sx={{ mt: 2 }}
          >
            Adicionar Local
          </Button>
        </Box>

        <Button type="submit" variant="contained" size="large" sx={{ mt: 4 }}>
          Salvar Alterações
        </Button>
      </Paper>
    </Container>
  );
};

export default NutritionistProfilePage;
