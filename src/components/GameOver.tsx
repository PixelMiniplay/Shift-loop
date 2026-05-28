/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { gameAudio } from "../audio";
import { RotateCcw, Home, Award, Star, Hourglass, HelpCircle, Zap } from "lucide-react";

interface GameOverProps {
  score: number;
  coresCollected: number;
  maxCombo: number;
  brainRushesCleared: number;
  isNewHigh: boolean;
  onRestart: () => void;
  onExit: () => void;
  onDoubleCores: () => void;
}

export default function GameOver({
  score,
  coresCollected,
  maxCombo,
  brainRushesCleared,
  isNewHigh,
  onRestart,
  onExit,
  onDoubleCores
}: GameOverProps) {
  const [adLoading, setAdLoading] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [adClaimed, setAdClaimed] = useState(false);

  // Simulated premium interactive rewarded ad with absolute visual feedback
  const handleDoubleReward = () => {
    gameAudio.triggerSFX("click");
    setAdLoading(true);
    setAdProgress(0);

    let progressVal = 0;
    const intv = setInterval(() => {
      progressVal += 10;
      if (progressVal >= 100) {
        clearInterval(intv);
        setAdProgress(100);
        setAdLoading(false);
        setAdClaimed(true);
        onDoubleCores();
        gameAudio.triggerSFX("perfect");
      } else {
        setAdProgress(progressVal);
      }
    }, 180);
  };

  return (
    <div id="game-over-screen" className="absolute inset-0 z-30 bg-[#0a0c14]/95 backdrop-blur-xl flex flex-col p-6 items-center justify-between overflow-y-auto text-zinc-200">
      {/* Upper alerts */}
      <div className="flex flex-col items-center justify-center text-center gap-1.5 py-6 shrink-0">
        <span className="text-[10px] font-mono font-black text-rose-400 uppercase tracking-[0.2em] animate-pulse">
          ✦ ROUND ENDED ✦
        </span>
        <h2 className="text-4xl font-extrabold text-white tracking-tight">
          GOOD <span className="text-rose-400">TRY!</span>
        </h2>
        {isNewHigh && (
          <div 
            id="new-high-score-badge" 
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 text-[10px] font-mono font-black uppercase mt-2 animate-bounce flex items-center gap-1 shadow-md border border-yellow-300"
          >
            <Award size={12} className="fill-amber-900" />
            NEW PERSONAL BEST!
          </div>
        )}
      </div>

      {/* Main Score Block */}
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-1 py-4">
        <span className="text-[10px] font-mono text-zinc-450 uppercase tracking-widest font-extrabold">Final Score Accumulated</span>
        <span id="game-over-score-text" className="text-5xl sm:text-6xl font-black font-mono text-white tracking-tight">
          {score.toLocaleString()}
        </span>

        {/* Core Stats detailed grid */}
        <div id="game-over-stats-grid" className="grid grid-cols-3 gap-2 w-full max-w-sm mt-6">
          <div className="bg-[#121422] border border-zinc-850 p-3 rounded-2xl flex flex-col items-center gap-1 shadow-lg">
            <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest font-extrabold text-center leading-tight">Cores Picked</span>
            <div className="flex items-center gap-1 font-mono font-black text-amber-400 text-sm">
              <Zap size={10} className="fill-amber-300 text-amber-400" />
              <span>{coresCollected}</span>
            </div>
          </div>

          <div className="bg-[#121422] border border-zinc-850 p-3 rounded-2xl flex flex-col items-center gap-1 shadow-lg">
            <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest font-extrabold text-center leading-tight">Best Streak</span>
            <span className="font-mono font-black text-fuchsia-400 text-sm">{maxCombo}x</span>
          </div>

          <div className="bg-[#121422] border border-zinc-850 p-3 rounded-2xl flex flex-col items-center gap-1 shadow-lg">
            <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest font-extrabold text-center leading-tight">Brain Rushes</span>
            <span className="font-mono font-black text-sky-450 text-sm">{brainRushesCleared}</span>
          </div>
        </div>
      </div>

      {/* Rewarded Ads Double Option */}
      {!adClaimed ? (
        <div className="w-full max-w-sm bg-[#121422] border border-zinc-850/80 p-4 rounded-3xl mb-4 flex flex-col gap-3 shadow-lg shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-0.5 text-left">
              <span className="text-zinc-200 text-xs font-black tracking-tight flex items-center gap-1">
                MULTIPLY CORE STREAK?
              </span>
              <p className="text-[9px] text-zinc-400 uppercase font-mono mt-0.5 tracking-wider font-extrabold">
                Claim free extra cores for the gift shop!
              </p>
            </div>
            <div className="px-2 py-0.5 bg-amber-955/20 text-amber-400 border border-amber-900/30 text-[9px] font-mono rounded-md font-extrabold">
              2X BONUS
            </div>
          </div>

          {adLoading ? (
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800/40">
                <div className="h-full bg-amber-500 shadow-sm" style={{ width: `${adProgress}%` }} />
              </div>
              <div className="flex justify-between text-[8px] font-mono text-amber-400 font-extrabold">
                <span>CONNECTING DOUBLE BONUS...</span>
                <span>{adProgress}%</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleDoubleReward}
              className="w-full py-2.5 bg-amber-550 hover:bg-amber-500 text-white font-extrabold uppercase font-mono tracking-widest text-[9px] rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98]"
            >
              <Zap size={11} className="fill-white" />
              CLAIM DOUBLE (+{coresCollected} CORES)
            </button>
          )}
        </div>
      ) : (
        <div className="w-full max-w-sm bg-green-950/20 border border-green-900/35 p-3 rounded-2xl text-center text-[10px] font-mono text-green-400 uppercase tracking-widest font-extrabold mb-4 shadow-lg leading-tight shrink-0">
          🎉 REWARDS SECURED! +{coresCollected * 2} CORES CREDITED SUCCESSFULLY
        </div>
      )}

      {/* Bottom control row */}
      <div className="w-full max-w-sm flex gap-3 mt-auto shrink-0 pb-2">
        <button
          onClick={() => { gameAudio.triggerSFX("click"); onExit(); }}
          className="flex-1 py-3 bg-[#11131c] hover:bg-zinc-900 text-zinc-300 font-extrabold border border-zinc-800 uppercase font-mono tracking-widest text-[10px] rounded-2xl active:scale-95 duration-100 transition-all cursor-pointer flex justify-center items-center gap-1.5 shadow-lg"
        >
          <Home size={13} />
          MAIN MENU
        </button>

        <button
          onClick={() => { gameAudio.triggerSFX("perfect"); onRestart(); }}
          className="flex-1 py-3 bg-sky-500 hover:bg-sky-400 text-white font-extrabold uppercase font-mono tracking-widest text-[10px] rounded-2xl active:scale-95 duration-100 shadow-[0_4px_15px_rgba(14,165,233,0.35)] transition-all cursor-pointer flex justify-center items-center gap-1.5"
        >
          <RotateCcw size={13} />
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}
