/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { DimensionMode, PlayerSkin, TrailEffect, ObstacleBarrier, EnergyCoreItem, Particle, GameStats } from "../types";
import { gameAudio } from "../audio";

interface GameBoardProps {
  activeSkin: PlayerSkin;
  activeTrail: TrailEffect;
  currentMode: DimensionMode;
  onGameOver: (score: number, coresCollected: number, maxCombo: number, brainRushesCleared: number) => void;
  onDimensionShift: (newMode: DimensionMode) => void;
  onScoreUpdate: (score: number, combo: number) => void;
  isPaused: boolean;
  onTimerUpdate?: (timeLeft: number) => void;
}

export default function GameBoard({
  activeSkin,
  activeTrail,
  currentMode,
  onGameOver,
  onDimensionShift,
  onScoreUpdate,
  isPaused,
  onTimerUpdate
}: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Core Game State Refs to prevent closure stale states in the high-speed loop
  const stateRef = useRef({
    score: 0,
    coresCollected: 0,
    combo: 0,
    maxCombo: 0,
    brainRushesCleared: 0,
    currentDimension: currentMode,
    playerLane: 2, // 0: Top, 1: Right, 2: Bottom, 3: Left (Start at Bottom)
    laneAngle: Math.PI / 2, // Current visualization angle of lanes (bottom is PI/2)
    targetLaneAngle: Math.PI / 2,
    obstacles: [] as ObstacleBarrier[],
    cores: [] as EnergyCoreItem[],
    particles: [] as Particle[],
    gameTime: 0,
    dimensionTimer: 20.0, // reality shift every 20s
    distanceElapsed: 0,
    speed: 0.005,
    baseSpeed: 0.005,
    shield: 100, // health bar
    screenShake: 0,
    brainRushActive: false,
    brainRushTimer: 0,
    brainRushCount: 0,
    brainRushMaxGates: 4,
    brainRushGatesLeft: 0,
    lastObstacleDistance: 0,
    perfectSlamTimer: 0,
    isMirrorReversed: false,
    colorShiftTimer: 0,
    colorPulse: 0,
    lastReportedDifficulty: "EASY",
    diffAlertTimer: 0
  });

  // Tap overlay visual feedback ref
  const [pulseDirection, setPulseDirection] = useState<string | null>(null);
  const [activeDiffAlert, setActiveDiffAlert] = useState<string | null>(null);

  // Swipe gesture tracking variables
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    stateRef.current.currentDimension = currentMode;
    stateRef.current.isMirrorReversed = currentMode === DimensionMode.MIRROR_DIMENSION;
  }, [currentMode]);

  // Handle Resize beautifully
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Keep canvas square-ish but responsive
      canvasRef.current.width = rect.width;
      canvasRef.current.height = rect.height;
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;

      let rotationDir = 0; // -1 for CCW, 1 for CW
      let explicitLane = -1;

      // Map keys to absolute rotation or lane shifting
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          rotationDir = stateRef.current.isMirrorReversed ? 1 : -1;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          rotationDir = stateRef.current.isMirrorReversed ? -1 : 1;
          break;
        case "ArrowUp":
        case "w":
        case "W":
          // Special quick flip to Top
          explicitLane = 0;
          break;
        case "ArrowDown":
        case "s":
        case "S":
          // Special quick flip to Bottom
          explicitLane = 2;
          break;
        case " ":
          // space bar activates panic shield or special flip
          rotationDir = 2; // Flip 180 degrees
          break;
        default:
          return; // Skip irrelevant keys
      }

      e.preventDefault();
      triggerMove(rotationDir, explicitLane);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPaused]);

  // Touch Swipe processing
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isPaused) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isPaused || !touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = 15; // Lower threshold to capture fast swipes vs taps cleanly

    // If swipe travel is smaller than threshold, it is a clean responsive TAP!
    if (Math.max(absX, absY) < threshold) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const tapX = touch.clientX - rect.left;
        const width = rect.width;
        // Tap left half to rotate CCW, tap right half to rotate CW
        if (tapX < width / 2) {
          const rotationDir = stateRef.current.isMirrorReversed ? 1 : -1;
          triggerMove(rotationDir, -1);
          setPulseDirection("LEFT");
        } else {
          const rotationDir = stateRef.current.isMirrorReversed ? -1 : 1;
          triggerMove(rotationDir, -1);
          setPulseDirection("RIGHT");
        }
        setTimeout(() => setPulseDirection(null), 120);
      }
      touchStartRef.current = null;
      return;
    }

    // Horizontal or Vertical Swipe gesture
    let rotationDir = 0;
    let explicitLane = -1;

    if (absX > absY) {
      if (dx > 0) {
        rotationDir = stateRef.current.isMirrorReversed ? -1 : 1; // Swipe Right
        setPulseDirection("RIGHT");
      } else {
        rotationDir = stateRef.current.isMirrorReversed ? 1 : -1; // Swipe Left
        setPulseDirection("LEFT");
      }
    } else {
      if (dy > 0) {
        explicitLane = 2; // Swipe Down
        setPulseDirection("BOTTOM");
      } else {
        explicitLane = 0; // Swipe Up
        setPulseDirection("TOP");
      }
    }

    setTimeout(() => setPulseDirection(null), 120);
    triggerMove(rotationDir, explicitLane);
    touchStartRef.current = null;
  };

  // Perform Lane / Tunnel rotation logic
  const triggerMove = (rotationDir: number, explicitLane: number) => {
    const s = stateRef.current;
    
    // Play quick tick audio feedback
    gameAudio.triggerSFX("click");

    if (explicitLane !== -1) {
      s.playerLane = explicitLane;
    } else if (rotationDir !== 0) {
      // Rotate active player lane index of 0-3
      // e.g., if rotating CW (+1), lane changes. Adding 4 to handle negative CCW modulo.
      s.playerLane = (s.playerLane + rotationDir + 4) % 4;
    }

    // Set target angle visualization
    // Lane index * 90 degrees in radians (0: Top -> 3PI/2, 1: Right -> 0, 2: Bottom -> PI/2, 3: Left -> PI)
    // To make matching transitions feel silky, we rotate the CAMERA to look at the track.
    // So the active lane visually rotates to the bottom position (PI/2).
    // The target angle becomes: PI/2 - (lane_index * PI/2)
    let indexOffset = 0;
    switch (s.playerLane) {
      case 0: indexOffset = -Math.PI / 2; break; // Top
      case 1: indexOffset = 0; break;            // Right
      case 2: indexOffset = Math.PI / 2; break;  // Bottom
      case 3: indexOffset = Math.PI; break;      // Left
    }
    s.targetLaneAngle = indexOffset;

    // Small flash of trail particles on rotation
    createBurst(3, s.playerLane, 0.05, activeSkin.glowColor, "trail");
  };

  // Spawn visual burst particles
  const createBurst = (
    count: number,
    lane: number,
    distanceRange: number,
    color: string,
    type: "core" | "perfect" | "glitch" | "trail" | "matrix" = "trail"
  ) => {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const baseAngle = lane * (Math.PI / 2);

    for (let i = 0; i < count; i++) {
      const angle = baseAngle + (Math.random() * 0.3 - 0.15) - s.laneAngle;
      const speedMag = Math.random() * 6 + 2;
      s.particles.push({
        x: cx + Math.cos(angle) * (canvas.width * distanceRange),
        y: cy + Math.sin(angle) * (canvas.height * distanceRange),
        vx: Math.cos(angle) * speedMag + (Math.random() * 2 - 1),
        vy: Math.sin(angle) * speedMag + (Math.random() * 2 - 1),
        size: Math.random() * 4 + 2,
        color: color,
        alpha: 1.0,
        life: 0,
        maxLife: Math.random() * 30 + 15,
        type: type
      });
    }
  };

  // Dimensional Procedural generator mapping
  const generateLevelContent = (zDistance: number) => {
    const s = stateRef.current;
    
    // Determine pacing spacing based on difficulty level
    let currentSpacing = 1.20;
    if (s.score >= 9000) currentSpacing = 0.65;
    else if (s.score >= 5500) currentSpacing = 0.78;
    else if (s.score >= 3000) currentSpacing = 0.90;
    else if (s.score >= 1200) currentSpacing = 1.05;

    const minSpacing = s.brainRushActive ? 0.60 : currentSpacing;
    if (zDistance - s.lastObstacleDistance < minSpacing) return;

    s.lastObstacleDistance = zDistance;

    // Determine upcoming gate format
    // A barrier blocks some lanes, leaves others open
    // Generate open gates. Usually 1 open gate is standard, sometimes 2 for high speed.
    const openGateIndex = Math.floor(Math.random() * 4);
    const openGates = [openGateIndex];

    // Rarely, add another open gate to avoid 100% blockades on rapid speeds
    if (Math.random() > 0.8 && !s.brainRushActive) {
      openGates.push((openGateIndex + 2) % 4);
    }

    // Spawn obstacle
    s.obstacles.push({
      id: `barrier_${Date.now()}_${Math.random()}`,
      distance: 1.0, // starts at the far horizon
      speed: s.speed,
      openGates: openGates,
      angle: 0,
      width: 15,
      passed: false
    });

    // Spawn 1-2 floating Energy Core elements on random lanes
    if (Math.random() > 0.4) {
      const coreLane = Math.floor(Math.random() * 4);
      s.cores.push({
        id: `core_${Date.now()}_${Math.random()}`,
        distance: 1.0,
        lane: coreLane,
        collected: false,
        pulseScale: 1.0
      });
    }
  };

  // Core Game Loop Engine
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (timestamp: number) => {
      if (isPaused) {
        lastTime = timestamp;
        animId = requestAnimationFrame(loop);
        return;
      }

      const dt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      updateGame(dt);
      renderGame();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    
    // Start adaptive generative beat instantly
    gameAudio.startAmbientMusic();

    return () => {
      cancelAnimationFrame(animId);
      gameAudio.stopAmbientMusic();
    };
  }, [isPaused, activeSkin, activeTrail]);

  // Update logic: distances, shifts, collisions, powerups
  const updateGame = (dt: number) => {
    const s = stateRef.current;
    
    // 1. Progress time & distance
    s.gameTime += dt;
    const prevSecs = Math.ceil(s.dimensionTimer);
    s.dimensionTimer -= dt;
    const currSecs = Math.ceil(s.dimensionTimer);
    if (prevSecs !== currSecs && onTimerUpdate) {
      onTimerUpdate(Math.max(0, currSecs));
    }
    s.colorShiftTimer += dt;
    s.colorPulse = Math.sin(s.colorShiftTimer * 4) * 0.5 + 0.5;

    // Calculate dynamic difficulty factors frequently based on player's score
    let diffMultiplier = 1.0;
    let difficultyLabel = "EASY";

    if (s.score < 1200) {
      diffMultiplier = 1.0;
      difficultyLabel = "EASY";
    } else if (s.score < 3000) {
      diffMultiplier = 1.22;
      difficultyLabel = "MEDIUM";
    } else if (s.score < 5500) {
      diffMultiplier = 1.45;
      difficultyLabel = "HARD";
    } else if (s.score < 9000) {
      diffMultiplier = 1.70;
      difficultyLabel = "EXPERT";
    } else {
      diffMultiplier = 1.95;
      difficultyLabel = "INSANE";
    }

    // Trigger alert banner when difficulty level increases
    if (difficultyLabel !== s.lastReportedDifficulty) {
      const levels = ["EASY", "MEDIUM", "HARD", "EXPERT", "INSANE"];
      const oldIdx = levels.indexOf(s.lastReportedDifficulty);
      const newIdx = levels.indexOf(difficultyLabel);
      if (newIdx > oldIdx) {
        s.diffAlertTimer = 2.0;
        setActiveDiffAlert(difficultyLabel);
        gameAudio.triggerSFX("perfect");
        s.screenShake = 12;
      }
      s.lastReportedDifficulty = difficultyLabel;
    }

    if (s.diffAlertTimer > 0) {
      s.diffAlertTimer -= dt;
      if (s.diffAlertTimer <= 0) {
        setActiveDiffAlert(null);
      }
    }

    // Highly accessible speed curve: starts slower, but increases genuinely without low limits!
    s.baseSpeed = (0.0035 + (s.score * 0.0000004)) * diffMultiplier;
    s.speed = s.baseSpeed;

    // Adjust speed based on Special Dimensions
    if (s.currentDimension === DimensionMode.TIME_FREEZE) {
      s.speed *= 0.45; // ultra sluggish ease
    } else if (s.currentDimension === DimensionMode.GLITCH_MODE) {
      // glitch speed fluctuations
      s.speed *= (1.0 + Math.sin(s.gameTime * 10) * 0.2);
    } else if (s.brainRushActive) {
      s.speed *= 1.35; // adrenaline boost
    }

    // Accumulate total distance traveled
    s.distanceElapsed += s.speed * 60 * dt;

    // Interpolate lane angle smoothly for visual satisfaction
    // Smooth angle rotating camera
    const angleDiff = s.targetLaneAngle - s.laneAngle;
    s.laneAngle += angleDiff * 0.22; // Quick rubbery response

    // 2. Reality Shift System Trigger (every 20s)
    if (s.dimensionTimer <= 0) {
      s.dimensionTimer = 20.0;
      
      // Select next pseudorandom dimension
      const modes = Object.values(DimensionMode);
      const currentIndex = modes.indexOf(s.currentDimension);
      const nextIndex = (currentIndex + 1) % modes.length;
      const newMode = modes[nextIndex];

      s.currentDimension = newMode;
      gameAudio.triggerSFX("shift");
      onDimensionShift(newMode);

      // Massive particle shift burst
      for (let l = 0; l < 4; l++) {
        createBurst(4, l, 0.1, "#ffffff", "glitch");
      }
    }

    // 3. Brain Rush Spawn Sequencer (Tuned down frequency and enhanced timer)
    if (!s.brainRushActive && s.gameTime > 25 && Math.random() < 0.0008) {
      // Activate Brain Rush!
      s.brainRushActive = true;
      s.brainRushTimer = 5.5; // clear tight gates inside 5.5s (much more forgiving)
      s.brainRushGatesLeft = s.brainRushMaxGates;
      gameAudio.triggerSFX("rush");
      s.screenShake = 4;
    }

    if (s.brainRushActive) {
      s.brainRushTimer -= dt;
      if (s.brainRushTimer <= 0) {
        // Play error sound and penalize shield slightly
        gameAudio.triggerSFX("hit");
        s.shield = Math.max(s.shield - 20, 0);
        s.brainRushActive = false;
        s.combo = 0;
        onScoreUpdate(s.score, 0);

        if (s.shield <= 0) {
          triggerGameOver();
        }
      }
    }

    // Update music intensity context to generate heavy beats
    gameAudio.updateMusicIntensity(s.combo, s.speed / s.baseSpeed, s.currentDimension);

    // 4. Generate incoming elements logically
    generateLevelContent(s.distanceElapsed);

    // 5. Update Obstacles Positions & Collision Checks
    for (let i = s.obstacles.length - 1; i >= 0; i--) {
      const b = s.obstacles[i];
      b.distance -= s.speed * 60 * dt; // approach viewport

      // Smoothly rotate the coming obstacle itself for dynamic kinetic visual cue
      b.angle += dt * 0.5;

      // Check collision when obstacle meets forefront (around distance <= 0.05)
      if (b.distance <= 0.08 && !b.passed) {
        // Verify if player's current lane aligns with the open gate quadrants of the barrier
        // Remember playerLane is 0: Top, 1: Right, 2: Bottom, 3: Left
        const isAligned = b.openGates.includes(s.playerLane);

        if (isAligned) {
          b.passed = true;
          s.score += 250 * (1 + Math.floor(s.combo / 4));
          s.combo += 1;
          s.maxCombo = Math.max(s.maxCombo, s.combo);
          s.perfectSlamTimer = 0.15; // flashes screen green briefly

          // Dual dopamine FX
          if (s.combo % 4 === 0) {
            gameAudio.triggerSFX("perfect");
            s.screenShake = 6;
            createBurst(10, s.playerLane, 0.22, activeSkin.glowColor, "perfect");
          } else {
            gameAudio.triggerSFX("click");
            createBurst(4, s.playerLane, 0.15, "#ffffff", "trail");
          }

          onScoreUpdate(s.score, s.combo);

          // Track Brain Rush clears
          if (s.brainRushActive) {
            s.brainRushGatesLeft -= 1;
            if (s.brainRushGatesLeft <= 0) {
              s.brainRushActive = false;
              s.brainRushesCleared += 1;
              s.score += 1500;
              s.coresCollected += 15;
              gameAudio.triggerSFX("perfect");
              s.screenShake = 15;
              createBurst(20, s.playerLane, 0.35, "#ffd700", "perfect");
              onScoreUpdate(s.score, s.combo);
            }
          }
        } else {
          // Boom! Block hit
          b.passed = true;
          s.shield = Math.max(s.shield - 25, 0);
          s.screenShake = 6; // Reduced shake to keep focus clean
          s.combo = 0;
          gameAudio.triggerSFX("hit");
          createBurst(12, s.playerLane, 0.2, "#ff2a2a", "glitch");
          onScoreUpdate(s.score, 0);

          if (s.shield <= 0) {
            triggerGameOver();
            return;
          }
        }
      }

      // Remove after passing screen backspace boundary
      if (b.distance <= -0.15) {
        s.obstacles.splice(i, 1);
      }
    }

    // 6. Update Core Fragment pickups
    for (let i = s.cores.length - 1; i >= 0; i--) {
      const c = s.cores[i];
      c.distance -= s.speed * 60 * dt;

      // High-spin rotate scaling
      c.pulseScale = 1.0 + Math.sin(s.gameTime * 12 + c.distance * 10) * 0.15;

      // Pickup radius match (near distance 0.08 on the same lane)
      if (c.distance <= 0.12 && c.distance >= 0.01 && c.lane === s.playerLane && !c.collected) {
        c.collected = true;
        
        // Multiplier rewards for rich streaks
        const rate = (s.currentDimension === DimensionMode.GLITCH_MODE) ? 2 : 1;
        s.coresCollected += rate;

        gameAudio.triggerSFX("core");
        s.score += 50;
        onScoreUpdate(s.score, s.combo);

        // Explode sparkly particles
        createBurst(8, c.lane, 0.08, activeSkin.glowColor, "core");
      }

      // Cleanup
      if (c.distance <= -0.05) {
        s.cores.splice(i, 1);
      }
    }

    // 7. Update particles trail physics
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const p = s.particles[i];
      p.life += 1;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha = 1.0 - (p.life / p.maxLife);

      // Dampen velocity to cluster around cube
      p.vx *= 0.96;
      p.vy *= 0.96;

      if (p.life >= p.maxLife) {
        s.particles.splice(i, 1);
      }
    }

    // Generate natural passive visual speed trail depending on effect type
    if (s.gameTime % 0.02 < dt) {
      spawnActiveTrailParticles();
    }

    // Dampen screenshake naturally
    if (s.screenShake > 0) {
      s.screenShake *= 0.9;
      if (s.screenShake < 0.1) s.screenShake = 0;
    }

    if (s.perfectSlamTimer > 0) {
      s.perfectSlamTimer -= dt;
    }
  };

  // Passive ambient trailing
  const spawnActiveTrailParticles = () => {
    const s = stateRef.current;
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const angle = s.playerLane * (Math.PI / 2) - s.laneAngle;
    const distRad = Math.min(canvas.width, canvas.height) * 0.38;

    const spawnX = cx + Math.cos(angle) * distRad;
    const spawnY = cy + Math.sin(angle) * distRad;

    const pCount = activeTrail.particleCount || 2;
    const color = activeTrail.color;

    for (let i = 0; i < pCount; i++) {
      const angleScatter = angle + (Math.random() * 0.2 - 0.1);
      const spread = Math.random() * 2 + 1;
      s.particles.push({
        x: spawnX + (Math.random() * 12 - 6),
        y: spawnY + (Math.random() * 12 - 6),
        vx: -Math.cos(angleScatter) * spread + (Math.random() * 1.5 - 0.75),
        vy: -Math.sin(angleScatter) * spread + (Math.random() * 1.5 - 0.75),
        size: Math.random() * 3 + 1,
        color: color,
        alpha: 0.8,
        life: 0,
        maxLife: Math.random() * 20 + 10,
        type: "trail"
      });
    }
  };

  const triggerGameOver = () => {
    const s = stateRef.current;
    // Massive detonation screen shake
    s.screenShake = 30;
    gameAudio.stopAmbientMusic();
    setTimeout(() => {
      onGameOver(s.score, s.coresCollected, s.maxCombo, s.brainRushesCleared);
    }, 0);
  };

  // HTML5 High Fidelity Neon Graphics Renderer
  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = stateRef.current;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.42;

    // Save state to safely translate screenshake offsets
    ctx.save();
    if (s.screenShake > 0) {
      const shakeX = (Math.random() * 2 - 1) * s.screenShake;
      const shakeY = (Math.random() * 2 - 1) * s.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Establish background colors matching active dimension
    let themePrimary = "#2563eb";
    let themeSecondary = "#f43f5e";
    let bgGradient = ctx.createRadialGradient(cx, cy, 20, cx, cy, radius * 1.5);

    switch (s.currentDimension) {
      case DimensionMode.NEON_MODE:
        themePrimary = "#38bdf8"; // Neon Light Cobalt
        themeSecondary = "#f43f5e"; // Rose Obstacles
        bgGradient.addColorStop(0, "#060914"); // Dark twilight blue neon bleed
        bgGradient.addColorStop(1, "#000000"); // True black
        break;
      case DimensionMode.CYBER_MODE:
        themePrimary = "#10b981"; // Vibrant Emerald Green Core
        themeSecondary = "#f97316"; // Glowing Citrus Orange Barrier
        bgGradient.addColorStop(0, "#020c08"); // Deep dark green matrix bleed
        bgGradient.addColorStop(1, "#000000"); // True black
        break;
      case DimensionMode.DARK_VOID:
        themePrimary = "#64748b"; // Steel Blue
        themeSecondary = "#ef4444"; // Harsh Crimson Red
        bgGradient.addColorStop(0, "#050507"); // Pure pitch black cyber-void
        bgGradient.addColorStop(1, "#000000"); // True black
        break;
      case DimensionMode.GLITCH_MODE:
        themePrimary = "#f43f5e"; // Fuchsia Glitch Core
        themeSecondary = "#3b82f6"; // Sky Cobalt Barrier
        bgGradient.addColorStop(0, "#0d0414"); // Dark violet glitch bleed
        bgGradient.addColorStop(1, "#000000"); // True black
        break;
      case DimensionMode.MIRROR_DIMENSION:
        themePrimary = "#f97316"; // Bright Amber Orange
        themeSecondary = "#06b6d4"; // Cyan Mirror
        bgGradient.addColorStop(0, "#0c0602"); // Dark rust warning bleed
        bgGradient.addColorStop(1, "#000000"); // True black
        break;
      case DimensionMode.TIME_FREEZE:
        themePrimary = "#0ea5e9"; // Frost Cyan
        themeSecondary = "#c084fc"; // Frozen Violet Barrier
        bgGradient.addColorStop(0, "#020a14"); // Deep frozen blue arctic bleed
        bgGradient.addColorStop(1, "#000000"); // True black
        break;
    }

    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, w, h);

    // 2. Clear Screen Shockwave Perfect Hit overlay flash
    if (s.perfectSlamTimer > 0) {
      ctx.fillStyle = `rgba(0, 243, 255, ${s.perfectSlamTimer * 1.5})`;
      ctx.fillRect(0, 0, w, h);
    }

    // 3. Draw ambient 3D Grid Tunnel Concentric wireframes
    // This gives an abstract retro vector depth.
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0; // standard flat tunnel wire lines for perf

    const tunnelRings = 8;
    for (let r = 1; r <= tunnelRings; r++) {
      // Scale logarithmic projection
      const ringDist = ((r - (s.distanceElapsed % 1.0)) / tunnelRings);
      if (ringDist <= 0 || ringDist > 1) continue;

      const ringScale = ringDist * radius;
      
      // Ring opacity fades out standard horizon/margins
      const alpha = Math.min(ringDist * 1.5, 1.0 - ringDist);
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.14})`; // Bright, premium vector lines in the dark!

      // Draw octagonal or standard block rings
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const segAngle = i * (Math.PI / 2) - s.laneAngle;
        const rx = cx + Math.cos(segAngle) * ringScale;
        const ry = cy + Math.sin(segAngle) * ringScale;
        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // 4. Draw diagonal lane dividers dividing Top, Right, Bottom, Left quadrants
    ctx.strokeStyle = `rgba(255, 255, 255, 0.05)`;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const diagAngle = i * (Math.PI / 2) + (Math.PI / 4) - s.laneAngle;
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(diagAngle) * radius * 1.5, cy + Math.sin(diagAngle) * radius * 1.5);
    }
    ctx.stroke();

    // 5. Draw Cyber Green Stream Falling Numbers (Mode-Exclusive Aesthetic)
    if (s.currentDimension === DimensionMode.CYBER_MODE) {
      ctx.fillStyle = "rgba(5, 150, 105, 0.16)";
      ctx.font = "10px monospace";
      for (let i = 0; i < 20; i++) {
        const charAngle = (i / 20) * Math.PI * 2 - s.laneAngle;
        const charRad = radius * (0.2 + (Math.sin(s.gameTime + i) * 0.5 + 0.5) * 0.8);
        const charX = cx + Math.cos(charAngle) * charRad;
        const charY = cy + Math.sin(charAngle) * charRad;
        ctx.fillText(Math.random() > 0.5 ? "1" : "0", charX, charY);
      }
    }

    // 6. Draw Glitch chromatic splits under Glitch Mode
    if (s.currentDimension === DimensionMode.GLITCH_MODE && Math.random() > 0.7) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
      ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 80 + 30, Math.random() * 80 + 30);
      ctx.fillStyle = "rgba(0, 0, 255, 0.4)";
      ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 80 + 30, Math.random() * 80 + 30);
    }

    // 7. Draw Incoming Obstacle Barriers
    s.obstacles.forEach((b) => {
      // Determine projected coordinates
      const scale = Math.pow(1 - b.distance, 2.2); // Exponential tunnel zoom
      if (scale <= 0.01) return;

      const barrierRad = scale * radius * 1.25;
      const opacity = Math.min(scale * 2.2, 1.0);

      // Draw the blockages (non-gate lanes)
      for (let lane = 0; lane < 4; lane++) {
        // Skip if this lane is an open gate
        if (b.openGates.includes(lane)) continue;

        // Draw segmented arc for blockages
        const startRad = lane * (Math.PI / 2) - s.laneAngle - Math.PI / 4;
        const endRad = startRad + Math.PI / 2;

        ctx.save();
        ctx.strokeStyle = themeSecondary;
        ctx.lineWidth = b.width * Math.max(1, scale * 1.5);
        ctx.shadowColor = themeSecondary;
        ctx.shadowBlur = s.currentDimension === DimensionMode.DARK_VOID ? 0 : 12;

        ctx.beginPath();
        ctx.arc(cx, cy, barrierRad, startRad + 0.05, endRad - 0.05);
        ctx.stroke();
        ctx.restore();

        // Under Glitch mode, draw double wireframe lines
        if (s.currentDimension === DimensionMode.GLITCH_MODE) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, barrierRad + 8, startRad + 0.05, endRad - 0.05);
          ctx.stroke();
        }
      }
    });

    // 8. Draw Energy Cores
    s.cores.forEach((c) => {
      if (c.collected) return;
      const scale = Math.pow(1 - c.distance, 2.2);
      if (scale <= 0.01) return;

      const laneAngle = c.lane * (Math.PI / 2) - s.laneAngle;
      const coreRad = scale * radius * 1.25;

      const x = cx + Math.cos(laneAngle) * coreRad;
      const y = cy + Math.sin(laneAngle) * coreRad;

      const visualSize = (Math.random() * 2 + 8) * scale * c.pulseScale;

      ctx.save();
      ctx.fillStyle = themePrimary;
      ctx.shadowColor = themePrimary;
      ctx.shadowBlur = s.currentDimension === DimensionMode.DARK_VOID ? 0 : 15;

      // Draw shiny star/diamond fragment shape
      ctx.beginPath();
      ctx.moveTo(x, y - visualSize);
      ctx.lineTo(x + visualSize * 0.7, y);
      ctx.lineTo(x, y + visualSize);
      ctx.lineTo(x - visualSize * 0.7, y);
      ctx.closePath();
      ctx.fill();

      // Mini core orbit ring
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, visualSize * 1.4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    });

    // 9. Draw interactive Touch Indicator flashes
    if (pulseDirection) {
      let overlayGrad = ctx.createLinearGradient(0, 0, 0, h);
      ctx.fillStyle = `rgba(255, 255, 255, 0.08)`;
      if (pulseDirection === "TOP") {
        ctx.fillRect(0, 0, w, h * 0.25);
      } else if (pulseDirection === "BOTTOM") {
        ctx.fillRect(0, h * 0.75, w, h * 0.25);
      } else if (pulseDirection === "LEFT") {
        ctx.fillRect(0, 0, w * 0.25, h);
      } else if (pulseDirection === "RIGHT") {
        ctx.fillRect(w * 0.75, 0, w * 0.25, h);
      }
    }

    // 10. Draw Particles
    s.particles.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0; // reset

    // 11. Draw Player Glowing Cube (Main kinetic centerpiece)
    const activeAngle = s.playerLane * (Math.PI / 2) - s.laneAngle;
    const playerRadius = radius * 1.25; // fixed forefront radius near outer track boundary
    const px = cx + Math.cos(activeAngle) * playerRadius;
    const py = cy + Math.sin(activeAngle) * playerRadius;

    ctx.save();
    ctx.translate(px, py);
    // Rotate cube to point along track angle for beautiful aerodynamic kinetic feel
    ctx.rotate(activeAngle);

    // Glowing shadow for beautiful neon bleed
    ctx.shadowBlur = s.currentDimension === DimensionMode.DARK_VOID ? 0 : 25;
    ctx.shadowColor = activeSkin.glowColor;

    // Draw custom skin shapes
    ctx.fillStyle = activeSkin.color;
    ctx.strokeStyle = activeSkin.glowColor;
    ctx.lineWidth = 3;

    const size = 26;

    if (activeSkin.shape === "cube") {
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.strokeRect(-size / 2, -size / 2, size, size);

      // Inner details
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.strokeRect(-size / 4, -size / 4, size / 2, size / 2);
    } else if (activeSkin.shape === "octahedron") {
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.65);
      ctx.lineTo(size * 0.65, 0);
      ctx.lineTo(0, size * 0.65);
      ctx.lineTo(-size * 0.65, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // inner structural vectors
      ctx.beginPath();
      ctx.moveTo(-size * 0.65, 0);
      ctx.lineTo(size * 0.65, 0);
      ctx.moveTo(0, -size * 0.65);
      ctx.lineTo(0, size * 0.65);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.stroke();
    } else if (activeSkin.shape === "sphere" || activeSkin.shape === "torus") {
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // spinning core design
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.55, size * 0.2, s.gameTime * 4, 0, Math.PI * 2);
      ctx.stroke();
    } else if (activeSkin.shape === "glitch") {
      // flicker width
      const glitchS = size * (0.8 + Math.random() * 0.4);
      ctx.fillRect(-glitchS / 2, -glitchS / 2, glitchS, glitchS);
      ctx.strokeRect(-glitchS / 2, -glitchS / 2, glitchS, glitchS);

      // horizontal glitch line vectors
      ctx.strokeStyle = "#ff007f";
      ctx.beginPath();
      ctx.moveTo(-size, -size / 3);
      ctx.lineTo(size, -size / 3);
      ctx.moveTo(-size, size / 3);
      ctx.lineTo(size, size / 3);
      ctx.stroke();
    }

    ctx.restore();

    // 12. Draw central tunnel horizon portal core (futuristic vortex center)
    const portalSize = 13 + Math.sin(s.gameTime * 7) * 4;
    ctx.save();
    ctx.fillStyle = s.brainRushActive ? "#ff2a2a" : themePrimary;
    ctx.shadowBlur = s.currentDimension === DimensionMode.DARK_VOID ? 0 : 20;
    ctx.shadowColor = s.brainRushActive ? "#ff2a2a" : themePrimary;

    ctx.beginPath();
    ctx.arc(cx, cy, portalSize, 0, Math.PI * 2);
    ctx.fill();

    // Secondary glowing outer ring
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, portalSize * 1.5, s.gameTime, s.gameTime + Math.PI * 1.1);
    ctx.stroke();
    ctx.restore();

    ctx.restore(); // restore screenshake translate shifts
  };

  return (
    <div
      ref={containerRef}
      id="gameboard-container"
      className="relative w-full h-full flex items-center justify-center select-none overflow-hidden touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D Visual HUD Indicators, Combo flares */}
      {stateRef.current.combo >= 4 && (
        <div 
          id="combo-fever-indicator" 
          className="absolute inset-0 border-[6px] border-glow pointer-events-none rounded-2xl animate-pulse"
          style={{ 
            borderColor: activeSkin.glowColor, 
            opacity: Math.min(stateRef.current.combo * 0.05, 0.4) 
          }}
        />
      )}

      {/* Screen Game core canvas */}
      <canvas
        ref={canvasRef}
        id="shift-loop-canvas"
        className="w-full h-full max-w-lg max-h-lg block rounded-2xl bg-black shadow-2xl"
      />

      {/* Floating Dynamic Difficulty Increased banner */}
      {activeDiffAlert && (
        <div className="absolute inset-x-8 top-1/3 -translate-y-1/2 bg-black/85 border border-amber-500/30 text-white backdrop-blur-xl px-4 py-4 rounded-2xl flex flex-col items-center gap-1.5 animate-bounce z-30 shadow-[0_15px_40px_rgba(245,158,11,0.25)] pointer-events-none">
          <span className="text-[9px] font-mono tracking-[0.25em] text-amber-400 font-extrabold uppercase animate-pulse">✦ SECTOR ELEVATED ✦</span>
          <span className="text-lg font-black font-mono tracking-widest text-white">DIFFICULTY: {activeDiffAlert}</span>
          <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest leading-none mt-0.5">SPEED AND SPACE DENSITIES INCREASED</span>
        </div>
      )}

      {/* Real-time Health bar (Shield overlay inside canvas corner) */}
      <div 
        id="health-overlay" 
        className="absolute top-4 left-4 right-4 flex items-center justify-between"
      >
        <div className="flex flex-col gap-1 w-2/5">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>CORE INTEGRITY</span>
            <span className={stateRef.current.shield < 40 ? "text-red-500 animate-pulse font-bold" : "text-cyan-400"}>
              {stateRef.current.shield}%
            </span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden border border-zinc-700">
            <div
              className={`h-full transition-all duration-150 ${
                stateRef.current.shield < 40 ? "bg-red-500 animate-pulse" : "bg-gradient-to-r from-cyan-400 to-blue-500"
              }`}
              style={{ width: `${stateRef.current.shield}%` }}
            />
          </div>
        </div>

        {/* Reality Shift Timer Counter */}
        <div className="flex flex-col items-end gap-1">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">REALITY SHIFT</span>
          <div className="flex items-center gap-1.5 font-mono text-xs text-white">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-bold">{stateRef.current.dimensionTimer.toFixed(1)}s</span>
          </div>
        </div>
      </div>

      {/* Brain Rush Active Panic Alarm Banner */}
      {stateRef.current.brainRushActive && (
        <div 
          id="brain-rush-alarm-modal" 
          className="absolute inset-x-8 top-16 bg-red-950/90 border border-red-500/50 backdrop-blur-md px-4 py-3 rounded-xl flex flex-col items-center gap-1 animate-bounce"
        >
          <span className="text-red-500 text-xs font-mono font-bold uppercase tracking-widest animate-pulse">
            🚨 BRAIN RUSH TRIGGER!! 🚨
          </span>
          <div className="text-white text-base font-bold flex items-center gap-2">
            <span>RESOLVE {stateRef.current.brainRushGatesLeft} GATES IN:</span>
            <span className="text-red-400 text-lg font-mono font-bold animate-ping">
              {Math.max(0, stateRef.current.brainRushTimer).toFixed(2)}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
