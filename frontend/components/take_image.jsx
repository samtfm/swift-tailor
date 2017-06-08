import React from 'react';
import Modal from 'react-modal';
import { detectFace, detectHand, drawFace, drawHand} from '../util/body_detection';

import { applyCanny } from '../util/image_filter';
import profiler from '../util/profiler';
import { detectOutlinePoints } from '../util/body_detection';
import Shirt from './shirt';
// import { test } from './canny/test';
export default class TakeImage extends React.Component {
  constructor(props){
    super(props);
    this.state = { measurements: null };
    let options = {
      blur_radius: 2,
      low_threshold: 20,
      high_threshold: 50,
    };

    let stat = new profiler();
    stat.add("grayscale");
    stat.add("gauss blur");
    stat.add("canny edge");

    this.state={
      options,
      stat,
      modalIsOpen: false,
    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.createVideo = this.createVideo.bind(this);
    this.snapPicture = this.snapPicture.bind(this);
  }

  componentWillMount(){
    Modal.setAppElement('body');
  }

  createVideo(){
    // Grab elements, create settings, etc.
    let canvas = document.getElementById('canvas-pic');
    let canvasW = canvas.width;
    let canvasH = canvas.height;
    let video;
    let context = canvas.getContext('2d');

    // Get access to the camera!
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Not adding `{ audio: true }` since we only want video now
      navigator.mediaDevices.getUserMedia({ video: true })
        .then( stream => {
          window.localStream = stream;
          video = document.getElementById('video');
          video.src = window.URL.createObjectURL(stream);
          video.play();
      });
    }

    this.setState({
      canvas,
      canvasW,
      canvasH,
      context
    });
  }

  snapPicture(delay){
    return () => { setTimeout(() =>{
      let { canvas, canvasW, canvasH, context, options, stat } = this.state;
      let video = document.getElementById('video');

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
      let cannyData = applyCanny(calcCtx, options, this.state.stat);
      try{
        drawFace(calcCtx, faceBox.face, faceBox.scale);
        console.log(faceBox);
      } catch(err){
        console.log("couldn't find a face");
      }
      let measurements = detectOutlinePoints(cannyData, faceBox.face);
      calcCtx.fillStyle = '#0F0';
      this.setState({measurements: measurements });
      for (let part in measurements) {
        if (measurements[part].points) {
          measurements[part].points.forEach(point => {
            calcCtx.fillRect(point.x,point.y, 2, 2);
          });
        }
      }
    }, delay);};
  }
  openModal() {
    this.setState({ modalIsOpen: true});
    this.createVideo();
  }

  afterOpenModal() {}

  closeModal() {
    window.localStream.getTracks().forEach((track) => {
      track.stop();
    });
    this.setState({modalIsOpen: false});
  }


  render(){
    return(
      <section>

        <Modal
          className='modal'
          overlayClassName='overlay'
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          contentLabel="CameraModal">

          <h2>Lets take a picture</h2>
          <video id="video" width="480" height="360" autoPlay></video>
          <button
            id="snap"
            onClick={this.snapPicture(0)}>Snap Photo
          </button>
          <button
            id="snap"
            onClick={this.snapPicture(2000)}>Snap Delay Photo
          </button>
          <button
            className="modal-close-button"
            onClick={this.closeModal}>x
          </button>

        </Modal>

        <section className="take-image-section">
          <h2>(Step 1)   Lets take some pitures</h2>
          <button
            className='nav-button'
            onClick={this.openModal}
            >Take a Picture
          </button>

        </section>
        <section className="calc-section">
          <h1>SECTION FOR CALCULATIONS</h1>
          <canvas id="calcCanvas" width="480" height="360"></canvas>
          <canvas id="canvas-pic" width="480" height="360"></canvas>
        </section>
        <section>
          <Shirt measurements={this.state.measurements} />
        </section>
      </section>
    );
  }
}
