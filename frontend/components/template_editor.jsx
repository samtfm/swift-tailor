import React from 'react';
import Shirt from './shirt';

class TemplateEditor extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      inputs: {
        length: 28,
        neck: 3,
        chest: 32,
        waist: 34,
        shoulders: 40
      },
      inchMeasurements: {},
      radio: 1,
      pattern: 'https://images.blogthings.com/thecolorfulpatterntest/pattern-1.png'
    };
    this.converter = this.converter.bind(this);
    this.updateValue = this.updateValue.bind(this);
    this.changeRadio = this.changeRadio.bind(this);
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

  changeRadio(val, pattern){
    this.setState({
      radio: val,
      pattern
    });
  }

  componentWillReceiveProps(newProps){
    if (!newProps.measurements.wingspan || !newProps.height) return;
    let { wingspan, neckWidth, chestWidth, waistWidth, bustWidth, stomachWidth, shoulders } = newProps.measurements;
    bustWidth = bustWidth || chestWidth*0.5;
    stomachWidth = stomachWidth || waistWidth*0.5;
    shoulders = shoulders || chestWidth *.9;
    stomachWidth = stomachWidth*.8;
    let height = newProps.height;
    let rawHeight = wingspan * 0.98;
    const scaleFactor = height/rawHeight;

    // Approximation of elipse based on two diameters
    let chest = 6*Math.pow(chestWidth*chestWidth/8 + bustWidth*bustWidth/8, 0.5);
    let waist = 6*Math.pow(waistWidth*waistWidth/8 + stomachWidth*stomachWidth/8, 0.5);

    this.updateInchMeasuruements({
      length: Math.floor(height * 0.4 * 10)/10,
      neck: Math.floor(neckWidth * scaleFactor * 10)/10,
      chest: Math.floor((chest * scaleFactor - 3) * 10)/10,
      waist: Math.floor((waist * scaleFactor - 3) * 10)/10,
      shoulders: Math.floor(shoulders * scaleFactor * 10)/10

    });
  }

  updateInchMeasuruements({length, neck, chest, waist, bust, stomach, shoulders}){
    this.setState({
     inputs: {
      length,
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
       shirtLength: length,
       shoulderWidth: chest * 0.9,
       armHole: chest * .9 * 0.14 + length * .12
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
    const { length, neck, chest, waist, shoulders } = this.state.inputs;
    var patterns = [
      'https://images.blogthings.com/thecolorfulpatterntest/pattern-1.png',
      'https://s-media-cache-ak0.pinimg.com/736x/c0/40/c5/c040c5d4fbdf16556d3ca09f44093977--hexagon-pattern-pattern-art.jpg',
      'http://vectorpatterns.co.uk/wp-content/uploads/2014/01/heart-ouline-pattern-620x400.png'
    ]
    return (
      <div className="template-container">
        <h2>(Step 3)   Make any desired adjustments</h2>
        <section className='template-editor'>
          <div className="options">
            <ul>
              <label>
                Length:
                <input type = 'number' name='length' value={length} onChange={this.updateValue}></input>
              </label>
              <label>
                Neck:
                <input type = 'number' name='neck' value={neck} onChange={this.updateValue}></input>
              </label>
              <label>
                Shoulder Width:
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
            <div className='radio'>
              <img src={patterns[0]}
                onClick={() => this.changeRadio(1, patterns[0])}
                className={this.state.radio === 1 ? 'selected' : 'unselected'}
              />
              <img src={patterns[1]}
                onClick={() => this.changeRadio(2, patterns[1])}
                className={this.state.radio === 2 ? 'selected' : 'unselected'}
              />
              <img src={patterns[2]}
                onClick={() => this.changeRadio(3, patterns[2])}
                className={this.state.radio === 3 ? 'selected' : 'unselected'}
              />
            </div>
          </div>

          <section className='preview'>
            <Shirt
              inchMeasurements={this.state.inchMeasurements}
              pattern={this.state.pattern} />
          </section>
        </section>
        <button id="download"
          onClick={this.converter}>Download as image</button>
        <canvas
          id="convertCanvas"
          width="600px"
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
