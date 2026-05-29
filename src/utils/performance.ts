/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Performance monitoring and optimization utilities
 */

import { PerformanceMetrics } from "../types";

class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private frameTimeHistory: number[] = [];
  private maxHistoryLength = 60;
  private particleCount = 0;

  update(): PerformanceMetrics {
    const now = performance.now();
    const deltaTime = now - this.lastTime;

    this.frameCount++;
    this.frameTimeHistory.push(deltaTime);

    if (this.frameTimeHistory.length > this.maxHistoryLength) {
      this.frameTimeHistory.shift();
    }

    // Update FPS every 100ms
    if (deltaTime >= 100) {
      this.fps = Math.round(this.frameCount / (deltaTime / 1000));
      this.frameCount = 0;
      this.lastTime = now;
    }

    const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;

    return {
      fps: this.fps,
      frameTime: avgFrameTime,
      memoryUsage: this.getMemoryUsage(),
      particleCount: this.particleCount
    };
  }

  setParticleCount(count: number): void {
    this.particleCount = count;
  }

  private getMemoryUsage(): number {
    try {
      const perfMemory = (performance as any).memory;
      if (perfMemory) {
        return Math.round(perfMemory.usedJSHeapSize / 1048576); // Convert to MB
      }
    } catch (e) {
      // performance.memory is not available in all environments
    }
    return 0;
  }

  shouldReduceParticles(metrics: PerformanceMetrics): boolean {
    return metrics.fps < 45 && metrics.particleCount > 100;
  }

  shouldEnableAdvancedEffects(metrics: PerformanceMetrics): boolean {
    return metrics.fps > 55 && metrics.memoryUsage < 100;
  }

  getOptimizationLevel(metrics: PerformanceMetrics): "high" | "medium" | "low" {
    if (metrics.fps < 40) return "low";
    if (metrics.fps < 50) return "medium";
    return "high";
  }

  reset(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.frameTimeHistory = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Debounce utility for expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility for frame-rate dependent operations
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// requestAnimationFrame wrapper with performance tracking
export function createGameLoop(
  callback: (deltaTime: number) => void,
  enableMonitoring = false
): () => void {
  let lastTime = performance.now();
  let animId: number;

  const loop = (currentTime: number) => {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    if (enableMonitoring) {
      const metrics = performanceMonitor.update();
      if (metrics.fps < 30) {
        console.warn(`⚠️ Low FPS detected: ${metrics.fps}`);
      }
    }

    callback(deltaTime);
    animId = requestAnimationFrame(loop);
  };

  animId = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(animId);
  };
}
