import React from 'react';
import Shirt from './shirt';

class TemplateEditor extends React.Component{

  constructor(props){
    super(props);
    this.state = { height: 70, neck: 3, chest: 14, waist: 16 };
  }

  updateValue(e){
    console.log(e.target);
  }

  render(){
    const { height, neck, chest, waist } = this.state;
    return (
      <div>
        <ul>
          <input type = 'text' value='72' onChange={this.updateValue.bind(this)}></input>
          <li>height: {height}</li>
          <li>neck: {neck}</li>
          <li>chest: {chest}</li>
          <li>waist: {waist}</li>
        </ul>
        <Shirt measurements={{}/*this.state.measurements*/} />
      </div>
    );
  }

}

export default TemplateEditor;
