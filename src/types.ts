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
  unlockedAt: number; // core cost or score milstone
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
  type: "score" | "cores" | "combo" | "games" | "brainrush";
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
}

export interface ObstacleBarrier {
  id: string;
  distance: number; // Distance in tunnel length units
  speed: number;
  openGates: number[]; // Index 0-3 corresponding to tracks (0: Top/Up, 1: Right, 2: Bottom, 3: Left)
  colorNodes?: string[]; // Lane-specific colors if matching required
  passed: boolean;
  angle: number; // Current rotation angle in radians for animations
  width: number;
}

export interface EnergyCoreItem {
  id: string;
  distance: number;
  lane: number; // 0-3
  collected: boolean;
  pulseScale: number;
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
  type?: "core" | "perfect" | "glitch" | "trail" | "matrix";
}
