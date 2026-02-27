export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
}

export interface Player extends Entity {
  isJumping: boolean;
  isOnGround: boolean;
  lives: number;
  score: number;
  coins: number;
  isBig: boolean;
  isInvincible: boolean;
  invincibleTimer: number;
  facingRight: boolean;
  isDead: boolean;
}

export interface Enemy extends Entity {
  type: 'goomba' | 'koopa' | 'piranha';
  isAlive: boolean;
  direction: number;
}

export interface Block extends Entity {
  type: 'brick' | 'question' | 'ground' | 'pipe' | 'invisible';
  hasItem: boolean;
  itemType?: 'coin' | 'mushroom';
  isHit: boolean;
}

export interface Coin extends Entity {
  collected: boolean;
  isFloating: boolean;
}

// ✅ 새로 추가: 박스에서 떨어지는 아이템
export interface Item extends Entity {
  type: 'coin' | 'mushroom';
  collected: boolean;
  bounceTimer: number; // 위로 튀어오르는 애니메이션용
}

export interface Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  color: string;
  size: number;
}

export interface Level {
  width: number;
  height: number;
  blocks: Block[];
  enemies: Enemy[];
  coins: Coin[];
  playerStart: Vector2D;
  flagX: number;
}

export type GameState = 'title' | 'playing' | 'gameover' | 'win' | 'levelComplete';

export interface GameData {
  state: GameState;
  player: Player;
  level: Level;
  currentLevel: number;
  cameraX: number;
  particles: Particle[];
  items: Item[]; // ✅ 추가
  keys: Set<string>;
}
