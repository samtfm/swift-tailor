import React from 'react';
import SVG from 'svg.js';

class Shirt extends React.Component{

  constructor(props){
    super(props);
    this.state = {inchMeasurements: {}, pixelMeasurements: {}};
    this.shirtScale = 100/8;
  }
  componentDidMount(){
    this.draw = SVG(this.drawing).size(600,500);
  }
  componentWillReceiveProps(newProps){
    if (newProps.inchMeasurements){
      const pixelMeasurements = {};
      for (var key in newProps.inchMeasurements) {
        pixelMeasurements[key] = newProps.inchMeasurements[key] * this.shirtScale;
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
      [neck*.2, neck*.55],
      [neck*.8, neck*.55],
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
      [shoulders/4, 0]
    ];
    lines.push(shoulderLine);
    lines.push(this.scaleLine(shoulderLine, -1, 1));

    const sleeveCurve = [
      "M",
      [shoulders/4, 0],
      "C",
      [shoulders/4-armHole*.02, armHole*.2],
      [shoulders/4-armHole*.05, armHole*.7],
      [chest/4, armHole],
    ];
    lines.push(sleeveCurve);
    lines.push(this.scaleLine(sleeveCurve, -1, 1));
    const sleeve = [
      [0, 0],
      [length*.2, 2*armHole*.12],
      [length*.2, 2*armHole*.88],
      [0, 2*armHole],
    ];
    const sleeveCurveFull = [
      "M",
      [0, 0],
      "C",
      [-armHole*.11, armHole*.2],
      [-armHole*.25, armHole*.7],

      [-armHole*.25, armHole],
      "C",
      [-armHole*.25, armHole*1.3],
      [-armHole*.11, armHole*1.8],

      [0, 2*armHole]
    ];
    lines.push(this.transformLine(sleeve, chest/4+80, 0));
    lines.push(this.transformLine(sleeveCurveFull, chest/4+80, 0));
    const box = [
      [chest/4, armHole],
      [(waist/4), length],
      [-(waist/4), length],
      [-chest/4, armHole]
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

    const lengthText = this.draw.text(`${this.props.inchMeasurements.shirtLength}'`);
    lengthText.transform({ x: 6, y: shirtLength/2});
    group.add(lengthText);

    const widthText = this.draw.text(`${this.props.inchMeasurements.waistWidth/2}'`);
    widthText.transform({ x: 0, y: shirtLength});
    group.add(widthText);


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
