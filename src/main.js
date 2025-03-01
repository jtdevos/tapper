// Simple jsgame starter
// A simple starter using vite for creating a javascript game that works in web and jsgamelauncher

import { createResourceLoader, drawLoadingScreen, getInput } from './utils.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const { width, height } = canvas;
let lastTime;

// Load the fonts
const gameFont = new FontFace('GameFont', 'url(fonts/gamefont.otf)');
const emojiFont = new FontFace('Noto Emoji', 'url(fonts/noto-emoji.ttf)');

Promise.all([gameFont.load(), emojiFont.load()]).then(function(loaded_faces) {
  loaded_faces.forEach(loaded_face => {
    document.fonts.add(loaded_face);
  });
  // Ready to use the fonts!
}).catch(function(error) {
  console.error('Font load error:', error);
});

const resources = createResourceLoader();

const players = [
  {
    name: '😀',
    button: 'BUTTON_NORTH', // Y on Xbox, X on Nintendo, S on keyboard
    tapCount: 0,
    buttonWasPressed: false,
  },
  {
    name: '😂',
    button: 'BUTTON_EAST', // B on Xbox, A on Nintendo, X on keyboard
    tapCount: 0,
    buttonWasPressed: false,
  },
  {
    name: '😎',
    button: 'BUTTON_SOUTH', // A on Xbox, B on Nintendo, Z on keyboard
    tapCount: 0,
    buttonWasPressed: false,
  },
  {
    name: '😍',
    button: 'BUTTON_WEST', // X on Xbox, Y on Nintendo, A on keyboard
    tapCount: 0,
    buttonWasPressed: false,
  },
];

let gameStarted = false;
let timeLeft = 10;
let timerInterval;
let highScore = localStorage.getItem('highScore') || 0;
let gameOver = false;
let winningPlayer;

function createFireworks(x, y, ctx, color = 'white') {
  const particleCount = 30;
  const angleStep = Math.PI * 2 / particleCount;
  const speed = 5;

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const velocityX = speed * Math.cos(angle);
    const velocityY = speed * Math.sin(angle);

    createParticle(x, y, velocityX, velocityY, ctx, color);
  }
}

function createParticle(x, y, velocityX, velocityY, ctx, color) {
  const particle = {
    x: x,
    y: y,
    velocityX: velocityX,
    velocityY: velocityY,
    gravity: 0.1,
    alpha: 1,
    color: color,
    radius: 2,
  };

  updateParticle(particle, ctx);
}

function updateParticle(particle, ctx) {
  particle.x += particle.velocityX;
  particle.y += particle.velocityY;
  particle.velocityY += particle.gravity;
  particle.alpha -= 0.02;

  if (particle.alpha <= 0) {
    return;
  }

  drawParticle(particle, ctx);
  requestAnimationFrame(() => updateParticle(particle, ctx));
}

function drawParticle(particle, ctx) {
  ctx.save();
  ctx.globalAlpha = particle.alpha;
  ctx.fillStyle = particle.color;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function startGame() {
  players.forEach((player) => {
    player.tapCount = 0;
    player.buttonWasPressed = false;
  });
  gameStarted = true;
  gameOver = false;
  winningPlayer = null;
  timeLeft = 10;
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      gameStarted = false;
      gameOver = true;
      const totalTaps = players.reduce((sum, player) => sum + player.tapCount, 0);
      if (totalTaps > highScore) {
        highScore = totalTaps;
        localStorage.setItem('highScore', highScore);
      }

      // Determine the winner
      winningPlayer = players.reduce((prev, current) => (prev.tapCount > current.tapCount) ? prev : current);
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
          // Launch fireworks
          const x = Math.random() * width;
          const y = Math.random() * height;
          createFireworks(x, y, ctx, 'white');
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
  ctx.font = `${width * 0.06}px GameFont, "Noto Emoji", monospace`;
  ctx.textAlign = 'center';

  if (!resources.isComplete()) {
    drawLoadingScreen(ctx, resources.getPercentComplete());
    return;
  }

  const quadrantWidth = width / 2;
  const quadrantHeight = height / 2;

  if (gameOver) {
    ctx.fillText('Game Over!', width / 2, height / 2 - quadrantHeight * 0.2);
    ctx.fillText(`${winningPlayer.name} won with ${winningPlayer.tapCount} taps!`, width / 2, height / 2);
    ctx.fillText('Tap Z to Start', width / 2, height / 2 + quadrantHeight * 0.2);
  }
  else if (!gameStarted) {
    ctx.fillText('Tap Z to Start', width / 2, height / 2);
    ctx.fillText(`High Score: ${highScore}`, width / 2, height - quadrantHeight * 0.1);
  } else {
    // Time Left
    ctx.fillText(`Time Left: ${timeLeft}`, width / 2, quadrantHeight * 0.2);

    // Player 1 (Top Left)
    ctx.textAlign = 'left';
    ctx.fillText(`${players[0].name}: ${players[0].tapCount}`, quadrantWidth * 0.1, quadrantHeight * 0.3);

    // Player 2 (Top Right)
    ctx.textAlign = 'right';
    ctx.fillText(`${players[1].name}: ${players[1].tapCount}`, width - quadrantWidth * 0.1, quadrantHeight * 0.3);

    // Player 3 (Bottom Left)
    ctx.textAlign = 'left';
    ctx.fillText(`${players[2].name}: ${players[2].tapCount}`, quadrantWidth * 0.1, height - quadrantHeight * 0.3);

    // Player 4 (Bottom Right)
    ctx.textAlign = 'right';
    ctx.fillText(`${players[3].name}: ${players[3].tapCount}`, width - quadrantWidth * 0.1, height - quadrantHeight * 0.3);

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
