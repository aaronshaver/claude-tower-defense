// Rendering functions
const Renderer = {
  drawStatsBar: function(ctx) {
    ctx.fillStyle = '#00003B';
    ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.stats.height);
    
    let elapsedTime;
    if (Game.gameOver) {
      elapsedTime = Game.gameEndTime - Game.gameStartTime;
    } else {
      elapsedTime = Date.now() - Game.gameStartTime;
    }
    
    const timeText = `Time: ${formatTime(elapsedTime)}`;
    const pointsText = `Build Points: ${Game.buildPoints}`;
    const enemiesText = `Enemies: ${Game.enemies.length}`;
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#00FFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(timeText, 20, CONFIG.stats.height / 2);
    ctx.fillText("|", 120, CONFIG.stats.height / 2);
    ctx.fillText(pointsText, 140, CONFIG.stats.height / 2);
    ctx.fillText("|", 280, CONFIG.stats.height / 2);
    ctx.fillText(enemiesText, 300, CONFIG.stats.height / 2);
  },
  
  drawSidebar: function(ctx) {
    // Draw sidebar background
    ctx.fillStyle = '#222222';
    ctx.fillRect(
      CONFIG.sidebar.x, 
      CONFIG.sidebar.y, 
      CONFIG.sidebar.width, 
      CONFIG.sidebar.height
    );
    
    // Draw selection buttons
    for (let button of Game.buttons) {
      const buttonX = CONFIG.sidebar.x + 10;
      
      // Draw button background
      ctx.fillStyle = button.selected ? '#4477AA' : '#333333';
      ctx.fillRect(buttonX, button.y, CONFIG.sidebar.buttonWidth, CONFIG.sidebar.buttonHeight);
      
      // Draw button border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(buttonX, button.y, CONFIG.sidebar.buttonWidth, CONFIG.sidebar.buttonHeight);
      
      // Draw button label
      ctx.font = '14px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        button.label, 
        buttonX + CONFIG.sidebar.buttonWidth / 2, 
        button.y + CONFIG.sidebar.buttonHeight / 2
      );
    }
  },
  
  drawGameArea: function(ctx) {
    // Draw game area outline
    ctx.strokeStyle = '#777777';
    ctx.lineWidth = 2;
    roundedRect(
      ctx,
      CONFIG.game.x, 
      CONFIG.game.y, 
      CONFIG.game.width, 
      CONFIG.game.height, 
      CONFIG.game.radius
    );
    ctx.stroke();
    
    // Draw player base
    const baseCenterX = CONFIG.game.x + CONFIG.game.width / 2;
    const baseCenterY = CONFIG.game.y + CONFIG.game.height / 2;
    
    ctx.beginPath();
    ctx.arc(baseCenterX, baseCenterY, CONFIG.base.radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.font = '12px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Base', baseCenterX, baseCenterY);
  },
  
  drawEntities: function(ctx) {
    // Draw walls
    ctx.lineWidth = CONFIG.wall.thickness;
    ctx.strokeStyle = '#ffffff';
    
    for (let wall of Game.walls) {
      ctx.beginPath();
      const startAngle = wall.angle - wall.arcWidth / 2;
      const endAngle = wall.angle + wall.arcWidth / 2;
      
      ctx.arc(wall.x, wall.y, wall.radius, startAngle, endAngle);
      ctx.stroke();
    }
    
    // Draw resources
    ctx.fillStyle = '#bb44dd'; // Bright purple
    for (let resource of Game.resources) {
      ctx.beginPath();
      ctx.arc(resource.x, resource.y, CONFIG.resource.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw enemies
    ctx.fillStyle = '#ff0000';
    for (let enemy of Game.enemies) {
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, CONFIG.enemy.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw builders
    ctx.fillStyle = '#00AAFF';
    for (let builder of Game.builders) {
      ctx.fillRect(
        builder.x - CONFIG.builder.size/2, 
        builder.y - CONFIG.builder.size/2, 
        CONFIG.builder.size, 
        CONFIG.builder.size
      );
    }
    
    // Draw hunters
    ctx.fillStyle = '#00FF00';
    for (let hunter of Game.hunters) {
      drawTriangle(ctx, hunter.x, hunter.y, CONFIG.hunter.size, hunter.angle);
    }
    
    // Draw gatherers
    ctx.fillStyle = '#FFFF00';
    for (let gatherer of Game.gatherers) {
      ctx.beginPath();
      ctx.arc(gatherer.x, gatherer.y, CONFIG.gatherer.size, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  
  drawGameOver: function(ctx) {
    if (Game.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
      
      ctx.font = '48px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CONFIG.canvas.width / 2, CONFIG.canvas.height / 2);
      
      ctx.font = '24px Arial';
      ctx.fillText('(press R to restart)', CONFIG.canvas.width / 2, CONFIG.canvas.height / 2 + 60);
    }
  },
  
  render: function(ctx) {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
    
    this.drawStatsBar(ctx);
    this.drawGameArea(ctx);
    this.drawSidebar(ctx);
    this.drawEntities(ctx);
    this.drawGameOver(ctx);
  }
};