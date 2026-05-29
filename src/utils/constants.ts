/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Game constants and configuration
 */

export const GAME_CONFIG = {
  // Core mechanics
  INITIAL_SHIELD: 100,
  SHIELD_HIT_DAMAGE: 25,
  BRAIN_RUSH_DAMAGE: 20,
  BRAIN_RUSH_TIME_LIMIT: 5.5,
  BRAIN_RUSH_GATES: 4,
  BRAIN_RUSH_SPAWN_TIME: 25,
  BRAIN_RUSH_SPAWN_CHANCE: 0.0008,

  // Scoring
  BASE_GATE_SCORE: 250,
  COMBO_MULTIPLIER: 4,
  CORE_BASE_SCORE: 50,
  BRAIN_RUSH_CLEAR_BONUS: 1500,
  BRAIN_RUSH_CORE_REWARD: 15,

  // Difficulty scaling
  DIFFICULTY_THRESHOLDS: {
    EASY: { score: 0, multiplier: 1.0 },
    MEDIUM: { score: 1200, multiplier: 1.22 },
    HARD: { score: 3000, multiplier: 1.45 },
    EXPERT: { score: 5500, multiplier: 1.70 },
    INSANE: { score: 9000, multiplier: 1.95 }
  },

  // Speed progression
  BASE_SPEED: 0.0035,
  SPEED_GROWTH_FACTOR: 0.0000004,
  
  // Level generation
  SPACING: {
    EASY: 1.20,
    MEDIUM: 1.05,
    HARD: 0.90,
    EXPERT: 0.78,
    INSANE: 0.65,
    BRAIN_RUSH_MIN: 0.60
  },

  // Dimension shifts
  DIMENSION_SHIFT_INTERVAL: 20,

  // Timing
  SCREEN_SHAKE_DURATION: 0.18,
  PERFECT_HIT_FLASH_DURATION: 0.15,
  PARTICLE_SPAWN_INTERVAL: 0.02,
  DIFFICULTY_ALERT_DURATION: 2.0
} as const;

export const VISUAL_CONFIG = {
  // Canvas
  MIN_RADIUS: 0.42,
  TUNNEL_RINGS: 8,
  LANE_COUNT: 4,

  // Player
  PLAYER_SIZE: 26,
  PLAYER_RADIUS_MULTIPLIER: 1.25,

  // Obstacles
  OBSTACLE_COLLISION_DISTANCE: 0.08,
  OBSTACLE_WIDTH: 15,

  // Cores
  CORE_PICKUP_DISTANCE: 0.12,
  CORE_MIN_DISTANCE: 0.01,
  CORE_PULSE_SPEED: 12,
  CORE_SIZE_MIN: 8,
  CORE_SIZE_MAX: 10,

  // Particles
  PARTICLE_SPAWN_DISTANCE: 0.38,
  PARTICLE_LIFE_MIN: 15,
  PARTICLE_LIFE_MAX: 30,
  PARTICLE_DECAY: 0.96
} as const;

export const AUDIO_CONFIG = {
  // Master volumes
  MASTER_VOLUME: 0.8,
  MUSIC_VOLUME: 0.3,
  SFX_VOLUME: 0.5,

  // Music
  BASE_BPM: 124,
  COMBO_BPM_INCREMENT: 1.5,
  MAX_BPM_ADDITION: 30,

  // Bass frequencies
  BASE_FREQUENCIES: {
    NEON: 55, // A1
    CYBER: 48.99, // G1
    DARK_VOID: 41.20, // E1
    GLITCH: 58.27, // A#1
    MIRROR: 65.41, // C2
    TIME_FREEZE: 36.71 // D1
  }
} as const;

export const ACHIEVEMENT_THRESHOLDS = {
  CYBER_ROOKIE: 3000,
  INFINITY_DRIFTER: 12000,
  HARVEST_SECTOR: 100,
  DOPAMINE_OVERDRIVE: 8,
  BRAIN_CATALYST: 3
} as const;

export const SHOP_PRICES = {
  SKIN_HEX_OCTA: 30,
  SKIN_CYBER_SPHERE: 75,
  SKIN_VOID: 150,
  SKIN_GLITCH: 250,
  SKIN_GOLD: 500,

  TRAIL_PLASMA: 25,
  TRAIL_BINARY: 60,
  TRAIL_COSMIC: 120
} as const;

export const GAME_MODES = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
  EXPERT: "EXPERT",
  INSANE: "INSANE"
} as const;

export const PARTICLE_TYPES = ["core", "perfect", "glitch", "trail", "matrix", "explosion"] as const;
