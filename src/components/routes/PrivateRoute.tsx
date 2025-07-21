import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import type { RootState } from '../../store';
import type { UserRoleEnum } from '../../types/user';

type PrivateRouteProps = {
  children: React.ReactNode;
  allowedRoles: UserRoleEnum[];
};

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const { userInfo } = useSelector((state: RootState) => state.signIn);
  const location = useLocation();

  if (!userInfo) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(userInfo.role as UserRoleEnum)) {
    return <Navigate to="/not-found" replace />;
  }

  return children;
};

export default PrivateRoute;
