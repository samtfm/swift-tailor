import React from 'react';

export default class CalcIndicator extends React.Component {
  constructor(props){
    super(props);
  }

  render(){
    let { side, measurements } = this.props;
    if(measurements.length <= 1){
      measurements = [measurements];
    }
    console.log(measurements.length);

    return(
      <section className='indicator-container'>
        <h3>{side}</h3>
        <section>
        {measurements.map((measurement, i) =>
          <section
            key={i}
            className={ measurement > 0 ? 'green' : 'indicator-box'}>
            {i+1}
          </section>
        )}
        </section>
      </section>
    );
  }
}
