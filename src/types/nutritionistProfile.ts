export interface NutritionistLocation {
  ibgeApiCity: string;
  ibgeApiState: string;
  ibgeApiIdentifierState: number;
  phone1: string;
  phone2: string | null;
  phone3: string | null;
  address: string;
}

export interface NutritionistProfile {
  crf: string;
  firstName: string;
  lastName: string;
  email: string;
  acceptsRemote: boolean;
  locations: NutritionistLocation[];
}

export interface NutritionistProfileState {
  profile: NutritionistProfile | null;
  allHealthPlans: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  updateStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
