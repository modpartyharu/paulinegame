import { Level, Block, Enemy, Coin } from './types';

const TILE = 40;
const GROUND_Y = 440;

function createGround(startX: number, endX: number): Block[] {
  const blocks: Block[] = [];
  for (let x = startX; x < endX; x += TILE) {
    blocks.push({
      x, y: GROUND_Y, width: TILE, height: TILE * 3,
      velocityX: 0, velocityY: 0,
      type: 'ground', hasItem: false, isHit: false,
    });
  }
  return blocks;
}

function createBrickRow(x: number, y: number, count: number, type: 'brick' | 'question' = 'brick', hasItem = false, itemType?: 'coin' | 'mushroom'): Block[] {
  const blocks: Block[] = [];
  for (let i = 0; i < count; i++) {
    blocks.push({
      x: x + i * TILE, y, width: TILE, height: TILE,
      velocityX: 0, velocityY: 0,
      type: i === Math.floor(count / 2) ? type : 'brick',
      hasItem: i === Math.floor(count / 2) ? hasItem : false,
      itemType: i === Math.floor(count / 2) ? itemType : undefined,
      isHit: false,
    });
  }
  return blocks;
}

function createPipe(x: number, height: number): Block[] {
  const blocks: Block[] = [];
  for (let h = 0; h < height; h++) {
    blocks.push({
      x, y: GROUND_Y - (h + 1) * TILE, width: TILE * 2, height: TILE,
      velocityX: 0, velocityY: 0,
      type: 'pipe', hasItem: false, isHit: false,
    });
  }
  return blocks;
}

export function createLevel(levelNum: number): Level {
  switch (levelNum) {
    case 1: return createLevel1();
    case 2: return createLevel2();
    case 3: return createLevel3();
    default: return createLevel1();
  }
}

