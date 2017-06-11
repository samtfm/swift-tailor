import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import { detectFace, drawFace } from '../util/body_detection';

import profiler from '../util/profiler';
import CalcIndicator from '../widget/calc_indicators';
import { stdDev, average, inStdDev } from '../util/math';
import { applyCanny } from '../util/image_filter';
import { startInstructions, videoInstructions } from '../util/instructions';
import { detectOutlinePoints, detectSide, measureShoulders } from '../util/body_detection';
import Shirt from './shirt';

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
      instructionsStarted: false,
      showButtons: false,
      showVideoControls: false,
      measurements: {},
      heightFeet: "",
      heightInches: "",
      totalHeight: null,
      wingspan: [],
      neckWidth: [],
      chestWidth: [],
      waistWidth: [],
      shoulderWidth: [],
      bustWidth: [],
      stomachWidth: []
    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.createVideo = this.createVideo.bind(this);
    this.updateFeet = this.updateFeet.bind(this);
    this.updateInches = this.updateInches.bind(this);
    this.snapPicture = this.snapPicture.bind(this);
    this.loadDirections = this.loadDirections.bind(this);
    this.loadImageDirections = this.loadImageDirections.bind(this);
    this.refineMeasurements = this.refineMeasurements.bind(this);
  }

  componentWillMount(){
    Modal.setAppElement('body');
  }
  updateFeet(e){
    let inches = parseInt(this.state.heightInches);
    let feet = parseInt(e.currentTarget.value);
    this.setState({
      heightFeet: typeof feet === "number" ? feet : "",
      totalHeight: typeof feet === "number" ? (feet * 12) + inches : inches
    });
  }
  updateInches(e){
    let feet = parseInt(this.state.heightFeet) || 0;
    let inches = parseInt(e.currentTarget.value);
    inches = typeof inches === "number" ? inches : 0;
    let newFeet = Math.floor(inches/12);

    this.setState({
      heightInches: inches,
      heightFeet: feet + newFeet,
      totalHeight: (feet * 12) + inches
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
    calcCtx.drawImage(video, 0, 0, video.width, video.height);

    // detectFace detects a face then returns the box region and scale;
    // applyCanny applies canny to the canvas, duh...
    // drawFace draws the faceBox on the canvas after canny has been applied;
    let faceBox = detectFace(calcCtx, options);

    // let handBox = detectHand(calcCtx, options);
    // drawHand(calcCtx, handBox.hand, handBox.scale);
    let cannyData = applyCanny(calcCtx, options, this.state.stat);
    let measurements;
    let side;
    //BREAKS UP DEFINING POINTS INTO SECTIONS
    if(!window.armsUp){
      measurements = detectOutlinePoints(cannyData, faceBox.face);
    } else if (window.armsUp && !window.armsDown){
      measurements = measureShoulders(cannyData, faceBox.face, this.state.measurements.arm);
      //TODO do shoulder meaturements
      //measuremsnets = somethingelse
      //Tony is skipping this part for now
      // window.armsDown = true;

    } else if (window.armsUp && window.armsDown && !window.side){
      measurements = detectSide(cannyData, faceBox.face, this.state.measurements.arm);
    } else {
      console.log("CLOSING SNAP");
      console.log(this.state.measurements);
      clearInterval(this.measuringInterval);
      return;
    }
    // let sideMeasurements = detectOutlinePoints(cannyData, faceBox.face);
    if (this.state.measurements.arm || measurements.arms.wingspan) {
      this.refineMeasurements(measurements);
    }
    try{
      drawFace(calcCtx, faceBox.face, faceBox.scale);
    } catch(err){
      console.log("couldn't find a face");
    }
    calcCtx.fillStyle = measurements.isValid ? '#0F0' : '#F00';
    for (let part in measurements) {
      if (measurements[part].points) {
        measurements[part].points.forEach(point => {
          calcCtx.fillRect(point.x,point.y, 4, 4);
        });
      }
    }
  }

  refineMeasurements(measurements){

    let {
      wingspan, neckWidth,
      chestWidth, waistWidth,
      shoulderWidth,
      bustWidth, stomachWidth
    } = this.state;

    if(!window.armsUp){
      if(wingspan.length < 10){
        wingspan.push(Math.floor(measurements.arms.wingspan)  || 0);
        neckWidth.push(Math.floor(measurements.neck.average) || 0);
        chestWidth.push(Math.floor(measurements.chest.average) || 0);
        waistWidth.push(Math.floor(measurements.waist.average) || 0);
        this.setState({
          wingspan,
          neckWidth,
          chestWidth,
          waistWidth
        });
      } else {
        wingspan = inStdDev(wingspan);
        neckWidth = inStdDev(neckWidth);
        chestWidth = inStdDev(chestWidth);
        waistWidth = inStdDev(waistWidth);
        this.setState({
          measurements: {
            arm: Math.floor(average(wingspan)),
            neck: Math.floor(average(neckWidth)),
            chest: Math.floor(average(chestWidth)),
            waist: Math.floor(average(waistWidth))
          }
        });
        window.armsUp = true;
        // if (this.measuringInterval) clearInterval(this.measuringInterval);
      }
    } else if (window.armsUp && !window.armsDown){
      console.log("IN THE ARMS DOWN AREA");
    } else if (window.armsUp && window.armsDown && !window.side) {
      console.log("IN THE SIDE AREA");
      console.log(window.side);
      if(stomachWidth.length < 10){
        bustWidth.push(Math.floor(measurements.bust.average) || 0);
        stomachWidth.push(Math.floor(measurements.stomach.average) || 0);
        this.setState({
          bustWidth,
          stomachWidth
        });
      } else {
        bustWidth = inStdDev(bustWidth);
        stomachWidth = inStdDev(stomachWidth);
        console.log(measurements);
        measurements = Object.assign(
          this.state.measurements,
          { bust: Math.floor(average(bustWidth)) },
          { stomach: Math.floor(average(stomachWidth)) }
        );
        console.log(measurements);
        this.setState({ measurements });

        window.side = true;
    }
        // if (this.measuringInterval) clearInterval(this.measuringInterval);
    }
  }

  openModal() {
    this.setState({
      modalIsOpen: true,
      instructionsStarted: true
    });
    this.loadImageDirections();
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
      showButtons: false,
      showVideoControls: false
    });
    if (this.measuringInterval) clearInterval(this.measuringInterval);
    if (this.instructionsInterval) clearInterval(this.instructionsInterval);
    if (this.measurementInstructionInterval ) clearInterval(this.measurementInstructionInterval );
  }

  startMeasuring(){
    this.createVideo();
    this.loadDirections();
    this.measuringInterval = setInterval(()=>{
      this.snapPicture();
    },30);

    this.setState({
      showButtons: false,
      showVideoControls: true
    });
  }
  loadImageDirections(){
    let instructions = startInstructions;

    setTimeout(() => {
      this.message = document.getElementById("instructions");
      this.message.innerHTML = instructions[0][0];
      let i = 1;
      this.instructionsInterval = setInterval(()=>{
        if(i >= instructions.length) {
          clearInterval(this.instructionsInterval);
        } else{
          this.message.innerHTML = instructions[i][0];
          i++;
        }
      }, 500);
    }, 500);

    let lastMessageTime = instructions.length * 500;
    this.instructionsStopTimeout = setTimeout(() => {
      this.setState({
        instructionsStarted: false,
        showButtons: true
      });
    }, lastMessageTime + 500);
  }

  loadDirections(){
    console.log("DIRECTIONS LOADED");
    let instructions = videoInstructions;
    this.message.classList.add("shadow");
    this.message.classList.add("spinner");
    let i = 0;

    let messageLoop = (param) => {
      this.message.innerHTML = instructions[i];
      setTimeout(() => {
        if(param){
          this.message.innerHTML = "Great!";
          return i++;
        }
      }, 500);
    };

    this.message.innerHTML = instructions[i];
    this.measurementInstructionInterval = setInterval(() => {
      if(i >= instructions.length){
        this.message.innerHTML = "All Done Good Job Buddy!";
        clearInterval(this.measurementInstructionInterval);
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
    }, 1000);
  }


  render(){
    // load initial message, modal declaraction
    // is delayed so setState can catchup
    let modal, modalButtonSection, videoControls,
        repeatButton, beginButton, skipButton;

    let instructions = startInstructions;

    skipButton = (
      <button
        className={this.state.instructionsStarted ? "modal-button" : "hidden"}
        onClick={() => {
          this.setState({
            instructionsStarted: false,
            showButtons: true
          });
          clearInterval(this.instructionsInterval);
          window.clearTimeout(this.instructionsStopTimeout);
          this.message.innerHTML = "Ready!";
        }}>
        Skip
      </button>
    );

    repeatButton = (
      <button
        className={this.state.showButtons ?  "modal-button" : "hidden"}
        onClick={() => {
          this.loadImageDirections();
          this.setState({
            instructionsStarted:true,
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
          side={"Arms Up"}
          measurements = {[
            this.state.wingspan,
            this.state.neckWidth,
            this.state.chestWidth,
            this.state.waistWidth
          ]}
        />
        <CalcIndicator
          side={"Arms Down"}
          measurements = {[
            this.state.shoulderWidth
          ]}
        />
        <CalcIndicator
          side={"Side"}
          measurements = {[
            this.state.bustWidth,
            this.state.stomachWidth
          ]}
        />
      </section>
    );

    let width = 0, height = 0;
    height = window.innerHeight * 1/3;
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




          <h1 id="instructions" className="instructions"></h1>
          <section>
            <section className="modal-close">
              <button
                onClick={this.closeModal}>X
              </button>
            </section>
            <section className="video-container">
              <video id="video" width={width} height={height} autoPlay></video>
              <canvas id="calcCanvas" width={width} height={height}></canvas>
            </section>
            { videoControls }
            <section className="modal-button-section">
              { skipButton }
              { repeatButton }
              { beginButton }
            </section>
          </section>

        </Modal>

        <section className="enter-height-section">
          <h2>(Step 1)   Enter your height</h2>
          <section>
            <input
              type="text"
              value={this.state.heightFeet}
              onChange={this.updateFeet}>
            </input>
            <label>Ft </label>
            <input
              type="text"
              value={this.state.heightInches}
              onChange={this.updateInches}>
            </input>
            <label>inches</label>
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
