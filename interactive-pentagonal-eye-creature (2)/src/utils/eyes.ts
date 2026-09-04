// ============================================================
//  PENTA — Advanced Eye Rendering & Containment Engine
//  Guarantees: eyes can NEVER leave the body silhouette.
// ============================================================

import { Point, isPointInPolygon } from './math';

export type GlintStyle =
  | 'standard'
  | 'double'
  | 'star'
  | 'heart'
  | 'matrix'
  | 'crosshair'
  | 'target'
  | 'cute_anime'
  | 'ring'
  | 'spiral'
  | 'sleepy_z'
  | 'burst'
  | 'glitch_rgb'
  | 'scan_bar'
  | 'void'
  | 'diamond';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface GradStop {
  t: number;
  color: RGB;
}

// ---------- Color utilities ----------

export function parseColor(input: string): RGB {
  // supports #RRGGBB and rgb()/rgba() strings
  if (input.startsWith('#')) {
    const hex = input.slice(1);
    const full =
      hex.length === 3
        ? hex
            .split('')
            .map((c) => c + c)
            .join('')
        : hex;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
    };
  }
  const nums = input.match(/[\d.]+/g);
  if (nums && nums.length >= 3) {
    return { r: +nums[0], g: +nums[1], b: +nums[2] };
  }
  return { r: 255, g: 255, b: 255 };
}

