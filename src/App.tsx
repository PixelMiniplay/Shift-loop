/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { DimensionMode, PlayerSkin, TrailEffect, GameStats, Achievement, DailyChallenge, DimensionConfig } from "./types";
import GameBoard from "./components/GameBoard";
import HUD from "./components/HUD";
import Shop from "./components/Shop";
import MainMenu from "./components/MainMenu";
import GameOver from "./components/GameOver";
import SettingsPanel from "./components/SettingsPanel";
import { gameAudio } from "./audio";
import { Sparkles, Trophy, Star, Settings, Award } from "lucide-react";

// Setup Dimension configs mapping primary/secondary cyber aesthetics
const DIMENSION_CONFIGS: Record<DimensionMode, DimensionConfig> = {
  [DimensionMode.NEON_MODE]: {
    id: DimensionMode.NEON_MODE,
    name: "Neon Zone",
    primaryColor: "#00f3ff",
    secondaryColor: "#ff007f",
    backgroundColor: "#060814",
    trackColor: "rgba(0, 243, 255, 0.2)",
    gravityFactor: 1.0,
    speedMultiplier: 1.0,
    description: "The baseline cyber reality grid. Balanced speed and clean patterns.",
    unlockedAt: 0
  },
  [DimensionMode.CYBER_MODE]: {
    id: DimensionMode.CYBER_MODE,
    name: "Matrix Rain",
    primaryColor: "#39ff14",
    secondaryColor: "#005500",
    backgroundColor: "#010802",
    trackColor: "rgba(57, 255, 20, 0.2)",
    gravityFactor: 1.1,
    speedMultiplier: 1.15,
    description: "Digital green rain falling in perspective depths. Score values increased.",
    unlockedAt: 0
  },
  [DimensionMode.DARK_VOID]: {
    id: DimensionMode.DARK_VOID,
    name: "Void Wireframe",
    primaryColor: "#ffffff",
    secondaryColor: "#333333",
    backgroundColor: "#030303",
    trackColor: "rgba(255, 255, 255, 0.15)",
    gravityFactor: 1.0,
    speedMultiplier: 1.1,
    description: "Minimalist black-and-white visual nodes. Dark synth rhythmic bass.",
    unlockedAt: 0
  },
  [DimensionMode.GLITCH_MODE]: {
    id: DimensionMode.GLITCH_MODE,
    name: "Acid Glitch",
    primaryColor: "#ff004f",
    secondaryColor: "#7e00ff",
    backgroundColor: "#09010a",
    trackColor: "rgba(255, 0, 79, 0.25)",
    gravityFactor: 1.35,
    speedMultiplier: 1.3,
    description: "Extreme speed fluctuations and screen disruptions. 2X Cores drop!",
    unlockedAt: 0
  },
  [DimensionMode.MIRROR_DIMENSION]: {
    id: DimensionMode.MIRROR_DIMENSION,
    name: "Mirror Prism",
    primaryColor: "#ff7700",
    secondaryColor: "#00ffcc",
    backgroundColor: "#04090b",
    trackColor: "rgba(255, 119, 0, 0.2)",
    gravityFactor: 1.0,
    speedMultiplier: 1.05,
    description: "REVERSED STEERING CONTROLS! Watch out for reverse-direction slides.",
    unlockedAt: 0
  },
  [DimensionMode.TIME_FREEZE]: {
    id: DimensionMode.TIME_FREEZE,
    name: "Cryo Chills",
    primaryColor: "#00d9ff",
    secondaryColor: "#200062",
    backgroundColor: "#02070f",
    trackColor: "rgba(0, 217, 255, 0.15)",
    gravityFactor: 0.5,
    speedMultiplier: 0.5,
    description: "Icy blue slow motion matrices. Collect dense core caches comfortably.",
    unlockedAt: 0
  }
};

// Initial state helpers
const INITIAL_STATS: GameStats = {
  highScore: 0,
  totalCores: 0,
  lifetimeCoresCollected: 0,
  totalGamesPlayed: 0,
  maxCombo: 0,
  totalBrainRushesCleared: 0,
  totalTimePlayed: 0,
  lastPlayedAt: 0
};

