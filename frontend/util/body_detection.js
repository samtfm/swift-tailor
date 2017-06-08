import jsfeat from 'jsfeat';
import { faceClassifier } from './face_classifier';
import { handClassifier } from './upperbody';

export const detectOutlinePoints = (imageData, face) => {
  console.log(face);
  const height = imageData.rows;
  face = face || {x: Math.floor(imageData.cols/2), y: 0, width: 100 };
  const y = Math.floor(face.y + face.width/2);
  const leftPoints = traceLineDown(
    imageData,
    {
      startPos: { x: Math.floor(face.x), y: y},
      endPos: {x: Math.floor(face.x), y: y+face.width },
      direction: -1
    });
  const rightPoints = traceLineDown(
    imageData,
    {
      startPos: { x: Math.floor(face.x+face.width), y },
      endPos: {x: Math.floor(face.x+face.width), y: y+face.width },
      direction: 1
    });

  return measureWingspan(imageData, face);
  return leftPoints.concat(rightPoints);
};

const detectRegion = (imageData, box) => {
  // const height = imageData.rows;
  const y = Math.floor(box.y);
  const x = Math.floor(box.x);
  const width = Math.floor(box.width);
  const height = Math.floor(box.height);
  const leftPoints = traceLineDown(
    imageData,
    {
      startPos: { x: x, y: y},
      endPos: {x: x, y: y + height },
      direction: -1
    });
  const rightPoints = traceLineDown(
    imageData,
    {
      startPos: { x: x + width, y },
      endPos: {x: x + width, y: y + height},
      direction: 1
    });
  return {
    points: leftPoints.concat(rightPoints),
    mininum: 6
  };
};

const traceLineDown = (imageData, {startPos, endPos, direction}) => {
  console.log(startPos);
  direction = direction || 1;
  const height = imageData.rows;
  const width = imageData.cols;
  const points = [];
  let tolerance = 5;

  let prevEdge = startPos.x;
  for (let y = startPos.y; y < endPos.y; y++) {

    //slice from start of collumn to end of row
    const rowStart = y*width; // calculate start of row
    let edge;
    //check right edge
    // console.log(prevEdge, tolerance, direction);
    for (let offset = -tolerance; offset < tolerance; offset++){
      let x = prevEdge + offset*direction;
      const value = parseInt(imageData.data[rowStart+x]); // add offset from prev rows
      if (value > 0) {
        edge = x; // reasign until edge of frame
      }
    }
    if (edge){
      points.push([edge, y]);
      tolerance = 5;
      prevEdge = edge + Math.floor((edge-prevEdge)/2);
    } else {
      if (tolerance < 50) {
        // try iteration again with a higher tolerance
        tolerance = Math.ceil(tolerance*1.5);
        y--;
      } else {
        //move on to next row.
        edge = startPos.x;
        tolerance = 50;
      }
    }
  }
  return points;
};

const measureWingspan = (imageData, face) => {
  const height = imageData.rows;
  const width = imageData.cols;
  const mid = Math.floor(face.x+face.width*.5);
  const points = [];
  let tolerance = 5;
  let prevEdge = Math.floor(face.y+face.width);
  for (let x = Math.floor(mid+face.width); x < width; x++ ){

    let edge;
    for (let offset = -tolerance; offset < tolerance; offset++){
      const y = prevEdge + offset;
      const value = parseInt(imageData.data[y*width+x]); // add offset from prev rows
      if (value > 0) {
        edge = y;
        break; // return at first value
      }
    }
    if (edge){
      tolerance = 5;
      points.push([x,edge]);
      prevEdge = edge + Math.floor((edge-prevEdge)/2); //predict trend
    } else {
      if (tolerance < 40) {
        // try iteration again with a higher tolerance
        tolerance = Math.ceil(tolerance*1.5);
        x--;
      } else if (x - mid > face.width*2.5) {
        // return (x - mid) * 2;
        console.log((x - mid) * 2);
        return points;
      } else {
        //move on to next collumn.
        edge = Math.floor(face.y+face.width*1.5);
        tolerance = 50;
      }
    }
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
  ctx.lineWidth="2";
  return ctx.strokeRect((r.x*sc)|0,(r.y*sc)|0,(r.width*sc)|0,(r.height*sc)|0);
};

export const detectHand = (ctx, options) => {
  // Attempt to find hands;

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
  let classifier = handClassifier;
  let imageData = ctx.getImageData(0, 0, w, h);
  let imgU8 = new jsfeat.matrix_t(w, h, jsfeat.U8_t | jsfeat.C1_t);
  let iiSum = new Int32Array((w+1)*(h+1));
  let iiSqsm = new Int32Array((w+1)*(h+1));
  let iiTilted = new Int32Array((w+1)*(h+1));
  let iiCanny = new Int32Array((w+1)*(h+1));

  jsfeat.imgproc.grayscale(imageData.data, w, h, imgU8);
  // console.log(classifier);
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
  let hand = getHand(ctx, rects, scale, 1);
  return {hand, scale};
};

function getHand(ctx, rects, sc, max) {
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

export const drawHand = (ctx, r, sc) => {
  ctx.strokeStyle="white";
  ctx.lineWidth="10";
  ctx.strokeRect((r.x*sc)|0,(r.y*sc)|0,(r.width*sc)|0,(r.height*sc)|0);
};
