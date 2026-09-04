// ============================================================
//  PENTA — Stochastic Body Movement Engine
//  NO choreographed patterns. NO fixed coordinates.
//  Everything is driven by noise fields, random impulses,
//  steering wander and emergent behaviour.
// ============================================================

export interface Personality {
  boldness: number;
  sociability: number;
  playfulness: number;
  diligence: number;
  curiosity: number;
}

export interface ActionCtx {
  self: { x: number; y: number };
  cursor: { x: number; y: number; vx: number; vy: number; speed: number };
  bounds: { w: number; h: number; mx: number; my: number };
  center: { x: number; y: number };
  home: { x: number; y: number };
  food: { x: number; y: number }[];
  tool: string;
  personality: Personality;
  energy: number;
  canTravel: boolean;
  /** the other creature this action is about, if any */
  partner?: { x: number; y: number } | null;
  /** a specific food orb being inspected */
  focusFood?: { x: number; y: number } | null;
}

export interface ActionBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
}

export type ActionData = Record<string, number>;

export interface ActionDef {
  id: string;
  label: string;
  travel: boolean;
  w?: number;
  cost?: number;
  init?: (c: ActionBody, ctx: ActionCtx) => ActionData;
  update: (
    c: ActionBody,
    d: ActionData,
    t: number,
    dt: number,
    ctx: ActionCtx
  ) => { done?: boolean; rot?: number; squish?: number };
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;

/* ------------------------------------------------------------------ */
/*  NOISE — smooth value noise so motion never looks mechanical        */
/* ------------------------------------------------------------------ */

const perm = new Uint8Array(512);
{
  let seed = 1337;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const base = new Uint8Array(256);
  for (let i = 0; i < 256; i++) base[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = base[i]; base[i] = base[j]; base[j] = tmp;
  }
  for (let i = 0; i < 512; i++) perm[i] = base[i & 255];
}

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerpN = (a: number, b: number, t: number) => a + (b - a) * t;

/** 1D value noise, output −1..1 */
function noise1(x: number): number {
  const xi = Math.floor(x) & 255;
  const xf = x - Math.floor(x);
  const a = perm[xi] / 127.5 - 1;
  const b = perm[(xi + 1) & 255] / 127.5 - 1;
  return lerpN(a, b, fade(xf));
}

/** 2D gradient-ish noise, output −1..1 */
function noise2(x: number, y: number): number {
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const tl = perm[(perm[xi] + yi) & 255] / 127.5 - 1;
  const tr = perm[(perm[xi + 1] + yi) & 255] / 127.5 - 1;
  const bl = perm[(perm[xi] + yi + 1) & 255] / 127.5 - 1;
  const br = perm[(perm[xi + 1] + yi + 1) & 255] / 127.5 - 1;
  const u = fade(xf);
  const v = fade(yf);
  return lerpN(lerpN(tl, tr, u), lerpN(bl, br, u), v);
}

/* ------------------------------------------------------------------ */
/*  STEERING PRIMITIVES                                                */
/* ------------------------------------------------------------------ */

/** Pure wander: a moving "wander circle" ahead of the current heading */
function wander(c: ActionBody, d: ActionData, strength: number, jitter: number) {
  if (d.h === undefined) d.h = Math.atan2(c.vy || rnd(-1, 1), c.vx || rnd(-1, 1));
  // the heading drifts by a random walk — never a repeating curve
  d.h += rnd(-jitter, jitter) + noise1((d.nt = (d.nt ?? 0) + 0.05)) * 0.06;
  c.vx += Math.cos(d.h) * strength * rnd(0.55, 1.4);
  c.vy += Math.sin(d.h) * strength * rnd(0.55, 1.4);
  const sp = Math.hypot(c.vx, c.vy) || 1;
  const cap = d.cap ?? 12;
  if (sp > cap) { c.vx = (c.vx / sp) * cap; c.vy = (c.vy / sp) * cap; }
  c.targetX = c.x + c.vx;
  c.targetY = c.y + c.vy;
}

/** Seek a moving point with noise-corrupted steering (never a straight line) */
function seekNoisy(
  c: ActionBody,
  tx: number,
  ty: number,
  accel: number,
  cap: number,
  noiseAmt: number,
  d: ActionData,
  phase: number
) {
  const dx = tx - c.x;
  const dy = ty - c.y;
  const dist = Math.hypot(dx, dy) || 1;
  // corrupt the desired direction with noise so the path is organic
  const wob = noise2(phase, (d.nz = (d.nz ?? 0) + 0.06)) * noiseAmt;
  const ang = Math.atan2(dy, dx) + wob;
  c.vx += Math.cos(ang) * accel;
  c.vy += Math.sin(ang) * accel;
  const sp = Math.hypot(c.vx, c.vy) || 1;
  if (sp > cap) { c.vx = (c.vx / sp) * cap; c.vy = (c.vy / sp) * cap; }
  // mild drag
  c.vx *= 0.985;
  c.vy *= 0.985;
  c.targetX = c.x + c.vx;
  c.targetY = c.y + c.vy;
  return dist;
}

/** Flee a point along a noisy vector */
function fleeNoisy(
  c: ActionBody,
  tx: number,
  ty: number,
  accel: number,
  cap: number,
  d: ActionData,
  phase: number
) {
  const dx = c.x - tx;
  const dy = c.y - ty;
  const dist = Math.hypot(dx, dy) || 1;
  const wob = noise2(phase + 40, (d.nz = (d.nz ?? 0) + 0.07)) * 0.5;
  const ang = Math.atan2(dy, dx) + wob;
  c.vx += Math.cos(ang) * accel;
  c.vy += Math.sin(ang) * accel;
  const sp = Math.hypot(c.vx, c.vy) || 1;
  if (sp > cap) { c.vx = (c.vx / sp) * cap; c.vy = (c.vy / sp) * cap; }
  c.targetX = c.x + c.vx;
  c.targetY = c.y + c.vy;
  return dist;
}

/** Keep the body loosely inside the arena with a soft repulsion field */
function contain(c: ActionBody, ctx: ActionCtx, push = 0.5) {
  const { w, h, mx, my } = ctx.bounds;
  if (c.x < mx) c.vx += push * (1 - c.x / mx);
  if (c.x > w - mx) c.vx -= push * (1 - (w - c.x) / mx);
  if (c.y < my) c.vy += push * (1 - c.y / my);
  if (c.y > h - my) c.vy -= push * (1 - (h - c.y) / my);
}

/** Impulse: a sudden kick in a random-ish direction */
function kick(c: ActionBody, power: number, angle?: number) {
  const a = angle ?? rnd(0, TAU);
  c.vx += Math.cos(a) * power;
  c.vy += Math.sin(a) * power;
}

/* ------------------------------------------------------------------ */
/*  THE MOVEMENT LIBRARY                                               */
/* ------------------------------------------------------------------ */

export const ACTIONS: ActionDef[] = [
  {
    id: 'roam',
    label: 'Wandering wherever',
    travel: true,
    w: 22,
    cost: 0.02,
    init: (c) => { kick(c, rnd(2, 6)); return { cap: rnd(5, 13), jitter: rnd(0.1, 0.34) }; },
    update: (c, d, _t, dt, ctx) => {
      wander(c, d, 26 * dt * 60, d.jitter ?? 0.2);
      contain(c, ctx, 0.6);
      // occasionally a random course correction kick
      if (Math.random() < 0.012) kick(c, rnd(1.5, 5));
      return {};
    },
  },
  {
    id: 'drift',
    label: 'Drifting aimlessly',
    travel: true,
    w: 18,
    cost: 0.008,
    init: (c) => { kick(c, rnd(0.8, 2.4)); return { cap: rnd(2, 4.5), jitter: rnd(0.05, 0.14) }; },
    update: (c, d, _t, dt, ctx) => {
      wander(c, d, 9 * dt * 60, d.jitter ?? 0.09);
      contain(c, ctx, 0.22);
      return {};
    },
  },
  {
    id: 'meander',
    label: 'Meandering about',
    travel: true,
    w: 20,
    cost: 0.015,
    init: (c) => { kick(c, rnd(1.5, 4)); return { cap: rnd(4, 9), jitter: rnd(0.16, 0.4) }; },
    update: (c, d, _t, dt, ctx) => {
      // long noise-driven arcs with random pauses
      wander(c, d, 18 * dt * 60, d.jitter ?? 0.26);
      contain(c, ctx, 0.35);
      if (Math.random() < 0.008) { c.vx *= 0.25; c.vy *= 0.25; }
      return {};
    },
  },
  {
    id: 'dart',
    label: 'Darting off',
    travel: true,
    w: 14,
    cost: 0.08,
    init: (c) => { kick(c, rnd(9, 20)); return {}; },
    update: (c, _d, _t, _dt, ctx) => {
      c.vx *= 0.965;
      c.vy *= 0.965;
      c.targetX = c.x + c.vx;
      c.targetY = c.y + c.vy;
      contain(c, ctx, 1.1);
      return { squish: -0.06 };
    },
  },
  {
    id: 'flinch',
    label: 'Flinched!',
    travel: true,
    w: 10,
    cost: 0.05,
    init: (c, ctx) => {
      const a = Math.atan2(c.y - ctx.cursor.y, c.x - ctx.cursor.x) + rnd(-0.8, 0.8);
      kick(c, rnd(11, 22), a);
      return {};
    },
    update: (c, _d, _t, _dt, ctx) => {
      c.vx *= 0.9;
      c.vy *= 0.9;
      c.targetX = c.x + c.vx;
      c.targetY = c.y + c.vy;
      contain(c, ctx, 1.4);
      return { squish: 0.1 };
    },
  },
  {
    id: 'approach',
    label: 'Drifting toward you',
    travel: true,
    w: 12,
    cost: 0.03,
    init: () => ({ cap: rnd(6, 11), nz: 0, retarget: 0, keep: rnd(90, 210) }),
    update: (c, d, t, dt, ctx) => {
      // recompute a noisy personal-space radius every so often
      d.retarget -= dt;
      if (d.retarget <= 0) { d.retarget = rnd(0.4, 1.6); d.keep = rnd(70, 230); }
      const dx = ctx.cursor.x - c.x;
      const dy = ctx.cursor.y - c.y;
      const dist = Math.hypot(dx, dy) || 1;
      // aim at a ring around the cursor, ring radius jitters
      const want = d.keep;
      const tx = ctx.cursor.x - (dx / dist) * want;
      const ty = ctx.cursor.y - (dy / dist) * want;
      const dd = seekNoisy(c, tx, ty, 34 * dt * 60 * 0.02, d.cap ?? 9, 0.55, d, t);
      contain(c, ctx, 0.4);
      return { done: dd < 40 && Math.random() < 0.03 };
    },
  },
  {
    id: 'orbit',
    label: 'Circling loosely',
    travel: true,
    w: 10,
    cost: 0.04,
    init: () => ({ nz: 0, cap: rnd(7, 13), wob: rnd(0.3, 0.85), spin: Math.random() > 0.5 ? 1 : -1 }),
    update: (c, d, t, dt, ctx) => {
      // tangential push around the cursor, radius never constant
      const dx = c.x - ctx.cursor.x;
      const dy = c.y - ctx.cursor.y;
      const dist = Math.hypot(dx, dy) || 1;
      const wantR = 150 + noise1(t * 0.4 + d.wob * 20) * 90;
      const radial = (wantR - dist) * 0.012;
      const tang = (d.spin ?? 1) * 0.5;
      const ux = dx / dist, uy = dy / dist;
      c.vx += (-uy * tang + ux * radial) * 30 * dt * 60 * 0.02;
      c.vy += (ux * tang + uy * radial) * 30 * dt * 60 * 0.02;
      // noise corruption
      const wob = noise2(t * 0.6, d.nz = (d.nz ?? 0) + 0.05) * 0.3;
      const sp = Math.hypot(c.vx, c.vy) || 1;
      if (sp > (d.cap ?? 10)) { c.vx = (c.vx / sp) * (d.cap ?? 10); c.vy = (c.vy / sp) * (d.cap ?? 10); }
      const ang = Math.atan2(c.vy, c.vx) + wob;
      const m = Math.hypot(c.vx, c.vy);
      c.vx = Math.cos(ang) * m; c.vy = Math.sin(ang) * m;
      c.targetX = c.x + c.vx;
      c.targetY = c.y + c.vy;
      // sometimes reverses direction on a whim
      if (Math.random() < 0.006) d.spin = -(d.spin ?? 1);
      contain(c, ctx, 0.4);
      return {};
    },
  },
  {
    id: 'shadow',
    label: 'Lurking nearby',
    travel: true,
    w: 9,
    cost: 0.025,
    init: () => ({ nz: 0, cap: rnd(4, 8), off: rnd(0, TAU) }),
    update: (c, d, t, dt, ctx) => {
      // hangs around the cursor at a noise-modulated offset
      const r = 130 + noise1(t * 0.33 + 11) * 70;
      const a = (d.off = (d.off ?? 0) + rnd(-0.09, 0.09));
      const tx = ctx.cursor.x + Math.cos(a) * r;
      const ty = ctx.cursor.y + Math.sin(a) * r;
      seekNoisy(c, tx, ty, 22 * dt * 60 * 0.02, d.cap ?? 6, 0.4, d, t);
      contain(c, ctx, 0.35);
      return {};
    },
  },
  {
    id: 'inspect',
    label: 'Checking something out',
    travel: true,
    w: 13,
    cost: 0.03,
    init: (_c, ctx) => {
      // a genuinely random point in the arena
      const { w, h, mx, my } = ctx.bounds;
      return {
        tx: rnd(mx, w - mx),
        ty: rnd(my, h - my),
        nz: 0,
        cap: rnd(5, 10),
        got: 0,
        newPt: 0,
      };
    },
    update: (c, d, t, dt, ctx) => {
      d.newPt -= dt;
      if (d.newPt <= 0) { d.newPt = rnd(1.2, 3.4); d.got = 0; }
      if (!d.got) {
        const dist = seekNoisy(c, d.tx, d.ty, 30 * dt * 60 * 0.02, d.cap ?? 8, 0.7, d, t);
        if (dist < 60) {
          d.got = 1;
          const { w: W, h: H, mx: MX, my: MY } = ctx.bounds;
          d.tx = rnd(MX, W - MX);
          d.ty = rnd(MY, H - MY);
        }
      } else {
        // hover & jitter around the inspected point
        c.vx *= 0.9;
        c.vy *= 0.9;
        c.vx += rnd(-0.35, 0.35);
        c.vy += rnd(-0.35, 0.35);
        c.targetX = c.x + c.vx;
        c.targetY = c.y + c.vy;
      }
      contain(c, ctx, 0.4);
      return {};
    },
  },
  {
    id: 'burst',
    label: 'Sudden burst',
    travel: true,
    w: 11,
    cost: 0.1,
    init: (c) => { kick(c, rnd(12, 26)); return { kicks: 0, next: rnd(0.15, 0.4) }; },
    update: (c, d, _t, dt, ctx) => {
      d.next -= dt;
      if (d.next <= 0) {
        d.next = rnd(0.1, 0.45);
        kick(c, rnd(6, 18));
        d.kicks = (d.kicks ?? 0) + 1;
      }
      c.vx *= 0.96;
      c.vy *= 0.96;
      c.targetX = c.x + c.vx;
      c.targetY = c.y + c.vy;
      contain(c, ctx, 1.2);
      return { squish: -0.08 };
    },
  },
  {
    id: 'frenzy',
    label: 'FRENZY!',
    travel: true,
    w: 8,
    cost: 0.16,
    init: (c) => { kick(c, rnd(14, 30)); return { next: 0, cap: rnd(16, 26) }; },
    update: (c, d, t, dt, ctx) => {
      d.next -= dt;
      if (d.next <= 0) {
        d.next = rnd(0.05, 0.22);
        kick(c, rnd(8, 24));
      }
      wander(c, d, 60 * dt * 60 * 0.02, 0.5);
      c.vx *= 0.97;
      c.vy *= 0.97;
      const sp = Math.hypot(c.vx, c.vy) || 1;
      if (sp > (d.cap ?? 22)) { c.vx = (c.vx / sp) * (d.cap ?? 22); c.vy = (c.vy / sp) * (d.cap ?? 22); }
      c.targetX = c.x + c.vx;
      c.targetY = c.y + c.vy;
      contain(c, ctx, 1.6);
      return { squish: -0.05, rot: noise1(t * 4) * 0.35 };
    },
  },
  {
    id: 'hover_still',
    label: 'Hovering still',
    travel: false,
    w: 14,
    cost: -0.03,
    init: () => ({ nz: 0 }),
    update: (c, d, t, _dt, _ctx) => {
      // barely perceptible noise bob, no destination at all
      c.vx = noise2(t * 0.5, d.nz = (d.nz ?? 0) + 0.02) * 0.5;
      c.vy = noise2(t * 0.5 + 99, d.nz) * 0.5;
      c.targetX = c.x + c.vx;
      c.targetY = c.y + c.vy;
      return {};
    },
  },
  {
    id: 'settle',
    label: 'Settling down',
    travel: false,
    w: 16,
    cost: -0.06,
    init: () => ({ nz: 0 }),
    update: (c, d, t, _dt, ctx) => {
      // sink toward home but with noise, never a clean line
      const wob = noise2(t * 0.3, d.nz = (d.nz ?? 0) + 0.02) * 24;
      c.vx += ((ctx.home.x + wob - c.x) * 0.004);
      c.vy += ((ctx.home.y - c.y) * 0.004);
      c.vx *= 0.93;
      c.vy *= 0.93;
      c.targetX = c.x + c.vx;
      c.targetY = c.y + c.vy;
      return { squish: noise1(t * 0.9) * 0.02 };
    },
  },
  {
    id: 'seek_food',
    label: 'Going for the snack',
    travel: true,
    w: 40,
    cost: 0.05,
    init: () => ({ nz: 0, cap: rnd(9, 15) }),
    update: (c, d, t, dt, ctx) => {
      let best: { x: number; y: number } | null = null;
      let bd = Infinity;
      for (const f of ctx.food) {
        const dd = Math.hypot(f.x - c.x, f.y - c.y);
        if (dd < bd) { bd = dd; best = f; }
      }
      if (!best) return { done: true };
      seekNoisy(c, best.x, best.y, 46 * dt * 60 * 0.02, d.cap ?? 12, 0.22, d, t);
      contain(c, ctx, 0.4);
      return {};
    },
  },
  {
    id: 'chase_laser',
    label: 'Chasing the dot',
    travel: true,
    w: 46,
    cost: 0.12,
    init: () => ({ nz: 0, cap: rnd(14, 22), lag: rnd(0, 0.25) }),
    update: (c, d, t, dt, ctx) => {
      if (ctx.tool !== 'laser') return { done: true };
      // aims at a slightly stale cursor position with heavy noise
      const tx = ctx.cursor.x - ctx.cursor.vx * (d.lag ?? 0.1) * 4;
      const ty = ctx.cursor.y - ctx.cursor.vy * (d.lag ?? 0.1) * 4;
      seekNoisy(c, tx, ty, 58 * dt * 60 * 0.02, d.cap ?? 18, 0.4, d, t);
      contain(c, ctx, 0.5);
      if (Math.random() < 0.01) d.cap = rnd(12, 24);
      return { squish: -0.03, rot: noise1(t * 6) * 0.2 };
    },
  },
  {
    id: 'come_here',
    label: 'Coming over',
    travel: true,
    w: 26,
    cost: 0.06,
    init: (_c, ctx) => ({ nz: 0, cap: rnd(11, 18), tx: ctx.cursor.x, ty: ctx.cursor.y }),
    update: (c, d, t, dt, ctx) => {
      const dist = seekNoisy(c, d.tx, d.ty, 52 * dt * 60 * 0.02, d.cap ?? 15, 0.3, d, t);
      contain(c, ctx, 0.4);
      return { done: dist < 55 };
    },
  },
  {
    id: 'evade',
    label: 'Keeping away',
    travel: true,
    w: 9,
    cost: 0.05,
    init: () => ({ nz: 0, cap: rnd(7, 13) }),
    update: (c, d, t, dt, ctx) => {
      fleeNoisy(c, ctx.cursor.x, ctx.cursor.y, 30 * dt * 60 * 0.02, d.cap ?? 10, d, t);
      contain(c, ctx, 0.7);
      return {};
    },
  },
  {
    id: 'dart_by',
    label: 'Zooming past',
    travel: true,
    w: 8,
    cost: 0.09,
    init: (c, ctx) => {
      // launch on a heading that will roughly cross the cursor's vicinity
      const a = Math.atan2(ctx.cursor.y - c.y, ctx.cursor.x - c.x) + rnd(-0.5, 0.5);
      kick(c, rnd(16, 30), a);
      return {};
    },
    update: (c, _d, _t, _dt, ctx) => {
      c.vx *= 0.972;
      c.vy *= 0.972;
      c.targetX = c.x + c.vx;
      c.targetY = c.y + c.vy;
      contain(c, ctx, 1.3);
      return { squish: -0.07 };
    },
  },
];

/* ================================================================== */
/*  SOCIAL MOVEMENT — everything below targets another creature        */
/* ================================================================== */

const P_ = (ctx: ActionCtx) => ctx.partner ?? null;

ACTIONS.push(
  {
    id: 'chase_partner',
    label: 'Chasing them!',
    travel: true,
    w: 0,
    cost: 0.11,
    init: () => ({ nz: 0, cap: rnd(11, 19), lead: rnd(0, 0.5) }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      seekNoisy(c, p.x, p.y, 50 * dt * 60 * 0.02, d.cap ?? 14, 0.45, d, t);
      contain(c, ctx, 0.6);
      if (Math.random() < 0.008) d.cap = rnd(10, 20);
      return { rot: noise1(t * 5) * 0.2, squish: -0.04 };
    },
  },
  {
    id: 'flee_partner',
    label: 'Running away!',
    travel: true,
    w: 0,
    cost: 0.1,
    init: () => ({ nz: 0, cap: rnd(10, 18), swerve: 0 }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      fleeNoisy(c, p.x, p.y, 44 * dt * 60 * 0.02, d.cap ?? 14, d, t);
      // random panicked swerves
      if (Math.random() < 0.02) kick(c, rnd(3, 9));
      contain(c, ctx, 1.1);
      return { rot: noise1(t * 6 + 20) * 0.25, squish: -0.05 };
    },
  },
  {
    id: 'follow_partner',
    label: 'Tagging along',
    travel: true,
    w: 0,
    cost: 0.045,
    init: () => ({ nz: 0, cap: rnd(7, 13), gap: rnd(110, 210) }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      const dx = p.x - c.x, dy = p.y - c.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (Math.random() < 0.006) d.gap = rnd(90, 240);
      const tx = p.x - (dx / dist) * d.gap;
      const ty = p.y - (dy / dist) * d.gap;
      seekNoisy(c, tx, ty, 30 * dt * 60 * 0.02, d.cap ?? 10, 0.5, d, t);
      contain(c, ctx, 0.45);
      return {};
    },
  },
  {
    id: 'lead_partner',
    label: 'Showing the way',
    travel: true,
    w: 0,
    cost: 0.05,
    init: () => ({ h: rnd(0, TAU), cap: rnd(6, 11), nt: 0, turn: rnd(1.5, 4) }),
    update: (c, d, t, dt, ctx) => {
      // wanders with flourish so the follower has something to copy
      d.turn -= dt;
      if (d.turn <= 0) { d.turn = rnd(1.2, 3.6); d.h = (d.h ?? 0) + rnd(-1.6, 1.6); }
      wander(c, d, 22 * dt * 60, 0.16);
      contain(c, ctx, 0.55);
      return { rot: noise1(t * 1.6) * 0.14 };
    },
  },
  {
    id: 'orbit_partner',
    label: 'Circling each other',
    travel: true,
    w: 0,
    cost: 0.055,
    init: () => ({ nz: 0, cap: rnd(8, 14), spin: Math.random() > 0.5 ? 1 : -1, wob: rnd(0, 30) }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      const dx = c.x - p.x, dy = c.y - p.y;
      const dist = Math.hypot(dx, dy) || 1;
      const wantR = 165 + noise1(t * 0.5 + d.wob) * 75;
      const radial = (wantR - dist) * 0.014;
      const tang = (d.spin ?? 1) * 0.62;
      const ux = dx / dist, uy = dy / dist;
      c.vx += (-uy * tang + ux * radial) * 32 * dt * 60 * 0.02;
      c.vy += (ux * tang + uy * radial) * 32 * dt * 60 * 0.02;
      const sp = Math.hypot(c.vx, c.vy) || 1;
      const cap = d.cap ?? 11;
      if (sp > cap) { c.vx = (c.vx / sp) * cap; c.vy = (c.vy / sp) * cap; }
      c.targetX = c.x + c.vx;
      c.targetY = c.y + c.vy;
      if (Math.random() < 0.005) d.spin = -(d.spin ?? 1);
      contain(c, ctx, 0.5);
      return { rot: (d.spin ?? 1) * 0.1 };
    },
  },
  {
    id: 'mirror_partner',
    label: 'Copying them',
    travel: true,
    w: 0,
    cost: 0.05,
    init: (_c, ctx) => {
      const p = P_(ctx);
      return { ox: p ? _c.x - p.x : 160, oy: p ? _c.y - p.y : 0, nz: 0, cap: rnd(8, 14) };
    },
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      // holds a mirrored offset, jittering it so it's never exact
      if (Math.random() < 0.01) { d.ox *= rnd(0.85, 1.15); d.oy *= rnd(0.85, 1.15); }
      seekNoisy(c, p.x - d.ox, p.y - d.oy, 34 * dt * 60 * 0.02, d.cap ?? 11, 0.35, d, t);
      contain(c, ctx, 0.5);
      return {};
    },
  },
  {
    id: 'face_partner',
    label: 'Locked in a stare',
    travel: false,
    w: 0,
    cost: 0.01,
    init: () => ({ nz: 0 }),
    update: (c, d, t, _dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      // holds ground with tiny tense tremors
      c.vx *= 0.82;
      c.vy *= 0.82;
      c.vx += noise2(t * 0.9, d.nz = (d.nz ?? 0) + 0.03) * 0.35;
      c.vy += noise2(t * 0.9 + 50, d.nz) * 0.35;
      c.targetX = c.x + c.vx;
      c.targetY = c.y + c.vy;
      return { squish: Math.sin(t * 9) * 0.012 };
    },
  },
  {
    id: 'bump_partner',
    label: 'Nudging them',
    travel: true,
    w: 0,
    cost: 0.07,
    init: () => ({ nz: 0, hit: 0, cap: rnd(12, 20) }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      const dist = Math.hypot(p.x - c.x, p.y - c.y);
      if (d.hit) {
        // recoil after contact
        c.vx *= 0.93; c.vy *= 0.93;
        c.targetX = c.x + c.vx;
        c.targetY = c.y + c.vy;
        return { squish: 0.08, done: d.hit > 0 && Math.random() < 0.04 };
      }
      seekNoisy(c, p.x, p.y, 60 * dt * 60 * 0.02, d.cap ?? 16, 0.2, d, t);
      if (dist < 110) {
        d.hit = 1;
        const a = Math.atan2(c.y - p.y, c.x - p.x);
        kick(c, rnd(8, 16), a);
      }
      contain(c, ctx, 0.6);
      return { squish: -0.05 };
    },
  },
  {
    id: 'hide_from_partner',
    label: 'Hiding away',
    travel: true,
    w: 0,
    cost: 0.05,
    init: (_c, ctx) => {
      const { w, h, mx, my } = ctx.bounds;
      const spot = pickCorner(w, h, mx, my);
      return { tx: spot.x, ty: spot.y, nz: 0, cap: rnd(7, 13), re: rnd(2, 5) };
    },
    update: (c, d, t, dt, ctx) => {
      d.re -= dt;
      if (d.re <= 0) {
        const { w, h, mx, my } = ctx.bounds;
        const s = pickCorner(w, h, mx, my);
        d.tx = s.x; d.ty = s.y; d.re = rnd(2.5, 6);
      }
      const p = P_(ctx);
      if (p) {
        // if they get close, pick a new hiding spot immediately
        if (Math.hypot(p.x - c.x, p.y - c.y) < 200 && Math.random() < 0.05) {
          const { w, h, mx, my } = ctx.bounds;
          const s = pickCorner(w, h, mx, my);
          d.tx = s.x; d.ty = s.y;
        }
      }
      seekNoisy(c, d.tx, d.ty, 30 * dt * 60 * 0.02, d.cap ?? 10, 0.5, d, t);
      contain(c, ctx, 0.6);
      return {};
    },
  },
  {
    id: 'huddle_partner',
    label: 'Huddling close',
    travel: true,
    w: 0,
    cost: 0.02,
    init: () => ({ nz: 0, cap: rnd(4, 8), gap: rnd(95, 145) }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      const dx = p.x - c.x, dy = p.y - c.y;
      const dist = Math.hypot(dx, dy) || 1;
      const gap = d.gap + Math.sin(t * 1.4) * 14;
      const tx = p.x - (dx / dist) * gap;
      const ty = p.y - (dy / dist) * gap;
      seekNoisy(c, tx, ty, 20 * dt * 60 * 0.02, d.cap ?? 6, 0.3, d, t);
      contain(c, ctx, 0.35);
      return { squish: Math.sin(t * 1.9) * 0.03 };
    },
  },
  {
    id: 'greet_partner',
    label: 'Going to say hi',
    travel: true,
    w: 0,
    cost: 0.06,
    init: () => ({ nz: 0, cap: rnd(9, 15), bob: 0 }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      const dist = seekNoisy(c, p.x, p.y, 40 * dt * 60 * 0.02, d.cap ?? 12, 0.3, d, t);
      contain(c, ctx, 0.45);
      if (dist < 150) return { squish: Math.sin(t * 11) * 0.07, done: Math.random() < 0.03 };
      return {};
    },
  },
  {
    id: 'avoid_partner',
    label: 'Moving away from them',
    travel: true,
    w: 0,
    cost: 0.04,
    init: () => ({ nz: 0, cap: rnd(6, 11) }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      fleeNoisy(c, p.x, p.y, 24 * dt * 60 * 0.02, d.cap ?? 8, d, t);
      contain(c, ctx, 0.7);
      return {};
    },
  },
  /* ---- food curiosity ---- */
  {
    id: 'inspect_food',
    label: 'Curious about the snack',
    travel: true,
    w: 0,
    cost: 0.03,
    init: () => ({ nz: 0, cap: rnd(6, 11), hover: 0, verdict: Math.random() }),
    update: (c, d, t, dt, ctx) => {
      const f = ctx.focusFood;
      if (!f) return { done: true };
      const dist = Math.hypot(f.x - c.x, f.y - c.y);
      if (dist > 90) {
        seekNoisy(c, f.x, f.y, 26 * dt * 60 * 0.02, d.cap ?? 8, 0.55, d, t);
      } else {
        // hovering over it, bobbing and considering
        d.hover += dt;
        c.vx *= 0.86;
        c.vy *= 0.86;
        c.vx += Math.cos(t * 5.5) * 0.5 + noise2(t, d.nz = (d.nz ?? 0) + 0.04) * 0.4;
        c.vy += Math.sin(t * 4.1) * 0.4;
        c.targetX = c.x + c.vx;
        c.targetY = c.y + c.vy;
        if (d.hover > rnd(0.6, 2.4)) return { done: true, squish: 0.04 };
      }
      contain(c, ctx, 0.4);
      return { rot: Math.sin(t * 3) * 0.06 };
    },
  },
  {
    id: 'waltz_partner',
    label: 'Waltzing in the air',
    travel: true,
    w: 0,
    cost: 0.05,
    init: () => ({ nz: 0, ang: rnd(0, TAU), cap: rnd(8, 14) }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      d.ang = (d.ang ?? 0) + dt * 2.4;
      const midX = (c.x + p.x) / 2;
      const midY = (c.y + p.y) / 2;
      const r = 110 + Math.sin(t * 1.8) * 35;
      const tx = midX + Math.cos(d.ang) * r;
      const ty = midY + Math.sin(d.ang) * r * 0.7;
      seekNoisy(c, tx, ty, 38 * dt * 60 * 0.02, d.cap ?? 11, 0.25, d, t);
      contain(c, ctx, 0.45);
      return { rot: Math.sin(d.ang) * 0.22, squish: Math.sin(t * 4.8) * 0.04 };
    },
  },
  {
    id: 'boop_partner',
    label: 'Booping nose-to-nose',
    travel: true,
    w: 0,
    cost: 0.04,
    init: () => ({ nz: 0, phase: 0, cap: rnd(10, 16) }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      const dist = Math.hypot(p.x - c.x, p.y - c.y);
      if (dist < 88) {
        // boop! gentle bounce back
        const a = Math.atan2(c.y - p.y, c.x - p.x);
        c.vx += Math.cos(a) * 4.5;
        c.vy += Math.sin(a) * 4.5;
        c.targetX = c.x + c.vx;
        c.targetY = c.y + c.vy;
        return { squish: 0.12, rot: Math.sin(t * 12) * 0.1 };
      }
      seekNoisy(c, p.x, p.y, 44 * dt * 60 * 0.02, d.cap ?? 13, 0.2, d, t);
      contain(c, ctx, 0.5);
      return { squish: -0.04 };
    },
  },
  {
    id: 'whisper_partner',
    label: 'Whispering a secret',
    travel: true,
    w: 0,
    cost: 0.03,
    init: () => ({ nz: 0, side: Math.random() < 0.5 ? -1 : 1, cap: rnd(7, 12) }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      const tx = p.x + (d.side ?? 1) * 96;
      const ty = p.y - 12 + Math.sin(t * 3.2) * 8;
      seekNoisy(c, tx, ty, 32 * dt * 60 * 0.02, d.cap ?? 9, 0.25, d, t);
      contain(c, ctx, 0.4);
      return { rot: -(d.side ?? 1) * 0.2, squish: Math.sin(t * 7) * 0.025 };
    },
  },
  {
    id: 'acrobat_partner',
    label: 'Acrobatic leap over them',
    travel: true,
    w: 0,
    cost: 0.08,
    init: () => ({ nz: 0, phase: 0, cap: rnd(14, 22) }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      const arc = Math.sin(t * 2.2) * 140;
      const tx = p.x + Math.cos(t * 1.9) * 135;
      const ty = p.y - Math.abs(arc) - 40;
      seekNoisy(c, tx, ty, 52 * dt * 60 * 0.02, d.cap ?? 16, 0.2, d, t);
      contain(c, ctx, 0.5);
      return { rot: Math.sin(t * 3.5) * 0.28, squish: -0.06 };
    },
  },
  {
    id: 'comfort_partner',
    label: 'Comforting cuddle',
    travel: true,
    w: 0,
    cost: 0.02,
    init: () => ({ nz: 0, cap: rnd(6, 10) }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      const tx = p.x + Math.sin(t * 0.9) * 62;
      const ty = p.y + Math.cos(t * 0.9) * 44;
      seekNoisy(c, tx, ty, 26 * dt * 60 * 0.02, d.cap ?? 8, 0.2, d, t);
      contain(c, ctx, 0.4);
      return { rot: Math.sin(t * 1.5) * 0.08, squish: Math.sin(t * 2.4) * 0.03 };
    },
  },
  {
    id: 'spook_sneak_partner',
    label: 'Sneaking up for a BOO!',
    travel: true,
    w: 0,
    cost: 0.07,
    init: () => ({ nz: 0, ready: 0, cap: rnd(5, 10) }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      const dist = Math.hypot(p.x - c.x, p.y - c.y);
      if (t > 2.2 || dist < 120) {
        // BOO!! Sudden pounce
        if (!d.ready) {
          const a = Math.atan2(p.y - c.y, p.x - c.x);
          kick(c, rnd(16, 26), a);
          d.ready = 1;
        }
        c.vx *= 0.94; c.vy *= 0.94;
        c.targetX = c.x + c.vx; c.targetY = c.y + c.vy;
        return { squish: 0.15, rot: (Math.random() - 0.5) * 0.3 };
      }
      // slow creep from behind
      const tx = p.x + (c.x > p.x ? 180 : -180);
      const ty = p.y - 10;
      seekNoisy(c, tx, ty, 18 * dt * 60 * 0.02, d.cap ?? 6, 0.15, d, t);
      contain(c, ctx, 0.4);
      return { squish: -0.04 };
    },
  },
  {
    id: 'swim_sync_partner',
    label: 'Synchronized air-swimming',
    travel: true,
    w: 0,
    cost: 0.05,
    init: () => ({ nz: 0, off: rnd(-100, 100), cap: rnd(9, 15) }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      const tx = p.x + (d.off ?? 80);
      const ty = p.y + Math.sin(t * 3.1) * 65;
      seekNoisy(c, tx, ty, 36 * dt * 60 * 0.02, d.cap ?? 12, 0.2, d, t);
      contain(c, ctx, 0.45);
      return { rot: Math.cos(t * 3.1) * 0.15, squish: Math.sin(t * 6.2) * 0.03 };
    },
  },
  {
    id: 'standoff_partner',
    label: 'Jealous standoff',
    travel: true,
    w: 0,
    cost: 0.04,
    init: () => ({ nz: 0, cap: rnd(7, 12) }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      const dx = p.x - c.x, dy = p.y - c.y;
      const dist = Math.hypot(dx, dy) || 1;
      const want = 180;
      const tx = p.x - (dx / dist) * want;
      const ty = p.y - (dy / dist) * want;
      seekNoisy(c, tx, ty, 28 * dt * 60 * 0.02, d.cap ?? 9, 0.25, d, t);
      contain(c, ctx, 0.4);
      return { squish: Math.sin(t * 14) * 0.025 };
    },
  },
  {
    id: 'duet_bob_partner',
    label: 'Singing an air-duet',
    travel: false,
    w: 0,
    cost: 0.03,
    init: () => ({ nz: 0, cap: rnd(6, 11) }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      const bob = Math.sin(t * 4.2) * 26;
      seekNoisy(c, p.x + (c.x > p.x ? 120 : -120), p.y + bob, 30 * dt * 60 * 0.02, d.cap ?? 9, 0.2, d, t);
      contain(c, ctx, 0.4);
      return { squish: Math.sin(t * 8.4) * 0.05, rot: Math.sin(t * 4.2) * 0.09 };
    },
  },
  {
    id: 'nap_cuddle_partner',
    label: 'Napping together',
    travel: false,
    w: 0,
    cost: -0.04,
    init: () => ({ nz: 0, cap: rnd(4, 7) }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      seekNoisy(c, p.x + (c.x > p.x ? 88 : -88), p.y + 10, 18 * dt * 60 * 0.02, d.cap ?? 5, 0.15, d, t);
      contain(c, ctx, 0.35);
      return { squish: Math.sin(t * 1.3) * 0.02 };
    },
  },
  /* ---- wave 3: richer shared activities ---- */
  {
    id: 'guard_partner',
    label: 'Standing guard',
    travel: true,
    w: 0,
    cost: 0.02,
    init: () => ({ nz: 0, ang: rnd(0, TAU), cap: rnd(5, 9) }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      // circles slowly around them at a watchful distance
      d.ang = (d.ang ?? 0) + dt * 0.9;
      const tx = p.x + Math.cos(d.ang) * 170;
      const ty = p.y + Math.sin(d.ang) * 130;
      seekNoisy(c, tx, ty, 22 * dt * 60 * 0.02, d.cap ?? 7, 0.2, d, t);
      contain(c, ctx, 0.4);
      return { rot: Math.sin(t * 8) * 0.012 };
    },
  },
  {
    id: 'gift_partner',
    label: 'Bringing a gift',
    travel: true,
    w: 0,
    cost: 0.05,
    init: () => ({ nz: 0, cap: rnd(9, 15), given: 0 }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      const dist = Math.hypot(p.x - c.x, p.y - c.y);
      if (dist < 140 && !d.given) {
        d.given = 1;
        // a small hop of pride on delivery
        return { squish: -0.18, rot: 0.2, done: Math.random() < 0.35 };
      }
      seekNoisy(c, p.x, p.y, 40 * dt * 60 * 0.02, d.cap ?? 12, 0.25, d, t);
      contain(c, ctx, 0.45);
      return { squish: -0.04 };
    },
  },
  {
    id: 'showoff_partner',
    label: 'Showing off',
    travel: true,
    w: 0,
    cost: 0.07,
    init: () => ({ nz: 0, trick: 0, next: 0, cap: rnd(12, 20) }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      d.next -= dt;
      if (d.next <= 0) {
        d.next = rnd(0.5, 1.5);
        d.trick = Math.floor(Math.random() * 3);
        kick(c, rnd(6, 16));
      }
      // three distinct trick modes, picked at random
      const mode = d.trick ?? 0;
      if (mode === 0) {
        wander(c, d, 34 * dt * 60, 0.3);
      } else if (mode === 1) {
        // tight fast loop around the audience
        const dx = c.x - p.x, dy = c.y - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        const ux = dx / dist, uy = dy / dist;
        c.vx += (-uy * 0.8 + ux * 0.1) * 34 * dt * 60 * 0.02;
        c.vy += (ux * 0.8 + uy * 0.1) * 34 * dt * 60 * 0.02;
        c.targetX = c.x + c.vx; c.targetY = c.y + c.vy;
      } else {
        // dramatic rise then dive
        const bob = Math.sin(t * 3.4) * 130;
        seekNoisy(c, p.x + 150, p.y - bob, 40 * dt * 60 * 0.02, d.cap ?? 16, 0.3, d, t);
      }
      contain(c, ctx, 0.6);
      return { rot: noise1(t * 4) * 0.3, squish: -0.05 };
    },
  },
  {
    id: 'side_by_side_partner',
    label: 'Watching together',
    travel: true,
    w: 0,
    cost: 0.02,
    init: () => ({ nz: 0, cap: rnd(5, 9), side: Math.random() < 0.5 ? -1 : 1 }),
    update: (c, d, t, dt, ctx) => {
      const p = P_(ctx);
      if (!p) return { done: true };
      // settles into a shared vantage point next to them
      const tx = p.x + (d.side ?? 1) * 150;
      const ty = p.y + Math.sin(t * 0.9) * 12;
      seekNoisy(c, tx, ty, 20 * dt * 60 * 0.02, d.cap ?? 7, 0.18, d, t);
      contain(c, ctx, 0.35);
      return { squish: Math.sin(t * 1.7) * 0.015 };
    },
  },
);

