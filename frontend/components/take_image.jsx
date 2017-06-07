import React from 'react';
import { detectFace, detectHand, drawFace, drawHand} from '../util/body_detection';

import { applyCanny } from '../util/image_filter';
import profiler from '../util/profiler';
import { detectOutlinePoints } from '../util/body_detection';

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

    let stat = new profiler();
        stat.add("grayscale");
        stat.add("gauss blur");
        stat.add("canny edge");


    // Get access to the camera!
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Not adding `{ audio: true }` since we only want video now
      navigator.mediaDevices.getUserMedia({ video: true })
        .then( stream => {
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

      // let handBox = detectHand(calcCtx, options);
      // drawHand(calcCtx, handBox.hand, handBox.scale);
      let cannyData = applyCanny(calcCtx, options, stat);
      try{
        drawFace(calcCtx, faceBox.face, faceBox.scale);
      } catch(err){
        console.log("couldn't find a face");
      }
      let points = detectOutlinePoints(cannyData, faceBox.face);
      calcCtx.fillStyle = '#0F0';
      points.forEach(point => {
        calcCtx.fillRect(point[0],point[1], 2, 2);
      });
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
