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

    return(
      <section className='indicator-container'>
        <h3>{side}</h3>
        <section>
        {measurements.map((measurement, i) =>
          <p
            key={i}
            className={ measurement.length > 0 ? 'green' : 'indicator-box'}>
            { measurement.toString() }
          </p>
        )}
        </section>
      </section>
    );
  }
}
