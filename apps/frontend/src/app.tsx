import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Root from '@containers/root';
import NotFound from '@containers/404';
import Test from '@containers/test';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <NotFound />,
  },
  {
    path: '/test',
    element: <Test />,
  },
]);

export const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
