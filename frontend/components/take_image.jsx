import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import { detectFace, drawFace } from '../util/body_detection';
import TemplateEditor from './template_editor';
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
    //play with these numbers for better results;
    let options = {
      blur_radius: 4,
      low_threshold: 20,
      high_threshold: 90,
    };

    let stat = new profiler();
    stat.add("grayscale");
    stat.add("gauss blur");
    stat.add("canny edge");

    this.state={
      options,
      stat,
      modalIsOpen: false,
      instructionsStarted: true,
      showButtons: true,
      showVideoControls: false,
      measurements: {},
      heightFeet: 5,
      heightInches: 8,
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
    this.measuringInterval = this.measuringInterval.bind(this);
  }

  componentWillMount(){
    Modal.setAppElement('body');
  }
  updateFeet(e){
    let feet = e.currentTarget.value;

    if (isNaN(feet) || feet === "") {
      this.setState({
        heightFeet: "",
      });
    } else {
      feet = parseInt(feet);
      let inches = parseInt(this.state.heightInches);
      this.setState({
        heightFeet: feet,
        totalHeight: (feet * 12) + inches
      });
    }
  }
  updateInches(e){
    let feet = parseInt(this.state.heightFeet) || 0;
    let inches = e.currentTarget.value;
    if (isNaN(inches) || inches === "") {
      this.setState({
        heightInches: "",
      });
    } else {
      inches = parseInt(inches);
      this.setState({
        heightInches: inches,
        totalHeight: (feet * 12) + inches
      });
    }
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
      measurements = measureShoulders(cannyData, faceBox.face, this.state.measurements.wingspan);
      //TODO do shoulder meaturements
      //measuremsnets = somethingelse
      //Tony is skipping this part for now
      // window.armsDown = true;

    } else if (window.armsUp && window.armsDown && !window.side){
      measurements = detectSide(cannyData, faceBox.face, this.state.measurements.wingspan);
    } else {
      clearInterval(this.measuringIntervalInstance);
      return;
    }
    // let sideMeasurements = detectOutlinePoints(cannyData, faceBox.face);
    calcCtx.fillStyle = '#0F0';
    if (this.state.measurements.wingspan || measurements.arms.wingspan) {
      this.refineMeasurements(measurements);
    }
    try{
      drawFace(calcCtx, faceBox.face, faceBox.scale);
    } catch(err){
      // console.log("couldn't find a face");
    }
    calcCtx.fillStyle = measurements.isValid ? '#0F0' : '#F00';
    for (let part in measurements) {
      if (measurements[part].points) {
        measurements[part].points.forEach(point => {
          calcCtx.fillRect(point.x-1,point.y-1, 2, 2);
        });
      }
    }
  }

  refineMeasurements(measurements){

    let {
      wingspan, neckWidth,
      chestWidth, waistWidth,
      shoulderWidth,
      bustWidth, stomachWidth,
    } = this.state;

    if(!window.armsUp && measurements.isValid){
      if(Math.min(wingspan.length, neckWidth.length, chestWidth.length, waistWidth.length) < 20) {
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
        console.log('HEYYYYYY');
        this.setState({
          measurements: {
            wingspan: average(wingspan),
            height: average(wingspan)*.98,
            neckWidth: average(neckWidth),
            chestWidth: average(chestWidth),
            waistWidth: average(waistWidth)
          }
        });
        window.armsUp = true;
        //pause for
        clearInterval(this.measuringIntervalInstance);
        this.measuringInterval();
      }
    } else if (window.armsUp && !window.armsDown){
      if(Math.min(shoulderWidth.length) < 20  && measurements.isValid){
        if(measurements.shoulders.average) shoulderWidth.push(Math.floor(measurements.shoulders.average) || 0);
        this.setState({ shoulderWidth });
      } else {
        shoulderWidth = inStdDev(shoulderWidth);
        measurements = Object.assign(
          this.state.measurements,
          { shoulders: Math.floor(average(shoulderWidth)) }
        );
        window.armsDown = true;
        this.setState({ measurements });

        clearInterval(this.measuringIntervalInstance);
        this.measuringInterval();
      }
    } else if (window.armsUp && window.armsDown && !window.side) {

      if(Math.min(bustWidth.length, stomachWidth.length) < 40){
        if(measurements.bustWidth.average) bustWidth.push(Math.floor(measurements.bustWidth.average) || 0);
        if(measurements.stomachWidth.average) stomachWidth.push(Math.floor(measurements.stomachWidth.average) || 0);
        this.setState({
          bustWidth,
          stomachWidth
        });
      } else {
        bustWidth = inStdDev(bustWidth);
        stomachWidth = inStdDev(stomachWidth);
        measurements = Object.assign(
          this.state.measurements,
          { bustWidth: Math.floor(average(bustWidth)) },
          { stomachWidth: Math.floor(average(stomachWidth)) }
        );
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
      showButtons: true,
      showVideoControls: false
    });

    //Allow user to edit measurements!
    //this stops measured stuff from being passed again on new renders
    this.setState({ measurements: {} });

    if (this.measuringInterval) clearInterval(this.measuringInterval);
    if (this.instructionsInterval) clearInterval(this.instructionsInterval);
    if (this.measurementInstructionInterval ) clearInterval(this.measurementInstructionInterval );
  }

  startMeasuring(){
    this.createVideo();
    this.loadDirections();
    this.measuringInterval();

    this.setState({
      showButtons: false,
      showVideoControls: true
    });
  }

  measuringInterval(){
    setTimeout(() => {
      this.measuringIntervalInstance = setInterval(()=>{
        this.snapPicture();
      },100);
    }, 4000);
  }

  loadImageDirections(){
    let instructions = startInstructions;

    setTimeout(() => {
      this.message = document.getElementById("instructions");
      this.message.innerHTML = "Stand in front of your webcam with enough space to see your full upper body with arms outstreched. <br> For best results, avoid loose fitting clothing and messy backgrounds."// instructions[0][0];
      let i = 1;
      // this.instructionsInterval = setInterval(()=>{
      //   if(i >= instructions.length) {
      //     clearInterval(this.instructionsInterval);
      //   } else{
      //     this.message.innerHTML = instructions[i][0];
      //     i++;
      //   }
      // }, 3000);
    }, 200);

    let lastMessageTime = instructions.length * 3000;
    // this.instructionsStopTimeout = setTimeout(() => {
    //   this.setState({
    //     instructionsStarted: false,
    //     showButtons: true
    //   });
    // }, lastMessageTime + 500);
  }

  loadDirections(){
    //instructions to change positions
    let instructions = videoInstructions;
    this.demo = document.getElementById("demo-image");
    this.demo.classList.remove("hidden");
    this.demo.classList.add("inst1");

    this.message.classList.add("shadow");
    this.message.classList.add("spinner");
    let i = 0;

    let messageLoop = (param) => {
      let curr = 'inst' + (i+1);
      let next = 'inst' + (i+2);
      this.message.innerHTML = instructions[i];
      if(param){
        this.message.innerHTML = "Great!";
        this.demo.classList.remove(curr);
        this.demo.classList.add(next);
        return i++;
      }
    };

    this.message.innerHTML = instructions[i];
    this.measurementInstructionInterval = setInterval(() => {
      if(i >= instructions.length){
        this.message.innerHTML = "All Done Good Job!";
        this.message.classList.remove("spinner");
        clearInterval(this.measurementInstructionInterval);
        let temp = setInterval(()=>{
          this.closeModal();
          window.scrollTo(0,document.body.scrollHeight);
          clearInterval(temp);

        }, 5000);
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
    let { measurements, totalHeight } = this.state;

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
    // let video = document.getElementById('video');
    // const aspectRatio = video.videoWidth/video.videoHeight;

    let width = 0, height = 0;
    height = 157.5 // window.innerHeight * 1/8;
    width = 210 // height * 4/3;
    console.log("RENDER");
    return(
      <section>

        <Modal
          className='modal'
          overlayClassName='overlay'
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          contentLabel="CameraModal">

          <section>
            <section className="modal-close">
              <button
                onClick={this.closeModal}>X
              </button>
            </section>
            <section className="video-container">
              <video id="video" width={width} height={height} autoPlay></video>
              <canvas id="calcCanvas" className="calc-cavas" width={width} height={height}></canvas>
              <div id="demo-image" className="demo-container hidden" style={{height, width }} >
                <p>Model this!</p>
              </div>
              { videoControls }
            </section>
            <h1 id="instructions" className="instructions"></h1>
            <section className="modal-button-section">
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
            <label>feet </label>
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
          <h2>(Step 2)   Lets take some measurements.</h2>
          <button
            className='nav-button'
            onClick={this.openModal}
            >Open Camera &nbsp;
            <i id="cameraIcon" className="fa fa-camera-retro fa-5" aria-hidden="true"></i>
          </button>
        </section>
        <TemplateEditor height={this.state.heightInches+this.state.heightFeet*12} measurements={measurements}/>
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
