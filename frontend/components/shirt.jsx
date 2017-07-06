import React from 'react';
import SVG from 'svg.js';
import { calcShirtLines, calcSleeveLines, parseLines } from '../util/clothing';

class Shirt extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      inchMeasurements: {},
      pixelMeasurements: {}
    };
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

  drawShirt(){
    const group = this.draw.group();
    const fill = this.props.pattern;
    const { pixelHeight,
      chestWidth,
      waistWidth,
      shirtLength,
      shoulderWidth,
      neckWidth,
      armHole
    } = this.state.pixelMeasurements;
    if (!(chestWidth && neckWidth && shirtLength)) return group;
    const torsoLines = calcShirtLines(
      chestWidth, shirtLength,
      armHole, shoulderWidth,
      neckWidth, waistWidth
    );
    let wholeShirt = parseLines(torsoLines).join(" ");

    const sleeveLines = calcSleeveLines(armHole, shirtLength);
    let sleeves = parseLines(sleeveLines).join(" ");

    // console.log(wholeShirt);
    // var pattern = this.draw.pattern(20, 20, function(add) {
    //   add.rect(20,20).fill('#f06');
    //   add.rect(10,10).fill('#0f9');
    //   add.rect(10,10).move(10,10).fill('#fff');
    // });

    group.add(this.draw
      .path(wholeShirt)
      .fill(fill)
      .stroke({ width: 1 })
    );
    let temp = this.draw
      .path(sleeves)
      .rotate(90);
    temp.fill(fill).stroke({ width: 1 });
    group.add(temp);
    // lines.push(["L", [0,0], [0,length]]);
    const lengthText = this.draw.text(`${this.props.inchMeasurements.shirtLength}'`);
    lengthText.transform({ x: -140, y: shirtLength/2});
    group.add(lengthText);

    const widthText = this.draw.text(`${this.props.inchMeasurements.waistWidth/2}'`);
    widthText.transform({ x: -140, y: shirtLength});
    group.add(widthText);

    group.transform({x: 250, y: 50});
    return group;
  }

  render(){
    if (this.drawing){
      this.shirt = this.shirt ? this.shirt.replace(this.drawShirt()) : this.drawShirt();
    }

    const {height, neck, chest, waist} = this.state.pixelMeasurements;
    return(
      <div className='shirt'>
        <div ref={(component) => { this.drawing = component; }}></div>
      </div>
    );
  }
}

export default Shirt;
