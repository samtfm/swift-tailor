import React from 'react';
import jsfeat from 'jsfeat';
import compatibility from './compatibility';
import profiler from './profiler';

class Canny extends React.Component{
  constructor(props){
    super(props);
  }

  componentDidMount(){
    let video = document.getElementById('video');
    console.log(video);

    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Not adding `{ audio: true }` since we only want video now
    navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
        video.src = window.URL.createObjectURL(stream);
        video.play();
    });
}
  }

  render(){

    let videoStyle = {
      display: 'none',
      width: '640px',
      height: '480px'
    };
    let divStyle = {
      width: '640px',
      height: '480px',
      margin: '10px auto'
    };

    let canvasStyle = {
      width: '640px',
      height: '480px'
    };

    return (
      <section className="detect-section">
        <h2>Section for Image detection</h2>
        <video id="video" autoPlay="true" style={videoStyle}></video>
        <canvas id="canvas" style={canvasStyle}></canvas>
      </section>
    );
  }

}

export default Canny;
