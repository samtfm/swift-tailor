import React from 'react';
import jsfeat from 'jsfeat';
import profiler from './canny/profiler';


class YapeSix extends React.Component{

  componentDidMount(){
    const stat = new profiler();
    stat.add("yape06");

    const corners = [];
    var i = 640*480;
    while(--i >= 0) {
      corners[i] = new jsfeat.keypoint_t(0,0,0,0);
    }
    let img_u8 = new jsfeat.matrix_t(640, 480, jsfeat.U8_t | jsfeat.C1_t);
    stat.start("yape06");
    let count = jsfeat.yape06.detect(img_u8, corners);
    stat.stop("yape06");
  }

  render(){
    return(
      <img src='https://vignette1.wikia.nocookie.net/seuss/images/3/38/Sam-I-Am_1.gif/revision/latest?cb=20130805123312' />
    );
  }
}

export default YapeSix;
