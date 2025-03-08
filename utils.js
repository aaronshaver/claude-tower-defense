// Utility functions
function distanceTo(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

function drawTriangle(ctx, x, y, size, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size, -size);
  ctx.lineTo(-size, size);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}

function isInPlayArea(x, y) {
  if (x < CONFIG.game.x + CONFIG.enemy.radius || 
      x > CONFIG.game.x + CONFIG.game.width - CONFIG.enemy.radius) {
    return false;
  }
  if (y < CONFIG.game.y + CONFIG.enemy.radius || 
      y > CONFIG.game.y + CONFIG.game.height - CONFIG.enemy.radius) {
    return false;
  }
  return true;
}

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function spawnResource() {
  const baseCenterX = CONFIG.game.x + CONFIG.game.width / 2;
  const baseCenterY = CONFIG.game.y + CONFIG.game.height / 2;
  
  let x, y;
  let validPosition = false;
  
  while (!validPosition) {
    x = CONFIG.game.x + Math.random() * CONFIG.game.width;
    y = CONFIG.game.y + Math.random() * CONFIG.game.height;
    
    const distToBase = distanceTo(x, y, baseCenterX, baseCenterY);
    
    if (distToBase > CONFIG.resource.safeZoneRadius) {
      validPosition = true;
    }
  }
  
  Game.resources.push({
    x: x,
    y: y
  });
}

function spawnEnemy() {
  const baseCenterX = CONFIG.game.x + CONFIG.game.width / 2;
  const baseCenterY = CONFIG.game.y + CONFIG.game.height / 2;
  
  let x, y;
  const side = Math.floor(Math.random() * 4);
  
  if (side === 0) { // Top
    x = CONFIG.game.x + Math.random() * CONFIG.game.width;
    y = CONFIG.game.y + CONFIG.enemy.radius;
  } else if (side === 1) { // Right
    x = CONFIG.game.x + CONFIG.game.width - CONFIG.enemy.radius;
    y = CONFIG.game.y + Math.random() * CONFIG.game.height;
  } else if (side === 2) { // Bottom
    x = CONFIG.game.x + Math.random() * CONFIG.game.width;
    y = CONFIG.game.y + CONFIG.game.height - CONFIG.enemy.radius;
  } else { // Left
    x = CONFIG.game.x + CONFIG.enemy.radius;
    y = CONFIG.game.y + Math.random() * CONFIG.game.height;
  }
  
  Game.enemies.push({
    x: x,
    y: y,
    randomMove: false,
    randomTicks: 0,
    randomDx: 0,
    randomDy: 0,
    prevX: x,
    prevY: y
  });
}

function findNearestEnemy(x, y, radius) {
  let nearest = null;
  let nearestDist = radius;
  
  for (let enemy of Game.enemies) {
    const dist = distanceTo(x, y, enemy.x, enemy.y);
    
    if (dist < nearestDist) {
      nearest = enemy;
      nearestDist = dist;
    }
  }
  
  return nearest;
}

// Modified to include a detection radius parameter
function findNearestResource(x, y, radius = Infinity) {
  let nearest = null;
  let nearestDist = radius;
  
  for (let resource of Game.resources) {
    const dist = distanceTo(x, y, resource.x, resource.y);
    
    if (dist < nearestDist) {
      nearest = resource;
      nearestDist = dist;
    }
  }
  
  return nearest;
}

function isEnemyCollidingWithWall(enemy) {
  for (let wall of Game.walls) {
    const distToWallCenter = distanceTo(enemy.x, enemy.y, wall.x, wall.y);
    
    if (distToWallCenter >= wall.radius - CONFIG.enemy.radius && 
        distToWallCenter <= wall.radius + CONFIG.enemy.radius) {
      const enemyAngle = Math.atan2(enemy.y - wall.y, enemy.x - wall.x);
      let angleDiff = Math.abs(enemyAngle - wall.angle);
      if (angleDiff > Math.PI) {
        angleDiff = 2 * Math.PI - angleDiff;
      }
      
      if (angleDiff <= wall.arcWidth / 2) {
        return true;
      }
    }
  }
  return false;
}