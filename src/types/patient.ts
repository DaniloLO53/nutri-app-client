export interface PatientSearchResult {
  id: string;
  fullName: string;
  email: string;
}

export interface PatientSearchState {
  patients: PatientSearchResult[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
