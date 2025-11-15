import { Navigate, Outlet } from 'react-router-dom';
import { Role, useAuth } from '../context/AuthContext';

interface Props {
  roles?: Role[];
}

const ProtectedRoute: React.FC<Props> = ({ roles }) => {
  const { auth } = useAuth();
  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }
  if (roles && auth.role && !roles.includes(auth.role)) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
