import React, { useRef, useEffect, useCallback, useState } from 'react';
import { createGameData, update, startLevel } from '../game/engine';
import { render, renderHUD, loadGameImages } from '../game/renderer';
import { GameData } from '../game/types';
import playerFace from '@/assets/player-face.png';
import enemyFace from '@/assets/enemy-face.png';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 560;

const PaulineGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameData>(createGameData());
  const animFrameRef = useRef<number>(0);
  const [gameState, setGameState] = useState<string>('title');
  const [imagesReady, setImagesReady] = useState(false);

  useEffect(() => {
    loadGameImages(playerFace, enemyFace).then(() => setImagesReady(true));
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const game = gameRef.current;
    update(game, CANVAS_WIDTH);
    render(ctx, game, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    if (game.state === 'playing') {
      renderHUD(ctx, game.player, game.currentLevel);
    }

    if (game.state !== gameState) {
      setGameState(game.state);
    }

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState]);

  useEffect(() => {
    if (!imagesReady) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase() === ' ' ? ' ' : e.key;
      gameRef.current.keys.add(key);
      
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase() === ' ' ? ' ' : e.key;
      gameRef.current.keys.delete(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameLoop, imagesReady]);

  const handleStart = () => {
    const game = gameRef.current;
    startLevel(game, 1);
    setGameState('playing');
    canvasRef.current?.focus();
  };

  const handleNextLevel = () => {
    const game = gameRef.current;
    startLevel(game, game.currentLevel + 1);
    setGameState('playing');
    canvasRef.current?.focus();
  };

  const handleRestart = () => {
    gameRef.current = createGameData();
    const game = gameRef.current;
    startLevel(game, 1);
    setGameState('playing');
    canvasRef.current?.focus();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-6 p-4">
      <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-border">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          tabIndex={0}
          className="block outline-none"
          style={{ imageRendering: 'auto' }}
        />

        {/* Title Screen Overlay */}
        {gameState === 'title' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-primary/90 to-secondary/90 backdrop-blur-sm">
            <h1 className="font-pixel text-accent text-2xl md:text-3xl mb-2 drop-shadow-lg animate-bounce">
              ✨ PAULINE'S ✨
            </h1>
            <h2 className="font-pixel text-primary-foreground text-xl md:text-2xl mb-8 drop-shadow-lg">
              ADVENTURE
            </h2>
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-accent mb-8 shadow-lg">
              <img src={playerFace} alt="Pauline" className="w-full h-full object-cover" />
            </div>
            <button
              onClick={handleStart}
              className="font-pixel text-sm bg-accent text-accent-foreground px-8 py-4 rounded-lg hover:scale-110 transition-transform shadow-lg animate-pulse"
            >
              START GAME
            </button>
            <p className="font-pixel text-[10px] text-primary-foreground/70 mt-6">
              ARROW KEYS / WASD TO MOVE • SPACE TO JUMP
            </p>
          </div>
        )}

        {/* Level Complete Overlay */}
        {gameState === 'levelComplete' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/80 backdrop-blur-sm">
            <h2 className="font-pixel text-accent text-2xl mb-4 drop-shadow-lg">
              LEVEL CLEAR! 🎉
            </h2>
            <p className="font-pixel text-secondary-foreground text-sm mb-2">
              SCORE: {gameRef.current.player.score}
            </p>
            <p className="font-pixel text-secondary-foreground text-sm mb-8">
              COINS: {gameRef.current.player.coins}
            </p>
            <button
              onClick={handleNextLevel}
              className="font-pixel text-sm bg-accent text-accent-foreground px-8 py-4 rounded-lg hover:scale-110 transition-transform shadow-lg"
            >
              NEXT LEVEL →
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/80 backdrop-blur-sm">
            <h2 className="font-pixel text-destructive-foreground text-2xl mb-4">
              GAME OVER 💀
            </h2>
            <p className="font-pixel text-destructive-foreground text-sm mb-8">
              FINAL SCORE: {gameRef.current.player.score}
            </p>
            <button
              onClick={handleRestart}
              className="font-pixel text-sm bg-accent text-accent-foreground px-8 py-4 rounded-lg hover:scale-110 transition-transform shadow-lg"
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {/* Win Overlay */}
        {gameState === 'win' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-accent/80 backdrop-blur-sm">
            <h2 className="font-pixel text-accent-foreground text-2xl mb-4">
              🏆 YOU WIN! 🏆
            </h2>
            <p className="font-pixel text-accent-foreground text-sm mb-2">
              FINAL SCORE: {gameRef.current.player.score}
            </p>
            <p className="font-pixel text-accent-foreground text-sm mb-8">
              COINS: {gameRef.current.player.coins}
            </p>
            <button
              onClick={handleRestart}
              className="font-pixel text-sm bg-primary text-primary-foreground px-8 py-4 rounded-lg hover:scale-110 transition-transform shadow-lg"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="flex gap-4 md:hidden">
        <button
          onTouchStart={() => gameRef.current.keys.add('ArrowLeft')}
          onTouchEnd={() => gameRef.current.keys.delete('ArrowLeft')}
          className="font-pixel text-lg bg-card text-card-foreground w-16 h-16 rounded-xl shadow-lg active:scale-95"
        >
          ←
        </button>
        <button
          onTouchStart={() => gameRef.current.keys.add(' ')}
          onTouchEnd={() => gameRef.current.keys.delete(' ')}
          className="font-pixel text-lg bg-accent text-accent-foreground w-16 h-16 rounded-xl shadow-lg active:scale-95"
        >
          ↑
        </button>
        <button
          onTouchStart={() => gameRef.current.keys.add('ArrowRight')}
          onTouchEnd={() => gameRef.current.keys.delete('ArrowRight')}
          className="font-pixel text-lg bg-card text-card-foreground w-16 h-16 rounded-xl shadow-lg active:scale-95"
        >
          →
        </button>
      </div>

      <p className="font-pixel text-[10px] text-muted-foreground hidden md:block">
        ← → MOVE • ↑ / SPACE JUMP • STOMP ENEMIES TO DEFEAT THEM
      </p>
    </div>
  );
};

export default PaulineGame;
