# Tailor Swift

[Tailor Swift]: https://www.tailor-swift.com

## Overview

Fitting clothes is hard. Measuring yourself is awkward. Tailor Tailor aims to change that! Using image processing software, this web-app will generate basic clothing measurements from user-submitted photos. It will then display a scaled sewing pattern using these measurements. As a proof of concept, we will create a shirt model, using the measurements of wingspan and torso dimensions.

Applications of this tool include DIY fashion as well as integration with a clothing manufacturer for custom fitted clothes.

## Technologies

Tailor Swift is mainly a front end application built with React.js and a Redux framework. The [jsfeat]: https://inspirit.github.io library was used to handle the image processing needs.  jsfeat allows for quick implementation of HAAR cascade classifiers, which uses machine learning to detect objects (in this case faces).  jsfeat also offers image filtering options which were used to detect boundaries and calculate body proportions.   

##  Image processing

One of the greatest hurdles in creating Tailor Swift finding a way to detecting and defining shapes.  This was able to be accomplished by combining object recognition libraries, webcam video and image filtering all to a HTML canvas and apply our algorithm there.

```
let calcCanvas = document.getElementById('calcCanvas');
let calcCtx = calcCanvas.getContext('2d');
calcCtx.drawImage(video, 0, 0, video.width, video.height);
let faceBox = detectFace(calcCtx, options);
let cannyData = applyCanny(calcCtx, options, this.state.stat);

```

## Body detection




## Future Directions
- Adding other templates like jackets and hoodies.
- Allowing users to sign in, save their profiles, and access all new  templates.
- Improving algorithms for improved fit.

## Contact us

Thanks for viewing our repo.  If you have any questions or would like to contribute, please feel free to contact us at admin@tailor-swift.com.
