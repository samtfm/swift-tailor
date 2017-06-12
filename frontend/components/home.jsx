import React from 'react';
import { Link } from 'react-router-dom';
export default class Home extends React.Component {

  render(){
    return(
      <section className='home-container'>
        <section className='intro'>
          <h1>Welcome to Tailor Swift,</h1>
          <div>
            <span>a </span>
            <span className='large-font'> swift </span>
            <span> experience to </span>
            <span className='large-font'> tailor </span>
            <span> your own clothes.</span>
          </div>
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
            <li>Use your webcam to calulate a few dimensions</li>
            <li>Make any adjustments you want</li>
            <li>Download your template!</li>
          </ol>
        </section>
        <section className='start'>
          <Link to="/fit" className='btn-1'> Get Started </Link>
        </section>
      </section>
    );
  }
}
