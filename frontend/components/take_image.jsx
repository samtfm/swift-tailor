import React from 'react';
import { detectFace, applyCanny, drawFace } from '../util/body_detection';
// import { test } from './canny/test';
export default class TakeImage extends React.Component {

  componentDidMount(){
    // Grab elements, create settings, etc.
    let canvas = document.getElementById('canvas-pic');
    let canvasW = canvas.width;
    let canvasH = canvas.height;
    let video = document.getElementById('video');
    let context = canvas.getContext('2d');

    let options = {
      blur_radius: 2,
      low_threshold: 20,
      high_threshold: 50,
    };

    // Get access to the camera!
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Not adding `{ audio: true }` since we only want video now
        navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
            video.src = window.URL.createObjectURL(stream);
            video.play();
        });
    }
    document.getElementById("snap").addEventListener("click", function() {
    	context.drawImage(video, 0, 0, canvasW, canvasH);
      //Copies the picture canvas translates to the calculation canvas
      let calcCanvas = document.getElementById('calcCanvas');
      let calcCtx = calcCanvas.getContext('2d');
      calcCtx.drawImage(canvas, 0, 0);

      // detectFace detects a face then returns the box region and scale;
      // applyCanny applies canny to the canvas, duh...
      // drawFace draws the faceBox on the canvas after canny has been applied;
      let faceBox = detectFace(calcCtx, options);
      applyCanny(calcCtx, options);
      drawFace(calcCtx, faceBox.face, faceBox.scale);
    });
  }

  render(){
    return(
      <section>
        <h2>SECTION TO TAKE OR UPLOAD A PICTURE</h2>
        <section className="take-image-section">
          <video id="video" width="480" height="360" autoPlay></video>
          <canvas id="canvas-pic" width="480" height="360"></canvas>
        </section>
        <button id="snap">Snap Photo</button>
      </section>
    );
  }
}
