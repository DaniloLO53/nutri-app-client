import { configureStore } from '@reduxjs/toolkit';
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

export const store = configureStore({
  reducer: {
    // A chave 'register' aqui define como o estado será chamado no seletor global
    // Ex: useSelector((state) => state.register.loading)
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
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
