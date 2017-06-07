import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import Home from './home';
import Fit from './fit';

const App = () => (
  <div>
    <Switch>
      <Route path="/fit" component={ Fit } />
      <Route path="/" component={ Home } />
    </Switch>
  </div>
);

export default App;
