import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useState } from 'react';

import Root from '@containers/root';
import NotFound from '@containers/404';
import Test from '@containers/test';
import LoginContext from '@components/LoginPage/LoginContext';
import ProtectedRoutes from '@components/ProtectedRoutes';
import LoginPage from '@components/LoginPage';

export const App: React.FC = () => {
  const [token, setToken] = useState<string>('');
  return (
    <LoginContext.Provider value={{ setToken, token }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoutes token={token} />}>
            <Route path="/" element={<Root />} />
            <Route path="/test" element={<Test />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </LoginContext.Provider>
  );
};

export default App;
