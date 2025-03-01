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
    buttonWasPressed: false,
  },
  {
    name: 'Player 2',
    button: 'BUTTON_EAST', // B on Xbox, A on Nintendo, X on keyboard
    tapCount: 0,
    buttonWasPressed: false,
  },
  {
    name: 'Player 3',
    button: 'BUTTON_SOUTH', // A on Xbox, B on Nintendo, Z on keyboard
    tapCount: 0,
    buttonWasPressed: false,
  },
  {
    name: 'Player 4',
    button: 'BUTTON_WEST', // X on Xbox, Y on Nintendo, A on keyboard
    tapCount: 0,
    buttonWasPressed: false,
  },
];

let gameStarted = false;
let timeLeft = 10;
let timerInterval;
let highScore = localStorage.getItem('highScore') || 0;

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
      const totalTaps = players.reduce((sum, player) => sum + player.tapCount, 0);
      if (totalTaps > highScore) {
        highScore = totalTaps;
        localStorage.setItem('highScore', highScore);
      }
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

  const quadrantWidth = width / 2;
  const quadrantHeight = height / 2;

  if (!gameStarted) {
    ctx.fillText('Tap Z to Start', width / 2, height / 2);
  } else {
    // Time Left
    ctx.fillText(`Time Left: ${timeLeft}`, width / 2, quadrantHeight * 0.2);

    // Player 1 (Top Left)
    ctx.textAlign = 'left';
    ctx.fillText(`${players[0].name}: ${players[0].tapCount}`, quadrantWidth * 0.1, quadrantHeight * 0.4);

    // Player 2 (Top Right)
    ctx.textAlign = 'right';
    ctx.fillText(`${players[1].name}: ${players[1].tapCount}`, width - quadrantWidth * 0.1, quadrantHeight * 0.4);

    // Player 3 (Bottom Left)
    ctx.textAlign = 'left';
    ctx.fillText(`${players[2].name}: ${players[2].tapCount}`, quadrantWidth * 0.1, height - quadrantHeight * 0.4);

    // Player 4 (Bottom Right)
    ctx.textAlign = 'right';
    ctx.fillText(`${players[3].name}: ${players[3].tapCount}`, width - quadrantWidth * 0.1, height - quadrantHeight * 0.4);

    // High Score (Center Bottom)
    ctx.textAlign = 'center';
    ctx.fillText(`High Score: ${highScore}`, width / 2, height - quadrantHeight * 0.1);
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
