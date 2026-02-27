import { GameData, Player, Enemy, Block, Coin, Particle, Item } from './types';

const TILE = 40;

let playerFaceImg: HTMLImageElement | null = null;
let enemyFaceImg: HTMLImageElement | null = null;
let imagesLoaded = false;

export function loadGameImages(playerFaceSrc: string, enemyFaceSrc: string): Promise<void> {
  return new Promise((resolve) => {
    let loaded = 0;
    const checkDone = () => { if (++loaded >= 2) { imagesLoaded = true; resolve(); } };
    playerFaceImg = new Image();
    playerFaceImg.onload = checkDone;
    playerFaceImg.onerror = checkDone;
    playerFaceImg.src = playerFaceSrc;
    enemyFaceImg = new Image();
    enemyFaceImg.onload = checkDone;
    enemyFaceImg.onerror = checkDone;
    enemyFaceImg.src = enemyFaceSrc;
  });
}

export function render(ctx: CanvasRenderingContext2D, game: GameData, canvasWidth: number, canvasHeight: number) {
  const cam = game.cameraX;
  const skyGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  skyGrad.addColorStop(0, '#87CEEB');
  skyGrad.addColorStop(0.7, '#B0E0FF');
  skyGrad.addColorStop(1, '#E8F4FD');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  drawClouds(ctx, cam, canvasWidth);
  drawHills(ctx, cam, canvasWidth, canvasHeight);
  ctx.save();
  ctx.translate(-cam, 0);
  game.level.blocks.forEach(b => {
    if (b.x + b.width > cam - 40 && b.x < cam + canvasWidth + 40) drawBlock(ctx, b);
  });
  game.level.coins.forEach(c => {
    if (!c.collected && c.x + c.width > cam - 20 && c.x < cam + canvasWidth + 20) drawCoin(ctx, c, Date.now());
  });
  drawFlag(ctx, game.level.flagX);
  game.level.enemies.forEach(e => {
    if (e.isAlive && e.x + e.width > cam - 40 && e.x < cam + canvasWidth + 40) drawEnemy(ctx, e);
  });
  if (!game.player.isDead || game.player.velocityY !== 0) drawPlayer(ctx, game.player);
  if (game.items) { game.items.forEach(item => drawItem(ctx, item)); }
  game.particles.forEach(p => drawParticle(ctx, p));
  ctx.restore();
}

