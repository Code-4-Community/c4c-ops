import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useState } from 'react';

import Root from '@containers/root';
import NotFound from '@containers/404';
import Test from '@containers/test';
import Dashboard from '@containers/dashboard';
import Applications from '@containers/applications';
import IndividualApplication from '@containers/individualApplication';
import Resources from '@containers/resources';
import Settings from '@containers/settings';
import LoginContext from '@components/LoginPage/LoginContext';
import ProtectedRoutes from '@components/ProtectedRoutes';
import LoginPage from '@components/LoginPage';
import Navigation from '@components/Navigation';
import AdminRoutes from '@components/AdminRoutes';

export const App: React.FC = () => {
  const [token, setToken] = useState<string>('');
  return (
    <LoginContext.Provider value={{ setToken, token }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoutes token={token} />}>
            <Route element={<AdminRoutes />}>
              <Route
                path="/"
                element={
                  <Navigation>
                    <Dashboard />
                  </Navigation>
                }
              />
              <Route
                path="/applications"
                element={
                  <Navigation>
                    <Applications />
                  </Navigation>
                }
              />
              <Route
                path="/applications/:userId"
                element={
                  <Navigation>
                    <IndividualApplication />
                  </Navigation>
                }
              />
              <Route
                path="/resources"
                element={
                  <Navigation>
                    <Resources />
                  </Navigation>
                }
              />
              <Route
                path="/settings"
                element={
                  <Navigation>
                    <Settings />
                  </Navigation>
                }
              />
            </Route>

            <Route path="/applicant" element={<Root />} />
            <Route path="/test" element={<Test />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </LoginContext.Provider>
  );
};

export default App;
