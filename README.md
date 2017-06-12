# Tailor Swift

[Live Site](https://www.tailor-swift.com)

## Overview

Fitting clothes is hard. Measuring yourself is awkward. Tailor Tailor aims to change that! Using image processing software, this web-app will generate basic clothing measurements from live webcam input. It will then display a scaled sewing pattern using these measurements. As a proof of concept, we will create a shirt model, using the measurements of the neck, chest, and waist, using wingspan as a scale reference.

Applications of this tool include DIY fashion as well as integration with a clothing manufacturer for custom fitted clothes.

## Technologies

Tailor Swift is mainly a front end application built with React.js and a Redux framework. The [jsfeat](https://inspirit.github.io) library was used to handle the image processing needs.  jsfeat allows for quick implementation of HAAR cascade classifiers, which uses machine learning to detect objects (in this case faces).  jsfeat also offers image filtering options which were used to detect boundaries and calculate body proportions.   

##  Image processing

One of the greatest hurdles in creating Tailor Swift finding a way to detecting and defining shapes.  This was able to be accomplished by combining object recognition libraries, webcam video and image filtering all to a HTML canvas and apply our algorithm there.

```js
let calcCanvas = document.getElementById('calcCanvas');
let calcCtx = calcCanvas.getContext('2d');
calcCtx.drawImage(video, 0, 0, video.width, video.height);
let faceBox = detectFace(calcCtx, options);
let cannyData = applyCanny(calcCtx, options, this.state.stat);

```

## Body detection

The body detection algorithm builds utilizes the canny edges data combined with some heuristics to trace segments of the body outline. Using the face as a starting point, we are able to make a rough estimate of where to start. From there we can trace lines likely to be appropriate outlines.
The traceLineDown function works as follows:
  - scan horizontally within a tolerance range
  - if an edge is found, store it's coordinates, and use the found X value to center the next scan
  - if there isn't an edge within the tolerance, increase the tolerance and try again
  - if the tolerance maxes out, give up and move on to the next row


```js
const traceLineDown = (cannyData, startPos, endPos, direction) => {
  direction = direction || 1;
  const height = cannyData.rows;
  const width = cannyData.cols;
  const points = [];
  const MIN_TOLERANCE = 3;
  const MAX_TOLERANCE = 10;
  let tolerance = MIN_TOLERANCE;

  let prevEdge = startPos.x;
  for (let y = startPos.y; y < endPos.y; y++) {

    // cannyData is stored as a 1D array. multiplying y by the width
    // gives us the start index of a given "row" in this array
    const rowStart = y*width;

    let edge;
    // scan for an edge
    for (let offset = -tolerance; offset < tolerance; offset++){
      let x = prevEdge + offset*direction;
      const value = parseInt(cannyData.data[rowStart+x]); // add offset from prev rows
      if (value > 0) { // found a canny edge!
        edge = x;
        break;
      }
    }
    if (edge){
      //f save edge to points, reset tolerance and move to next row.
      points.push({x: edge, y});
      tolerance =  MIN_TOLERANCE;
      prevEdge = edge + Math.floor((edge-prevEdge)/2);
    } else if (tolerance < MAX_TOLERANCE) {
      // try iteration again with a higher tolerance
      tolerance = Math.ceil(tolerance*1.5);
      if (tolerance > MAX_TOLERANCE) tolerance = MAX_TOLERANCE;
      y--; // bit of hack to hold for loop on the same iteration
    } else {
      // no edge found within tolerance.
      // reset tolerance and move on to next row.
      tolerance = MIN_TOLERANCE;
    }
  }
  return points;
};

```



## Future Directions
- Adding other templates like jackets and hoodies.
- Allowing users to sign in, save their profiles, and access all new  templates.
- Improving algorithms for improved fit.

## Contact us

Thanks for viewing our repo.  If you have any questions or would like to contribute, please feel free to contact us at admin@tailor-swift.com.
