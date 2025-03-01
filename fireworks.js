export function createFireworks(x, y, ctx, color = 'white') {
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