function pickCorner(w: number, h: number, mx: number, my: number) {
  const side = Math.floor(Math.random() * 4);
  const inset = 90;
  return {
    x: side === 0 ? inset + mx : side === 1 ? w - inset - mx : rnd(mx, w - mx),
    y: side === 2 ? inset + my : side === 3 ? h - inset - my : rnd(my, h - my),
  };
}

/* ------------------------------------------------------------------ */
/*  EXECUTOR                                                           */
/* ------------------------------------------------------------------ */

export interface RunningAction {
  def: ActionDef;
  t: number;
  dur: number;
  data: ActionData;
}

/** Randomised duration so nothing repeats rhythmically */
function randDur(def: ActionDef): number {
  // social actions run until the game ends, so give them long leashes
  if (def.id.endsWith('_partner')) return rnd(4, 12);
  if (def.id === 'inspect_food') return rnd(2.5, 7);
  if (def.id === 'flinch') return rnd(0.35, 0.9);
  if (def.id === 'dart' || def.id === 'burst') return rnd(0.7, 2.0);
  if (def.id === 'frenzy') return rnd(1.2, 2.8);
  if (def.id === 'come_here') return rnd(1.0, 2.6);
  if (def.id === 'chase_laser') return rnd(2.0, 6.0);
  if (def.id === 'seek_food') return rnd(1.5, 4.0);
  return rnd(2.0, 7.5);
}

