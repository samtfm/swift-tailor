import React from 'react';
import jsfeat from 'jsfeat';
import profiler from './canny/profiler';
import { faceClassifier } from './canny/face_classifier';
// import { test } from './canny/test';
export default class TakeImage extends React.Component {

  componentDidMount(){
    // Grab elements, create settings, etc.
    let canvas = document.getElementById('canvas-pic');
    let canvasW = canvas.width;
    let canvasH = canvas.height;
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
    	context.drawImage(video, 0, 0, canvasW, canvasH);
      //Copies the picture canvas translates to the calculation canvas
      var calcCanvas = document.getElementById('calcCanvas');
      var calcCtx = calcCanvas.getContext('2d');
      calcCtx.drawImage(canvas, 0, 0);

      // Attempt to find face;

      // ii_sum         - integral of the source image
      // ii_sqsum       - squared integral of the source image
      // ii_tilted      - tilted integral of the source image
      // ii_canny_sum   - integral of canny source image or undefined
      // width           - width of the source image
      // height          - height of the source image
      // classifier      - haar cascade classifier
      // scale_factor    - how much the image size is reduced at each image scale
      // scale_min       - start scale
      // rects           - rectangles representing detected object
      var img_u8, ii_sum, ii_sqsum, ii_tilted, ii_canny, w, h;
      w = calcCanvas.width;
      h = calcCanvas.height;
      console.log(w,h);
      var classifier = faceClassifier;
      var imageData = calcCtx.getImageData(0, 0, w, h);

      var demo_opt = function(){
        this.blur_radius = 2;
        this.low_threshold = 20;
        this.high_threshold = 50;
      };
      let options = new demo_opt();

      img_u8 = new jsfeat.matrix_t(480, 360, jsfeat.U8_t | jsfeat.C1_t);
      ii_sum = new Int32Array((w+1)*(h+1));
      ii_sqsum = new Int32Array((w+1)*(h+1));
      ii_tilted = new Int32Array((w+1)*(h+1));
      ii_canny = new Int32Array((w+1)*(h+1));
      jsfeat.imgproc.grayscale(imageData.data, w, h, img_u8);
      console.log(classifier);
      jsfeat.imgproc.compute_integral_image(img_u8, ii_sum, ii_sqsum, classifier.tilted ? ii_tilted : null);
      jsfeat.haar.edges_density = 0.2;
      var rects = jsfeat.haar.detect_multi_scale(
        ii_sum, ii_sqsum, ii_tilted,
        options.use_canny? ii_canny : null,
        img_u8.cols,
        img_u8.rows,
        classifier,
        options.scale_factor,
        options.min_scale
      );

      // draw only most confident one
      rects = jsfeat.haar.group_rectangles(rects, 1);
      let scale = w / img_u8.cols;
      let face = getFace(calcCtx, rects, scale, 1);

      // apply filter to canvas;
      applyCanny(calcCtx, w, h, img_u8, options);
      drawFace(calcCtx, face, scale);

    });
    let stat = new profiler();
    stat.add("grayscale");
    stat.add("gauss blur");
    stat.add("canny edge");

    function applyCanny(ctx, w, h, img_u8, options){
      stat.new_frame();
      ctx.drawImage(video, 0, 0, canvasW, canvasH);
      var imageData = ctx.getImageData(0, 0, canvasW, canvasH);

      stat.start("grayscale");
      jsfeat.imgproc.grayscale(imageData.data, canvasW, canvasH, img_u8);
      stat.stop("grayscale");

      var r = options.blur_radius|0;
      var kernel_size = (r+1) << 1;

      stat.start("gauss blur");
      jsfeat.imgproc.gaussian_blur(img_u8, img_u8, kernel_size, 0);
      stat.stop("gauss blur");

      stat.start("canny edge");
      jsfeat.imgproc.canny(img_u8, img_u8, options.low_threshold|0, options.high_threshold|0);
      stat.stop("canny edge");

      // render result back to canvas
      var data_u32 = new Uint32Array(imageData.data.buffer);
      var alpha = (0xff << 24);
      var i = img_u8.cols*img_u8.rows, pix = 0;
      while(--i >= 0) {
          pix = img_u8.data[i];
          data_u32[i] = alpha | (pix << 16) | (pix << 8) | pix;
      }

      ctx.putImageData(imageData, 0, 0);
      console.log(img_u8);
    }

    function getFace(ctx, rects, sc, max) {
      var on = rects.length;
      if(on && max) {
        jsfeat.math.qsort(rects, 0, on-1, function(a,b){
          return (b.confidence<a.confidence);
        });
      }
      var n = max || on;
      n = Math.min(n, on);
      var r;
      for(var i = 0; i < n; ++i) {
          r = rects[i];

      }
      return r;
    }

    function drawFace(ctx, r, sc){
      ctx.strokeStyle="red";
      ctx.strokeRect((r.x*sc)|0,(r.y*sc)|0,(r.width*sc)|0,(r.height*sc)|0);
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
