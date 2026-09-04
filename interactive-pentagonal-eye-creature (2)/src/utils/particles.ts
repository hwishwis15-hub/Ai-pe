export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  color: string;
  pulseSpeed: number;
  phase: number;
}

export interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  /** how fast this ring expands */
  speed: number;
  lineWidth: number;
  /** optional second/third concentric rings drawn with a delay */
  echoes: { delay: number; scale: number; width: number }[];
  t: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private ripples: Ripple[] = [];
  private width: number = 0;
  private height: number = 0;

  public resize(w: number, h: number, count: number, color: string) {
    this.width = w;
    this.height = h;

    if (this.particles.length !== count) {
      this.particles = [];
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4 - 0.2,
          size: Math.random() * 2.5 + 1,
          alpha: Math.random() * 0.5 + 0.1,
          maxAlpha: Math.random() * 0.6 + 0.2,
          color,
          pulseSpeed: Math.random() * 0.02 + 0.005,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
  }

  public clear() {
    this.ripples = [];
  }

  /**
   * Spawns a shockwave. `scale` sizes the ring, `count` adds concentric
   * echoes that lag behind — giving collisions real physical weight.
   */
  public addRipple(
    x: number,
    y: number,
    color = 'rgba(255, 255, 255, 0.4)',
    scale = 1,
    count = 1
  ) {
    if (scale <= 0 || count <= 0) return;
    const base = 150 * scale;
    const echoes: Ripple['echoes'] = [];
    for (let i = 1; i < count; i++) {
      echoes.push({
        delay: i * (0.06 + Math.random() * 0.05),
        scale: 1 - i * 0.22,
        width: 2.4 - i * 0.6,
      });
    }
    this.ripples.push({
      x,
      y,
      radius: 4,
      maxRadius: base * (0.85 + Math.random() * 0.4),
      alpha: 0.5 + Math.min(0.3, scale * 0.18),
      color,
      speed: 0.07 + scale * 0.035 + Math.random() * 0.02,
      lineWidth: 1.6 + scale * 1.5,
      echoes,
      t: 0,
    });
    if (this.ripples.length > 40) this.ripples.shift();
  }

  public updateAndDraw(
    ctx: CanvasRenderingContext2D,
    mouseX: number,
    mouseY: number,
    particleColor: string
  ) {
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.phase += p.pulseSpeed;

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.hypot(dx, dy);
      if (dist < 120 && dist > 0) {
        const force = ((120 - dist) / 120) * 0.5;
        p.x += (dx / dist) * force;
        p.y += (dy / dist) * force;
      }

      const currentAlpha = Math.max(0.05, p.maxAlpha * (0.6 + 0.4 * Math.sin(p.phase)));

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = particleColor.replace(/[\d.]+\)$/, `${currentAlpha})`);
      ctx.fill();
      ctx.restore();
    }

    // ---- shockwave rings with lagging echoes ----
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.t += 1 / 60;
      r.radius += (r.maxRadius - r.radius) * r.speed + 1.1;
      const life = r.radius / r.maxRadius;
      r.alpha -= 0.012 + life * 0.014;

      if (r.alpha <= 0 || r.radius >= r.maxRadius) {
        this.ripples.splice(i, 1);
        continue;
      }

      // main ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = r.color.replace(/[\d.]+\)$/, `${r.alpha})`);
      ctx.lineWidth = r.lineWidth * (1 - life * 0.75);
      ctx.stroke();
      ctx.restore();

      // concentric echoes that fire slightly later
      for (const e of r.echoes) {
        if (r.t < e.delay) continue;
        const er = r.radius * e.scale;
        if (er < 2) continue;
        const ea = r.alpha * 0.55 * (1 - e.delay * 2.2);
        if (ea <= 0.01) continue;
        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, er, 0, Math.PI * 2);
        ctx.strokeStyle = r.color.replace(/[\d.]+\)$/, `${Math.max(0, ea)})`);
        ctx.lineWidth = Math.max(0.5, e.width * (1 - life * 0.6));
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}