function drawClouds(ctx: CanvasRenderingContext2D, cam: number, w: number) {
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  [100,400,750,1100,1500,1900,2300,2700,3100].forEach((cx, i) => {
    const px = cx - cam * 0.2;
    const wrapped = ((px % (w+200)) + w+200) % (w+200) - 100;
    const cy = 60 + (i%3)*40;
    ctx.beginPath(); ctx.ellipse(wrapped, cy, 60, 25, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(wrapped-30, cy+10, 40, 20, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(wrapped+35, cy+8, 45, 22, 0, 0, Math.PI*2); ctx.fill();
  });
}

function drawHills(ctx: CanvasRenderingContext2D, cam: number, w: number, h: number) {
  ctx.fillStyle = '#5DBE5D';
  [0,300,700,1100,1500,1900,2400,2800,3200].forEach((hx, i) => {
    const px = hx - cam*0.3;
    const wrapped = ((px%(w+400)) + w+400) % (w+400) - 200;
    const radius = 80 + (i%3)*40;
    ctx.beginPath(); ctx.ellipse(wrapped, h-80, radius, radius*0.6, 0, 0, Math.PI*2); ctx.fill();
  });
}

function drawBlock(ctx: CanvasRenderingContext2D, block: Block) {
  const { x, y, width, height, type } = block;
  switch (type) {
    case 'ground':
      ctx.fillStyle = '#8B6914'; ctx.fillRect(x, y, width, height);
      ctx.fillStyle = '#6B4F12'; ctx.fillRect(x, y, width, 4);
      ctx.fillStyle = '#3DAA3D'; ctx.fillRect(x, y-4, width, 8);
      break;
    case 'brick':
      ctx.fillStyle = '#C84B31'; ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = '#A33B22'; ctx.lineWidth = 1; ctx.strokeRect(x+1, y+1, width-2, height-2);
      ctx.strokeStyle = '#8B2E1A';
      ctx.beginPath();
      ctx.moveTo(x, y+height/2); ctx.lineTo(x+width, y+height/2);
      ctx.moveTo(x+width/2, y); ctx.lineTo(x+width/2, y+height/2);
      ctx.moveTo(x+width/4, y+height/2); ctx.lineTo(x+width/4, y+height);
      ctx.moveTo(x+width*3/4, y+height/2); ctx.lineTo(x+width*3/4, y+height);
      ctx.stroke();
      break;
    case 'question':
      ctx.fillStyle = block.isHit ? '#8B6914' : '#FFD700'; ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = block.isHit ? '#6B4F12' : '#DAA520'; ctx.lineWidth = 2; ctx.strokeRect(x+1, y+1, width-2, height-2);
      if (!block.isHit) {
        ctx.fillStyle = '#8B4513'; ctx.font = 'bold 20px Fredoka';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('?', x+width/2, y+height/2);
      }
      break;
    case 'pipe':
      ctx.fillStyle = '#2D8B2D'; ctx.fillRect(x, y, width, height);
      ctx.fillStyle = '#3DAA3D'; ctx.fillRect(x+2, y+2, 8, height-4);
      ctx.fillStyle = '#1A6B1A'; ctx.fillRect(x-4, y, width+8, 8);
      break;
  }
}

function drawFemaleBody(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, time: number) {
  const cx = x + width / 2;
  const legAnim = Math.sin(time / 120) * 4;

  // 상체 (분홍 블라우스)
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  (ctx as any).roundRect(cx - 11, y + 2, 22, 20, 5);
  ctx.fill();

  // 스커트
  ctx.fillStyle = '#FF1493';
  ctx.beginPath();
  ctx.moveTo(cx - 11, y + 18);
  ctx.lineTo(cx - 17, y + height - 8);
  ctx.lineTo(cx + 17, y + height - 8);
  ctx.lineTo(cx + 11, y + 18);
  ctx.closePath();
  ctx.fill();

  // 스커트 레이스 장식
  ctx.fillStyle = '#FFB6C1';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(cx - 14 + i * 7, y + height - 8, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 팔
  ctx.fillStyle = '#FFD0C0';
  ctx.fillRect(cx - 16, y + 4, 5, 14);
  ctx.fillRect(cx + 11, y + 4, 5, 14);

  // 다리
  ctx.fillStyle = '#FFD0C0';
  ctx.fillRect(cx - 9 + legAnim, y + height - 8, 7, 10);
  ctx.fillRect(cx + 2 - legAnim, y + height - 8, 7, 10);

  // 신발
  ctx.fillStyle = '#C71585';
  ctx.beginPath();
  (ctx as any).roundRect(cx - 11 + legAnim, y + height + 2, 9, 4, 2);
  ctx.fill();
  ctx.beginPath();
  (ctx as any).roundRect(cx + 2 - legAnim, y + height + 2, 9, 4, 2);
  ctx.fill();

  // 리본 머리핀
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.moveTo(cx - 6, y - 4); ctx.lineTo(cx - 1, y + 2); ctx.lineTo(cx - 6, y + 6); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + 6, y - 4); ctx.lineTo(cx + 1, y + 2); ctx.lineTo(cx + 6, y + 6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#FF1493';
  ctx.beginPath(); ctx.arc(cx, y + 2, 3, 0, Math.PI * 2); ctx.fill();
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player) {
  const { x, y, width, height, facingRight, isInvincible, invincibleTimer } = player;
  const time = Date.now();
  if (isInvincible && Math.floor(invincibleTimer / 5) % 2 === 0) return;

  ctx.save();
  if (!facingRight) {
    ctx.translate(x + width / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(x + width / 2), 0);
  }

  // 여성 아바타 몸체
  drawFemaleBody(ctx, x, y, width, height, time);

  // 얼굴 이미지 - 배경 제거 PNG, 테두리/클립 없음
  if (playerFaceImg && imagesLoaded) {
    const faceW = width + 28;
    const faceH = Math.round(faceW * (playerFaceImg.naturalHeight / playerFaceImg.naturalWidth));
    const faceX = x + width / 2 - faceW / 2;
    const faceY = y - faceH + 8;
    ctx.drawImage(playerFaceImg, faceX, faceY, faceW, faceH);
  } else {
    ctx.fillStyle = '#FFD5B4';
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height / 2 - 4, width / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  const { x, y, width, height } = enemy;
  const time = Date.now();
  const bob = Math.sin(time / 150 + x) * 4;
  const wobble = Math.sin(time / 200 + x * 0.5) * 0.1;
  const legOffset = Math.sin(time / 100 + x) * 3;

  ctx.save();
  ctx.translate(x + width / 2, y + height);
  ctx.rotate(wobble);
  ctx.translate(-(x + width / 2), -(y + height));

  // 다리
  ctx.fillStyle = '#555';
  ctx.fillRect(x + 6 + legOffset, y + height - 6, 10, 6);
  ctx.fillRect(x + width - 16 - legOffset, y + height - 6, 10, 6);

  // 적 이미지 - 배경 제거 PNG, 테두리 없음, bob 애니메이션
  if (enemyFaceImg && imagesLoaded) {
    const imgW = width + 28;
    const imgH = Math.round(imgW * (enemyFaceImg.naturalHeight / enemyFaceImg.naturalWidth));
    const imgX = x + width / 2 - imgW / 2;
    const imgY = y - imgH + height / 2 + bob;
    ctx.drawImage(enemyFaceImg, imgX, imgY, imgW, imgH);
  } else {
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height / 2, width / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawCoin(ctx: CanvasRenderingContext2D, coin: Coin, time: number) {
  const { x, y, width, height } = coin;
  const bob = Math.sin(time / 200 + x) * 3;
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.ellipse(x + width / 2, y + height / 2 + bob, width / 2, height / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#DAA520';
  ctx.font = 'bold 14px Fredoka';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('¢', x + width / 2, y + height / 2 + bob);
}

function drawFlag(ctx: CanvasRenderingContext2D, flagX: number) {
  ctx.fillStyle = '#888'; ctx.fillRect(flagX, 160, 6, 280);
  ctx.fillStyle = '#FFD700';
  ctx.beginPath(); ctx.arc(flagX + 3, 160, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FF4444';
  ctx.beginPath();
  ctx.moveTo(flagX + 6, 165); ctx.lineTo(flagX + 50, 185); ctx.lineTo(flagX + 6, 205);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#FFD700';
  ctx.font = '16px serif'; ctx.textAlign = 'center';
  ctx.fillText('★', flagX + 26, 192);
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.globalAlpha = Math.max(0, p.life / 30);
  ctx.fillStyle = p.color;
  ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  ctx.globalAlpha = 1;
}

export function renderHUD(ctx: CanvasRenderingContext2D, player: Player, currentLevel: number) {
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, ctx.canvas.width, 44);
  ctx.fillStyle = '#fff';
  ctx.font = '14px "Press Start 2P", cursive';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${player.score}`, 16, 28);
  ctx.fillText(`COINS: ${player.coins}`, 220, 28);
  ctx.fillText(`LIVES: ${'♥'.repeat(player.lives)}`, 420, 28);
  ctx.textAlign = 'right';
  ctx.fillText(`WORLD ${currentLevel}-1`, ctx.canvas.width - 16, 28);
}

// ✅ 아이템 그리기 (코인/버섯)
function drawItem(ctx: CanvasRenderingContext2D, item: Item) {
  if (item.collected) return;
  const { x, y, width, height, type } = item;
  const cx = x + width / 2;
  const cy = y + height / 2;

  if (type === 'coin') {
    // 빛나는 코인
    ctx.save();
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(cx, cy, width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFA500';
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('¢', cx, cy);
    ctx.restore();
  } else if (type === 'mushroom') {
    // 버섯 몸통
    ctx.save();
    ctx.shadowColor = '#FF69B4';
    ctx.shadowBlur = 12;
    // 줄기
    ctx.fillStyle = '#FFD0C0';
    ctx.fillRect(cx - 8, cy, 16, height / 2);
    // 갓 (반원)
    ctx.fillStyle = '#FF1493';
    ctx.beginPath();
    ctx.arc(cx, cy, width / 2, Math.PI, 0);
    ctx.fill();
    // 갓 무늬 점
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx - 7, cy - 4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 7, cy - 4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy - 10, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}
