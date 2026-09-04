// ============================================================
//  PENTA — Advanced Crystalline Shatter & Quantum Respawn Engine
//  Deconstructs the pentagon into 3D-tumbling geometric facet
//  shards + obsidian eye crystals, followed by magnetic vortex
//  reassembly and harmonic welding respawn.
// ============================================================

import { Point } from './math';
import { soundFx } from './audio';

export type BurstPhase = 'none' | 'charge' | 'shatter' | 'vortex' | 'reassemble' | 'done';

export interface PolygonShard {
  // Local vertices relative to shard origin
  pts: Point[];
  // World space physics
  x: number;
  y: number;
  vx: number;
  vy: number;
  // Home offset relative to creature origin (for reassembly target)
  homeX: number;
  homeY: number;
  // 3D Tumbling simulation
  pitch: number;
  yaw: number;
  roll: number;
  vPitch: number;
  vYaw: number;
  vRoll: number;
  // Shard styling
  colorBase: string;
  colorHighlight: string;
  isEye: boolean;
  glowColor: string;
  scale: number;
}

export interface SparkleEmber {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export class CreatureBurstEffect {
  phase: BurstPhase = 'none';
  t = 0;
  totalDur = 3.2;

  // Origin point where explosion happened and where respawn happens
  originX = 0;
  originY = 0;
  respawnX = 0;
  respawnY = 0;

  // Geometry shards
  shards: PolygonShard[] = [];
  embers: SparkleEmber[] = [];

  // Shockwave rings
  shockwaves: { radius: number; maxRadius: number; alpha: number; color: string; width: number }[] = [];

  // Callbacks
  onRespawnComplete?: () => void;

  trigger(startX: number, startY: number, curW: number, curH: number, tint: string, onComplete?: () => void) {
    this.phase = 'charge';
    this.t = 0;
    this.originX = startX;
    this.originY = startY;
    this.respawnX = startX;
    this.respawnY = startY;
    this.onRespawnComplete = onComplete;
    this.shards = [];
    this.embers = [];
    this.shockwaves = [];

    // Pre-generate geometric shards based on actual pentagon dimensions
    this.generateShards(curW, curH, tint);
    soundFx.playBurstCharge();
  }

