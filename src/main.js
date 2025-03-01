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
resources.addSound('karateChop', 'sounds/karate-chop.mp3');

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
const fireworks = [];
let canStartNewGame = true;

function startGame() {
  if (!canStartNewGame) return;

  players.forEach((player) => {
    player.tapCount = 0;
    player.buttonWasPressed = false;
  });
  gameStarted = true;
  gameOver = false;
  winningPlayer = null;
  fireworks.length = 0; // Clear existing fireworks
  timeLeft = 10;
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      gameStarted = false;
      gameOver = true;
      canStartNewGame = false;
      setTimeout(() => {
        canStartNewGame = true;
      }, 3000);

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

  if (gameOver && !canStartNewGame) {
    return; // Ignore input during the wait period
  }

  if (!gameStarted && canStartNewGame) {
    if (allInputs.some(input => input.START.pressed)) {
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
          createFireworks(Math.random() * width, Math.random() * height);
          // Play sound
          resources.playSound(resources.sounds.karateChop);
        }
      } else {
        player.buttonWasPressed = false;
      }
    });
  });
}

function createFireworks(x, y) {
  const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
  const particleCount = 50;
  for (let i = 0; i < particleCount; i++) {
    fireworks.push(createParticle(x, y, color));
  }
}

function createParticle(x, y, color) {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 3 + 2;
  return {
    x: x,
    y: y,
    velocityX: speed * Math.cos(angle),
    velocityY: speed * Math.sin(angle),
    gravity: 0.05,
    alpha: 1,
    color: color,
    radius: 2,
    lifespan: Math.random() * 50 + 50,
  };
}

function updateFireworks() {
  for (let i = fireworks.length - 1; i >= 0; i--) {
    const particle = fireworks[i];
    particle.x += particle.velocityX;
    particle.y += particle.velocityY;
    particle.velocityY += particle.gravity;
    particle.alpha -= 0.01;

    if (particle.alpha <= 0 || particle.lifespan <= 0) {
      fireworks.splice(i, 1);
    }
  }
}

function drawFireworks() {
  fireworks.forEach(particle => {
    ctx.save();
    ctx.globalAlpha = particle.alpha;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
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

  updateFireworks();

  const quadrantWidth = width / 2;
  const quadrantHeight = height / 2;

  if (gameOver) {
    ctx.fillText('Game Over!', width / 2, height / 2 - quadrantHeight * 0.2);
    ctx.fillText(`${winningPlayer.name} won with ${winningPlayer.tapCount} taps!`, width / 2, height / 2);
    if (canStartNewGame) {
      ctx.fillText('Press Start to Begin!', width / 2, height / 2 + quadrantHeight * 0.2);
    } else {
      ctx.fillText('New game starting soon...', width / 2, height / 2 + quadrantHeight * 0.2);
    }
  }
  else if (!gameStarted) {
    ctx.fillText('Press Start to Begin!', width / 2, height / 2);
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

  drawFireworks();
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
