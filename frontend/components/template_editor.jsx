import React from 'react';

class TemplateEditor extends React.Component{

  render(){

    return (
      <input type = 'text' value='72' onChange=></input>
      <ul>
        <li>height: {height}</li>
        <li>neck: {neck}</li>
        <li>chest: {chest}</li>
        <li>waist: {waist}</li>
      </ul>
      <Shirt measurements={{}/*this.state.measurements*/} />
    )
  }

}

export default TemplateEditor;
