"use strict";

var engine;

var objFile;
var objPlay;
var objStop;

function init() {
  engine = new AudioEngine();

  objFile = document.getElementById("file");
  objPlay = document.getElementById("btnPlay");
  objStop = document.getElementById("btnStop");

  objPlay.onclick = engine.play.bind(engine);
  objStop.onclick = engine.stop.bind(engine);

  objFile.value = "";
  objFile.onchange = engine.fileCallback.bind(engine);
}

window.onload = init;
