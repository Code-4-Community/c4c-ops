import { Navigate, Outlet } from 'react-router-dom';

/**
 * ProtectedRoutes renders the children components only
 * if the user is authenticated (i.e if an access token exists).
 * If the user is not authenticated, it redirects to the login page.
 */
function ProtectedRoutes({ token }: { token: string }) {
  return token ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoutes;
