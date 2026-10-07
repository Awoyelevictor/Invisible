// Real-time particle system for Ghost Mode spectral aura & pinch sparks
export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 250;
  }

  emitPinchSparks(x, y, count = 3, colorTheme = 'spectral') {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }

      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      const size = 2 + Math.random() * 5;
      const life = 1.0;
      const decay = 0.02 + Math.random() * 0.04;

      let hue = 185; // cyan
      if (colorTheme === 'spectral') {
        hue = Math.random() > 0.4 ? (175 + Math.random() * 40) : (270 + Math.random() * 40); // cyan/violet
      } else if (colorTheme === 'cyber') {
        hue = Math.random() > 0.5 ? 300 : 180; // magenta/cyan
      } else if (colorTheme === 'ember') {
        hue = 25 + Math.random() * 30; // orange/gold
      } else if (colorTheme === 'matrix') {
        hue = 120 + Math.random() * 40; // green
      }

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8, // slight upward float
        size,
        life,
        decay,
        hue,
        lightness: 60 + Math.random() * 30
      });
    }
  }

  updateAndDraw(ctx, width, height) {
    if (this.particles.length === 0) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life -= p.decay;

      if (p.life <= 0 || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
        this.particles.splice(i, 1);
        continue;
      }

      const alpha = Math.max(0, p.life);
      const curSize = p.size * (0.3 + 0.7 * p.life);

      // Glow effect
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, curSize * 2);
      grad.addColorStop(0, `hsla(${p.hue}, 100%, ${p.lightness}%, ${alpha})`);
      grad.addColorStop(0.5, `hsla(${p.hue}, 90%, 50%, ${alpha * 0.5})`);
      grad.addColorStop(1, `hsla(${p.hue}, 80%, 40%, 0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, curSize * 2, 0, Math.PI * 2);
      ctx.fill();

      // Bright core
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, curSize * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  clear() {
    this.particles = [];
  }
}
