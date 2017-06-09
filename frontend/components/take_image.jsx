import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import { detectFace, detectHand, drawFace, drawHand} from '../util/body_detection';

import profiler from '../util/profiler';
import CalcIndicator from '../widget/calc_indicators';
import { applyCanny } from '../util/image_filter';
import { startInstructions } from '../util/instructions';
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
      instructionsStarted: false,
      showButtons: false,
      showVideoControls: false
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

  componentDidMount(){
    this.createVideo();
    setInterval(()=>{
      this.snapPicture(0)();
    },40);
  }
  componentWillUnmount(){
    window.localStream.getTracks().forEach((track) => {
      track.stop();
    });
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
      } catch(err){
        console.log("couldn't find a face");
      }
      let measurements = detectOutlinePoints(cannyData, faceBox.face);
      calcCtx.fillStyle = '#0F0';
      if (measurements.arms.wingspan) {
        this.setState({measurements: measurements });
      }
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
    this.setState({
      modalIsOpen: true,
      instructionsStarted: true
    });
  }

  afterOpenModal() {}

  closeModal() {
    if(window.localStream > 0){
      window.localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    this.setState({
      modalIsOpen: false,
      showVideoControls: false
    });
  }


  render(){
    // load initial message, modal declaraction
    // is delayed so setState can catchup
    let modal, message, modalButtonSection, videoControls,
        repeatButton, beginButton, skipButton;
    let instructions = startInstructions;
    let instructionsInterval;
    let instructionsStopTimeout;

    message = document.getElementById("instructions");

    skipButton = (
      <button
        className={this.state.instructionsStarted ? "modal-button" : "hidden"}
        onClick={() => {
          this.setState({
            instructionsStarted: false,
            showButtons: true
          });
          clearInterval(instructionsInterval);
          window.clearTimeout(instructionsStopTimeout);
          message.innerHTML = "";
        }}>
        Skip
      </button>
    );

    repeatButton = (
      <button
        className={this.state.showButtons ?  "modal-button" : "hidden"}
        onClick={() => {
          this.setState({
            instructionsStarted: true,
            showButtons: false
          });
        }}>
        Repeat Instructions
      </button>
    );

    beginButton = (
      <button
        className={this.state.showButtons ? "modal-button" : "hidden"}
        onClick={()=>{
          this.createVideo();
          message.innerHTML = "";
          this.setState({
            showButtons: false,
            showVideoControls: true
          });
        }}>
        Begin
      </button>
    );

    videoControls = (
      <section className={this.state.showVideoControls ? "video-controls" : "hidden"}>
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
    );



    if(this.state.instructionsStarted){

      setTimeout(() => {
        message = document.getElementById("instructions");
        message.innerHTML = instructions[0][0];
        let i = 1;
        instructionsInterval = setInterval(()=>{
          if(i >= instructions.length) {
            clearInterval(instructionsInterval);
          } else{
            message.innerHTML = instructions[i][0];
            i++;
          }
        }, 500);
      }, 500);
      //start instructions end at 17000

      let lastMessageTime = instructions.length * 500;
      let instructionStopTimeout = setTimeout(() => {
        this.setState({
          instructionsStarted: false,
          showButtons: true
        });
      }, lastMessageTime + 500);
    }

    // this.createVideo();

    return(
      <section>
        <video id="video" width="480" height="360" autoPlay></video>

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

          <h1 id="instructions" className="instructions"></h1>

          <video id="video" width="480" height="360" autoPlay></video>

          { videoControls }
          <section className="modal-button-section">
            { skipButton }
            { repeatButton }
            { beginButton }
          </section>
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
        <section>
          <Shirt measurements={this.state.measurements} />
        </section>
      </section>
    );
  }
}
