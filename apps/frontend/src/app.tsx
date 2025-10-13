import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useState } from 'react';

import ApplicantHomePage from '@features/applicant/pages/ApplicantHomePage';
import NotFoundPage from '@shared/pages/NotFoundPage';
import DashboardPage from '@shared/pages/DashboardPage';
import ApplicationsPage from '@features/applications/pages/ApplicationsPage';
import ApplicationDetailPage from '@features/applications/pages/ApplicationDetailPage';
import ResourcesPage from '@features/applicant/pages/ResourcesPage';
import SettingsPage from '@shared/pages/SettingsPage';
import LoginContext from '@features/auth/components/LoginPage/LoginContext';
import ProtectedRoutes from '@features/auth/components/ProtectedRoutes';
import LoginPage from '@features/auth/components/LoginPage';
import Navigation from '@shared/components/Navigation';
import AdminRoutes from '@features/auth/components/AdminRoutes';
import HomePage from '@shared/pages/HomePage';

export const App: React.FC = () => {
  const [token, setToken] = useState<string>('');
  return (
    <LoginContext.Provider value={{ setToken, token }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/home"
            element={
              <Navigation>
                <HomePage />
              </Navigation>
            }
          />

          <Route element={<ProtectedRoutes token={token} />}>
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
                path="/resources"
                element={
                  <Navigation>
                    <ResourcesPage />
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
