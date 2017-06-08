import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import Home from './home';
import Fit from './fit';

class App extends React.Component{

  componentWillReceiveProps(nextProps){
    // debugger;
    // if(this.props.location.pathname !== nextProps.location.pathname){
      window.scrollTo(0,0);
      // }
  }

  render(){
    return(
    <div>
      <Switch>
        <Route path="/fit" component={ Fit } />
        <Route path="/" component={ Home } />
      </Switch>
    </div>
    );
  }
}

export default App;
