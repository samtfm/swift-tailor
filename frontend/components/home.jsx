import React from 'react';
import { Link } from 'react-router-dom';
export default class Home extends React.Component {

  render(){
    return(
      <section className='home-container'>

        <Link to="/fit"> GET FIT </Link>
      </section>
    );
  }
}
