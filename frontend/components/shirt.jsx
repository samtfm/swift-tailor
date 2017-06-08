import React from 'react';
import SVG from 'svg.js';

class Shirt extends React.Component{

  componentDidMount(){
    let i = 100;
    this.last = dra
    const draw = SVG(this.drawing).size(300,300);
    let last = this.drawShirt(draw, i);
    setInterval(() => {
      i += 10;
      if (i< 200){

      }

    }, 200);
  }
  calcShirtLines(chest, length, armHole, shoulders, neck){
    const lines = [];
    lines.push([
      [neck/2, -5],
      [shoulders/2, 0]
    ]);
    lines.push([
      [`M${shoulders/2}`, 0],
      [`C${chest/2-10}`, armHole],
      [ chest/2, armHole],
      [chest/2, armHole]
    ]);
    // lines.push([
    //   [shoulders/2, 0],
    //   [(shoulders+chest)/4 -5, armHole*.7],
    //   [chest/2, armHole]
    // ]);
    lines.push([
      [chest / 2, armHole],
      [(chest / 2 + 5), length],
      [-(chest / 2 + 5), length],
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
    let {arms, neck, chest } = this.props.measurements;
    if (!(arms && neck && chest)) return group;
    const lines = this.calcShirtLines(chest.average, arms.wingspan*.4, 40, chest*.9, neck.average);
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
    group.transform({x: 100, y: 80});
    return group;
  }

  render(){
    const draw = SVG(this.drawing).size(300,300);

    this.last = this.last ?
      this.last.replace(this.drawShirt(draw)) :
      this.drawShirt(draw);

    return(
      <div ref={(component) => { this.drawing = component;}}></div>
    );
  }
}

export default Shirt;