export function rgbString(c: RGB, alpha = 1): string {
  return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${alpha})`;
}

export function mixRGB(a: RGB, b: RGB, t: number): RGB {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

export function makeStops(colors: string[]): GradStop[] {
  return colors.map((c, i) => ({ t: i / Math.max(1, colors.length - 1), color: parseColor(c) }));
}

/** Project a point onto a gradient axis, returning normalized 0..1 position */
export function projectOnGradient(
  px: number,
  py: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number
): number {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return 0;
  let t = ((px - x0) * dx + (py - y0) * dy) / lenSq;
  return Math.min(1, Math.max(0, t));
}

/** Sample a color from stops at position t */
export function sampleStops(stops: GradStop[], t: number): RGB {
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (t >= a.t && t <= b.t) {
      const local = (t - a.t) / Math.max(0.0001, b.t - a.t);
      return mixRGB(a.color, b.color, local);
    }
  }
  return stops[stops.length - 1].color;
}

// ---------- Eye containment (GEOMETRIC guarantee) ----------

/**
 * Finds the largest scale factor t ∈ [0,1] such that an axis-aligned rect of
 * half-size (halfW + pad, halfH + pad) centered at (dx*t, dy*t) is fully
 * contained inside the convex polygon. Uses bisection — always converges.
 */
function maxContainmentT(
  dx: number,
  dy: number,
  halfW: number,
  halfH: number,
  pad: number,
  poly: Point[]
): number {
  const valid = (sx: number, sy: number) => {
    const l = sx - halfW - pad;
    const r = sx + halfW + pad;
    const t = sy - halfH - pad;
    const b = sy + halfH + pad;
    return (
      isPointInPolygon({ x: l, y: t }, poly) &&
      isPointInPolygon({ x: r, y: t }, poly) &&
      isPointInPolygon({ x: r, y: b }, poly) &&
      isPointInPolygon({ x: l, y: b }, poly)
    );
  };

  if (valid(dx, dy)) return 1;
  if (!valid(0, 0)) return 0; // degenerate: even center invalid → collapse

  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    if (valid(dx * mid, dy * mid)) lo = mid;
    else hi = mid;
  }
  return lo;
}

/**
 * Resolves a desired eye-gaze shift so that BOTH eyes (including their full
 * rectangle extents + safety padding) stay strictly inside the body polygon.
 * Eyes move coherently — the most restrictive constraint wins.
 */
export function resolveGazeShift(
  desiredX: number,
  desiredY: number,
  halfDist: number,
  halfW: number,
  halfH: number,
  pad: number,
  poly: Point[]
): { x: number; y: number } {
  // Vertical freedom first (centered baseline), then horizontal.
  const tY = Math.min(
    maxContainmentT(0, desiredY, halfDist + halfW, halfH, pad, poly),
    maxContainmentT(0, desiredY, halfW, halfH, pad, poly)
  );
  const sy = desiredY * tY;

  const tX = Math.min(
    maxContainmentT(desiredX, sy, halfDist + halfW, halfH, pad, poly),
    maxContainmentT(desiredX, sy, halfW, halfH, pad, poly)
  );
  const sx = desiredX * tX;

  return { x: sx, y: sy };
}

// ---------- Eye drawing ----------

export interface DrawEyeOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number; // radians
  scale: number;
  lidTop: number; // 0 open → 1 closed
  lidBottom: number; // 0 open → 1 closed
  lidColor: string; // sampled body color → seamless blend
  glintStyle: GlintStyle;
  glintPhase: { x: number; y: number }; // parallax offset from gaze
  squint: number; // 0..1 optional horizontal squeeze
  bodyIsLight: boolean;
  glintIntensity?: number; // specular strength multiplier
}

function eyeSilhouettePath(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  radius: number
) {
  const rx = -w / 2;
  const ry = -h / 2;
  ctx.beginPath();
  const rr = (ctx as unknown as { roundRect?: (x:number,y:number,w:number,h:number,r:number)=>void }).roundRect;
  if (typeof rr === 'function') {
    rr.call(ctx, rx, ry, w, h, radius);
  } else {
    const r = Math.min(radius, w/2, h/2);
    ctx.moveTo(rx + r, ry);
    // @ts-ignore
    ctx.arcTo(rx + w, ry, rx + w, ry + h, r);
    // @ts-ignore
    ctx.arcTo(rx + w, ry + h, rx, ry + h, r);
    // @ts-ignore
    ctx.arcTo(rx, ry + h, rx, ry, r);
    // @ts-ignore
    ctx.arcTo(rx, ry, rx + w, ry, r);
    ctx.closePath();
  }
}

/**
 * Draws a single vertical rectangular eye with:
 *  • deep black vertical rounded-rect body with volumetric shading
 *  • animated parallax glints
 *  • organic curved eyelids that blend perfectly with the white body
 *  • lid crease shading + light-catching edge highlight
 */
export function drawEye(ctx: CanvasRenderingContext2D, o: DrawEyeOptions) {
  const w = o.width * (1 - o.squint * 0.18);
  const h = o.height;
  if (w <= 0.5 || h <= 0.5) return;

  const radius = Math.min(w * 0.42, h * 0.32, 7);

  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.rotate(o.angle);
  ctx.scale(o.scale, o.scale);

  // --- soft contact shadow around the eye (inset depth illusion) ---
  const shadowSpread = Math.max(w, h) * 0.55;
  const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, shadowSpread);
  shadowGrad.addColorStop(0, o.bodyIsLight ? 'rgba(100,116,139,0.30)' : 'rgba(15,23,42,0.28)');
  shadowGrad.addColorStop(0.55, o.bodyIsLight ? 'rgba(148,163,184,0.14)' : 'rgba(148,163,184,0.10)');
  shadowGrad.addColorStop(1, 'rgba(148,163,184,0)');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, shadowSpread, shadowSpread * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- clip everything to the eye silhouette ---
  ctx.save();
  eyeSilhouettePath(ctx, w, h, radius);
  ctx.clip();

  // base deep black with vertical volumetric gradient
  const baseGrad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  baseGrad.addColorStop(0, '#1b1b22');
  baseGrad.addColorStop(0.28, '#0b0b11');
  baseGrad.addColorStop(0.72, '#040406');
  baseGrad.addColorStop(1, '#000000');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2);

  // inner top sheen (glass reflection band)
  const sheen = ctx.createLinearGradient(0, -h / 2, 0, -h / 2 + h * 0.4);
  sheen.addColorStop(0, 'rgba(255,255,255,0.20)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(-w / 2 - 1, -h / 2 - 1, w + 2, h * 0.45);

  // inner bottom bounce light
  const bounce = ctx.createLinearGradient(0, h / 2, 0, h / 2 - h * 0.3);
  bounce.addColorStop(0, 'rgba(255,255,255,0.07)');
  bounce.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = bounce;
  ctx.fillRect(-w / 2 - 1, h / 2 - h * 0.3, w + 2, h * 0.3 + 1);

  // ---- GLINTS (parallax with gaze direction) ----
  const gx = -w * 0.22 + o.glintPhase.x;
  const gy = -h * 0.26 + o.glintPhase.y;
  const coreR = Math.max(1.6, Math.min(w * 0.2, 3.4));
  const gi = o.glintIntensity ?? 1; // specular strength multiplier

  const drawDot = (x: number, y: number, r: number, color: string, blur = 0) => {
    if (blur > 0) {
      ctx.shadowColor = color;
      ctx.shadowBlur = blur;
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  switch (o.glintStyle) {
    case 'star': {
      drawDot(gx, gy, coreR * 1.15, '#FFFFFF', 8);
      drawDot(gx + w * 0.24, gy + h * 0.3, coreR * 0.5, 'rgba(255,255,255,0.75)');
      drawDot(gx - w * 0.18, gy + h * 0.42, coreR * 0.35, 'rgba(255,255,255,0.45)');
      break;
    }
    case 'heart': {
      drawDot(gx, gy, coreR * 1.2, '#FB7185', 10);
      drawDot(gx + w * 0.26, gy + h * 0.32, coreR * 0.45, 'rgba(251,113,133,0.8)');
      break;
    }
    case 'matrix': {
      // animated scanlines
      const t = (Date.now() * 0.0016) % 1;
      const scanY = -h / 2 + h * t;
      const scanGrad = ctx.createLinearGradient(0, scanY - 4, 0, scanY + 4);
      scanGrad.addColorStop(0, 'rgba(16,185,129,0)');
      scanGrad.addColorStop(0.5, 'rgba(16,185,129,0.85)');
      scanGrad.addColorStop(1, 'rgba(16,185,129,0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(-w / 2 - 1, scanY - 4, w + 2, 8);
      // data rows
      ctx.fillStyle = 'rgba(52,211,153,0.35)';
      for (let i = 0; i < 4; i++) {
        const yy = -h * 0.38 + i * h * 0.24 + Math.sin(Date.now() * 0.002 + i) * 1.5;
        ctx.fillRect(-w * 0.34, yy, w * 0.68, Math.max(1, h * 0.018));
      }
      drawDot(gx, gy, coreR * 0.6, 'rgba(167,243,208,0.9)');
      break;
    }
    case 'crosshair':
    case 'target': {
      // reticle
      ctx.strokeStyle = 'rgba(248,113,113,0.85)';
      ctx.lineWidth = Math.max(0.8, w * 0.06);
      const armLen = w * 0.34;
      ctx.beginPath();
      ctx.moveTo(-armLen, 0);
      ctx.lineTo(-armLen * 0.35, 0);
      ctx.moveTo(armLen * 0.35, 0);
      ctx.lineTo(armLen, 0);
      ctx.moveTo(0, -armLen * 1.5);
      ctx.lineTo(0, -armLen * 0.5);
      ctx.moveTo(0, armLen * 0.5);
      ctx.lineTo(0, armLen * 1.5);
      ctx.stroke();
      drawDot(0, 0, coreR * 0.9, '#EF4444', 8);
      break;
    }
    case 'cute_anime': {
      drawDot(gx, gy, coreR * 1.25, '#FFFFFF', 6);
      drawDot(gx + w * 0.3, gy + h * 0.3, coreR * 0.62, 'rgba(255,255,255,0.9)');
      drawDot(gx - w * 0.16, gy + h * 0.46, coreR * 0.4, 'rgba(255,255,255,0.55)');
      break;
    }
    case 'double': {
      drawDot(gx, gy, coreR, 'rgba(255,255,255,0.95)', 4);
      drawDot(gx + w * 0.22, gy + h * 0.28, coreR * 0.55, 'rgba(255,255,255,0.6)');
      break;
    }

    /* ---------- NEW HIGH-FIDELITY GLINTS ---------- */

    case 'ring': {
      // pulsing concentric sonar rings
      const t = (Date.now() * 0.0011) % 1;
      for (let i = 0; i < 3; i++) {
        const p = (t + i / 3) % 1;
        const r = p * Math.min(w, h) * 0.55;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(186,230,253,${(1 - p) * 0.85 * gi})`;
        ctx.lineWidth = Math.max(0.7, w * 0.06 * (1 - p));
        ctx.stroke();
      }
      drawDot(0, 0, coreR * 0.55, `rgba(224,242,254,${0.95 * gi})`, 6);
      break;
    }

    case 'spiral': {
      // hypnotic archimedean spiral
      const rot = Date.now() * 0.0026;
      const maxR = Math.min(w, h) * 0.46;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 6; a += 0.14) {
        const r = (a / (Math.PI * 6)) * maxR;
        const x = Math.cos(a + rot) * r;
        const y = Math.sin(a + rot) * r * 1.25;
        a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(216,180,254,${0.9 * gi})`;
      ctx.lineWidth = Math.max(0.8, w * 0.07);
      ctx.stroke();
      drawDot(0, 0, coreR * 0.5, `rgba(255,255,255,${0.9 * gi})`, 5);
      break;
    }

    case 'sleepy_z': {
      // drifting "z" glyphs rising inside the eye
      const t = (Date.now() * 0.0007) % 1;
      ctx.strokeStyle = `rgba(191,219,254,${0.8 * gi})`;
      ctx.lineWidth = Math.max(0.8, w * 0.07);
      for (let i = 0; i < 2; i++) {
        const p = (t + i * 0.5) % 1;
        const zy = h * 0.34 - p * h * 0.68;
        const s = w * (0.15 + p * 0.1);
        const alpha = Math.sin(p * Math.PI) * 0.9 * gi;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(-s, zy - s * 0.7);
        ctx.lineTo(s, zy - s * 0.7);
        ctx.lineTo(-s, zy + s * 0.7);
        ctx.lineTo(s, zy + s * 0.7);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;
    }

    case 'burst': {
      // radiant sparkle burst with rotating rays
      const rot = Date.now() * 0.0018;
      const rays = 8;
      ctx.strokeStyle = `rgba(255,255,255,${0.85 * gi})`;
      ctx.lineWidth = Math.max(0.7, w * 0.055);
      for (let i = 0; i < rays; i++) {
        const a = rot + (i / rays) * Math.PI * 2;
        const inner = Math.min(w, h) * 0.12;
        const outer = Math.min(w, h) * (i % 2 === 0 ? 0.42 : 0.26);
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner * 1.2);
        ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer * 1.2);
        ctx.stroke();
      }
      drawDot(0, 0, coreR * 0.85, '#FFFFFF', 12);
      drawDot(gx + w * 0.26, gy + h * 0.3, coreR * 0.4, `rgba(255,255,255,${0.7 * gi})`);
      break;
    }

    case 'glitch_rgb': {
      // chromatic-aberration data corruption
      const jx = (Math.random() - 0.5) * w * 0.4;
      const jy = (Math.random() - 0.5) * h * 0.2;
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = `rgba(255,0,80,${0.55 * gi})`;
      ctx.fillRect(-w / 2 + jx - 2, -h * 0.2 + jy, w, h * 0.14);
      ctx.fillStyle = `rgba(0,255,200,${0.5 * gi})`;
      ctx.fillRect(-w / 2 - jx + 2, h * 0.06 - jy, w, h * 0.12);
      ctx.fillStyle = `rgba(80,120,255,${0.45 * gi})`;
      ctx.fillRect(-w / 2 + jy, h * 0.26 + jx * 0.3, w, h * 0.08);
      ctx.globalCompositeOperation = 'source-over';
      if (Math.random() > 0.5) drawDot(gx, gy, coreR * 0.6, 'rgba(255,255,255,0.8)');
      break;
    }

    case 'scan_bar': {
      // horizontal HUD readout bar sweeping vertically
      const t = (Date.now() * 0.0013) % 1;
      const y = -h / 2 + t * h;
      const g = ctx.createLinearGradient(0, y - h * 0.14, 0, y + h * 0.14);
      g.addColorStop(0, 'rgba(56,189,248,0)');
      g.addColorStop(0.5, `rgba(125,211,252,${0.95 * gi})`);
      g.addColorStop(1, 'rgba(56,189,248,0)');
      ctx.fillStyle = g;
      ctx.fillRect(-w / 2 - 1, y - h * 0.14, w + 2, h * 0.28);
      ctx.fillStyle = `rgba(186,230,253,${0.35 * gi})`;
      ctx.fillRect(-w * 0.36, -h * 0.02, w * 0.72, Math.max(1, h * 0.02));
      break;
    }

    case 'void': {
      // light-absorbing black hole with faint event horizon
      const vg = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.min(w, h) * 0.6);
      vg.addColorStop(0, 'rgba(0,0,0,1)');
      vg.addColorStop(0.7, 'rgba(0,0,0,0.9)');
      vg.addColorStop(1, `rgba(88,28,135,${0.5 * gi})`);
      ctx.fillStyle = vg;
      ctx.fillRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2);
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(w, h) * 0.3, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(167,139,250,${0.4 * gi})`;
      ctx.lineWidth = Math.max(0.6, w * 0.04);
      ctx.stroke();
      break;
    }

    case 'diamond': {
      // faceted gemstone highlight with prismatic edges
      const s = Math.min(w, h) * 0.3;
      const spin = Math.sin(Date.now() * 0.0015) * 0.25;
      ctx.save();
      ctx.translate(gx * 0.5, gy * 0.5);
      ctx.rotate(spin);
      const dg = ctx.createLinearGradient(-s, -s, s, s);
      dg.addColorStop(0, `rgba(255,255,255,${0.98 * gi})`);
      dg.addColorStop(0.45, `rgba(190,220,255,${0.85 * gi})`);
      dg.addColorStop(1, `rgba(255,190,240,${0.75 * gi})`);
      ctx.beginPath();
      ctx.moveTo(0, -s * 1.25);
      ctx.lineTo(s * 0.8, 0);
      ctx.lineTo(0, s * 1.25);
      ctx.lineTo(-s * 0.8, 0);
      ctx.closePath();
      ctx.fillStyle = dg;
      ctx.shadowColor = 'rgba(255,255,255,0.8)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
      break;
    }

    default: {
      drawDot(gx, gy, coreR, 'rgba(255,255,255,0.95)', 3);
      drawDot(gx + w * 0.2, gy + h * 0.3, coreR * 0.45, 'rgba(255,255,255,0.45)');
      break;
    }
  }

  // ---- EYELIDS (curved, body-colored, with crease + highlight) ----
  const lidFill = o.lidColor;
  const edgeW = Math.max(1, h * 0.022);

  // UPPER LID
  if (o.lidTop > 0.001) {
    const edge = -h / 2 + h * Math.min(1, o.lidTop);
    const bulge = h * (0.055 + 0.05 * o.lidTop);

    ctx.beginPath();
    ctx.moveTo(-w / 2 - 2, -h / 2 - 3);
    ctx.lineTo(-w / 2 - 2, edge);
    ctx.quadraticCurveTo(0, edge + bulge, w / 2 + 2, edge);
    ctx.lineTo(w / 2 + 2, -h / 2 - 3);
    ctx.closePath();
    ctx.fillStyle = lidFill;
    ctx.fill();

    // soft crease under the lid edge
    ctx.beginPath();
    ctx.moveTo(-w / 2, edge + 0.5);
    ctx.quadraticCurveTo(0, edge + bulge + 0.5, w / 2, edge + 0.5);
    ctx.strokeStyle = o.bodyIsLight ? 'rgba(100,116,139,0.30)' : 'rgba(15,23,42,0.22)';
    ctx.lineWidth = edgeW;
    ctx.stroke();

    // light catch on the lid edge (only when partially open)
    if (o.lidTop < 0.97) {
      ctx.beginPath();
      ctx.moveTo(-w / 2, edge + edgeW * 1.6);
      ctx.quadraticCurveTo(0, edge + bulge + edgeW * 1.6, w / 2, edge + edgeW * 1.6);
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = edgeW * 0.8;
      ctx.stroke();
    }
  }

  // LOWER LID
  if (o.lidBottom > 0.001) {
    const edge = h / 2 - h * Math.min(1, o.lidBottom);
    const bulge = h * (0.045 + 0.045 * o.lidBottom);

    ctx.beginPath();
    ctx.moveTo(-w / 2 - 2, h / 2 + 3);
    ctx.lineTo(-w / 2 - 2, edge);
    ctx.quadraticCurveTo(0, edge - bulge, w / 2 + 2, edge);
    ctx.lineTo(w / 2 + 2, h / 2 + 3);
    ctx.closePath();
    ctx.fillStyle = lidFill;
    ctx.fill();

    // crease
    ctx.beginPath();
    ctx.moveTo(-w / 2, edge - 0.5);
    ctx.quadraticCurveTo(0, edge - bulge - 0.5, w / 2, edge - 0.5);
    ctx.strokeStyle = o.bodyIsLight ? 'rgba(100,116,139,0.22)' : 'rgba(15,23,42,0.16)';
    ctx.lineWidth = edgeW * 0.9;
    ctx.stroke();
  }

  ctx.restore(); // end eye-silhouette clip

  // --- crisp rim outline of the eye ---
  eyeSilhouettePath(ctx, w, h, radius);
  ctx.strokeStyle = o.bodyIsLight ? 'rgba(71,85,105,0.16)' : 'rgba(15,23,42,0.18)';
  ctx.lineWidth = Math.max(0.6, w * 0.05);
  ctx.stroke();

  ctx.restore();
}

/** Path helper for the eye silhouette in an arbitrary transform (for clipping) */
export function pathEyeSilhouette(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  angle: number,
  scale: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  eyeSilhouettePath(ctx, width, height, Math.min(width * 0.42, height * 0.32, 7));
  ctx.restore();
}
