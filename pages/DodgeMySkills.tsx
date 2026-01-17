
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { SKILLS, SKILL_LOGOS } from '../constants';
import { Projectile, Player, LeaderboardEntry } from '../types';
import { getTopEntries, saveLeaderboardEntry, isHighScore, formatDate } from '../utils/leaderboard';

// ============================================
// GAME CONSTANTS - Edit values here
// ============================================

// Canvas & Entity Sizes
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const PLAYER_SIZE = 20;
const PROJECTILE_SIZE = 25;

// Player Settings
const PLAYER_SPEED = 5;

// Projectile Speed Settings (Linear Scaling)
const BASE_SPEED = 2;                    // Base projectile speed
const SPEED_INCREASE_PER_SCORE = 0.005;    // Speed increase per displayed score point (speed = BASE_SPEED + (displayScore * this))

// Accuracy Settings (Linear Scaling)
const INITIAL_ACCURACY = 0.75;           // Starting accuracy (0.5 = 50% accurate, 1.0 = 100% accurate)
const ACCURACY_INCREASE_PER_SCORE = 0.0005; // Accuracy increase per displayed score point (higher = faster accuracy increase)

// Spawn Rate Settings (Linear Scaling)
const BASE_SPAWN_INTERVAL = 2000;        // Starting spawn interval in ms (higher = slower spawns)
const MIN_SPAWN_INTERVAL = 300;          // Minimum spawn interval in ms (lower = faster max rate)
const SPAWN_DECREASE_PER_SCORE = 5;     // Spawn interval decrease per displayed score point (interval = max(MIN, BASE - (displayScore * this)))

