import React from 'react';
import TakeImage from './take_image';
import Canny from './canny/canny';

const App = () => (
  <div>
    Hey Internet, let's style some clothes
    <TakeImage />
    <Canny />
  </div>
);

export default App;
