import React from 'react';
import Shirt from './shirt';

class TemplateEditor extends React.Component{

  constructor(props){
    super(props);
    this.state = { height: 70, neck: 3, chest: 14, waist: 16 };
  }

  updateValue(e){
    const newState = {};
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  }

  render(){
    const { height, neck, chest, waist } = this.state;
    return (
      <div>
        <ul>
          <label>
            Height:
            <input type = 'text' name='height' value={height} onChange={this.updateValue.bind(this)}></input>
          </label>
          <label>
            Neck:
            <input type = 'text' name='neck' value={neck} onChange={this.updateValue.bind(this)}></input>
          </label>
          <label>
            Chest:
            <input type = 'text' name='chest' value={chest} onChange={this.updateValue.bind(this)}></input>
          </label>
          <label>
            Waist:
            <input type = 'text' name='waist' value={waist} onChange={this.updateValue.bind(this)}></input>
          </label>
        </ul>
        <Shirt measurements={{}/*this.state.measurements*/} />
      </div>
    );
  }

}

export default TemplateEditor;
