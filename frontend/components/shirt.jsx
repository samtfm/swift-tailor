import React from 'react';
import SVG from 'svg.js';

class Shirt extends React.Component{

  componentDidMount(){
    let i = 100;

    const draw = SVG(this.drawing).size(300,300);
    let last = this.drawShirt(draw, i);
    setInterval(() => {
      i += 10;
      if (i< 200){
        last = last.replace(this.drawShirt(draw, i));

      }

    }, 200);
  }

  drawShirt(draw, width){
    // set up draw constant for svg.js

    // create points based on measurement
    const points = [
     [width, 50],
     [width*.8, 100],
     [100, 150]
    ];

    // boil points into a happy little string "100,0 80,50 110,100"
    const pointString = points.map(pair => (
     `${pair[0].toString()}, ${pair[1].toString()}`
    )).join(' ');

    // draw line from points
    const line1 = draw.polyline(pointString).fill('none').stroke({ width: 1 });

    // draw silly circle at the head of theline
    const circle = draw.circle('30');
    //find first vector point from line1
    const firstPoint = line1.node.points[0];
    // position circle at that point ( cx is circlex i think?)
    circle.attr({cx: firstPoint.x, cy: firstPoint.y });

    // important! group objects into single svg component
    // this allows it to be returned and then replaced
    const group = draw.group();
    group.add(circle);
    group.add(line1);
    return group;
  }

  render(){
    return(
      <div ref={(div) => { this.drawing = div;}}></div>
    );
  }
}

export default Shirt;
