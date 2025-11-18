import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useState } from 'react';

import ApplicantHomePage from '@features/applicant/pages/ApplicantHomePage';
import NotFoundPage from '@shared/pages/NotFoundPage';
import ApplicationsPage from '@features/applications/pages/ApplicationsPage';
import ApplicationDetailPage from '@features/applications/pages/ApplicationDetailPage';
import LoginContext from '@features/auth/components/LoginPage/LoginContext';
import ProtectedRoutes from '@features/auth/components/ProtectedRoutes';
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
          <Route path="/login" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />

          <Route element={<ProtectedRoutes />}>
            <Route element={<AdminRoutes />}>
              <Route
                path="/"
                element={
                  <Navigation>
                    <DashboardPage />
                  </Navigation>
                }
              />
              <Route
                path="/applications"
                element={
                  <Navigation>
                    <ApplicationsPage />
                  </Navigation>
                }
              />
              <Route
                path="/applications/:userId"
                element={
                  <Navigation>
                    <ApplicationDetailPage />
                  </Navigation>
                }
              />
              <Route
                path="/settings"
                element={
                  <Navigation>
                    <SettingsPage />
                  </Navigation>
                }
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
