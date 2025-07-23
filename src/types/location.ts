export interface LocationsState {
  locations: Location[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface Location {
  id: string;
  address: string;
}
