import { GameData, Player, Particle, Item } from './types';
import { createLevel } from './levels';

const GRAVITY = 0.5;
const JUMP_FORCE = -14;
const MOVE_SPEED = 4;
const MAX_FALL_SPEED = 12;
const TILE = 40;

export function createPlayer(x: number, y: number): Player {
  return {
    x, y, width: TILE, height: TILE,
    velocityX: 0, velocityY: 0,
    isJumping: false, isOnGround: false,
    lives: 3, score: 0, coins: 0,
    isBig: false, isInvincible: false, invincibleTimer: 0,
    facingRight: true, isDead: false,
  };
}

export function createGameData(): GameData {
  const level = createLevel(1);
  return {
    state: 'title',
    player: createPlayer(level.playerStart.x, level.playerStart.y),
    level,
    currentLevel: 1,
    cameraX: 0,
    particles: [],
    items: [], // ✅ 추가
    keys: new Set(),
  };
}

export function startLevel(game: GameData, levelNum: number) {
  game.currentLevel = levelNum;
  game.level = createLevel(levelNum);
  game.player.x = game.level.playerStart.x;
  game.player.y = game.level.playerStart.y;
  game.player.velocityX = 0;
  game.player.velocityY = 0;
  game.player.isDead = false;
  game.player.isInvincible = false;
  game.player.invincibleTimer = 0;
  game.cameraX = 0;
  game.particles = [];
  game.items = []; // ✅ 추가
  game.state = 'playing';
}

export function update(game: GameData, canvasWidth: number) {
  if (game.state !== 'playing') return;

  const p = game.player;
  if (p.isDead) {
    p.velocityY += GRAVITY;
    p.y += p.velocityY;
    if (p.y > 600) {
      p.lives--;
      if (p.lives <= 0) {
        game.state = 'gameover';
      } else {
        startLevel(game, game.currentLevel);
      }
    }
    return;
  }

  // Input
  if (game.keys.has('ArrowLeft') || game.keys.has('a')) {
    p.velocityX = -MOVE_SPEED;
    p.facingRight = false;
  } else if (game.keys.has('ArrowRight') || game.keys.has('d')) {
    p.velocityX = MOVE_SPEED;
    p.facingRight = true;
  } else {
    p.velocityX *= 0.8;
    if (Math.abs(p.velocityX) < 0.3) p.velocityX = 0;
  }

  if ((game.keys.has('ArrowUp') || game.keys.has('w') || game.keys.has(' ')) && p.isOnGround) {
    p.velocityY = JUMP_FORCE;
    p.isJumping = true;
    p.isOnGround = false;
  }

  // Gravity
  p.velocityY += GRAVITY;
  if (p.velocityY > MAX_FALL_SPEED) p.velocityY = MAX_FALL_SPEED;

  // Move X
  p.x += p.velocityX;
  if (p.x < 0) p.x = 0;

  // Collide X with blocks
  p.isOnGround = false;
  for (const block of game.level.blocks) {
    if (block.type === 'invisible') continue;
    if (rectsOverlap(p.x, p.y, p.width, p.height, block.x, block.y, block.width, block.height)) {
      if (p.velocityX > 0) p.x = block.x - p.width;
      else if (p.velocityX < 0) p.x = block.x + block.width;
      p.velocityX = 0;
    }
  }

  // Move Y
  p.y += p.velocityY;

  // Collide Y with blocks
  for (const block of game.level.blocks) {
    if (block.type === 'invisible') continue;
    if (rectsOverlap(p.x, p.y, p.width, p.height, block.x, block.y, block.width, block.height)) {
      if (p.velocityY > 0) {
        p.y = block.y - p.height;
        p.velocityY = 0;
        p.isOnGround = true;
        p.isJumping = false;
      } else if (p.velocityY < 0) {
        p.y = block.y + block.height;
        p.velocityY = 0;

        // ✅ ? 박스 히트 → 아이템 스폰
        if (block.type === 'question' && !block.isHit) {
          block.isHit = true;
          if (block.hasItem && block.itemType) {
            spawnItem(game, block.x, block.y, block.itemType);
          }
        }
      }
    }
  }

  // Fall off
  if (p.y > 560) {
    p.isDead = true;
    p.velocityY = JUMP_FORCE;
    return;
  }

  // Invincibility
  if (p.isInvincible) {
    p.invincibleTimer--;
    if (p.invincibleTimer <= 0) p.isInvincible = false;
  }

  // ✅ 아이템 업데이트 (중력, 이동, 플레이어 충돌)
  updateItems(game);

  // Enemies
  for (const enemy of game.level.enemies) {
    if (!enemy.isAlive) continue;
    enemy.x += enemy.velocityX * enemy.direction;
    let onGround = false;
    for (const block of game.level.blocks) {
      if (block.type === 'invisible') continue;
      if (rectsOverlap(enemy.x, enemy.y, enemy.width, enemy.height, block.x, block.y, block.width, block.height)) {
        if (enemy.velocityY >= 0) { enemy.y = block.y - enemy.height; onGround = true; }
      }
      if (rectsOverlap(enemy.x + enemy.velocityX * enemy.direction, enemy.y - 2, enemy.width, enemy.height - 4, block.x, block.y, block.width, block.height)) {
        enemy.direction *= -1;
      }
    }
    if (!onGround) enemy.y += 3;
    if (enemy.y > 560) { enemy.isAlive = false; continue; }
    if (rectsOverlap(p.x + 4, p.y + 4, p.width - 8, p.height - 8, enemy.x + 4, enemy.y + 4, enemy.width - 8, enemy.height - 8)) {
      if (p.velocityY > 0 && p.y + p.height - 10 < enemy.y + enemy.height / 2) {
        enemy.isAlive = false;
        p.velocityY = JUMP_FORCE * 0.6;
        p.score += 200;
        spawnParticles(game, enemy.x + 20, enemy.y, '#FF4444', 6);
      } else if (!p.isInvincible) {
        p.isDead = true;
        p.velocityY = JUMP_FORCE;
      }
    }
  }

  // Coins
  for (const coin of game.level.coins) {
    if (coin.collected) continue;
    if (rectsOverlap(p.x, p.y, p.width, p.height, coin.x, coin.y, coin.width, coin.height)) {
      coin.collected = true;
      p.coins++;
      p.score += 50;
      spawnParticles(game, coin.x + 10, coin.y, '#FFD700', 4);
    }
  }

  // Flag
  if (p.x + p.width > game.level.flagX && p.x < game.level.flagX + 20) {
    p.score += 1000;
    if (game.currentLevel >= 3) game.state = 'win';
    else game.state = 'levelComplete';
  }

  // Camera
  const targetCam = p.x - canvasWidth / 3;
  game.cameraX += (targetCam - game.cameraX) * 0.1;
  if (game.cameraX < 0) game.cameraX = 0;
  if (game.cameraX > game.level.width - canvasWidth) game.cameraX = game.level.width - canvasWidth;

  // Particles
  game.particles = game.particles.filter(pt => {
    pt.x += pt.velocityX;
    pt.y += pt.velocityY;
    pt.velocityY += 0.15;
    pt.life--;
    return pt.life > 0;
  });
}

