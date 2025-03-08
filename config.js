// Game constants
const CONFIG = {
  canvas: {
    width: 800,
    height: 600
  },
  stats: {
    height: 30
  },
  game: {
    x: 20,
    y: 45, // statsHeight + 15
    width: 584, // (800 * 0.78) - 40
    height: 533, // 600 - 30 - 22 (statsHeight - padding)
    radius: 20
  },
  sidebar: {
    x: 624, // game.x + game.width + 20
    y: 45,  // game.y
    width: 156, // canvas.width - sidebar.x - 20
    height: 533, // game.height
    buttonHeight: 60,
    buttonWidth: 136, // sidebar.width - 20
    buttonSpacing: 20
  },
  base: {
    radius: 39 // Math.min(gameWidth, gameHeight) * 0.067
  },
  enemy: {
    radius: 2,
    speed: 0.25
  },
  builder: {
    speed: 0.275, // enemySpeed * 1.1
    size: 4,
    cost: 10
  },
  hunter: {
    speed: 0.2625, // enemySpeed * 1.05
    size: 3,
    cost: 15,
    detectionRadius: 75
  },
  gatherer: {
    speed: 0.225, // enemySpeed * 0.9
    size: 3,
    cost: 5,
    detectionRadius: 75 // Added detectionRadius similar to hunters
  },
  resource: {
    size: 4,
    value: 10,
    spawnInterval: 3333, // Changed from 10000 to 1/3 (3333ms)
    safeZoneRadius: 58.5 // baseRadius * 1.5
  },
  wall: {
    radius: 30,
    arcWidth: Math.PI / 2,
    thickness: 2,
    buildChance: 0.6,
    lifetime: 30000 // 30 seconds in milliseconds
  },
  enemySpawnRate: 1000
};