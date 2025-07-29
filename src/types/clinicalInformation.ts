export interface MasterData {
  symptoms: FormSymptom[];
  allergens: FormAllergen[];
  diseases: FormDiagnosedDisease[];
  medications: FormMedication[];
  foodPreferencesAndAversions: FormFoodPreference[];
}

export interface MasterDataState {
  data: MasterData;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface ClinicalInformationState {
  clinicalInformation: Partial<ClinicalInformationForm> | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

/**
 * Representa um único sintoma associado a uma avaliação, incluindo
 * os detalhes contextuais da tabela de ligação.
 */
export interface FormSymptom {
  symptomId: string; // UUID do sintoma da tabela 'symptoms'
  name: string;
  intensity?: number;
  frequency?: string;
  duration?: string;
  notes?: string;
}

/**
 * Representa uma única doença diagnosticada associada a uma avaliação.
 */
export interface FormDiagnosedDisease {
  diseaseId: string; // UUID da doença da tabela 'diseases'
  name: string;
  notes?: string;
}

/**
 * Representa uma única doença no histórico familiar associada a uma avaliação.
 */
export interface FormFamilyDisease {
  diseaseId: string; // UUID da doença da tabela 'diseases'
  name: string;
  familyMember?: string;
}

/**
 * Representa um único medicamento/suplemento associado a uma avaliação.
 */
export interface FormMedication {
  medicationId: string; // UUID do item da tabela 'medications_supplements'
  name: string;
  dosage?: string;
  notes?: string;
}

/**
 * Representa um único alérgeno associado a uma avaliação.
 */
export interface FormAllergen {
  allergenId: string; // UUID do item da tabela 'allergens'
  name: string;
  reactionDetails?: string;
}

/**
 * Representa uma única preferência ou aversão alimentar associada a uma avaliação.
 */
export interface FormFoodPreference {
  foodId: string; // UUID do alimento da tabela 'foods'
  name: string;
  type: 'PREFERENCIA' | 'AVERSAO';
}

/**
 * A interface principal que define a estrutura completa dos dados do formulário
 * de avaliação clínica.
 */
export interface ClinicalInformationForm {
  id?: string; // UUID (pode não existir em uma nova avaliação)
  patientId?: string | undefined; // UUID
  assessmentDate?: string; // Formato YYYY-MM-DD

  // Categoria: Anamnese Clínica e Objetivos
  mainGoal?: string; // OK
  previousDietHistory?: string; // OK

  // Categoria?: Sinais, Sintomas e Saúde Geral
  intestinalFunction?: string; // OK
  sleepQuality?: string; // OK
  energyLevel?: number | ''; // OK Usar '' para campos numéricos vazios
  menstrualCycleDetails?: string; // OK

  // Categoria?: Avaliação Antropométrica
  weightKg?: number | ''; // OK
  heightCm?: number | ''; // OK
  waistCircumferenceCm?: number | ''; // OK
  upperArmCircumferenceCm?: number | ''; // OK
  abdomenCircumferenceCm?: number | ''; // OK
  hipCircumferenceCm?: number | ''; // OK

  // Categoria?: Composição Corporal Detalhada
  bodyFatPercentage?: number | ''; // OK
  muscleMassKg?: number | ''; // OK

  // Categoria?: Marcadores de Saúde Adicionais
  bloodPressure?: string; // OK
  skinHairNailsHealth?: string; // OK
  libidoLevel?: number | ''; // OK

  // Categoria?: Saúde Comportamental e Emocional
  emotionalEatingDetails?: string; // OK
  mainFoodDifficulties?: string; // OK

  // Categoria?: Detalhes de Hábitos
  chewingDetails?: string; // OK
  weeklyEatingOutFrequency?: number | ''; // OK
  waterIntakePerception?: string; // OK

  // Categoria?: Hábitos Alimentares (Avaliação Dietética)
  foodRecall24h?: string; // OK
  dailyHydrationDetails?: string; // OK
  alcoholConsumption?: string; // OK
  mealTimesAndLocations?: string; // OK
  sugarAndSweetenerUse?: string; // OK

  // Categoria?: Rotina e Estilo de Vida
  professionAndWorkRoutine?: string; // OK
  physicalActivityDetails?: string; // OK
  smokingHabits?: string; // OK
  weekendRoutineChanges?: string; // OK
  whoPreparesMeals?: string; // OK

  // Categoria?: Dados Complementares
  recentLabResults?: string; // OK

  // Categoria?: Dados Normalizados (Relações Muitos-para-Muitos)
  symptoms?: FormSymptom[]; // OK
  diagnosedDiseases?: FormDiagnosedDisease[]; // OK
  familyDiseases?: FormFamilyDisease[]; // OK
  medications?: FormMedication[]; // OK
  allergens?: FormAllergen[]; // OK
  foodPreferencesAndAversions?: FormFoodPreference[]; // OK

  // Categoria?: Campos Customizados
  // A chave é o UUID da 'custom_field_definitions', o valor é o dado inserido.
  customData?: Record<string, string | number | boolean | null>;
}
