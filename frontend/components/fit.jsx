import React from 'react';
import Shirt from './shirt';
import TakeImage from './take_image';
import Canny from './canny/canny';
import TemplateEditor from './template_editor';
export default class Fit extends React.Component {

  render(){


    return(
      <section>
        <TakeImage />
      </section>
    );
  }
}
