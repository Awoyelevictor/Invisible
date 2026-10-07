import React, { useRef } from 'react';
import { Camera, Upload, Sparkles, Image as ImageIcon, Check, RefreshCw } from 'lucide-react';
import { PRESET_BACKGROUNDS } from '../utils/presetBackgrounds.js';

export default function BackgroundSelector({
  isOpen,
  onClose,
  activeBgType,
  onCaptureCameraBackground,
  onSelectPreset,
  onUploadCustomImage,
  onResetBackground,
  countdownSeconds
}) {
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        onUploadCustomImage(img);
        onClose();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl p-6 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Clean Background Plate Source
              </h2>
              <p className="text-xs text-slate-400">
                The reference background revealed when your silhouette is erased
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
          >
            Close
          </button>
        </div>

        {/* Live Camera Snapshot Options */}
        <div className="mb-5 p-4 rounded-xl bg-slate-800/50 border border-slate-700/80">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
            <Camera className="w-4 h-4" /> Live Webcam Capture
          </h3>
          <p className="text-xs text-slate-300 mb-3">
            Step out of the frame so the webcam captures an empty view of your room.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                onCaptureCameraBackground(0);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition shadow-md shadow-cyan-600/30"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Capture Now</span>
            </button>
            <button
              onClick={() => {
                onCaptureCameraBackground(3);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-medium transition"
            >
              <span>3s Timer</span>
            </button>
            <button
              onClick={() => {
                onCaptureCameraBackground(5);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs font-medium transition"
            >
              <span>5s Timer (Step Out)</span>
            </button>
          </div>
        </div>

        {/* Preset Virtual Rooms */}
        <div className="mb-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Or Choose Preset Virtual Plate
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PRESET_BACKGROUNDS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset.id);
                  onClose();
                }}
                className={`relative flex flex-col items-center p-3 rounded-xl border text-center transition ${
                  activeBgType === preset.id
                    ? 'bg-indigo-950/80 border-indigo-400 shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                }`}
              >
                <div
                  className="w-full h-14 rounded-lg mb-2 border border-slate-700/50 flex items-center justify-center font-mono text-[10px] text-slate-300 font-medium"
                  style={{ backgroundColor: preset.color }}
                >
                  {preset.category}
                </div>
                <span className="text-xs font-medium text-slate-200 line-clamp-1">{preset.name}</span>
                {activeBgType === preset.id && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Upload & Reset */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upload Custom Photo</span>
            </button>
          </div>

          <button
            onClick={() => {
              onResetBackground();
              onClose();
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Live Camera</span>
          </button>
        </div>
      </div>
    </div>
  );
}