  private generateShards(w: number, h: number, tint: string) {
    const shards: PolygonShard[] = [];
    const hw = w / 2;
    const hh = h / 2;

    // Body vertices of wide pentagon
    const vTop = { x: 0, y: -hh * 1.06 };
    const vRShoulder = { x: hw * 1.0, y: -hh * 0.26 };
    const vRFoot = { x: hw * 0.95, y: hh };
    const vLFoot = { x: -hw * 0.95, y: hh };
    const vLShoulder = { x: -hw * 1.0, y: -hh * 0.26 };
    const vCenter = { x: 0, y: 0 };

    const bodyPerimeter = [vTop, vRShoulder, vRFoot, vLFoot, vLShoulder];

    // 1. Core facet triangles from center to perimeter midpoints & corners
    const numPerimeterPoints = bodyPerimeter.length;
    for (let i = 0; i < numPerimeterPoints; i++) {
      const p1 = bodyPerimeter[i];
      const p2 = bodyPerimeter[(i + 1) % numPerimeterPoints];
      const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      // Subdivide each main slice into 3 intricate crystalline triangular facets
      const subSlices = [
        [vCenter, p1, mid],
        [vCenter, mid, p2],
        [{ x: vCenter.x + (p1.x - vCenter.x) * 0.45, y: vCenter.y + (p1.y - vCenter.y) * 0.45 }, mid, p1],
      ];

      subSlices.forEach((slicePts, subIdx) => {
        // Calculate centroid of slice for local coordinates
        const cx = (slicePts[0].x + slicePts[1].x + slicePts[2].x) / 3;
        const cy = (slicePts[0].y + slicePts[1].y + slicePts[2].y) / 3;

        const localPts = slicePts.map((pt) => ({ x: pt.x - cx, y: pt.y - cy }));
        const ang = Math.atan2(cy, cx) + (Math.random() - 0.5) * 0.6;
        const blastSpeed = 8 + Math.random() * 18;

        shards.push({
          pts: localPts,
          x: this.originX + cx,
          y: this.originY + cy,
          vx: Math.cos(ang) * blastSpeed,
          vy: Math.sin(ang) * blastSpeed - 3,
          homeX: cx,
          homeY: cy,
          pitch: Math.random() * Math.PI * 2,
          yaw: Math.random() * Math.PI * 2,
          roll: Math.random() * Math.PI * 2,
          vPitch: (Math.random() - 0.5) * 8,
          vYaw: (Math.random() - 0.5) * 8,
          vRoll: (Math.random() - 0.5) * 7,
          colorBase: subIdx === 0 ? '#FFFFFF' : subIdx === 1 ? tint : '#E2E8F0',
          colorHighlight: 'rgba(255, 255, 255, 0.95)',
          isEye: false,
          glowColor: 'rgba(255, 190, 225, 0.55)',
          scale: 1,
        });
      });
    }

    // 2. The Two Iconic Obsidian Eye Shards (shattering into 4 sleek vertical bars)
    const eyeOffsetX = 32 * (w / 212);
    const eyeY = -6 * (h / 186);
    const eyeWidth = 16 * (w / 212);
    const eyeHeight = 40 * (h / 186);

    [-eyeOffsetX, eyeOffsetX].forEach((ex, eyeIdx) => {
      // Split each eye into top and bottom crystalline obsidian bars
      [0.25, 0.75].forEach((frac, barIdx) => {
        const barH = eyeHeight * 0.48;
        const barW = eyeWidth * 0.9;
        const localPts: Point[] = [
          { x: -barW / 2, y: -barH / 2 },
          { x: barW / 2, y: -barH / 2 },
          { x: barW / 2, y: barH / 2 },
          { x: -barW / 2, y: barH / 2 },
        ];

        const cx = ex;
        const cy = eyeY - eyeHeight / 2 + eyeHeight * frac;
        const ang = Math.atan2(cy, cx) + (eyeIdx === 0 ? -0.4 : 0.4);
        const blastSpeed = 10 + Math.random() * 12;

        shards.push({
          pts: localPts,
          x: this.originX + cx,
          y: this.originY + cy,
          vx: Math.cos(ang) * blastSpeed,
          vy: Math.sin(ang) * blastSpeed - 4,
          homeX: cx,
          homeY: cy,
          pitch: Math.random() * Math.PI * 2,
          yaw: Math.random() * Math.PI * 2,
          roll: Math.random() * Math.PI * 2,
          vPitch: (Math.random() - 0.5) * 10,
          vYaw: (Math.random() - 0.5) * 10,
          vRoll: (Math.random() - 0.5) * 8,
          colorBase: '#090A0F', // Pure obsidian
          colorHighlight: barIdx === 0 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 190, 225, 0.85)',
          isEye: true,
          glowColor: 'rgba(236, 72, 153, 0.6)',
          scale: 1,
        });
      });
    });

    this.shards = shards;
  }

