import React from 'react';
import SVG from 'svg';

class Shirt{
  initialize(props){
    super(props);
    this.draw = SVG('drawing').size(300,300);
    this.rect = this.draw.rect(100, 100).attr({ fill: '#f06'});
  }

  render(){
    return(
      <div id="drawing"></div>
    );
  }
}
