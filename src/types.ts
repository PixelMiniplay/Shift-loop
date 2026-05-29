/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum DimensionMode {
  NEON_MODE = "NEON",
  CYBER_MODE = "CYBER",
  DARK_VOID = "VOID",
  GLITCH_MODE = "GLITCH",
  MIRROR_DIMENSION = "MIRROR",
  TIME_FREEZE = "FREEZE"
}

export enum GameState {
  MENU = "menu",
  PLAYING = "playing",
  PAUSED = "paused",
  GAME_OVER = "gameover",
  SETTINGS = "settings"
}

export interface DimensionConfig {
  id: DimensionMode;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  trackColor: string;
  gravityFactor: number;
  speedMultiplier: number;
  description: string;
  unlockedAt: number;
}

export interface PlayerSkin {
  id: string;
  name: string;
  description: string;
  color: string;
  glowColor: string;
  price: number;
  unlocked: boolean;
  shape: "cube" | "octahedron" | "sphere" | "torus" | "glitch";
}

export interface TrailEffect {
  id: string;
  name: string;
  description: string;
  color: string;
  particleCount: number;
  type: "sparkle" | "ribbon" | "binary" | "sine" | "starburst";
  price: number;
  unlocked: boolean;
}

export interface GameStats {
  highScore: number;
  totalCores: number;
  lifetimeCoresCollected: number;
  totalGamesPlayed: number;
  maxCombo: number;
  totalBrainRushesCleared: number;
  totalTimePlayed: number;
  lastPlayedAt: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rewardCores: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
  claimed: boolean;
  type: "score" | "cores" | "combo" | "games" | "brainrush" | "time";
}

export interface DailyChallenge {
  id: string;
  description: string;
  rewardCores: number;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  claimed: boolean;
  type: "score_single" | "combo_limit" | "cores_single" | "survival_time";
  expiresAt: number;
}

export interface ObstacleBarrier {
  id: string;
  distance: number;
  speed: number;
  openGates: number[];
  colorNodes?: string[];
  passed: boolean;
  angle: number;
  width: number;
}

export interface EnergyCoreItem {
  id: string;
  distance: number;
  lane: number;
  collected: boolean;
  pulseScale: number;
  multiplier?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type?: "core" | "perfect" | "glitch" | "trail" | "matrix" | "explosion";
}

export interface GameSessionStats {
  score: number;
  coresCollected: number;
  maxCombo: number;
  brainRushesCleared: number;
  isNewHigh: boolean;
  timePlayed: number;
  dimensionsSeen: DimensionMode[];
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  particleCount: number;
}
