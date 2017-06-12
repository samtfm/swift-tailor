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
        bust: 0,
        stomach: 0,
        waist: 16
      },
      inchMeasurements: {}
    };

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
    const scaleFactor = (height/rawHeight).toFixed(3) || 0,;
    this.updateInchMeasuruements({
      height,
      neck: neck * scaleFactor,
      chest: chestWidth * scaleFactor,
      waist: waistWidth * scaleFactor,
      bust: bustWidth * scaleFactor,
      stomach: stomachWidth * scaleFactor,
    });
    // if (!newProps.measurements || !newProps.measurements.arms) return;
    // let {arms, neck, chest, waist } = newProps.measurements;
    // const heightInches = 71;
    // const rawHeight = arms.wingspan * 0.98;
    // const scaleFactor = heightInches/rawHeight;
    //
    // this.updateInchMeasuruements({
    //   height: heightInches,
    //   neck: neck.mininum * scaleFactor,
    //   chest: chest.average * scaleFactor,
    //   waist: waist.maximum * scaleFactor,
    // });
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


  render(){
    const { height, neck, chest, waist, bust, stomach, shoulders } = this.state.inputs;
    return (
      <div className='template-editor'>
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
            Chest:
            <input type = 'number' name='chest' value={chest} onChange={this.updateValue}></input>
          </label>
          <label>
            Shoulder:
            <input type = 'number' name='shoulder' value={shoulders} onChange={this.updateValue}></input>
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
      </div>
    );
  }

}

export default TemplateEditor;
