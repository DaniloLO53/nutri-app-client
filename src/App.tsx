import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import PublicRoute from './components/routes/PublicRoute';
import PrivateRoute from './components/routes/PrivateRoute';

import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { checkAuthStatus } from './store/slices/auth/authThunk';
import type { AppDispatch, RootState } from './store';
import SignInPage from './pages/SignInPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import DashboardPatientPage from './pages/DashboardPatientPage';
import NotFoundPage from './pages/NotFoundPage';
import MainLayout from './components/layout/MainLayout';
import AppointmentsPatientPage from './pages/AppointmentsPatientPage';
import { StateStatus } from './store/slices/statusEnum';
import AvailableNutritionistsSearchByParamsPage from './pages/AvailableNutritionistsSearchByParamsPage';
import { UserRole } from './types/user';
import DashboardNutritionistPage from './pages/DashboardNutritionistPage';
import NutritionistProfilePage from './pages/NutritionistProfilePage';
import AppointmentsNutritionistPage from './pages/AppointmentsNutritionistPage';
import ScheduleCreatePage from './pages/ScheduleCreatePage';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { authStatus } = useSelector((state: RootState) => state.signIn);

  useEffect(() => {
    if (authStatus === StateStatus.IDLE) {
      dispatch(checkAuthStatus());
    }
  }, [authStatus, dispatch]);

  if (authStatus === StateStatus.IDLE || authStatus === StateStatus.LOADING) {
    return <div>Carregando sua sessão...</div>;
  }

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Routes>
        <Route
          path="/signin"
          element={
            <PublicRoute>
              <SignInPage />
            </PublicRoute>
          }
        />
        <Route
          path="/cadastro/pacientes"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />

        <Route element={<MainLayout />}>
          <Route
            path="/dashboard/paciente"
            element={
              <PrivateRoute allowedRoles={[UserRole.ROLE_PATIENT]}>
                <DashboardPatientPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/nutricionista"
            element={
              <PrivateRoute allowedRoles={[UserRole.ROLE_NUTRITIONIST]}>
                <DashboardNutritionistPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/perfil/nutricionista"
            element={
              <PrivateRoute allowedRoles={[UserRole.ROLE_NUTRITIONIST]}>
                <NutritionistProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/agendamentos/paciente"
            element={
              <PrivateRoute allowedRoles={[UserRole.ROLE_PATIENT]}>
                <AppointmentsPatientPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/agendamentos/nutricionista"
            element={
              <PrivateRoute allowedRoles={[UserRole.ROLE_NUTRITIONIST]}>
                <AppointmentsNutritionistPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/nutricionista/horarios/novo"
            element={
              <PrivateRoute allowedRoles={[UserRole.ROLE_NUTRITIONIST]}>
                <ScheduleCreatePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/nutricionista/horarios/novo"
            element={
              <PrivateRoute allowedRoles={[UserRole.ROLE_NUTRITIONIST]}>
                <ScheduleCreatePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/agendamentos/novo"
            element={
              <PrivateRoute allowedRoles={[UserRole.ROLE_PATIENT]}>
                <AvailableNutritionistsSearchByParamsPage />
              </PrivateRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