  update(dt: number, bounds: { w: number; h: number }) {
    if (this.phase === 'none' || this.phase === 'done') return;

    this.t += dt;

    // --- Phase Transitions ---
    if (this.phase === 'charge') {
      // Spawn charging embers that get sucked inward
      if (Math.random() < 0.7) {
        const a = Math.random() * Math.PI * 2;
        const r = 60 + Math.random() * 80;
        this.embers.push({
          x: this.originX + Math.cos(a) * r,
          y: this.originY + Math.sin(a) * r,
          vx: -Math.cos(a) * 4,
          vy: -Math.sin(a) * 4,
          life: 0,
          maxLife: 0.35,
          color: Math.random() < 0.5 ? '#FDA4AF' : '#F472B6',
          size: 2 + Math.random() * 2.5,
        });
      }

      if (this.t >= 0.38) {
        // Transition: Detonation!
        this.phase = 'shatter';
        soundFx.playBurstShatter();

        // 2 Expanding shockwaves
        this.shockwaves.push(
          { radius: 5, maxRadius: 360, alpha: 0.95, color: 'rgba(255, 255, 255, 0.95)', width: 4.5 },
          { radius: 5, maxRadius: 460, alpha: 0.75, color: 'rgba(251, 113, 133, 0.75)', width: 3.0 }
        );

        // Burst 50 sparkling embers
        for (let i = 0; i < 55; i++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = 4 + Math.random() * 24;
          this.embers.push({
            x: this.originX,
            y: this.originY,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd - Math.random() * 5,
            life: 0,
            maxLife: 0.7 + Math.random() * 1.0,
            color: ['#FFFFFF', '#FDA4AF', '#F472B6', '#FBBF24', '#A78BFA'][Math.floor(Math.random() * 5)],
            size: 2 + Math.random() * 4,
          });
        }
      }
    } else if (this.phase === 'shatter') {
      if (this.t >= 1.6) {
        this.phase = 'vortex';
        soundFx.playReassembleSweep();
      }
    } else if (this.phase === 'vortex') {
      if (this.t >= 2.4) {
        this.phase = 'reassemble';
      }
    } else if (this.phase === 'reassemble') {
      if (this.t >= 3.0) {
        this.phase = 'done';
        soundFx.playRespawnPop();
        this.onRespawnComplete?.();
      }
    }

    // --- Update Shockwaves ---
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 0.12 + 4;
      sw.alpha -= dt * 1.4;
      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    // --- Update Embers ---
    for (let i = this.embers.length - 1; i >= 0; i--) {
      const em = this.embers[i];
      em.life += dt;
      em.x += em.vx;
      em.y += em.vy;
      em.vx *= 0.96;
      em.vy += 0.15; // gentle gravity
      if (em.life >= em.maxLife) {
        this.embers.splice(i, 1);
      }
    }

    // --- Update Shards ---
    const isVortexOrReassemble = this.phase === 'vortex' || this.phase === 'reassemble';

    for (const s of this.shards) {
      if (this.phase === 'shatter') {
        // Ballistic flight with gentle gravity & air drag
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.978;
        s.vy = s.vy * 0.978 + 0.28; // gravity

        // Tumbling
        s.pitch += s.vPitch * dt;
        s.yaw += s.vYaw * dt;
        s.roll += s.vRoll * dt;

        // Bounce off canvas walls with energy loss
        const pad = 20;
        if (s.x < pad) { s.x = pad; s.vx = Math.abs(s.vx) * 0.65; }
        if (s.x > bounds.w - pad) { s.x = bounds.w - pad; s.vx = -Math.abs(s.vx) * 0.65; }
        if (s.y > bounds.h - pad) { s.y = bounds.h - pad; s.vy = -Math.abs(s.vy) * 0.55; }
        if (s.y < pad) { s.y = pad; s.vy = Math.abs(s.vy) * 0.65; }

        // Trail faint embers
        if (Math.random() < 0.15) {
          this.embers.push({
            x: s.x,
            y: s.y,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            life: 0,
            maxLife: 0.35,
            color: s.isEye ? '#F472B6' : '#FDA4AF',
            size: 1.8,
          });
        }
      } else if (isVortexOrReassemble) {
        // Target is the reassembly position + shard's home offset
        const targetX = this.respawnX + s.homeX;
        const targetY = this.respawnY + s.homeY;

        const dx = targetX - s.x;
        const dy = targetY - s.y;
        const dist = Math.hypot(dx, dy);

        // Magnetic spring pull towards home
        const pullFactor = this.phase === 'reassemble' ? 0.28 : 0.08;
        s.vx = s.vx * 0.78 + dx * pullFactor;
        s.vy = s.vy * 0.78 + dy * pullFactor;
        s.x += s.vx * dt * 60;
        s.y += s.vy * dt * 60;

        // Tumble dampens towards zero (snaps into place)
        const rotDamp = this.phase === 'reassemble' ? 0.8 : 0.94;
        s.pitch *= rotDamp;
        s.yaw *= rotDamp;
        s.roll *= rotDamp;

        if (this.phase === 'reassemble' && dist < 4) {
          s.x = targetX;
          s.y = targetY;
          s.pitch = 0;
          s.yaw = 0;
          s.roll = 0;
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.phase === 'none' || this.phase === 'done') return;

    ctx.save();

    // 1. Draw Shockwave rings
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.originX, this.originY, sw.radius, 0, Math.PI * 2);
      ctx.strokeStyle = sw.color.replace(/[\d.]+\)$/, `${sw.alpha})`);
      ctx.lineWidth = sw.width * (1 - sw.radius / sw.maxRadius * 0.6);
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.restore();
    }

