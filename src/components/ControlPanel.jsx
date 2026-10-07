import React, { useState } from 'react';
import { 
  Eraser, 
  Paintbrush, 
  Sparkles, 
  Sliders, 
  Eye, 
  EyeOff, 
  Camera, 
  RefreshCw, 
  Zap, 
  ChevronDown, 
  ChevronUp,
  FlipHorizontal,
  Ghost,
  Skull,
  Wand2,
  Layers
} from 'lucide-react';

export default function ControlPanel({
  toolMode,
  onChangeToolMode,
  pinchAction,
  onChangePinchAction,
  skeletonStyle,
  onChangeSkeletonStyle,
  brushSize,
  onChangeBrushSize,
  brushFeather,
  onChangeBrushFeather,
  ghostStyle,
  onChangeGhostStyle,
  showSkeleton,
  onToggleSkeleton,
  showParticles,
  onToggleParticles,
  showReticle,
  onToggleReticle,
  isMirrored,
  onToggleMirror,
  autoDissolveSec,
  onChangeAutoDissolve,
  onOpenBgSelector,
  onResetEraser,
  onEraseEntireBody,
  onTriggerCleanPlateCapture,
  ghostOpacity,
  onChangeGhostOpacity,
  hasCleanPlate
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('modes'); // 'modes' | 'brush' | 'settings'

  const brushPresets = [30, 60, 100, 160];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-2xl">
      <div className="bg-slate-950/85 backdrop-blur-xl border border-cyan-500/25 rounded-2xl shadow-2xl shadow-cyan-950/50 text-white overflow-hidden transition-all duration-300">
        
        {/* Top Mini Toolbar / Tabs */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('modes')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'modes'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Ghost className="w-3.5 h-3.5" />
              <span>Ghost Modes</span>
            </button>

            <button
              onClick={() => setActiveTab('brush')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'brush'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Brush & FX</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === 'settings'
                  ? 'bg-slate-800 text-slate-200 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Skeleton & Camera</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Background Button */}
            <button
              onClick={onOpenBgSelector}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                hasCleanPlate
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-500/50 text-amber-300 animate-pulse'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {hasCleanPlate ? 'Background Set' : 'Set Background'}
              </span>
            </button>

            {/* Collapse / Expand */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!isCollapsed && (
          <div className="p-3.5 sm:p-4 space-y-3.5 text-xs">
            {/* TAB 1: PINCH GHOST MODES (Matching Video) */}
            {activeTab === 'modes' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Choose Pinch Interaction Style:</span>
                  <span className="text-cyan-400 font-mono">TikTok Viral FX</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Mode 1: Sweep Erase */}
                  <button
                    onClick={() => onChangePinchAction('sweep')}
                    className={`flex flex-col p-3 rounded-xl border text-left transition ${
                      pinchAction === 'sweep'
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-md shadow-cyan-500/20 text-white'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-cyan-300">
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>1. Pinch & Sweep Wipe</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Pinch fingers & wave hand across body to erase parts like an eraser.
                    </p>
                  </button>

                  {/* Mode 2: Instant Ghost Snap (0:16 of video) */}
                  <button
                    onClick={() => onChangePinchAction('instant-cloak')}
                    className={`flex flex-col p-3 rounded-xl border text-left transition ${
                      pinchAction === 'instant-cloak'
                        ? 'bg-indigo-950/80 border-indigo-400 shadow-md shadow-indigo-500/20 text-white'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-indigo-300">
                      <Ghost className="w-3.5 h-3.5" />
                      <span>2. Instant Ghost Snap</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Pinching instantly hides whole body leaving floating hand. Open hand to return!
                    </p>
                  </button>

                  {/* Mode 3: Casper Spooky Skull (0:24 of video) */}
                  <button
                    onClick={() => onChangePinchAction('spooky-skull')}
                    className={`flex flex-col p-3 rounded-xl border text-left transition ${
                      pinchAction === 'spooky-skull'
                        ? 'bg-rose-950/80 border-rose-400 shadow-md shadow-rose-500/20 text-white'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-rose-300">
                      <Skull className="w-3.5 h-3.5" />
                      <span>3. Casper Could Never 💀</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Pinch to vanish with dark eerie vignette and floating spooky skull.
                    </p>
                  </button>
                </div>

                {/* Instant Quick Actions */}
                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800/60 gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onEraseEntireBody}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
                    >
                      <Ghost className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Full Cloak</span>
                    </button>
                    <button
                      onClick={onResetEraser}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reset Cutout</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Tool:</span>
                    <button
                      onClick={() => onChangeToolMode(toolMode === 'erase' ? 'restore' : 'erase')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                        toolMode === 'erase'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      }`}
                    >
                      {toolMode === 'erase' ? 'Eraser Active' : 'Restore Active'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BRUSH & FX */}
            {activeTab === 'brush' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <div className="flex justify-between items-center mb-1 text-slate-300 font-mono text-[11px]">
                      <span>Pinch Eraser Radius:</span>
                      <span className="text-cyan-400 font-bold">{brushSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="220"
                      value={brushSize}
                      onChange={(e) => onChangeBrushSize(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <div className="flex gap-1.5 mt-1.5">
                      {brushPresets.map((size) => (
                        <button
                          key={size}
                          onClick={() => onChangeBrushSize(size)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                            brushSize === size
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {size}px
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1 text-slate-300 font-mono text-[11px]">
                      <span>Feathering (Softness):</span>
                      <span className="text-cyan-400 font-bold">{brushFeather}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={brushFeather}
                      onChange={(e) => onChangeBrushFeather(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>
                </div>

                {/* Ghost Styles */}
                <div className="pt-2 border-t border-slate-800/60">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'invisibility', name: 'Viral Clean Cut' },
                      { id: 'phantom', name: 'Phantom Hologram' },
                      { id: 'cyber', name: 'Cyber Glitch' },
                      { id: 'inverted', name: 'Inverted Cloak' }
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => onChangeGhostStyle(style.id)}
                        className={`p-2 rounded-xl border text-center text-xs transition ${
                          ghostStyle === style.id
                            ? 'bg-indigo-950/80 border-indigo-400 text-white font-semibold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                        }`}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SKELETON & CAMERA */}
            {activeTab === 'settings' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Skeleton Toggle */}
                  <button
                    onClick={onToggleSkeleton}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                      showSkeleton
                        ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>Hand Skeleton</span>
                    {showSkeleton ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                  </button>

                  {/* Reticle / Beam Toggle */}
                  <button
                    onClick={onToggleReticle}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                      showReticle
                        ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>[ PINCH HUD ]</span>
                    <Zap className="w-3.5 h-3.5" />
                  </button>

                  {/* Skeleton Style Toggle */}
                  <button
                    onClick={() => onChangeSkeletonStyle(skeletonStyle === 'mediapipe-classic' ? 'cyber-neon' : 'mediapipe-classic')}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-200"
                  >
                    <span>Skeleton Style:</span>
                    <span className="font-mono text-cyan-400 text-[10px]">
                      {skeletonStyle === 'mediapipe-classic' ? 'Classic' : 'Neon'}
                    </span>
                  </button>

                  {/* Mirror Video */}
                  <button
                    onClick={onToggleMirror}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition ${
                      isMirrored
                        ? 'bg-slate-800 border-slate-600 text-slate-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>Mirror Camera</span>
                    <FlipHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
