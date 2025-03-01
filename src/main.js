// Simple jsgame starter
// A simple starter using vite for creating a javascript game that works in web and jsgamelauncher

import { createResourceLoader, drawLoadingScreen, getInput } from './utils.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const { width, height } = canvas;
let lastTime;

const resources = createResourceLoader();

const players = [
  {
    name: 'Player 1',
    button: 'BUTTON_NORTH', // Y on Xbox, X on Nintendo, S on keyboard
    tapCount: 0,
    highScore: localStorage.getItem('highScore1') || 0,
    buttonWasPressed: false,
  },
  {
    name: 'Player 2',
    button: 'BUTTON_EAST', // B on Xbox, A on Nintendo, X on keyboard
    tapCount: 0,
    highScore: localStorage.getItem('highScore2') || 0,
    buttonWasPressed: false,
  },
  {
    name: 'Player 3',
    button: 'BUTTON_SOUTH', // A on Xbox, B on Nintendo, Z on keyboard
    tapCount: 0,
    highScore: localStorage.getItem('highScore3') || 0,
    buttonWasPressed: false,
  },
  {
    name: 'Player 4',
    button: 'BUTTON_WEST', // X on Xbox, Y on Nintendo, A on keyboard
    tapCount: 0,
    highScore: localStorage.getItem('highScore4') || 0,
    buttonWasPressed: false,
  },
];

let gameStarted = false;
let timeLeft = 10;
let timerInterval;

function startGame() {
  players.forEach((player) => {
    player.tapCount = 0;
    player.buttonWasPressed = false;
  });
  gameStarted = true;
  timeLeft = 10;
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      gameStarted = false;
      players.forEach((player, index) => {
        if (player.tapCount > player.highScore) {
          player.highScore = player.tapCount;
          localStorage.setItem(`highScore${index + 1}`, player.highScore);
        }
      });
    }
  }, 1000);
}

function update() {
  const allInputs = getInput();

  if (!gameStarted) {
    if (allInputs.some(input => input.BUTTON_SOUTH.pressed)) {
      startGame();
    }
    return;
  }

  allInputs.forEach((input) => {
    players.forEach((player) => {
      if (input[player.button].pressed) {
        if (!player.buttonWasPressed) {
          player.tapCount++;
          player.buttonWasPressed = true;
        }
      } else {
        player.buttonWasPressed = false;
      }
    });
  });
}

function draw() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'white';
  ctx.font = `${width * 0.03}px monospace`;
  ctx.textAlign = 'center';

  if (!resources.isComplete()) {
    drawLoadingScreen(ctx, resources.getPercentComplete());
    return;
  }

  if (!gameStarted) {
    ctx.fillText('Tap Z to Start', width / 2, height / 2);
  } else {
    const lineHeight = width * 0.04;
    let yOffset = height * 0.1;
    ctx.fillText(`Time Left: ${timeLeft}`, width / 2, yOffset);
    yOffset += lineHeight * 1.5;

    players.forEach((player) => {
      ctx.fillText(`${player.name}: Taps ${player.tapCount} High Score ${player.highScore}`, width / 2, yOffset);
      yOffset += lineHeight;
    });
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
