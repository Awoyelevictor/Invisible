// High-resolution preset virtual background generators for Ghost Mode
export const PRESET_BACKGROUNDS = [
  {
    id: 'studio-minimal',
    name: 'Minimalist Studio',
    category: 'Interior',
    color: '#0f172a',
    generateCanvas: (width, height) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Wall gradient
      const wallGrad = ctx.createLinearGradient(0, 0, 0, height * 0.75);
      wallGrad.addColorStop(0, '#1e293b');
      wallGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, width, height * 0.75);

      // Wood floor
      const floorGrad = ctx.createLinearGradient(0, height * 0.75, 0, height);
      floorGrad.addColorStop(0, '#2b1d0c');
      floorGrad.addColorStop(1, '#160d05');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, height * 0.75, width, height * 0.25);

      // Floor planks lines
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 1.5;
      for (let y = height * 0.75; y < height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Studio soft lamp glow
      const lampGrad = ctx.createRadialGradient(width * 0.82, height * 0.25, 10, width * 0.82, height * 0.35, width * 0.5);
      lampGrad.addColorStop(0, 'rgba(255, 235, 180, 0.4)');
      lampGrad.addColorStop(0.4, 'rgba(255, 200, 120, 0.15)');
      lampGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lampGrad;
      ctx.fillRect(0, 0, width, height);

      // Minimalist wall art frame
      ctx.fillStyle = '#334155';
      ctx.fillRect(width * 0.12, height * 0.18, width * 0.22, height * 0.32);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(width * 0.13, height * 0.195, width * 0.20, height * 0.29);
      // Art abstract shape
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(width * 0.23, height * 0.34, width * 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Modern plant silhouette in corner
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.ellipse(width * 0.88, height * 0.65, 35, 90, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(width * 0.92, height * 0.68, 30, 80, -0.3, 0, Math.PI * 2);
      ctx.fill();

      return canvas;
    }
  },
  {
    id: 'cyberpunk-loft',
    name: 'Cyberpunk Neon Loft',
    category: 'Sci-Fi',
    color: '#3b0764',
    generateCanvas: (width, height) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Dark city night backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#090414');
      bgGrad.addColorStop(0.6, '#180a2a');
      bgGrad.addColorStop(1, '#05020a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Cyber window with neon cityscape
      const winX = width * 0.1;
      const winY = height * 0.1;
      const winW = width * 0.55;
      const winH = height * 0.62;

      ctx.fillStyle = '#020108';
      ctx.fillRect(winX, winY, winW, winH);

      // City buildings silhouettes
      const buildings = [
        { x: winX + 20, w: 50, h: 220, col: '#ff007f' },
        { x: winX + 80, w: 70, h: 280, col: '#00f0ff' },
        { x: winX + 160, w: 45, h: 190, col: '#7928ca' },
        { x: winX + 220, w: 85, h: 310, col: '#ff007f' },
        { x: winX + 315, w: 60, h: 240, col: '#00f0ff' },
      ];

      buildings.forEach(b => {
        ctx.fillStyle = '#120726';
        ctx.fillRect(b.x, winY + winH - b.h, b.w, b.h);

        // Window glowing dots
        ctx.fillStyle = b.col;
        for (let r = 0; r < b.h - 30; r += 18) {
          for (let c = 8; c < b.w - 8; c += 14) {
            if (Math.random() > 0.3) {
              ctx.globalAlpha = 0.6;
              ctx.fillRect(b.x + c, winY + winH - b.h + r + 10, 4, 6);
            }
          }
        }
        ctx.globalAlpha = 1.0;
      });

      // Neon frame around window
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 15;
      ctx.strokeRect(winX, winY, winW, winH);

      // Purple ambient neon glow
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 30;
      ctx.strokeStyle = '#ff007f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width * 0.72, height * 0.2);
      ctx.lineTo(width * 0.95, height * 0.2);
      ctx.lineTo(width * 0.95, height * 0.7);
      ctx.stroke();

      ctx.shadowBlur = 0; // reset
      return canvas;
    }
  },
  {
    id: 'holodeck-matrix',
    name: 'Holodeck Matrix',
    category: 'Sci-Fi',
    color: '#064e3b',
    generateCanvas: (width, height) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#02120a';
      ctx.fillRect(0, 0, width, height);

      // Perspective grid
      const horizon = height * 0.55;
      const vanishingX = width * 0.5;

      // Floor grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
      ctx.lineWidth = 1.5;

      // Vertical perspective lines
      for (let x = -width * 0.5; x <= width * 1.5; x += 60) {
        ctx.beginPath();
        ctx.moveTo(vanishingX, horizon);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal floor lines
      for (let i = 0; i < 15; i++) {
        const y = horizon + Math.pow(i / 15, 2.2) * (height - horizon);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Ceiling grid lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      for (let x = -width * 0.5; x <= width * 1.5; x += 60) {
        ctx.beginPath();
        ctx.moveTo(vanishingX, horizon);
        ctx.lineTo(x, 0);
        ctx.stroke();
      }

      // Center glowing beacon
      const beaconGrad = ctx.createRadialGradient(vanishingX, horizon, 5, vanishingX, horizon, width * 0.4);
      beaconGrad.addColorStop(0, 'rgba(52, 211, 153, 0.8)');
      beaconGrad.addColorStop(0.3, 'rgba(16, 185, 129, 0.2)');
      beaconGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = beaconGrad;
      ctx.fillRect(0, 0, width, height);

      return canvas;
    }
  },
  {
    id: 'deep-space',
    name: 'Cosmic Nebula',
    category: 'Fantasy',
    color: '#1e1b4b',
    generateCanvas: (width, height) => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Deep space black
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      // Nebula clouds
      const clouds = [
        { x: width * 0.3, y: height * 0.4, r: width * 0.45, c1: 'rgba(147, 51, 234, 0.35)', c2: 'rgba(59, 130, 246, 0.15)' },
        { x: width * 0.75, y: height * 0.6, r: width * 0.4, c1: 'rgba(236, 72, 153, 0.3)', c2: 'rgba(168, 85, 247, 0.1)' },
        { x: width * 0.5, y: height * 0.2, r: width * 0.35, c1: 'rgba(6, 182, 212, 0.25)', c2: 'rgba(14, 165, 233, 0.05)' }
      ];

      clouds.forEach(cl => {
        const grad = ctx.createRadialGradient(cl.x, cl.y, 10, cl.x, cl.y, cl.r);
        grad.addColorStop(0, cl.c1);
        grad.addColorStop(0.6, cl.c2);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      });

      // Stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 200; i++) {
        const sx = Math.random() * width;
        const sy = Math.random() * height;
        const sr = Math.random() * 1.8;
        const sa = 0.2 + Math.random() * 0.8;
        ctx.globalAlpha = sa;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      return canvas;
    }
  }
];
