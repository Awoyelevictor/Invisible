import React, { useRef, useEffect, useState, useCallback } from 'react';
import { loadMediaPipeLibs } from '../utils/mediapipeLoader.js';
import { soundFX } from '../utils/audioEffects.js';
import { ParticleSystem } from '../utils/particleSystem.js';
import { PRESET_BACKGROUNDS } from '../utils/presetBackgrounds.js';
import { Camera, RefreshCw, AlertCircle, Sparkles, Play, ShieldAlert, Skull, Ghost, Zap } from 'lucide-react';

export default function GhostCanvas({
  toolMode,
  pinchAction = 'sweep', // 'sweep' | 'instant-cloak' | 'spooky-skull'
  skeletonStyle = 'mediapipe-classic', // 'mediapipe-classic' | 'cyber-neon' | 'spectral'
  brushSize,
  brushFeather,
  ghostStyle,
  ghostOpacity,
  showSkeleton,
  showParticles,
  showReticle,
  isMirrored,
  autoDissolveSec,
  onStatsUpdate,
  onCleanPlateStatusChange,
  triggerCaptureCountdown,
  onCountdownEnd,
  isRecording,
  onRecordingComplete
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const mainCanvasRef = useRef(null);
  
  // Offscreen canvases for pipeline
  const cleanPlateCanvasRef = useRef(null);
  const eraserMaskCanvasRef = useRef(null);
  const tempPersonCanvasRef = useRef(null);

  // MediaPipe instances & state
  const selfieSegmentationRef = useRef(null);
  const handsRef = useRef(null);
  const isProcessingFrameRef = useRef(false);
  const animationFrameIdRef = useRef(null);
  const particleSystemRef = useRef(new ParticleSystem());

  // MediaRecorder refs
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Component states
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [countdown, setCountdown] = useState(null);

  // Latest props refs for 60fps loop
  const propsRef = useRef({
    toolMode,
    pinchAction,
    skeletonStyle,
    brushSize,
    brushFeather,
    ghostStyle,
    ghostOpacity,
    showSkeleton,
    showParticles,
    showReticle,
    isMirrored,
    autoDissolveSec
  });

  useEffect(() => {
    propsRef.current = {
      toolMode,
      pinchAction,
      skeletonStyle,
      brushSize,
      brushFeather,
      ghostStyle,
      ghostOpacity,
      showSkeleton,
      showParticles,
      showReticle,
      isMirrored,
      autoDissolveSec
    };
  }, [toolMode, pinchAction, skeletonStyle, brushSize, brushFeather, ghostStyle, ghostOpacity, showSkeleton, showParticles, showReticle, isMirrored, autoDissolveSec]);

  // Current frame data cache
  const latestMaskRef = useRef(null);
  const latestHandResultsRef = useRef(null);
  const hasCleanPlateRef = useRef(false);
  const lastPinchPosRef = useRef(null);
  const fpsTrackerRef = useRef({ frames: 0, lastTime: performance.now(), currentFps: 60 });
  const wasPinchingRef = useRef(false);

  // Initialize Offscreen Buffers
  const initCanvases = (width = 1280, height = 720) => {
    if (!cleanPlateCanvasRef.current) {
      cleanPlateCanvasRef.current = document.createElement('canvas');
    }
    cleanPlateCanvasRef.current.width = width;
    cleanPlateCanvasRef.current.height = height;

    if (!eraserMaskCanvasRef.current) {
      eraserMaskCanvasRef.current = document.createElement('canvas');
    }
    eraserMaskCanvasRef.current.width = width;
    eraserMaskCanvasRef.current.height = height;
    const eraserCtx = eraserMaskCanvasRef.current.getContext('2d');
    eraserCtx.clearRect(0, 0, width, height);

    if (!tempPersonCanvasRef.current) {
      tempPersonCanvasRef.current = document.createElement('canvas');
    }
    tempPersonCanvasRef.current.width = width;
    tempPersonCanvasRef.current.height = height;

    if (mainCanvasRef.current) {
      mainCanvasRef.current.width = width;
      mainCanvasRef.current.height = height;
    }
  };

  // Helper to snapshot current live frame into Clean Plate
  const captureCleanPlate = useCallback(() => {
    if (!videoRef.current || !cleanPlateCanvasRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const width = video.videoWidth;
    const height = video.videoHeight;
    initCanvases(width, height);

    const plateCtx = cleanPlateCanvasRef.current.getContext('2d');
    plateCtx.save();
    if (propsRef.current.isMirrored) {
      plateCtx.translate(width, 0);
      plateCtx.scale(-1, 1);
    }
    plateCtx.drawImage(video, 0, 0, width, height);
    plateCtx.restore();

    hasCleanPlateRef.current = true;
    onCleanPlateStatusChange(true);
    soundFX.playCaptureChime();
  }, [onCleanPlateStatusChange]);

  // Set preset background or custom image as Clean Plate
  const setCustomBackgroundPlate = useCallback((imageOrCanvas) => {
    if (!cleanPlateCanvasRef.current) {
      initCanvases(1280, 720);
    }
    const width = cleanPlateCanvasRef.current.width;
    const height = cleanPlateCanvasRef.current.height;
    const plateCtx = cleanPlateCanvasRef.current.getContext('2d');
    plateCtx.clearRect(0, 0, width, height);
    plateCtx.drawImage(imageOrCanvas, 0, 0, width, height);

    hasCleanPlateRef.current = true;
    onCleanPlateStatusChange(true);
    soundFX.playCaptureChime();
  }, [onCleanPlateStatusChange]);

  // Handle countdown trigger from parent
  useEffect(() => {
    if (triggerCaptureCountdown !== null && triggerCaptureCountdown >= 0) {
      if (triggerCaptureCountdown === 0) {
        captureCleanPlate();
        onCountdownEnd();
      } else {
        setCountdown(triggerCaptureCountdown);
        soundFX.playCountdownBeep(false);

        let count = triggerCaptureCountdown;
        const interval = setInterval(() => {
          count -= 1;
          if (count > 0) {
            setCountdown(count);
            soundFX.playCountdownBeep(false);
          } else {
            clearInterval(interval);
            setCountdown(null);
            soundFX.playCountdownBeep(true);
            captureCleanPlate();
            onCountdownEnd();
          }
        }, 1000);

        return () => clearInterval(interval);
      }
    }
  }, [triggerCaptureCountdown, captureCleanPlate, onCountdownEnd]);

  // Reset / Clear eraser mask
  const clearEraserMask = useCallback(() => {
    if (!eraserMaskCanvasRef.current) return;
    const ctx = eraserMaskCanvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, eraserMaskCanvasRef.current.width, eraserMaskCanvasRef.current.height);
    soundFX.playResetWhoosh();
  }, []);

  // Fill eraser mask (Erase entire body)
  const fillEraserMask = useCallback(() => {
    if (!eraserMaskCanvasRef.current) return;
    const ctx = eraserMaskCanvasRef.current.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, eraserMaskCanvasRef.current.width, eraserMaskCanvasRef.current.height);
    soundFX.playCaptureChime();
  }, []);

  // Expose methods to parent window / ref handlers
  useEffect(() => {
    window.__ghostCanvas = {
      captureCleanPlate,
      setCustomBackgroundPlate,
      clearEraserMask,
      fillEraserMask,
      setPresetBackground: (id) => {
        const preset = PRESET_BACKGROUNDS.find((p) => p.id === id);
        if (preset) {
          const w = mainCanvasRef.current?.width || 1280;
          const h = mainCanvasRef.current?.height || 720;
          const cvs = preset.generateCanvas(w, h);
          setCustomBackgroundPlate(cvs);
        }
      },
      resetToLiveCamera: () => {
        hasCleanPlateRef.current = false;
        onCleanPlateStatusChange(false);
      },
      getSnapshotBlob: () => {
        return new Promise((resolve) => {
          if (!mainCanvasRef.current) return resolve(null);
          mainCanvasRef.current.toBlob((blob) => {
            resolve(blob);
          }, 'image/png');
        });
      }
    };
  }, [captureCleanPlate, setCustomBackgroundPlate, clearEraserMask, fillEraserMask, onCleanPlateStatusChange]);

  // Initialize MediaPipe Models & Camera
  useEffect(() => {
    let isCancelled = false;

    async function initAI() {
      try {
        setModelLoading(true);
        const libs = await loadMediaPipeLibs();

        if (isCancelled) return;

        // 1. Initialize SelfieSegmentation
        const selfie = new libs.SelfieSegmentation({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
        });

        selfie.setOptions({
          modelSelection: 1 // 1 for landscape full body model
        });

        selfie.onResults((results) => {
          latestMaskRef.current = results.segmentationMask;
        });
        selfieSegmentationRef.current = selfie;

        // 2. Initialize Hands
        const hands = new libs.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.6,
          minTrackingConfidence: 0.6
        });

        hands.onResults((results) => {
          latestHandResultsRef.current = results;
        });
        handsRef.current = hands;

        // 3. Start Camera Stream
        await startCamera();
        setModelLoading(false);
      } catch (err) {
        console.error('MediaPipe initialization failed:', err);
        setCameraError(err.message || 'Failed to initialize camera / AI models.');
        setModelLoading(false);
      }
    }

    initAI();

    return () => {
      isCancelled = true;
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  // Start Camera Stream
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          initCanvases(videoRef.current.videoWidth || 1280, videoRef.current.videoHeight || 720);
          setCameraReady(true);
          startProcessingLoop();
        };
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access denied or unavailable. Please enable webcam permissions.');
    }
  };

  // Main Processing & Rendering Loop (60 FPS)
  const startProcessingLoop = () => {
    const processFrame = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2 || !mainCanvasRef.current) {
        animationFrameIdRef.current = requestAnimationFrame(processFrame);
        return;
      }

      const video = videoRef.current;
      const width = mainCanvasRef.current.width;
      const height = mainCanvasRef.current.height;
      const mainCtx = mainCanvasRef.current.getContext('2d');
      const props = propsRef.current;

      // Update FPS calculation
      fpsTrackerRef.current.frames++;
      const now = performance.now();
      if (now - fpsTrackerRef.current.lastTime >= 500) {
        fpsTrackerRef.current.currentFps = Math.round((fpsTrackerRef.current.frames * 1000) / (now - fpsTrackerRef.current.lastTime));
        fpsTrackerRef.current.frames = 0;
        fpsTrackerRef.current.lastTime = now;
      }

      // Send to MediaPipe if not already processing
      if (!isProcessingFrameRef.current) {
        isProcessingFrameRef.current = true;
        Promise.all([
          selfieSegmentationRef.current ? selfieSegmentationRef.current.send({ image: video }) : Promise.resolve(),
          handsRef.current ? handsRef.current.send({ image: video }) : Promise.resolve()
        ]).finally(() => {
          isProcessingFrameRef.current = false;
        });
      }

      // ----------------------------------------------------
      // HAND TRACKING & PINCH DETECTION CALCULATION
      // ----------------------------------------------------
      const handResults = latestHandResultsRef.current;
      let isAnyPinching = false;
      let minPinchDist = 1.0;
      let maxPinchRatio = 0.0;
      let activePinchPoint = null;
      let detectedHandCount = 0;

      if (handResults && handResults.multiHandLandmarks && handResults.multiHandLandmarks.length > 0) {
        detectedHandCount = handResults.multiHandLandmarks.length;

        handResults.multiHandLandmarks.forEach((landmarks) => {
          // Landmark 4: Thumb Tip, Landmark 8: Index Tip, Landmark 0: Wrist
          const thumb = landmarks[4];
          const index = landmarks[8];
          const wrist = landmarks[0];

          // Dynamic palm scale
          const palmScale = Math.hypot(landmarks[9].x - wrist.x, landmarks[9].y - wrist.y) || 0.2;
          const pinchThreshold = Math.max(0.045, palmScale * 0.38);

          const dx = thumb.x - index.x;
          const dy = thumb.y - index.y;
          const dist = Math.hypot(dx, dy);

          const ratio = Math.max(0, Math.min(1, 1 - dist / pinchThreshold));
          if (ratio > maxPinchRatio) maxPinchRatio = ratio;
          if (dist < minPinchDist) minPinchDist = dist;

          const isPinched = dist <= pinchThreshold || ratio >= 0.85;

          if (isPinched) {
            isAnyPinching = true;

            let px = (thumb.x + index.x) / 2;
            let py = (thumb.y + index.y) / 2;

            if (props.isMirrored) {
              px = 1 - px;
            }

            const canvasX = px * width;
            const canvasY = py * height;
            activePinchPoint = { x: canvasX, y: canvasY, rawThumb: thumb, rawIndex: index };

            // Sound cue on initial pinch trigger
            if (!wasPinchingRef.current) {
              soundFX.playPinchStart();
              if (props.pinchAction === 'spooky-skull') {
                soundFX.playSpookyChime();
              }
            }

            // If Sweep Brush mode: paint eraser mask
            if (props.pinchAction === 'sweep' && eraserMaskCanvasRef.current) {
              const eraserCtx = eraserMaskCanvasRef.current.getContext('2d');
              eraserCtx.save();

              const radius = props.brushSize;
              const feather = props.brushFeather / 100;

              if (props.toolMode === 'erase') {
                eraserCtx.globalCompositeOperation = 'source-over';
                const grad = eraserCtx.createRadialGradient(canvasX, canvasY, Math.max(1, radius * (1 - feather)), canvasX, canvasY, radius);
                grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                eraserCtx.fillStyle = grad;
                eraserCtx.beginPath();
                eraserCtx.arc(canvasX, canvasY, radius, 0, Math.PI * 2);
                eraserCtx.fill();

                // Continuous line interpolation
                if (lastPinchPosRef.current) {
                  const lx = lastPinchPosRef.current.x;
                  const ly = lastPinchPosRef.current.y;
                  const steps = Math.ceil(Math.hypot(canvasX - lx, canvasY - ly) / (radius * 0.3));
                  for (let i = 1; i < steps; i++) {
                    const ix = lx + (canvasX - lx) * (i / steps);
                    const iy = ly + (canvasY - ly) * (i / steps);
                    const igrad = eraserCtx.createRadialGradient(ix, iy, Math.max(1, radius * (1 - feather)), ix, iy, radius);
                    igrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
                    igrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    eraserCtx.fillStyle = igrad;
                    eraserCtx.beginPath();
                    eraserCtx.arc(ix, iy, radius, 0, Math.PI * 2);
                    eraserCtx.fill();
                  }
                }
              } else {
                eraserCtx.globalCompositeOperation = 'destination-out';
                const grad = eraserCtx.createRadialGradient(canvasX, canvasY, Math.max(1, radius * (1 - feather)), canvasX, canvasY, radius);
                grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                eraserCtx.fillStyle = grad;
                eraserCtx.beginPath();
                eraserCtx.arc(canvasX, canvasY, radius, 0, Math.PI * 2);
                eraserCtx.fill();
              }
              eraserCtx.restore();
            }

            // Emit particles
            if (props.showParticles) {
              particleSystemRef.current.emitPinchSparks(
                canvasX,
                canvasY,
                3,
                props.ghostStyle === 'cyber' ? 'cyber' : 'spectral'
              );
            }

            soundFX.playEraseHum(maxPinchRatio);
          }
        });
      }

      wasPinchingRef.current = isAnyPinching;

      if (isAnyPinching) {
        lastPinchPosRef.current = activePinchPoint;
      } else {
        lastPinchPosRef.current = null;
      }

      // Auto-dissolve / healing mask
      if (props.autoDissolveSec > 0 && eraserMaskCanvasRef.current) {
        const eraserCtx = eraserMaskCanvasRef.current.getContext('2d');
        eraserCtx.save();
        eraserCtx.globalCompositeOperation = 'destination-out';
        eraserCtx.fillStyle = `rgba(0, 0, 0, ${0.02 / props.autoDissolveSec})`;
        eraserCtx.fillRect(0, 0, width, height);
        eraserCtx.restore();
      }

      // ----------------------------------------------------
      // COMPOSITE RENDERING PIPELINE
      // ----------------------------------------------------
      mainCtx.clearRect(0, 0, width, height);

      // 1. Render Clean Background Plate (or live video fallback)
      if (hasCleanPlateRef.current && cleanPlateCanvasRef.current) {
        mainCtx.drawImage(cleanPlateCanvasRef.current, 0, 0, width, height);
      } else {
        mainCtx.save();
        if (props.isMirrored) {
          mainCtx.translate(width, 0);
          mainCtx.scale(-1, 1);
        }
        mainCtx.drawImage(video, 0, 0, width, height);
        mainCtx.restore();
      }

      // Spooky mode dark cinematic vignette at climax (as seen at 0:24)
      if (props.pinchAction === 'spooky-skull' && isAnyPinching) {
        mainCtx.save();
        const vigGrad = mainCtx.createRadialGradient(width / 2, height / 2, width * 0.2, width / 2, height / 2, width * 0.7);
        vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
        mainCtx.fillStyle = vigGrad;
        mainCtx.fillRect(0, 0, width, height);
        mainCtx.restore();
      }

      // 2. Render Isolated & Ghosted Human Silhouette
      const mask = latestMaskRef.current;
      const shouldHideFullBody = (props.pinchAction === 'instant-cloak' || props.pinchAction === 'spooky-skull') && isAnyPinching;

      if (mask && tempPersonCanvasRef.current && !shouldHideFullBody) {
        const tempCtx = tempPersonCanvasRef.current.getContext('2d');
        tempCtx.clearRect(0, 0, width, height);

        // Draw live webcam video
        tempCtx.save();
        if (props.isMirrored) {
          tempCtx.translate(width, 0);
          tempCtx.scale(-1, 1);
        }
        tempCtx.drawImage(video, 0, 0, width, height);
        tempCtx.restore();

        // Mask person from background using MediaPipe SelfieSegmentation
        tempCtx.save();
        tempCtx.globalCompositeOperation = 'destination-in';
        if (props.isMirrored) {
          tempCtx.translate(width, 0);
          tempCtx.scale(-1, 1);
        }
        tempCtx.drawImage(mask, 0, 0, width, height);
        tempCtx.restore();

        // Apply Eraser Mask cutout (for Sweep mode)
        if (props.pinchAction === 'sweep' && eraserMaskCanvasRef.current) {
          tempCtx.save();
          if (props.ghostStyle === 'inverted') {
            tempCtx.globalCompositeOperation = 'destination-in';
          } else {
            tempCtx.globalCompositeOperation = 'destination-out';
          }
          tempCtx.drawImage(eraserMaskCanvasRef.current, 0, 0, width, height);
          tempCtx.restore();
        }

        // Draw onto Main Canvas with Ghost Style
        mainCtx.save();
        if (props.ghostStyle === 'phantom') {
          mainCtx.globalAlpha = props.ghostOpacity || 0.65;
          mainCtx.drawImage(tempPersonCanvasRef.current, 0, 0, width, height);
          mainCtx.globalAlpha = 0.12;
          mainCtx.fillStyle = '#06b6d4';
          for (let y = 0; y < height; y += 4) {
            mainCtx.fillRect(0, y, width, 1.5);
          }
        } else if (props.ghostStyle === 'cyber') {
          mainCtx.globalAlpha = 0.8;
          mainCtx.drawImage(tempPersonCanvasRef.current, -2, 0, width, height);
          mainCtx.drawImage(tempPersonCanvasRef.current, 2, 0, width, height);
          mainCtx.globalAlpha = 1.0;
          mainCtx.drawImage(tempPersonCanvasRef.current, 0, 0, width, height);
        } else {
          mainCtx.globalAlpha = 1.0;
          mainCtx.drawImage(tempPersonCanvasRef.current, 0, 0, width, height);
        }
        mainCtx.restore();
      }

      // 3. Render Particles
      if (props.showParticles) {
        particleSystemRef.current.updateAndDraw(mainCtx, width, height);
      }

      // 4. Render Floating Spooky Emoji / Graphic (Casper Could Never 💀👻)
      if (props.pinchAction === 'spooky-skull' && isAnyPinching && activePinchPoint) {
        mainCtx.save();
        const emojiX = activePinchPoint.x;
        const emojiY = activePinchPoint.y - 45;

        // Eerie glowing halo
        const haloGrad = mainCtx.createRadialGradient(emojiX, emojiY, 10, emojiX, emojiY, 80);
        haloGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        haloGrad.addColorStop(0.4, 'rgba(6, 182, 212, 0.4)');
        haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        mainCtx.fillStyle = haloGrad;
        mainCtx.beginPath();
        mainCtx.arc(emojiX, emojiY, 80, 0, Math.PI * 2);
        mainCtx.fill();

        mainCtx.font = '54px Apple Color Emoji, Segoe UI Emoji, sans-serif';
        mainCtx.textAlign = 'center';
        mainCtx.textBaseline = 'middle';
        mainCtx.fillText('💀', emojiX, emojiY);
        mainCtx.restore();
      }

      // 5. Render Hand Skeleton & Exact TikTok Overlay Style
      if (handResults && handResults.multiHandLandmarks) {
        handResults.multiHandLandmarks.forEach((landmarks) => {
          const thumb = landmarks[4];
          const index = landmarks[8];

          let tx = thumb.x * width;
          let ty = thumb.y * height;
          let ix = index.x * width;
          let iy = index.y * height;

          if (props.isMirrored) {
            tx = width - tx;
            ix = width - ix;
          }

          const mx = (tx + ix) / 2;
          const my = (ty + iy) / 2;

          // Draw Skeleton Lines
          if (props.showSkeleton) {
            mainCtx.save();

            const connections = [
              [0, 1], [1, 2], [2, 3], [3, 4], // thumb
              [0, 5], [5, 6], [6, 7], [7, 8], // index
              [5, 9], [9, 10], [10, 11], [11, 12], // middle
              [9, 13], [13, 14], [14, 15], [15, 16], // ring
              [13, 17], [17, 18], [18, 19], [19, 20], [0, 17] // pinky & palm
            ];

            if (props.skeletonStyle === 'mediapipe-classic') {
              // Exact TikTok MediaPipe style: crisp white bones and coral/orange joints
              mainCtx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
              mainCtx.lineWidth = 2.5;

              connections.forEach(([i1, i2]) => {
                const p1 = landmarks[i1];
                const p2 = landmarks[i2];
                let x1 = p1.x * width;
                let y1 = p1.y * height;
                let x2 = p2.x * width;
                let y2 = p2.y * height;
                if (props.isMirrored) {
                  x1 = width - x1;
                  x2 = width - x2;
                }
                mainCtx.beginPath();
                mainCtx.moveTo(x1, y1);
                mainCtx.lineTo(x2, y2);
                mainCtx.stroke();
              });

              // Coral landmark dots
              landmarks.forEach((pt, idx) => {
                let px = pt.x * width;
                let py = pt.y * height;
                if (props.isMirrored) px = width - px;

                mainCtx.fillStyle = '#ff6b4a';
                mainCtx.strokeStyle = '#ffffff';
                mainCtx.lineWidth = 1.5;
                mainCtx.beginPath();
                mainCtx.arc(px, py, (idx === 4 || idx === 8) ? 5.5 : 3.5, 0, Math.PI * 2);
                mainCtx.fill();
                mainCtx.stroke();
              });
            } else {
              // Cyber Neon Style
              mainCtx.strokeStyle = isAnyPinching ? 'rgba(6, 182, 212, 0.95)' : 'rgba(99, 102, 241, 0.7)';
              mainCtx.lineWidth = 2.5;
              mainCtx.shadowColor = isAnyPinching ? '#06b6d4' : '#6366f1';
              mainCtx.shadowBlur = 10;

              connections.forEach(([i1, i2]) => {
                const p1 = landmarks[i1];
                const p2 = landmarks[i2];
                let x1 = p1.x * width;
                let y1 = p1.y * height;
                let x2 = p2.x * width;
                let y2 = p2.y * height;
                if (props.isMirrored) {
                  x1 = width - x1;
                  x2 = width - x2;
                }
                mainCtx.beginPath();
                mainCtx.moveTo(x1, y1);
                mainCtx.lineTo(x2, y2);
                mainCtx.stroke();
              });

              landmarks.forEach((pt, idx) => {
                let px = pt.x * width;
                let py = pt.y * height;
                if (props.isMirrored) px = width - px;

                mainCtx.fillStyle = (idx === 4 || idx === 8) ? '#38bdf8' : '#e0e7ff';
                mainCtx.beginPath();
                mainCtx.arc(px, py, (idx === 4 || idx === 8) ? 5 : 3, 0, Math.PI * 2);
                mainCtx.fill();
              });
            }

            mainCtx.restore();
          }

          // Exact Floating "PINCH MODE: ACTIVATED" HUD tag & Energy Beam
          if (props.showReticle) {
            mainCtx.save();

            // Energy connecting line between thumb & index
            const beamAlpha = 0.4 + maxPinchRatio * 0.6;
            mainCtx.strokeStyle = isAnyPinching ? `rgba(251, 191, 36, ${beamAlpha})` : `rgba(56, 189, 248, ${beamAlpha})`;
            mainCtx.lineWidth = 2 + maxPinchRatio * 3;
            mainCtx.beginPath();
            mainCtx.moveTo(tx, ty);
            mainCtx.lineTo(ix, iy);
            mainCtx.stroke();

            // Floating Bracket HUD (Just like in the viral video!)
            if (isAnyPinching) {
              const tagX = mx + 25;
              const tagY = my - 30;

              // Tech background pill
              mainCtx.fillStyle = 'rgba(15, 23, 42, 0.9)';
              mainCtx.strokeStyle = '#f59e0b';
              mainCtx.lineWidth = 1.5;
              mainCtx.shadowColor = '#f59e0b';
              mainCtx.shadowBlur = 8;
              mainCtx.beginPath();
              mainCtx.roundRect(tagX, tagY, 150, 26, 6);
              mainCtx.fill();
              mainCtx.stroke();

              // Glowing text
              mainCtx.fillStyle = '#fbbf24';
              mainCtx.font = 'bold 11px JetBrains Mono, monospace';
              mainCtx.textAlign = 'left';
              mainCtx.textBaseline = 'middle';
              mainCtx.fillText('[ PINCH MODE: ON ]', tagX + 10, tagY + 13);
            }

            mainCtx.restore();
          }
        });
      }

      // Update parent stats
      onStatsUpdate({
        fps: fpsTrackerRef.current.currentFps,
        isTracking: detectedHandCount > 0 || !!latestMaskRef.current,
        isPinching: isAnyPinching,
        pinchRatio: maxPinchRatio,
        pinchDistance: minPinchDist,
        handCount: detectedHandCount,
        hasCleanPlate: hasCleanPlateRef.current
      });

      animationFrameIdRef.current = requestAnimationFrame(processFrame);
    };

    animationFrameIdRef.current = requestAnimationFrame(processFrame);
  };

  // Recording Management (MediaRecorder)
  useEffect(() => {
    if (isRecording) {
      if (!mainCanvasRef.current) return;
      try {
        recordedChunksRef.current = [];
        const stream = mainCanvasRef.current.captureStream(30);
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          onRecordingComplete({ type: 'video', url, blob });
        };

        recorder.start(100);
        mediaRecorderRef.current = recorder;
      } catch (err) {
        console.error('MediaRecorder error:', err);
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    }
  }, [isRecording, onRecordingComplete]);

  // Pointer Interaction fallback
  const handlePointerInteraction = (e) => {
    if (!mainCanvasRef.current || !eraserMaskCanvasRef.current) return;
    if (e.buttons !== 1 && e.type !== 'pointerdown') return;

    const rect = mainCanvasRef.current.getBoundingClientRect();
    const scaleX = mainCanvasRef.current.width / rect.width;
    const scaleY = mainCanvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const eraserCtx = eraserMaskCanvasRef.current.getContext('2d');
    const radius = propsRef.current.brushSize;
    const feather = propsRef.current.brushFeather / 100;

    eraserCtx.save();
    if (propsRef.current.toolMode === 'erase') {
      eraserCtx.globalCompositeOperation = 'source-over';
      const grad = eraserCtx.createRadialGradient(x, y, Math.max(1, radius * (1 - feather)), x, y, radius);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      eraserCtx.fillStyle = grad;
      eraserCtx.beginPath();
      eraserCtx.arc(x, y, radius, 0, Math.PI * 2);
      eraserCtx.fill();
    } else {
      eraserCtx.globalCompositeOperation = 'destination-out';
      const grad = eraserCtx.createRadialGradient(x, y, Math.max(1, radius * (1 - feather)), x, y, radius);
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      eraserCtx.fillStyle = grad;
      eraserCtx.beginPath();
      eraserCtx.arc(x, y, radius, 0, Math.PI * 2);
      eraserCtx.fill();
    }
    eraserCtx.restore();

    if (propsRef.current.showParticles) {
      particleSystemRef.current.emitPinchSparks(x, y, 2, 'spectral');
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden select-none"
    >
      {/* Hidden Webcam Video Source */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="hidden"
      />

      {/* Main Interactive Render Canvas */}
      <canvas
        ref={mainCanvasRef}
        onPointerDown={handlePointerInteraction}
        onPointerMove={handlePointerInteraction}
        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl shadow-cyan-950/30 cursor-crosshair"
      />

      {/* Loading AI State */}
      {modelLoading && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md text-white">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 shadow-2xl shadow-cyan-500/30 mb-4 animate-pulse">
            <Sparkles className="w-10 h-10 text-cyan-400 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-wide">
            Initializing MediaPipe AI...
          </h3>
          <p className="text-xs text-cyan-400 font-mono mt-1">
            Loading Selfie Segmentation & 21 3D Hand Landmarks
          </p>
        </div>
      )}

      {/* Camera Permission / Error Fallback UI */}
      {cameraError && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md text-white">
          <div className="max-w-md p-6 rounded-2xl bg-slate-900 border border-rose-500/40 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Webcam Access Required
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              {cameraError}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={startCamera}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition"
              >
                <Camera className="w-4 h-4" />
                <span>Retry Camera</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
