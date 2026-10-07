import React from 'react';
import { X, Download, Share2, Sparkles, Check, Film, Image as ImageIcon } from 'lucide-react';

export default function SnapshotModal({ data, onClose }) {
  const [copied, setCopied] = React.useState(false);

  if (!data) return null;

  const { type, url } = data; // type: 'image' or 'video'

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `ghost-mode-${Date.now()}.${type === 'video' ? 'webm' : 'png'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {type === 'video' ? (
              <Film className="w-5 h-5 text-red-400" />
            ) : (
              <ImageIcon className="w-5 h-5 text-cyan-400" />
            )}
            <h3 className="text-base font-bold">
              {type === 'video' ? 'Ghost Mode Recording' : 'Ghost Mode Snapshot'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Preview Container */}
        <div className="p-5 flex items-center justify-center bg-slate-950/50">
          <div className="relative max-h-[60vh] max-w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
            {type === 'video' ? (
              <video
                src={url}
                controls
                autoPlay
                loop
                className="max-h-[55vh] object-contain mx-auto"
              />
            ) : (
              <img
                src={url}
                alt="Ghost Mode Snapshot"
                className="max-h-[55vh] object-contain mx-auto"
              />
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 border-t border-slate-800">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-cyan-400" />}
            <span>{copied ? 'Link Copied!' : 'Share App'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download {type === 'video' ? 'Video (.webm)' : 'Image (.png)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
