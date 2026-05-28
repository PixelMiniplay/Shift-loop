/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { GameStats, Achievement, DailyChallenge, PlayerSkin } from "../types";
import { gameAudio } from "../audio";
import { Play, ShoppingCart, Award, Trophy, Compass, ArrowRight, Star, RefreshCw, Volume2, Shield } from "lucide-react";

interface MainMenuProps {
  stats: GameStats;
  skins: PlayerSkin[];
  activeSkin: PlayerSkin;
  achievements: Achievement[];
  dailyChallenges: DailyChallenge[];
  onStartGame: () => void;
  onOpenShop: () => void;
  onClaimAchievement: (id: string) => void;
  onClaimChallenge: (id: string) => void;
  onResetStats?: () => void;
}

export default function MainMenu({
  stats,
  skins,
  activeSkin,
  achievements,
  dailyChallenges,
  onStartGame,
  onOpenShop,
  onClaimAchievement,
  onClaimChallenge,
  onResetStats
}: MainMenuProps) {
  const [activeTab, setActiveTab] = useState<"menu" | "challenges" | "trophies" | "leaderboard">("menu");

  const unobtainedAchievements = achievements.filter((a) => !a.completed).length;
  const unfinishedChallenges = dailyChallenges.filter((d) => !d.completed).length;

  const claimableTrophyCount = achievements.filter((a) => a.completed && !a.claimed).length;
  const claimableChallengeCount = dailyChallenges.filter((d) => d.completed && !d.claimed).length;

  // Static high-interest mock leaderboards populated dynamically with the player's active score
  const mockRankings = [
    { rank: 1, name: "Null_Singularity", score: 85200, skin: "Void Singularity", badge: "GLITCH LORD" },
    { rank: 2, name: "VortexDrifter", score: 62450, skin: "Hex Vortex", badge: "SPEED DEMON" },
    { rank: 3, name: "GridRun_XX", score: 41900, skin: "Cyber Core", badge: "KINETIC EXPERT" },
    { rank: 4, name: "You (Local Core)", score: Math.max(stats.highScore, 0), skin: activeSkin.name, badge: "DRIFTER", isPlayer: true },
    { rank: 5, name: "CyberPulse_99", score: 28400, skin: "Original Neon", badge: "NOVICE" },
    { rank: 6, name: "NeonBabel", score: 19100, skin: "Original Neon", badge: "CADET" }
  ].sort((a, b) => b.score - a.score);

  // Assign ranks dynamically post-sorting
  mockRankings.forEach((item, index) => {
    item.rank = index + 1;
  });

  const triggerStart = () => {
    gameAudio.enableAudio();
    gameAudio.triggerSFX("perfect");
    onStartGame();
  };

  const handleTabChange = (tab: typeof activeTab) => {
    gameAudio.triggerSFX("click");
    setActiveTab(tab);
  };

  return (
    <div 
      id="main-menu-overlay" 
      className="absolute inset-0 z-30 bg-[#0a0c14]/95 backdrop-blur-xl flex flex-col p-6 items-center justify-between overflow-y-auto text-zinc-200"
    >
      {/* Upper Brand panel */}
      {activeTab === "menu" ? (
        <div id="landing-hero" className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8">
          {/* Rotating ambient tunnel halo outline */}
          <div className="relative w-44 h-44 mb-2 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-dashed border-sky-400/35 animate-spin" style={{ animationDuration: "25s" }} />
            <div className="absolute inset-4 rounded-full border border-fuchsia-400/40 animate-spin" style={{ animationDuration: "12s", animationDirection: "reverse" }} />
            
            {/* Spinning interactive cube representation */}
            <div 
              className="w-16 h-16 border rotate-12 flex items-center justify-center animate-pulse rounded-2xl bg-[#131522] shadow-lg"
              style={{
                borderColor: activeSkin.glowColor,
                boxShadow: `0 8px 24px rgba(0, 0, 0, 0.4)`,
                transform: "rotate(35deg)"
              }}
            >
              <span className="text-[10px] font-mono font-black text-zinc-300 uppercase tracking-widest">{activeSkin.shape}</span>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <h1 
              id="brand-logo" 
              className="text-4xl font-extrabold tracking-tight text-white font-sans select-none"
            >
              SHIFT <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-fuchsia-400">LOOP</span>
            </h1>
            <p className="text-[9px] font-mono font-black text-sky-400 uppercase tracking-widest leading-loose">
              WARM & COZY GRAVITY PUZZLE
            </p>
          </div>

          <p className="text-zinc-300 text-xs max-w-xs mt-2 font-medium leading-relaxed">
            Gently rotate the colorful concentric segments to align the glowing ports! Shift lanes and dimensions in this comforting perspective challenge.
          </p>

          {/* Core score diagnostics */}
          {stats.highScore > 0 && (
            <div className="px-4 py-1.5 rounded-full bg-orange-950/25 border border-orange-500/30 flex items-center gap-1.5 mt-2 shadow-lg">
              <Trophy size={11} className="text-amber-400 fill-amber-300" />
              <span className="text-[10px] font-mono text-orange-400 uppercase tracking-widest leading-none font-bold">
                HIGH SCORE: <strong className="text-white font-mono font-black">{stats.highScore.toLocaleString()}</strong>
              </span>
            </div>
          )}
        </div>
      ) : null}

      {/* Daily Challenges Subview */}
      {activeTab === "challenges" && (
        <div id="subview-challenges" className="flex-1 w-full max-w-md flex flex-col py-4 text-left">
          <div className="mb-4">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-1.5">
              DAILY <span className="text-amber-400">QUESTS</span>
            </h2>
            <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
              Complete fun objectives to earn core stars!
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[350px] pr-1">
            {dailyChallenges.map((challenge) => {
              const capValue = Math.min(challenge.currentCount, challenge.targetCount);
              const pct = (capValue / challenge.targetCount) * 100;

              return (
                <div 
                  key={challenge.id} 
                  className={`p-3.5 rounded-2xl border flex flex-col gap-3 transition-all duration-300 bg-[#121422] ${
                    challenge.claimed 
                      ? "border-zinc-900/40 opacity-40 bg-zinc-950/10" 
                      : challenge.completed 
                      ? "bg-gradient-to-r from-amber-950/20 to-[#121422] border-amber-500/35 shadow-md" 
                      : "border-zinc-850 shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-zinc-200 max-w-[240px] leading-snug font-sans">
                      {challenge.description}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 shrink-0">
                      <Star size={10} className="fill-amber-300 text-amber-400" />
                      +{challenge.rewardCores}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800/40">
                      <div 
                        className="h-full bg-amber-400 rounded-full" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                      {capValue}/{challenge.targetCount}
                    </span>
                  </div>

                  {challenge.completed && !challenge.claimed ? (
                    <button
                      onClick={() => {
                        gameAudio.triggerSFX("perfect");
                        onClaimChallenge(challenge.id);
                      }}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-white font-mono text-[10px] font-extrabold uppercase tracking-widest rounded-lg transition-all shadow-md active:scale-[0.98] cursor-pointer animate-pulse"
                    >
                      CLAIM CORES
                    </button>
                  ) : challenge.claimed ? (
                    <div className="text-center text-[9px] font-mono text-zinc-500 uppercase tracking-widest py-1.5 bg-zinc-900/50 border border-zinc-850 rounded-lg leading-none">
                      CLAIMED & SECURED
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievements Subview */}
      {activeTab === "trophies" && (
        <div id="subview-trophies" className="flex-1 w-full max-w-md flex flex-col py-4 text-left">
          <div className="mb-4">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-1.5">
              SECTOR <span className="text-sky-450">ACHIEVEMENTS</span>
            </h2>
            <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
              Earn persistent rewards along your journey
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[350px] pr-1">
            {achievements.map((achievement) => {
              const capValue = Math.min(achievement.progress, achievement.maxProgress);
              const pct = (capValue / achievement.maxProgress) * 100;

              return (
                <div 
                  key={achievement.id} 
                  className={`p-3.5 rounded-2xl border flex flex-col gap-3 transition-all duration-300 bg-[#121422] ${
                    achievement.claimed 
                      ? "border-zinc-905/30 opacity-40 bg-zinc-950/10" 
                      : achievement.completed 
                      ? "bg-gradient-to-r from-sky-950/20 to-[#121422] border-sky-550/30 shadow-md" 
                      : "border-zinc-850 shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-zinc-200 flex items-center gap-1.5 font-sans">
                        {achievement.title}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{achievement.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-sky-400 shrink-0">
                      <Star size={10} className="fill-sky-300 text-sky-400" />
                      +{achievement.rewardCores}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800/40">
                      <div 
                        className="h-full bg-sky-500 rounded-full" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                      {capValue}/{achievement.maxProgress}
                    </span>
                  </div>

                  {achievement.completed && !achievement.claimed ? (
                    <button
                      onClick={() => {
                        gameAudio.triggerSFX("perfect");
                        onClaimAchievement(achievement.id);
                      }}
                      className="w-full py-2 bg-sky-500 hover:bg-sky-400 text-white font-mono text-[10px] font-extrabold uppercase tracking-widest rounded-lg transition-all shadow-md active:scale-[0.98] cursor-pointer"
                    >
                      CLAIM REWARD
                    </button>
                  ) : achievement.claimed ? (
                    <div className="text-center text-[9px] font-mono text-zinc-500 uppercase tracking-widest py-1.5 bg-[#131522] border border-zinc-850 rounded-lg leading-none">
                      CLAIMED REWARD
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cyber Leaderboard Subview */}
      {activeTab === "leaderboard" && (
        <div id="subview-leaderboard" className="flex-1 w-full max-w-md flex flex-col py-4 text-left">
          <div className="mb-4">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-1.5">
              GLOBAL <span className="text-fuchsia-400">HIGH SCORES</span>
            </h2>
            <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
              Ranks of players shifting around the world
            </p>
          </div>

          <div className="flex-1 bg-[#11131c] border border-zinc-850 rounded-2xl overflow-hidden flex flex-col shadow-lg">
            <div className="grid grid-cols-12 gap-2 p-3.5 border-b border-zinc-850 text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-extrabold bg-[#0d0e15]/40 animate-fade-in">
              <span className="col-span-2 text-center bg-black/20 py-0.5 rounded">RK</span>
              <span className="col-span-5">DRIFTER</span>
              <span className="col-span-2">CUBE SKIN</span>
              <span className="col-span-3 text-right font-mono">MAX SCORE</span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[280px]">
              {mockRankings.map((item, idx) => {
                return (
                  <div 
                    key={idx}
                    className={`grid grid-cols-12 gap-2 p-3.5 items-center border-b border-[#1a1c27] text-xs font-sans transition-colors duration-150 ${
                      item.isPlayer 
                        ? "bg-sky-950/30 text-sky-300 font-extrabold border-y border-sky-900/50" 
                        : "text-zinc-300 hover:bg-zinc-900/40"
                    }`}
                  >
                    <span className="col-span-2 text-center font-mono font-extrabold">
                      {idx + 1 === 1 ? "🥇" : idx + 1 === 2 ? "🥈" : idx + 1 === 3 ? "🥉" : idx + 1}
                    </span>
                    <div className="col-span-5 flex flex-col">
                      <span className="truncate">{item.name}</span>
                      <span className="text-[8px] font-mono text-zinc-500 tracking-wider truncate uppercase">{item.badge}</span>
                    </div>
                    <span className="col-span-2 text-[9px] text-[#22d3ee] truncate font-semibold">{item.skin}</span>
                    <span className="col-span-3 text-right font-mono font-bold">
                      {item.score.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main launch controller triggers and layout rails */}
      <div id="landing-foot-controls" className="w-full max-w-md flex flex-col gap-4 mt-auto">
        
        {/* Core launch button */}
        {activeTab === "menu" ? (
          <button
            id="btn-play-game"
            onClick={triggerStart}
            className="w-full py-4 text-white text-xs font-extrabold font-mono tracking-widest uppercase rounded-2xl flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-sky-500 via-sky-400 to-indigo-500 hover:brightness-110 active:scale-95 duration-100 shadow-[0_6px_20px_rgba(14,165,233,0.45)]"
          >
            <Play size={14} className="fill-white text-white" />
            PLAY SHIFT LOOP!
          </button>
        ) : (
          <button
            id="btn-back-to-home"
            onClick={() => handleTabChange("menu")}
            className="w-full py-3 bg-[#11131c] border border-zinc-800 text-white font-mono text-[10px] font-bold tracking-widest uppercase rounded-2xl active:scale-95 duration-100 hover:bg-zinc-900 cursor-pointer"
          >
            RETURN TO CENTRAL MENU
          </button>
        )}

        {/* Modular auxiliary controls hub */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleTabChange(activeTab === "trophies" ? "menu" : "trophies")}
            className={`py-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-[10px] font-extrabold uppercase tracking-widest font-mono relative cursor-pointer ${
              activeTab === "trophies" 
                ? "bg-sky-950/40 border-sky-500/50 text-sky-450 shadow-lg" 
                : "bg-[#11131c] border-[#1a1c27] text-zinc-400 hover:text-white hover:bg-zinc-900/50"
            }`}
          >
            <Award size={16} />
            <span>{activeTab === "trophies" ? "MAIN SCREEN" : "TROPHIES"}</span>
            {unobtainedAchievements > 0 && activeTab !== "trophies" && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-sky-500 text-white font-extrabold text-[10px] font-mono rounded-full flex items-center justify-center border border-zinc-950">
                {unobtainedAchievements}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              gameAudio.triggerSFX("click");
              onOpenShop();
            }}
            className="py-3.5 bg-[#11131c] border border-zinc-850 hover:border-sky-500/50 text-zinc-450 hover:text-sky-400 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all text-[10px] font-extrabold uppercase tracking-widest font-mono cursor-pointer shadow-lg"
          >
            <ShoppingCart size={16} />
            <span>SHOP MARKET</span>
          </button>
        </div>

        {/* Global metadata foot stats */}
        <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500 px-1 mt-1">
          <span>SHIFT LOOP v1.2</span>
          <span>COMPLETED: {stats.totalGamesPlayed} SHIFT SESSIONS</span>
        </div>
      </div>
    </div>
  );
}
