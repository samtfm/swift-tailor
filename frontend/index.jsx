import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';
const Root = () => (
  <App />
);

document.addEventListener('DOMContentLoaded', () => {
  const rootEl = document.getElementById('root');
  ReactDOM.render(<Root />, rootEl);
});
