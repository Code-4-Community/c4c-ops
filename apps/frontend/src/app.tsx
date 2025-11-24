import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useState } from 'react';

import ApplicantHomePage from '@features/applicant/pages/ApplicantHomePage';
import NotFoundPage from '@shared/pages/NotFoundPage';
import ApplicationsPage from '@features/applications/pages/ApplicationsPage';
import ApplicationDetailPage from '@features/applications/pages/ApplicationDetailPage';
import LoginContext from '@features/auth/components/LoginPage/LoginContext';
import ProtectedRoutes from '@features/auth/components/ProtectedRoutes';
import LoginPage from '@features/auth/components/LoginPage';
import AdminRoutes from '@features/auth/components/AdminRoutes';
import HomePage from '@shared/pages/HomePage';

export const App: React.FC = () => {
  const [token, setToken] = useState<string>(() => {
    const storedToken = localStorage.getItem('token');
    return storedToken ? JSON.parse(storedToken) : '';
  });

  return (
    <LoginContext.Provider value={{ setToken, token }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />

          <Route element={<ProtectedRoutes />}>
            <Route element={<AdminRoutes />}>
              <Route path="/" element={<ApplicationsPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route
                path="/applications/:userId"
                element={<ApplicationDetailPage />}
              />
            </Route>

            <Route path="/applicant" element={<ApplicantHomePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </LoginContext.Provider>
  );
};

export default App;
