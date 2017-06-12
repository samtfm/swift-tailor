import React from 'react';
import Shirt from './shirt';

class TemplateEditor extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      inputs: {
        height: 70,
        neck: 3,
        chest: 32,
        waist: 34,
        shoulders: 40
      },
      inchMeasurements: {}
    };
    this.converter = this.converter.bind(this);
    this.updateValue = this.updateValue.bind(this);
  }
  componentDidMount(){
    this.updateInchMeasuruements(this.state.inputs);
  }

  updateValue(e){
    const newInputs = this.state.inputs;
    let val = parseFloat(e.target.value) || 0;
    newInputs[e.target.name] = val;
    this.setState(newInputs);
    this.updateInchMeasuruements(this.state.inputs);
  }

  componentWillReceiveProps(newProps){

    if (!newProps.measurements.stomachWidth || !newProps.height) return;
    let { wingspan, neck, chestWidth, waistWidth, bustWidth, stomachWidth } = newProps.measurements;
    let height = newProps.height;
    let rawHeight = wingspan * 0.98;
    const scaleFactor = height/rawHeight;
    this.updateInchMeasuruements({
      height,
      neck: neck * scaleFactor,
      chest: chestWidth * scaleFactor,
      waist: waistWidth * scaleFactor,
      bust: bustWidth * scaleFactor,
      stomach: stomachWidth * scaleFactor,
    });
  }

  updateInchMeasuruements({height, neck, chest, waist, bust, stomach, shoulders}){
    this.setState({
      inputs: {
        height,
        neck,
        chest,
        waist,
        bust,
        stomach,
        shoulders
      },
      inchMeasurements: {
        neckWidth: neck,
        chestWidth: chest,
        waistWidth: waist,
        shirtLength: height * 0.4,
        shoulderWidth: chest * 0.9,
        armHole: chest * .9 * 0.14 + height * 0.4 * .12
      }
    });
  }

  converter(e){
    let png;
    var svgString = new XMLSerializer().serializeToString(document.querySelector('svg'));
    var canvas = document.getElementById("convertCanvas");
    var ctx = canvas.getContext("2d");
    var DOMURL = self.URL || self.webkitURL || self;
    var img = new Image();
    var svg = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
    var url = DOMURL.createObjectURL(svg);
    img.onload = function() {
      ctx.drawImage(img, 0, 0);
      png = canvas.toDataURL("image/png");
      document.querySelector('#png-container').innerHTML = '<img src="'+png+'"/>';
      DOMURL.revokeObjectURL(png);
      var anchor = document.createElement('a');
      anchor.href = png;
      anchor.target = '_blank';
      anchor.download = 'shirt.png';
      anchor.click();
    };
    img.src = url;

  }

  render(){
    const { height, neck, chest, waist, bust, stomach, shoulders } = this.state.inputs;
    return (
      <div className="template-container">
        <h2>(Step 1)   Enter your height</h2>
        <section className='template-editor'>
          <ul>
            <label>
              Height:
              <input type = 'number' name='height' value={height} onChange={this.updateValue}></input>
            </label>
            <label>
              Neck:
              <input type = 'number' name='neck' value={neck} onChange={this.updateValue}></input>
            </label>
            <label>
              Shoulders:
              <input type = 'number' name='shoulders' value={shoulders} onChange={this.updateValue}></input>
            </label>
            <label>
              Chest:
              <input type = 'number' name='chest' value={chest} onChange={this.updateValue}></input>
            </label>
            <label>
              Waist:
              <input type = 'number' name='waist' value={waist} onChange={this.updateValue}></input>
            </label>
          </ul>
          <section className='preview'>
            <Shirt
              inchMeasurements={this.state.inchMeasurements} />
          </section>
        </section>
        <button id="download"
          onClick={this.converter}>Download as image</button>
        <canvas
          id="convertCanvas"
          width="500px"
          height="500px"
          className="hidden"
        >
        </canvas>
        <div
          id="png-container"
          className="hidden"></div>
      </div>
    );
  }

}

export default TemplateEditor;