export function pickAction(
  ctx: ActionCtx,
  opts: { prefer?: string; allowTravel?: boolean } = {}
): RunningAction | null {
  const pool = ACTIONS.filter((a) => {
    if (opts.prefer) return a.id === opts.prefer;
    if (a.travel && !ctx.canTravel && opts.allowTravel !== true) return false;
    if (a.id === 'seek_food' && ctx.food.length === 0) return false;
    if (a.id === 'chase_laser' && ctx.tool !== 'laser') return false;
    return true;
  });
  if (!pool.length) return null;

  const total = pool.reduce((s, a) => s + (a.w ?? 5), 0);
  let r = Math.random() * total;
  let def = pool[pool.length - 1];
  for (const a of pool) {
    r -= a.w ?? 5;
    if (r <= 0) { def = a; break; }
  }
  return startAction(def, ctx);
}

export function startAction(def: ActionDef, ctx: ActionCtx): RunningAction {
  const body: ActionBody = {
    x: ctx.self.x, y: ctx.self.y, vx: 0, vy: 0,
    targetX: ctx.self.x, targetY: ctx.self.y,
  };
  const data = def.init ? def.init(body, ctx) : {};
  return { def, t: 0, dur: randDur(def), data };
}

export function stepAction(
  run: RunningAction,
  c: ActionBody,
  dt: number,
  ctx: ActionCtx
): { done: boolean; rot: number; squish: number } {
  run.t += dt;
  const res = run.def.update(c, run.data, run.t, dt, ctx) || {};
  // random early termination — nothing runs a predictable length
  const earlyAbort = Math.random() < 0.0016;
  const done = earlyAbort || run.t >= run.dur || res.done === true;
  return { done, rot: res.rot ?? 0, squish: res.squish ?? 0 };
}
