import React from 'react';
import jsfeat from 'jsfeat';
import { faceClassifier } from './canny/face_classifier';
// import { test } from './canny/test';
export default class TakeImage extends React.Component {

  componentDidMount(){
    // Grab elements, create settings, etc.
    let canvas = document.getElementById('canvas-pic');
    let video = document.getElementById('video');
    let context = canvas.getContext('2d');
    // Get access to the camera!
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Not adding `{ audio: true }` since we only want video now
        navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
            video.src = window.URL.createObjectURL(stream);
            video.play();
        });
    }
    document.getElementById("snap").addEventListener("click", function() {
    	context.drawImage(video, 0, 0, 480, 360);
      //Copies the picture canvas translates to the calculation canvas
      var calcCanvas = document.getElementById('calcCanvas');
      var calcCtx = calcCanvas.getContext('2d');
      calcCtx.drawImage(canvas, 0, 0);

      //Attempt to find face;
      var img_u8, ii_sum, ii_sqsum, ii_tilted, ii_canny, w, h;
      var classifier = faceClassifier;
      w = calcCanvas.width;
      h = calcCanvas.height;
      var imageData = calcCtx.getImageData(0, 0, w, h);
      img_u8 = new jsfeat.matrix_t(480, 360, jsfeat.U8_t | jsfeat.C1_t);
      ii_sum = new Int32Array((w+1)*(h+1));
      ii_sqsum = new Int32Array((w+1)*(h+1));
      ii_tilted = new Int32Array((w+1)*(h+1));
      ii_canny = new Int32Array((w+1)*(h+1));
      jsfeat.imgproc.grayscale(imageData.data, w, h, img_u8);
      console.log(classifier);
      jsfeat.imgproc.compute_integral_image(img_u8, ii_sum, ii_sqsum, classifier.tilted ? ii_tilted : null);

      // jsfeat.haar.edges_density = 0.2;
      // var rects = jsfeat.haar.detect_multi_scale(ii_sum, ii_sqsum, ii_tilted, options.use_canny? ii_canny : null, img_u8.cols, img_u8.rows, classifier, options.scale_factor, options.min_scale);
      // rects = jsfeat.haar.group_rectangles(rects, 1);
      // // draw only most confident one
      // draw_faces(calcCtx, rects, 480/img_u8.cols, 1);
    });

    function draw_faces(ctx, rects, sc, max) {
      var on = rects.length;
      if(on && max) {
        jsfeat.math.qsort(rects, 0, on-1, function(a,b){return (b.confidence<a.confidence);})
      }
      var n = max || on;
      n = Math.min(n, on);
      var r;
      for(var i = 0; i < n; ++i) {
          r = rects[i];
          ctx.strokeRect((r.x*sc)|0,(r.y*sc)|0,(r.width*sc)|0,(r.height*sc)|0);
      }
    }
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
