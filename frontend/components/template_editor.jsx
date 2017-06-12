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
    if (!newProps.measurements.wingspan || !newProps.height) return;
    let { wingspan, neckWidth, chestWidth, waistWidth, bustWidth, stomachWidth, shoulders } = newProps.measurements;
    bustWidth = bustWidth || chestWidth*0.5;
    stomachWidth = stomachWidth || waistWidth*0.5;
    shoulders = shoulders || chestWidth *.9;
    let height = newProps.height;
    let rawHeight = wingspan * 0.98;
    const scaleFactor = height/rawHeight;

    // Approximation of elipse based on two diameters
    let chest = 6*Math.pow(chestWidth*chestWidth/8 + bustWidth*bustWidth/8, 0.5);
    let waist = 6*Math.pow(waistWidth*waistWidth/8 + stomachWidth*stomachWidth/8, 0.5);

    this.updateInchMeasuruements({
      length: height * 0.4,
      neck: neckWidth * scaleFactor,
      chest: chest * scaleFactor - 3,
      waist: waist * scaleFactor - 3,
      shoulders: shoulders * scaleFactor

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


  render(){
    const { length, neck, chest, waist, shoulders } = this.state.inputs;
    return (
      <div className='template-editor'>
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
        <section className='preview'>
          <Shirt
            inchMeasurements={this.state.inchMeasurements} />
        </section>
      </div>
    );
  }

}

export default TemplateEditor;
