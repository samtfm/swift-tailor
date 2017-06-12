# Tailor Swift

[Tailor Swift]: https://www.tailor-swift.com

## Overview

Fitting clothes is hard. Measuring yourself is awkward. Tailor Tailor aims to change that! Using image processing software, this web-app will generate basic clothing measurements from user-submitted photos. It will then display a scaled sewing pattern using these measurements. As a proof of concept, we will create a shirt model, using the measurements of wingspan and torso dimensions.

Applications of this tool include DIY fashion as well as integration with a clothing manufacturer for custom fitted clothes.

## Technologies

Tailor Swift is mainly a front end application built with React.js and a Redux framework. The [jsfeat]: https://inspirit.github.io library was used to handle the image processing needs.  jsfeat allows for quick implementation of HAAR cascade classifiers, which uses machine learning to detect objects (in this case faces).  jsfeat also offers image filtering options which were used to detect boundaries and calculate body proportions.   
