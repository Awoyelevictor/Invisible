import React from 'react';
import { X, Camera, Hand, Sparkles, Ghost, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function GuideModal({ isOpen, onClose, onTriggerCleanPlateCapture }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl p-6 bg-slate-900/95 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 text-white overflow-hidden">
        {/* Decorative corner glows */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Ghost className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              How the TikTok Ghost Effect Works
            </h2>
            <p className="text-xs text-cyan-400 font-mono">
              3 STEPS TO BECOMING AN INVISIBLE SPECTER
            </p>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="space-y-3.5 mb-6">
          {/* Step 1 */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold text-sm shrink-0">
              1
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                Capture the Empty Room Background
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Click <strong>"Capture Background"</strong> or use the 3-second countdown. Step out of camera view so the app can snapshot your empty room plate. (Or choose a virtual room preset!)
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-bold text-sm shrink-0">
              2
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                Step Back Into View
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                MediaPipe AI immediately segments your body in real-time and tracks all 21 hand landmarks on both hands.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-pink-500/20 text-pink-300 font-mono font-bold text-sm shrink-0">
              3
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                Pinch Thumb & Index to Erase Your Body!
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Pinch your thumb (point 4) and index fingertip (point 8) together. While pinched, wave your hand over your torso, arms, or face to cut them out and reveal the background behind you!
              </p>
            </div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className="p-3 bg-cyan-950/40 rounded-xl border border-cyan-800/40 mb-6 text-xs text-cyan-200">
          <p className="font-semibold text-cyan-300 mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Pro Tips:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
            <li>Switch to <strong>"Ghost Brush (Restore)"</strong> mode to paint your body back!</li>
            <li>Try different <strong>Ghost FX</strong> styles: True Invisibility, Phantom Hologram, Cyber Matrix, or Cosmic.</li>
            <li>Adjust brush radius for surgical cuts or huge invisible sweeps.</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => {
              onClose();
              if (onTriggerCleanPlateCapture) onTriggerCleanPlateCapture(3);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 transition"
          >
            <Camera className="w-4 h-4" />
            <span>Start 3s Background Countdown</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