const DodgeMySkills: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [encounteredSkills, setEncounteredSkills] = useState<Set<string>>(new Set());
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  
  // Game State Refs (to avoid re-renders during loop)
  const playerRef = useRef<Player>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    radius: PLAYER_SIZE,
    speed: PLAYER_SPEED
  });
  
  const projectilesRef = useRef<Projectile[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastSpawnTimeRef = useRef<number>(0);
  const spawnIntervalRef = useRef<number>(BASE_SPAWN_INTERVAL);
  const gameStartedRef = useRef<boolean>(false);
  const gameOverRef = useRef<boolean>(false);
  const scoreRef = useRef<number>(0); // Track score synchronously for use in game loop
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map()); // Store loaded logo images

  const spawnProjectile = useCallback(() => {
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;
    
    // Use scoreRef for current score value (synchronous, always up-to-date)
    const currentScore = scoreRef.current;
    // Use displayed score (divided by 10) for calculations to match what's shown to user
    const displayScore = Math.floor(currentScore / 10);
    
    // Speed increases linearly over time based on displayed score
    // Formula: BASE_SPEED + (displayScore * SPEED_INCREASE_PER_SCORE)
    const speed = BASE_SPEED + (displayScore * SPEED_INCREASE_PER_SCORE);
    
    const skill = SKILLS[Math.floor(Math.random() * SKILLS.length)];
    
    // Calculate accuracy: starts at INITIAL_ACCURACY, increases linearly towards 1 as score increases
    // Formula: INITIAL_ACCURACY + (displayScore * ACCURACY_INCREASE_PER_SCORE), capped at 1.0
    const accuracy = Math.min(INITIAL_ACCURACY + (displayScore * ACCURACY_INCREASE_PER_SCORE), 1.0);
    // Track encountered skills
    setEncounteredSkills(prev => new Set([...prev, skill.name]));

    // Set spawn position based on side
    switch (side) {
      case 0: // Top
        x = Math.random() * CANVAS_WIDTH;
        y = -PROJECTILE_SIZE;
        break;
      case 1: // Right
        x = CANVAS_WIDTH + PROJECTILE_SIZE;
        y = Math.random() * CANVAS_HEIGHT;
        break;
      case 2: // Bottom
        x = Math.random() * CANVAS_WIDTH;
        y = CANVAS_HEIGHT + PROJECTILE_SIZE;
        break;
      default: // Left
        x = -PROJECTILE_SIZE;
        y = Math.random() * CANVAS_HEIGHT;
        break;
    }

    // Get player position
    const player = playerRef.current;
    const dx = player.x - x;
    const dy = player.y - y;
    const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
    
    // Console log projectile spawn details
    console.log('🎯 Projectile Spawn:', {
      displayScore: displayScore,
      rawScore: currentScore,
      speed: speed.toFixed(2),
      accuracy: (accuracy * 100).toFixed(1) + '%'
    });
    
    // Calculate accurate direction (towards player)
    const accurateDirX = dx / distanceToPlayer;
    const accurateDirY = dy / distanceToPlayer;
    
    // Generate random direction
    const randomAngle = Math.random() * Math.PI * 2;
    const randomDirX = Math.cos(randomAngle);
    const randomDirY = Math.sin(randomAngle);
    
    // Mix accurate and random directions based on accuracy
    // accuracy=0.5 means 50% accurate, 50% random
    // accuracy=1.0 means 100% accurate (perfect aim)
    const finalDirX = accuracy * accurateDirX + (1 - accuracy) * randomDirX;
    const finalDirY = accuracy * accurateDirY + (1 - accuracy) * randomDirY;
    
    // Normalize and multiply by speed
    const dirLength = Math.sqrt(finalDirX * finalDirX + finalDirY * finalDirY);
    const vx = (finalDirX / dirLength) * speed;
    const vy = (finalDirY / dirLength) * speed;

    projectilesRef.current.push({
      x, y, vx, vy,
      radius: PROJECTILE_SIZE,
      skillName: skill.name,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.1
    });
  }, []); // No dependencies - uses scoreRef.current for current score

  const update = useCallback(() => {
    if (gameOverRef.current || !gameStartedRef.current) return;

    // Move Player
    const p = playerRef.current;
    
    // Check if any keyboard keys are pressed
    const hasKeyInput = keysRef.current['w'] || keysRef.current['W'] || 
                        keysRef.current['s'] || keysRef.current['S'] ||
                        keysRef.current['a'] || keysRef.current['A'] ||
                        keysRef.current['d'] || keysRef.current['D'] ||
                        keysRef.current['ArrowUp'] || keysRef.current['ArrowDown'] ||
                        keysRef.current['ArrowLeft'] || keysRef.current['ArrowRight'];
    
    // Keyboard movement takes priority (WASD or Arrow keys)
    if (hasKeyInput) {
      if (keysRef.current['w'] || keysRef.current['W'] || keysRef.current['ArrowUp']) p.y -= p.speed;
      if (keysRef.current['s'] || keysRef.current['S'] || keysRef.current['ArrowDown']) p.y += p.speed;
      if (keysRef.current['a'] || keysRef.current['A'] || keysRef.current['ArrowLeft']) p.x -= p.speed;
      if (keysRef.current['d'] || keysRef.current['D'] || keysRef.current['ArrowRight']) p.x += p.speed;
      // Clear mouse movement when using keyboard
      mouseRef.current = null;
    } else if (mouseRef.current) {
      // Mouse movement only when no keyboard input
      const dx = mouseRef.current.x - p.x;
      const dy = mouseRef.current.y - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 2) { // Small threshold to prevent jitter
        const moveDistance = Math.min(p.speed, distance);
        p.x += (dx / distance) * moveDistance;
        p.y += (dy / distance) * moveDistance;
      }
    }

    // Clamp Player
    p.x = Math.max(p.radius, Math.min(CANVAS_WIDTH - p.radius, p.x));
    p.y = Math.max(p.radius, Math.min(CANVAS_HEIGHT - p.radius, p.y));

    // Update Projectiles
    projectilesRef.current.forEach((proj, index) => {
      proj.x += proj.vx;
      proj.y += proj.vy;
      proj.rotation += proj.rotationSpeed;

      // Collision Check (Circle-to-Circle)
      const dist = Math.sqrt((proj.x - p.x) ** 2 + (proj.y - p.y) ** 2);
      if (dist < proj.radius + p.radius - 5) {
        gameOverRef.current = true;
        setGameOver(true);
      }
    });

    // Remove off-screen projectiles
    projectilesRef.current = projectilesRef.current.filter(proj => 
      proj.x > -100 && proj.x < CANVAS_WIDTH + 100 &&
      proj.y > -100 && proj.y < CANVAS_HEIGHT + 100
    );

    // Spawn projectiles with linearly increasing frequency over time
    // Spawn interval decreases linearly from BASE_SPAWN_INTERVAL to MIN_SPAWN_INTERVAL
    // Formula: max(MIN_SPAWN_INTERVAL, BASE_SPAWN_INTERVAL - (displayScore * SPAWN_DECREASE_PER_SCORE))
    const currentTime = Date.now();
    const currentScore = scoreRef.current; // Use ref for current score
    const displayScore = Math.floor(currentScore / 10); // Use displayed score for calculations
    const newSpawnInterval = Math.max(MIN_SPAWN_INTERVAL, BASE_SPAWN_INTERVAL - (displayScore * SPAWN_DECREASE_PER_SCORE));
    
    // Log spawn rate when it changes (rounded to nearest 50ms to reduce spam)
    if (Math.abs(spawnIntervalRef.current - newSpawnInterval) > 50) {
      const spawnsPerSecond = (1000 / newSpawnInterval).toFixed(2);
      console.log('📈 Spawn Rate Update:', {
        displayScore: displayScore,
        rawScore: currentScore,
        spawnInterval: newSpawnInterval + 'ms',
        spawnsPerSecond: spawnsPerSecond + '/sec',
        projectilesOnScreen: projectilesRef.current.length
      });
    }
    spawnIntervalRef.current = newSpawnInterval;
    
    if (currentTime - lastSpawnTimeRef.current > spawnIntervalRef.current) {
      spawnProjectile();
      lastSpawnTimeRef.current = currentTime;
    }

    // Update score synchronously in ref and asynchronously in state
    scoreRef.current += 1;
    setScore(prev => prev + 1);
    draw();
    animationFrameRef.current = requestAnimationFrame(update);
  }, [gameOver, gameStarted, spawnProjectile]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Boundary
    ctx.strokeStyle = '#52543e22';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Player
    ctx.fillStyle = '#52543e';
    ctx.beginPath();
    ctx.arc(playerRef.current.x, playerRef.current.y, playerRef.current.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw Projectiles
    projectilesRef.current.forEach(proj => {
      ctx.save();
      ctx.translate(proj.x, proj.y);
      ctx.rotate(proj.rotation);
      
      // Draw logo image if loaded, otherwise draw a circle as fallback
      const img = imagesRef.current.get(proj.skillName);
      if (img && img.complete) {
        const size = proj.radius * 2;
        ctx.drawImage(img, -proj.radius, -proj.radius, size, size);
      } else {
        // Fallback: draw a circle
        ctx.fillStyle = '#52543e';
        ctx.beginPath();
        ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    });
  };

  // Load logo images on component mount
  useEffect(() => {
    // Clear existing images to force reload
    imagesRef.current.clear();
    
    const loadImages = () => {
      SKILLS.forEach(skill => {
        const logoUrl = SKILL_LOGOS[skill.name];
        if (logoUrl) {
          // Try loading with crossOrigin first (for CORS-enabled sources)
          const img = new Image();
          
          // Some external sites like Wikimedia Commons support CORS, others don't
          // We'll try with crossOrigin first, then fallback if it fails
          const tryLoadWithCORS = () => {
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              imagesRef.current.set(skill.name, img);
            };
            img.onerror = () => {
              // If CORS fails, try without crossOrigin (works for same-origin or no-CORS images)
              const imgNoCORS = new Image();
              imgNoCORS.onload = () => {
                imagesRef.current.set(skill.name, imgNoCORS);
              };
              imgNoCORS.onerror = () => {
                console.warn(`Failed to load logo for ${skill.name} from ${logoUrl}`);
              };
              // Remove crossOrigin attribute for retry
              imgNoCORS.src = logoUrl;
            };
            img.src = logoUrl;
          };
          
          tryLoadWithCORS();
        }
      });
    };
    loadImages();
  }, []); // Load once on mount - if you change URLs, refresh the page or remount component

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Prevent default for arrow keys to avoid scrolling (only when game is active)
      if (gameStartedRef.current && !gameOverRef.current && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
      }
      keysRef.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      // Don't capture keys if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      keysRef.current[e.key] = false;
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };
    
    const handleMouseLeave = () => {
      mouseRef.current = null;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const startGame = () => {
    gameOverRef.current = false;
    gameStartedRef.current = true;
    setGameOver(false);
    scoreRef.current = 0;
    setScore(0);
    setGameStarted(true);
    setEncounteredSkills(new Set());
    projectilesRef.current = [];
    mouseRef.current = null;
    const now = Date.now();
    lastSpawnTimeRef.current = now;
    spawnIntervalRef.current = BASE_SPAWN_INTERVAL;
    playerRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      radius: PLAYER_SIZE,
      speed: PLAYER_SPEED
    };
    
    // Console log initial game state
    console.log('🎮 Game Started:', {
      initialSpawnInterval: spawnIntervalRef.current + 'ms',
      initialSpawnsPerSecond: (1000 / spawnIntervalRef.current).toFixed(2) + '/sec',
      initialAccuracy: (INITIAL_ACCURACY * 100).toFixed(0) + '%',
      baseSpeed: BASE_SPEED,
      playerSpeed: playerRef.current.speed,
      playerPosition: `(${playerRef.current.x}, ${playerRef.current.y})`,
      canvasSize: `${CANVAS_WIDTH}x${CANVAS_HEIGHT}`
    });
    
    // Draw immediately and then start the loop
    draw();
    animationFrameRef.current = requestAnimationFrame(update);
  };

  const encounteredSkillsList: string[] = Array.from(encounteredSkills).sort() as string[];

  // Check if score is a high score when game ends
  useEffect(() => {
    const checkHighScore = async () => {
      if (gameOver && score > 0) {
        const displayScore = Math.floor(score / 10);
        const isHigh = await isHighScore(displayScore);
        if (isHigh) {
          setShowNameInput(true);
        }
      }
    };
    checkHighScore();
  }, [gameOver, score]);

  // Load leaderboard when component mounts
  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoadingLeaderboard(true);
      try {
        const entries = await getTopEntries();
        setLeaderboard(entries);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoadingLeaderboard(false);
      }
    };
    loadLeaderboard();
  }, []);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate: must be exactly 2 letters
    const initials = playerName.trim().toUpperCase();
    if (initials.length === 2 && /^[A-Z]{2}$/.test(initials)) {
      const displayScore = Math.floor(score / 10);
      try {
        await saveLeaderboardEntry({
          name: initials,
          score: displayScore,
          timestamp: Date.now(),
          skillsEncountered: encounteredSkillsList,
        });
        // Reload leaderboard after saving
        const entries = await getTopEntries();
        setLeaderboard(entries);
        setShowNameInput(false);
        setPlayerName('');
      } catch (error) {
        console.error('Error saving leaderboard entry:', error);
      }
    }
  };

  const handleStartGame = () => {
    setShowNameInput(false);
    setPlayerName('');
    startGame();
  };

  return (
    <Layout>
      <div className="w-full flex flex-col items-center">
        <div className="pt-4 sm:pt-8 md:pt-12 mb-6 sm:mb-8 w-full max-w-2xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 sm:mb-8 italic border-b border-darkOlive/20 pb-4 text-center">
            Skills
          </h1>
        </div>
        <div className="flex flex-col items-center gap-6 sm:gap-8 w-full px-4 sm:px-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full max-w-[1200px] mx-auto">
          {/* Row 1: Score and Leaderboard Heading */}
          <div className="space-y-1 md:col-span-2">
            <h2 className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase opacity-50">Score</h2>
            <p className="text-2xl sm:text-3xl font-mono">{Math.floor(score / 10)}</p>
          </div>
          <div className="flex items-end justify-end md:justify-start">
            <h2 className="text-xl sm:text-2xl font-bold italic">Leaderboard</h2>
          </div>

          {/* Row 2: Game Window */}
          <div className="flex flex-col items-center gap-4 w-full md:col-span-2">
            <div className="relative border-2 border-darkOlive/10 bg-offWhite overflow-hidden w-full max-w-full" style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}>
          <canvas 
            ref={canvasRef} 
            width={CANVAS_WIDTH} 
            height={CANVAS_HEIGHT}
            className="block cursor-none w-full h-full"
            style={{ maxWidth: '100%', height: 'auto' }}
          />

          {(!gameStarted || gameOver) && (
            <div className="absolute inset-0 bg-offWhite/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center animate-in fade-in duration-500 overflow-y-auto">
              {gameOver ? (
                <>
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 italic">Defeated</h3>               
                  <p className="mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl font-mono">Final Score: {Math.floor(score / 10)}</p>
                  
                  {showNameInput && (
                    <form onSubmit={handleNameSubmit} className="mb-4 sm:mb-6 max-w-sm w-full px-4">
                      <p className="text-xs sm:text-sm mb-2 sm:mb-3 opacity-70">High Score! Enter your initials:</p>
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => {
                          // Only allow letters and limit to 2 characters
                          const inputValue = e.target.value;
                          const filteredValue = inputValue.replace(/[^a-zA-Z]/g, '');
                          const upperValue = filteredValue.toUpperCase();
                          const limitedValue = upperValue.slice(0, 2);
                          setPlayerName(limitedValue);
                        }}
                        placeholder="AA"
                        maxLength={2}
                        className="w-full px-3 sm:px-4 py-2 border border-darkOlive/20 bg-offWhite text-darkOlive mb-2 sm:mb-3 focus:outline-none focus:border-darkOlive/50 text-center text-xl sm:text-2xl font-bold tracking-wider"
                        style={{ textTransform: 'uppercase' }}
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={playerName.length !== 2}
                        className="w-full px-4 sm:px-6 py-2 bg-darkOlive text-offWhite hover:bg-opacity-90 transition-all uppercase tracking-[0.2em] text-[10px] sm:text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit
                      </button>
                    </form>
                  )}
                  
                  {encounteredSkillsList.length > 0 && (
                    <div className="mb-6 sm:mb-8 max-w-md px-4">
                      <h4 className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase opacity-50 mb-3 sm:mb-4">Skills Encountered</h4>
                      <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                        {encounteredSkillsList.map((skillName) => {
                          const skill = SKILLS.find(s => s.name === skillName);
                          return (
                            <div
                              key={skillName}
                              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-darkOlive/20 bg-offWhite/50"
                            >
                              {skill?.icon}
                              <span className="text-xs sm:text-sm font-medium">{skillName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* <h3 className="text-5xl font-bold mb-4 italic">Skills</h3> */}
                  <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 opacity-70 max-w-md px-4">Dodge my skills using WASD, arrow keys, or your mouse.</p>
                </>
              )}
              <button 
                onClick={handleStartGame}
                className="px-8 sm:px-12 py-3 sm:py-4 bg-darkOlive text-offWhite hover:bg-opacity-90 hover:scale-105 transition-all uppercase tracking-[0.3em] text-[10px] sm:text-xs font-bold"
              >
                {gameOver ? 'Try Again' : 'Play'}
              </button>
            </div>
          )}
            </div>
          </div>

          {/* Row 2: Leaderboard Box */}
          <div className="w-full flex flex-col">
            <div className="border border-darkOlive/10 bg-offWhite/50 p-4 sm:p-6 flex-1">
              {leaderboard.length === 0 ? (
                <p className="text-center text-xs sm:text-sm opacity-60 py-6 sm:py-8">No scores yet. Be the first!</p>
              ) : (
                <div className="space-y-1">
                  {leaderboard.slice(0, 10).map((entry, index) => (
                    <div
                      key={`${entry.timestamp}-${index}`}
                      className="flex items-center justify-between py-1 sm:py-1.5 border-b border-darkOlive/10 last:border-0"
                    >
                        <div className="flex items-center gap-2 sm:gap-4">
                          <span className="text-xs sm:text-sm font-bold opacity-50 w-5 sm:w-6 text-right">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm sm:text-base font-medium">{entry.name}</p>
                            <p className="text-[10px] sm:text-xs opacity-50">{formatDate(entry.timestamp)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-base sm:text-lg font-mono font-bold">{entry.score}</p>
                          {/* {entry.skillsEncountered.length > 0 && (
                            <p className="text-xs opacity-50">{entry.skillsEncountered.length} skills</p>
                          )} */}
                        </div>
                      </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default DodgeMySkills;
