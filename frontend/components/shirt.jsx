import React from 'react';
import SVG from 'svg.js';

class Shirt extends React.Component{

  constructor(props){
    super(props);
    this.state = {inchMeasurements: {}, pixelMeasurements: {}};
  }
  componentDidMount(){
    this.draw = SVG(this.drawing).size(500,500);
  }
  componentWillReceiveProps(newProps){
    if (newProps.inchMeasurements){
      console.log(newProps);
      const pixelMeasurements = {};
      const shirtScale = 100/12;
      for (var key in newProps.inchMeasurements) {
        pixelMeasurements[key] = newProps.inchMeasurements[key] * shirtScale;
      }
      this.setState({ pixelMeasurements });
    }
  }
  calcShirtLines(chest, length, armHole, shoulders, neck, waist){
    const lines = [];
    neck = neck*2;
    const neckline = [
      "M",
      [-neck/2, -5],
      "c",
      [neck*.2, neck*.35],
      [neck*.8, neck*.35],
      [neck, 0],
    ];
    lines.push(neckline);
    const backNeckline = [
      "M",
      [-neck/2, -5],
      "c",
      [neck*.15, neck*.15],
      [neck*.85, neck*.15],
      [neck, 0],
    ];
    lines.push(backNeckline);

    const shoulderLine = [
      [neck/2, -5],
      [shoulders/2, 0]
    ];
    lines.push(shoulderLine);
    lines.push(this.scaleLine(shoulderLine, -1, 1));

    const sleeveCurve = [
      "M",
      [shoulders/2, 0],
      "c",
      [-armHole*.02, armHole*.2],
      [-armHole*.05, armHole*.7],
      [(chest-shoulders)/2, armHole],
    ];
    lines.push(sleeveCurve);
    lines.push(this.scaleLine(sleeveCurve, -1, 1));

    const box = [
      [chest / 2, armHole],
      [(waist/2), length],
      [-(waist/2), length],
      [-chest / 2, armHole]
    ];
    lines.push(box);
    // lines.push(this.expandOutLine(box, 5,5));

    //center line
    lines.push([
      [0,0],
      [0,length]
    ]);
    return lines;
  }

  scaleLine(line, x, y){
    return line.map(val => {
      if (typeof val === 'string'){
        return val;
      }
      return [x*val[0], y*val[1]];
    });
  }
  transformLine(line, x, y){
    return line.map(val => {
      if (typeof val === 'string'){
        return val;
      }
      return [x + val[0], y + val[1]];
    });
  }
  expandOutLine(line, x, y){
    return line.map(val => {
      if (typeof val === 'string'){
        return val;
      }
      return [val[0] + x * Math.sign(val[0]),
              val[1] + y * Math.sign(val[1])];
    });
  }

  drawShirt(){
    const group = this.draw.group();
    const { pixelHeight,
      chestWidth,
      waistWidth,
      shirtLength,
      shoulderWidth,
      neckWidth,
      armHole
    } = this.state.pixelMeasurements;
    if (!(chestWidth && neckWidth && shirtLength)) return group;
    console.log(this.state.pixelMeasurements);
    const lines = this.calcShirtLines(chestWidth, shirtLength, armHole, shoulderWidth, neckWidth, waistWidth);
    lines.forEach(line => {
      const pointString = line.map(pair => (
        typeof pair === "string" ? pair :
          `${pair[0].toString()}, ${pair[1].toString()}`
        )).join(' ');
      // draw line from points
      if (pointString[0].toLowerCase() === 'm'){
        group.add(this.draw.path(pointString).fill('none').stroke({ width: 1 }));
      } else {
        group.add(this.draw.polyline(pointString).fill('none').stroke({ width: 1 }));

      }
    });
    group.transform({x: 250, y: 50});
    return group;
  }

  render(){
    if (this.drawing){
      this.last = this.last ?
        this.last.replace(this.drawShirt()) :
        this.drawShirt();
    }

    const {height, neck, chest, waist} = this.state.pixelMeasurements;
    return(
      <div className='shirt'>
        <div ref={(component) => { this.drawing = component;}}></div>
      </div>
    );
  }
}

export default Shirt;
