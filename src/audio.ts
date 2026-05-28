/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DimensionMode } from "./types";

class AudioController {
  private ctx: AudioContext | null = null;
  private masterVolume: GainNode | null = null;
  private musicVolume: GainNode | null = null;
  private sfxVolume: GainNode | null = null;

  // Music sequencer nodes
  private isMusicPlaying = false;
  private schedulerInterval: number | null = null;
  private lastSubBassOsc: OscillatorNode | null = null;

  // Synthesizer music parameters
  private beatStep = 0;
  private bpm = 124;
  private stepDuration = 60 / 124 / 4; // 16th note default
  private currentCombo = 0;
  private speedFactor = 1.0;
  private currentMode: DimensionMode = DimensionMode.NEON_MODE;

  // Configured volumes
  private sfxVolLevel = 0.5;
  private musVolLevel = 0.3;

  constructor() {
    // Initialized lazily upon user interaction to satisfy browser security
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();

      this.masterVolume = this.ctx.createGain();
      this.masterVolume.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterVolume.connect(this.ctx.destination);

      this.musicVolume = this.ctx.createGain();
      this.musicVolume.gain.setValueAtTime(this.musVolLevel, this.ctx.currentTime);
      this.musicVolume.connect(this.masterVolume);

      this.sfxVolume = this.ctx.createGain();
      this.sfxVolume.gain.setValueAtTime(this.sfxVolLevel, this.ctx.currentTime);
      this.sfxVolume.connect(this.masterVolume);
    } catch (e) {
      console.warn("Failed to initialize Web Audio context:", e);
    }
  }

  public enableAudio() {
    this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setSfxVolume(level: number) {
    this.sfxVolLevel = level;
    if (this.sfxVolume && this.ctx) {
      this.sfxVolume.gain.setValueAtTime(level, this.ctx.currentTime);
    }
  }

  public setMusicVolume(level: number) {
    this.musVolLevel = level;
    if (this.musicVolume && this.ctx) {
      this.musicVolume.gain.setValueAtTime(level, this.ctx.currentTime);
    }
  }

  public getSfxVolume(): number { return this.sfxVolLevel; }
  public getMusicVolume(): number { return this.musVolLevel; }

  public triggerSFX(type: "click" | "perfect" | "shift" | "hit" | "core" | "rush" | "glitch") {
    this.init();
    if (!this.ctx || !this.sfxVolume) return;

    // Resuming safe-guard
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;

    switch (type) {
      case "click": {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(1000, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(gain);
        gain.connect(this.sfxVolume);
        osc.start();
        osc.stop(t + 0.1);
        break;
      }

      case "core": {
        // Starbell chime effect
        const baseFreq = 880 + (this.currentCombo * 30);
        const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];
        notes.forEach((freq, idx) => {
          const o = this.ctx!.createOscillator();
          const g = this.ctx!.createGain();
          o.type = "sine";
          o.frequency.setValueAtTime(freq, t + idx * 0.03);
          g.gain.setValueAtTime(0.15, t + idx * 0.03);
          g.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.03 + 0.2);
          o.connect(g);
          g.connect(this.sfxVolume!);
          o.start(t + idx * 0.03);
          o.stop(t + idx * 0.03 + 0.25);
        });
        break;
      }

      case "perfect": {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(1800, t + 0.35);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(this.sfxVolume);
        osc.start();
        osc.stop(t + 0.4);
        break;
      }

      case "shift": {
        // Deep bass frequency riser sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(45, t);
        osc.frequency.exponentialRampToValueAtTime(110, t + 0.6);

        filter.type = "lowpass";
        filter.Q.value = 5;
        filter.frequency.setValueAtTime(200, t);
        filter.frequency.exponentialRampToValueAtTime(1400, t + 0.6);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxVolume);

        osc.start();
        osc.stop(t + 0.8);
        break;
      }

      case "hit": {
        // White noise crash effect
        try {
          const bufferSize = this.ctx.sampleRate * 0.3; // 0.3s of noise
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }

          const noiseNode = this.ctx.createBufferSource();
          noiseNode.buffer = buffer;

          const filter = this.ctx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.value = 400;

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.4, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

          noiseNode.connect(filter);
          filter.connect(gain);
          gain.connect(this.sfxVolume);

          noiseNode.start();
          noiseNode.stop(t + 0.35);

          // Sub drop crash component
          const sub = this.ctx.createOscillator();
          const subGain = this.ctx.createGain();
          sub.type = "sine";
          sub.frequency.setValueAtTime(120, t);
          sub.frequency.exponentialRampToValueAtTime(30, t + 0.25);
          subGain.gain.setValueAtTime(0.4, t);
          subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
          sub.connect(subGain);
          subGain.connect(this.sfxVolume);
          sub.start();
          sub.stop(t + 0.3);
        } catch {
          // Fallback if buffer creation errors
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.frequency.setValueAtTime(200, t);
          g.gain.setValueAtTime(0.3, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          o.connect(g);
          g.connect(this.sfxVolume);
          o.start();
          o.stop(t + 0.25);
        }
        break;
      }

      case "rush": {
        // Staggered alarm synth
        for (let i = 0; i < 3; i++) {
          const alarmTime = t + i * 0.12;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(660, alarmTime);
          osc.frequency.setValueAtTime(880, alarmTime + 0.06);
          g.gain.setValueAtTime(0.12, alarmTime);
          g.gain.exponentialRampToValueAtTime(0.001, alarmTime + 0.11);
          osc.connect(g);
          g.connect(this.sfxVolume);
          osc.start(alarmTime);
          osc.stop(alarmTime + 0.12);
        }
        break;
      }

      case "glitch": {
        // Futuristic ring-modulated digital flutter
        const steps = 8;
        const duration = 0.25;
        const stepTime = duration / steps;
        for (let i = 0; i < steps; i++) {
          const modTime = t + i * stepTime;
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = Math.random() > 0.5 ? "sawtooth" : "square";
          o.frequency.setValueAtTime(Math.random() * 2500 + 400, modTime);
          g.gain.setValueAtTime(0.08, modTime);
          g.gain.setValueAtTime(0, modTime + stepTime * 0.82);
          o.connect(g);
          g.connect(this.sfxVolume);
          o.start(modTime);
          o.stop(modTime + stepTime);
        }
        break;
      }
    }
  }

  public updateMusicIntensity(combo: number, speedMultiplier: number, mode: DimensionMode) {
    this.currentCombo = combo;
    this.speedFactor = speedMultiplier;
    this.currentMode = mode;

    this.bpm = 124 + Math.min(combo * 1.5, 30);
    this.stepDuration = 60 / this.bpm / 4;
  }

  public startAmbientMusic() {
    this.init();
    if (!this.ctx || !this.musicVolume) return;
    if (this.isMusicPlaying) return;

    this.isMusicPlaying = true;
    this.beatStep = 0;

    let nextStepTime = this.ctx.currentTime;
    
    const scheduler = () => {
      if (!this.isMusicPlaying || !this.ctx) return;

      while (nextStepTime < this.ctx.currentTime + 0.1) {
        this.playChordStep(this.beatStep, nextStepTime);
        nextStepTime += this.stepDuration;
        this.beatStep = (this.beatStep + 1) % 16;
      }
      this.schedulerInterval = requestAnimationFrame(scheduler);
    };

    scheduler();
  }

  public stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.schedulerInterval) {
      cancelAnimationFrame(this.schedulerInterval);
      this.schedulerInterval = null;
    }
  }

  private playChordStep(step: number, time: number) {
    if (!this.ctx || !this.musicVolume) return;

    const comboIntensity = Math.min(this.currentCombo, 15);

    // 1. Kick Drum (Steps 0, 4, 8, 12 - standard techno four-on-the-floor)
    if (step === 0 || step === 4 || step === 8 || step === 12) {
      this.synthesizeKick(time);
    }

    // 2. Closed Hi-Hat (Steps 2, 6, 10, 14 - offbeat hi-hat)
    if (step === 2 || step === 6 || step === 10 || step === 14) {
      this.synthesizeHihat(time);
    }

    // 3. Sub-Bassline (follows classic driving techno root keys)
    // Keys change based on Active Dimension
    let rootNote = 55; // A1
    if (this.currentMode === DimensionMode.CYBER_MODE) rootNote = 48.99; // G1
    else if (this.currentMode === DimensionMode.DARK_VOID) rootNote = 41.20; // E1
    else if (this.currentMode === DimensionMode.GLITCH_MODE) rootNote = 58.27; // A#1
    else if (this.currentMode === DimensionMode.MIRROR_DIMENSION) rootNote = 65.41; // C2
    else if (this.currentMode === DimensionMode.TIME_FREEZE) rootNote = 36.71; // D1

    // Bassline sequencing: play driving root-octave intervals
    const bassPlayPattern = [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1];
    if (bassPlayPattern[step] === 1) {
      const multiplier = (step % 2 === 0) ? 1 : 2; // jump down & up
      this.synthesizeBass(rootNote * multiplier, time);
    }

    // 4. Kinetic Lead Arpeggio (unlocked progressively as Combo kicks in!)
    if (comboIntensity >= 3) {
      // Seq trigger positions
      const leadPattern = [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0];
      if (leadPattern[step] === 1) {
        // Pentatonic scale arpeggio notes Based on rootNote
        const scale = [1, 1.2, 1.33, 1.5, 1.8];
        const noteIndex = (step * 3 + Math.floor(comboIntensity / 2)) % scale.length;
        const leadFreq = rootNote * 4 * scale[noteIndex]; // 2 octaves up
        this.synthesizeMelody(leadFreq, time);
      }
    }
  }

  private synthesizeKick(time: number) {
    if (!this.ctx || !this.musicVolume) return;

    const kick = this.ctx.createOscillator();
    const kickGain = this.ctx.createGain();

    kick.frequency.setValueAtTime(140, time);
    kick.frequency.exponentialRampToValueAtTime(36, time + 0.12);

    // Warm thick sub kicker
    kickGain.gain.setValueAtTime(0.5, time);
    kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    kick.connect(kickGain);
    kickGain.connect(this.musicVolume);

    kick.start(time);
    kick.stop(time + 0.2);
  }

  private synthesizeHihat(time: number) {
    if (!this.ctx || !this.musicVolume) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(8000, time);

    filter.type = "highpass";
    filter.frequency.value = 6000;

    gain.gain.setValueAtTime(0.08, time);
    gain.gain.setValueAtTime(0.04, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicVolume);

    osc.start(time);
    osc.stop(time + 0.08);
  }

  private synthesizeBass(freq: number, time: number) {
    if (!this.ctx || !this.musicVolume) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sawtooth"; // cyber buzz
    osc.frequency.setValueAtTime(freq, time);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(80, time);
    // Expand envelope frequency with Combo intensity to sound bigger and brighter!
    const sweepRange = 80 + Math.min(this.currentCombo * 35, 450);
    filter.frequency.exponentialRampToValueAtTime(sweepRange, time + 0.03);
    filter.frequency.exponentialRampToValueAtTime(80, time + 0.12);
    filter.Q.value = 2;

    // Pulse compression behavior
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicVolume);

    osc.start(time);
    osc.stop(time + 0.15);
  }

  private synthesizeMelody(freq: number, time: number) {
    if (!this.ctx || !this.musicVolume) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, time);

    filter.type = "lowpass";
    filter.Q.value = 3;
    // Vibrato/tremolo-like rhythmic warmth filter
    filter.frequency.setValueAtTime(freq * 1.5, time);
    filter.frequency.linearRampToValueAtTime(freq * 0.8, time + 0.08);

    gain.gain.setValueAtTime(0.07, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicVolume);

    osc.start(time);
    osc.stop(time + 0.12);
  }
}

// Global active audio single-instance
export const gameAudio = new AudioController();
