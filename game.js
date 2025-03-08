// Main game object and initialization
const Game = {
  canvas: document.getElementById('gameCanvas'),
  ctx: null,
  
  gameOver: false,
  enemies: [],
  builders: [],
  hunters: [],
  gatherers: [],
  walls: [],
  resources: [],
  
  lastSpawnTime: 0,
  lastResourceSpawnTime: 0,
  gameStartTime: Date.now(),
  gameEndTime: 0,
  buildPoints: 1000,  // Changed from 900 to 1000
  selectedEntityType: 'builder',
  
  buttons: [
    { 
      id: 'builder', 
      label: 'Builder (10)', 
      selected: true, 
      y: CONFIG.sidebar.y + CONFIG.sidebar.buttonSpacing 
    },
    { 
      id: 'hunter', 
      label: 'Hunter (15)', 
      selected: false, 
      y: CONFIG.sidebar.y + CONFIG.sidebar.buttonHeight + CONFIG.sidebar.buttonSpacing * 2 
    },
    { 
      id: 'gatherer', 
      label: 'Gatherer (5)', 
      selected: false, 
      y: CONFIG.sidebar.y + CONFIG.sidebar.buttonHeight * 2 + CONFIG.sidebar.buttonSpacing * 3 
    }
  ],
  
  init: function() {
    this.canvas.width = CONFIG.canvas.width;
    this.canvas.height = CONFIG.canvas.height;
    this.ctx = this.canvas.getContext('2d');
    
    // Initial resource spawning
    for (let i = 0; i < 5; i++) {
      spawnResource();
    }
    
    this.setupEventListeners();
    this.gameLoop();
  },
  
  setupEventListeners: function() {
    window.addEventListener('keydown', (event) => {
      if (event.key === 'r' && this.gameOver) {
        this.resetGame();
      }
    });
    
    this.canvas.addEventListener('click', (event) => {
      if (this.gameOver) {
        return;
      }
      
      const rect = this.canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      
      // Check if click was on sidebar buttons
      for (let button of this.buttons) {
        if (clickX >= CONFIG.sidebar.x + 10 && 
            clickX <= CONFIG.sidebar.x + 10 + CONFIG.sidebar.buttonWidth &&
            clickY >= button.y &&
            clickY <= button.y + CONFIG.sidebar.buttonHeight) {
          
          // Deselect all buttons first
          for (let b of this.buttons) {
            b.selected = false;
          }
          
          // Select clicked button
          button.selected = true;
          this.selectedEntityType = button.id;
          return;
        }
      }
      
      // Check if click was in the game area
      if (clickX < CONFIG.game.x || clickX > CONFIG.game.x + CONFIG.game.width || 
          clickY < CONFIG.game.y || clickY > CONFIG.game.y + CONFIG.game.height) {
        return;
      }
      
      const baseCenterX = CONFIG.game.x + CONFIG.game.width / 2;
      const baseCenterY = CONFIG.game.y + CONFIG.game.height / 2;
      
      const distToBase = Math.sqrt(
        Math.pow(clickX - baseCenterX, 2) + 
        Math.pow(clickY - baseCenterY, 2)
      );
      
      if (distToBase <= CONFIG.base.radius) {
        const angle = Math.atan2(clickY - baseCenterY, clickX - baseCenterX);
        const entityX = baseCenterX + Math.cos(angle) * (CONFIG.base.radius + 2);
        const entityY = baseCenterY + Math.sin(angle) * (CONFIG.base.radius + 2);
        
        if (this.selectedEntityType === 'builder' && this.buildPoints >= CONFIG.builder.cost) {
          this.builders.push({
            x: entityX,
            y: entityY,
            dx: Math.cos(angle) * CONFIG.builder.speed,
            dy: Math.sin(angle) * CONFIG.builder.speed,
            angle: angle,
            lastBuildCheck: Date.now(),
            originalAngle: angle
          });
          
          this.buildPoints -= CONFIG.builder.cost;
        } else if (this.selectedEntityType === 'hunter' && this.buildPoints >= CONFIG.hunter.cost) {
          this.hunters.push({
            x: entityX,
            y: entityY,
            dx: Math.cos(angle) * CONFIG.hunter.speed,
            dy: Math.sin(angle) * CONFIG.hunter.speed,
            angle: angle,
            targetEnemy: null,
            targetingMode: false,
            returningToBase: false
          });
          
          this.buildPoints -= CONFIG.hunter.cost;
        } else if (this.selectedEntityType === 'gatherer' && this.buildPoints >= CONFIG.gatherer.cost) {
          this.gatherers.push({
            x: entityX,
            y: entityY,
            dx: Math.cos(angle) * CONFIG.gatherer.speed,
            dy: Math.sin(angle) * CONFIG.gatherer.speed,
            angle: angle,
            returningToBase: false,
            hasResource: false,
            targetResource: null,
            targetingResource: false
          });
          
          this.buildPoints -= CONFIG.gatherer.cost;
        }
      }
    });
  },
  
  resetGame: function() {
    this.gameOver = false;
    this.enemies = [];
    this.builders = [];
    this.hunters = [];
    this.gatherers = [];
    this.walls = [];
    this.resources = [];
    this.lastSpawnTime = 0;
    this.lastResourceSpawnTime = 0;
    this.gameStartTime = Date.now();
    this.gameEndTime = 0;
    this.buildPoints = 1000;  // Changed from 300 to 1000
    
    // Initial resource spawning
    for (let i = 0; i < 5; i++) {
      spawnResource();
    }
  },
  
  update: function(timestamp) {
    if (this.gameOver) return;
    
    // Spawn enemies at regular intervals
    if (timestamp - this.lastSpawnTime > CONFIG.enemySpawnRate) {
      spawnEnemy();
      this.lastSpawnTime = timestamp;
    }
    
    // Spawn resources at regular intervals (3x as frequently now)
    if (timestamp - this.lastResourceSpawnTime > CONFIG.resource.spawnInterval) {
      spawnResource();
      this.lastResourceSpawnTime = timestamp;
    }
    
    Entities.updateEnemies();
    Entities.updateBuilders();
    Entities.updateHunters();
    Entities.updateGatherers();
    Entities.updateWalls(); // Added call to update walls
  },
  
  gameLoop: function(timestamp) {
    this.update(timestamp);
    Renderer.render(this.ctx);
    requestAnimationFrame((ts) => this.gameLoop(ts));
  }
};

// Start the game when everything is loaded
window.onload = function() {
  Game.init();
};