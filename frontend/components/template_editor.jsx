import React from 'react';
import Shirt from './shirt';

class TemplateEditor extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      inputs: { height: 70, neck: 3, chest: 14, waist: 16 },
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
    if (!newProps.measurements || !newProps.measurements.arms) return;
    let {arms, neck, chest, waist } = newProps.measurements;
    const heightInches = 71;
    const rawHeight = arms.wingspan * 0.98;
    const scaleFactor = heightInches/rawHeight;

    this.updateInchMeasuruements({
      height: heightInches,
      neck: neck.mininum * scaleFactor,
      chest: chest.average * scaleFactor,
      waist: waist.maximum * scaleFactor,
    });
  }

 updateInchMeasuruements({height, neck, chest, waist}){
   this.setState({
     inchMeasurements: {
       neckWidth: neck,
       chestWidth: chest,
       waistWidth: waist,
       shirtLength: height * 0.4,
       shoulderWidth: chest * 0.9,
       armHole: height * 0.1
     }
   });
 }


  render(){
    const { height, neck, chest, waist } = this.state.inputs;
    return (
      <div>
        <ul>
          <label>
            Height:
            <input type = 'text' name='height' value={height} onChange={this.updateValue}></input>
          </label>
          <label>
            Neck:
            <input type = 'text' name='neck' value={neck} onChange={this.updateValue}></input>
          </label>
          <label>
            Chest:
            <input type = 'text' name='chest' value={chest} onChange={this.updateValue}></input>
          </label>
          <label>
            Waist:
            <input type = 'text' name='waist' value={waist} onChange={this.updateValue}></input>
          </label>
        </ul>
        <Shirt
          inchMeasurements={this.state.inchMeasurements} />
      </div>
    );
  }

}

export default TemplateEditor;
