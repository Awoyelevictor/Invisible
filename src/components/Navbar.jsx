import React from 'react';
import { 
  Ghost, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Maximize, 
  Minimize, 
  Camera, 
  Video, 
  RefreshCw,
  Eye,
  Sliders
} from 'lucide-react';

export default function Navbar({
  fps,
  isTracking,
  isPinching,
  isRecording,
  recordingTime,
  soundEnabled,
  onToggleSound,
  onOpenGuide,
  onOpenSettings,
  onCaptureSnapshot,
  onToggleRecord,
  onResetEraser,
  isFullscreen,
  onToggleFullscreen,
  ghostModeActive
}) {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60 text-white">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/20 text-white">
          <Ghost className="w-5 h-5 animate-ghost-float" />
          <div className="absolute -inset-0.5 rounded-xl bg-cyan-400/30 blur-sm -z-10" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-wider uppercase bg-gradient-to-r from-white via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
              Ghost Mode FX
            </h1>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-700/50">
              MediaPipe AI
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Pinch fingers to erase silhouette & reveal background
          </p>
        </div>
      </div>

      {/* Center Live Badges */}
      <div className="flex items-center gap-2 text-xs font-mono">
        {/* Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300">
          <span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span>{isTracking ? 'AI TRACKING' : 'INITIALIZING'}</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-semibold">{fps} FPS</span>
        </div>

        {/* Pinch Badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
          isPinching
            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/30 font-bold scale-105'
            : 'bg-slate-900/90 border-slate-800 text-slate-400'
        }`}>
          <Sparkles className={`w-3.5 h-3.5 ${isPinching ? 'text-cyan-300 animate-spin' : 'text-slate-500'}`} />
          <span>{isPinching ? 'PINCH ACTIVE (ERASING)' : 'READY TO PINCH'}</span>
        </div>

        {/* Recording Timer Badge */}
        {isRecording && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-400 animate-pulse font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>REC {recordingTime}s</span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Reset Mask Button */}
        <button
          onClick={onResetEraser}
          title="Reset Ghost Mask (Restore full body)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-200 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Reset Mask</span>
        </button>

        {/* Snapshot Photo Button */}
        <button
          onClick={onCaptureSnapshot}
          title="Take Snapshot Photo"
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-cyan-600/30 text-slate-200 hover:text-cyan-300 border border-slate-700 transition"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Record Video Button */}
        <button
          onClick={onToggleRecord}
          title={isRecording ? 'Stop Recording' : 'Record Video Clip'}
          className={`p-2 rounded-lg border transition ${
            isRecording
              ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-500/40 animate-pulse'
              : 'bg-slate-800/80 hover:bg-red-600/20 text-slate-200 hover:text-red-400 border-slate-700'
          }`}
        >
          <Video className="w-4 h-4" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Sci-Fi Audio' : 'Unmute Sci-Fi Audio'}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        {/* Guide / Instructions */}
        <button
          onClick={onOpenGuide}
          title="How to Use Ghost Mode"
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-cyan-900/40 text-cyan-300 border border-cyan-800/50 transition"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={onToggleFullscreen}
          title="Toggle Fullscreen"
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition hidden sm:block"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
