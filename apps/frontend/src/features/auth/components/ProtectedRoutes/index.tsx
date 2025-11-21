import { Navigate, Outlet } from 'react-router-dom';
import useLoginContext from '@features/auth/components/LoginPage/useLoginContext';

/**
 * ProtectedRoutes renders the children components only
 * if the user is authenticated (i.e if an access token exists).
 * If the user is not authenticated, it redirects to the login page.
 */
function ProtectedRoutes() {
  const { token } = useLoginContext();
  return token ? <Outlet /> : <Navigate to="/home" replace />;
}

export default ProtectedRoutes;
