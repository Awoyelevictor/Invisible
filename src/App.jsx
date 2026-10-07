import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar.jsx';
import GhostCanvas from './components/GhostCanvas.jsx';
import ControlPanel from './components/ControlPanel.jsx';
import BackgroundSelector from './components/BackgroundSelector.jsx';
import GuideModal from './components/GuideModal.jsx';
import StatsOverlay from './components/StatsOverlay.jsx';
import SnapshotModal from './components/SnapshotModal.jsx';
import { soundFX } from './utils/audioEffects.js';

export default function App() {
  // App Tool States
  const [toolMode, setToolMode] = useState('erase'); // 'erase' | 'restore'
  const [pinchAction, setPinchAction] = useState('sweep'); // 'sweep' | 'instant-cloak' | 'spooky-skull'
  const [skeletonStyle, setSkeletonStyle] = useState('mediapipe-classic'); // 'mediapipe-classic' | 'cyber-neon'
  const [brushSize, setBrushSize] = useState(65);
  const [brushFeather, setBrushFeather] = useState(45);
  const [ghostStyle, setGhostStyle] = useState('invisibility'); // 'invisibility' | 'phantom' | 'cyber' | 'inverted'
  const [ghostOpacity, setGhostOpacity] = useState(0.65);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [showReticle, setShowReticle] = useState(true);
  const [isMirrored, setIsMirrored] = useState(true);
  const [autoDissolveSec, setAutoDissolveSec] = useState(0);

  // Sound & Modals
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isBgSelectorOpen, setIsBgSelectorOpen] = useState(false);
  const [activeBgType, setActiveBgType] = useState('camera-live');
  const [snapshotData, setSnapshotData] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live Stats
  const [stats, setStats] = useState({
    fps: 60,
    isTracking: false,
    isPinching: false,
    pinchRatio: 0,
    pinchDistance: 1,
    handCount: 0,
    hasCleanPlate: false
  });

  // Countdown & Recording
  const [countdownTrigger, setCountdownTrigger] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordTimerRef = useRef(null);

  // Check if first visit to show guide
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('ghost_mode_guide_seen');
    if (!hasSeenGuide) {
      setIsGuideOpen(true);
      localStorage.setItem('ghost_mode_guide_seen', 'true');
    }
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setToolMode((prev) => (prev === 'erase' ? 'restore' : 'erase'));
      } else if (e.key === '1') {
        setPinchAction('sweep');
      } else if (e.key === '2') {
        setPinchAction('instant-cloak');
      } else if (e.key === '3') {
        setPinchAction('spooky-skull');
      } else if (e.key === 'b' || e.key === 'B') {
        handleTriggerCleanPlateCapture(3);
      } else if (e.key === 'r' || e.key === 'R') {
        handleResetEraser();
      } else if (e.key === 'c' || e.key === 'C') {
        handleEraseEntireBody();
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleSound();
      } else if (e.key === 'h' || e.key === 'H') {
        setIsGuideOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sound Toggle Handler
  const handleToggleSound = () => {
    const nextState = soundFX.toggleSound();
    setSoundEnabled(nextState);
  };

  // Trigger Clean Plate Capture Countdown
  const handleTriggerCleanPlateCapture = (seconds = 3) => {
    setCountdownTrigger(seconds);
  };

  // Reset Eraser Mask
  const handleResetEraser = () => {
    if (window.__ghostCanvas?.clearEraserMask) {
      window.__ghostCanvas.clearEraserMask();
    }
  };

  // Erase Entire Body
  const handleEraseEntireBody = () => {
    if (window.__ghostCanvas?.fillEraserMask) {
      window.__ghostCanvas.fillEraserMask();
    }
  };

  // Snapshot Capture
  const handleCaptureSnapshot = async () => {
    if (window.__ghostCanvas?.getSnapshotBlob) {
      const blob = await window.__ghostCanvas.getSnapshotBlob();
      if (blob) {
        const url = URL.createObjectURL(blob);
        soundFX.playCaptureChime();
        setSnapshotData({ type: 'image', url, blob });
      }
    }
  };

  // Video Recording Toggle
  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      clearInterval(recordTimerRef.current);
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleRecordingComplete = (data) => {
    setIsRecording(false);
    clearInterval(recordTimerRef.current);
    setSnapshotData(data);
  };

  // Fullscreen Toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Select Preset Background
  const handleSelectPresetBackground = (presetId) => {
    setActiveBgType(presetId);
    if (window.__ghostCanvas?.setPresetBackground) {
      window.__ghostCanvas.setPresetBackground(presetId);
    }
  };

  // Upload Custom Image
  const handleUploadCustomImage = (imgElement) => {
    setActiveBgType('custom-upload');
    if (window.__ghostCanvas?.setCustomBackgroundPlate) {
      window.__ghostCanvas.setCustomBackgroundPlate(imgElement);
    }
  };

  // Reset Background to Live Camera
  const handleResetBackground = () => {
    setActiveBgType('camera-live');
    if (window.__ghostCanvas?.resetToLiveCamera) {
      window.__ghostCanvas.resetToLiveCamera();
    }
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden font-sans select-none">
      {/* Top Navbar */}
      <Navbar
        fps={stats.fps}
        isTracking={stats.isTracking}
        isPinching={stats.isPinching}
        isRecording={isRecording}
        recordingTime={recordingSeconds}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenSettings={() => setIsBgSelectorOpen(true)}
        onCaptureSnapshot={handleCaptureSnapshot}
        onToggleRecord={handleToggleRecord}
        onResetEraser={handleResetEraser}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        ghostModeActive={true}
      />

      {/* Main Interactive Canvas Area */}
      <GhostCanvas
        toolMode={toolMode}
        pinchAction={pinchAction}
        skeletonStyle={skeletonStyle}
        brushSize={brushSize}
        brushFeather={brushFeather}
        ghostStyle={ghostStyle}
        ghostOpacity={ghostOpacity}
        showSkeleton={showSkeleton}
        showParticles={showParticles}
        showReticle={showReticle}
        isMirrored={isMirrored}
        autoDissolveSec={autoDissolveSec}
        onStatsUpdate={setStats}
        onCleanPlateStatusChange={(hasPlate) => setStats((prev) => ({ ...prev, hasCleanPlate: hasPlate }))}
        triggerCaptureCountdown={countdownTrigger}
        onCountdownEnd={() => setCountdownTrigger(null)}
        isRecording={isRecording}
        onRecordingComplete={handleRecordingComplete}
      />

      {/* Live Cyber Stats HUD Overlay */}
      <StatsOverlay
        pinchDistance={stats.pinchDistance}
        pinchRatio={stats.pinchRatio}
        isPinching={stats.isPinching}
        handCount={stats.handCount}
        toolMode={toolMode}
        erasedPercentage={stats.hasCleanPlate ? (pinchAction === 'instant-cloak' && stats.isPinching ? 100 : 42) : 0}
        ghostStyle={ghostStyle}
        countdownSeconds={countdownTrigger}
      />

      {/* Bottom Floating Control Panel */}
      <ControlPanel
        toolMode={toolMode}
        onChangeToolMode={setToolMode}
        pinchAction={pinchAction}
        onChangePinchAction={setPinchAction}
        skeletonStyle={skeletonStyle}
        onChangeSkeletonStyle={setSkeletonStyle}
        brushSize={brushSize}
        onChangeBrushSize={setBrushSize}
        brushFeather={brushFeather}
        onChangeBrushFeather={setBrushFeather}
        ghostStyle={ghostStyle}
        onChangeGhostStyle={setGhostStyle}
        ghostOpacity={ghostOpacity}
        onChangeGhostOpacity={setGhostOpacity}
        showSkeleton={showSkeleton}
        onToggleSkeleton={() => setShowSkeleton(!showSkeleton)}
        showParticles={showParticles}
        onToggleParticles={() => setShowParticles(!showParticles)}
        showReticle={showReticle}
        onToggleReticle={() => setShowReticle(!showReticle)}
        isMirrored={isMirrored}
        onToggleMirror={() => setIsMirrored(!isMirrored)}
        autoDissolveSec={autoDissolveSec}
        onChangeAutoDissolve={setAutoDissolveSec}
        onOpenBgSelector={() => setIsBgSelectorOpen(true)}
        onResetEraser={handleResetEraser}
        onEraseEntireBody={handleEraseEntireBody}
        onTriggerCleanPlateCapture={handleTriggerCleanPlateCapture}
        hasCleanPlate={stats.hasCleanPlate}
      />

      {/* Background Plate Selector Modal */}
      <BackgroundSelector
        isOpen={isBgSelectorOpen}
        onClose={() => setIsBgSelectorOpen(false)}
        activeBgType={activeBgType}
        onCaptureCameraBackground={handleTriggerCleanPlateCapture}
        onSelectPreset={handleSelectPresetBackground}
        onUploadCustomImage={handleUploadCustomImage}
        onResetBackground={handleResetBackground}
        countdownSeconds={countdownTrigger}
      />

      {/* Step-by-Step Interactive Guide */}
      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onTriggerCleanPlateCapture={handleTriggerCleanPlateCapture}
      />

      {/* Snapshot / Video Output Modal */}
      <SnapshotModal
        data={snapshotData}
        onClose={() => setSnapshotData(null)}
      />
    </div>
  );
}
