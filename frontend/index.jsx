import React from 'react';
import ReactDOM from 'react-dom';

const Root = () => (
  <div>Hey Internet, let's style some clothes</div>
);

document.addEventListener('DOMContentLoaded', () => {
 // bootstrap!

  const rootEl = document.getElementById('root');
  ReactDOM.render(<Root />, rootEl);
});
