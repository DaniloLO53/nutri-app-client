import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import type { RootState } from '../../store';
import { UserRole } from '../../types/user';

type PublicRouteProps = {
  children: React.ReactNode;
};

// O 'children' será o componente que queremos renderizar (ex: <RegisterPage />)
const PublicRoute = ({ children }: PublicRouteProps) => {
  const { userInfo } = useSelector((state: RootState) => state.signIn);
  const location = useLocation();

  if (userInfo) {
    // A propriedade 'replace' substitui a entrada atual no histórico
    // em vez de adicionar uma nova, evitando o loop do botão "voltar".

    console.log({ userInfo });

    const redirectTo =
      userInfo.role === UserRole.ROLE_NUTRITIONIST
        ? '/dashboard/nutricionista'
        : '/dashboard/paciente';
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return children;
};

export default PublicRoute;
