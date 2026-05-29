/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { gameAudio } from "../audio";
import { Volume2, Music, Sparkles, RefreshCw, X, ChevronRight } from "lucide-react";

interface SettingsPanelProps {
  onClose: () => void;
  onResetStats: () => void;
  graphicQuality: "high" | "low";
  onToggleQuality: (quality: "high" | "low") => void;
}

export default function SettingsPanel({
  onClose,
  onResetStats,
  graphicQuality,
  onToggleQuality
}: SettingsPanelProps) {
  const [sfxVol, setSfxVol] = useState(50);
  const [musVol, setMusVol] = useState(30);

  useEffect(() => {
    // Sync current values from audio controller
    setSfxVol(Math.round(gameAudio.getSfxVolume() * 100));
    setMusVol(Math.round(gameAudio.getMusicVolume() * 100));
  }, []);

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSfxVol(val);
    gameAudio.setSfxVolume(val / 100);
    gameAudio.triggerSFX("click");
  };

  const handleMusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setMusVol(val);
    gameAudio.setMusicVolume(val / 100);
  };

  const handleReset = () => {
    if (window.confirm("ARE YOU ABSOLUTELY SURE YOU WANT TO CLEAR ALL SHIFT LOOP GAME PROGRESS, COMPLETED TARGETS, AND CORES?")) {
      gameAudio.triggerSFX("hit");
      onResetStats();
      onClose();
    }
  };

  return (
    <div id="settings-pnl-overlay" className="absolute inset-0 z-40 bg-[#0a0c14]/95 backdrop-blur-xl flex flex-col justify-between p-6 text-zinc-200">
      {/* Header panel */}
      <div className="flex justify-between items-center pb-4 border-b border-zinc-850">
        <div className="text-left">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            GAME <span className="text-sky-400">OPTIONS</span>
          </h2>
          <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mt-0.5 font-bold">
            Adjust sound, music, and performance
          </p>
        </div>
        <button
          onClick={() => { gameAudio.triggerSFX("click"); onClose(); }}
          className="p-1.5 rounded-xl bg-[#131522] border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-all cursor-pointer shadow-lg"
        >
          <X size={15} />
        </button>
      </div>

      {/* Main Configurations Section */}
      <div className="flex-1 flex flex-col gap-5 py-5 overflow-y-auto pr-1">
        
        {/* SFX Audio slider */}
        <div className="flex flex-col gap-2 p-4 bg-[#121422] border border-zinc-850/80 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center text-xs text-zinc-200">
            <span className="font-extrabold tracking-tight font-sans flex items-center gap-1.5">
              <Volume2 size={14} className="text-sky-400" />
              SOUND EFFECTS
            </span>
            <span className="font-mono text-sky-400 font-extrabold">{sfxVol}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sfxVol}
            onChange={handleSfxChange}
            className="w-full h-1.5 accent-sky-400 bg-zinc-950 rounded-lg cursor-pointer mt-1"
          />
          <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-wider mt-1 font-bold">
            Chimes, micro-glitches and feedback alerts
          </span>
        </div>

        {/* Music Synth audio slider */}
        <div className="flex flex-col gap-2 p-4 bg-[#121422] border border-zinc-850/80 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center text-xs text-zinc-200">
            <span className="font-extrabold tracking-tight font-sans flex items-center gap-1.5">
              <Music size={14} className="text-fuchsia-400" />
              SYNTH CHORDS & MELODIES
            </span>
            <span className="font-mono text-fuchsia-400 font-extrabold">{musVol}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={musVol}
            onChange={handleMusChange}
            className="w-full h-1.5 accent-fuchsia-400 bg-zinc-950 rounded-lg cursor-pointer mt-1"
          />
          <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-wider mt-1 font-bold">
            Generative driving bass beats and melody steps
          </span>
        </div>

        {/* Graphics setting optimization indicator */}
        <div className="flex flex-col gap-2 p-4 bg-[#121422] border border-zinc-850/80 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center text-xs text-zinc-200">
            <span className="font-extrabold tracking-tight font-sans flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-450 animate-pulse" />
              GRAPHIC ENGINE COMPRESSION
            </span>
            <span className="font-mono text-emerald-400 font-extrabold tracking-wide uppercase">{graphicQuality === "high" ? "60 FPS RAG" : "LOW REND"}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => { gameAudio.triggerSFX("click"); onToggleQuality("high"); }}
              className={`py-2 rounded-xl font-mono text-[9px] font-extrabold uppercase transition-all cursor-pointer ${
                graphicQuality === "high"
                  ? "bg-emerald-950/25 text-emerald-400 border border-emerald-950/40 shadow-lg font-black"
                  : "bg-zinc-950 text-zinc-500 border border-zinc-800 hover:text-zinc-300"
              }`}
            >
              GLOW PORTALS (HIGH)
            </button>
            <button
              onClick={() => { gameAudio.triggerSFX("click"); onToggleQuality("low"); }}
              className={`py-2 rounded-xl font-mono text-[9px] font-extrabold uppercase transition-all cursor-pointer ${
                graphicQuality === "low"
                  ? "bg-emerald-950/25 text-emerald-400 border border-emerald-950/40 shadow-lg font-black"
                  : "bg-zinc-950 text-zinc-500 border border-zinc-800 hover:text-zinc-300"
              }`}
            >
              FLAT GRID (LOW CPU)
            </button>
          </div>
          <span className="text-[8px] font-mono text-zinc-455 uppercase tracking-wider mt-1 font-bold">
            Reduces CPU footprint on mobile systems by scaling particle counts
          </span>
        </div>

        {/* System Diagnostics reset progress */}
        <div className="flex flex-col gap-2 p-4 bg-[#121422] border border-zinc-850/80 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <span className="font-extrabold tracking-tight font-sans text-red-400 flex items-center gap-1.5 uppercase leading-none">
              <RefreshCw size={13} className="animate-spin" style={{ animationDuration: "8s" }} />
              SYSTEM RESET
            </span>
          </div>
          <button
            onClick={handleReset}
            className="w-full py-2.5 bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-900/30 font-mono text-[9px] font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            ERASE ALL SCORES & CORES
          </button>
        </div>

      </div>

      {/* Footer closer */}
      <button
        onClick={() => { gameAudio.triggerSFX("click"); onClose(); }}
        className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white font-mono text-xs font-black uppercase rounded-2xl tracking-widest active:scale-95 duration-100 shadow-[0_4px_15px_rgba(14,165,233,0.35)] transition-all cursor-pointer"
      >
        SAVE SPEC PREFERENCES
      </button>
    </div>
  );
}
