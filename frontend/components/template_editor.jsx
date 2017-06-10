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

  updateValue(e){
    const newState = { inputs: {} };
    newState.inputs[e.target.name] = e.target.value;
    this.setState(newState);
  }

  componentWillReceiveProps(newProps){
    if (!newProps.measurements || !newProps.measurements.arms) return;
    let {arms, neck, chest, waist } = newProps.measurements;
    const heightInches = 71;
    const rawHeight = arms.wingspan * 0.98;
    const scaleFactor = heightInches/rawHeight;
    const chestWidth = chest.average * scaleFactor;
    const waistWidth = waist.maximum * scaleFactor;
    const shirtLength = arms.wingspan * 0.4 * scaleFactor;
    const shoulderWidth = chest.average * 0.9 * scaleFactor;
    const neckWidth = neck.mininum * scaleFactor;

    const armHole = shirtLength*.25;
    this.setState({
      inchMeasurements: {
        height: heightInches,
        neck: neckWidth,
        chest: chestWidth,
        waist: waistWidth
      }
   });
  }


  render(){
    const { height, neck, chest, waist } = this.state;
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
          pixelMeasurements={this.state.pixelMeasurements /*this.state.measurements*/}
          inchMeasurements={this.state.inchMeasurements} />
      </div>
    );
  }

}

export default TemplateEditor;