function createLevel1(): Level {
  const blocks: Block[] = [
    ...createGround(0, 600),
    ...createGround(680, 1400),
    ...createGround(1480, 3200),

    // Question blocks
    { x: 320, y: 280, width: TILE, height: TILE, velocityX: 0, velocityY: 0, type: 'question', hasItem: true, itemType: 'coin', isHit: false },
    
    ...createBrickRow(400, 280, 5, 'question', true, 'mushroom'),
    
    ...createPipe(560, 2),
    ...createPipe(900, 3),

    { x: 1000, y: 280, width: TILE, height: TILE, velocityX: 0, velocityY: 0, type: 'question', hasItem: true, itemType: 'coin', isHit: false },
    { x: 1040, y: 280, width: TILE, height: TILE, velocityX: 0, velocityY: 0, type: 'question', hasItem: true, itemType: 'coin', isHit: false },

    ...createBrickRow(1200, 200, 4),
    ...createBrickRow(1500, 280, 3, 'question', true, 'coin'),
    
    ...createPipe(1700, 2),
    ...createPipe(2000, 4),

    ...createBrickRow(2200, 280, 6, 'question', true, 'coin'),
    ...createBrickRow(2400, 160, 3),

    // Staircase near flag
    ...Array.from({ length: 5 }, (_, i) => ({
      x: 2700 + i * TILE, y: GROUND_Y - (i + 1) * TILE, width: TILE, height: (i + 1) * TILE,
      velocityX: 0, velocityY: 0,
      type: 'brick' as const, hasItem: false, isHit: false,
    })),
  ];

  const enemies: Enemy[] = [
    { x: 400, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -1, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 800, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -1, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 1300, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -1, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 1600, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -1, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 2100, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -1, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 2300, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -1, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
  ];

  const coins: Coin[] = [
    ...Array.from({ length: 5 }, (_, i) => ({
      x: 700 + i * 30, y: 350, width: 20, height: 24,
      velocityX: 0, velocityY: 0, collected: false, isFloating: true,
    })),
    ...Array.from({ length: 3 }, (_, i) => ({
      x: 1500 + i * 30, y: 350, width: 20, height: 24,
      velocityX: 0, velocityY: 0, collected: false, isFloating: true,
    })),
  ];

  return {
    width: 3200, height: 560,
    blocks, enemies, coins,
    playerStart: { x: 80, y: GROUND_Y - TILE * 2 },
    flagX: 2900,
  };
}

function createLevel2(): Level {
  const blocks: Block[] = [
    ...createGround(0, 400),
    ...createGround(500, 800),
    ...createGround(900, 1200),
    ...createGround(1300, 1600),
    ...createGround(1700, 2100),
    ...createGround(2200, 3400),

    ...createBrickRow(300, 320, 3, 'question', true, 'coin'),
    ...createBrickRow(600, 240, 4, 'question', true, 'mushroom'),
    ...createBrickRow(1000, 300, 2),
    ...createBrickRow(1100, 200, 3, 'question', true, 'coin'),
    ...createPipe(1450, 3),
    ...createBrickRow(1800, 280, 5, 'question', true, 'coin'),
    ...createBrickRow(2000, 180, 3),
    ...createPipe(2500, 2),
    ...createBrickRow(2700, 260, 4, 'question', true, 'mushroom'),

    ...Array.from({ length: 6 }, (_, i) => ({
      x: 3000 + i * TILE, y: GROUND_Y - (i + 1) * TILE, width: TILE, height: (i + 1) * TILE,
      velocityX: 0, velocityY: 0,
      type: 'brick' as const, hasItem: false, isHit: false,
    })),
  ];

  const enemies: Enemy[] = [
    { x: 350, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -1.2, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 650, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -1.2, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 700, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -1.2, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 1100, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -1.5, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 1500, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -1.2, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 1900, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -1.5, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 2400, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -1.2, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 2800, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -1.5, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
  ];

  const coins: Coin[] = [
    ...Array.from({ length: 4 }, (_, i) => ({
      x: 550 + i * 30, y: 380, width: 20, height: 24,
      velocityX: 0, velocityY: 0, collected: false, isFloating: true,
    })),
    ...Array.from({ length: 6 }, (_, i) => ({
      x: 1700 + i * 30, y: 350, width: 20, height: 24,
      velocityX: 0, velocityY: 0, collected: false, isFloating: true,
    })),
  ];

  return {
    width: 3400, height: 560,
    blocks, enemies, coins,
    playerStart: { x: 80, y: GROUND_Y - TILE * 2 },
    flagX: 3200,
  };
}

function createLevel3(): Level {
  const blocks: Block[] = [
    ...createGround(0, 300),
    ...createGround(400, 600),
    ...createGround(700, 900),
    ...createGround(1000, 1300),
    ...createGround(1400, 1600),
    ...createGround(1700, 2000),
    ...createGround(2100, 2500),
    ...createGround(2600, 3600),

    ...createBrickRow(200, 340, 3, 'question', true, 'mushroom'),
    ...createBrickRow(500, 260, 2),
    ...createBrickRow(750, 300, 4, 'question', true, 'coin'),
    ...createPipe(1050, 2),
    ...createBrickRow(1200, 220, 3, 'question', true, 'mushroom'),
    ...createPipe(1500, 4),
    ...createBrickRow(1800, 260, 5, 'question', true, 'coin'),
    ...createBrickRow(2000, 160, 2),
    ...createBrickRow(2200, 300, 3),
    ...createPipe(2700, 3),
    ...createBrickRow(2900, 240, 4, 'question', true, 'mushroom'),
    ...createBrickRow(3100, 180, 3),

    ...Array.from({ length: 7 }, (_, i) => ({
      x: 3300 + i * TILE, y: GROUND_Y - (i + 1) * TILE, width: TILE, height: (i + 1) * TILE,
      velocityX: 0, velocityY: 0,
      type: 'brick' as const, hasItem: false, isHit: false,
    })),
  ];

  const enemies: Enemy[] = [
    { x: 250, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -1.5, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 500, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -1.5, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 550, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -2, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 850, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -1.5, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 1150, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -2, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 1450, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -1.5, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 1800, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -2, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 2300, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -2, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 2800, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -1.5, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
    { x: 3000, y: GROUND_Y - TILE, width: TILE, height: TILE, velocityX: -2, velocityY: 0, type: 'goomba', isAlive: true, direction: -1 },
  ];

  const coins: Coin[] = [
    ...Array.from({ length: 3 }, (_, i) => ({
      x: 420 + i * 30, y: 380, width: 20, height: 24,
      velocityX: 0, velocityY: 0, collected: false, isFloating: true,
    })),
    ...Array.from({ length: 5 }, (_, i) => ({
      x: 1700 + i * 30, y: 340, width: 20, height: 24,
      velocityX: 0, velocityY: 0, collected: false, isFloating: true,
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      x: 2600 + i * 30, y: 360, width: 20, height: 24,
      velocityX: 0, velocityY: 0, collected: false, isFloating: true,
    })),
  ];

  return {
    width: 3600, height: 560,
    blocks, enemies, coins,
    playerStart: { x: 80, y: GROUND_Y - TILE * 2 },
    flagX: 3500,
  };
}
