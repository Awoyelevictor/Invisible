import React from 'react';
import { Sparkles, Hand, Zap, Ghost, Radio } from 'lucide-react';

export default function StatsOverlay({
  pinchDistance,
  pinchRatio,
  isPinching,
  handCount,
  toolMode,
  erasedPercentage,
  ghostStyle,
  countdownSeconds
}) {
  return (
    <>
      {/* Top Left Floating Tech HUD */}
      <div className="absolute top-16 left-4 z-20 hidden sm:flex flex-col gap-2 pointer-events-none select-none">
        {/* Pinch Dynamics Gauge */}
        <div className="p-3 rounded-2xl bg-slate-950/75 backdrop-blur-md border border-cyan-500/25 shadow-xl text-white w-56">
          <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
            <span className="flex items-center gap-1.5 text-cyan-300 font-semibold uppercase">
              <Zap className={`w-3.5 h-3.5 ${isPinching ? 'text-amber-400 animate-bounce' : 'text-cyan-400'}`} />
              Pinch Proximity
            </span>
            <span className={`font-bold ${isPinching ? 'text-amber-400' : 'text-slate-400'}`}>
              {Math.round(pinchRatio * 100)}%
            </span>
          </div>

          {/* Progress Bar Gauge */}
          <div className="relative w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                isPinching
                  ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 shadow-lg shadow-amber-500/50'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, pinchRatio * 100))}%` }}
            />
          </div>

          {/* Subtext info */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
            <span>Hands: {handCount > 0 ? `${handCount} Detected` : 'None in frame'}</span>
            <span className="text-cyan-400">
              {isPinching ? 'TRIGGER ACTIVE' : 'OPEN HAND'}
            </span>
          </div>
        </div>

        {/* Ghost Coverage HUD */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 backdrop-blur-md border border-indigo-500/20 shadow-lg text-white w-56 flex items-center justify-between text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-indigo-300">
            <Ghost className="w-3.5 h-3.5" />
            Ghost Cutout:
          </span>
          <span className="font-bold text-white bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-700/40">
            {erasedPercentage}%
          </span>
        </div>
      </div>

      {/* Countdown Large Overlay (When capturing clean plate) */}
      {countdownSeconds !== null && countdownSeconds > 0 && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm pointer-events-none animate-in fade-in">
          <div className="relative flex items-center justify-center w-36 h-36 rounded-full bg-cyan-950/80 border-4 border-cyan-400 shadow-2xl shadow-cyan-500/50">
            <span className="text-6xl font-black font-mono text-cyan-300 animate-ping absolute opacity-40">
              {countdownSeconds}
            </span>
            <span className="text-6xl font-black font-mono text-white">
              {countdownSeconds}
            </span>
          </div>
          <p className="text-lg font-bold text-white mt-4 uppercase tracking-widest bg-cyan-950/90 px-4 py-1.5 rounded-full border border-cyan-500/50 shadow-lg">
            Step out of frame to capture background!
          </p>
        </div>
      )}
    </>
  );
}
