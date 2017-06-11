import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import { detectFace, detectHand, drawFace, drawHand} from '../util/body_detection';

import profiler from '../util/profiler';
import CalcIndicator from '../widget/calc_indicators';
import { stdDev, average, inStdDev } from '../util/math';
import { applyCanny } from '../util/image_filter';
import { startInstructions, videoInstructions } from '../util/instructions';
import { detectOutlinePoints } from '../util/body_detection';
import Shirt from './shirt';

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
      showVideoControls: false,
      measurements: {},
      wingspan: [],
      neckWidth: [],
      chestWidth: [],
      waistWidth: []

    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.createVideo = this.createVideo.bind(this);
    this.snapPicture = this.snapPicture.bind(this);
    this.loadDirections = this.loadDirections.bind(this);
    this.refineMeasurements = this.refineMeasurements.bind(this);
  }

  componentWillMount(){
    Modal.setAppElement('body');
  }

  componentWillUnmount(){
    window.localStream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  createVideo(){
    let video;

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
  }

  snapPicture(){
    let { options, stat } = this.state;
    let video = document.getElementById('video');
    //Copies the picture canvas translates to the calculation canvas
    let calcCanvas = document.getElementById('calcCanvas');
    let calcCtx = calcCanvas.getContext('2d');

    calcCtx.drawImage(video, 0, 0);

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
        this.refineMeasurements(measurements);
        // this.setState({measurements: measurements });
      }
      for (let part in measurements) {
        if (measurements[part].points) {
          measurements[part].points.forEach(point => {
            calcCtx.fillRect(point.x,point.y, 2, 2);
          });
        }
      }
    }

    refineMeasurements(measurements){

    let {wingspan, neckWidth, chestWidth, waistWidth } = this.state;

    if(!window.armsUp){
      console.log("arms", measurements.arms.wingspan);
      if(wingspan.length < 20){
        wingspan.push(measurements.arms.wingspan  || 0);
        neckWidth.push(measurements.neck.average || 0);
        chestWidth.push(measurements.chest.average || 0);
        waistWidth.push(measurements.waist.average || 0);
      } else {
        wingspan = inStdDev(wingspan);
        neckWidth = inStdDev(neckWidth);
        chestWidth = inStdDev(chestWidth);
        waistWidth = inStdDev(waistWidth);
        this.setState({
          measurements: {
            arm: average(wingspan),
            neck: average(neckWidth),
            chest: average(chestWidth),
            waist: average(waistWidth)
          }
        });
        window.armsUp = true;
      }
    } else if (window.armsUp){
      console.log("hi");
    }
  }

  openModal() {
    this.setState({
      modalIsOpen: true,
      instructionsStarted: true
    });
  }

  afterOpenModal() {}

  closeModal() {
    if(window.localStream){
      window.localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    this.setState({
      modalIsOpen: false,
      showVideoControls: false
    });
    if (this.measuringInterval) clearInterval(this.measuringInterval);
  }

  startMeasuring(){
    this.loadDirections();
    this.createVideo();
    this.measuringInterval = setInterval(()=>{
      this.snapPicture();
    },200);

    let message = document.getElementById("instructions");
    message.innerHTML = "";
    this.setState({
      showButtons: false,
      showVideoControls: true
    });
  }

  loadDirections(){
    console.log("DIRECTIONS LOADED");
    let message = document.getElementById('instructions');
    let instructions = videoInstructions;
    message.classList.add("shadow");
    let i = 0;
    message.innerHTML = instructions[i];

    let messageLoop = (param) => {
      message.innerHTML = instructions[i];
      setTimeout(() => {
        if(param){
          message.innerHTML = "Great!";
          return i++;
        } else {
          message.innerHTML = "Processing...";

        }
      }, 2500);
    };

    let measurementInstructionInterval = setInterval(() => {
      if(i >= instructions.length){
        message.innerHTML = "All Done Good Job Buddy!";
        clearInterval(measurementInstructionInterval);
      } else {
        switch(i) {
          //check the front
          case 0:
            messageLoop(window.armsUp, i);
            break;
          case 1:
            messageLoop(window.armsDown, i);
            break;
          case 2:
            messageLoop(window.side, i);
        }
      }
    }, 5000);
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
          message.innerHTML = "Ready!";
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
        onClick={this.startMeasuring.bind(this)}>
        Begin
      </button>
    );

    videoControls = (
      <section className={this.state.showVideoControls ? "video-controls" : "hidden"}>
        <CalcIndicator
          side={"front"}
          measurements = {[
            this.state.wingspan,
            this.state.neckWidth,
            this.state.chestWidth,
            this.state.waistWidth
          ]}
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
      instructionsStopTimeout = setTimeout(() => {
        this.setState({
          instructionsStarted: false,
          showButtons: true
        });
      }, lastMessageTime + 500);
    }

    let width = 0, height = 0;
    while (height < window.innerHeight){
      height += 120;
    }
    height -= 120;
    width = height * 4/3;
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
            onClick={this.closeModal}>X
          </button>

          <h1 id="instructions" className="instructions"></h1>

          <video id="video" width={width} height={height} autoPlay></video>

          { videoControls }
          <section className="modal-button-section">
            { skipButton }
            { repeatButton }
            { beginButton }
          </section>
        </Modal>

        <section className="enter-height-section">
          <h2>(Step 1)   Enter your height</h2>
          <section>
            <input></input><label>Ft </label>
            <input></input><label>inches</label>
          </section>
          <section>
          </section>

        </section>

        <section className="take-image-section">
          <h2>(Step 2)   Lets take some pitures.</h2>
          <button
            className='nav-button'
            onClick={this.openModal}
            >Take a Picture &nbsp;
            <i id="cameraIcon" className="fa fa-camera-retro fa-5" aria-hidden="true"></i>
          </button>
        </section>
        <section className="calc-section">
          <h1>SECTION FOR CALCULATIONS</h1>
          <canvas id="calcCanvas" width="480" height="360"></canvas>
        </section>
      </section>
    );
  }
}

// <button
//   id="snap"
//   onClick={this.snapPicture(0)}>Snap Photo
// </button>
// <button
//   id="snap"
//   onClick={this.snapPicture(2000)}>Snap Delay Photo
// </button>
