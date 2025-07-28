import { combineReducers, configureStore, type UnknownAction } from '@reduxjs/toolkit';
import registerReducer from './slices/auth/registerPatientSlice';
import signInUserReducer from './slices/auth/signInSlice';
import appointmentFromNutritionistReducer from './slices/appointments/appointmentFromNutritionistSlice';
import availableNutritionistSearchReducer from './slices/schedules/availableNutritionistSearchSlice';
import nutritionistProfileReducer from './slices/nutritionistProfiles/nutritionistProfileSlice';
import appointmentFromPatientReducer from './slices/appointments/appointmentFromPatientSlice';
import scheduleReducer from './slices/schedules/scheduleSlice';
import patientSearchReducer from './slices/patients/patientSearchSlice';
import locationsReducer from './slices/locations/locationSlice';
import notificationReducer from './slices/notifications/notificationsSlice';
import nutritionistPatientsReducer from './slices/patients/nutritionistPatientsSlice';
import nutritionistScheduledPatientsReducer from './slices/patients/nutritionistScheduledPatientsSlice';
import clinicalInformationReducer from './slices/clinicalInformation/clinicalInformationSlice';

import { signOutUser } from './slices/auth/authThunk';

const appReducer = combineReducers({
  register: registerReducer,
  signIn: signInUserReducer,
  appointmentFromNutritionist: appointmentFromNutritionistReducer,
  appointmentFromPatient: appointmentFromPatientReducer,
  schedule: scheduleReducer,
  availableNutritionistSearch: availableNutritionistSearchReducer,
  nutritionistProfile: nutritionistProfileReducer,
  patientSearch: patientSearchReducer,
  locations: locationsReducer,
  notification: notificationReducer,
  nutritionistPatients: nutritionistPatientsReducer,
  nutritionistScheduledPatients: nutritionistScheduledPatientsReducer,
  clinicalInformation: clinicalInformationReducer,
});

export type RootState = ReturnType<typeof appReducer>;

// 4. Crie o "meta-reducer" que lida com o reset do estado
const rootReducer = (state: RootState | undefined, action: UnknownAction): RootState => {
  // Se a ação for de logout bem-sucedido, reseta o estado
  if (action.type === signOutUser.fulfilled.type) {
    // Passar 'undefined' para o reducer o força a retornar seu estado inicial
    return appReducer(undefined, action);
  }

  // Para qualquer outra ação, delega para o reducer combinado
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;
