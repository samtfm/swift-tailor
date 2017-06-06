import React from 'react';
import Shirt from './shirt';
import TakeImage from './take_image';
import Canny from './canny/canny';

const App = () => (
  <div>
    Hey Internet, let's style some clothes
    <TakeImage />
    <Canny />
    <Shirt />
  </div>
);

export default App;
