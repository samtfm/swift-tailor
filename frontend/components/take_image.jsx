import React from 'react';
import Modal from 'react-modal';
import { detectFace, detectHand, drawFace, drawHand} from '../util/body_detection';

import profiler from '../util/profiler';
import CalcIndicator from '../widget/calc_indicators';
import { applyCanny } from '../util/image_filter';
import { startInstructions } from '../util/instructions';
import { detectOutlinePoints } from '../util/body_detection';

// import { test } from './canny/test';
export default class TakeImage extends React.Component {
  constructor(props){
    super(props);

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
    this.loadInstructions = this.loadInstructions.bind(this);
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

  loadInstructions(){
    // load initial message, modal declaraction
    // is delayed so setState can catchup
    let modal, message, modalButtonSection, repeatButton, beginButton, skipButton;
    let instructions = startInstructions;
    setTimeout(() => {
      modal = document.getElementsByClassName("modal")[0];
      modalButtonSection = document.getElementsByClassName("modal-button-section")[0];
      message = document.createElement("h1");
      repeatButton = document.createElement("button");
      beginButton = document.createElement("button");
      skipButton = document.createElement("button");
      repeatButton.innerHTML = "Repeat instructions";
      skipButton.innerHTML = "Skip";
      beginButton.innerHTML = "Begin";
      repeatButton.className = "modal-button hidden";
      beginButton.className = "modal-button hidden";
      skipButton.className = "modal-button";
      message.className = "instructions";
      modal.appendChild(message);
      modalButtonSection.appendChild(repeatButton);
      modalButtonSection.appendChild(beginButton);
      modalButtonSection.appendChild(skipButton);
    }, 500);

    instructions.forEach( instruct => {
      setTimeout(() => {
        message.innerHTML = instruct[0];
      }, instruct[1]);
    });
    //start instructions end at 17000

    setTimeout(() => {
      skipButton.classList.add("hidden");
      repeatButton.classList.remove("hidden");
      beginButton.classList.remove("hidden");
    }, 19000);




    // this.createVideo();
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
      } catch(err){
        console.log("couldn't find a face");
      }
      let points = detectOutlinePoints(cannyData);
      calcCtx.fillStyle = '#0F0';
      points.forEach(point => {
        calcCtx.fillRect(point[0],point[1], 2, 2);
      });
    }, delay);};
  }
  openModal() {
    this.setState({ modalIsOpen: true});
    this.loadInstructions();
  }

  afterOpenModal() {}

  closeModal() {
    if(window.localStream > 0){
      window.localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
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

          <button
            className="modal-close-button"
            onClick={this.closeModal}>x
          </button>
          <video id="video" width="480" height="360" autoPlay></video>
          <section className="video-controls">
            <button
              id="snap"
              onClick={this.snapPicture(0)}>Snap Photo
            </button>
            <button
              id="snap"
              onClick={this.snapPicture(2000)}>Snap Delay Photo
            </button>
            <CalcIndicator
              side={"front"}
              measurements = {['1', '2', '3']}
            />
          </section>
          <section className="modal-button-section"></section>
        </Modal>

        <section className="take-image-section">
          <h2>(Step 1)   Lets take some pitures.</h2>
          <h2>(Your pictures are never shared or saved)</h2>
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
      </section>
    );
  }
}
