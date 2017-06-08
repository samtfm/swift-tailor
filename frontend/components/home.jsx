import React from 'react';
import { Link } from 'react-router-dom';
export default class Home extends React.Component {

  render(){
    return(
      <section className='home-container'>
        <section className='intro'>
          <h1>Welcome to Tailor Swift, a swift experience to tailor your own clothes.</h1>
        </section>
        <section className='intro-blurb'>
          <p>Tailor Swift was inspired by a sense of individuality,
            and not worrying what people may think.
            And to paraphrase one of our favorite lyrics,
            the rest of the world may be black and white but we live in screaming color.</p>
        </section>
        <section className='how-it-works'>
          <h2>The process is simple</h2>
          <ol>
            <li>Enter your height</li>
            <li>Take a few images so we can calulate your dimensions</li>
            <li>Select a pattern </li>
          </ol>
        </section>
        <section className='start'>
          <Link to="/fit" className='btn-1'> Get Started </Link>
        </section>
      </section>
    );
  }
}
