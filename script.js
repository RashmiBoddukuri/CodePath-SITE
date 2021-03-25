// global constants
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence

//Global Variables
var pattern = [2, 2, 6, 1, 3, 5, 4, 6]; //static array: [2, 2, 6, 1, 3, 5, 4, 6], now code implments randomly generated array
var progress = 0;
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5; //must be between 0.0 and 1.0
var guessCounter = 0;
var clueHoldTime = 1000; //how long to hold each clue's light/sound
var strikeCounter = 0;

function randomPattern() {
  pattern = [];
  for (let i = 0; i < 8; i++) {
    var num = Math.floor(Math.random() * 6) + 1;
    pattern.push(num);
  }
  console.log(pattern);
}

function startGame() {
  //initialize game variables
  progress = 0;
  gamePlaying = true;
  strikeCounter = 0;
  //randomPattern();

  // swap the Start and Stop buttons
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  playClueSequence();
}

function stopGame() {
  gamePlaying = false;

  // swap the Start and Stop buttons
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
}

// Sound Synthesis Functions
const freqMap = {
  1: 265,
  2: 317,
  3: 395,
  4: 480,
  5: 350,
  6: 428
};

function playTone(btn, len) {
  o.frequency.value = freqMap[btn];
  g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
  tonePlaying = true;
  setTimeout(function() {
    stopTone();
  }, len);
}

function startTone(btn) {
  if (!tonePlaying) {
    o.frequency.value = freqMap[btn];
    g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
    tonePlaying = true;
  }
}

function stopTone() {
  g.gain.setTargetAtTime(0, context.currentTime + 0.05, 0.025);
  tonePlaying = false;
}

//Page Initialization
// Init Sound Synthesizer
var context = new AudioContext();
var o = context.createOscillator();
var g = context.createGain();
g.connect(context.destination);
g.gain.setValueAtTime(0, context.currentTime);
o.connect(g);
o.start(0);

function lightButton(btn) {
  document.getElementById("button" + btn).classList.add("lit");
}
function clearButton(btn) {
  document.getElementById("button" + btn).classList.remove("lit");
}

function playSingleClue(btn) {
  if (gamePlaying) {
    lightButton(btn);
    playTone(btn, clueHoldTime);
    setTimeout(clearButton, clueHoldTime, btn);
  }
}

function playClueSequence() {
  guessCounter = 0;
  let delay = nextClueWaitTime; //set delay to initial wait time
  clueHoldTime *= 0.85;
  for (let i = 0; i <= progress; i++) {
    // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms");
    setTimeout(playSingleClue, delay, pattern[i]); // set a timeout to play that clue
    delay += clueHoldTime;
    delay += cluePauseTime;
  }
}

function loseGame() {
  stopGame();
  alert("Game Over. You lost.");
}

function winGame() {
  stopGame();
  alert("Game Over. You won!");
}

function guess(btn) {
  console.log("user guessed: " + btn);
  console.log("guessCounter count: " + guessCounter);

  if (!gamePlaying) {
    return;
  }

  if (btn == pattern[guessCounter]) {
    //User's guess is correct
    if (guessCounter == progress) {
      if (progress == pattern.length - 1) {
        //Game won when this is the last turn
        winGame();
      } //pattern correct but not the end(last turn)
      else {
        progress++;
        playClueSequence(); //continue with next clue
      }
    } else {
      guessCounter++;
    }
  } else {
    //Game lost at 3 strikes due to incorrect guess made by User
    if (strikeCounter < 2) {
      strikeCounter++;
      
      alert(
        "Strike: " + strikeCounter
      );
      console.log("strike: " + strikeCounter);
      
      playClueSequence();
    } else {
      loseGame();
    }
  }
}
