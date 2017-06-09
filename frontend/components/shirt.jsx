import React from 'react';
import SVG from 'svg.js';

class Shirt extends React.Component{

  constructor(props){
    super(props);
    this.state = {inchMeasurements: {}};
  }
  componentDidMount(){
    // const draw = SVG(this.drawing).size(500,500);
    // this.last = this.drawShirt(draw);
    this.draw = SVG(this.drawing).size(500,500);
  }
  componentWillReceiveProps(newProps){
    let {arms, neck, chest, waist } = newProps.measurements;
    const heightInches = 71;
    const shirtScale = 100;
    const rawHeight = arms.wingspan * 0.98;
    const pixelHeight = heightInches/12*shirtScale;
    const factor = pixelHeight/rawHeight;
    const chestWidth = chest.average * factor;
    const waistWidth = waist.maximum * factor;
    const shirtLength = arms.wingspan * 0.4 * factor;
    const shoulderWidth = chest.average * 0.9 * factor;
    const neckWidth = neck.mininum * factor;
    const armHole = shirtLength*.25;
    this.setState({ inchMeasurements: {
      height: heightInches,
      neck: neckWidth/shirtScale,
      chest: chestWidth/shirtScale,
      waist: waistWidth/shirtScale
    } });
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

    // set up draw constant for svg.js
    if (!this.props.measurements) return group;
    let {arms, neck, chest, waist } = this.props.measurements;
    const heightInches = 71;
    const shirtScale = 100;
    const rawHeight = arms.wingspan * 0.98;
    const pixelHeight = heightInches/12*shirtScale;
    const factor = pixelHeight/rawHeight;
    const chestWidth = chest.average * factor;
    const waistWidth = waist.maximum * factor;
    const shirtLength = arms.wingspan * 0.4 * factor;
    const shoulderWidth = chest.average * 0.9 * factor;
    const neckWidth = neck.mininum * factor;
    const armHole = shirtLength*.25;



    if (!(arms && neck && chest)) return group;
    const lines = this.calcShirtLines(chestWidth, shirtLength, armHole, shoulderWidth, neckWidth, waistWidth);
    lines.forEach(line => {
      // const pointString = line.map(pair => (
      //  `${pair[0].toString()}, ${pair[1].toString()}`
      // )).join(' ');
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

    const {height, neck, chest, waist} = this.state.inchMeasurements;
    return(
      <div>
        <div ref={(component) => { this.drawing = component;}}></div>
        <input type = 'text' value='6'></input>
        <ul>
          <li>height: {height}</li>
          <li>neck: {neck}</li>
          <li>chest: {chest}</li>
          <li>waist: {waist}</li>
        </ul>
      </div>
    );
  }
}

export default Shirt;
