"use strict";

var audioControls = function (){
  this.playing = false; // Bool
  this.currentTime = 0; // Time in samples of audio playback
  this.speed = 1; // Percentage between 0 and 1
};

// Audio variables
var engine;
var controls;
var audioData;
var audioC; // Number of samples to process
var audioT; // Play time of audioC
var audioBuffer;

var destinationBuff = [];

// HTML objects
var objFile; // File control
var objPlay; // Play button
var objStop; // Stop button
var objState; // State of loading audio
var objTime; // Current audio playback time
var objTimeR; // Range slider for time
var objSpeed; // Speed Slider
var objSpeedT; // Speed number input

function doneLoading(data){
  audioData = data;
  audioC = audioData.sampleRate / 2;
  audioT = audioC / data.sampleRate * 1000;
  audioBuffer = engine.newBuffer(data.channels, audioC, data.sampleRate);
  //engine.buffer = engine.newBuffer(data.channels, audioC, data.sampleRate);
  engine.buffer = audioBuffer;

  destinationBuff = [];
  for(var i = 0; i < data.channels; i++){
    destinationBuff.push(new Float32Array(audioC));
  }

  objTime.innerHTML = "Time: 0";
  objTimeR.value = 0;
  objTimeR.min = 0;
  objTimeR.max = data.length;
  controls.currT = 0;

  objState.innerHTML = "Loading Complete";
}

function prepareBuffer(offs){
  var nTime = Math.min(audioData.length - Math.floor(offs), audioC);

  for(var c = 0; c < audioData.channels; c++){
    var ioffs = 0;
    for(var i = 0; i < nTime; i++){

      if(i > 0 && (i-ioffs > nTime * controls.speed)){
        ioffs = i;
      }

      destinationBuff[c][i] = audioData.data[c][(i - ioffs) + offs];
    }

    if(nTime < audioC){
      destinationBuff[c].fill(0, nTime);
    }
  }
}

function copyToEngine(){
  for(var i = 0; i < audioData.channels; i++){
    audioBuffer.copyToChannel(destinationBuff[i], i);
  }
}

function playStart(){
  if(audioData){
    var currT = controls.currentTime;
    if((controls.playing == false) && (engine.decodedFile) && (controls.speed > 0) && (currT < audioData.length)){

      prepareBuffer(currT);
      copyToEngine();
      engine.play(playContinue);
      //setTimeout(playContinue, audioT);

      currT = currT + audioC * controls.speed;

      if(currT < audioData.length){
        prepareBuffer(currT);
        controls.playing = true;
      } else {
        currT = audioData.length;
      }


      controls.currentTime = currT;
      //console.log("Starting playback");
      objTimeR.value = currT;
      objTime.innerHTML = "Time: " + Math.floor(currT/audioData.sampleRate);
    }
  }
}

function playContinue(){
  if(controls.playing && controls.speed > 0){
    var currT = controls.currentTime;
    copyToEngine(currT);
    engine.play();
    setTimeout(playContinue, audioT);

    currT = currT + audioC * controls.speed;

    if(currT < audioData.length){
      prepareBuffer(currT);
    } else {
      currT = audioData.length;
      controls.playing = false;
    }


    controls.currentTime = currT;
    objTimeR.value = currT;
    objTime.innerHTML = "Time: " + Math.floor(currT/audioData.sampleRate);
    //console.log("Playing");
  }
}

function playStop(){
  controls.playing = false;
  engine.stop();
}

function init() {
  engine = new AudioEngine();
  engine.autoCreateBuffer = false;
  engine.completionCallback = doneLoading;

  controls = new audioControls();

  objFile = document.getElementById("file");
  objPlay = document.getElementById("btnPlay");
  objStop = document.getElementById("btnStop");
  objState = document.getElementById("state");
  objTime = document.getElementById("time");
  objTimeR = document.getElementById("timeR");
  objSpeed = document.getElementById("speed");
  objSpeedT = document.getElementById("speedT");

  objState.innerHTML = "No file loaded";

  objPlay.onclick = playStart;
  objStop.onclick = playStop;

  objFile.value = "";
  objFile.onchange = function (event){
    objState.innerHTML = "Loading File...";
    engine.fileCallback(event);
  };

  objSpeed.value = 100;
  objSpeedT.value = 100;

  objSpeed.oninput = function (event){
    objSpeedT.value = this.value;
    controls.speed = this.value/100;
  }

  objSpeedT.onchange = function (event){
    objSpeed.value = this.value;
    controls.speed = this.value/100;
  }

  objTimeR.oninput = function (event){
    if(audioData){
      controls.playing = false;
      controls.currentTime = Math.floor(this.value);
      objTime.innerHTML = "Time: " + Math.floor(this.value / audioData.sampleRate);
    }
  }
}

window.onload = init;
