// import { Button } from '@shared/src/components/button';

import { useEffect } from 'react';

const Test: React.FC = () => {
  useEffect(() => {
    console.info('i am info log');

    console.log('i am console log');
  }, []);

  return (
    <>
      <div>I am test page</div>
      {/* <Button>Clicking this button won't do anything</Button> */}
      {/* <button onClick={() => methodDoesNotExist()}>Break the world</button> */}
    </>
  );
};

export default Test;
