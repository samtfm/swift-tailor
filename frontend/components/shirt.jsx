import React from 'react';
import SVG from 'svg.js';

class Shirt extends React.Component{

  componentDidMount(){
    const draw = SVG(this.drawing).size(500,500);
    this.last = this.drawShirt(draw);
  }

  componentDidUpdate(){
    const draw = SVG(this.drawing).size(500,500);

    this.last = this.last ?
      this.last.replace(this.drawShirt(draw)) :
      this.drawShirt(draw);
  }
  calcShirtLines(chest, length, armHole, shoulders, neck, waist){
    const lines = [];
    //shoulder line
    lines.push([
      [neck/2, -5],
      [shoulders/2, 0]
    ]);
    //sleeve curve
    lines.push([
      [`M${shoulders/2}`, 0],
      [`C${chest/2-10}`, armHole],
      [chest/2, armHole],
      [chest/2, armHole]
    ]);
    // lines.push([
    //   [shoulders/2, 0],
    //   [(shoulders+chest)/4 -5, armHole*.7],
    //   [chest/2, armHole]
    // ]);
    lines.push([
      [chest / 2, armHole],
      [(waist/2), length],
      [-(waist/2), length],
      [-chest / 2, armHole]
    ]);
    lines.push([
      [0,0],
      [0,length]
    ]);
    return lines;
  }

  drawShirt(draw){
    const group = draw.group();

    // set up draw constant for svg.js
    if (!this.props.measurements) return group;
    let {arms, neck, chest, waist } = this.props.measurements;
    const pixelHeight = arms.wingspan * 0.98;
    const height = 600;
    const factor = height/pixelHeight;
    const chestWidth = chest.average * factor;
    const waistWidth = waist.maximum * factor;
    const shirtLength = arms.wingspan * 0.4 * factor;
    const shoulderWidth = chest.average * 0.9 * factor;
    const neckWidth = neck.mininum * factor;
    const armHole = shirtLength*.25;
    if (!(arms && neck && chest)) return group;
    const lines = this.calcShirtLines(chestWidth, shirtLength, armHole, shoulderWidth, neckWidth, waistWidth);
    lines.forEach(line => {
      const pointString = line.map(pair => (
       `${pair[0].toString()}, ${pair[1].toString()}`
      )).join(' ');
      // draw line from points
      if (pointString[0].toLowerCase() === 'm'){
        group.add(draw.path(pointString).fill('none').stroke({ width: 1 }));
      } else {
        group.add(draw.polyline(pointString).fill('none').stroke({ width: 1 }));

      }
    });
    group.transform({x: 250, y: 50});
    return group;
  }

  render(){

    return(
      <div ref={(component) => { this.drawing = component;}}></div>
    );
  }
}

export default Shirt;
