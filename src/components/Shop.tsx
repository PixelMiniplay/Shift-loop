/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { PlayerSkin, TrailEffect } from "../types";
import { gameAudio } from "../audio";
import { Compass, ShoppingBag, CheckCircle, Lock, Star, ChevronRight, Zap } from "lucide-react";

interface ShopProps {
  skins: PlayerSkin[];
  trails: TrailEffect[];
  totalCores: number;
  activeSkinId: string;
  activeTrailId: string;
  onUnlockSkin: (skinId: string, cost: number) => void;
  onUnlockTrail: (trailId: string, cost: number) => void;
  onEquipSkin: (skinId: string) => void;
  onEquipTrail: (trailId: string) => void;
  onClose: () => void;
}

export default function Shop({
  skins,
  trails,
  totalCores,
  activeSkinId,
  activeTrailId,
  onUnlockSkin,
  onUnlockTrail,
  onEquipSkin,
  onEquipTrail,
  onClose
}: ShopProps) {
  const [activeTab, setActiveTab] = useState<"skins" | "trails">("skins");

  const handleEquipSkin = (s: PlayerSkin) => {
    gameAudio.triggerSFX("click");
    if (s.unlocked) {
      onEquipSkin(s.id);
    }
  };

  const handleEquipTrail = (t: TrailEffect) => {
    gameAudio.triggerSFX("click");
    if (t.unlocked) {
      onEquipTrail(t.id);
    }
  };

  const handleBuySkin = (s: PlayerSkin) => {
    if (totalCores >= s.price) {
      gameAudio.triggerSFX("perfect");
      onUnlockSkin(s.id, s.price);
    } else {
      gameAudio.triggerSFX("hit");
    }
  };

  const handleBuyTrail = (t: TrailEffect) => {
    if (totalCores >= t.price) {
      gameAudio.triggerSFX("perfect");
      onUnlockTrail(t.id, t.price);
    } else {
      gameAudio.triggerSFX("hit");
    }
  };

  return (
    <div id="shop-overlay-screen" className="absolute inset-0 z-40 bg-[#0a0c14]/95 backdrop-blur-xl flex flex-col p-6 overflow-y-auto text-zinc-200 animate-fade-in">
      {/* Header with core counters */}
      <div id="shop-header" className="flex justify-between items-center mb-6 text-left shrink-0">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight font-sans">
            LOOP <span className="text-sky-400">GIFT SHOP</span>
          </h2>
          <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mt-0.5 font-bold">
            Equip colorful skins and cute trail items
          </p>
        </div>

        {/* Currency badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-900/20 border border-amber-900/30 shadow-lg select-none">
          <Zap size={13} className="text-amber-400 fill-amber-300 animate-pulse" />
          <span className="text-xs font-black font-mono text-zinc-200">
            {totalCores} <span className="text-[9px] text-zinc-400 font-bold">CORES</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-6 bg-[#131522] p-1 rounded-2xl border border-zinc-850 shrink-0">
        <button
          onClick={() => { setActiveTab("skins"); gameAudio.triggerSFX("click"); }}
          className={`py-2 rounded-xl font-mono text-[10px] font-extrabold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "skins"
              ? "bg-[#1a1c2d] text-sky-400 border border-sky-950/40 shadow-lg font-black"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <ShoppingBag size={13} />
          CUBE SKINS
        </button>
        <button
          onClick={() => { setActiveTab("trails"); gameAudio.triggerSFX("click"); }}
          className={`py-2 rounded-xl font-mono text-[10px] font-extrabold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "trails"
              ? "bg-[#1a1c2d] text-fuchsia-400 border border-fuchsia-950/40 shadow-lg font-black"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Compass size={13} />
          TRAIL EFFECTS
        </button>
      </div>

      {/* Shop Grid */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 pb-16">
        {activeTab === "skins" && 
          skins.map((skin) => {
            const isActive = activeSkinId === skin.id;
            const canAfford = totalCores >= skin.price;

            return (
              <div
                key={skin.id}
                id={`skin-card-${skin.id}`}
                className={`flex flex-col justify-between p-4 rounded-xl border bg-[#121422] transition-all duration-300 shadow-lg ${
                  isActive 
                    ? "border-sky-500/50 bg-sky-950/15" 
                    : "border-zinc-850 hover:border-zinc-700"
                }`}
              >
                <div className="flex gap-3 text-left">
                  {/* Glowing preview representation */}
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center border border-zinc-800 shrink-0 relative overflow-hidden bg-zinc-950"
                    style={{ backgroundColor: `${skin.color}15` }}
                  >
                    <div 
                      className={`w-6 h-6 border-2 shadow-inner transition-all duration-300 ${
                        skin.shape === "cube" ? "rounded-sm" : 
                        skin.shape === "sphere" ? "rounded-full" : 
                        skin.shape === "octahedron" ? "rotate-45" : "rounded-sm border-dashed"
                      }`}
                      style={{ 
                        backgroundColor: skin.color, 
                        borderColor: skin.glowColor,
                        boxShadow: `0 0 10px ${skin.glowColor}`
                      }}
                    />
                  </div>

                  {/* Character stats */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-extrabold text-white flex items-center gap-1.5 leading-tight">
                      {skin.name}
                      {isActive && <CheckCircle size={12} className="text-sky-400 shrink-0 animate-fade-in animate-pulse" />}
                    </span>
                    <p className="text-[10px] text-zinc-400 leading-normal font-medium mt-0.5">
                      {skin.description}
                    </p>
                  </div>
                </div>

                {/* Purchase buttons */}
                <div className="mt-4 pt-3 border-t border-zinc-800/65 flex justify-between items-center">
                  {!skin.unlocked ? (
                    <button
                      onClick={() => handleBuySkin(skin)}
                      disabled={!canAfford}
                      className={`w-full py-2.5 rounded-xl font-mono text-[10px] font-extrabold tracking-wider uppercase flex items-center justify-center gap-1 transition-all ${
                        canAfford
                          ? "bg-sky-500 hover:bg-sky-600 text-white cursor-pointer shadow-lg"
                          : "bg-[#0f1019] border border-zinc-850 text-zinc-600 cursor-not-allowed"
                      }`}
                    >
                      <Lock size={11} />
                      UNLOCK / {skin.price} CORES
                    </button>
                  ) : isActive ? (
                    <div className="w-full text-center text-[9px] font-mono text-sky-400 uppercase tracking-widest font-black py-2.5 bg-[#0f1019] rounded-xl border border-sky-950">
                      EQUIPPED ACTIVE
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEquipSkin(skin)}
                      className="w-full py-2.5 rounded-xl font-mono text-[10px] font-extrabold tracking-widest uppercase bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 cursor-pointer transition-all active:scale-[0.98] shadow-md hover:border-zinc-700"
                    >
                      EQUIP CORE
                    </button>
                  )}
                </div>
              </div>
            );
          })}

        {activeTab === "trails" && 
          trails.map((trail) => {
            const isActive = activeTrailId === trail.id;
            const canAfford = totalCores >= trail.price;

            return (
              <div
                key={trail.id}
                id={`trail-card-${trail.id}`}
                className={`flex flex-col justify-between p-4 rounded-xl border bg-[#121422] transition-all duration-300 shadow-lg ${
                  isActive 
                    ? "border-fuchsia-500/50 bg-fuchsia-950/15" 
                    : "border-zinc-850 hover:border-zinc-700"
                }`}
              >
                <div className="flex gap-3 text-left">
                  {/* Glowing preview block */}
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center border border-zinc-800 shrink-0 relative overflow-hidden bg-zinc-950"
                  >
                    <div className="absolute inset-0 flex gap-1 items-center justify-center opacity-70">
                      {[1, 2, 3].map((s) => (
                        <div 
                          key={s}
                          className="w-1.5 h-1.5 rounded-full animate-ping"
                          style={{
                            backgroundColor: trail.color,
                            animationDelay: `${s * 0.15}s`,
                            boxShadow: `0 0 6px ${trail.color}`
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Character stats */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-extrabold text-white flex items-center gap-1.5 leading-tight">
                      {trail.name}
                      {isActive && <CheckCircle size={12} className="text-fuchsia-400 shrink-0 animate-fade-in animate-pulse" />}
                    </span>
                    <p className="text-[10px] text-zinc-400 leading-normal font-medium mt-0.5">
                      {trail.description}
                    </p>
                  </div>
                </div>

                {/* Purchase buttons */}
                <div className="mt-4 pt-3 border-t border-zinc-800/65 flex justify-between items-center">
                  {!trail.unlocked ? (
                    <button
                      onClick={() => handleBuyTrail(trail)}
                      disabled={!canAfford}
                      className={`w-full py-2.5 rounded-xl font-mono text-[10px] font-extrabold tracking-wider uppercase flex items-center justify-center gap-1 transition-all ${
                        canAfford
                          ? "bg-fuchsia-500 hover:bg-fuchsia-600 text-white cursor-pointer shadow-lg"
                          : "bg-[#0f1019] border border-zinc-850 text-zinc-600 cursor-not-allowed"
                      }`}
                    >
                      <Lock size={11} />
                      UNLOCK / {trail.price} CORES
                    </button>
                  ) : isActive ? (
                    <div className="w-full text-center text-[9px] font-mono text-fuchsia-400 uppercase tracking-widest font-black py-2.5 bg-[#0f1019] rounded-xl border border-fuchsia-950">
                      ACTIVE TRAIL EQUIPPED
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEquipTrail(trail)}
                      className="w-full py-2.5 rounded-xl font-mono text-[10px] font-extrabold tracking-widest uppercase bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 cursor-pointer transition-all active:scale-[0.98] shadow-md hover:border-zinc-700"
                    >
                      EQUIP EFFECT
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Full screen close footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0c14]/95 backdrop-blur-md border-t border-[#121422] flex justify-center z-50 max-w-lg mx-auto">
        <button
          id="btn-close-shop"
          onClick={() => { gameAudio.triggerSFX("click"); onClose(); }}
          className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white font-mono text-xs font-black uppercase rounded-2xl tracking-widest active:scale-95 duration-100 shadow-[0_4px_15px_rgba(14,165,233,0.35)] transition-all cursor-pointer"
        >
          RETURN TO CENTRAL MENU
        </button>
      </div>
    </div>
  );
}
