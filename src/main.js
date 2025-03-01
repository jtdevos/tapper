// Simple jsgame starter
// A simple starter using vite for creating a javascript game that works in web and jsgamelauncher

import { createResourceLoader, drawLoadingScreen, getInput } from './utils.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const { width, height } = canvas;
let lastTime;

const resources = createResourceLoader();

let tapCount = 0;
let gameStarted = false;
let timeLeft = 10;
let timerInterval;
let buttonWasPressed = false;

function startGame() {
  tapCount = 0;
  gameStarted = true;
  timeLeft = 10;
  buttonWasPressed = false;
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      gameStarted = false;
    }
  }, 1000);
}

function update() {
  const [p1] = getInput();
  if (gameStarted) {
    if (p1.BUTTON_EAST.pressed) {
      if (!buttonWasPressed) {
        tapCount++;
        buttonWasPressed = true;
      }
    } else {
      buttonWasPressed = false;
    }
  } else {
    if (p1.BUTTON_SOUTH.pressed) {
      startGame();
    }
  }
}

function draw() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'white';
  ctx.font = `${width * 0.05}px monospace`;
  ctx.textAlign = 'center';
  if (!resources.isComplete()) {
    drawLoadingScreen(ctx, resources.getPercentComplete());
    return;
  }

  if (!gameStarted) {
    ctx.fillText('Tap Z to Start', width / 2, height / 2 - width * 0.05);
    ctx.fillText('Tap X to count', width / 2, height / 2 + width * 0.05);
  } else {
    ctx.fillText(`Time Left: ${timeLeft}`, width / 2, height / 2 - width * 0.05);
    ctx.fillText(`Taps: ${tapCount}`, width / 2, height / 2 + width * 0.05);
  }
}

function gameLoop(time) {
  const deltaTime = time - lastTime;
  update(deltaTime);
  draw();
  lastTime = time;
  requestAnimationFrame(gameLoop);
}

resources.load().then(() => {
  gameLoop();
});
