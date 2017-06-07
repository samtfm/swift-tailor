import jsfeat from 'jsfeat';
import profiler from './profiler';
import { faceClassifier } from './face_classifier';

export const detectOutlinePoints = imageData => {
  const rows = imageData.rows;
  const cols = imageData.cols;

  const points = [];
  for (let y = 0; y < rows; y++) {
    //slice from start of collumn to end of row
    const column = imageData.data.slice(rows*cols, rows*cols+rows);
    const mid = Math.floor(column.length/2);

    let leftEdge = 0;
    let rightEdge = 0;
    //check right edge
    for(let x = mid; x < cols; x++) {
      const value = imageData.data[x];
      if (value > 0) {
        rightEdge = x;
      }
    }
    //check for left edge
    for(let x = mid; x > 0; x--) {
      const value = imageData.data[x];
      if (value > 0) {
        leftEdge = x; // reasign until edge of frame
      }
    }
    points.push([leftEdge, y]);
    points.push([rightEdge, y]);
  }
  return points;
};

export const detectFace = (ctx, options) => {
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
  let w = ctx.canvas.width;
  let h = ctx.canvas.height;
  let classifier = faceClassifier;
  let imageData = ctx.getImageData(0, 0, w, h);
  let img_u8 = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);
  let ii_sum = new Int32Array((w+1)*(h+1));
  let ii_sqsum = new Int32Array((w+1)*(h+1));
  let ii_tilted = new Int32Array((w+1)*(h+1));
  let ii_canny = new Int32Array((w+1)*(h+1));

  jsfeat.imgproc.grayscale(imageData.data, w, h, img_u8);
  // console.log(classifier);
  jsfeat.imgproc.compute_integral_image(
    img_u8,
    ii_sum,
    ii_sqsum,
    classifier.tilted ? ii_tilted : null
  );
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
  let face = getFace(ctx, rects, scale, 1);
  return {face, scale};
  // drawFace(ctx, face, scale);
};

let stat = new profiler();
    stat.add("grayscale");
    stat.add("gauss blur");
    stat.add("canny edge");

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

export const drawFace = (ctx, r, sc) => {
  ctx.strokeStyle="white";
  ctx.lineWidth="10";
  ctx.strokeRect((r.x*sc)|0,(r.y*sc)|0,(r.width*sc)|0,(r.height*sc)|0);
};

export const applyCanny = (ctx, options) => {
  let w = ctx.canvas.width;
  let h = ctx.canvas.height;
  let img_u8 = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);

  stat.new_frame();
  // ctx.drawImage(video, 0, 0, canvasW, canvasH);
  var imageData = ctx.getImageData(0, 0, w, h);

  stat.start("grayscale");
  jsfeat.imgproc.grayscale(imageData.data, w, h, img_u8);
  stat.stop("grayscale");

  var r = options.blur_radius|0;
  var kernel_size = (r+1) << 1;

  stat.start("gauss blur");
  jsfeat.imgproc.gaussian_blur(img_u8, img_u8, kernel_size, 0);
  stat.stop("gauss blur");

  stat.start("canny edge");
  jsfeat.imgproc.canny(
    img_u8,
    img_u8,
    options.low_threshold|0,
    options.high_threshold|0
  );
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
};