const DEFAULT_SKINS: PlayerSkin[] = [
  { id: "skin_neon", name: "Core Cyan", description: "Classic grid block", color: "#00f3ff", glowColor: "#00a2ff", price: 0, unlocked: true, shape: "cube" },
  { id: "skin_hex", name: "Hex Octa", description: "High-energy diamond shell", color: "#ff007f", glowColor: "#ff00ea", price: 30, unlocked: false, shape: "octahedron" },
  { id: "skin_cyber", name: "Cyber Sphere", description: "Matrix telemetry node", color: "#39ff14", glowColor: "#27b50d", price: 75, unlocked: false, shape: "sphere" },
  { id: "skin_void", name: "Ring Singularity", description: "Vortex gravitational orb", color: "#ad00ff", glowColor: "#e600ff", price: 150, unlocked: false, shape: "torus" },
  { id: "skin_glitch", name: "Glitch Matrix", description: "Unstable split chromatic pixel", color: "#ffff00", glowColor: "#ff5100", price: 250, unlocked: false, shape: "glitch" },
  { id: "skin_gold", name: "Luxury Relic", description: "VIP solid gold brushed vector", color: "#ffd700", glowColor: "#fff2a2", price: 500, unlocked: false, shape: "cube" }
];

const DEFAULT_TRAILS: TrailEffect[] = [
  { id: "trail_default", name: "Cyan Star", description: "Simple velocity dust", color: "#00f3ff", particleCount: 2, type: "sparkle", price: 0, unlocked: true },
  { id: "trail_pink", name: "Plasma Ribbon", description: "High-intensity magenta tail", color: "#ff007f", particleCount: 4, type: "ribbon", price: 25, unlocked: false },
  { id: "trail_green", name: "Binary Matrix", description: "Code digits dropping vectors", color: "#39ff14", particleCount: 3, type: "binary", price: 60, unlocked: false },
  { id: "trail_gold", name: "Cosmic Spark", description: "Bursting luxurious golden sparks", color: "#ffd700", particleCount: 5, type: "starburst", price: 120, unlocked: false }
];