// ✅ 아이템 스폰 함수
function spawnItem(game: GameData, blockX: number, blockY: number, type: 'coin' | 'mushroom') {
  const item: Item = {
    x: blockX + 5,
    y: blockY - 36,
    width: 30,
    height: 30,
    velocityX: type === 'mushroom' ? 1.5 : 0,
    velocityY: -6, // 위로 튀어오름
    type,
    collected: false,
    bounceTimer: 20,
  };
  game.items.push(item);
  spawnParticles(game, blockX + 20, blockY - 10, type === 'coin' ? '#FFD700' : '#FF69B4', 6);
}

// ✅ 아이템 물리 & 충돌 처리
function updateItems(game: GameData) {
  const p = game.player;
  const GROUND_Y = 440;

  game.items = game.items.filter(item => {
    if (item.collected) return false;

    // 중력
    item.velocityY += GRAVITY;
    if (item.velocityY > MAX_FALL_SPEED) item.velocityY = MAX_FALL_SPEED;

    item.x += item.velocityX;
    item.y += item.velocityY;

    // 블록 충돌
    for (const block of game.level.blocks) {
      if (block.type === 'invisible') continue;
      if (rectsOverlap(item.x, item.y, item.width, item.height, block.x, block.y, block.width, block.height)) {
        if (item.velocityY > 0) {
          item.y = block.y - item.height;
          item.velocityY = 0;
        }
        // 버섯은 벽에 닿으면 방향 반전
        if (item.type === 'mushroom') {
          if (item.velocityX > 0 && item.x + item.width > block.x && item.x < block.x) {
            item.velocityX *= -1;
          } else if (item.velocityX < 0 && item.x < block.x + block.width && item.x + item.width > block.x + block.width) {
            item.velocityX *= -1;
          }
        }
      }
    }

    // 맵 밖으로 떨어지면 제거
    if (item.y > 600) return false;

    // 플레이어 충돌 → 획득
    if (rectsOverlap(p.x, p.y, p.width, p.height, item.x, item.y, item.width, item.height)) {
      item.collected = true;
      if (item.type === 'coin') {
        p.coins++;
        p.score += 100;
        spawnParticles(game, item.x + 15, item.y, '#FFD700', 8);
      } else if (item.type === 'mushroom') {
        p.score += 500;
        p.isInvincible = true;
        p.invincibleTimer = 300;
        spawnParticles(game, item.x + 15, item.y, '#FF69B4', 12);
      }
      return false;
    }

    return true;
  });
}

function rectsOverlap(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number): boolean {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function spawnParticles(game: GameData, x: number, y: number, color: string, count: number) {
  for (let i = 0; i < count; i++) {
    game.particles.push({
      x, y,
      velocityX: (Math.random() - 0.5) * 6,
      velocityY: -Math.random() * 5 - 2,
      life: 30 + Math.random() * 20,
      color,
      size: 3 + Math.random() * 4,
    });
  }
}
