import { configureStore } from '@reduxjs/toolkit';
import registerReducer from './slices/auth/registerPatientSlice';
import signInUserReducer from './slices/auth/signInSlice';
import appointmentReducer from './slices/appointments/appointmentSlice';
import scheduleSearchReducer from './slices/schedules/scheduleSearchSlice';
import nutritionistProfileReducer from './slices/nutritionistProfiles/nutritionistProfileSlice';
import nutritionistAppointmentReducer from './slices/appointments/nutritionistAppointmentSlice';
import scheduleReducer from './slices/schedules/scheduleSlice';
import patientSearchReducer from './slices/patients/patientSearchSlice';

export const store = configureStore({
  reducer: {
    // A chave 'register' aqui define como o estado será chamado no seletor global
    // Ex: useSelector((state) => state.register.loading)
    register: registerReducer,
    signIn: signInUserReducer,
    appointments: appointmentReducer,
    scheduleSearch: scheduleSearchReducer,
    nutritionistProfile: nutritionistProfileReducer,
    nutritionistAppointments: nutritionistAppointmentReducer,
    schedule: scheduleReducer,
    patientSearch: patientSearchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
