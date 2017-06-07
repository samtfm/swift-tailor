import jsfeat from 'jsfeat';
import { faceClassifier } from './face_classifier';
import { handClassifier } from './hand_classifier';

export const detectOutlinePoints = imageData => {
  const height = imageData.rows;
  const width = imageData.cols;
  const mid = Math.floor(width*.5);
  const points = [];
  for (let y = 0; y < height; y++) {

    //slice from start of collumn to end of row
    const rowStart = y*width; // calculate start of row
    const column = imageData.data.slice(rowStart, rowStart+width);
    let leftEdge = 0;
    let rightEdge = 0;

    //check right edge
    for(let x = mid; x < width; x++) { // iterate from relative mid to edge
      const value = parseInt(imageData.data[rowStart+x]); // add offset from prev rows
      if (value > 0) {
        rightEdge = x; // reasign until edge of frame
      }
    }
    //check for left edge
    for(let x = mid; x > 0; x--) {
      const value = imageData.data[rowStart+x];
      if (value > 0) {
        leftEdge = x;
      }
    }
    points.push([leftEdge, y]);
    points.push([rightEdge, y]);
  }
  return points;
};

export const detectFace = (ctx, options) => {
  // Attempt to find face;

  // iiSum         - integral of the source image
  // iiSqsm       - squared integral of the source image
  // iiTilted      - tilted integral of the source image
  // iiCanny_sum   - integral of canny source image or undefined
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
  let imgU8 = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);
  let iiSum = new Int32Array((w+1)*(h+1));
  let iiSqsm = new Int32Array((w+1)*(h+1));
  let iiTilted = new Int32Array((w+1)*(h+1));
  let iiCanny = new Int32Array((w+1)*(h+1));

  jsfeat.imgproc.grayscale(imageData.data, w, h, imgU8);
  jsfeat.imgproc.compute_integral_image(
    imgU8,
    iiSum,
    iiSqsm,
    classifier.tilted ? iiTilted : null
  );
  jsfeat.haar.edges_density = 0.2;
  var rects = jsfeat.haar.detect_multi_scale(
    iiSum, iiSqsm, iiTilted,
    options.use_canny? iiCanny : null,
    imgU8.cols,
    imgU8.rows,
    classifier,
    options.scale_factor,
    options.min_scale
  );

  // draw only most confident one
  rects = jsfeat.haar.group_rectangles(rects, 1);
  let scale = w / imgU8.cols;
  let face = getFace(ctx, rects, scale, 1);
  return {face, scale};
};

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

// export const detectHand = (ctx, options) => {
//   // Attempt to find hands;
//
//   // iiSum         - integral of the source image
//   // iiSqsm       - squared integral of the source image
//   // iiTilted      - tilted integral of the source image
//   // iiCanny_sum   - integral of canny source image or undefined
//   // width           - width of the source image
//   // height          - height of the source image
//   // classifier      - haar cascade classifier
//   // scale_factor    - how much the image size is reduced at each image scale
//   // scale_min       - start scale
//   // rects           - rectangles representing detected object
//   let w = ctx.canvas.width;
//   let h = ctx.canvas.height;
//   let classifier = handClassifier;
//   let imageData = ctx.getImageData(0, 0, w, h);
//   let imgU8 = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);
//   let iiSum = new Int32Array((w+1)*(h+1));
//   let iiSqsm = new Int32Array((w+1)*(h+1));
//   let iiTilted = new Int32Array((w+1)*(h+1));
//   let iiCanny = new Int32Array((w+1)*(h+1));
//
//   jsfeat.imgproc.grayscale(imageData.data, w, h, imgU8);
//   // console.log(classifier);
//   jsfeat.imgproc.compute_integral_image(
//     imgU8,
//     iiSum,
//     iiSqsm,
//     classifier.tilted ? iiTilted : null
//   );
//   jsfeat.haar.edges_density = 0.2;
//   var rects = jsfeat.haar.detect_multi_scale(
//     iiSum, iiSqsm, iiTilted,
//     options.use_canny? iiCanny : null,
//     imgU8.cols,
//     imgU8.rows,
//     classifier,
//     options.scale_factor,
//     options.min_scale
//   );
//
//   // draw only most confident one
//   rects = jsfeat.haar.group_rectangles(rects, 1);
//   let scale = w / imgU8.cols;
//   let hand = getHand(ctx, rects, scale, 1);
//   return {hand, scale};
// };
//
// function getHand(ctx, rects, sc, max) {
//   var on = rects.length;
//   if(on && max) {
//     jsfeat.math.qsort(rects, 0, on-1, function(a,b){
//       return (b.confidence<a.confidence);
//     });
//   }
//   var n = max || on;
//   n = Math.min(n, on);
//   var r;
//   for(var i = 0; i < n; ++i) {
//       r = rects[i];
//
//   }
//   return r;
// }
//
// export const drawHand = (ctx, r, sc) => {
//   ctx.strokeStyle="white";
//   ctx.lineWidth="10";
//   ctx.strokeRect((r.x*sc)|0,(r.y*sc)|0,(r.width*sc)|0,(r.height*sc)|0);
// };
