/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { DimensionMode, DimensionConfig } from "../types";
import { Play, Pause, Zap, Flame, Award } from "lucide-react";

interface HUDProps {
  score: number;
  combo: number;
  coresCollected: number;
  currentMode: DimensionMode;
  dimensionConfig: DimensionConfig;
  isPaused: boolean;
  onPauseToggle: () => void;
}

export default function HUD({
  score,
  combo,
  coresCollected,
  currentMode,
  dimensionConfig,
  isPaused,
  onPauseToggle
}: HUDProps) {
  // Select color themes
  const color = dimensionConfig.primaryColor;
  const secondaryColor = dimensionConfig.secondaryColor;

  // Calculate difficulty rating dynamically from score
  let difficulty = "EASY";
  let difficultyColor = "text-sky-400 border-sky-400/20 bg-sky-950/40";
  if (score >= 9000) {
    difficulty = "INSANE";
    difficultyColor = "text-red-400 border-red-500/35 bg-red-950/40 animate-pulse";
  } else if (score >= 5500) {
    difficulty = "EXPERT";
    difficultyColor = "text-orange-400 border border-orange-500/30 bg-orange-950/40";
  } else if (score >= 3000) {
    difficulty = "HARD";
    difficultyColor = "text-fuchsia-400 border border-fuchsia-500/30 bg-fuchsia-950/40";
  } else if (score >= 1200) {
    difficulty = "MEDIUM";
    difficultyColor = "text-amber-400 border border-amber-500/30 bg-amber-950/40";
  }

  return (
    <div id="game-hud-overlay" className="absolute inset-x-0 top-14 p-4 pointer-events-none flex flex-col justify-between h-[calc(100%-4rem)]">
      {/* Top Section Wrapper (Keeps everything in upper safe zone, completely away from the center tunnel!) */}
      <div className="flex flex-col w-full gap-3">
        {/* Top statistics panel */}
        <div className="flex justify-between items-start w-full relative z-10">
          {/* Score, Cores, and Difficulty rating merged Card */}
          <div className="backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-3 w-32 flex flex-col pointer-events-auto shadow-lg text-left">
            <div className="flex flex-col mb-1 flex-1">
              <span className="text-[9px] uppercase tracking-wider text-sky-400 font-mono leading-none font-black">Score</span>
              <span 
                id="hud-score-label" 
                className="text-xl font-mono font-black text-white leading-tight mt-0.5"
              >
                {score.toLocaleString()}
              </span>
              <span className={`text-[8px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${difficultyColor} mt-1 w-fit`}>
                {difficulty}
              </span>
            </div>
            
            <div className="h-[1px] bg-white/10 my-1.5"></div>
            
            <div className="flex items-center gap-1.5">
              <Zap size={11} className="text-amber-400 fill-amber-300 rotate-45 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[8px] uppercase text-zinc-400 font-mono leading-none font-bold">Cores</span>
                <span className="text-xs font-mono font-black leading-none text-white mt-0.5">{coresCollected}</span>
              </div>
            </div>
          </div>

          {/* Center Column: Reality and Combo elevated away from the center tunnel */}
          <div className="flex flex-col items-center justify-start text-center gap-1 mt-1 select-none pointer-events-none flex-1 px-1.5">
            {/* Active Reality status indicator badge */}
            <div className="flex items-center space-x-1.5 bg-black/75 rounded-full px-2.5 py-0.5 border border-white/10 text-white backdrop-blur-md shadow-md">
              <div 
                className="w-1.5 h-1.5 rounded-full animate-ping animate-pulse" 
                style={{ backgroundColor: color }}
              />
              <span className="text-[9px] font-black uppercase tracking-widest font-mono text-zinc-200">
                {dimensionConfig.name.toUpperCase()}
              </span>
            </div>

            {/* Combo streak tracking nodes - highly compact under the badge */}
            <div className="grid grid-cols-4 gap-1 w-full max-w-[84px] mx-auto mt-0.5 bg-black/45 p-0.5 rounded-md border border-white/5">
              {[1, 2, 3, 4].map((idx) => {
                const active = combo >= idx;
                return (
                  <div 
                    key={idx}
                    className={`aspect-square rounded border flex items-center justify-center transition-all duration-300 ${
                      active 
                        ? "border-sky-500 bg-sky-950/40 shadow-[0_1px_4px_rgba(56,189,248,0.3)]" 
                        : "border-white/5 bg-white/5 opacity-40"
                    }`}
                  >
                    <div 
                      className={`w-1 h-1 border rotate-45 transition-all duration-300 ${
                        active ? "border-sky-400 bg-sky-400" : "border-white/10 bg-white/5"
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <p className="text-[7.5px] font-mono font-bold text-zinc-405 tracking-wider max-w-[110px] uppercase leading-tight text-center mt-0.5">
              {dimensionConfig.description}
            </p>
          </div>

          {/* Multiplier and Pause controller group */}
          <div className="flex flex-col items-end gap-2 pointer-events-auto">
            {/* Transparent glass multiplier segment */}
            <div className="backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-2.5 flex flex-col items-end shadow-lg w-28 text-right">
              <span className="text-[9px] uppercase tracking-wider text-fuchsia-400 font-mono font-black leading-none animate-pulse">Multiplier</span>
              <span className="text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-fuchsia-400 to-indigo-400 leading-tight mt-0.5">
                x{(1 + (combo / 4)).toFixed(1)}
              </span>
            </div>

            <button
              onClick={onPauseToggle}
              className="py-1.5 px-3 rounded-full bg-black/60 hover:bg-zinc-900 border border-white/10 text-zinc-200 transition-all active:scale-95 duration-100 flex items-center justify-center gap-1 font-mono text-[9px] tracking-widest font-extrabold uppercase shadow-lg pointer-events-auto cursor-pointer"
            >
              {isPaused ? <Play size={8} className="fill-zinc-300" /> : <Pause size={8} />}
              <span>{isPaused ? "RESUME" : "PAUSE"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simple control help hints at bottom margins (Completely cleaned up, no overlap) */}
      <div className="w-full flex justify-between items-end mt-auto pointer-events-none pb-2">
        <div className="text-[8px] font-mono font-bold text-zinc-400 hidden sm:block select-none leading-relaxed text-left">
          [A]/[←] ROTATE CCW // [D]/[→] ROTATE CW <br />
          [SPACE] FLIP 180° SEGMENT
        </div>
        <div className="text-[8px] font-mono font-bold text-zinc-400 sm:hidden select-none text-left tracking-wide leading-none py-1">
          TAP SIDES TO ALIGN
        </div>
        <div className="text-[8px] font-mono font-bold text-zinc-400 select-none text-right tracking-wide leading-none py-1">
          VELOCITY STATUS: RUNNING
        </div>
      </div>
    </div>
  );
}