export default function App() {
  const [activeScreen, setActiveScreen] = useState<"menu" | "playing" | "gameover">("menu");
  const [isPaused, setIsPaused] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // States
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [skins, setSkins] = useState<PlayerSkin[]>(DEFAULT_SKINS);
  const [trails, setTrails] = useState<TrailEffect[]>(DEFAULT_TRAILS);
  
  const [activeSkinId, setActiveSkinId] = useState("skin_neon");
  const [activeTrailId, setActiveTrailId] = useState("trail_default");
  
  // Game Session Live variables
  const [liveScore, setLiveScore] = useState(0);
  const [liveCombo, setLiveCombo] = useState(0);
  const [liveCores, setLiveCores] = useState(0);
  const [currentMode, setCurrentMode] = useState<DimensionMode>(DimensionMode.NEON_MODE);
  const [shiftTimeLeft, setShiftTimeLeft] = useState(20);
  
  const [sessionEndStats, setSessionEndStats] = useState({
    score: 0,
    cores: 0,
    maxCombo: 0,
    brainRushesCleared: 0,
    isNewHigh: false
  });

  const [graphicQuality, setGraphicQuality] = useState<"high" | "low">("high");

  // Achievements List
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: "ach_score_1", title: "Cyber Rookie", description: "Accumulate 3,000 points in one loop.", rewardCores: 40, progress: 0, maxProgress: 3000, completed: false, claimed: false, type: "score" },
    { id: "ach_score_2", title: "Infinity Drifter", description: "Reach 12,000 points in a single session.", rewardCores: 100, progress: 0, maxProgress: 12000, completed: false, claimed: false, type: "score" },
    { id: "ach_cores_1", title: "Harvest Sector", description: "Collect 100 total glowing energy cores.", rewardCores: 50, progress: 0, maxProgress: 100, completed: false, claimed: false, type: "cores" },
    { id: "ach_combo_1", title: "Dopamine Overdrive", description: "Acquire a high-octane 8x combo multi.", rewardCores: 60, progress: 0, maxProgress: 8, completed: false, claimed: false, type: "combo" },
    { id: "ach_rush_1", title: "Brain Catalyst", description: "Neutralize 3 emergency Brain Rushes.", rewardCores: 80, progress: 0, maxProgress: 3, completed: false, claimed: false, type: "brainrush" }
  ]);

  // Daily Challenges list
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([
    { id: "day_score", description: "Earn 2,500 points in a single game", rewardCores: 30, targetCount: 2500, currentCount: 0, completed: false, claimed: false, type: "score_single", expiresAt: 0 },
    { id: "day_combo", description: "Achieve a 6x Combo perfect chain", rewardCores: 25, targetCount: 6, currentCount: 0, completed: false, claimed: false, type: "combo_limit", expiresAt: 0 },
    { id: "day_harvest", description: "Amass 35 total energy cores across loops", rewardCores: 40, targetCount: 35, currentCount: 0, completed: false, claimed: false, type: "cores_single", expiresAt: 0 }
  ]);

  // Load state on startup
  useEffect(() => {
    try {
      const storedStats = localStorage.getItem("shiftloop_stats");
      const storedSkins = localStorage.getItem("shiftloop_skins");
      const storedTrails = localStorage.getItem("shiftloop_trails");
      const storedActiveSkin = localStorage.getItem("shiftloop_active_skin");
      const storedActiveTrail = localStorage.getItem("shiftloop_active_trail");
      const storedAchievements = localStorage.getItem("shiftloop_ach_v2");
      const storedChallenges = localStorage.getItem("shiftloop_challenges_v2");
      const storedQuality = localStorage.getItem("shiftloop_quality");

      if (storedStats) setStats(JSON.parse(storedStats));
      if (storedSkins) setSkins(JSON.parse(storedSkins));
      if (storedTrails) setTrails(JSON.parse(storedTrails));
      if (storedActiveSkin) setActiveSkinId(storedActiveSkin);
      if (storedActiveTrail) setActiveTrailId(storedActiveTrail);
      if (storedAchievements) setAchievements(JSON.parse(storedAchievements));
      if (storedChallenges) setDailyChallenges(JSON.parse(storedChallenges));
      if (storedQuality) setGraphicQuality(storedQuality as "high" | "low");
    } catch (e) {
      console.warn("Failed to retrieve LocalStorage grid context", e);
    }
  }, []);

  // Sync to database Local Storage
  const saveState = (
    newStats: GameStats,
    newSkins = skins,
    newTrails = trails,
    newAch = achievements,
    newChall = dailyChallenges
  ) => {
    try {
      localStorage.setItem("shiftloop_stats", JSON.stringify(newStats));
      localStorage.setItem("shiftloop_skins", JSON.stringify(newSkins));
      localStorage.setItem("shiftloop_trails", JSON.stringify(newTrails));
      localStorage.setItem("shiftloop_ach_v2", JSON.stringify(newAch));
      localStorage.setItem("shiftloop_challenges_v2", JSON.stringify(newChall));
    } catch (e) {
      console.warn("Failed to write game states to local index");
    }
  };

  const handleStartGame = () => {
    setLiveScore(0);
    setLiveCombo(0);
    setLiveCores(0);
    setCurrentMode(DimensionMode.NEON_MODE);
    setIsPaused(false);
    setActiveScreen("playing");
  };

  const handleScoreUpdate = (score: number, combo: number) => {
    setLiveScore(score);
    setLiveCombo(combo);
  };

  const handleDimensionShift = (newMode: DimensionMode) => {
    setCurrentMode(newMode);
  };

  const handlePauseToggle = () => {
    gameAudio.triggerSFX("click");
    setIsPaused((prev) => !prev);
  };

  const handleGameOver = (
    finalScore: number,
    coresGathered: number,
    maxCombo: number,
    brainRushesCleared: number
  ) => {
    const isNewHigh = finalScore > stats.highScore;
    const nextHighScore = isNewHigh ? finalScore : stats.highScore;

    const nextStats: GameStats = {
      highScore: nextHighScore,
      totalCores: stats.totalCores + coresGathered,
      lifetimeCoresCollected: stats.lifetimeCoresCollected + coresGathered,
      totalGamesPlayed: stats.totalGamesPlayed + 1,
      maxCombo: Math.max(stats.maxCombo, maxCombo),
      totalBrainRushesCleared: stats.totalBrainRushesCleared + brainRushesCleared,
      totalTimePlayed: stats.totalTimePlayed + 0,
      lastPlayedAt: Date.now()
    };

    setStats(nextStats);

    // Update achievements progress
    const updatedAch = achievements.map((ach) => {
      if (ach.completed) return ach;
      let progress = ach.progress;

      if (ach.type === "score") progress = Math.max(ach.progress, finalScore);
      if (ach.type === "cores") progress = Math.min(ach.maxProgress, ach.progress + coresGathered);
      if (ach.type === "combo") progress = Math.max(ach.progress, maxCombo);
      if (ach.type === "brainrush") progress = Math.min(ach.maxProgress, ach.progress + brainRushesCleared);

      const completed = progress >= ach.maxProgress;
      return { ...ach, progress, completed };
    });

    // Update daily challenges progress
    const updatedChall = dailyChallenges.map((chall) => {
      if (chall.completed) return chall;
      let currentCount = chall.currentCount;

      if (chall.type === "score_single") currentCount = Math.max(chall.currentCount, finalScore);
      if (chall.type === "combo_limit") currentCount = Math.max(chall.currentCount, maxCombo);
      if (chall.type === "cores_single") currentCount = Math.min(chall.targetCount, chall.currentCount + coresGathered);

      const completed = currentCount >= chall.targetCount;
      return { ...chall, currentCount, completed };
    });

    setAchievements(updatedAch);
    setDailyChallenges(updatedChall);
    setSessionEndStats({
      score: finalScore,
      cores: coresGathered,
      maxCombo,
      brainRushesCleared,
      isNewHigh
    });

    saveState(nextStats, skins, trails, updatedAch, updatedChall);
    setActiveScreen("gameover");
  };

  // Claim Rewards
  const claimAchievementReward = (id: string) => {
    const ach = achievements.find((item) => item.id === id);
    if (!ach || !ach.completed || ach.claimed) return;

    const reward = ach.rewardCores;
    const nextStats = { ...stats, totalCores: stats.totalCores + reward };
    
    const updatedAch = achievements.map((item) => 
      item.id === id ? { ...item, claimed: true } : item
    );

    setStats(nextStats);
    setAchievements(updatedAch);
    saveState(nextStats, skins, trails, updatedAch, dailyChallenges);
  };

  const claimChallengeReward = (id: string) => {
    const chall = dailyChallenges.find((item) => item.id === id);
    if (!chall || !chall.completed || chall.claimed) return;

    const reward = chall.rewardCores;
    const nextStats = { ...stats, totalCores: stats.totalCores + reward };

    const updatedChall = dailyChallenges.map((item) => 
      item.id === id ? { ...item, claimed: true } : item
    );

    setStats(nextStats);
    setDailyChallenges(updatedChall);
    saveState(nextStats, skins, trails, achievements, updatedChall);
  };

  // Cosmetic handlers
  const unlockSkin = (id: string, cost: number) => {
    const updatedSkins = skins.map((s) => s.id === id ? { ...s, unlocked: true } : s);
    const nextStats = { ...stats, totalCores: stats.totalCores - cost };
    
    setSkins(updatedSkins);
    setStats(nextStats);
    saveState(nextStats, updatedSkins, trails);
  };

  const equipSkin = (id: string) => {
    setActiveSkinId(id);
    localStorage.setItem("shiftloop_active_skin", id);
  };

  const unlockTrail = (id: string, cost: number) => {
    const updatedTrails = trails.map((t) => t.id === id ? { ...t, unlocked: true } : t);
    const nextStats = { ...stats, totalCores: stats.totalCores - cost };

    setTrails(updatedTrails);
    setStats(nextStats);
    saveState(nextStats, skins, updatedTrails);
  };

  const equipTrail = (id: string) => {
    setActiveTrailId(id);
    localStorage.setItem("shiftloop_active_trail", id);
  };

  const handleDoubleCores = () => {
    const addedCores = sessionEndStats.cores; // Adds the original cores count again
    const nextStats = { ...stats, totalCores: stats.totalCores + addedCores };
    setStats(nextStats);
    saveState(nextStats);
  };

  const handleResetProfile = () => {
    setStats(INITIAL_STATS);
    setSkins(DEFAULT_SKINS);
    setTrails(DEFAULT_TRAILS);
    setActiveSkinId("skin_neon");
    setActiveTrailId("trail_default");

    setAchievements(achievements.map((a) => ({ ...a, progress: 0, completed: false, claimed: false })));
    setDailyChallenges(dailyChallenges.map((c) => ({ ...c, currentCount: 0, completed: false, claimed: false })));

    localStorage.clear();
  };

  const handleToggleQuality = (quality: "high" | "low") => {
    setGraphicQuality(quality);
    localStorage.setItem("shiftloop_quality", quality);
  };

  const activeSkin = skins.find((s) => s.id === activeSkinId) || DEFAULT_SKINS[0];
  const activeTrail = trails.find((t) => t.id === activeTrailId) || DEFAULT_TRAILS[0];
  const dimensionConfig = DIMENSION_CONFIGS[currentMode];

  return (
    <div 
      className="w-full h-screen bg-[#07080d] text-zinc-200 flex items-center justify-center font-sans tracking-tight leading-normal relative select-none overflow-hidden"
      style={{ colorScheme: "dark" }}
    >
      {/* Immersive point grid background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none z-0" 
        style={{ 
          backgroundImage: "radial-gradient(#475569 1.5px, transparent 1.5px)", 
          backgroundSize: "40px 40px" 
        }} 
      />
      {/* Bottom neat glow gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-sky-950/20 via-transparent to-transparent pointer-events-none z-0" />

      {/* Left Sidebar Interface */}
      <div className="absolute left-8 xl:left-12 top-1/2 -translate-y-1/2 w-48 space-y-8 hidden lg:flex flex-col text-left z-10 select-none">
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-sky-400 font-extrabold font-mono">NEXT SHIFT LOOP</div>
          <div className="text-4xl font-black tabular-nums font-mono text-zinc-100 tracking-tighter">
            00:{shiftTimeLeft < 10 ? `0${shiftTimeLeft}` : shiftTimeLeft}
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/30">
            <div 
              className="h-full bg-sky-500 transition-all duration-300" 
              style={{ width: `${(shiftTimeLeft / 20) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-extrabold font-mono">DAILY QUEST</div>
          <div className="bg-[#12131d]/90 border border-zinc-805/80 p-3.5 rounded-2xl shadow-lg">
            <div className="text-[11px] leading-tight text-zinc-300 font-semibold">Match 20 gates perfectly in Sunny Zone</div>
            <div className="mt-2.5 w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div className="w-1/2 h-full bg-pink-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Interface */}
      <div className="absolute right-8 xl:right-12 top-1/2 -translate-y-1/2 w-48 hidden lg:flex flex-col items-end z-10 select-none gap-6">
        <div className="flex flex-col items-end space-y-4">
          <button 
            onClick={() => { gameAudio.triggerSFX("click"); setIsShopOpen(true); }}
            className="w-16 h-16 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center bg-[#12131d]/90 hover:border-sky-400 duration-150 cursor-pointer shadow-lg transition-all group animate-fade-in"
          >
            <div className="text-sky-400 font-extrabold text-[11px] uppercase tracking-wider font-mono group-hover:scale-105 transition-transform">Shop</div>
          </button>
          <button 
            onClick={() => { gameAudio.triggerSFX("click"); setIsShopOpen(true); }}
            className="w-16 h-16 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center bg-[#12131d]/90 hover:border-zinc-700 duration-150 cursor-pointer shadow-lg transition-all group opacity-80 hover:opacity-100"
          >
            <div className="text-zinc-300 font-semibold text-[10px] uppercase tracking-wider font-mono group-hover:scale-105 transition-transform">Skins</div>
          </button>
          <button 
            onClick={() => { gameAudio.triggerSFX("click"); setIsSettingsOpen(true); }}
            className="w-16 h-16 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center bg-[#12131d]/90 hover:border-zinc-700 duration-150 cursor-pointer shadow-lg transition-all group opacity-70 hover:opacity-100"
          >
            <div className="text-zinc-400 font-semibold text-[10px] uppercase tracking-wider font-mono group-hover:scale-105 transition-transform">Config</div>
          </button>
        </div>
      </div>

      {/* Decorative tagline */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none hidden lg:block z-10">
        <div className="text-[10px] uppercase tracking-[0.8em] font-bold text-zinc-500/30 font-mono">Shift your perspective</div>
      </div>

      {/* Main interactive app core frame container */}
      <div 
        id="shiftloop-sandbox-frame" 
        className="w-full h-full max-w-sm sm:max-w-md max-h-[820px] bg-[#0c0d14] border border-zinc-900 relative flex flex-col rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.65)] overflow-hidden z-10"
      >
        {/* Repeating 3D Tunnel Grid inside context */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div 
            className="absolute w-full h-[200%] top-[-50%] left-0 opacity-15" 
            style={{ 
              background: 'repeating-linear-gradient(0deg, transparent, transparent 48px, #38bdf8 49px, transparent 50px)', 
              transform: 'perspective(500px) rotateX(60deg)' 
            }} 
          />
        </div>

        {/* Top Mini status header with clock */}
        <header id="frame-aux-header" className="absolute top-0 inset-x-0 h-14 bg-[#0a0b10]/90 backdrop-blur-md border-b border-zinc-850 px-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-1.5 font-mono select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-[11px] font-black text-sky-400 tracking-wider">SHIFT LOOP</span>
          </div>

          <div className="flex items-center gap-2">
            {activeScreen === "menu" && (
              <button
                onClick={() => { gameAudio.triggerSFX("click"); setIsSettingsOpen(true); }}
                className="p-1 text-zinc-400 hover:text-zinc-200"
              >
                <Settings size={14} />
              </button>
            )}
            
            {/* Global Currency overlay */}
            <div className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 flex items-center gap-1 shadow-md">
              <Star size={10} className="text-amber-400 fill-amber-300" />
              <span className="text-[10px] font-mono font-bold text-zinc-300 leading-none">{stats.totalCores}</span>
            </div>
          </div>
        </header>

        {/* Live Active Screen Controllers */}
        <div className="flex-1 relative w-full h-full overflow-hidden">
          {activeScreen === "menu" ? (
            <MainMenu
              stats={stats}
              skins={skins}
              activeSkin={activeSkin}
              achievements={achievements}
              dailyChallenges={dailyChallenges}
              onStartGame={handleStartGame}
              onOpenShop={() => { gameAudio.triggerSFX("click"); setIsShopOpen(true); }}
              onClaimAchievement={claimAchievementReward}
              onClaimChallenge={claimChallengeReward}
            />
          ) : activeScreen === "playing" ? (
            <div className="w-full h-full relative">
              <GameBoard
                activeSkin={activeSkin}
                activeTrail={activeTrail}
                currentMode={currentMode}
                onGameOver={handleGameOver}
                onDimensionShift={handleDimensionShift}
                onScoreUpdate={handleScoreUpdate}
                isPaused={isPaused}
                onTimerUpdate={setShiftTimeLeft}
              />
              
              <HUD
                score={liveScore}
                combo={liveCombo}
                coresCollected={liveCores}
                currentMode={currentMode}
                dimensionConfig={dimensionConfig}
                isPaused={isPaused}
                onPauseToggle={handlePauseToggle}
              />

              {/* Pause modal overlay block */}
              {isPaused && (
                <div id="pause-modal-screen" className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                  <h3 className="text-2xl font-extrabold text-white tracking-widest font-mono">DRIVE PAUSED</h3>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">RESUME ITERATING SECURE MATCHES</p>
                  <button
                    onClick={handlePauseToggle}
                    className="px-6 py-3 bg-white text-black font-mono text-xs font-bold rounded-xl shadow-md active:scale-95 duration-100 uppercase"
                  >
                    CONTINUE PORTAL
                  </button>
                </div>
              )}
            </div>
          ) : activeScreen === "gameover" ? (
            <GameOver
              score={sessionEndStats.score}
              coresCollected={sessionEndStats.cores}
              maxCombo={sessionEndStats.maxCombo}
              brainRushesCleared={sessionEndStats.brainRushesCleared}
              isNewHigh={sessionEndStats.isNewHigh}
              onRestart={handleStartGame}
              onExit={() => setActiveScreen("menu")}
              onDoubleCores={handleDoubleCores}
            />
          ) : null}

          {/* Shop Popup Sub-overlay */}
          {isShopOpen && (
            <Shop
              skins={skins}
              trails={trails}
              totalCores={stats.totalCores}
              activeSkinId={activeSkinId}
              activeTrailId={activeTrailId}
              onUnlockSkin={unlockSkin}
              onUnlockTrail={unlockTrail}
              onEquipSkin={equipSkin}
              onEquipTrail={equipTrail}
              onClose={() => setIsShopOpen(false)}
            />
          )}

          {/* Settings panel overlay section */}
          {isSettingsOpen && (
            <SettingsPanel
              onClose={() => setIsSettingsOpen(false)}
              onResetStats={handleResetProfile}
              graphicQuality={graphicQuality}
              onToggleQuality={handleToggleQuality}
            />
          )}
        </div>
      </div>
    </div>
  );
}

