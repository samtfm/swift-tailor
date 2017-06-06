import React from 'react';
import SVG from 'svg.js';

class Shirt extends React.Component{

  componentDidMount(){
    let i = 100;
    this.drawShirt(i);

  }

  drawShirt(){
    // set up draw constant for svg.js
   const draw = SVG(this.drawing).size(300,300);

   //draw a silly line and circle
   const line1 = draw.polyline('50,20 100,50 140,30').fill('none').stroke({ width: 1 });
   const circle = draw.circle('30');

   //find first vector point from line1
   const firstPoint = line1.node.points[0];

   // position circle at that point ( cx is circlex i think?)
   circle.attr({cx: firstPoint.x, cy: firstPoint.y });
  }

  render(){
    return(
      <div id="drawing"
        ref={(div) => { this.drawing = div;}}></div>
    );
  }
}

export default Shirt;
