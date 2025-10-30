import { useRouteError } from 'react-router-dom';

import { getErrorMessage } from '@utils/router';

const NotFound: React.FC = () => {
  const errorMessage = getErrorMessage(useRouteError());

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{errorMessage}</i>
      </p>
    </div>
  );
};

export default NotFound;
