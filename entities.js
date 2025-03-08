// Entities update functions
const Entities = {
  updateEnemies: function() {
    const baseCenterX = CONFIG.game.x + CONFIG.game.width / 2;
    const baseCenterY = CONFIG.game.y + CONFIG.game.height / 2;
    
    for (let i = 0; i < Game.enemies.length; i++) {
      const enemy = Game.enemies[i];
      let newX = enemy.x;
      let newY = enemy.y;
      
      enemy.prevX = enemy.x;
      enemy.prevY = enemy.y;
      
      if (!enemy.randomMove && Math.random() < 0.01) {
        enemy.randomMove = true;
        enemy.randomTicks = Math.floor(Math.random() * 60) + 20;
        const randomAngle = Math.random() * Math.PI * 2;
        enemy.randomDx = Math.cos(randomAngle) * CONFIG.enemy.speed;
        enemy.randomDy = Math.sin(randomAngle) * CONFIG.enemy.speed;
      }
      
      if (enemy.randomMove) {
        newX = enemy.x + enemy.randomDx;
        newY = enemy.y + enemy.randomDy;
        enemy.randomTicks--;
        
        if (enemy.randomTicks <= 0) {
          enemy.randomMove = false;
        }
      } else {
        const dirX = baseCenterX - enemy.x;
        const dirY = baseCenterY - enemy.y;
        const dist = Math.sqrt(dirX * dirX + dirY * dirY);
        
        newX = enemy.x + (dirX / dist) * CONFIG.enemy.speed;
        newY = enemy.y + (dirY / dist) * CONFIG.enemy.speed;
      }
      
      // Keep in bounds
      if (newX < CONFIG.game.x + CONFIG.enemy.radius) {
        newX = CONFIG.game.x + CONFIG.enemy.radius;
        if (enemy.randomMove) enemy.randomDx *= -1;
      }
      if (newX > CONFIG.game.x + CONFIG.game.width - CONFIG.enemy.radius) {
        newX = CONFIG.game.x + CONFIG.game.width - CONFIG.enemy.radius;
        if (enemy.randomMove) enemy.randomDx *= -1;
      }
      if (newY < CONFIG.game.y + CONFIG.enemy.radius) {
        newY = CONFIG.game.y + CONFIG.enemy.radius;
        if (enemy.randomMove) enemy.randomDy *= -1;
      }
      if (newY > CONFIG.game.y + CONFIG.game.height - CONFIG.enemy.radius) {
        newY = CONFIG.game.y + CONFIG.game.height - CONFIG.enemy.radius;
        if (enemy.randomMove) enemy.randomDy *= -1;
      }
      
      enemy.x = newX;
      enemy.y = newY;
      
      if (isEnemyCollidingWithWall(enemy)) {
        enemy.x = enemy.prevX;
        enemy.y = enemy.prevY;
        
        if (enemy.randomMove) {
          enemy.randomDx *= -1;
          enemy.randomDy *= -1;
        }
      }
      
      const distToBase = distanceTo(
        enemy.x, enemy.y, baseCenterX, baseCenterY
      );
      
      if (distToBase <= CONFIG.base.radius + CONFIG.enemy.radius) {
        if (!Game.gameOver) {
          Game.gameOver = true;
          Game.gameEndTime = Date.now();
        }
      }
    }
  },
  
  updateBuilders: function() {
    for (let i = Game.builders.length - 1; i >= 0; i--) {
      const builder = Game.builders[i];
      
      // Check for collisions with enemies
      for (let j = 0; j < Game.enemies.length; j++) {
        const enemy = Game.enemies[j];
        const dist = distanceTo(builder.x, builder.y, enemy.x, enemy.y);
        
        if (dist <= CONFIG.builder.size + CONFIG.enemy.radius) {
          // Builder dies upon contact with enemy
          Game.builders.splice(i, 1);
          return;
        }
      }
      
      builder.x += builder.dx;
      builder.y += builder.dy;
      
      const currentTime = Date.now();
      if (currentTime - builder.lastBuildCheck >= 1000) {
        builder.lastBuildCheck = currentTime;
        
        if (Math.random() < CONFIG.wall.buildChance) {
          const baseCenterX = CONFIG.game.x + CONFIG.game.width / 2;
          const baseCenterY = CONFIG.game.y + CONFIG.game.height / 2;
          
          const angle = builder.originalAngle;
          const wallX = builder.x - (CONFIG.wall.radius * Math.cos(angle));
          const wallY = builder.y - (CONFIG.wall.radius * Math.sin(angle));
          
          Game.walls.push({
            x: wallX,
            y: wallY,
            radius: CONFIG.wall.radius,
            angle: angle,
            arcWidth: CONFIG.wall.arcWidth,
            creationTime: Date.now() // Track when the wall was created
          });
        }
      }
      
      // Remove if out of bounds
      if (
        builder.x < CONFIG.game.x ||
        builder.x > CONFIG.game.x + CONFIG.game.width ||
        builder.y < CONFIG.game.y ||
        builder.y > CONFIG.game.y + CONFIG.game.height
      ) {
        Game.builders.splice(i, 1);
      }
    }
  },
  
  updateHunters: function() {
    for (let i = Game.hunters.length - 1; i >= 0; i--) {
      const hunter = Game.hunters[i];
      const baseCenterX = CONFIG.game.x + CONFIG.game.width / 2;
      const baseCenterY = CONFIG.game.y + CONFIG.game.height / 2;
      
      // Check for collisions with enemies
      let collision = false;
      for (let j = Game.enemies.length - 1; j >= 0; j--) {
        const enemy = Game.enemies[j];
        const dist = distanceTo(hunter.x, hunter.y, enemy.x, enemy.y);
        
        if (dist <= CONFIG.hunter.size + CONFIG.enemy.radius) {
          // Collision detected - remove both
          Game.enemies.splice(j, 1);
          collision = true;
          break;
        }
      }
      
      if (collision) {
        Game.hunters.splice(i, 1);
        continue;
      }
      
      // Check if hunter reached the border
      if (hunter.x <= CONFIG.game.x || 
          hunter.x >= CONFIG.game.x + CONFIG.game.width || 
          hunter.y <= CONFIG.game.y || 
          hunter.y >= CONFIG.game.y + CONFIG.game.height) {
        
        // Constrain position to just inside border
        hunter.x = Math.max(CONFIG.game.x + 1, 
                     Math.min(CONFIG.game.x + CONFIG.game.width - 1, hunter.x));
        hunter.y = Math.max(CONFIG.game.y + 1, 
                     Math.min(CONFIG.game.y + CONFIG.game.height - 1, hunter.y));
        
        // Return to base if not already returning
        if (!hunter.returningToBase) {
          hunter.returningToBase = true;
          
          // Recalculate angle to head back to base
          const dirX = baseCenterX - hunter.x;
          const dirY = baseCenterY - hunter.y;
          const dist = Math.sqrt(dirX * dirX + dirY * dirY);
          
          hunter.angle = Math.atan2(dirY, dirX);
          hunter.dx = (dirX / dist) * CONFIG.hunter.speed;
          hunter.dy = (dirY / dist) * CONFIG.hunter.speed;
        }
      }
      
      // Check if hunter reached the base when returning
      if (hunter.returningToBase) {
        const distToBase = distanceTo(
          hunter.x, hunter.y, baseCenterX, baseCenterY
        );
        
        if (distToBase <= CONFIG.base.radius + CONFIG.hunter.size) {
          hunter.returningToBase = false;
          
          // Head back out in a random direction
          const randomAngle = Math.random() * Math.PI * 2;
          hunter.angle = randomAngle;
          hunter.dx = Math.cos(randomAngle) * CONFIG.hunter.speed;
          hunter.dy = Math.sin(randomAngle) * CONFIG.hunter.speed;
        }
      }
      
      // Try to find target if not in targeting mode
      if (!hunter.targetingMode) {
        hunter.targetEnemy = findNearestEnemy(
          hunter.x, hunter.y, CONFIG.hunter.detectionRadius
        );
        
        if (hunter.targetEnemy) {
          hunter.targetingMode = true;
        } else {
          // No target, continue on straight path
          hunter.x += hunter.dx;
          hunter.y += hunter.dy;
        }
      } else {
        // Check if target still exists
        if (!Game.enemies.includes(hunter.targetEnemy)) {
          hunter.targetingMode = false;
          hunter.targetEnemy = null;
          hunter.x += hunter.dx;
          hunter.y += hunter.dy;
          continue;
        }
        
        // Chase target
        const dirX = hunter.targetEnemy.x - hunter.x;
        const dirY = hunter.targetEnemy.y - hunter.y;
        const dist = Math.sqrt(dirX * dirX + dirY * dirY);
        
        // Check if target still in range
        if (dist > CONFIG.hunter.detectionRadius) {
          hunter.targetingMode = false;
          hunter.targetEnemy = null;
          hunter.x += hunter.dx;
          hunter.y += hunter.dy;
        } else {
          // Update angle for drawing
          hunter.angle = Math.atan2(dirY, dirX);
          
          // Move toward enemy
          hunter.x += (dirX / dist) * CONFIG.hunter.speed;
          hunter.y += (dirY / dist) * CONFIG.hunter.speed;
        }
      }
    }
  },
  
  updateGatherers: function() {
    const baseCenterX = CONFIG.game.x + CONFIG.game.width / 2;
    const baseCenterY = CONFIG.game.y + CONFIG.game.height / 2;
    
    for (let i = Game.gatherers.length - 1; i >= 0; i--) {
      const gatherer = Game.gatherers[i];
      
      // Check for collisions with enemies
      for (let j = 0; j < Game.enemies.length; j++) {
        const enemy = Game.enemies[j];
        const dist = distanceTo(gatherer.x, gatherer.y, enemy.x, enemy.y);
        
        if (dist <= CONFIG.gatherer.size + CONFIG.enemy.radius) {
          // Gatherer dies upon contact with enemy
          Game.gatherers.splice(i, 1);
          return;
        }
      }
      
      if (gatherer.hasResource) {
        // Return to base with resource
        const dirX = baseCenterX - gatherer.x;
        const dirY = baseCenterY - gatherer.y;
        const dist = Math.sqrt(dirX * dirX + dirY * dirY);
        
        // Update angle for drawing
        gatherer.angle = Math.atan2(dirY, dirX);
        
        // Move toward base
        gatherer.x += (dirX / dist) * CONFIG.gatherer.speed;
        gatherer.y += (dirY / dist) * CONFIG.gatherer.speed;
        
        // Check if reached base
        if (dist <= CONFIG.base.radius + CONFIG.gatherer.size) {
          // Deposit resource
          Game.buildPoints += CONFIG.resource.value;
          gatherer.hasResource = false;
          gatherer.targetingResource = false;
          
          // Head back out in a random direction
          const randomAngle = Math.random() * Math.PI * 2;
          gatherer.angle = randomAngle;
          gatherer.dx = Math.cos(randomAngle) * CONFIG.gatherer.speed;
          gatherer.dy = Math.sin(randomAngle) * CONFIG.gatherer.speed;
        }
      } else {
        // Modified to work more like hunters: move in straight lines
        // and only divert when near a resource
        
        // First, check if we're already targeting a resource
        if (gatherer.targetingResource) {
          if (!gatherer.targetResource || 
              !Game.resources.includes(gatherer.targetResource)) {
            // Target resource no longer exists
            gatherer.targetingResource = false;
            gatherer.targetResource = null;
            gatherer.x += gatherer.dx;
            gatherer.y += gatherer.dy;
          } else {
            // Move toward targeted resource
            const dirX = gatherer.targetResource.x - gatherer.x;
            const dirY = gatherer.targetResource.y - gatherer.y;
            const dist = Math.sqrt(dirX * dirX + dirY * dirY);
            
            if (dist <= CONFIG.gatherer.size + CONFIG.resource.size) {
              // Collect resource
              gatherer.hasResource = true;
              
              // Remove resource from the game
              const resourceIndex = Game.resources.indexOf(gatherer.targetResource);
              if (resourceIndex !== -1) {
                Game.resources.splice(resourceIndex, 1);
              }
              
              gatherer.targetResource = null;
              gatherer.targetingResource = false;
            } else {
              // Update angle for drawing
              gatherer.angle = Math.atan2(dirY, dirX);
              
              // Move toward resource
              gatherer.x += (dirX / dist) * CONFIG.gatherer.speed;
              gatherer.y += (dirY / dist) * CONFIG.gatherer.speed;
            }
          }
        } else {
          // Look for resources nearby (not seeing from far away)
          const nearestResource = findNearestResource(
            gatherer.x, gatherer.y, CONFIG.gatherer.detectionRadius
          );
          
          if (nearestResource) {
            // Found a resource within detection radius
            gatherer.targetingResource = true;
            gatherer.targetResource = nearestResource;
          } else {
            // No resources nearby, continue on straight path
            gatherer.x += gatherer.dx;
            gatherer.y += gatherer.dy;
            
            // If reaching the border, pick a new direction
            if (gatherer.x <= CONFIG.game.x || 
                gatherer.x >= CONFIG.game.x + CONFIG.game.width || 
                gatherer.y <= CONFIG.game.y || 
                gatherer.y >= CONFIG.game.y + CONFIG.game.height) {
              
              // Constrain position
              gatherer.x = Math.max(CONFIG.game.x + 1, 
                            Math.min(CONFIG.game.x + CONFIG.game.width - 1, gatherer.x));
              gatherer.y = Math.max(CONFIG.game.y + 1, 
                            Math.min(CONFIG.game.y + CONFIG.game.height - 1, gatherer.y));
              
              // Pick a random new direction away from the edge
              let newAngle;
              if (gatherer.x <= CONFIG.game.x + 5) {
                newAngle = -Math.PI / 2 + Math.random() * Math.PI;
              } else if (gatherer.x >= CONFIG.game.x + CONFIG.game.width - 5) {
                newAngle = Math.PI / 2 + Math.random() * Math.PI;
              } else if (gatherer.y <= CONFIG.game.y + 5) {
                newAngle = Math.random() * Math.PI;
              } else {
                newAngle = Math.PI + Math.random() * Math.PI;
              }
              
              gatherer.angle = newAngle;
              gatherer.dx = Math.cos(newAngle) * CONFIG.gatherer.speed;
              gatherer.dy = Math.sin(newAngle) * CONFIG.gatherer.speed;
            }
          }
        }
      }
    }
  },
  
  // Added a new function to update walls (remove after lifetime)
  updateWalls: function() {
    const currentTime = Date.now();
    
    for (let i = Game.walls.length - 1; i >= 0; i--) {
      const wall = Game.walls[i];
      
      // Check if wall's lifetime has expired
      if (currentTime - wall.creationTime >= CONFIG.wall.lifetime) {
        Game.walls.splice(i, 1);
      }
    }
  }
};