import { useState, useEffect, type SyntheticEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

// Componentes do Material-UI
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  TextField,
  Tabs,
  Tab,
  Paper,
  Autocomplete,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  type SelectChangeEvent,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';

// Tipos e Ações (que você irá criar)
import type { AppDispatch } from '../store';
import type {
  ClinicalInformationForm,
  FormAllergen,
  FormDiagnosedDisease,
  FormFamilyDisease,
  FormFoodPreference,
  FormMedication,
  FormSymptom,
} from '../types/clinicalInformation';
// Exemplo de Thunks que você precisaria criar:
// import {
//   fetchClinicalInformation,
//   saveClinicalInformation,
// } from '../store/slices/clinicalInformationSlice';
// import { fetchClinicalInformationMasterData } from '../store/slices/clinicalInformationMasterData'; // Thunk para buscar sintomas, doenças, etc.

// Componente para o painel de abas
const TabPanel = (props: { children?: React.ReactNode; index: number; value: number }) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

interface CustomFieldDefinition {
  id: string;
  fieldLabel: string;
  fieldType: 'TEXTO' | 'NUMERO' | 'DATA' | 'BOOLEANO';
  unit?: string;
}

const ClinicalInformationPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { id: patientId } = useParams<{ id: string }>(); // Pega o ID do paciente da URL

  // Estados locais
  const [activeTab, setActiveTab] = useState(0);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [newField, setNewField] = useState({
    fieldLabel: '',
    fieldType: 'TEXTO',
    unit: '',
  });
  const [selectedCustomFieldId, setSelectedCustomFieldId] = useState('');

  // Lista de definições de campos customizados criados pelo nutricionista
  const customFieldDefinitions: CustomFieldDefinition[] = [
    {
      id: 'uuid-circ-braco',
      fieldLabel: 'Circunferência do Braço',
      fieldType: 'NUMERO',
      unit: 'cm',
    },
    { id: 'uuid-nivel-hidrat', fieldLabel: 'Nível de Hidratação (subjetivo)', fieldType: 'TEXTO' },
  ];

  const [formData, setFormData] = useState<Partial<ClinicalInformationForm>>({}); // Usamos Partial para dados que chegam depois

  // Seletores do Redux (exemplo)
  // const { information, status } = useSelector((state: RootState) => state.clinicalInformation);
  // const { symptoms, diseases, medications } = useSelector((state: RootState) => state.masterData);

  // Dados mockados para o exemplo
  const symptoms = [
    { symptomId: '1', name: 'Dor de cabeça' },
    { symptomId: '2', name: 'Azia' },
  ];
  const diagnosedDiseases = [
    { diseaseId: '1', name: 'Diabetes Tipo 2' },
    { diseaseId: '2', name: 'Hipertensão' },
  ];
  const familyDiseases = [
    { diseaseId: '1', name: 'Diabetes Tipo 2' },
    { diseaseId: '2', name: 'Hipertensão' },
  ];
  const medications = [
    { medicationId: '1', name: 'Diabetes Tipo 2', dosage: '10mg', notes: 'Lorem Ipsum' },
  ];
  const allergens = [{ allergenId: '1', name: 'Diabetes Tipo 2', reactionDetails: 'Lorem Ipsum' }];
  const foodPreferencesAndAversions: FormFoodPreference[] = [
    { foodId: '1', name: 'Diabetes Tipo 2', type: 'AVERSAO' },
  ];

  // Efeito para buscar os dados ao carregar a página
  useEffect(() => {
    if (patientId) {
      // Você irá despachar as actions para buscar os dados aqui
      // dispatch(fetchClinicalInformation(patientId));
      // dispatch(fetchMasterData()); // Busca todas as listas (sintomas, doenças, etc.)
      console.log('Buscando informações para o paciente:', patientId);
    }
  }, [dispatch, patientId]);

  // Efeito para preencher o formulário quando os dados chegam do Redux
  // useEffect(() => {
  //   if (information) {
  //     setFormData(information);
  //   }
  // }, [information]);

  const handleSymptomsChange = (
    event: SyntheticEvent,
    newValue: { symptomId: string; name: string }[],
  ) => {
    // Mapeia os novos valores selecionados para o formato do nosso estado (FormSymptom)
    const newSymptoms: FormSymptom[] = newValue.map((option) => {
      // Tenta encontrar o sintoma existente no estado para não perder os detalhes já preenchidos
      const existingSymptom = formData.symptoms?.find((s) => s.symptomId === option.symptomId);
      return existingSymptom || { symptomId: option.symptomId, name: option.name };
    });

    setFormData((prev) => ({ ...prev, symptoms: newSymptoms }));
  };

  const handleSymptomDetailChange = (
    symptomId: string,
    field: keyof FormSymptom, // 'intensity', 'frequency', etc.
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms?.map((symptom) =>
        symptom.symptomId === symptomId ? { ...symptom, [field]: value } : symptom,
      ),
    }));
  };

  const handleRemoveSymptom = (symptomIdToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms?.filter((s) => s.symptomId !== symptomIdToRemove),
    }));
  };

  const handleDiagnosedDiseasesChange = (
    event: SyntheticEvent,
    newValue: { diseaseId: string; name: string }[],
  ) => {
    // Mapeia os novos valores selecionados para o formato do nosso estado (FormSymptom)
    const newDiseases: FormDiagnosedDisease[] = newValue.map((option) => {
      // Tenta encontrar o sintoma existente no estado para não perder os detalhes já preenchidos
      const existingDisease = formData.diagnosedDiseases?.find(
        (s) => s.diseaseId === option.diseaseId,
      );
      return existingDisease || { diseaseId: option.diseaseId, name: option.name };
    });

    setFormData((prev) => ({ ...prev, diagnosedDiseases: newDiseases }));
  };

  const handleDiagnosedDiseaseDetailChange = (
    diseaseId: string,
    field: keyof FormDiagnosedDisease,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      diagnosedDiseases: prev.diagnosedDiseases?.map((disease) =>
        disease.diseaseId === diseaseId ? { ...disease, [field]: value } : disease,
      ),
    }));
  };

  const handleRemoveDiagnosedDisease = (diseaseIdToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      diagnosedDiseases: prev.diagnosedDiseases?.filter((s) => s.diseaseId !== diseaseIdToRemove),
    }));
  };

  const handleFamilyDiseasesChange = (
    event: SyntheticEvent,
    newValue: { diseaseId: string; name: string }[],
  ) => {
    // Mapeia os novos valores selecionados para o formato do nosso estado (FormSymptom)
    const newDiseases: FormFamilyDisease[] = newValue.map((option) => {
      // Tenta encontrar o sintoma existente no estado para não perder os detalhes já preenchidos
      const existingDisease = formData.familyDiseases?.find(
        (s) => s.diseaseId === option.diseaseId,
      );
      return existingDisease || { diseaseId: option.diseaseId, name: option.name };
    });

    setFormData((prev) => ({ ...prev, familyDiseases: newDiseases }));
  };

  const handleFamilyDiseaseDetailChange = (
    diseaseId: string,
    field: keyof FormFamilyDisease,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      familyDiseases: prev.familyDiseases?.map((disease) =>
        disease.diseaseId === diseaseId ? { ...disease, [field]: value } : disease,
      ),
    }));
  };

  const handleRemoveFamilyDisease = (diseaseIdToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      familyDiseases: prev.familyDiseases?.filter((s) => s.diseaseId !== diseaseIdToRemove),
    }));
  };

  const handleMedicationsChange = (
    event: SyntheticEvent,
    newValue: { medicationId: string; name: string }[],
  ) => {
    // Mapeia os novos valores selecionados para o formato do nosso estado (FormSymptom)
    const newMedications: FormMedication[] = newValue.map((option) => {
      // Tenta encontrar o sintoma existente no estado para não perder os detalhes já preenchidos
      const existingMedication = formData.medications?.find(
        (s) => s.medicationId === option.medicationId,
      );
      return existingMedication || { medicationId: option.medicationId, name: option.name };
    });

    setFormData((prev) => ({ ...prev, medications: newMedications }));
  };

  const handleMedicationDetailChange = (
    medicationId: string,
    field: keyof FormMedication,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications?.map((medication) =>
        medication.medicationId === medicationId ? { ...medication, [field]: value } : medication,
      ),
    }));
  };

  const handleRemoveMedication = (medicationIdToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications?.filter((s) => s.medicationId !== medicationIdToRemove),
    }));
  };

  const handleAllergensChange = (
    event: SyntheticEvent,
    newValue: { allergenId: string; name: string }[],
  ) => {
    // Mapeia os novos valores selecionados para o formato do nosso estado (FormSymptom)
    const newallergens: FormAllergen[] = newValue.map((option) => {
      // Tenta encontrar o sintoma existente no estado para não perder os detalhes já preenchidos
      const existingallergen = formData.allergens?.find((s) => s.allergenId === option.allergenId);
      return existingallergen || { allergenId: option.allergenId, name: option.name };
    });

    setFormData((prev) => ({ ...prev, allergens: newallergens }));
  };

  const handleAllergenDetailChange = (
    allergenId: string,
    field: keyof FormAllergen,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      allergens: prev.allergens?.map((allergen) =>
        allergen.allergenId === allergenId ? { ...allergen, [field]: value } : allergen,
      ),
    }));
  };

  const handleRemoveAllergen = (allergenIdToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      allergens: prev.allergens?.filter((s) => s.allergenId !== allergenIdToRemove),
    }));
  };

  const handleFoodPreferencesAndAversionsChange = (
    event: SyntheticEvent,
    newValue: { foodId: string; name: string; type: 'PREFERENCIA' | 'AVERSAO' }[],
  ) => {
    // Mapeia os novos valores selecionados para o formato do nosso estado (FormSymptom)
    const newfoodPreferences: FormFoodPreference[] = newValue.map((option) => {
      const existingfoodPreference = formData.foodPreferencesAndAversions?.find(
        (s) => s.foodId === option.foodId,
      );
      return (
        existingfoodPreference || { foodId: option.foodId, name: option.name, type: option.type }
      );
    });

    setFormData((prev) => ({ ...prev, foodPreferencesAndAversions: newfoodPreferences }));
  };

  const handleFoodPreferencesAndAversionsDetailChange = (
    foodId: string,
    field: keyof FormFoodPreference,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      foodPreferencesAndAversions: prev.foodPreferencesAndAversions?.map((food) =>
        food.foodId === foodId ? { ...food, [field]: value } : food,
      ),
    }));
  };

  const handleRemoveFoodPreferencesAndAversions = (foodIdToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      foodPreferencesAndAversions: prev.foodPreferencesAndAversions?.filter(
        (s) => s.foodId !== foodIdToRemove,
      ),
    }));
  };

  const handleOpenSettingsModal = () => setIsSettingsModalOpen(true);
  const handleCloseSettingsModal = () => setIsSettingsModalOpen(false);

  const updateNewField = (name: string, value: unknown) => {
    setNewField((prev) => ({ ...prev, [name]: value }));
  };

  // 1. Handler específico para TextFields (input e textarea)
  const handleInputCustomFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    updateNewField(event.target.name, event.target.value);
  };

  // 2. Handler específico para o Select
  const handleSelectCustomFieldChange = (event: SelectChangeEvent<string>) => {
    updateNewField(event.target.name, event.target.value);
  };

  const handleCreateNewField = () => {
    // Lógica para despachar a action que salva a NOVA DEFINIÇÃO de campo
    // dispatch(createCustomFieldDefinition(newField));
    console.log('Criando nova definição de campo:', newField);
    setNewField({ fieldLabel: '', fieldType: 'TEXTO', unit: '' }); // Reseta o form
    handleCloseSettingsModal();
  };

  const handleAddCustomFieldToForm = () => {
    if (!selectedCustomFieldId) return;
    // Adiciona o campo selecionado ao formulário com um valor inicial vazio
    setFormData((prev) => ({
      ...prev,
      customData: {
        ...prev.customData,
        [selectedCustomFieldId]: '', // Usa o ID como chave
      },
    }));
    setSelectedCustomFieldId(''); // Reseta o select
  };

  const handleCustomDataChange = (fieldId: string, value: string | number | boolean | null) => {
    setFormData((prev) => ({
      ...prev,
      customData: {
        ...prev.customData,
        [fieldId]: value,
      },
    }));
  };

  const handleRemoveCustomField = (fieldIdToRemove: string) => {
    const newCustomData = { ...formData.customData };
    delete newCustomData[fieldIdToRemove];
    setFormData((prev) => ({ ...prev, customData: newCustomData }));
  };

  // Filtra as definições que já não foram adicionadas ao formulário
  const availableCustomFields = customFieldDefinitions.filter(
    (def) => !formData.customData || !formData.customData[def.id],
  );

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Você irá despachar a action para salvar os dados aqui
    // dispatch(saveClinicalInformation({ patientId, data: formData }));
    console.log('Salvando dados:', formData);
  };

  // if (status === 'loading') {
  //   return (
  //     <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Avaliação Clínica do Paciente
          </Typography>
          <Box sx={{ display: 'flex' }}>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
              Salvar Alterações
            </Button>
            <Button
              onClick={handleOpenSettingsModal}
              aria-label="Gerenciar campos personalizados"
              variant="outlined"
              startIcon={<SettingsIcon />}
              sx={{ ml: 2 }}
            >
              Configurações
            </Button>
          </Box>
        </Box>

        <Paper>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Anamnese" />
            <Tab label="Sintomas" />
            <Tab label="Doenças" />
            <Tab label="Medicamentos" />
            <Tab label="Dietas" />
            <Tab label="Antropometria" />
            <Tab label="Hábitos" />
            <Tab label="Outras Informações" />
            {/* Adicione outras abas conforme necessário */}
          </Tabs>
          <Divider />

          {/* Painel da Aba 0: Anamnese e Objetivos */}
          <TabPanel value={activeTab} index={0}>
            {/* Seção 1: Objetivos e Histórico Clínico */}
            <Box sx={{ mb: 4 }}>
              {' '}
              {/* Adiciona um espaço abaixo da seção */}
              <Typography variant="h6" component="h3" gutterBottom>
                Objetivos
              </Typography>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextField
                    name="mainGoal" // Nome corrigido
                    label="Objetivo Principal"
                    value={formData.mainGoal || ''}
                    onChange={handleInputChange}
                    multiline
                    rows={8}
                    fullWidth
                  />
                </Grid>
                {/* <Grid sx={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    multiple
                    options={diseases}
                    getOptionLabel={(option) => option.name}
                    // value={formData.diagnosedDiseases || []}
                    // onChange={(event, newValue) => setFormData(prev => ({ ...prev, diagnosedDiseases: newValue }))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Doenças Diagnosticadas"
                        placeholder="Selecione as doenças"
                      />
                    )}
                  />
                </Grid> */}
              </Grid>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Seção 2: Saúde Comportamental e Emocional */}
            <Box>
              <Typography variant="h6" component="h3" gutterBottom>
                Saúde Comportamental e Emocional
              </Typography>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextField
                    name="emotionalEatingDetails"
                    label="Relação com Alimentação Emocional"
                    value={formData.emotionalEatingDetails || ''}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    fullWidth
                    helperText="Descreva como o estresse ou outras emoções afetam a alimentação."
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    name="mainFoodDifficulties"
                    label="Maiores Dificuldades Alimentares"
                    value={formData.mainFoodDifficulties || ''}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    fullWidth
                    helperText="Ex: Vontade de doces à noite, falta de tempo, etc."
                  />
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Painel da Aba 1: Sinais e Sintomas */}
          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              <Typography variant="h6">Sintomas</Typography>
              <Grid size={12}>
                <Autocomplete
                  multiple
                  options={symptoms} // Sua lista de sintomas vinda da API
                  getOptionLabel={(option) => option.name}
                  value={formData.symptoms || []}
                  onChange={handleSymptomsChange}
                  // isOptionEqualToValue é importante para o Autocomplete saber quais opções estão selecionadas
                  isOptionEqualToValue={(option, value) => option.symptomId === value.symptomId}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Sintomas Frequentes"
                      placeholder="Selecione ou adicione sintomas"
                    />
                  )}
                />
              </Grid>

              {/* --- Renderização dos Detalhes de Cada Sintoma Selecionado --- */}
              {formData.symptoms?.map((symptom) => (
                <Grid key={symptom.symptomId}>
                  <Box>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 2,
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {symptom.name}
                        </Typography>
                        <IconButton
                          onClick={() => handleRemoveSymptom(symptom.symptomId)}
                          size="small"
                          aria-label="Remover sintoma"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid>
                          <TextField
                            label="Intensidade (0-10)"
                            type="number"
                            value={symptom.intensity || ''}
                            onChange={(e) =>
                              handleSymptomDetailChange(
                                symptom.symptomId,
                                'intensity',
                                e.target.value,
                              )
                            }
                            fullWidth
                          />
                        </Grid>
                        <Grid>
                          <TextField
                            label="Frequência"
                            placeholder="Ex: Diariamente"
                            value={symptom.frequency || ''}
                            onChange={(e) =>
                              handleSymptomDetailChange(
                                symptom.symptomId,
                                'frequency',
                                e.target.value,
                              )
                            }
                            fullWidth
                          />
                        </Grid>
                        <Grid>
                          <TextField
                            label="Duração"
                            placeholder="Ex: Há 2 meses"
                            value={symptom.duration || ''}
                            onChange={(e) =>
                              handleSymptomDetailChange(
                                symptom.symptomId,
                                'duration',
                                e.target.value,
                              )
                            }
                            fullWidth
                          />
                        </Grid>
                        <Grid>
                          <TextField
                            label="Observações"
                            multiline
                            rows={2}
                            value={symptom.notes || ''}
                            onChange={(e) =>
                              handleSymptomDetailChange(symptom.symptomId, 'notes', e.target.value)
                            }
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                </Grid>
              ))}

              <Divider sx={{ mb: 2 }} />

              {/* --- Seção de Saúde Geral --- */}
              <Grid container>
                <Grid size={12}>
                  <TextField
                    name="intestinalFunction"
                    label="Função Intestinal"
                    value={formData.intestinalFunction || ''}
                    onChange={handleInputChange}
                    multiline
                    rows={5}
                    fullWidth
                    helperText="Frequência, consistência, presença de gases, etc."
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    name="sleepQuality"
                    label="Qualidade do Sono"
                    value={formData.sleepQuality || ''}
                    onChange={handleInputChange}
                    multiline
                    rows={5}
                    fullWidth
                    helperText="Horas por noite, se o sono é reparador, se acorda durante a noite, etc."
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    name="energyLevel"
                    label="Nível de Energia (0-10)"
                    type="number"
                    value={formData.energyLevel || ''}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    name="menstrualCycleDetails"
                    label="Ciclo Menstrual (se aplicável)"
                    value={formData.menstrualCycleDetails || ''}
                    onChange={handleInputChange}
                    multiline
                    rows={5}
                    fullWidth
                    helperText="Regularidade, duração, sintomas de TPM, etc."
                  />
                </Grid>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              <Typography variant="h6">Doenças Diagnosticadas</Typography>
              <Grid size={12}>
                <Autocomplete
                  multiple
                  options={diagnosedDiseases} // Sua lista de doenças vinda da API
                  getOptionLabel={(option) => option.name}
                  value={formData.diagnosedDiseases || []}
                  onChange={handleDiagnosedDiseasesChange}
                  // isOptionEqualToValue é importante para o Autocomplete saber quais opções estão selecionadas
                  isOptionEqualToValue={(option, value) => option.diseaseId === value.diseaseId}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Doenças Diagnosticadas"
                      placeholder="Selecione ou adicione Doenças Diagnosticadas"
                    />
                  )}
                />
              </Grid>

              {/* --- Renderização dos Detalhes de Cada Sintoma Selecionado --- */}
              {formData.diagnosedDiseases?.map((disease) => (
                <Grid key={disease.diseaseId}>
                  <Box>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 2,
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {disease.name}
                        </Typography>
                        <IconButton
                          onClick={() => handleRemoveDiagnosedDisease(disease.diseaseId)}
                          size="small"
                          aria-label="Remover sintoma"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid>
                          <TextField
                            label="Observações"
                            multiline
                            rows={2}
                            value={disease.notes || ''}
                            onChange={(e) =>
                              handleDiagnosedDiseaseDetailChange(
                                disease.diseaseId,
                                'notes',
                                e.target.value,
                              )
                            }
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              <Typography variant="h6">Doenças na Família</Typography>
              <Grid size={12}>
                <Autocomplete
                  multiple
                  options={familyDiseases} // Sua lista de doenças vinda da API
                  getOptionLabel={(option) => option.name}
                  value={formData.familyDiseases || []}
                  onChange={handleFamilyDiseasesChange}
                  // isOptionEqualToValue é importante para o Autocomplete saber quais opções estão selecionadas
                  isOptionEqualToValue={(option, value) => option.diseaseId === value.diseaseId}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Doenças na Família"
                      placeholder="Selecione ou adicione Doenças na Família"
                    />
                  )}
                />
              </Grid>

              {/* --- Renderização dos Detalhes de Cada Sintoma Selecionado --- */}
              {formData.familyDiseases?.map((disease) => (
                <Grid key={disease.diseaseId}>
                  <Box>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 2,
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {disease.name}
                        </Typography>
                        <IconButton
                          onClick={() => handleRemoveFamilyDisease(disease.diseaseId)}
                          size="small"
                          aria-label="Remover sintoma"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid>
                          <TextField
                            label="Membro da família"
                            multiline
                            rows={2}
                            value={disease.familyMember || ''}
                            onChange={(e) =>
                              handleFamilyDiseaseDetailChange(
                                disease.diseaseId,
                                'familyMember',
                                e.target.value,
                              )
                            }
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              <Typography variant="h6">Alergias</Typography>
              <Grid size={12}>
                <Autocomplete
                  multiple
                  options={allergens} // Sua lista de doenças vinda da API
                  getOptionLabel={(option) => option.name}
                  value={formData.allergens || []}
                  onChange={handleAllergensChange}
                  // isOptionEqualToValue é importante para o Autocomplete saber quais opções estão selecionadas
                  isOptionEqualToValue={(option, value) => option.allergenId === value.allergenId}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Alergias"
                      placeholder="Selecione ou adicione Alergias"
                    />
                  )}
                />
              </Grid>

              {/* --- Renderização dos Detalhes de Cada Sintoma Selecionado --- */}
              {formData.allergens?.map((allergen) => (
                <Grid key={allergen.allergenId}>
                  <Box>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 2,
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {allergen.name}
                        </Typography>
                        <IconButton
                          onClick={() => handleRemoveAllergen(allergen.allergenId)}
                          size="small"
                          aria-label="Remover alergia"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid>
                          <TextField
                            label="Detalhes"
                            multiline
                            rows={2}
                            value={allergen.reactionDetails || ''}
                            onChange={(e) =>
                              handleAllergenDetailChange(
                                allergen.allergenId,
                                'reactionDetails',
                                e.target.value,
                              )
                            }
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              <Typography variant="h6">Medicamentos</Typography>
              <Grid size={12}>
                <Autocomplete
                  multiple
                  options={medications} // Sua lista de doenças vinda da API
                  getOptionLabel={(option) => option.name}
                  value={formData.medications || []}
                  onChange={handleMedicationsChange}
                  // isOptionEqualToValue é importante para o Autocomplete saber quais opções estão selecionadas
                  isOptionEqualToValue={(option, value) =>
                    option.medicationId === value.medicationId
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Medicamentos"
                      placeholder="Selecione ou adicione Medicamentos"
                    />
                  )}
                />
              </Grid>

              {/* --- Renderização dos Detalhes de Cada Sintoma Selecionado --- */}
              {formData.medications?.map((medication) => (
                <Grid key={medication.medicationId}>
                  <Box>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 2,
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {medication.name}
                        </Typography>
                        <IconButton
                          onClick={() => handleRemoveMedication(medication.medicationId)}
                          size="small"
                          aria-label="Remover sintoma"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid>
                          <TextField
                            label="Membro da família"
                            multiline
                            rows={2}
                            value={medication.dosage || ''}
                            onChange={(e) =>
                              handleMedicationDetailChange(
                                medication.medicationId,
                                'dosage',
                                e.target.value,
                              )
                            }
                            fullWidth
                          />
                        </Grid>
                        <Grid>
                          <TextField
                            label="Membro da família"
                            multiline
                            rows={2}
                            value={medication.notes || ''}
                            onChange={(e) =>
                              handleMedicationDetailChange(
                                medication.medicationId,
                                'notes',
                                e.target.value,
                              )
                            }
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Grid container spacing={3}>
              <Typography variant="h6">Dietas</Typography>
              <Grid size={12}>
                <Autocomplete
                  multiple
                  options={foodPreferencesAndAversions} // Sua lista de doenças vinda da API
                  getOptionLabel={(option) => option.name}
                  value={formData.foodPreferencesAndAversions || []}
                  onChange={handleFoodPreferencesAndAversionsChange}
                  // isOptionEqualToValue é importante para o Autocomplete saber quais opções estão selecionadas
                  isOptionEqualToValue={(option, value) => option.foodId === value.foodId}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Comidas"
                      placeholder="Selecione ou adicione Comidas"
                    />
                  )}
                />
              </Grid>

              {/* --- Renderização dos Detalhes de Cada Sintoma Selecionado --- */}
              {formData.foodPreferencesAndAversions?.map((foodPreferencesAndAversion) => (
                <Grid key={foodPreferencesAndAversion.foodId}>
                  <Box>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 2,
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {foodPreferencesAndAversion.name}
                        </Typography>
                        <IconButton
                          onClick={() =>
                            handleRemoveFoodPreferencesAndAversions(
                              foodPreferencesAndAversion.foodId,
                            )
                          }
                          size="small"
                          aria-label="Remover sintoma"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid>
                          <TextField
                            label="Tipo"
                            multiline
                            rows={2}
                            value={foodPreferencesAndAversion.type || ''}
                            onChange={(e) =>
                              handleFoodPreferencesAndAversionsDetailChange(
                                foodPreferencesAndAversion.foodId,
                                'type',
                                e.target.value,
                              )
                            }
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={4}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <TextField
                  name="previous_diet_history"
                  label="Histórico de Dietas"
                  type="number"
                  value={formData.previousDietHistory || ''}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={7}
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Painel da Aba 2: Antropometria */}
          <TabPanel value={activeTab} index={5}>
            <Grid container spacing={3}>
              <Grid>
                <TextField
                  name="weight_kg"
                  label="Peso (kg)"
                  type="number"
                  value={formData.weightKg || ''}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  name="height_cm"
                  label="Altura (cm)"
                  type="number"
                  value={formData.heightCm || ''}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  name="waistCircumference_cm"
                  label="Circunferência da cintura (cm)"
                  type="number"
                  value={formData.waistCircumferenceCm || ''}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  name="upperArmCircumference_cm"
                  label="Circunferência do Braço (cm)"
                  type="number"
                  value={formData.upperArmCircumferenceCm || ''}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  name="abdomenCircumference_cm"
                  label="Circunferência do Abdômen (cm)"
                  type="number"
                  value={formData.abdomenCircumferenceCm || ''}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  name="hipCircumference_cm"
                  label="Circunferência do Quadril (cm)"
                  type="number"
                  value={formData.hipCircumferenceCm || ''}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  name="body_fat_percentage"
                  label="% de Gordura Corporal"
                  type="number"
                  value={formData.bodyFatPercentage || ''}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  name="muscle_mass_kg"
                  label="% de massa muscular"
                  type="number"
                  value={formData.muscleMassKg || ''}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  name="blood_pressure"
                  label="Pressão"
                  type="text"
                  value={formData.bloodPressure || ''}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  name="skin_hair_nails_health"
                  label="Saúde do cabelo, pele e unha"
                  type="text"
                  value={formData.skinHairNailsHealth || ''}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid>
                <TextField
                  name="libido_level"
                  label="Nível de Libido"
                  type="number"
                  value={formData.libidoLevel || ''}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={6}>
            <Box>
              {/* --- Categoria: Detalhes de Hábitos --- */}
              <Typography variant="h6" component="h3" gutterBottom>
                Detalhes de Hábitos
              </Typography>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextField
                    name="chewingDetails"
                    label="Mastigação e Digestão"
                    value={formData.chewingDetails || ''}
                    onChange={handleInputChange}
                    fullWidth
                    helperText="Ex: Come rápido, sente inchaço após comer, etc."
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    name="weeklyEatingOutFrequency"
                    label="Refeições Fora (por semana)"
                    type="number"
                    value={formData.weeklyEatingOutFrequency || ''}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    name="waterIntakePerception"
                    label="Percepção do Consumo de Água"
                    value={formData.waterIntakePerception || ''}
                    onChange={handleInputChange}
                    fullWidth
                    helperText="Ex: Sente que bebe pouca água, esquece de beber, etc."
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* --- Categoria: Hábitos Alimentares (Avaliação Dietética) --- */}
              <Typography variant="h6" component="h3" gutterBottom>
                Avaliação Dietética
              </Typography>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextField
                    name="foodRecall24h"
                    label="Recordatório Alimentar 24h"
                    value={formData.foodRecall24h || ''}
                    onChange={handleInputChange}
                    multiline
                    rows={6}
                    fullWidth
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    name="dailyHydrationDetails"
                    label="Detalhes da Hidratação Diária"
                    value={formData.dailyHydrationDetails || ''}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    fullWidth
                    helperText="Incluir outras bebidas como chás, sucos, refrigerantes."
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    name="alcoholConsumption"
                    label="Consumo de Álcool"
                    value={formData.alcoholConsumption || ''}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    fullWidth
                    helperText="Tipo, frequência e quantidade."
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    name="mealTimesAndLocations"
                    label="Horários e Locais das Refeições"
                    value={formData.mealTimesAndLocations || ''}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    fullWidth
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    name="sugarAndSweetenerUse"
                    label="Uso de Açúcar e Adoçantes"
                    value={formData.sugarAndSweetenerUse || ''}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* --- Categoria: Rotina e Estilo de Vida --- */}
              <Typography variant="h6" component="h3" gutterBottom>
                Rotina e Estilo de Vida
              </Typography>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextField
                    name="professionAndWorkRoutine"
                    label="Profissão e Rotina de Trabalho"
                    value={formData.professionAndWorkRoutine || ''}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    fullWidth
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    name="physicalActivityDetails"
                    label="Detalhes da Atividade Física"
                    value={formData.physicalActivityDetails || ''}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    fullWidth
                    helperText="Tipo, frequência, duração e intensidade."
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    name="smokingHabits"
                    label="Hábitos de Tabagismo"
                    value={formData.smokingHabits || ''}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    name="whoPreparesMeals"
                    label="Quem Prepara as Refeições"
                    value={formData.whoPreparesMeals || ''}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    name="weekendRoutineChanges"
                    label="Mudanças na Rotina (Fim de Semana)"
                    value={formData.weekendRoutineChanges || ''}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              {/* --- Categoria: Dados Complementares --- */}
              <Typography variant="h6" component="h3" gutterBottom>
                Dados Complementares
              </Typography>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextField
                    name="recentLabResults"
                    label="Observações sobre Exames Laboratoriais Recentes"
                    value={formData.recentLabResults || ''}
                    onChange={handleInputChange}
                    multiline
                    rows={5}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={7}>
            <Typography variant="h6" component="h3" gutterBottom>
              Campos Personalizados
            </Typography>

            {/* Seção para adicionar novos campos ao formulário */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Adicionar Campo</InputLabel>
                <Select
                  value={selectedCustomFieldId}
                  label="Adicionar Campo"
                  onChange={(e) => setSelectedCustomFieldId(e.target.value as string)}
                >
                  <MenuItem value="" disabled>
                    Selecione um campo...
                  </MenuItem>
                  {availableCustomFields.map((def) => (
                    <MenuItem key={def.id} value={def.id}>
                      {def.fieldLabel}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button onClick={handleAddCustomFieldToForm} variant="outlined">
                Adicionar
              </Button>
            </Box>

            {/* Seção que renderiza os campos já adicionados */}
            <Grid container spacing={3}>
              {formData.customData &&
                Object.keys(formData.customData).map((fieldId) => {
                  const definition = customFieldDefinitions.find((def) => def.id === fieldId);
                  if (!definition) return null;

                  return (
                    <Grid size={12} key={fieldId}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          label={definition.fieldLabel}
                          type={definition.fieldType === 'NUMERO' ? 'number' : 'text'}
                          value={formData.customData![fieldId] || ''}
                          onChange={(e) => handleCustomDataChange(fieldId, e.target.value)}
                          fullWidth
                          InputProps={{ endAdornment: definition.unit }}
                        />
                        <IconButton
                          onClick={() => handleRemoveCustomField(fieldId)}
                          aria-label="Remover campo"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  );
                })}
            </Grid>
          </TabPanel>

          {/* Painel Doenças */}
        </Paper>
      </Box>

      <Dialog open={isSettingsModalOpen} onClose={handleCloseSettingsModal} fullWidth maxWidth="sm">
        <DialogTitle>Gerenciar Campos Personalizados</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            Criar Novo Campo
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField
                name="fieldLabel"
                label="Nome do Campo"
                value={newField.fieldLabel}
                onChange={handleInputCustomFieldChange}
                fullWidth
                autoFocus
              />
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Dado</InputLabel>
                <Select
                  name="fieldType"
                  value={newField.fieldType}
                  label="Tipo de Dado"
                  // @ts-expected-error: O tipo do evento do Select é diferente, mas funciona
                  onChange={handleSelectCustomFieldChange}
                >
                  <MenuItem value="TEXTO">Texto</MenuItem>
                  <MenuItem value="NUMERO">Número</MenuItem>
                  <MenuItem value="DATA">Data</MenuItem>
                  <MenuItem value="BOOLEANO">Sim/Não</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <TextField
                name="unit"
                label="Unidade (opcional)"
                placeholder="Ex: cm, kg, %"
                value={newField.unit}
                onChange={handleInputCustomFieldChange}
                fullWidth
              />
            </Grid>
          </Grid>
          {/* Aqui você poderia listar os campos já existentes */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettingsModal}>Cancelar</Button>
          <Button onClick={handleCreateNewField} variant="contained">
            Criar Campo
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClinicalInformationPage;
