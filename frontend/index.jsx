import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';
import { HashRouter } from 'react-router-dom';

const Root = () => (
  <HashRouter>
    <App />

  </HashRouter>
);

document.addEventListener('DOMContentLoaded', () => {
  const rootEl = document.getElementById('root');
  ReactDOM.render(<Root />, rootEl);
});
