// Helper to ensure MediaPipe libraries are fully loaded and initialized
export async function loadMediaPipeLibs() {
  const checkGlobals = () => {
    return (
      typeof window !== 'undefined' &&
      window.SelfieSegmentation &&
      window.Hands &&
      window.Camera
    );
  };

  if (checkGlobals()) {
    return {
      SelfieSegmentation: window.SelfieSegmentation,
      Hands: window.Hands,
      Camera: window.Camera,
      drawConnectors: window.drawConnectors,
      drawLandmarks: window.drawLandmarks,
      HAND_CONNECTIONS: window.HAND_CONNECTIONS
    };
  }

  // Load scripts dynamically if not present
  const scripts = [
    'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'
  ];

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      // Check if already in DOM
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === 'true') {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (e) => reject(e));
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.async = false;
      script.onload = () => {
        script.dataset.loaded = 'true';
        resolve();
      };
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  };

  for (const src of scripts) {
    try {
      await loadScript(src);
    } catch (err) {
      console.warn('Failed loading script:', src, err);
    }
  }

  // Poll until ready (max 8 seconds)
  const startTime = Date.now();
  while (Date.now() - startTime < 8000) {
    if (checkGlobals()) {
      break;
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  return {
    SelfieSegmentation: window.SelfieSegmentation,
    Hands: window.Hands,
    Camera: window.Camera,
    drawConnectors: window.drawConnectors,
    drawLandmarks: window.drawLandmarks,
    HAND_CONNECTIONS: window.HAND_CONNECTIONS
  };
}