    // 2. Pre-detonation charge-up core (plain white-hot energy sphere, no rays)
    if (this.phase === 'charge') {
      const chargeProgress = this.t / 0.38;
      const pulse = Math.sin(this.t * 60) * 4;
      const coreRadius = 24 + chargeProgress * 65 + pulse;

      // Radiant white-to-rose energy glow (no blue, no rays)
      const radial = ctx.createRadialGradient(
        this.originX, this.originY, 0,
        this.originX, this.originY, coreRadius * 1.8
      );
      radial.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      radial.addColorStop(0.45, 'rgba(255, 190, 225, 0.75)');
      radial.addColorStop(1, 'transparent');

      ctx.fillStyle = radial;
      ctx.beginPath();
      ctx.arc(this.originX, this.originY, coreRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Magnetic vortex singularity during reassembly
    if (this.phase === 'vortex' || this.phase === 'reassemble') {
      const vortexRadius = 38 + Math.sin(this.t * 16) * 8;

      const vGrad = ctx.createRadialGradient(
        this.respawnX, this.respawnY, 0,
        this.respawnX, this.respawnY, vortexRadius * 2.2
      );
      vGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      vGrad.addColorStop(0.4, 'rgba(168, 85, 247, 0.7)');
      vGrad.addColorStop(0.8, 'rgba(251, 113, 133, 0.32)');
      vGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = vGrad;
      ctx.beginPath();
      ctx.arc(this.respawnX, this.respawnY, vortexRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Swirling suction spiral arcs
      const spiralArms = 4;
      ctx.strokeStyle = 'rgba(244, 244, 255, 0.65)';
      ctx.lineWidth = 1.6;
      for (let i = 0; i < spiralArms; i++) {
        const baseAng = -this.t * 8 + (i / spiralArms) * Math.PI * 2;
        ctx.beginPath();
        for (let step = 0; step < 16; step++) {
          const r = (step / 16) * (vortexRadius * 2.2);
          const a = baseAng + (step / 16) * Math.PI * 1.4;
          const px = this.respawnX + Math.cos(a) * r;
          const py = this.respawnY + Math.sin(a) * r;
          if (step === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    }

    // 4. Draw Stardust Embers
    for (const em of this.embers) {
      const alpha = Math.max(0, 1 - em.life / em.maxLife);
      ctx.save();
      ctx.beginPath();
      ctx.arc(em.x, em.y, em.size, 0, Math.PI * 2);
      ctx.fillStyle = em.color;
      ctx.shadowColor = em.color;
      ctx.shadowBlur = 8;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.restore();
    }

    // 5. Draw 3D-Tumbling Polygon Shards
    if (this.phase === 'shatter' || this.phase === 'vortex' || this.phase === 'reassemble') {
      for (const s of this.shards) {
        ctx.save();
        ctx.translate(s.x, s.y);

        // 3D Affine Perspective Projection Transform from (pitch, yaw, roll)
        // Cosine compression simulates rotation around X and Y axes in 3D
        const scaleX = Math.cos(s.yaw);
        const scaleY = Math.cos(s.pitch);
        ctx.rotate(s.roll);
        ctx.scale(Math.max(0.12, Math.abs(scaleX)), Math.max(0.12, Math.abs(scaleY)));

        // Draw Polygon Path
        if (s.pts.length >= 3) {
          ctx.beginPath();
          ctx.moveTo(s.pts[0].x, s.pts[0].y);
          for (let i = 1; i < s.pts.length; i++) {
            ctx.lineTo(s.pts[i].x, s.pts[i].y);
          }
          ctx.closePath();

          // Lighting and facet color
          if (s.isEye) {
            // Obsidian Crystal Bar with glossy specular edge
            ctx.fillStyle = s.colorBase;
            ctx.shadowColor = s.glowColor;
            ctx.shadowBlur = 12;
            ctx.fill();

            // Beveled specular highlight edge
            ctx.strokeStyle = s.colorHighlight;
            ctx.lineWidth = 1.4;
            ctx.stroke();
          } else {
            // Ceramic White Geometric Shard
            ctx.fillStyle = s.colorBase;
            ctx.shadowColor = s.glowColor;
            ctx.shadowBlur = 8;
            ctx.fill();

            // Razor-sharp specular highlight on shard edges
            ctx.strokeStyle = s.colorHighlight;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Inner warm neon rim lighting
            ctx.strokeStyle = 'rgba(255, 190, 225, 0.35)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        ctx.restore();
      }
    }

    ctx.restore();
  }
}
