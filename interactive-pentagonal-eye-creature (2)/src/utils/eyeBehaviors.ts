// ============================================================
//  PENTA — Cinematic Eye Behavior Engine  v3
//  Keyframe timelines · 24 easing curves · 130+ authored routines
//  + combinatorial procedural generator (thousands of variants)
// ============================================================

import { EyeMood } from '../types';
import { GlintStyle } from './eyes';

/* ------------------------------------------------------------------
 * 1. EASING LIBRARY
 * ------------------------------------------------------------------ */

export type Ease =
  | 'linear'
  | 'inQuad' | 'outQuad' | 'inOutQuad'
  | 'inCubic' | 'outCubic' | 'inOutCubic'
  | 'inQuart' | 'outQuart'
  | 'inExpo' | 'outExpo' | 'inOutExpo'
  | 'inCirc' | 'outCirc'
  | 'inBack' | 'outBack' | 'inOutBack'
  | 'outElastic' | 'inElastic'
  | 'outBounce'
  | 'snap' | 'hold' | 'flicker' | 'stagger';

const c1 = 1.70158;
const c3 = c1 + 1;
const c4 = (2 * Math.PI) / 3;

export const EASE: Record<Ease, (t: number) => number> = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inQuart: (t) => t * t * t * t,
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
  inExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutExpo: (t) =>
    t === 0 ? 0 : t === 1 ? 1 : t < 0.5
      ? Math.pow(2, 20 * t - 10) / 2
      : (2 - Math.pow(2, -20 * t + 10)) / 2,
  inCirc: (t) => 1 - Math.sqrt(1 - Math.pow(t, 2)),
  outCirc: (t) => Math.sqrt(1 - Math.pow(t - 1, 2)),
  inBack: (t) => c3 * t * t * t - c1 * t * t,
  outBack: (t) => 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2),
  inOutBack: (t) => {
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  outElastic: (t) =>
    t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1,
  inElastic: (t) =>
    t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4),
  outBounce: (t) => {
    const n1 = 7.5625, d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  snap: (t) => (t < 0.82 ? EASE.outExpo(t / 0.82) : 1),
  hold: (t) => (t < 1 ? 0 : 1),
  flicker: (t) => (Math.sin(t * Math.PI * 9) > 0 ? Math.min(1, t * 1.4) : t * 0.35),
  stagger: (t) => Math.round(t * 5) / 5,
};

/* ------------------------------------------------------------------
 * 2. PARAMETER MODEL
 * ------------------------------------------------------------------ */

export interface EyeShapeParams {
  leftWidth: number;
  leftHeight: number;
  rightWidth: number;
  rightHeight: number;
  leftLidTop: number;
  leftLidBottom: number;
  rightLidTop: number;
  rightLidBottom: number;
  leftAngle: number;
  rightAngle: number;
  leftScale: number;
  rightScale: number;
  glintStyle: GlintStyle;
  trackingDamping: number;
  trackingSaccade: number;
  pupilDistance: number;
  eyeYOffset: number;
  browAngle: number;
  /** 0 = ignores the cursor entirely · 1 = full pursuit */
  trackingWeight: number;
  /** forced gaze push in body-space px (used for glances / rolls) */
  gazeBiasX: number;
  gazeBiasY: number;
  /** independent per-eye nudges (cross-eye, lazy eye, derp) */
  leftOffsetX: number;
  leftOffsetY: number;
  rightOffsetX: number;
  rightOffsetY: number;
  /** specular strength multiplier */
  glintIntensity: number;
  /** high-frequency tremor amplitude */
  tremor: number;
  /** vertical breathing of the eye pair */
  breath: number;
}

const NUMERIC_KEYS: (keyof EyeShapeParams)[] = [
  'leftWidth', 'leftHeight', 'rightWidth', 'rightHeight',
  'leftLidTop', 'leftLidBottom', 'rightLidTop', 'rightLidBottom',
  'leftAngle', 'rightAngle', 'leftScale', 'rightScale',
  'trackingDamping', 'trackingSaccade', 'pupilDistance', 'eyeYOffset',
  'browAngle', 'trackingWeight', 'gazeBiasX', 'gazeBiasY',
  'leftOffsetX', 'leftOffsetY', 'rightOffsetX', 'rightOffsetY',
  'glintIntensity', 'tremor', 'breath',
];

// Proportional factors matched to the wide pentagon skull
const W = 1.18;   // width
const H = 1.06;   // height
const D = 1.62;   // pupil distance

export function defaultParams(): EyeShapeParams {
  return {
    leftWidth: 16 * W,
    leftHeight: 40 * H,
    rightWidth: 16 * W,
    rightHeight: 40 * H,
    leftLidTop: 0,
    leftLidBottom: 0,
    rightLidTop: 0,
    rightLidBottom: 0,
    leftAngle: 0,
    rightAngle: 0,
    leftScale: 1,
    rightScale: 1,
    glintStyle: 'standard',
    trackingDamping: 0.12,
    trackingSaccade: 0,
    pupilDistance: 38 * D,
    eyeYOffset: -6,
    browAngle: 0,
    trackingWeight: 1,
    gazeBiasX: 0,
    gazeBiasY: 0,
    leftOffsetX: 0,
    leftOffsetY: 0,
    rightOffsetX: 0,
    rightOffsetY: 0,
    glintIntensity: 1,
    tremor: 0,
    breath: 1,
  };
}

/* ------------------------------------------------------------------
 * 3. TIMELINE TYPES
 * ------------------------------------------------------------------ */

export type P = Partial<EyeShapeParams>;

export interface Frame {
  /** duration in seconds */
  d: number;
  /** target parameter deltas for this frame */
  p: P;
  /** easing curve into this frame */
  e?: Ease;
}

export type BehaviorCategory =
  | 'blink' | 'attention' | 'emotion' | 'idle'
  | 'playful' | 'wary' | 'tech' | 'chaos' | 'rare';

export interface BehaviorDef {
  id: string;
  name: string;
  cat: BehaviorCategory;
  frames: Frame[];
  loop?: boolean;
  /** relative pick probability */
  w?: number;
}

/* shorthand builders --------------------------------------------- */
const both = (o: {
  w?: number; h?: number; lidT?: number; lidB?: number;
  ang?: number; sc?: number;
}): P => ({
  ...(o.w !== undefined ? { leftWidth: o.w * W, rightWidth: o.w * W } : {}),
  ...(o.h !== undefined ? { leftHeight: o.h * H, rightHeight: o.h * H } : {}),
  ...(o.lidT !== undefined ? { leftLidTop: o.lidT, rightLidTop: o.lidT } : {}),
  ...(o.lidB !== undefined ? { leftLidBottom: o.lidB, rightLidBottom: o.lidB } : {}),
  ...(o.ang !== undefined ? { leftAngle: o.ang, rightAngle: -o.ang } : {}),
  ...(o.sc !== undefined ? { leftScale: o.sc, rightScale: o.sc } : {}),
});

const dist = (v: number): P => ({ pupilDistance: v * D });

/* ------------------------------------------------------------------
 * 4. THE AUTHORED LIBRARY — 130+ choreographed routines
 * ------------------------------------------------------------------ */

export const BEHAVIORS: BehaviorDef[] = [
  /* ============ BLINKS & MICRO-MOVEMENTS (16) ============ */
  { id: 'blink_soft', name: 'Soft Blink', cat: 'blink', w: 6, frames: [
    { d: 0.07, p: both({ lidT: 1 }), e: 'inQuad' },
    { d: 0.09, p: both({ lidT: 0 }), e: 'outCubic' },
  ]},
  { id: 'blink_double', name: 'Double Blink', cat: 'blink', w: 5, frames: [
    { d: 0.06, p: both({ lidT: 1 }), e: 'inQuad' },
    { d: 0.07, p: both({ lidT: 0 }), e: 'outQuad' },
    { d: 0.05, p: both({ lidT: 1 }), e: 'inQuad' },
    { d: 0.1, p: both({ lidT: 0 }), e: 'outBack' },
  ]},
  { id: 'blink_triple', name: 'Triple Flutter', cat: 'blink', w: 3, frames: [
    { d: 0.05, p: both({ lidT: 0.95 }), e: 'inQuad' },
    { d: 0.05, p: both({ lidT: 0.1 }), e: 'outQuad' },
    { d: 0.05, p: both({ lidT: 0.95 }), e: 'inQuad' },
    { d: 0.05, p: both({ lidT: 0.1 }), e: 'outQuad' },
    { d: 0.05, p: both({ lidT: 0.9 }), e: 'inQuad' },
    { d: 0.12, p: both({ lidT: 0 }), e: 'outElastic' },
  ]},
  { id: 'blink_slow', name: 'Slow Deliberate Blink', cat: 'blink', w: 4, frames: [
    { d: 0.28, p: both({ lidT: 1 }), e: 'inOutCubic' },
    { d: 0.16, p: both({ lidT: 1 }), e: 'hold' },
    { d: 0.34, p: both({ lidT: 0 }), e: 'inOutCubic' },
  ]},
  { id: 'blink_half', name: 'Half-Lidded Pause', cat: 'blink', w: 4, frames: [
    { d: 0.2, p: both({ lidT: 0.45, h: 36 }), e: 'outQuad' },
    { d: 0.7, p: both({ lidT: 0.45 }), e: 'hold' },
    { d: 0.25, p: both({ lidT: 0 }), e: 'outCubic' },
  ]},
  { id: 'blink_squeeze', name: 'Hard Squeeze', cat: 'blink', w: 3, frames: [
    { d: 0.09, p: { ...both({ lidT: 0.62, lidB: 0.38 }), browAngle: 14 }, e: 'inBack' },
    { d: 0.22, p: both({ lidT: 0.62, lidB: 0.38 }), e: 'hold' },
    { d: 0.2, p: both({ lidT: 0, lidB: 0 }), e: 'outElastic' },
  ]},
  { id: 'blink_asym', name: 'Asymmetric Blink', cat: 'blink', w: 3, frames: [
    { d: 0.07, p: { leftLidTop: 1, rightLidTop: 0.35 }, e: 'inQuad' },
    { d: 0.13, p: { leftLidTop: 0, rightLidTop: 0 }, e: 'outBack' },
  ]},
  { id: 'micro_saccade', name: 'Micro-Saccade Burst', cat: 'blink', w: 6, frames: [
    { d: 0.1, p: { trackingSaccade: 7, trackingDamping: 0.2 }, e: 'snap' },
    { d: 0.45, p: { trackingSaccade: 9 }, e: 'stagger' },
    { d: 0.3, p: { trackingSaccade: 0 }, e: 'outQuad' },
  ]},
  { id: 'micro_tremor', name: 'Optical Tremor', cat: 'blink', w: 3, frames: [
    { d: 0.15, p: { tremor: 2.2 }, e: 'outQuad' },
    { d: 0.7, p: { tremor: 2.6 }, e: 'linear' },
    { d: 0.35, p: { tremor: 0 }, e: 'outCubic' },
  ]},
  { id: 'pupil_dilate', name: 'Pupil Dilation', cat: 'blink', w: 4, frames: [
    { d: 0.3, p: both({ w: 23, h: 46, sc: 1.12 }), e: 'outBack' },
    { d: 0.5, p: both({ w: 23, h: 46, sc: 1.12 }), e: 'hold' },
    { d: 0.45, p: both({}), e: 'inOutQuad' },
  ]},
  { id: 'pupil_constrict', name: 'Pupil Constriction', cat: 'blink', w: 3, frames: [
    { d: 0.12, p: both({ w: 11, h: 33, sc: 0.9 }), e: 'outExpo' },
    { d: 0.4, p: both({ w: 11, h: 33, sc: 0.9 }), e: 'hold' },
    { d: 0.4, p: both({}), e: 'outElastic' },
  ]},
  { id: 'lash_flutter', name: 'Lash Flutter', cat: 'blink', w: 3, frames: [
    { d: 0.06, p: both({ lidT: 0.5 }), e: 'inQuad' },
    { d: 0.06, p: both({ lidT: 0.12 }), e: 'outQuad' },
    { d: 0.06, p: both({ lidT: 0.46 }), e: 'inQuad' },
    { d: 0.06, p: both({ lidT: 0.1 }), e: 'outQuad' },
    { d: 0.06, p: both({ lidT: 0.4 }), e: 'inQuad' },
    { d: 0.14, p: both({ lidT: 0 }), e: 'outBack' },
  ]},
  { id: 'refocus', name: 'Refocus Snap', cat: 'blink', w: 4, frames: [
    { d: 0.08, p: both({ w: 20, h: 33 }), e: 'inQuad' },
    { d: 0.14, p: both({ w: 14, h: 44 }), e: 'outBack' },
    { d: 0.3, p: both({}), e: 'outQuad' },
  ]},
  { id: 'squint_read', name: 'Reading Squint', cat: 'blink', w: 3, frames: [
    { d: 0.25, p: { ...both({ lidT: 0.4, lidB: 0.22, w: 19 }), browAngle: 8 }, e: 'outQuad' },
    { d: 0.9, p: { ...both({ lidT: 0.4, lidB: 0.22 }), trackingSaccade: 3 }, e: 'linear' },
    { d: 0.3, p: both({}), e: 'outCubic' },
  ]},
  { id: 'brow_raise', name: 'Curious Brow Raise', cat: 'blink', w: 4, frames: [
    { d: 0.18, p: { ...both({ h: 48 }), eyeYOffset: -11, browAngle: -12 }, e: 'outBack' },
    { d: 0.55, p: { ...both({ h: 48 }), eyeYOffset: -11 }, e: 'hold' },
    { d: 0.35, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'nictitate', name: 'Nictitating Sweep', cat: 'blink', w: 2, frames: [
    { d: 0.13, p: both({ lidB: 0.95 }), e: 'inOutQuad' },
    { d: 0.15, p: both({ lidB: 0 }), e: 'outCubic' },
  ]},

  /* ============ ATTENTION & TRACKING (18) ============ */
  { id: 'lock_on', name: 'Target Lock-On', cat: 'attention', w: 5, frames: [
    { d: 0.12, p: { ...both({ w: 12, h: 50 }), glintStyle: 'target', trackingDamping: 0.24 }, e: 'outExpo' },
    { d: 1.1, p: { ...both({ w: 12, h: 50 }), glintStyle: 'target', trackingDamping: 0.26 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'radar_sweep', name: 'Radar Area Sweep', cat: 'attention', w: 4, frames: [
    { d: 0.25, p: { glintStyle: 'crosshair', trackingWeight: 0, gazeBiasX: -46, ...both({ w: 13 }) }, e: 'inOutCubic' },
    { d: 0.5, p: { glintStyle: 'crosshair', trackingWeight: 0, gazeBiasX: 46 }, e: 'inOutQuad' },
    { d: 0.45, p: { glintStyle: 'crosshair', trackingWeight: 0, gazeBiasX: -40 }, e: 'inOutQuad' },
    { d: 0.35, p: { trackingWeight: 1 }, e: 'outCubic' },
  ]},
  { id: 'scan_grid', name: 'Grid Scan Protocol', cat: 'attention', w: 3, frames: [
    { d: 0.14, p: { trackingWeight: 0, gazeBiasX: -38, gazeBiasY: -22, glintStyle: 'crosshair' }, e: 'snap' },
    { d: 0.14, p: { trackingWeight: 0, gazeBiasX: 38, gazeBiasY: -22 }, e: 'snap' },
    { d: 0.14, p: { trackingWeight: 0, gazeBiasX: -38, gazeBiasY: 20 }, e: 'snap' },
    { d: 0.14, p: { trackingWeight: 0, gazeBiasX: 38, gazeBiasY: 20 }, e: 'snap' },
    { d: 0.3, p: { trackingWeight: 1 }, e: 'outCubic' },
  ]},
  { id: 'double_take', name: 'Double Take', cat: 'attention', w: 4, frames: [
    { d: 0.12, p: { trackingWeight: 0.2, gazeBiasX: 34 }, e: 'outQuad' },
    { d: 0.1, p: { trackingWeight: 0.2, gazeBiasX: -8 }, e: 'inQuad' },
    { d: 0.11, p: { ...both({ h: 52, w: 21 }), trackingWeight: 1, glintStyle: 'star' }, e: 'outBack' },
    { d: 0.5, p: { ...both({ h: 50 }), glintStyle: 'star' }, e: 'hold' },
    { d: 0.35, p: {}, e: 'outQuad' },
  ]},
  { id: 'side_glance_l', name: 'Sly Left Glance', cat: 'attention', w: 4, frames: [
    { d: 0.2, p: { trackingWeight: 0.15, gazeBiasX: -44, leftLidTop: 0.3, rightLidTop: 0.3, browAngle: 6 }, e: 'outCubic' },
    { d: 0.75, p: { trackingWeight: 0.15, gazeBiasX: -46 }, e: 'hold' },
    { d: 0.3, p: { trackingWeight: 1 }, e: 'inOutQuad' },
  ]},
  { id: 'side_glance_r', name: 'Sly Right Glance', cat: 'attention', w: 4, frames: [
    { d: 0.2, p: { trackingWeight: 0.15, gazeBiasX: 44, leftLidTop: 0.3, rightLidTop: 0.3, browAngle: 6 }, e: 'outCubic' },
    { d: 0.75, p: { trackingWeight: 0.15, gazeBiasX: 46 }, e: 'hold' },
    { d: 0.3, p: { trackingWeight: 1 }, e: 'inOutQuad' },
  ]},
  { id: 'look_away_shy', name: 'Bashful Look Away', cat: 'attention', w: 3, frames: [
    { d: 0.3, p: { trackingWeight: 0, gazeBiasX: 40, gazeBiasY: 18, ...both({ lidT: 0.34, h: 36 }) }, e: 'outCubic' },
    { d: 0.85, p: { trackingWeight: 0, gazeBiasX: 42, gazeBiasY: 20 }, e: 'hold' },
    { d: 0.4, p: { trackingWeight: 1, glintStyle: 'cute_anime' }, e: 'outQuad' },
  ]},
  { id: 'follow_lag', name: 'Heavy Pursuit Lag', cat: 'attention', w: 4, frames: [
    { d: 0.3, p: { trackingDamping: 0.05, ...both({ h: 43 }) }, e: 'outQuad' },
    { d: 1.3, p: { trackingDamping: 0.045 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outCubic' },
  ]},
  { id: 'hyper_track', name: 'Hyper-Responsive Track', cat: 'attention', w: 4, frames: [
    { d: 0.15, p: { trackingDamping: 0.3, ...both({ w: 13, h: 46 }), glintStyle: 'double' }, e: 'outExpo' },
    { d: 1.2, p: { trackingDamping: 0.32, trackingSaccade: 2 }, e: 'linear' },
    { d: 0.35, p: {}, e: 'outQuad' },
  ]},
  { id: 'peripheral', name: 'Peripheral Alert', cat: 'attention', w: 3, frames: [
    { d: 0.09, p: { ...both({ h: 54, w: 14 }), trackingSaccade: 6 }, e: 'outExpo' },
    { d: 0.6, p: { ...both({ h: 50 }), trackingSaccade: 4 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'depth_focus', name: 'Depth Rack Focus', cat: 'attention', w: 3, frames: [
    { d: 0.35, p: { ...both({ w: 25, h: 30 }), ...dist(28), glintStyle: 'double' }, e: 'inOutCubic' },
    { d: 0.3, p: { ...both({ w: 25, h: 30 }) }, e: 'hold' },
    { d: 0.45, p: { ...both({ w: 13, h: 48 }), ...dist(42) }, e: 'inOutCubic' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'tilt_study', name: 'Head-Tilt Study', cat: 'attention', w: 4, frames: [
    { d: 0.28, p: { leftAngle: -14, rightAngle: -14, leftScale: 1.16, rightScale: 0.92, glintStyle: 'cute_anime' }, e: 'outBack' },
    { d: 0.8, p: { leftAngle: -13, rightAngle: -13, leftScale: 1.16, rightScale: 0.92 }, e: 'hold' },
    { d: 0.4, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'up_ponder', name: 'Upward Pondering', cat: 'attention', w: 4, frames: [
    { d: 0.35, p: { trackingWeight: 0.1, gazeBiasY: -30, gazeBiasX: 22, ...both({ lidB: 0.24 }) }, e: 'inOutCubic' },
    { d: 0.9, p: { trackingWeight: 0.1, gazeBiasY: -32, gazeBiasX: 26, trackingSaccade: 2 }, e: 'linear' },
    { d: 0.4, p: { trackingWeight: 1 }, e: 'outCubic' },
  ]},
  { id: 'down_shy', name: 'Downcast Gaze', cat: 'attention', w: 3, frames: [
    { d: 0.4, p: { trackingWeight: 0.15, gazeBiasY: 26, ...both({ lidT: 0.4, h: 34 }) }, e: 'outCubic' },
    { d: 0.9, p: { trackingWeight: 0.15, gazeBiasY: 28 }, e: 'hold' },
    { d: 0.45, p: { trackingWeight: 1 }, e: 'outQuad' },
  ]},
  { id: 'corner_check', name: 'Corner Check', cat: 'attention', w: 3, frames: [
    { d: 0.13, p: { trackingWeight: 0, gazeBiasX: -42, gazeBiasY: -24 }, e: 'outExpo' },
    { d: 0.28, p: { trackingWeight: 0, gazeBiasX: -42, gazeBiasY: -24 }, e: 'hold' },
    { d: 0.13, p: { trackingWeight: 0, gazeBiasX: 42, gazeBiasY: -24 }, e: 'outExpo' },
    { d: 0.28, p: { trackingWeight: 0, gazeBiasX: 42, gazeBiasY: -24 }, e: 'hold' },
    { d: 0.3, p: { trackingWeight: 1 }, e: 'outCubic' },
  ]},
  { id: 'lazy_drift', name: 'Lazy Attention Drift', cat: 'attention', w: 4, frames: [
    { d: 0.9, p: { trackingWeight: 0.35, gazeBiasX: -18, ...both({ lidT: 0.3 }) }, e: 'inOutQuad' },
    { d: 0.9, p: { trackingWeight: 0.35, gazeBiasX: 20 }, e: 'inOutQuad' },
    { d: 0.5, p: { trackingWeight: 1 }, e: 'outCubic' },
  ]},
  { id: 'startle_snap', name: 'Startle Snap', cat: 'attention', w: 3, frames: [
    { d: 0.05, p: { ...both({ h: 58, w: 23, sc: 1.2 }), glintStyle: 'star', eyeYOffset: -10 }, e: 'outExpo' },
    { d: 0.2, p: { ...both({ h: 54, w: 22 }), trackingSaccade: 8 }, e: 'linear' },
    { d: 0.45, p: {}, e: 'outElastic' },
  ]},
  { id: 'slow_pan', name: 'Cinematic Slow Pan', cat: 'attention', w: 3, frames: [
    { d: 1.0, p: { trackingWeight: 0, gazeBiasX: -44, ...both({ w: 14 }) }, e: 'inOutExpo' },
    { d: 1.2, p: { trackingWeight: 0, gazeBiasX: 44 }, e: 'inOutExpo' },
    { d: 0.5, p: { trackingWeight: 1 }, e: 'inOutCubic' },
  ]},

  /* ============ EMOTIONS (22) ============ */
  { id: 'joy_sparkle', name: 'Radiant Joy', cat: 'emotion', w: 5, frames: [
    { d: 0.16, p: { ...both({ w: 23, h: 48, sc: 1.14 }), glintStyle: 'burst', glintIntensity: 1.5 }, e: 'outBack' },
    { d: 0.7, p: { ...both({ w: 23, h: 48, sc: 1.12 }), glintStyle: 'burst', breath: 1.4 }, e: 'linear' },
    { d: 0.4, p: { glintStyle: 'cute_anime' }, e: 'outQuad' },
  ]},
  { id: 'love_struck', name: 'Love Struck', cat: 'emotion', w: 4, frames: [
    { d: 0.18, p: { ...both({ w: 24, h: 50, sc: 1.18 }), glintStyle: 'heart', glintIntensity: 1.6 }, e: 'outBack' },
    { d: 0.3, p: { ...both({ sc: 1.24 }), glintStyle: 'heart' }, e: 'inOutQuad' },
    { d: 0.3, p: { ...both({ sc: 1.1 }), glintStyle: 'heart' }, e: 'inOutQuad' },
    { d: 0.3, p: { ...both({ sc: 1.22 }), glintStyle: 'heart' }, e: 'inOutQuad' },
    { d: 0.45, p: {}, e: 'outCubic' },
  ]},
  { id: 'happy_arc', name: 'Happy Eye Arcs', cat: 'emotion', w: 5, frames: [
    { d: 0.2, p: { ...both({ lidB: 0.5, h: 42 }), glintStyle: 'cute_anime' }, e: 'outBack' },
    { d: 0.8, p: { ...both({ lidB: 0.52 }), glintStyle: 'cute_anime' }, e: 'hold' },
    { d: 0.35, p: {}, e: 'outQuad' },
  ]},
  { id: 'surprise_flare', name: 'Surprised Flare', cat: 'emotion', w: 5, frames: [
    { d: 0.06, p: { ...both({ w: 25, h: 58, sc: 1.22 }), glintStyle: 'star', eyeYOffset: -12 }, e: 'outExpo' },
    { d: 0.45, p: { ...both({ w: 24, h: 56, sc: 1.18 }), glintStyle: 'star' }, e: 'hold' },
    { d: 0.5, p: {}, e: 'outElastic' },
  ]},
  { id: 'shock_freeze', name: 'Shocked Freeze', cat: 'emotion', w: 3, frames: [
    { d: 0.04, p: { ...both({ w: 27, h: 60, sc: 1.26 }), glintStyle: 'ring', trackingWeight: 0.2 }, e: 'outExpo' },
    { d: 0.75, p: { ...both({ w: 26, h: 58 }), glintStyle: 'ring', tremor: 1.6 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'outCubic' },
  ]},
  { id: 'sad_droop', name: 'Melancholy Droop', cat: 'emotion', w: 4, frames: [
    { d: 0.5, p: { ...both({ lidT: 0.42, h: 36 }), leftAngle: -9, rightAngle: 9, gazeBiasY: 18, trackingWeight: 0.4, eyeYOffset: 0 }, e: 'inOutCubic' },
    { d: 1.1, p: { ...both({ lidT: 0.44 }), gazeBiasY: 20, trackingWeight: 0.4 }, e: 'hold' },
    { d: 0.6, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'angry_furrow', name: 'Angry Furrow', cat: 'emotion', w: 4, frames: [
    { d: 0.14, p: { ...both({ lidT: 0.5, h: 40, w: 19 }), leftAngle: 20, rightAngle: -20, browAngle: 22, glintStyle: 'void' }, e: 'outBack' },
    { d: 0.85, p: { ...both({ lidT: 0.52 }), leftAngle: 21, rightAngle: -21, tremor: 1.1 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'rage_burn', name: 'Rage Burn', cat: 'emotion', w: 2, frames: [
    { d: 0.1, p: { ...both({ lidT: 0.58, w: 21 }), leftAngle: 26, rightAngle: -26, browAngle: 28, glintStyle: 'target' }, e: 'inBack' },
    { d: 0.2, p: { ...both({ sc: 1.1 }), tremor: 3 }, e: 'flicker' },
    { d: 0.6, p: { ...both({ lidT: 0.55, sc: 1.04 }), leftAngle: 24, rightAngle: -24, tremor: 2.4, glintStyle: 'target' }, e: 'linear' },
    { d: 0.5, p: {}, e: 'outCubic' },
  ]},
  { id: 'fear_shrink', name: 'Fearful Shrink', cat: 'emotion', w: 3, frames: [
    { d: 0.12, p: { ...both({ w: 10, h: 30, sc: 0.82 }), ...dist(46), tremor: 2.6 }, e: 'outExpo' },
    { d: 0.7, p: { ...both({ w: 10, h: 30, sc: 0.8 }), tremor: 3 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'outElastic' },
  ]},
  { id: 'proud_smug', name: 'Smug Confidence', cat: 'emotion', w: 4, frames: [
    { d: 0.25, p: { ...both({ lidT: 0.42, lidB: 0.12 }), leftAngle: 8, rightAngle: -8, gazeBiasY: -12, trackingWeight: 0.5, glintStyle: 'diamond' }, e: 'outBack' },
    { d: 0.9, p: { ...both({ lidT: 0.44 }), glintStyle: 'diamond' }, e: 'hold' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'confused_tilt', name: 'Confused Tilt', cat: 'emotion', w: 4, frames: [
    { d: 0.22, p: { leftScale: 1.22, rightScale: 0.86, leftAngle: -10, rightAngle: 12, leftOffsetY: -5, rightOffsetY: 4 }, e: 'outBack' },
    { d: 0.6, p: { leftScale: 1.2, rightScale: 0.88, trackingSaccade: 3 }, e: 'linear' },
    { d: 0.45, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'skeptical', name: 'Skeptical Squint', cat: 'emotion', w: 4, frames: [
    { d: 0.25, p: { leftLidTop: 0.62, rightLidTop: 0.14, leftAngle: 12, rightAngle: -3, browAngle: 14 }, e: 'outCubic' },
    { d: 1.0, p: { leftLidTop: 0.64, rightLidTop: 0.12 }, e: 'hold' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'relief_sigh', name: 'Relieved Sigh', cat: 'emotion', w: 3, frames: [
    { d: 0.3, p: both({ lidT: 0.8, h: 34 }), e: 'inOutCubic' },
    { d: 0.4, p: both({ lidT: 0.82 }), e: 'hold' },
    { d: 0.5, p: { ...both({ lidB: 0.32 }), glintStyle: 'cute_anime', breath: 1.5 }, e: 'outCubic' },
    { d: 0.4, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'adoring', name: 'Adoring Gaze', cat: 'emotion', w: 3, frames: [
    { d: 0.35, p: { ...both({ w: 22, h: 47, lidB: 0.22 }), glintStyle: 'heart', glintIntensity: 1.3, breath: 1.6 }, e: 'outCubic' },
    { d: 1.2, p: { ...both({ lidB: 0.24 }), glintStyle: 'heart', breath: 1.8 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'determined', name: 'Determined Resolve', cat: 'emotion', w: 3, frames: [
    { d: 0.16, p: { ...both({ w: 14, h: 46, lidT: 0.24 }), browAngle: 12, glintStyle: 'target', trackingDamping: 0.2 }, e: 'outExpo' },
    { d: 1.0, p: { ...both({ lidT: 0.26 }), glintStyle: 'target' }, e: 'hold' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'bored_flat', name: 'Bored Flatline', cat: 'emotion', w: 4, frames: [
    { d: 0.4, p: { ...both({ lidT: 0.55, lidB: 0.18, h: 38 }), trackingWeight: 0.3, glintIntensity: 0.4 }, e: 'inOutQuad' },
    { d: 1.4, p: { ...both({ lidT: 0.57 }), trackingWeight: 0.25, gazeBiasX: -14 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'outQuad' },
  ]},
  { id: 'excited_bounce', name: 'Excited Bounce', cat: 'emotion', w: 4, frames: [
    { d: 0.1, p: { ...both({ sc: 1.2, h: 50 }), glintStyle: 'burst', eyeYOffset: -12 }, e: 'outBack' },
    { d: 0.1, p: { ...both({ sc: 0.96 }), eyeYOffset: -2 }, e: 'inQuad' },
    { d: 0.1, p: { ...both({ sc: 1.16 }), eyeYOffset: -11 }, e: 'outBack' },
    { d: 0.1, p: { ...both({ sc: 0.98 }), eyeYOffset: -3 }, e: 'inQuad' },
    { d: 0.3, p: { glintStyle: 'cute_anime' }, e: 'outElastic' },
  ]},
  { id: 'grateful', name: 'Grateful Warmth', cat: 'emotion', w: 3, frames: [
    { d: 0.4, p: { ...both({ lidB: 0.45, h: 44 }), glintStyle: 'star', glintIntensity: 1.2 }, e: 'outCubic' },
    { d: 0.9, p: { ...both({ lidB: 0.47 }), glintStyle: 'star' }, e: 'hold' },
    { d: 0.45, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'mischief', name: 'Mischievous Plot', cat: 'emotion', w: 4, frames: [
    { d: 0.2, p: { ...both({ lidT: 0.48 }), leftAngle: 14, rightAngle: -14, gazeBiasX: -30, trackingWeight: 0.3, glintStyle: 'diamond' }, e: 'outCubic' },
    { d: 0.4, p: { ...both({ lidT: 0.5 }), gazeBiasX: 30, trackingWeight: 0.3 }, e: 'inOutCubic' },
    { d: 0.35, p: { ...both({ lidT: 0.2 }), glintStyle: 'burst' }, e: 'outBack' },
    { d: 0.35, p: {}, e: 'outQuad' },
  ]},
  { id: 'guilty', name: 'Guilty Avoidance', cat: 'emotion', w: 3, frames: [
    { d: 0.25, p: { trackingWeight: 0, gazeBiasX: -36, gazeBiasY: 16, ...both({ lidT: 0.42 }) }, e: 'outCubic' },
    { d: 0.3, p: { trackingWeight: 0, gazeBiasX: 36, gazeBiasY: 18 }, e: 'inOutQuad' },
    { d: 0.35, p: { trackingWeight: 0, gazeBiasY: 24, ...both({ lidT: 0.55 }) }, e: 'outQuad' },
    { d: 0.4, p: { trackingWeight: 1 }, e: 'outCubic' },
  ]},
  { id: 'awe_wide', name: 'Wonder & Awe', cat: 'emotion', w: 4, frames: [
    { d: 0.45, p: { ...both({ w: 24, h: 54, sc: 1.14 }), glintStyle: 'star', glintIntensity: 1.4, breath: 1.5 }, e: 'outCubic' },
    { d: 1.1, p: { ...both({ w: 24, h: 54 }), glintStyle: 'star', breath: 1.8 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'inOutCubic' },
  ]},
  { id: 'nostalgic', name: 'Nostalgic Haze', cat: 'emotion', w: 2, frames: [
    { d: 0.6, p: { ...both({ lidT: 0.38, h: 40 }), trackingWeight: 0.1, gazeBiasY: -18, gazeBiasX: -20, glintIntensity: 0.7 }, e: 'inOutCubic' },
    { d: 1.4, p: { ...both({ lidT: 0.4 }), trackingWeight: 0.1, gazeBiasY: -20 }, e: 'linear' },
    { d: 0.6, p: {}, e: 'inOutQuad' },
  ]},

  /* ============ IDLE / SLEEPY (14) ============ */
  { id: 'yawn_big', name: 'Big Yawn', cat: 'idle', w: 4, frames: [
    { d: 0.35, p: { ...both({ lidT: 0.75, lidB: 0.3 }), eyeYOffset: 2 }, e: 'inOutCubic' },
    { d: 0.4, p: { ...both({ lidT: 0.92, lidB: 0.4 }), eyeYOffset: 4 }, e: 'inOutQuad' },
    { d: 0.35, p: { ...both({ lidT: 0.2, h: 50 }), glintStyle: 'sleepy_z' }, e: 'outBack' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'doze_off', name: 'Dozing Off', cat: 'idle', w: 4, frames: [
    { d: 0.7, p: both({ lidT: 0.6, h: 36 }), e: 'inOutQuad' },
    { d: 0.3, p: both({ lidT: 0.3 }), e: 'outQuad' },
    { d: 0.8, p: both({ lidT: 0.78 }), e: 'inOutQuad' },
    { d: 0.35, p: both({ lidT: 0.35 }), e: 'outQuad' },
    { d: 0.9, p: { ...both({ lidT: 0.9 }), glintStyle: 'sleepy_z', glintIntensity: 0.5 }, e: 'inOutCubic' },
    { d: 0.6, p: {}, e: 'outCubic' },
  ]},
  { id: 'deep_sleep', name: 'Deep Sleep Cycle', cat: 'idle', w: 2, frames: [
    { d: 0.8, p: { ...both({ lidT: 0.94 }), glintStyle: 'sleepy_z', trackingWeight: 0 }, e: 'inOutCubic' },
    { d: 1.4, p: { ...both({ lidT: 0.95 }), glintStyle: 'sleepy_z', trackingWeight: 0, breath: 2.2 }, e: 'linear' },
    { d: 0.7, p: { ...both({ lidT: 0.5 }), trackingWeight: 0.4 }, e: 'outCubic' },
    { d: 0.5, p: {}, e: 'outQuad' },
  ]},
  { id: 'rem_flicker', name: 'REM Flicker', cat: 'idle', w: 2, frames: [
    { d: 0.4, p: { ...both({ lidT: 0.88 }), trackingWeight: 0 }, e: 'inOutQuad' },
    { d: 0.8, p: { ...both({ lidT: 0.9 }), trackingWeight: 0, trackingSaccade: 9, tremor: 2 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'outCubic' },
  ]},
  { id: 'idle_breathe', name: 'Calm Breathing', cat: 'idle', w: 5, frames: [
    { d: 1.1, p: { ...both({ h: 44, sc: 1.05 }), breath: 1.8, glintIntensity: 0.9 }, e: 'inOutQuad' },
    { d: 1.2, p: { ...both({ h: 38, sc: 0.97 }), breath: 1.2 }, e: 'inOutQuad' },
    { d: 0.6, p: {}, e: 'inOutCubic' },
  ]},
  { id: 'idle_wander', name: 'Wandering Thoughts', cat: 'idle', w: 4, frames: [
    { d: 0.8, p: { trackingWeight: 0.2, gazeBiasX: -26, gazeBiasY: -14 }, e: 'inOutCubic' },
    { d: 0.9, p: { trackingWeight: 0.2, gazeBiasX: 24, gazeBiasY: -8 }, e: 'inOutCubic' },
    { d: 0.8, p: { trackingWeight: 0.2, gazeBiasX: 8, gazeBiasY: 18 }, e: 'inOutCubic' },
    { d: 0.5, p: { trackingWeight: 1 }, e: 'outCubic' },
  ]},
  { id: 'stretch_eyes', name: 'Ocular Stretch', cat: 'idle', w: 3, frames: [
    { d: 0.3, p: both({ w: 26, h: 56, sc: 1.15 }), e: 'outBack' },
    { d: 0.25, p: both({ w: 26, h: 56 }), e: 'hold' },
    { d: 0.3, p: both({ w: 11, h: 30, sc: 0.9 }), e: 'inOutQuad' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'daydream', name: 'Daydream Drift', cat: 'idle', w: 4, frames: [
    { d: 0.7, p: { ...both({ lidT: 0.35, h: 42 }), trackingWeight: 0.08, gazeBiasY: -22, glintIntensity: 0.65 }, e: 'inOutCubic' },
    { d: 1.6, p: { trackingWeight: 0.08, gazeBiasY: -24, gazeBiasX: 14, ...both({ lidT: 0.36 }) }, e: 'linear' },
    { d: 0.6, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'settle_down', name: 'Settling In', cat: 'idle', w: 3, frames: [
    { d: 0.25, p: both({ lidT: 0.3, h: 40 }), e: 'outQuad' },
    { d: 0.2, p: both({ lidT: 0.05 }), e: 'outBack' },
    { d: 0.3, p: both({ lidT: 0.22 }), e: 'inOutQuad' },
    { d: 0.5, p: {}, e: 'outCubic' },
  ]},
  { id: 'meditate', name: 'Meditative Stillness', cat: 'idle', w: 3, frames: [
    { d: 0.9, p: { ...both({ lidT: 0.68, h: 40 }), trackingWeight: 0.05, glintIntensity: 0.6, breath: 2 }, e: 'inOutCubic' },
    { d: 2.0, p: { ...both({ lidT: 0.7 }), trackingWeight: 0.05, breath: 2.4 }, e: 'linear' },
    { d: 0.8, p: {}, e: 'inOutCubic' },
  ]},
  { id: 'nod_off_jerk', name: 'Nod-Off Jerk', cat: 'idle', w: 3, frames: [
    { d: 0.9, p: { ...both({ lidT: 0.85 }), eyeYOffset: 6, trackingWeight: 0.1 }, e: 'inOutCubic' },
    { d: 0.06, p: { ...both({ lidT: 0, h: 54, w: 22 }), eyeYOffset: -12, glintStyle: 'star' }, e: 'outExpo' },
    { d: 0.5, p: { ...both({ h: 48 }), trackingSaccade: 5 }, e: 'outQuad' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'slow_scan_idle', name: 'Idle Room Scan', cat: 'idle', w: 4, frames: [
    { d: 1.2, p: { trackingWeight: 0, gazeBiasX: -36, ...both({ lidT: 0.2 }) }, e: 'inOutExpo' },
    { d: 0.5, p: { trackingWeight: 0, gazeBiasX: -36 }, e: 'hold' },
    { d: 1.3, p: { trackingWeight: 0, gazeBiasX: 36 }, e: 'inOutExpo' },
    { d: 0.5, p: { trackingWeight: 1 }, e: 'outCubic' },
  ]},
  { id: 'content_rest', name: 'Content Resting', cat: 'idle', w: 4, frames: [
    { d: 0.5, p: { ...both({ lidB: 0.4, lidT: 0.14, h: 42 }), glintStyle: 'cute_anime', breath: 1.6 }, e: 'outCubic' },
    { d: 1.5, p: { ...both({ lidB: 0.42 }), glintStyle: 'cute_anime', breath: 1.9 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'power_save', name: 'Power Save Mode', cat: 'idle', w: 2, frames: [
    { d: 0.5, p: { ...both({ h: 8, lidT: 0.1 }), glintStyle: 'scan_bar', glintIntensity: 0.7, trackingWeight: 0.2 }, e: 'inOutExpo' },
    { d: 1.3, p: { ...both({ h: 7 }), glintStyle: 'scan_bar', trackingWeight: 0.2 }, e: 'linear' },
    { d: 0.45, p: {}, e: 'outBack' },
  ]},

  /* ============ PLAYFUL / CUTE (18) ============ */
  { id: 'wink_left', name: 'Left Wink', cat: 'playful', w: 5, frames: [
    { d: 0.1, p: { leftLidTop: 1, rightScale: 1.18, rightHeight: 46 * H, glintStyle: 'cute_anime' }, e: 'outBack' },
    { d: 0.35, p: { leftLidTop: 1, rightScale: 1.16, glintStyle: 'cute_anime' }, e: 'hold' },
    { d: 0.25, p: {}, e: 'outElastic' },
  ]},
  { id: 'wink_right', name: 'Right Wink', cat: 'playful', w: 5, frames: [
    { d: 0.1, p: { rightLidTop: 1, leftScale: 1.18, leftHeight: 46 * H, glintStyle: 'cute_anime' }, e: 'outBack' },
    { d: 0.35, p: { rightLidTop: 1, leftScale: 1.16, glintStyle: 'cute_anime' }, e: 'hold' },
    { d: 0.25, p: {}, e: 'outElastic' },
  ]},
  { id: 'wink_combo', name: 'Alternating Wink Combo', cat: 'playful', w: 3, frames: [
    { d: 0.1, p: { leftLidTop: 1, glintStyle: 'cute_anime' }, e: 'outQuad' },
    { d: 0.12, p: { leftLidTop: 0, rightLidTop: 1 }, e: 'inOutQuad' },
    { d: 0.12, p: { rightLidTop: 0, leftLidTop: 1 }, e: 'inOutQuad' },
    { d: 0.12, p: { leftLidTop: 0, rightLidTop: 1 }, e: 'inOutQuad' },
    { d: 0.3, p: { glintStyle: 'burst' }, e: 'outElastic' },
  ]},
  { id: 'cross_eye', name: 'Cross-Eyed Derp', cat: 'playful', w: 4, frames: [
    { d: 0.18, p: { ...dist(20), leftOffsetX: 8, rightOffsetX: -8, ...both({ sc: 1.1 }), trackingWeight: 0.2 }, e: 'outBack' },
    { d: 0.6, p: { ...dist(19), leftOffsetX: 9, rightOffsetX: -9, trackingWeight: 0.2 }, e: 'hold' },
    { d: 0.35, p: {}, e: 'outElastic' },
  ]},
  { id: 'derp_lazy', name: 'Lazy Derp Eye', cat: 'playful', w: 3, frames: [
    { d: 0.22, p: { leftOffsetY: 8, leftOffsetX: -6, leftScale: 1.16, rightScale: 0.94, leftLidTop: 0.16 }, e: 'outBack' },
    { d: 0.85, p: { leftOffsetY: 9, leftOffsetX: -6, leftScale: 1.15, rightScale: 0.94 }, e: 'hold' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'peek_a_boo', name: 'Peek-A-Boo', cat: 'playful', w: 4, frames: [
    { d: 0.16, p: both({ lidT: 1 }), e: 'inQuad' },
    { d: 0.45, p: both({ lidT: 1 }), e: 'hold' },
    { d: 0.1, p: { ...both({ lidT: 0, h: 54, w: 23, sc: 1.16 }), glintStyle: 'burst' }, e: 'outExpo' },
    { d: 0.5, p: { glintStyle: 'cute_anime' }, e: 'outElastic' },
  ]},
  { id: 'shifty_eyes', name: 'Shifty Eyes', cat: 'playful', w: 4, frames: [
    { d: 0.14, p: { trackingWeight: 0, gazeBiasX: -34, ...both({ lidT: 0.3 }) }, e: 'outExpo' },
    { d: 0.18, p: { trackingWeight: 0, gazeBiasX: 34 }, e: 'outExpo' },
    { d: 0.16, p: { trackingWeight: 0, gazeBiasX: -30 }, e: 'outExpo' },
    { d: 0.18, p: { trackingWeight: 0, gazeBiasX: 30 }, e: 'outExpo' },
    { d: 0.3, p: { trackingWeight: 1 }, e: 'outCubic' },
  ]},
  { id: 'boop_react', name: 'Boop Reaction', cat: 'playful', w: 3, frames: [
    { d: 0.05, p: { ...both({ lidT: 0.7, sc: 0.86 }), ...dist(28) }, e: 'inQuad' },
    { d: 0.16, p: { ...both({ lidT: 0, h: 52, sc: 1.2 }), glintStyle: 'burst' }, e: 'outBack' },
    { d: 0.4, p: { glintStyle: 'cute_anime' }, e: 'outElastic' },
  ]},
  { id: 'giggle_shake', name: 'Giggling Shake', cat: 'playful', w: 4, frames: [
    { d: 0.12, p: { ...both({ lidB: 0.48, h: 42 }), leftAngle: 8, rightAngle: -8, glintStyle: 'cute_anime' }, e: 'outBack' },
    { d: 0.5, p: { ...both({ lidB: 0.5 }), tremor: 2.4, glintStyle: 'cute_anime' }, e: 'linear' },
    { d: 0.35, p: {}, e: 'outElastic' },
  ]},
  { id: 'tease_stick', name: 'Playful Tease', cat: 'playful', w: 3, frames: [
    { d: 0.15, p: { leftLidTop: 0.9, rightLidBottom: 0.4, leftAngle: -10, glintStyle: 'diamond' }, e: 'outBack' },
    { d: 0.5, p: { leftLidTop: 0.88, rightLidBottom: 0.42 }, e: 'hold' },
    { d: 0.35, p: {}, e: 'outElastic' },
  ]},
  { id: 'kawaii_max', name: 'Maximum Kawaii', cat: 'playful', w: 4, frames: [
    { d: 0.2, p: { ...both({ w: 26, h: 52, sc: 1.2 }), glintStyle: 'cute_anime', glintIntensity: 1.7, breath: 1.6 }, e: 'outBack' },
    { d: 0.9, p: { ...both({ sc: 1.18 }), glintStyle: 'cute_anime', breath: 2 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outCubic' },
  ]},
  { id: 'bounce_eyes', name: 'Bouncing Eyes', cat: 'playful', w: 3, frames: [
    { d: 0.14, p: { eyeYOffset: -18, ...both({ sc: 1.1 }) }, e: 'outQuad' },
    { d: 0.16, p: { eyeYOffset: 4, ...both({ sc: 0.94 }) }, e: 'outBounce' },
    { d: 0.14, p: { eyeYOffset: -12 }, e: 'outQuad' },
    { d: 0.3, p: {}, e: 'outBounce' },
  ]},
  { id: 'roll_playful', name: 'Playful Eye Roll', cat: 'playful', w: 4, frames: [
    { d: 0.2, p: { trackingWeight: 0, gazeBiasY: -28, gazeBiasX: -18 }, e: 'inOutQuad' },
    { d: 0.2, p: { trackingWeight: 0, gazeBiasY: -26, gazeBiasX: 22 }, e: 'linear' },
    { d: 0.2, p: { trackingWeight: 0, gazeBiasY: 20, gazeBiasX: 16 }, e: 'linear' },
    { d: 0.2, p: { trackingWeight: 0, gazeBiasY: 18, gazeBiasX: -18 }, e: 'linear' },
    { d: 0.3, p: { trackingWeight: 1 }, e: 'outBack' },
  ]},
  { id: 'wiggle_wave', name: 'Wiggle Wave', cat: 'playful', w: 3, frames: [
    { d: 0.14, p: { leftOffsetY: -8, rightOffsetY: 8, leftAngle: -10, rightAngle: 10 }, e: 'inOutQuad' },
    { d: 0.16, p: { leftOffsetY: 8, rightOffsetY: -8, leftAngle: 10, rightAngle: -10 }, e: 'inOutQuad' },
    { d: 0.16, p: { leftOffsetY: -7, rightOffsetY: 7, leftAngle: -8, rightAngle: 8 }, e: 'inOutQuad' },
    { d: 0.3, p: {}, e: 'outElastic' },
  ]},
  { id: 'starstruck', name: 'Star-Struck Fan', cat: 'playful', w: 3, frames: [
    { d: 0.14, p: { ...both({ w: 25, h: 54, sc: 1.22 }), glintStyle: 'star', glintIntensity: 1.8 }, e: 'outBack' },
    { d: 0.8, p: { ...both({ sc: 1.2 }), glintStyle: 'star', breath: 1.8, glintIntensity: 1.9 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'sneaky_creep', name: 'Sneaky Creep', cat: 'playful', w: 3, frames: [
    { d: 0.4, p: { ...both({ lidT: 0.58, w: 20 }), trackingWeight: 0.4, glintStyle: 'diamond', trackingDamping: 0.06 }, e: 'inOutCubic' },
    { d: 1.0, p: { ...both({ lidT: 0.6 }), trackingWeight: 0.4, glintStyle: 'diamond' }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'blep', name: 'Innocent Blep', cat: 'playful', w: 3, frames: [
    { d: 0.16, p: { ...both({ lidB: 0.52, h: 40 }), leftAngle: -6, rightAngle: 6, glintStyle: 'cute_anime' }, e: 'outBack' },
    { d: 0.7, p: { ...both({ lidB: 0.54 }), glintStyle: 'cute_anime' }, e: 'hold' },
    { d: 0.35, p: {}, e: 'outElastic' },
  ]},
  { id: 'copycat', name: 'Copycat Mirror', cat: 'playful', w: 3, frames: [
    { d: 0.2, p: { leftScale: 1.2, rightScale: 0.85, trackingDamping: 0.24 }, e: 'outBack' },
    { d: 0.25, p: { leftScale: 0.85, rightScale: 1.2 }, e: 'inOutQuad' },
    { d: 0.25, p: { leftScale: 1.18, rightScale: 0.87 }, e: 'inOutQuad' },
    { d: 0.35, p: {}, e: 'outElastic' },
  ]},

  /* ============ WARY / NEGATIVE (14) ============ */
  { id: 'suspicious_slit', name: 'Suspicious Slits', cat: 'wary', w: 5, frames: [
    { d: 0.3, p: { ...both({ lidT: 0.66, lidB: 0.2, w: 20 }), leftAngle: 13, rightAngle: -13, browAngle: 16 }, e: 'outCubic' },
    { d: 1.0, p: { ...both({ lidT: 0.68, lidB: 0.22 }), trackingDamping: 0.16 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'side_eye', name: 'Judgmental Side-Eye', cat: 'wary', w: 5, frames: [
    { d: 0.26, p: { trackingWeight: 0.1, gazeBiasX: -42, ...both({ lidT: 0.52 }), browAngle: 12 }, e: 'outCubic' },
    { d: 1.1, p: { trackingWeight: 0.1, gazeBiasX: -44, ...both({ lidT: 0.54 }) }, e: 'hold' },
    { d: 0.4, p: { trackingWeight: 1 }, e: 'outQuad' },
  ]},
  { id: 'narrow_threat', name: 'Threat Assessment', cat: 'wary', w: 3, frames: [
    { d: 0.2, p: { ...both({ lidT: 0.6, w: 13, h: 44 }), glintStyle: 'crosshair', trackingDamping: 0.22 }, e: 'outExpo' },
    { d: 1.0, p: { ...both({ lidT: 0.62 }), glintStyle: 'crosshair', trackingSaccade: 3 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'flinch', name: 'Defensive Flinch', cat: 'wary', w: 4, frames: [
    { d: 0.04, p: { ...both({ lidT: 0.85, sc: 0.84 }), eyeYOffset: 4 }, e: 'inQuad' },
    { d: 0.12, p: { ...both({ lidT: 0.4, sc: 0.94 }) }, e: 'outQuad' },
    { d: 0.35, p: { ...both({ lidT: 0.2 }), tremor: 1.8 }, e: 'outCubic' },
    { d: 0.35, p: {}, e: 'outElastic' },
  ]},
  { id: 'unimpressed', name: 'Unimpressed Stare', cat: 'wary', w: 4, frames: [
    { d: 0.3, p: { ...both({ lidT: 0.5, lidB: 0.28, h: 40 }), glintIntensity: 0.45, trackingDamping: 0.1 }, e: 'outQuad' },
    { d: 1.3, p: { ...both({ lidT: 0.52, lidB: 0.3 }) }, e: 'hold' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'disapprove', name: 'Silent Disapproval', cat: 'wary', w: 3, frames: [
    { d: 0.28, p: { ...both({ lidT: 0.46 }), leftAngle: 16, rightAngle: -16, browAngle: 18, glintIntensity: 0.5 }, e: 'outCubic' },
    { d: 0.25, p: { trackingWeight: 0, gazeBiasX: -22 }, e: 'inOutQuad' },
    { d: 0.25, p: { trackingWeight: 0, gazeBiasX: 22 }, e: 'inOutQuad' },
    { d: 0.45, p: {}, e: 'outQuad' },
  ]},
  { id: 'stare_down', name: 'Intimidating Stare-Down', cat: 'wary', w: 3, frames: [
    { d: 0.4, p: { ...both({ w: 12, h: 50, lidT: 0.2 }), glintStyle: 'void', trackingDamping: 0.2, glintIntensity: 0.3 }, e: 'inOutCubic' },
    { d: 1.6, p: { ...both({ w: 12, h: 50 }), glintStyle: 'void', trackingDamping: 0.22 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'outCubic' },
  ]},
  { id: 'nervous_dart', name: 'Nervous Darting', cat: 'wary', w: 4, frames: [
    { d: 0.1, p: { trackingSaccade: 12, tremor: 2, trackingWeight: 0.5 }, e: 'snap' },
    { d: 0.85, p: { trackingSaccade: 14, tremor: 2.4, trackingWeight: 0.4, ...both({ w: 13 }) }, e: 'stagger' },
    { d: 0.4, p: {}, e: 'outCubic' },
  ]},
  { id: 'recoil', name: 'Recoil & Shrink', cat: 'wary', w: 3, frames: [
    { d: 0.08, p: { ...both({ sc: 0.78, w: 11, h: 30 }), ...dist(48), eyeYOffset: 2 }, e: 'outExpo' },
    { d: 0.5, p: { ...both({ sc: 0.8 }), tremor: 2.2 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'outElastic' },
  ]},
  { id: 'annoyed_twitch', name: 'Annoyed Twitch', cat: 'wary', w: 4, frames: [
    { d: 0.2, p: { ...both({ lidT: 0.44 }), leftAngle: 14, rightAngle: -14 }, e: 'outQuad' },
    { d: 0.05, p: { leftLidTop: 0.62, leftAngle: 18 }, e: 'snap' },
    { d: 0.12, p: { leftLidTop: 0.44, leftAngle: 14 }, e: 'outQuad' },
    { d: 0.05, p: { leftLidTop: 0.6 }, e: 'snap' },
    { d: 0.35, p: {}, e: 'outQuad' },
  ]},
  { id: 'cold_glare', name: 'Cold Glare', cat: 'wary', w: 3, frames: [
    { d: 0.35, p: { ...both({ lidT: 0.56, lidB: 0.16, w: 18 }), browAngle: 20, glintIntensity: 0.35, glintStyle: 'void' }, e: 'inOutCubic' },
    { d: 1.2, p: { ...both({ lidT: 0.58 }), glintStyle: 'void' }, e: 'hold' },
    { d: 0.45, p: {}, e: 'outQuad' },
  ]},
  { id: 'wince', name: 'Pained Wince', cat: 'wary', w: 3, frames: [
    { d: 0.1, p: { ...both({ lidT: 0.7, lidB: 0.42 }), leftAngle: 12, rightAngle: -12 }, e: 'inBack' },
    { d: 0.3, p: { ...both({ lidT: 0.72, lidB: 0.44 }), tremor: 1.5 }, e: 'hold' },
    { d: 0.4, p: {}, e: 'outCubic' },
  ]},
  { id: 'doubt', name: 'Lingering Doubt', cat: 'wary', w: 3, frames: [
    { d: 0.3, p: { leftLidTop: 0.55, rightLidTop: 0.18, leftAngle: 10, browAngle: 10 }, e: 'outCubic' },
    { d: 0.4, p: { trackingWeight: 0.3, gazeBiasX: -20 }, e: 'inOutQuad' },
    { d: 0.4, p: { trackingWeight: 0.3, gazeBiasX: 16 }, e: 'inOutQuad' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'freeze_alert', name: 'Frozen Alert', cat: 'wary', w: 3, frames: [
    { d: 0.05, p: { ...both({ h: 52, w: 13 }), trackingWeight: 0.1, glintStyle: 'ring' }, e: 'outExpo' },
    { d: 1.1, p: { ...both({ h: 52 }), trackingWeight: 0.1, glintStyle: 'ring', tremor: 0.8 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},

  /* ============ TECH / SCI-FI (16) ============ */
  { id: 'matrix_scan', name: 'Matrix Data Stream', cat: 'tech', w: 4, frames: [
    { d: 0.14, p: { glintStyle: 'matrix', ...both({ w: 19, h: 50 }), glintIntensity: 1.3 }, e: 'outExpo' },
    { d: 1.3, p: { glintStyle: 'matrix', ...both({ w: 19, h: 50 }) }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'boot_sequence', name: 'System Boot Sequence', cat: 'tech', w: 3, frames: [
    { d: 0.2, p: { ...both({ h: 4, w: 22 }), glintStyle: 'scan_bar', trackingWeight: 0 }, e: 'outExpo' },
    { d: 0.18, p: { ...both({ h: 6 }), glintStyle: 'scan_bar', trackingWeight: 0 }, e: 'flicker' },
    { d: 0.24, p: { ...both({ h: 52, w: 18 }), glintStyle: 'matrix' }, e: 'outBack' },
    { d: 0.4, p: { glintStyle: 'double' }, e: 'outQuad' },
  ]},
  { id: 'reboot_glitch', name: 'Reboot Glitch', cat: 'tech', w: 3, frames: [
    { d: 0.1, p: { glintStyle: 'glitch_rgb', ...both({ w: 24, h: 20 }), tremor: 4 }, e: 'snap' },
    { d: 0.12, p: { glintStyle: 'glitch_rgb', ...both({ w: 10, h: 56 }), leftOffsetX: 7, rightOffsetX: -5 }, e: 'stagger' },
    { d: 0.1, p: { glintStyle: 'glitch_rgb', ...both({ w: 22, h: 32 }), leftOffsetY: -6 }, e: 'snap' },
    { d: 0.35, p: { glintStyle: 'double' }, e: 'outElastic' },
  ]},
  { id: 'targeting_grid', name: 'Targeting Grid', cat: 'tech', w: 4, frames: [
    { d: 0.16, p: { glintStyle: 'crosshair', ...both({ w: 13, h: 52 }), trackingDamping: 0.28 }, e: 'outExpo' },
    { d: 1.0, p: { glintStyle: 'target', trackingDamping: 0.3, ...both({ w: 12 }) }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'sonar_ping', name: 'Sonar Ping', cat: 'tech', w: 4, frames: [
    { d: 0.1, p: { glintStyle: 'ring', ...both({ sc: 1.15 }), glintIntensity: 1.6 }, e: 'outExpo' },
    { d: 0.4, p: { glintStyle: 'ring', ...both({ sc: 1 }), glintIntensity: 0.8 }, e: 'outQuad' },
    { d: 0.1, p: { glintStyle: 'ring', ...both({ sc: 1.13 }), glintIntensity: 1.5 }, e: 'outExpo' },
    { d: 0.45, p: { glintStyle: 'ring', glintIntensity: 0.7 }, e: 'outQuad' },
    { d: 0.3, p: {}, e: 'outCubic' },
  ]},
  { id: 'thermal_vision', name: 'Thermal Vision', cat: 'tech', w: 3, frames: [
    { d: 0.2, p: { glintStyle: 'scan_bar', ...both({ w: 21, h: 48 }), glintIntensity: 1.4 }, e: 'outCubic' },
    { d: 1.2, p: { glintStyle: 'scan_bar', ...both({ w: 21 }) }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'data_upload', name: 'Data Upload', cat: 'tech', w: 3, frames: [
    { d: 0.16, p: { glintStyle: 'matrix', ...both({ h: 56, w: 15 }), trackingWeight: 0.2 }, e: 'outExpo' },
    { d: 0.9, p: { glintStyle: 'matrix', trackingWeight: 0.1, trackingSaccade: 4 }, e: 'linear' },
    { d: 0.2, p: { glintStyle: 'burst', ...both({ sc: 1.15 }) }, e: 'outBack' },
    { d: 0.35, p: {}, e: 'outQuad' },
  ]},
  { id: 'lens_calibrate', name: 'Lens Calibration', cat: 'tech', w: 3, frames: [
    { d: 0.22, p: { ...both({ w: 26, h: 26 }), glintStyle: 'ring' }, e: 'inOutCubic' },
    { d: 0.22, p: { ...both({ w: 10, h: 58 }), glintStyle: 'ring' }, e: 'inOutCubic' },
    { d: 0.22, p: { ...both({ w: 20, h: 40 }), glintStyle: 'crosshair' }, e: 'inOutCubic' },
    { d: 0.35, p: { glintStyle: 'double' }, e: 'outBack' },
  ]},
  { id: 'hologram_flicker', name: 'Hologram Flicker', cat: 'tech', w: 3, frames: [
    { d: 0.3, p: { glintStyle: 'glitch_rgb', glintIntensity: 1.3, ...both({ w: 18 }) }, e: 'flicker' },
    { d: 0.5, p: { glintStyle: 'glitch_rgb', tremor: 1.2 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'ai_thinking', name: 'AI Processing', cat: 'tech', w: 4, frames: [
    { d: 0.25, p: { glintStyle: 'spiral', ...both({ w: 20, h: 46 }), trackingWeight: 0.3 }, e: 'outCubic' },
    { d: 1.2, p: { glintStyle: 'spiral', trackingWeight: 0.2, gazeBiasY: -14 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'night_vision', name: 'Night Vision Mode', cat: 'tech', w: 3, frames: [
    { d: 0.3, p: { glintStyle: 'matrix', ...both({ w: 25, h: 54, sc: 1.12 }), glintIntensity: 1.5 }, e: 'outBack' },
    { d: 1.1, p: { glintStyle: 'matrix', ...both({ sc: 1.1 }) }, e: 'linear' },
    { d: 0.45, p: {}, e: 'outCubic' },
  ]},
  { id: 'firewall_alert', name: 'Firewall Alert', cat: 'tech', w: 2, frames: [
    { d: 0.08, p: { glintStyle: 'target', ...both({ sc: 1.2, w: 21 }), glintIntensity: 1.8 }, e: 'outExpo' },
    { d: 0.1, p: { glintStyle: 'target', ...both({ sc: 0.95 }) }, e: 'inQuad' },
    { d: 0.08, p: { glintStyle: 'target', ...both({ sc: 1.18 }) }, e: 'outExpo' },
    { d: 0.1, p: { glintStyle: 'target', ...both({ sc: 0.96 }) }, e: 'inQuad' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'quantum_state', name: 'Quantum Superposition', cat: 'tech', w: 2, frames: [
    { d: 0.18, p: { leftOffsetX: -9, rightOffsetX: 9, glintStyle: 'glitch_rgb', ...both({ w: 13 }) }, e: 'outExpo' },
    { d: 0.18, p: { leftOffsetX: 9, rightOffsetX: -9, glintStyle: 'glitch_rgb' }, e: 'stagger' },
    { d: 0.18, p: { leftOffsetX: -7, rightOffsetX: 7 }, e: 'stagger' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'diagnostic', name: 'Self-Diagnostic', cat: 'tech', w: 3, frames: [
    { d: 0.12, p: { ...both({ lidT: 0.5 }), glintStyle: 'scan_bar' }, e: 'snap' },
    { d: 0.12, p: { ...both({ lidT: 0 }), glintStyle: 'scan_bar' }, e: 'snap' },
    { d: 0.12, p: { ...both({ lidB: 0.5 }), glintStyle: 'scan_bar' }, e: 'snap' },
    { d: 0.12, p: { ...both({ lidB: 0 }), glintStyle: 'crosshair' }, e: 'snap' },
    { d: 0.35, p: {}, e: 'outBack' },
  ]},
  { id: 'overclock', name: 'Overclock Surge', cat: 'tech', w: 2, frames: [
    { d: 0.12, p: { ...both({ w: 23, h: 56, sc: 1.16 }), glintStyle: 'burst', tremor: 3, glintIntensity: 1.8 }, e: 'outExpo' },
    { d: 0.6, p: { ...both({ sc: 1.14 }), glintStyle: 'burst', tremor: 3.4 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'outElastic' },
  ]},
  { id: 'standby_pulse', name: 'Standby Pulse', cat: 'tech', w: 3, frames: [
    { d: 0.7, p: { ...both({ h: 12 }), glintStyle: 'scan_bar', glintIntensity: 1.2, trackingWeight: 0.3 }, e: 'inOutQuad' },
    { d: 0.7, p: { ...both({ h: 9 }), glintStyle: 'scan_bar', glintIntensity: 0.5, trackingWeight: 0.3 }, e: 'inOutQuad' },
    { d: 0.5, p: {}, e: 'outBack' },
  ]},

  /* ============ CHAOS / DIZZY (12) ============ */
  { id: 'dizzy_spiral', name: 'Dizzy Spiral', cat: 'chaos', w: 4, frames: [
    { d: 0.2, p: { glintStyle: 'spiral', ...both({ w: 24, h: 44 }), trackingWeight: 0 }, e: 'outBack' },
    { d: 1.2, p: { glintStyle: 'spiral', trackingWeight: 0, tremor: 1.4 }, e: 'linear' },
    { d: 0.45, p: {}, e: 'outElastic' },
  ]},
  { id: 'wobble_drunk', name: 'Wobbly Disorientation', cat: 'chaos', w: 3, frames: [
    { d: 0.3, p: { leftOffsetY: -7, rightOffsetY: 7, leftAngle: -12, rightAngle: 8, trackingWeight: 0.2 }, e: 'inOutQuad' },
    { d: 0.35, p: { leftOffsetY: 8, rightOffsetY: -6, leftAngle: 10, rightAngle: -12, trackingWeight: 0.2 }, e: 'inOutQuad' },
    { d: 0.3, p: { leftOffsetY: -5, rightOffsetY: 6, leftAngle: -8, rightAngle: 6 }, e: 'inOutQuad' },
    { d: 0.45, p: {}, e: 'outElastic' },
  ]},
  { id: 'spin_out', name: 'Spin Out', cat: 'chaos', w: 3, frames: [
    { d: 0.18, p: { trackingWeight: 0, gazeBiasX: 0, gazeBiasY: -26, ...both({ sc: 1.1 }) }, e: 'linear' },
    { d: 0.16, p: { trackingWeight: 0, gazeBiasX: 26, gazeBiasY: 0 }, e: 'linear' },
    { d: 0.16, p: { trackingWeight: 0, gazeBiasX: 0, gazeBiasY: 24 }, e: 'linear' },
    { d: 0.16, p: { trackingWeight: 0, gazeBiasX: -26, gazeBiasY: 0 }, e: 'linear' },
    { d: 0.16, p: { trackingWeight: 0, gazeBiasY: -22 }, e: 'linear' },
    { d: 0.4, p: { trackingWeight: 1 }, e: 'outElastic' },
  ]},
  { id: 'static_burst', name: 'Static Burst', cat: 'chaos', w: 3, frames: [
    { d: 0.06, p: { glintStyle: 'glitch_rgb', ...both({ w: 25, h: 18 }), tremor: 5 }, e: 'snap' },
    { d: 0.06, p: { glintStyle: 'glitch_rgb', ...both({ w: 9, h: 58 }), tremor: 5 }, e: 'snap' },
    { d: 0.06, p: { glintStyle: 'glitch_rgb', ...both({ w: 22, h: 26 }), tremor: 5 }, e: 'snap' },
    { d: 0.06, p: { glintStyle: 'glitch_rgb', ...both({ w: 12, h: 50 }), tremor: 5 }, e: 'snap' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'malfunction', name: 'Critical Malfunction', cat: 'chaos', w: 2, frames: [
    { d: 0.1, p: { leftLidTop: 0.8, rightLidBottom: 0.7, glintStyle: 'glitch_rgb', tremor: 4 }, e: 'snap' },
    { d: 0.12, p: { leftLidBottom: 0.75, rightLidTop: 0.85, leftOffsetX: -9, rightOffsetX: 7 }, e: 'stagger' },
    { d: 0.1, p: { leftLidTop: 0.6, rightLidTop: 0.2, leftAngle: 22, rightAngle: -16 }, e: 'snap' },
    { d: 0.45, p: {}, e: 'outElastic' },
  ]},
  { id: 'reality_break', name: 'Reality Break', cat: 'chaos', w: 2, frames: [
    { d: 0.14, p: { ...dist(12), leftOffsetX: 14, rightOffsetX: -14, glintStyle: 'void' }, e: 'inBack' },
    { d: 0.2, p: { ...dist(60), leftOffsetX: -12, rightOffsetX: 12, glintStyle: 'void' }, e: 'outBack' },
    { d: 0.18, p: { ...dist(24), glintStyle: 'spiral' }, e: 'inOutQuad' },
    { d: 0.45, p: {}, e: 'outElastic' },
  ]},
  { id: 'shake_violent', name: 'Violent Shake', cat: 'chaos', w: 3, frames: [
    { d: 0.1, p: { tremor: 6, ...both({ sc: 1.06 }) }, e: 'snap' },
    { d: 0.55, p: { tremor: 6.5 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'melt_down', name: 'Melting Down', cat: 'chaos', w: 2, frames: [
    { d: 0.5, p: { ...both({ h: 62, w: 12 }), eyeYOffset: 8, leftAngle: -6, rightAngle: 6, glintIntensity: 0.5 }, e: 'inOutCubic' },
    { d: 0.5, p: { ...both({ h: 70, w: 10 }), eyeYOffset: 14 }, e: 'inQuad' },
    { d: 0.5, p: {}, e: 'outElastic' },
  ]},
  { id: 'kaleidoscope', name: 'Kaleidoscope Vision', cat: 'chaos', w: 2, frames: [
    { d: 0.25, p: { glintStyle: 'diamond', leftAngle: 22, rightAngle: -22, ...both({ w: 24 }) }, e: 'inOutQuad' },
    { d: 0.25, p: { glintStyle: 'diamond', leftAngle: -22, rightAngle: 22 }, e: 'inOutQuad' },
    { d: 0.25, p: { glintStyle: 'spiral', leftAngle: 18, rightAngle: -18 }, e: 'inOutQuad' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'desync', name: 'Ocular Desync', cat: 'chaos', w: 3, frames: [
    { d: 0.35, p: { leftOffsetX: -12, leftOffsetY: -8, rightOffsetX: 11, rightOffsetY: 9, leftScale: 1.2, rightScale: 0.82 }, e: 'inOutCubic' },
    { d: 0.4, p: { leftOffsetX: 11, leftOffsetY: 9, rightOffsetX: -12, rightOffsetY: -8, leftScale: 0.82, rightScale: 1.2 }, e: 'inOutCubic' },
    { d: 0.45, p: {}, e: 'outElastic' },
  ]},
  { id: 'vertigo', name: 'Vertigo Sway', cat: 'chaos', w: 3, frames: [
    { d: 0.5, p: { trackingWeight: 0.1, gazeBiasX: -30, gazeBiasY: 14, leftAngle: -14, rightAngle: -14 }, e: 'inOutQuad' },
    { d: 0.55, p: { trackingWeight: 0.1, gazeBiasX: 30, gazeBiasY: -12, leftAngle: 14, rightAngle: 14 }, e: 'inOutQuad' },
    { d: 0.5, p: {}, e: 'outElastic' },
  ]},
  { id: 'panic_scan', name: 'Panic Scan', cat: 'chaos', w: 3, frames: [
    { d: 0.07, p: { trackingWeight: 0, gazeBiasX: -40, gazeBiasY: -20, ...both({ h: 54 }) }, e: 'snap' },
    { d: 0.07, p: { trackingWeight: 0, gazeBiasX: 38, gazeBiasY: 16 }, e: 'snap' },
    { d: 0.07, p: { trackingWeight: 0, gazeBiasX: -34, gazeBiasY: 20 }, e: 'snap' },
    { d: 0.07, p: { trackingWeight: 0, gazeBiasX: 40, gazeBiasY: -18 }, e: 'snap' },
    { d: 0.07, p: { trackingWeight: 0, gazeBiasX: -20, gazeBiasY: -22 }, e: 'snap' },
    { d: 0.4, p: { trackingWeight: 1, tremor: 2 }, e: 'outElastic' },
  ]},

  /* ============ RARE EASTER EGGS (14) ============ */
  { id: 'third_eye', name: 'Third Eye Awakening', cat: 'rare', w: 1, frames: [
    { d: 0.6, p: { ...both({ lidT: 0.9 }), glintStyle: 'void', trackingWeight: 0 }, e: 'inOutCubic' },
    { d: 0.5, p: { ...both({ lidT: 0.92 }), glintStyle: 'spiral' }, e: 'hold' },
    { d: 0.35, p: { ...both({ lidT: 0, h: 58, w: 22 }), glintStyle: 'diamond', glintIntensity: 1.9 }, e: 'outBack' },
    { d: 0.6, p: {}, e: 'outCubic' },
  ]},
  { id: 'heart_explosion', name: 'Heart Explosion', cat: 'rare', w: 1, frames: [
    { d: 0.12, p: { ...both({ sc: 0.85 }) }, e: 'inQuad' },
    { d: 0.2, p: { ...both({ w: 28, h: 56, sc: 1.3 }), glintStyle: 'heart', glintIntensity: 2 }, e: 'outBack' },
    { d: 0.6, p: { ...both({ sc: 1.26 }), glintStyle: 'heart', breath: 2.2, glintIntensity: 2 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'outElastic' },
  ]},
  { id: 'sparkle_rain', name: 'Sparkle Rain', cat: 'rare', w: 1, frames: [
    { d: 0.2, p: { glintStyle: 'burst', ...both({ w: 24, h: 52 }), glintIntensity: 1.9 }, e: 'outBack' },
    { d: 1.2, p: { glintStyle: 'burst', breath: 2, glintIntensity: 2 }, e: 'linear' },
    { d: 0.5, p: { glintStyle: 'star' }, e: 'outQuad' },
  ]},
  { id: 'galaxy_eyes', name: 'Galaxy Eyes', cat: 'rare', w: 1, frames: [
    { d: 0.5, p: { ...both({ w: 26, h: 56, sc: 1.16 }), glintStyle: 'spiral', glintIntensity: 1.7, breath: 2 }, e: 'inOutCubic' },
    { d: 1.8, p: { ...both({ sc: 1.14 }), glintStyle: 'spiral', breath: 2.4 }, e: 'linear' },
    { d: 0.6, p: {}, e: 'inOutCubic' },
  ]},
  { id: 'wink_flirt', name: 'Charming Flirt Wink', cat: 'rare', w: 2, frames: [
    { d: 0.14, p: { leftLidTop: 1, rightScale: 1.22, glintStyle: 'star', glintIntensity: 1.7 }, e: 'outBack' },
    { d: 0.3, p: { leftLidTop: 1, glintStyle: 'star', glintIntensity: 1.9 }, e: 'hold' },
    { d: 0.16, p: { leftLidTop: 0, glintStyle: 'heart', ...both({ sc: 1.12 }) }, e: 'outBack' },
    { d: 0.45, p: {}, e: 'outElastic' },
  ]},
  { id: 'sleepy_z_dream', name: 'Dreaming of Stars', cat: 'rare', w: 2, frames: [
    { d: 0.7, p: { ...both({ lidT: 0.9 }), glintStyle: 'sleepy_z', trackingWeight: 0 }, e: 'inOutCubic' },
    { d: 1.6, p: { ...both({ lidT: 0.88 }), glintStyle: 'sleepy_z', trackingWeight: 0, breath: 2.4 }, e: 'linear' },
    { d: 0.3, p: { ...both({ lidT: 0.2 }), glintStyle: 'star' }, e: 'outBack' },
    { d: 0.5, p: {}, e: 'outQuad' },
  ]},
  { id: 'zen_void', name: 'Zen Void', cat: 'rare', w: 2, frames: [
    { d: 0.8, p: { ...both({ w: 12, h: 12 }), glintStyle: 'void', trackingWeight: 0, glintIntensity: 0.2 }, e: 'inOutExpo' },
    { d: 1.5, p: { ...both({ w: 12, h: 12 }), glintStyle: 'void', trackingWeight: 0 }, e: 'hold' },
    { d: 0.7, p: {}, e: 'outBack' },
  ]},
  { id: 'clock_eyes', name: 'Clockwork Eyes', cat: 'rare', w: 1, frames: [
    { d: 0.3, p: { glintStyle: 'ring', ...both({ w: 26, h: 26 }), trackingWeight: 0.2 }, e: 'outBack' },
    { d: 1.4, p: { glintStyle: 'ring', ...both({ w: 26, h: 26 }), trackingWeight: 0.1 }, e: 'linear' },
    { d: 0.45, p: {}, e: 'outElastic' },
  ]},
  { id: 'x_eyes', name: 'Knocked Out', cat: 'rare', w: 1, frames: [
    { d: 0.1, p: { leftAngle: 42, rightAngle: -42, ...both({ w: 12, h: 44 }), glintStyle: 'void', trackingWeight: 0 }, e: 'outExpo' },
    { d: 0.9, p: { leftAngle: 44, rightAngle: -44, trackingWeight: 0, tremor: 1 }, e: 'hold' },
    { d: 0.5, p: {}, e: 'outElastic' },
  ]},
  { id: 'super_focus', name: 'Superhuman Focus', cat: 'rare', w: 2, frames: [
    { d: 0.15, p: { ...both({ w: 8, h: 60 }), glintStyle: 'target', trackingDamping: 0.34, glintIntensity: 1.6 }, e: 'outExpo' },
    { d: 1.3, p: { ...both({ w: 8, h: 60 }), glintStyle: 'target', trackingDamping: 0.36 }, e: 'linear' },
    { d: 0.45, p: {}, e: 'outBack' },
  ]},
  { id: 'rainbow_pulse', name: 'Prismatic Pulse', cat: 'rare', w: 1, frames: [
    { d: 0.25, p: { glintStyle: 'diamond', ...both({ sc: 1.18, w: 23 }), glintIntensity: 1.8 }, e: 'outBack' },
    { d: 0.3, p: { glintStyle: 'burst', ...both({ sc: 1.05 }) }, e: 'inOutQuad' },
    { d: 0.3, p: { glintStyle: 'diamond', ...both({ sc: 1.18 }) }, e: 'inOutQuad' },
    { d: 0.45, p: {}, e: 'outElastic' },
  ]},
  { id: 'infinity_gaze', name: 'Infinity Gaze', cat: 'rare', w: 1, frames: [
    { d: 0.4, p: { trackingWeight: 0, gazeBiasX: -24, gazeBiasY: -16, glintStyle: 'spiral' }, e: 'inOutCubic' },
    { d: 0.4, p: { trackingWeight: 0, gazeBiasX: 24, gazeBiasY: 16 }, e: 'inOutCubic' },
    { d: 0.4, p: { trackingWeight: 0, gazeBiasX: -24, gazeBiasY: 16 }, e: 'inOutCubic' },
    { d: 0.4, p: { trackingWeight: 0, gazeBiasX: 24, gazeBiasY: -16 }, e: 'inOutCubic' },
    { d: 0.5, p: { trackingWeight: 1 }, e: 'outBack' },
  ]},
  { id: 'shy_hide', name: 'Shy Full Hide', cat: 'rare', w: 2, frames: [
    { d: 0.2, p: { ...both({ lidT: 0.6, lidB: 0.35 }), ...dist(52) }, e: 'inBack' },
    { d: 0.6, p: { ...both({ lidT: 0.7, lidB: 0.4 }), ...dist(54) }, e: 'hold' },
    { d: 0.25, p: { ...both({ lidT: 0.2 }), glintStyle: 'cute_anime' }, e: 'outBack' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'grand_reveal', name: 'Grand Reveal', cat: 'rare', w: 1, frames: [
    { d: 0.35, p: { ...both({ lidT: 1 }), glintStyle: 'void' }, e: 'inOutCubic' },
    { d: 0.45, p: { ...both({ lidT: 1 }) }, e: 'hold' },
    { d: 0.1, p: { ...both({ lidT: 0.3, h: 60, w: 24, sc: 1.24 }), glintStyle: 'burst', glintIntensity: 2 }, e: 'outExpo' },
    { d: 0.7, p: { glintStyle: 'star' }, e: 'outElastic' },
  ]},

  /* ================================================================
   *  WAVE 2 — 110 additional master-crafted routines
   * ================================================================ */

  /* ---- blinks & micro (12) ---- */
  { id: 'blink_stutter', name: 'Stutter Blink', cat: 'blink', w: 4, frames: [
    { d: 0.05, p: both({ lidT: 0.55 }), e: 'snap' },
    { d: 0.08, p: both({ lidT: 0.5 }), e: 'hold' },
    { d: 0.04, p: both({ lidT: 0.98 }), e: 'snap' },
    { d: 0.14, p: both({ lidT: 0 }), e: 'outBack' },
  ]},
  { id: 'blink_wave', name: 'Wave Blink L→R', cat: 'blink', w: 4, frames: [
    { d: 0.07, p: { leftLidTop: 1 }, e: 'inQuad' },
    { d: 0.07, p: { leftLidTop: 0.3, rightLidTop: 1 }, e: 'inOutQuad' },
    { d: 0.09, p: { leftLidTop: 0, rightLidTop: 0.25 }, e: 'outQuad' },
    { d: 0.12, p: {}, e: 'outBack' },
  ]},
  { id: 'blink_heavy', name: 'Heavy-Lidded Battle', cat: 'blink', w: 3, frames: [
    { d: 0.5, p: both({ lidT: 0.72 }), e: 'inOutQuad' },
    { d: 0.15, p: both({ lidT: 0.35 }), e: 'outQuad' },
    { d: 0.55, p: both({ lidT: 0.8 }), e: 'inOutQuad' },
    { d: 0.2, p: both({ lidT: 0.1 }), e: 'outBack' },
    { d: 0.3, p: {}, e: 'outQuad' },
  ]},
  { id: 'one_eye_peek', name: 'One-Eye Peek', cat: 'blink', w: 3, frames: [
    { d: 0.12, p: both({ lidT: 1 }), e: 'inQuad' },
    { d: 0.25, p: { leftLidTop: 1, rightLidTop: 0.55 }, e: 'outCubic' },
    { d: 0.4, p: { leftLidTop: 1, rightLidTop: 0.5 }, e: 'hold' },
    { d: 0.18, p: {}, e: 'outElastic' },
  ]},
  { id: 'moist_glisten', name: 'Moist Glisten', cat: 'blink', w: 3, frames: [
    { d: 0.3, p: { ...both({ h: 46 }), glintIntensity: 1.8, glintStyle: 'double', breath: 1.5 }, e: 'outCubic' },
    { d: 0.8, p: { glintIntensity: 1.9, breath: 1.7 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'dry_eyes', name: 'Dry Scratchy Eyes', cat: 'blink', w: 2, frames: [
    { d: 0.1, p: both({ lidT: 0.7, lidB: 0.3 }), e: 'inQuad' },
    { d: 0.1, p: both({ lidT: 0.3 }), e: 'outQuad' },
    { d: 0.1, p: both({ lidT: 0.75, lidB: 0.32 }), e: 'inQuad' },
    { d: 0.1, p: both({ lidT: 0.25 }), e: 'outQuad' },
    { d: 0.12, p: both({ lidT: 0.8, lidB: 0.35 }), e: 'inQuad' },
    { d: 0.3, p: {}, e: 'outCubic' },
  ]},
  { id: 'slow_close_open', name: 'Trusting Slow Close', cat: 'blink', w: 3, frames: [
    { d: 0.6, p: { ...both({ lidT: 1 }), glintStyle: 'cute_anime' }, e: 'inOutCubic' },
    { d: 0.5, p: both({ lidT: 1 }), e: 'hold' },
    { d: 0.65, p: { glintStyle: 'cute_anime' }, e: 'inOutCubic' },
  ]},
  { id: 'flutter_dreamy', name: 'Dreamy Flutter', cat: 'blink', w: 3, frames: [
    { d: 0.09, p: both({ lidT: 0.4 }), e: 'inOutQuad' },
    { d: 0.09, p: both({ lidT: 0.15 }), e: 'inOutQuad' },
    { d: 0.09, p: both({ lidT: 0.5 }), e: 'inOutQuad' },
    { d: 0.09, p: both({ lidT: 0.2 }), e: 'inOutQuad' },
    { d: 0.09, p: both({ lidT: 0.55 }), e: 'inOutQuad' },
    { d: 0.2, p: { glintStyle: 'star' }, e: 'outBack' },
  ]},
  { id: 'pressure_squint', name: 'Pressure Squint', cat: 'blink', w: 3, frames: [
    { d: 0.2, p: both({ lidT: 0.35, lidB: 0.35, w: 18 }), e: 'inOutQuad' },
    { d: 0.5, p: { ...both({ lidT: 0.4, lidB: 0.4 }), tremor: 0.8 }, e: 'linear' },
    { d: 0.3, p: {}, e: 'outBack' },
  ]},
  { id: 'awaken_fresh', name: 'Fresh Awakening', cat: 'blink', w: 3, frames: [
    { d: 0.25, p: both({ lidT: 0.85 }), e: 'inOutQuad' },
    { d: 0.2, p: both({ lidT: 0.4 }), e: 'outQuad' },
    { d: 0.16, p: { ...both({ lidT: 0, h: 50, w: 20 }), glintStyle: 'star', glintIntensity: 1.5 }, e: 'outBack' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'twitch_left', name: 'Left Lid Twitch', cat: 'blink', w: 3, frames: [
    { d: 0.05, p: { leftLidTop: 0.35 }, e: 'snap' },
    { d: 0.08, p: { leftLidTop: 0.05 }, e: 'outQuad' },
    { d: 0.05, p: { leftLidTop: 0.3 }, e: 'snap' },
    { d: 0.12, p: {}, e: 'outQuad' },
  ]},
  { id: 'gentle_settle', name: 'Gentle Settle', cat: 'blink', w: 4, frames: [
    { d: 0.35, p: { ...both({ h: 42, lidT: 0.12 }), breath: 1.6 }, e: 'inOutCubic' },
    { d: 0.6, p: { ...both({ lidT: 0.14 }), breath: 1.8 }, e: 'linear' },
    { d: 0.35, p: {}, e: 'outQuad' },
  ]},

  /* ---- attention (14) ---- */
  { id: 'binocular_zoom', name: 'Binocular Zoom', cat: 'attention', w: 3, frames: [
    { d: 0.15, p: { ...both({ w: 24, h: 24 }), glintStyle: 'ring' }, e: 'outExpo' },
    { d: 0.15, p: { ...both({ w: 27, h: 27 }), glintStyle: 'ring' }, e: 'outBack' },
    { d: 0.7, p: { ...both({ w: 26, h: 26 }), glintStyle: 'crosshair', trackingDamping: 0.26 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'sentry_mode', name: 'Sentry Watch', cat: 'attention', w: 4, frames: [
    { d: 0.6, p: { trackingWeight: 0, gazeBiasX: -40, ...both({ w: 14, lidT: 0.15 }) }, e: 'inOutExpo' },
    { d: 0.7, p: { trackingWeight: 0, gazeBiasX: -40 }, e: 'hold' },
    { d: 0.5, p: { trackingWeight: 0, gazeBiasX: 40 }, e: 'inOutExpo' },
    { d: 0.7, p: { trackingWeight: 0, gazeBiasX: 40 }, e: 'hold' },
    { d: 0.4, p: { trackingWeight: 1 }, e: 'outCubic' },
  ]},
  { id: 'triangulate', name: 'Triangulating', cat: 'attention', w: 3, frames: [
    { d: 0.12, p: { trackingWeight: 0, gazeBiasX: -30, gazeBiasY: 16, glintStyle: 'crosshair' }, e: 'snap' },
    { d: 0.12, p: { trackingWeight: 0, gazeBiasX: 30, gazeBiasY: 16 }, e: 'snap' },
    { d: 0.12, p: { trackingWeight: 0, gazeBiasX: 0, gazeBiasY: -26 }, e: 'snap' },
    { d: 0.25, p: { ...both({ w: 13, h: 50 }), glintStyle: 'target', trackingWeight: 1, trackingDamping: 0.28 }, e: 'outBack' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'whats_that', name: "What's That?!", cat: 'attention', w: 4, frames: [
    { d: 0.07, p: { ...both({ h: 54, w: 20 }), trackingDamping: 0.3, eyeYOffset: -10 }, e: 'outExpo' },
    { d: 0.2, p: { leftScale: 1.2, rightScale: 0.95, leftAngle: -8 }, e: 'outBack' },
    { d: 0.6, p: { leftScale: 1.18, rightScale: 0.96, trackingSaccade: 2 }, e: 'linear' },
    { d: 0.35, p: {}, e: 'outQuad' },
  ]},
  { id: 'inspect_close', name: 'Close Inspection', cat: 'attention', w: 4, frames: [
    { d: 0.3, p: { ...dist(26), ...both({ w: 21, h: 36 }), trackingDamping: 0.22, glintStyle: 'double' }, e: 'inOutCubic' },
    { d: 0.9, p: { ...dist(24), trackingSaccade: 1.5 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outBack' },
  ]},
  { id: 'horizon_gaze', name: 'Horizon Gaze', cat: 'attention', w: 3, frames: [
    { d: 0.6, p: { trackingWeight: 0.1, gazeBiasY: -8, ...both({ w: 22, h: 30, lidT: 0.2 }), glintIntensity: 1.3 }, e: 'inOutCubic' },
    { d: 1.4, p: { trackingWeight: 0.1, gazeBiasY: -10, breath: 1.7 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'track_fly', name: 'Tracking a Fly', cat: 'attention', w: 3, frames: [
    { d: 0.14, p: { trackingWeight: 0, gazeBiasX: -20, gazeBiasY: -18 }, e: 'outQuad' },
    { d: 0.12, p: { trackingWeight: 0, gazeBiasX: 14, gazeBiasY: -24 }, e: 'outQuad' },
    { d: 0.13, p: { trackingWeight: 0, gazeBiasX: 30, gazeBiasY: -6 }, e: 'outQuad' },
    { d: 0.11, p: { trackingWeight: 0, gazeBiasX: 8, gazeBiasY: 12 }, e: 'outQuad' },
    { d: 0.14, p: { trackingWeight: 0, gazeBiasX: -24, gazeBiasY: 4 }, e: 'outQuad' },
    { d: 0.35, p: { trackingWeight: 1 }, e: 'outCubic' },
  ]},
  { id: 'listen_hard', name: 'Listening Intently', cat: 'attention', w: 3, frames: [
    { d: 0.25, p: { trackingWeight: 0.2, gazeBiasX: 26, ...both({ lidT: 0.3, w: 14 }), leftAngle: 5, rightAngle: 5 }, e: 'outCubic' },
    { d: 1.1, p: { trackingWeight: 0.2, gazeBiasX: 28, tremor: 0.4 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'squint_far', name: 'Squinting at Distance', cat: 'attention', w: 3, frames: [
    { d: 0.25, p: both({ lidT: 0.5, lidB: 0.3, w: 20 }), e: 'inOutQuad' },
    { d: 0.3, p: { ...both({ lidT: 0.62, lidB: 0.35 }), trackingDamping: 0.2 }, e: 'inOutQuad' },
    { d: 0.6, p: both({ lidT: 0.6, lidB: 0.34 }), e: 'hold' },
    { d: 0.35, p: {}, e: 'outBack' },
  ]},
  { id: 'wide_survey', name: 'Wide-Eyed Survey', cat: 'attention', w: 3, frames: [
    { d: 0.2, p: { ...both({ w: 24, h: 52 }), ...dist(46) }, e: 'outBack' },
    { d: 0.4, p: { trackingWeight: 0.3, gazeBiasX: -24 }, e: 'inOutQuad' },
    { d: 0.45, p: { trackingWeight: 0.3, gazeBiasX: 26 }, e: 'inOutQuad' },
    { d: 0.4, p: {}, e: 'outCubic' },
  ]},
  { id: 'blink_and_look', name: 'Blink & Reacquire', cat: 'attention', w: 4, frames: [
    { d: 0.07, p: both({ lidT: 1 }), e: 'inQuad' },
    { d: 0.09, p: { ...both({ lidT: 0 }), trackingDamping: 0.05 }, e: 'outQuad' },
    { d: 0.4, p: { trackingDamping: 0.32, ...both({ h: 46 }) }, e: 'outExpo' },
    { d: 0.35, p: {}, e: 'outQuad' },
  ]},
  { id: 'measure_up', name: 'Measuring You Up', cat: 'attention', w: 3, frames: [
    { d: 0.3, p: { trackingWeight: 0.15, gazeBiasY: -24, ...both({ lidT: 0.25 }) }, e: 'inOutCubic' },
    { d: 0.5, p: { trackingWeight: 0.15, gazeBiasY: 22 }, e: 'inOutCubic' },
    { d: 0.4, p: { trackingWeight: 0.15, gazeBiasY: -8 }, e: 'inOutQuad' },
    { d: 0.35, p: { trackingWeight: 1, glintStyle: 'diamond' }, e: 'outBack' },
  ]},
  { id: 'mirror_check', name: 'Mirror Check', cat: 'attention', w: 3, frames: [
    { d: 0.2, p: { leftScale: 1.15, rightScale: 1.15, ...both({ h: 46 }), glintStyle: 'double' }, e: 'outBack' },
    { d: 0.25, p: { leftAngle: -8, rightAngle: 8 }, e: 'inOutQuad' },
    { d: 0.25, p: { leftAngle: 8, rightAngle: -8 }, e: 'inOutQuad' },
    { d: 0.3, p: { glintStyle: 'cute_anime' }, e: 'outElastic' },
  ]},
  { id: 'anticipate', name: 'Anticipation Build', cat: 'attention', w: 4, frames: [
    { d: 0.4, p: { ...both({ w: 15, h: 42 }), trackingDamping: 0.18, breath: 1.4 }, e: 'inOutQuad' },
    { d: 0.35, p: { ...both({ w: 17, h: 46 }), breath: 1.7 }, e: 'inOutQuad' },
    { d: 0.3, p: { ...both({ w: 19, h: 50 }), breath: 2 }, e: 'inOutQuad' },
    { d: 0.15, p: { ...both({ w: 24, h: 56, sc: 1.15 }), glintStyle: 'star' }, e: 'outBack' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},

  /* ---- emotion (16) ---- */
  { id: 'pure_bliss', name: 'Pure Bliss', cat: 'emotion', w: 4, frames: [
    { d: 0.3, p: { ...both({ lidB: 0.55, lidT: 0.1, h: 44 }), glintStyle: 'star', glintIntensity: 1.6, breath: 1.8 }, e: 'outCubic' },
    { d: 1.2, p: { ...both({ lidB: 0.58 }), glintStyle: 'star', breath: 2 }, e: 'linear' },
    { d: 0.45, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'proud_tears', name: 'Proud Tears', cat: 'emotion', w: 2, frames: [
    { d: 0.4, p: { ...both({ h: 48, lidB: 0.3 }), glintIntensity: 1.9, glintStyle: 'double', breath: 1.6 }, e: 'outCubic' },
    { d: 0.3, p: both({ lidT: 0.5 }), e: 'inOutQuad' },
    { d: 0.3, p: both({ lidT: 0.1 }), e: 'outQuad' },
    { d: 0.6, p: { glintIntensity: 2 }, e: 'linear' },
    { d: 0.45, p: {}, e: 'outQuad' },
  ]},
  { id: 'jealous_glance', name: 'Jealous Glance', cat: 'emotion', w: 3, frames: [
    { d: 0.2, p: { trackingWeight: 0.1, gazeBiasX: -38, ...both({ lidT: 0.45, w: 18 }), browAngle: 10 }, e: 'outCubic' },
    { d: 0.5, p: { trackingWeight: 0.1, gazeBiasX: -40 }, e: 'hold' },
    { d: 0.15, p: { trackingWeight: 0.1, gazeBiasX: 10, ...both({ lidT: 0.2 }) }, e: 'outQuad' },
    { d: 0.4, p: { trackingWeight: 0.1, gazeBiasX: -36, ...both({ lidT: 0.5 }) }, e: 'inOutQuad' },
    { d: 0.4, p: { trackingWeight: 1 }, e: 'outCubic' },
  ]},
  { id: 'embarrassed', name: 'Embarrassed Flush', cat: 'emotion', w: 3, frames: [
    { d: 0.15, p: { ...both({ h: 50, w: 22 }), glintStyle: 'cute_anime' }, e: 'outExpo' },
    { d: 0.25, p: { trackingWeight: 0, gazeBiasX: 30, gazeBiasY: 22, ...both({ lidT: 0.35 }) }, e: 'inOutCubic' },
    { d: 0.6, p: { trackingWeight: 0, gazeBiasX: 32, gazeBiasY: 24, tremor: 0.8 }, e: 'linear' },
    { d: 0.45, p: { trackingWeight: 1 }, e: 'outQuad' },
  ]},
  { id: 'hopeful_up', name: 'Hopeful Look Up', cat: 'emotion', w: 4, frames: [
    { d: 0.35, p: { trackingWeight: 0.15, gazeBiasY: -28, ...both({ w: 21, h: 50 }), glintStyle: 'star', glintIntensity: 1.5 }, e: 'outCubic' },
    { d: 1.0, p: { trackingWeight: 0.15, gazeBiasY: -30, breath: 1.8 }, e: 'linear' },
    { d: 0.45, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'disgust_recoil', name: 'Disgusted Recoil', cat: 'emotion', w: 3, frames: [
    { d: 0.1, p: { ...both({ lidT: 0.55, w: 13 }), leftAngle: -10, rightAngle: 10, eyeYOffset: -10 }, e: 'outExpo' },
    { d: 0.25, p: { trackingWeight: 0.2, gazeBiasX: -20, ...both({ lidT: 0.6 }) }, e: 'inOutQuad' },
    { d: 0.5, p: { trackingWeight: 0.2, gazeBiasX: -22 }, e: 'hold' },
    { d: 0.4, p: { trackingWeight: 1 }, e: 'outCubic' },
  ]},
  { id: 'melancholy_rain', name: 'Watching the Rain', cat: 'emotion', w: 3, frames: [
    { d: 0.6, p: { ...both({ lidT: 0.4, h: 40 }), trackingWeight: 0.05, gazeBiasY: 10, gazeBiasX: -16, glintIntensity: 0.6 }, e: 'inOutCubic' },
    { d: 0.8, p: { trackingWeight: 0.05, gazeBiasY: 12, gazeBiasX: -6 }, e: 'inOutQuad' },
    { d: 0.8, p: { trackingWeight: 0.05, gazeBiasY: 10, gazeBiasX: -20 }, e: 'inOutQuad' },
    { d: 0.6, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'triumphant', name: 'Triumphant Blaze', cat: 'emotion', w: 3, frames: [
    { d: 0.12, p: { ...both({ w: 20, h: 54, lidT: 0.15 }), glintStyle: 'burst', glintIntensity: 1.9, browAngle: -8 }, e: 'outExpo' },
    { d: 0.8, p: { glintStyle: 'burst', glintIntensity: 2, breath: 1.6 }, e: 'linear' },
    { d: 0.45, p: { glintStyle: 'star' }, e: 'outQuad' },
  ]},
  { id: 'pleading', name: 'Pleading Puppy Eyes', cat: 'emotion', w: 4, frames: [
    { d: 0.3, p: { ...both({ w: 25, h: 54, sc: 1.16 }), ...dist(34), gazeBiasY: -10, trackingWeight: 0.4, glintStyle: 'cute_anime', glintIntensity: 1.8 }, e: 'outBack' },
    { d: 1.1, p: { ...both({ sc: 1.14 }), breath: 1.9, glintIntensity: 1.9, glintStyle: 'cute_anime' }, e: 'linear' },
    { d: 0.5, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'betrayed', name: 'Quiet Betrayal', cat: 'emotion', w: 2, frames: [
    { d: 0.15, p: { ...both({ h: 52, w: 22 }) }, e: 'outExpo' },
    { d: 0.5, p: { ...both({ h: 52 }), tremor: 0.6 }, e: 'hold' },
    { d: 0.6, p: { ...both({ lidT: 0.5, h: 38 }), gazeBiasY: 20, trackingWeight: 0.2, glintIntensity: 0.5 }, e: 'inOutCubic' },
    { d: 0.6, p: { trackingWeight: 0.2, gazeBiasY: 22 }, e: 'hold' },
    { d: 0.5, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'smitten_shy', name: 'Smitten & Shy', cat: 'emotion', w: 3, frames: [
    { d: 0.25, p: { ...both({ w: 22, h: 48 }), glintStyle: 'heart', glintIntensity: 1.5 }, e: 'outBack' },
    { d: 0.3, p: { trackingWeight: 0.1, gazeBiasX: 28, gazeBiasY: 16, ...both({ lidT: 0.3 }), glintStyle: 'heart' }, e: 'inOutCubic' },
    { d: 0.4, p: { trackingWeight: 0.1, gazeBiasX: 30, glintStyle: 'heart' }, e: 'hold' },
    { d: 0.25, p: { trackingWeight: 1, glintStyle: 'heart', ...both({ h: 50 }) }, e: 'outBack' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'fury_tremble', name: 'Trembling Fury', cat: 'emotion', w: 2, frames: [
    { d: 0.14, p: { ...both({ lidT: 0.52, w: 20 }), leftAngle: 24, rightAngle: -24, browAngle: 24, tremor: 2 }, e: 'inBack' },
    { d: 0.9, p: { tremor: 3.2, leftAngle: 26, rightAngle: -26, ...both({ lidT: 0.55 }), glintStyle: 'void' }, e: 'linear' },
    { d: 0.5, p: {}, e: 'outCubic' },
  ]},
  { id: 'wistful_side', name: 'Wistful Side Gaze', cat: 'emotion', w: 3, frames: [
    { d: 0.5, p: { trackingWeight: 0.08, gazeBiasX: -34, gazeBiasY: -6, ...both({ lidT: 0.3, h: 42 }), glintIntensity: 0.75 }, e: 'inOutCubic' },
    { d: 1.3, p: { trackingWeight: 0.08, gazeBiasX: -36, breath: 1.7 }, e: 'linear' },
    { d: 0.55, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'overwhelmed', name: 'Overwhelmed Shutdown', cat: 'emotion', w: 2, frames: [
    { d: 0.12, p: { ...both({ w: 26, h: 56 }), trackingSaccade: 8 }, e: 'outExpo' },
    { d: 0.4, p: { trackingSaccade: 10, tremor: 1.5 }, e: 'linear' },
    { d: 0.5, p: { ...both({ lidT: 0.85, h: 36 }), trackingWeight: 0.1, trackingSaccade: 0 }, e: 'inOutCubic' },
    { d: 0.6, p: { ...both({ lidT: 0.88 }), trackingWeight: 0.1 }, e: 'hold' },
    { d: 0.5, p: {}, e: 'outCubic' },
  ]},
  { id: 'serene_smile', name: 'Serene Smile', cat: 'emotion', w: 4, frames: [
    { d: 0.4, p: { ...both({ lidB: 0.42, lidT: 0.18, h: 42 }), leftAngle: -4, rightAngle: 4, glintIntensity: 1.2, breath: 1.9 }, e: 'inOutCubic' },
    { d: 1.4, p: { ...both({ lidB: 0.44 }), breath: 2.1 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'heartbreak', name: 'Heartbreak Waver', cat: 'emotion', w: 1, frames: [
    { d: 0.3, p: { ...both({ h: 50 }), glintStyle: 'heart', glintIntensity: 1.6 }, e: 'outCubic' },
    { d: 0.25, p: { glintStyle: 'heart', glintIntensity: 0.9, tremor: 1 }, e: 'inQuad' },
    { d: 0.25, p: { glintStyle: 'void', glintIntensity: 0.4, ...both({ lidT: 0.4 }) }, e: 'inOutQuad' },
    { d: 0.7, p: { ...both({ lidT: 0.55, h: 38 }), gazeBiasY: 18, trackingWeight: 0.2 }, e: 'inOutCubic' },
    { d: 0.6, p: {}, e: 'inOutQuad' },
  ]},

  /* ---- idle (10) ---- */
  { id: 'cloud_watching', name: 'Cloud Watching', cat: 'idle', w: 4, frames: [
    { d: 0.8, p: { trackingWeight: 0.05, gazeBiasY: -26, gazeBiasX: -18, ...both({ lidT: 0.2 }), breath: 1.8 }, e: 'inOutCubic' },
    { d: 1.2, p: { trackingWeight: 0.05, gazeBiasY: -28, gazeBiasX: 16 }, e: 'inOutQuad' },
    { d: 1.0, p: { trackingWeight: 0.05, gazeBiasY: -24, gazeBiasX: -8 }, e: 'inOutQuad' },
    { d: 0.6, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'hum_a_tune', name: 'Humming a Tune', cat: 'idle', w: 4, frames: [
    { d: 0.3, p: { ...both({ lidB: 0.4, lidT: 0.15 }), leftAngle: -6, rightAngle: 6, eyeYOffset: -9 }, e: 'inOutQuad' },
    { d: 0.3, p: { leftAngle: 6, rightAngle: -6, eyeYOffset: -4 }, e: 'inOutQuad' },
    { d: 0.3, p: { leftAngle: -5, rightAngle: 5, eyeYOffset: -9 }, e: 'inOutQuad' },
    { d: 0.3, p: { leftAngle: 5, rightAngle: -5, eyeYOffset: -4 }, e: 'inOutQuad' },
    { d: 0.4, p: {}, e: 'outCubic' },
  ]},
  { id: 'counting_stars', name: 'Counting Stars', cat: 'idle', w: 3, frames: [
    { d: 0.3, p: { trackingWeight: 0, gazeBiasX: -22, gazeBiasY: -26, glintStyle: 'star' }, e: 'outQuad' },
    { d: 0.35, p: { trackingWeight: 0, gazeBiasX: 6, gazeBiasY: -30, glintStyle: 'star' }, e: 'inOutQuad' },
    { d: 0.35, p: { trackingWeight: 0, gazeBiasX: 28, gazeBiasY: -24, glintStyle: 'star' }, e: 'inOutQuad' },
    { d: 0.3, p: { trackingWeight: 0, gazeBiasX: 12, gazeBiasY: -30, glintStyle: 'star' }, e: 'inOutQuad' },
    { d: 0.5, p: { trackingWeight: 1 }, e: 'outCubic' },
  ]},
  { id: 'digest_thought', name: 'Digesting a Thought', cat: 'idle', w: 4, frames: [
    { d: 0.5, p: { trackingWeight: 0.15, gazeBiasX: 20, gazeBiasY: -16, ...both({ w: 14, lidT: 0.2 }) }, e: 'inOutCubic' },
    { d: 0.7, p: { trackingWeight: 0.15, gazeBiasX: 22, gazeBiasY: -18 }, e: 'hold' },
    { d: 0.2, p: { ...both({ h: 48 }), glintStyle: 'star', trackingWeight: 1 }, e: 'outBack' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'wind_down', name: 'Winding Down', cat: 'idle', w: 4, frames: [
    { d: 0.6, p: both({ lidT: 0.3, h: 40 }), e: 'inOutQuad' },
    { d: 0.7, p: { ...both({ lidT: 0.45 }), glintIntensity: 0.7 }, e: 'inOutQuad' },
    { d: 0.8, p: { ...both({ lidT: 0.6, h: 36 }), glintIntensity: 0.5, breath: 2 }, e: 'inOutQuad' },
    { d: 0.6, p: {}, e: 'outCubic' },
  ]},
  { id: 'micro_nap', name: 'Micro Nap', cat: 'idle', w: 3, frames: [
    { d: 0.4, p: { ...both({ lidT: 0.95 }), trackingWeight: 0 }, e: 'inOutCubic' },
    { d: 1.0, p: { ...both({ lidT: 0.96 }), trackingWeight: 0, glintStyle: 'sleepy_z', breath: 2.2 }, e: 'hold' },
    { d: 0.15, p: { ...both({ lidT: 0, h: 50 }), glintStyle: 'star' }, e: 'outExpo' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'sun_bathe', name: 'Sun Bathing', cat: 'idle', w: 3, frames: [
    { d: 0.6, p: { ...both({ lidT: 0.75, lidB: 0.1 }), gazeBiasY: -18, trackingWeight: 0.1, glintIntensity: 1.4, breath: 2 }, e: 'inOutCubic' },
    { d: 1.6, p: { ...both({ lidT: 0.78 }), trackingWeight: 0.1, breath: 2.3 }, e: 'linear' },
    { d: 0.6, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'lost_in_music', name: 'Lost in Music', cat: 'idle', w: 3, frames: [
    { d: 0.4, p: { ...both({ lidT: 0.55 }), leftAngle: -7, rightAngle: 7, eyeYOffset: -8, breath: 1.8 }, e: 'inOutQuad' },
    { d: 0.4, p: { leftAngle: 7, rightAngle: -7, eyeYOffset: -3 }, e: 'inOutQuad' },
    { d: 0.4, p: { leftAngle: -7, rightAngle: 7, eyeYOffset: -8 }, e: 'inOutQuad' },
    { d: 0.4, p: { leftAngle: 6, rightAngle: -6, eyeYOffset: -4 }, e: 'inOutQuad' },
    { d: 0.5, p: {}, e: 'outCubic' },
  ]},
  { id: 'zone_out', name: 'Zoning Out', cat: 'idle', w: 4, frames: [
    { d: 0.7, p: { trackingWeight: 0, gazeBiasX: 4, gazeBiasY: 6, ...both({ lidT: 0.25 }), glintIntensity: 0.5, trackingDamping: 0.03 }, e: 'inOutCubic' },
    { d: 1.8, p: { trackingWeight: 0, gazeBiasX: 5, gazeBiasY: 7 }, e: 'hold' },
    { d: 0.12, p: { ...both({ h: 50 }), trackingWeight: 1, glintStyle: 'star' }, e: 'outExpo' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'evening_calm', name: 'Evening Calm', cat: 'idle', w: 4, frames: [
    { d: 0.8, p: { ...both({ lidT: 0.35, lidB: 0.2, h: 40 }), glintIntensity: 0.8, breath: 2, trackingDamping: 0.06 }, e: 'inOutCubic' },
    { d: 1.6, p: { ...both({ lidT: 0.38 }), breath: 2.2 }, e: 'linear' },
    { d: 0.6, p: {}, e: 'inOutQuad' },
  ]},

  /* ---- playful (16) ---- */
  { id: 'puppy_tilt', name: 'Puppy Head Tilt', cat: 'playful', w: 4, frames: [
    { d: 0.22, p: { leftAngle: -16, rightAngle: -16, leftOffsetY: -6, rightOffsetY: 6, ...both({ w: 21, h: 48 }), glintStyle: 'cute_anime' }, e: 'outBack' },
    { d: 0.6, p: { leftAngle: -15, rightAngle: -15 }, e: 'hold' },
    { d: 0.25, p: { leftAngle: 14, rightAngle: 14, leftOffsetY: 6, rightOffsetY: -6 }, e: 'inOutBack' },
    { d: 0.5, p: { leftAngle: 13, rightAngle: 13 }, e: 'hold' },
    { d: 0.35, p: {}, e: 'outElastic' },
  ]},
  { id: 'got_your_nose', name: 'Got Your Nose!', cat: 'playful', w: 3, frames: [
    { d: 0.12, p: { ...dist(24), ...both({ sc: 1.1, lidB: 0.3 }), glintStyle: 'burst' }, e: 'outBack' },
    { d: 0.3, p: { ...dist(22), glintStyle: 'burst' }, e: 'hold' },
    { d: 0.14, p: { ...both({ lidB: 0.5, h: 42 }), glintStyle: 'cute_anime' }, e: 'outQuad' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'hide_seek', name: 'Hide & Seek', cat: 'playful', w: 3, frames: [
    { d: 0.15, p: { trackingWeight: 0, gazeBiasX: -44, ...both({ w: 12 }) }, e: 'outExpo' },
    { d: 0.3, p: { trackingWeight: 0, gazeBiasX: -46 }, e: 'hold' },
    { d: 0.08, p: both({ lidT: 1 }), e: 'snap' },
    { d: 0.35, p: both({ lidT: 1 }), e: 'hold' },
    { d: 0.12, p: { ...both({ lidT: 0, h: 52, w: 22 }), trackingWeight: 1, glintStyle: 'burst' }, e: 'outBack' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'silly_spin', name: 'Silly Eye Spin', cat: 'playful', w: 3, frames: [
    { d: 0.15, p: { leftOffsetY: -8, rightOffsetY: 8 }, e: 'inOutQuad' },
    { d: 0.15, p: { leftOffsetX: 8, rightOffsetX: -8, leftOffsetY: 0, rightOffsetY: 0 }, e: 'inOutQuad' },
    { d: 0.15, p: { leftOffsetY: 8, rightOffsetY: -8, leftOffsetX: 0, rightOffsetX: 0 }, e: 'inOutQuad' },
    { d: 0.15, p: { leftOffsetX: -8, rightOffsetX: 8, leftOffsetY: 0, rightOffsetY: 0 }, e: 'inOutQuad' },
    { d: 0.15, p: { leftOffsetY: -6, rightOffsetY: 6, leftOffsetX: 0, rightOffsetX: 0 }, e: 'inOutQuad' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'gimme_gimme', name: 'Gimme Gimme!', cat: 'playful', w: 3, frames: [
    { d: 0.12, p: { ...both({ w: 24, h: 52, sc: 1.15 }), glintStyle: 'star', eyeYOffset: -10 }, e: 'outBack' },
    { d: 0.12, p: { ...both({ sc: 1.02 }), eyeYOffset: -4 }, e: 'inQuad' },
    { d: 0.12, p: { ...both({ sc: 1.14 }), eyeYOffset: -10 }, e: 'outBack' },
    { d: 0.12, p: { ...both({ sc: 1.03 }), eyeYOffset: -5 }, e: 'inQuad' },
    { d: 0.12, p: { ...both({ sc: 1.13 }), eyeYOffset: -9 }, e: 'outBack' },
    { d: 0.35, p: {}, e: 'outElastic' },
  ]},
  { id: 'smirk_left', name: 'Cheeky Smirk', cat: 'playful', w: 4, frames: [
    { d: 0.18, p: { leftLidBottom: 0.45, leftLidTop: 0.15, rightLidTop: 0.35, leftAngle: -6, rightAngle: 10, glintStyle: 'diamond' }, e: 'outBack' },
    { d: 0.8, p: { leftLidBottom: 0.47, rightLidTop: 0.37 }, e: 'hold' },
    { d: 0.35, p: {}, e: 'outElastic' },
  ]},
  { id: 'zoomies_eyes', name: 'Zoomies Warning', cat: 'playful', w: 3, frames: [
    { d: 0.08, p: { ...both({ w: 24, h: 54, sc: 1.18 }), trackingSaccade: 6, glintStyle: 'burst' }, e: 'outExpo' },
    { d: 0.5, p: { trackingSaccade: 9, tremor: 1.4, glintStyle: 'burst' }, e: 'linear' },
    { d: 0.12, p: { ...both({ w: 12, h: 40 }), trackingSaccade: 0 }, e: 'inQuad' },
    { d: 0.35, p: {}, e: 'outElastic' },
  ]},
  { id: 'puppy_beg', name: 'Begging Eyes', cat: 'playful', w: 3, frames: [
    { d: 0.3, p: { ...both({ w: 26, h: 55, sc: 1.2 }), ...dist(33), gazeBiasY: -12, trackingWeight: 0.3, glintStyle: 'cute_anime', glintIntensity: 1.9, breath: 1.8 }, e: 'outBack' },
    { d: 1.2, p: { ...both({ sc: 1.18 }), glintStyle: 'cute_anime', breath: 2 }, e: 'linear' },
    { d: 0.45, p: {}, e: 'outQuad' },
  ]},
  { id: 'ta_da', name: 'Ta-Da Reveal', cat: 'playful', w: 3, frames: [
    { d: 0.1, p: both({ lidT: 0.8 }), e: 'inQuad' },
    { d: 0.12, p: { ...both({ lidT: 0, w: 25, h: 56, sc: 1.22 }), glintStyle: 'burst', glintIntensity: 2, eyeYOffset: -10 }, e: 'outBack' },
    { d: 0.6, p: { ...both({ sc: 1.18 }), glintStyle: 'burst' }, e: 'hold' },
    { d: 0.45, p: { glintStyle: 'star' }, e: 'outElastic' },
  ]},
  { id: 'psst_secret', name: 'Psst… a Secret', cat: 'playful', w: 3, frames: [
    { d: 0.2, p: { trackingWeight: 0.1, gazeBiasX: -34, ...both({ lidT: 0.4, w: 15 }) }, e: 'outCubic' },
    { d: 0.3, p: { trackingWeight: 0.1, gazeBiasX: -36 }, e: 'hold' },
    { d: 0.12, p: { rightLidTop: 1, trackingWeight: 0.6, gazeBiasX: -10, glintStyle: 'diamond' }, e: 'outBack' },
    { d: 0.3, p: { rightLidTop: 1 }, e: 'hold' },
    { d: 0.3, p: {}, e: 'outElastic' },
  ]},
  { id: 'chase_tail', name: 'Chasing Own Tail', cat: 'playful', w: 3, frames: [
    { d: 0.18, p: { trackingWeight: 0, gazeBiasX: 30, gazeBiasY: 12 }, e: 'inOutQuad' },
    { d: 0.18, p: { trackingWeight: 0, gazeBiasX: 12, gazeBiasY: 26 }, e: 'linear' },
    { d: 0.18, p: { trackingWeight: 0, gazeBiasX: -22, gazeBiasY: 16 }, e: 'linear' },
    { d: 0.18, p: { trackingWeight: 0, gazeBiasX: -28, gazeBiasY: -10 }, e: 'linear' },
    { d: 0.18, p: { trackingWeight: 0, gazeBiasX: -4, gazeBiasY: -24 }, e: 'linear' },
    { d: 0.18, p: { trackingWeight: 0, gazeBiasX: 26, gazeBiasY: -12 }, e: 'linear' },
    { d: 0.4, p: { trackingWeight: 1, ...both({ sc: 1.1 }), glintStyle: 'spiral' }, e: 'outElastic' },
  ]},
  { id: 'uwu_max', name: 'UwU Overload', cat: 'playful', w: 3, frames: [
    { d: 0.2, p: { ...both({ lidB: 0.6, lidT: 0.12, h: 46, w: 24 }), glintStyle: 'cute_anime', glintIntensity: 1.8 }, e: 'outBack' },
    { d: 0.25, p: { ...both({ sc: 1.15 }), glintStyle: 'heart' }, e: 'inOutQuad' },
    { d: 0.25, p: { ...both({ sc: 1.05 }), glintStyle: 'cute_anime' }, e: 'inOutQuad' },
    { d: 0.25, p: { ...both({ sc: 1.14 }), glintStyle: 'heart' }, e: 'inOutQuad' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'drumroll', name: 'Drumroll Please', cat: 'playful', w: 3, frames: [
    { d: 0.1, p: { eyeYOffset: -10, ...both({ w: 15 }) }, e: 'outQuad' },
    { d: 0.08, p: { eyeYOffset: -2 }, e: 'inQuad' },
    { d: 0.08, p: { eyeYOffset: -9 }, e: 'outQuad' },
    { d: 0.08, p: { eyeYOffset: -3 }, e: 'inQuad' },
    { d: 0.08, p: { eyeYOffset: -8 }, e: 'outQuad' },
    { d: 0.08, p: { eyeYOffset: -4 }, e: 'inQuad' },
    { d: 0.15, p: { ...both({ w: 24, h: 54, sc: 1.2 }), glintStyle: 'burst' }, e: 'outBack' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'jazz_hands', name: 'Jazz Eyes', cat: 'playful', w: 3, frames: [
    { d: 0.14, p: { leftAngle: -18, rightAngle: 18, ...both({ w: 22, h: 50 }), glintStyle: 'star', ...dist(46) }, e: 'outBack' },
    { d: 0.14, p: { leftAngle: 16, rightAngle: -16, ...dist(40) }, e: 'inOutQuad' },
    { d: 0.14, p: { leftAngle: -14, rightAngle: 14, ...dist(46) }, e: 'inOutQuad' },
    { d: 0.14, p: { leftAngle: 12, rightAngle: -12, ...dist(42) }, e: 'inOutQuad' },
    { d: 0.4, p: { glintStyle: 'burst' }, e: 'outElastic' },
  ]},
  { id: 'nose_cross', name: 'Nose-Watching Cross', cat: 'playful', w: 3, frames: [
    { d: 0.25, p: { ...dist(18), leftOffsetX: 10, rightOffsetX: -10, gazeBiasY: 14, trackingWeight: 0.1, ...both({ sc: 1.06 }) }, e: 'outBack' },
    { d: 0.7, p: { ...dist(17), leftOffsetX: 11, rightOffsetX: -11, trackingWeight: 0.1 }, e: 'hold' },
    { d: 0.16, p: { ...both({ lidT: 0.6 }) }, e: 'inQuad' },
    { d: 0.35, p: {}, e: 'outElastic' },
  ]},
  { id: 'happy_wiggle', name: 'Happy Wiggle Dance', cat: 'playful', w: 4, frames: [
    { d: 0.13, p: { leftAngle: -10, rightAngle: -10, ...both({ lidB: 0.4 }), glintStyle: 'cute_anime' }, e: 'inOutQuad' },
    { d: 0.13, p: { leftAngle: 10, rightAngle: 10 }, e: 'inOutQuad' },
    { d: 0.13, p: { leftAngle: -9, rightAngle: -9 }, e: 'inOutQuad' },
    { d: 0.13, p: { leftAngle: 9, rightAngle: 9 }, e: 'inOutQuad' },
    { d: 0.13, p: { leftAngle: -7, rightAngle: -7 }, e: 'inOutQuad' },
    { d: 0.35, p: {}, e: 'outElastic' },
  ]},

  /* ---- wary (10) ---- */
  { id: 'trust_issues', name: 'Trust Issues', cat: 'wary', w: 3, frames: [
    { d: 0.3, p: { ...both({ lidT: 0.5, w: 16 }), trackingDamping: 0.2, browAngle: 12 }, e: 'outCubic' },
    { d: 0.25, p: { ...dist(48), ...both({ lidT: 0.55 }) }, e: 'inOutQuad' },
    { d: 0.7, p: { ...dist(50), trackingSaccade: 2 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'gaslight_check', name: 'Wait… What?', cat: 'wary', w: 3, frames: [
    { d: 0.15, p: { ...both({ h: 50, w: 20 }) }, e: 'outExpo' },
    { d: 0.3, p: { leftLidTop: 0.55, rightLidTop: 0.1, leftAngle: 10 }, e: 'outCubic' },
    { d: 0.5, p: { leftLidTop: 0.58, rightLidTop: 0.08, browAngle: 10 }, e: 'hold' },
    { d: 0.2, p: { leftLidTop: 0.1, rightLidTop: 0.55, leftAngle: 0, rightAngle: -10 }, e: 'inOutQuad' },
    { d: 0.5, p: { rightLidTop: 0.58 }, e: 'hold' },
    { d: 0.35, p: {}, e: 'outQuad' },
  ]},
  { id: 'small_step_back', name: 'Cautious Step Back', cat: 'wary', w: 3, frames: [
    { d: 0.2, p: { ...both({ sc: 0.88, w: 13 }), ...dist(46), eyeYOffset: -2 }, e: 'outCubic' },
    { d: 0.6, p: { ...both({ sc: 0.86 }), trackingDamping: 0.18 }, e: 'linear' },
    { d: 0.45, p: {}, e: 'outElastic' },
  ]},
  { id: 'polygraph', name: 'Polygraph Stare', cat: 'wary', w: 3, frames: [
    { d: 0.3, p: { ...both({ w: 15, h: 46, lidT: 0.2 }), trackingDamping: 0.24, glintStyle: 'ring', glintIntensity: 0.8 }, e: 'inOutCubic' },
    { d: 1.3, p: { trackingDamping: 0.26, glintStyle: 'ring' }, e: 'linear' },
    { d: 0.45, p: {}, e: 'outQuad' },
  ]},
  { id: 'over_shoulder', name: 'Over-Shoulder Check', cat: 'wary', w: 3, frames: [
    { d: 0.12, p: { trackingWeight: 0, gazeBiasX: -46, ...both({ w: 12 }) }, e: 'outExpo' },
    { d: 0.4, p: { trackingWeight: 0, gazeBiasX: -48 }, e: 'hold' },
    { d: 0.1, p: { trackingWeight: 0, gazeBiasX: 46 }, e: 'outExpo' },
    { d: 0.4, p: { trackingWeight: 0, gazeBiasX: 48 }, e: 'hold' },
    { d: 0.14, p: { trackingWeight: 1, ...both({ h: 46 }) }, e: 'outBack' },
    { d: 0.35, p: {}, e: 'outQuad' },
  ]},
  { id: 'bristle', name: 'Bristling Guard', cat: 'wary', w: 3, frames: [
    { d: 0.1, p: { ...both({ w: 18, h: 48, lidT: 0.3 }), browAngle: 16, ...dist(44), tremor: 1 }, e: 'outExpo' },
    { d: 0.8, p: { browAngle: 18, tremor: 1.3, trackingDamping: 0.2 }, e: 'linear' },
    { d: 0.45, p: {}, e: 'outCubic' },
  ]},
  { id: 'slow_lean_in', name: 'Interrogating Lean-In', cat: 'wary', w: 3, frames: [
    { d: 0.6, p: { ...dist(30), ...both({ w: 18, lidT: 0.42 }), eyeYOffset: 0, trackingDamping: 0.2, browAngle: 12 }, e: 'inOutCubic' },
    { d: 0.9, p: { ...dist(28), ...both({ lidT: 0.45 }) }, e: 'hold' },
    { d: 0.45, p: {}, e: 'outBack' },
  ]},
  { id: 'poker_face', name: 'Poker Face', cat: 'wary', w: 4, frames: [
    { d: 0.35, p: { ...both({ w: 15, h: 40 }), glintIntensity: 0.25, trackingDamping: 0.09, breath: 0.5 }, e: 'inOutCubic' },
    { d: 1.6, p: { glintIntensity: 0.2, breath: 0.4 }, e: 'hold' },
    { d: 0.5, p: {}, e: 'outQuad' },
  ]},
  { id: 'micro_flinch', name: 'Micro Flinch', cat: 'wary', w: 4, frames: [
    { d: 0.04, p: { ...both({ lidT: 0.5, sc: 0.92 }) }, e: 'snap' },
    { d: 0.18, p: { ...both({ lidT: 0.15 }) }, e: 'outQuad' },
    { d: 0.3, p: {}, e: 'outCubic' },
  ]},
  { id: 'grudge_hold', name: 'Holding a Grudge', cat: 'wary', w: 3, frames: [
    { d: 0.3, p: { ...both({ lidT: 0.5 }), leftAngle: 14, rightAngle: -14, browAngle: 15, glintIntensity: 0.4 }, e: 'outCubic' },
    { d: 0.25, p: { trackingWeight: 0.2, gazeBiasX: 26 }, e: 'inOutQuad' },
    { d: 0.7, p: { trackingWeight: 0.2, gazeBiasX: 28, ...both({ lidT: 0.55 }) }, e: 'hold' },
    { d: 0.45, p: {}, e: 'outQuad' },
  ]},

  /* ---- tech (12) ---- */
  { id: 'barcode_scan', name: 'Barcode Scanner', cat: 'tech', w: 3, frames: [
    { d: 0.15, p: { ...both({ w: 24, h: 46 }), glintStyle: 'scan_bar', trackingWeight: 0.3 }, e: 'outExpo' },
    { d: 0.25, p: { trackingWeight: 0, gazeBiasX: -30, glintStyle: 'scan_bar' }, e: 'inOutQuad' },
    { d: 0.3, p: { trackingWeight: 0, gazeBiasX: 30, glintStyle: 'scan_bar' }, e: 'linear' },
    { d: 0.25, p: { trackingWeight: 0, gazeBiasX: -26, glintStyle: 'scan_bar' }, e: 'linear' },
    { d: 0.2, p: { ...both({ sc: 1.12 }), glintStyle: 'burst', trackingWeight: 1 }, e: 'outBack' },
    { d: 0.35, p: {}, e: 'outQuad' },
  ]},
  { id: 'satellite_link', name: 'Satellite Uplink', cat: 'tech', w: 3, frames: [
    { d: 0.3, p: { trackingWeight: 0, gazeBiasY: -32, ...both({ w: 14, h: 48 }), glintStyle: 'ring' }, e: 'inOutCubic' },
    { d: 1.0, p: { trackingWeight: 0, gazeBiasY: -34, glintStyle: 'ring', glintIntensity: 1.5 }, e: 'linear' },
    { d: 0.2, p: { glintStyle: 'matrix', trackingWeight: 1 }, e: 'outExpo' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'encrypt_mode', name: 'Encryption Cipher', cat: 'tech', w: 3, frames: [
    { d: 0.12, p: { glintStyle: 'matrix', ...both({ w: 17, h: 30 }) }, e: 'snap' },
    { d: 0.12, p: { ...both({ w: 13, h: 52 }), glintStyle: 'matrix' }, e: 'snap' },
    { d: 0.12, p: { ...both({ w: 20, h: 38 }), glintStyle: 'matrix' }, e: 'snap' },
    { d: 0.12, p: { ...both({ w: 15, h: 46 }), glintStyle: 'matrix' }, e: 'snap' },
    { d: 0.4, p: { glintStyle: 'double' }, e: 'outBack' },
  ]},
  { id: 'low_battery', name: 'Low Battery Warning', cat: 'tech', w: 3, frames: [
    { d: 0.3, p: { ...both({ lidT: 0.5, h: 36 }), glintIntensity: 0.5 }, e: 'inOutQuad' },
    { d: 0.1, p: { ...both({ lidT: 0.15 }), glintStyle: 'target', glintIntensity: 1.4 }, e: 'outExpo' },
    { d: 0.25, p: { ...both({ lidT: 0.55 }), glintIntensity: 0.4 }, e: 'inQuad' },
    { d: 0.1, p: { ...both({ lidT: 0.2 }), glintStyle: 'target', glintIntensity: 1.3 }, e: 'outExpo' },
    { d: 0.4, p: { ...both({ lidT: 0.6 }), glintIntensity: 0.35, breath: 0.7 }, e: 'inOutQuad' },
    { d: 0.4, p: {}, e: 'outCubic' },
  ]},
  { id: 'wifi_search', name: 'Searching Signal', cat: 'tech', w: 3, frames: [
    { d: 0.25, p: { trackingWeight: 0, gazeBiasY: -20, gazeBiasX: -24, glintStyle: 'ring' }, e: 'outQuad' },
    { d: 0.25, p: { trackingWeight: 0, gazeBiasY: -26, gazeBiasX: 0, glintStyle: 'ring' }, e: 'inOutQuad' },
    { d: 0.25, p: { trackingWeight: 0, gazeBiasY: -20, gazeBiasX: 24, glintStyle: 'ring' }, e: 'inOutQuad' },
    { d: 0.2, p: { ...both({ sc: 1.14, h: 50 }), glintStyle: 'burst', trackingWeight: 1 }, e: 'outBack' },
    { d: 0.35, p: {}, e: 'outQuad' },
  ]},
  { id: 'defrag', name: 'Defragmenting', cat: 'tech', w: 3, frames: [
    { d: 0.14, p: { leftOffsetY: -8, rightOffsetY: 8, glintStyle: 'scan_bar' }, e: 'stagger' },
    { d: 0.14, p: { leftOffsetY: 8, rightOffsetY: -8, glintStyle: 'scan_bar' }, e: 'stagger' },
    { d: 0.14, p: { leftOffsetY: -5, rightOffsetY: 5, glintStyle: 'scan_bar' }, e: 'stagger' },
    { d: 0.14, p: { leftOffsetY: 3, rightOffsetY: -3, glintStyle: 'scan_bar' }, e: 'stagger' },
    { d: 0.35, p: { glintStyle: 'matrix' }, e: 'outBack' },
  ]},
  { id: 'laser_calibrate', name: 'Laser Calibration', cat: 'tech', w: 3, frames: [
    { d: 0.12, p: { ...both({ w: 7, h: 56 }), glintStyle: 'target', trackingDamping: 0.3 }, e: 'outExpo' },
    { d: 0.2, p: { ...both({ w: 26, h: 20 }), glintStyle: 'crosshair' }, e: 'inOutExpo' },
    { d: 0.2, p: { ...both({ w: 8, h: 54 }), glintStyle: 'target' }, e: 'inOutExpo' },
    { d: 0.6, p: { ...both({ w: 12, h: 48 }), glintStyle: 'target', trackingDamping: 0.3 }, e: 'outBack' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'radar_blip', name: 'Radar Blip Found', cat: 'tech', w: 3, frames: [
    { d: 0.5, p: { glintStyle: 'ring', ...both({ w: 20, h: 44 }), trackingWeight: 0.2, glintIntensity: 0.7 }, e: 'inOutQuad' },
    { d: 0.08, p: { ...both({ sc: 1.2 }), glintStyle: 'target', glintIntensity: 1.9, trackingWeight: 1, trackingDamping: 0.32 }, e: 'outExpo' },
    { d: 0.7, p: { ...both({ sc: 1.1 }), glintStyle: 'target' }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'compile_code', name: 'Compiling…', cat: 'tech', w: 3, frames: [
    { d: 0.3, p: { glintStyle: 'matrix', trackingWeight: 0.15, gazeBiasY: -8, ...both({ w: 18, lidT: 0.2 }) }, e: 'outCubic' },
    { d: 1.4, p: { glintStyle: 'matrix', trackingWeight: 0.1, trackingSaccade: 3, tremor: 0.5 }, e: 'linear' },
    { d: 0.15, p: { glintStyle: 'burst', ...both({ sc: 1.14, h: 50 }) }, e: 'outBack' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'error_404', name: 'Error 404', cat: 'tech', w: 2, frames: [
    { d: 0.1, p: { glintStyle: 'glitch_rgb', leftLidTop: 0.5, rightLidBottom: 0.5 }, e: 'snap' },
    { d: 0.14, p: { glintStyle: 'void', ...both({ w: 20, h: 26 }) }, e: 'stagger' },
    { d: 0.12, p: { glintStyle: 'glitch_rgb', leftOffsetX: -8, rightOffsetX: 8 }, e: 'snap' },
    { d: 0.3, p: { glintStyle: 'void', ...both({ w: 16, h: 40 }), trackingWeight: 0.2 }, e: 'outQuad' },
    { d: 0.45, p: {}, e: 'outElastic' },
  ]},
  { id: 'sync_pair', name: 'Pairing Devices', cat: 'tech', w: 3, frames: [
    { d: 0.25, p: { leftScale: 1.15, rightScale: 0.85, glintStyle: 'ring' }, e: 'inOutQuad' },
    { d: 0.25, p: { leftScale: 0.85, rightScale: 1.15, glintStyle: 'ring' }, e: 'inOutQuad' },
    { d: 0.25, p: { leftScale: 1.1, rightScale: 0.9, glintStyle: 'ring' }, e: 'inOutQuad' },
    { d: 0.2, p: { leftScale: 1.08, rightScale: 1.08, glintStyle: 'burst' }, e: 'outBack' },
    { d: 0.35, p: {}, e: 'outQuad' },
  ]},
  { id: 'stealth_cloak', name: 'Stealth Cloaking', cat: 'tech', w: 2, frames: [
    { d: 0.4, p: { glintIntensity: 0.1, ...both({ w: 13, h: 38 }), glintStyle: 'void', trackingDamping: 0.05 }, e: 'inOutCubic' },
    { d: 1.2, p: { glintIntensity: 0.08, glintStyle: 'void' }, e: 'hold' },
    { d: 0.3, p: { glintStyle: 'scan_bar', glintIntensity: 1.2 }, e: 'outExpo' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},

  /* ---- chaos (10) ---- */
  { id: 'sugar_rush', name: 'Sugar Rush', cat: 'chaos', w: 3, frames: [
    { d: 0.08, p: { ...both({ sc: 1.2, w: 23 }), trackingSaccade: 10, glintStyle: 'burst' }, e: 'outExpo' },
    { d: 0.3, p: { trackingSaccade: 13, tremor: 2.5, glintStyle: 'burst' }, e: 'linear' },
    { d: 0.1, p: { leftAngle: -15, rightAngle: 15 }, e: 'snap' },
    { d: 0.1, p: { leftAngle: 15, rightAngle: -15 }, e: 'snap' },
    { d: 0.3, p: { trackingSaccade: 8, glintStyle: 'star' }, e: 'linear' },
    { d: 0.45, p: {}, e: 'outElastic' },
  ]},
  { id: 'brain_freeze', name: 'Brain Freeze', cat: 'chaos', w: 2, frames: [
    { d: 0.06, p: { ...both({ w: 26, h: 58, sc: 1.2 }), tremor: 4 }, e: 'outExpo' },
    { d: 0.3, p: { ...both({ lidT: 0.6, lidB: 0.3 }), tremor: 4.5, leftAngle: 14, rightAngle: -14 }, e: 'snap' },
    { d: 0.5, p: { tremor: 3, ...both({ lidT: 0.55 }) }, e: 'linear' },
    { d: 0.5, p: {}, e: 'outElastic' },
  ]},
  { id: 'boing_boing', name: 'Boing Boing', cat: 'chaos', w: 3, frames: [
    { d: 0.12, p: { eyeYOffset: -16, ...both({ h: 52, sc: 1.12 }) }, e: 'outQuad' },
    { d: 0.14, p: { eyeYOffset: 6, ...both({ h: 34, sc: 0.94 }) }, e: 'outBounce' },
    { d: 0.12, p: { eyeYOffset: -13 }, e: 'outQuad' },
    { d: 0.14, p: { eyeYOffset: 5, ...both({ h: 36 }) }, e: 'outBounce' },
    { d: 0.12, p: { eyeYOffset: -9 }, e: 'outQuad' },
    { d: 0.35, p: {}, e: 'outBounce' },
  ]},
  { id: 'possessed', name: 'Briefly Possessed', cat: 'chaos', w: 1, frames: [
    { d: 0.2, p: { trackingWeight: 0, gazeBiasY: -34, ...both({ lidT: 0.3 }), glintStyle: 'void' }, e: 'inOutCubic' },
    { d: 0.6, p: { trackingWeight: 0, gazeBiasY: -36, glintStyle: 'void', tremor: 1.5 }, e: 'hold' },
    { d: 0.08, p: { ...both({ lidT: 1 }) }, e: 'snap' },
    { d: 0.15, p: { ...both({ lidT: 0 }), trackingWeight: 1, glintStyle: 'cute_anime' }, e: 'outBack' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'hiccup', name: 'Visual Hiccup', cat: 'chaos', w: 4, frames: [
    { d: 0.06, p: { eyeYOffset: -14, ...both({ sc: 1.12, lidB: 0.3 }) }, e: 'outExpo' },
    { d: 0.2, p: { eyeYOffset: -4 }, e: 'outBounce' },
    { d: 0.5, p: {}, e: 'outQuad' },
    { d: 0.06, p: { eyeYOffset: -12, ...both({ sc: 1.1 }) }, e: 'outExpo' },
    { d: 0.3, p: {}, e: 'outBounce' },
  ]},
  { id: 'tv_static', name: 'TV Static Channel', cat: 'chaos', w: 2, frames: [
    { d: 0.08, p: { glintStyle: 'glitch_rgb', ...both({ w: 24, h: 30 }), tremor: 5, glintIntensity: 1.5 }, e: 'snap' },
    { d: 0.08, p: { glintStyle: 'scan_bar', ...both({ w: 14, h: 50 }), tremor: 5 }, e: 'snap' },
    { d: 0.08, p: { glintStyle: 'glitch_rgb', ...both({ w: 20, h: 36 }), tremor: 5 }, e: 'snap' },
    { d: 0.08, p: { glintStyle: 'scan_bar', ...both({ w: 12, h: 54 }), tremor: 5 }, e: 'snap' },
    { d: 0.1, p: { glintStyle: 'void', tremor: 0 }, e: 'hold' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'earthquake', name: 'Personal Earthquake', cat: 'chaos', w: 2, frames: [
    { d: 0.1, p: { tremor: 7, ...both({ sc: 1.05 }), leftOffsetY: -4, rightOffsetY: 4 }, e: 'snap' },
    { d: 0.7, p: { tremor: 7.5, leftOffsetY: 4, rightOffsetY: -4 }, e: 'linear' },
    { d: 0.2, p: { tremor: 2 }, e: 'outQuad' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'moth_to_light', name: 'Moth to a Light', cat: 'chaos', w: 3, frames: [
    { d: 0.2, p: { trackingWeight: 0, gazeBiasX: 24, gazeBiasY: -20, glintIntensity: 1.6, glintStyle: 'star' }, e: 'outQuad' },
    { d: 0.14, p: { trackingWeight: 0, gazeBiasX: 30, gazeBiasY: -14 }, e: 'inOutQuad' },
    { d: 0.14, p: { trackingWeight: 0, gazeBiasX: 22, gazeBiasY: -24 }, e: 'inOutQuad' },
    { d: 0.14, p: { trackingWeight: 0, gazeBiasX: 32, gazeBiasY: -18 }, e: 'inOutQuad' },
    { d: 0.14, p: { trackingWeight: 0, gazeBiasX: 26, gazeBiasY: -22 }, e: 'inOutQuad' },
    { d: 0.4, p: { trackingWeight: 1 }, e: 'outCubic' },
  ]},
  { id: 'rubber_face', name: 'Rubber Stretch', cat: 'chaos', w: 2, frames: [
    { d: 0.2, p: { leftWidth: 8 * W, leftHeight: 60 * H, rightWidth: 26 * W, rightHeight: 24 * H }, e: 'inOutBack' },
    { d: 0.25, p: { leftWidth: 26 * W, leftHeight: 24 * H, rightWidth: 8 * W, rightHeight: 60 * H }, e: 'inOutBack' },
    { d: 0.2, p: { leftWidth: 12 * W, leftHeight: 50 * H, rightWidth: 20 * W, rightHeight: 34 * H }, e: 'inOutQuad' },
    { d: 0.45, p: {}, e: 'outElastic' },
  ]},
  { id: 'gravity_flip', name: 'Gravity Flip', cat: 'chaos', w: 2, frames: [
    { d: 0.2, p: { eyeYOffset: -16, leftAngle: 30, rightAngle: -30, ...both({ lidB: 0.3 }) }, e: 'inOutBack' },
    { d: 0.4, p: { eyeYOffset: -18, leftAngle: 32, rightAngle: -32 }, e: 'hold' },
    { d: 0.25, p: { eyeYOffset: 6, leftAngle: -6, rightAngle: 6 }, e: 'outBounce' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},

  /* ---- rare (10) ---- */
  { id: 'aurora_gaze', name: 'Aurora Watching', cat: 'rare', w: 1, frames: [
    { d: 0.6, p: { trackingWeight: 0, gazeBiasY: -30, ...both({ w: 24, h: 54, sc: 1.1 }), glintStyle: 'diamond', glintIntensity: 1.7, breath: 2 }, e: 'inOutCubic' },
    { d: 1.0, p: { trackingWeight: 0, gazeBiasY: -32, gazeBiasX: -14, glintStyle: 'diamond' }, e: 'inOutQuad' },
    { d: 1.0, p: { trackingWeight: 0, gazeBiasY: -30, gazeBiasX: 14, glintStyle: 'diamond' }, e: 'inOutQuad' },
    { d: 0.7, p: {}, e: 'inOutCubic' },
  ]},
  { id: 'deja_vu', name: 'Déjà Vu', cat: 'rare', w: 1, frames: [
    { d: 0.15, p: { ...both({ h: 50 }) }, e: 'outQuad' },
    { d: 0.08, p: { glintStyle: 'glitch_rgb', leftOffsetX: -4, rightOffsetX: 4 }, e: 'snap' },
    { d: 0.3, p: { ...both({ h: 50 }) }, e: 'outQuad' },
    { d: 0.08, p: { glintStyle: 'glitch_rgb', leftOffsetX: -4, rightOffsetX: 4 }, e: 'snap' },
    { d: 0.3, p: { ...both({ w: 20, lidT: 0.3 }), glintStyle: 'spiral' }, e: 'outCubic' },
    { d: 0.5, p: {}, e: 'outQuad' },
  ]},
  { id: 'moon_trance', name: 'Moonlight Trance', cat: 'rare', w: 1, frames: [
    { d: 0.8, p: { ...both({ w: 24, h: 24 }), glintStyle: 'ring', glintIntensity: 1.4, trackingWeight: 0.05, breath: 2.2 }, e: 'inOutExpo' },
    { d: 1.8, p: { ...both({ w: 24, h: 24 }), glintStyle: 'ring', trackingWeight: 0.05 }, e: 'linear' },
    { d: 0.7, p: {}, e: 'outBack' },
  ]},
  { id: 'butterfly_land', name: 'Butterfly Landing', cat: 'rare', w: 1, frames: [
    { d: 0.1, p: { ...both({ h: 54, w: 22 }), trackingWeight: 0, gazeBiasY: -8, gazeBiasX: 10 }, e: 'outExpo' },
    { d: 0.5, p: { trackingWeight: 0, gazeBiasY: -6, gazeBiasX: 12, tremor: 0.4, glintStyle: 'cute_anime' }, e: 'hold' },
    { d: 0.4, p: { trackingWeight: 0, gazeBiasX: 14, ...both({ lidB: 0.3 }), glintStyle: 'star', breath: 0.5 }, e: 'inOutCubic' },
    { d: 0.5, p: { trackingWeight: 0, gazeBiasY: -20, gazeBiasX: 4, glintStyle: 'star' }, e: 'inOutQuad' },
    { d: 0.5, p: { trackingWeight: 1 }, e: 'outCubic' },
  ]},
  { id: 'snow_globe', name: 'Snow Globe Wonder', cat: 'rare', w: 1, frames: [
    { d: 0.4, p: { ...both({ w: 25, h: 52, sc: 1.14 }), glintStyle: 'burst', glintIntensity: 1.6 }, e: 'outBack' },
    { d: 0.5, p: { trackingWeight: 0.2, gazeBiasY: 12, glintStyle: 'star' }, e: 'inOutQuad' },
    { d: 0.5, p: { trackingWeight: 0.2, gazeBiasY: -10, glintStyle: 'star' }, e: 'inOutQuad' },
    { d: 0.5, p: { trackingWeight: 0.2, gazeBiasY: 8, glintStyle: 'star' }, e: 'inOutQuad' },
    { d: 0.5, p: {}, e: 'inOutCubic' },
  ]},
  { id: 'eclipse', name: 'Total Eclipse', cat: 'rare', w: 1, frames: [
    { d: 0.7, p: { ...both({ w: 22, h: 22 }), glintStyle: 'void', glintIntensity: 0.3, trackingWeight: 0 }, e: 'inOutExpo' },
    { d: 0.8, p: { ...both({ w: 22, h: 22 }), glintStyle: 'void', trackingWeight: 0 }, e: 'hold' },
    { d: 0.25, p: { ...both({ w: 24, h: 24 }), glintStyle: 'diamond', glintIntensity: 2 }, e: 'outExpo' },
    { d: 0.6, p: {}, e: 'outBack' },
  ]},
  { id: 'fortune_teller', name: 'Fortune Teller', cat: 'rare', w: 1, frames: [
    { d: 0.5, p: { ...both({ w: 23, h: 23 }), glintStyle: 'spiral', trackingWeight: 0.1, glintIntensity: 1.5 }, e: 'inOutCubic' },
    { d: 0.6, p: { leftScale: 1.12, rightScale: 0.9, glintStyle: 'spiral' }, e: 'inOutQuad' },
    { d: 0.6, p: { leftScale: 0.9, rightScale: 1.12, glintStyle: 'spiral' }, e: 'inOutQuad' },
    { d: 0.3, p: { ...both({ h: 52, w: 16 }), glintStyle: 'diamond' }, e: 'outBack' },
    { d: 0.5, p: {}, e: 'outQuad' },
  ]},
  { id: 'first_snow', name: 'First Snow Joy', cat: 'rare', w: 1, frames: [
    { d: 0.12, p: { ...both({ w: 25, h: 56, sc: 1.2 }), glintStyle: 'star', eyeYOffset: -12, glintIntensity: 1.8 }, e: 'outExpo' },
    { d: 0.3, p: { trackingWeight: 0.2, gazeBiasY: 14, glintStyle: 'star' }, e: 'inOutQuad' },
    { d: 0.3, p: { trackingWeight: 0.2, gazeBiasY: -12, glintStyle: 'star' }, e: 'inOutQuad' },
    { d: 0.3, p: { trackingWeight: 0.2, gazeBiasY: 10, ...both({ lidB: 0.4 }), glintStyle: 'cute_anime' }, e: 'inOutQuad' },
    { d: 0.5, p: {}, e: 'outElastic' },
  ]},
  { id: 'library_whisper', name: 'Library Whisper', cat: 'rare', w: 1, frames: [
    { d: 0.25, p: { ...both({ w: 13, lidT: 0.35 }), trackingWeight: 0.1, gazeBiasX: -30 }, e: 'outCubic' },
    { d: 0.4, p: { trackingWeight: 0.1, gazeBiasX: -32 }, e: 'hold' },
    { d: 0.2, p: { trackingWeight: 0.1, gazeBiasX: 30 }, e: 'inOutQuad' },
    { d: 0.4, p: { trackingWeight: 0.1, gazeBiasX: 32 }, e: 'hold' },
    { d: 0.15, p: { rightLidTop: 1, trackingWeight: 0.8, glintStyle: 'diamond' }, e: 'outBack' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  /* ================================================================
   *  SOCIAL — reactions aimed at another creature
   * ================================================================ */
  { id: 'soc_greet', name: 'Delighted Greeting', cat: 'emotion', w: 3, frames: [
    { d: 0.12, p: { ...both({ w: 25, h: 54, sc: 1.2 }), glintStyle: 'burst', glintIntensity: 1.8, eyeYOffset: -11 }, e: 'outExpo' },
    { d: 0.18, p: { ...both({ sc: 1.05 }), glintStyle: 'star' }, e: 'inOutQuad' },
    { d: 0.18, p: { ...both({ sc: 1.18, lidB: 0.4 }), glintStyle: 'cute_anime' }, e: 'outBack' },
    { d: 0.45, p: { ...both({ lidB: 0.42 }), glintStyle: 'cute_anime', breath: 1.9 }, e: 'hold' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_glare', name: 'Withering Glare', cat: 'wary', w: 3, frames: [
    { d: 0.16, p: { ...both({ lidT: 0.58, w: 19, h: 42 }), leftAngle: 20, rightAngle: -20, browAngle: 22, glintStyle: 'void', glintIntensity: 0.3 }, e: 'outBack' },
    { d: 1.1, p: { ...both({ lidT: 0.6 }), leftAngle: 21, rightAngle: -21, glintStyle: 'void', tremor: 0.7 }, e: 'hold' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'soc_sideeye', name: 'Sizing Them Up', cat: 'wary', w: 3, frames: [
    { d: 0.24, p: { trackingWeight: 0.12, gazeBiasX: -40, ...both({ lidT: 0.48 }), browAngle: 12 }, e: 'outCubic' },
    { d: 0.5, p: { trackingWeight: 0.12, gazeBiasX: -42 }, e: 'hold' },
    { d: 0.2, p: { trackingWeight: 0.12, gazeBiasY: -18, ...both({ lidT: 0.35 }) }, e: 'inOutQuad' },
    { d: 0.3, p: { trackingWeight: 0.12, gazeBiasY: 16 }, e: 'inOutQuad' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'soc_sparkle_eyes', name: 'Sparkling at Them', cat: 'emotion', w: 3, frames: [
    { d: 0.22, p: { ...both({ w: 24, h: 52, sc: 1.16 }), glintStyle: 'star', glintIntensity: 1.9, breath: 1.7 }, e: 'outBack' },
    { d: 0.9, p: { ...both({ sc: 1.14 }), glintStyle: 'heart', glintIntensity: 2, breath: 2 }, e: 'linear' },
    { d: 0.45, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'soc_smirk_at', name: 'Smirking at Them', cat: 'playful', w: 3, frames: [
    { d: 0.18, p: { leftLidBottom: 0.5, rightLidTop: 0.38, leftAngle: -7, rightAngle: 11, glintStyle: 'diamond' }, e: 'outBack' },
    { d: 0.7, p: { leftLidBottom: 0.52, rightLidTop: 0.4 }, e: 'hold' },
    { d: 0.35, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_challenge', name: 'Issuing a Challenge', cat: 'wary', w: 2, frames: [
    { d: 0.1, p: { ...both({ w: 13, h: 52, lidT: 0.18 }), glintStyle: 'target', trackingDamping: 0.3, browAngle: 16 }, e: 'outExpo' },
    { d: 0.25, p: { ...both({ sc: 1.14 }), glintStyle: 'target' }, e: 'outBack' },
    { d: 0.8, p: { ...both({ sc: 1.08 }), glintStyle: 'crosshair', tremor: 0.9 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'soc_shy_peek', name: 'Shy Peek at Them', cat: 'emotion', w: 3, frames: [
    { d: 0.2, p: { ...both({ lidT: 0.72 }), trackingWeight: 0.2, gazeBiasX: 22 }, e: 'inOutCubic' },
    { d: 0.3, p: { ...both({ lidT: 0.5 }), trackingWeight: 0.4, gazeBiasX: 10 }, e: 'outQuad' },
    { d: 0.25, p: { ...both({ lidT: 0.78 }), trackingWeight: 0.2, gazeBiasX: 26 }, e: 'inOutQuad' },
    { d: 0.3, p: { ...both({ lidT: 0.2 }), glintStyle: 'cute_anime' }, e: 'outBack' },
    { d: 0.35, p: {}, e: 'outQuad' },
  ]},
  { id: 'soc_mimic', name: 'Mimicking Them', cat: 'playful', w: 3, frames: [
    { d: 0.16, p: { leftScale: 1.22, rightScale: 0.84, leftAngle: -10 }, e: 'outBack' },
    { d: 0.2, p: { leftScale: 0.84, rightScale: 1.22, leftAngle: 10, rightAngle: -10 }, e: 'inOutQuad' },
    { d: 0.2, p: { leftScale: 1.18, rightScale: 0.88, leftAngle: -8 }, e: 'inOutQuad' },
    { d: 0.35, p: { glintStyle: 'double' }, e: 'outElastic' },
  ]},
  { id: 'soc_tag_thrill', name: 'Tag Thrill', cat: 'playful', w: 3, frames: [
    { d: 0.07, p: { ...both({ w: 24, h: 56, sc: 1.2 }), trackingSaccade: 7, glintStyle: 'burst' }, e: 'outExpo' },
    { d: 0.4, p: { trackingSaccade: 10, tremor: 1.6, glintStyle: 'burst' }, e: 'linear' },
    { d: 0.35, p: { glintStyle: 'star' }, e: 'outElastic' },
  ]},
  { id: 'soc_panic_flee', name: 'Fleeing Panic', cat: 'chaos', w: 2, frames: [
    { d: 0.06, p: { ...both({ w: 11, h: 34, sc: 0.84 }), ...dist(48), tremor: 3 }, e: 'outExpo' },
    { d: 0.6, p: { ...both({ sc: 0.86 }), tremor: 3.4, trackingSaccade: 9 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_warm_gaze', name: 'Warm Mutual Gaze', cat: 'emotion', w: 3, frames: [
    { d: 0.45, p: { ...both({ lidB: 0.4, h: 46, w: 21 }), glintStyle: 'cute_anime', glintIntensity: 1.4, breath: 1.9 }, e: 'inOutCubic' },
    { d: 1.4, p: { ...both({ lidB: 0.42 }), glintStyle: 'heart', breath: 2.1 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'soc_scoff', name: 'Unimpressed Scoff', cat: 'wary', w: 3, frames: [
    { d: 0.14, p: { ...both({ lidT: 0.52, lidB: 0.24 }), glintIntensity: 0.35 }, e: 'outQuad' },
    { d: 0.2, p: { trackingWeight: 0.2, gazeBiasY: -22, ...both({ lidT: 0.6 }) }, e: 'inOutQuad' },
    { d: 0.45, p: { trackingWeight: 0.2, gazeBiasX: 28, gazeBiasY: -10 }, e: 'inOutQuad' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'soc_startled_by', name: 'Startled by Them', cat: 'emotion', w: 3, frames: [
    { d: 0.05, p: { ...both({ w: 26, h: 58, sc: 1.24 }), glintStyle: 'ring', eyeYOffset: -12 }, e: 'outExpo' },
    { d: 0.35, p: { ...both({ sc: 1.18 }), tremor: 2, trackingSaccade: 6 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_stare_lock', name: 'Unbreaking Stare', cat: 'wary', w: 2, frames: [
    { d: 0.3, p: { ...both({ w: 14, h: 50, lidT: 0.12 }), trackingDamping: 0.26, glintStyle: 'ring', glintIntensity: 0.9, breath: 0.4 }, e: 'inOutCubic' },
    { d: 1.8, p: { ...both({ h: 50 }), glintStyle: 'ring', tremor: 0.5, breath: 0.3 }, e: 'hold' },
    { d: 0.4, p: {}, e: 'outBack' },
  ]},
  { id: 'soc_proud_show', name: 'Showing Off', cat: 'playful', w: 3, frames: [
    { d: 0.14, p: { ...both({ w: 22, h: 50, lidT: 0.14 }), glintStyle: 'diamond', glintIntensity: 1.7, browAngle: -8 }, e: 'outBack' },
    { d: 0.25, p: { leftAngle: -12, rightAngle: 12, ...both({ sc: 1.12 }) }, e: 'inOutQuad' },
    { d: 0.25, p: { leftAngle: 12, rightAngle: -12 }, e: 'inOutQuad' },
    { d: 0.4, p: { glintStyle: 'burst' }, e: 'outElastic' },
  ]},
  { id: 'soc_worried_check', name: 'Checking On Them', cat: 'emotion', w: 3, frames: [
    { d: 0.28, p: { ...both({ w: 22, h: 48, lidT: 0.2 }), leftAngle: -6, rightAngle: 6, glintIntensity: 1.2 }, e: 'outCubic' },
    { d: 0.5, p: { trackingSaccade: 3, ...both({ h: 48 }) }, e: 'linear' },
    { d: 0.4, p: {}, e: 'inOutQuad' },
  ]},

  { id: 'soc_love_heartbeat', name: 'Beating Heart Eyes', cat: 'emotion', w: 3, frames: [
    { d: 0.16, p: { ...both({ w: 25, h: 54, sc: 1.22 }), glintStyle: 'heart', glintIntensity: 2.0 }, e: 'outBack' },
    { d: 0.22, p: { ...both({ sc: 1.06 }), glintStyle: 'heart' }, e: 'inOutQuad' },
    { d: 0.18, p: { ...both({ sc: 1.25 }), glintStyle: 'heart' }, e: 'outBack' },
    { d: 0.7, p: { ...both({ lidB: 0.38 }), glintStyle: 'heart', breath: 2.2 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_jealous_narrow', name: 'Jealous Narrowing', cat: 'wary', w: 3, frames: [
    { d: 0.2, p: { leftLidTop: 0.65, rightLidTop: 0.35, leftAngle: 15, rightAngle: -8, browAngle: 18, glintStyle: 'void' }, e: 'outBack' },
    { d: 0.8, p: { leftLidTop: 0.68, rightLidTop: 0.38, tremor: 0.8 }, e: 'hold' },
    { d: 0.35, p: {}, e: 'outQuad' },
  ]},
  { id: 'soc_gasp_shock', name: 'Gasping at Partner', cat: 'emotion', w: 3, frames: [
    { d: 0.05, p: { ...both({ w: 27, h: 62, sc: 1.26 }), eyeYOffset: -13, glintStyle: 'star' }, e: 'outExpo' },
    { d: 0.45, p: { ...both({ sc: 1.22 }), tremor: 1.4, glintStyle: 'star' }, e: 'linear' },
    { d: 0.45, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_conspire_wink', name: 'Conspiratorial Wink', cat: 'playful', w: 3, frames: [
    { d: 0.1, p: { leftLidTop: 1, rightScale: 1.2, rightAngle: 8, glintStyle: 'diamond' }, e: 'outBack' },
    { d: 0.45, p: { leftLidTop: 1, rightScale: 1.18 }, e: 'hold' },
    { d: 0.3, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_mocking_tongue', name: 'Teasing Taunt', cat: 'playful', w: 3, frames: [
    { d: 0.14, p: { leftAngle: -16, rightAngle: -16, leftOffsetX: -5, rightOffsetX: 5, ...both({ lidB: 0.45 }), glintStyle: 'cute_anime' }, e: 'outBack' },
    { d: 0.55, p: { leftAngle: 14, rightAngle: 14, leftOffsetX: 5, rightOffsetX: -5 }, e: 'inOutQuad' },
    { d: 0.35, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_comfort_soft', name: 'Comforting Gaze', cat: 'emotion', w: 4, frames: [
    { d: 0.45, p: { ...both({ lidT: 0.38, lidB: 0.35, h: 44 }), leftAngle: -5, rightAngle: 5, glintStyle: 'cute_anime', breath: 2.1 }, e: 'inOutCubic' },
    { d: 1.4, p: { ...both({ lidB: 0.38 }), breath: 2.3 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'soc_admire_star', name: 'Starry Admiration', cat: 'emotion', w: 3, frames: [
    { d: 0.18, p: { ...both({ w: 25, h: 54, sc: 1.2 }), glintStyle: 'star', glintIntensity: 2.0 }, e: 'outBack' },
    { d: 1.1, p: { ...both({ sc: 1.18 }), glintStyle: 'burst', breath: 2.0 }, e: 'linear' },
    { d: 0.45, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_pout_sulky', name: 'Sulky Pout', cat: 'wary', w: 3, frames: [
    { d: 0.3, p: { ...both({ lidT: 0.52, lidB: 0.28 }), leftAngle: 12, rightAngle: -12, browAngle: 14, gazeBiasX: -36 }, e: 'outCubic' },
    { d: 1.1, p: { gazeBiasX: -38, ...both({ lidT: 0.55 }) }, e: 'hold' },
    { d: 0.45, p: {}, e: 'outQuad' },
  ]},
  { id: 'soc_triumph_dance', name: 'Triumphant Laugh Eyes', cat: 'playful', w: 3, frames: [
    { d: 0.12, p: { ...both({ lidB: 0.6, lidT: 0.1, h: 46 }), leftAngle: -10, rightAngle: 10, glintStyle: 'burst' }, e: 'outBack' },
    { d: 0.15, p: { leftAngle: 10, rightAngle: -10 }, e: 'inOutQuad' },
    { d: 0.15, p: { leftAngle: -10, rightAngle: 10 }, e: 'inOutQuad' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_shy_blush', name: 'Bashful Blush Glance', cat: 'emotion', w: 3, frames: [
    { d: 0.25, p: { ...both({ lidT: 0.45, h: 42 }), gazeBiasX: 24, gazeBiasY: 18, glintStyle: 'cute_anime' }, e: 'outCubic' },
    { d: 0.08, p: { ...both({ lidT: 0.98 }) }, e: 'snap' },
    { d: 0.12, p: { ...both({ lidT: 0.4 }) }, e: 'outQuad' },
    { d: 0.6, p: { gazeBiasX: 26, gazeBiasY: 20 }, e: 'hold' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'soc_protective_glare', name: 'Protective Guard Stare', cat: 'wary', w: 3, frames: [
    { d: 0.12, p: { ...both({ w: 21, h: 48, lidT: 0.42 }), browAngle: 22, leftAngle: 18, rightAngle: -18, glintStyle: 'target' }, e: 'outExpo' },
    { d: 1.2, p: { browAngle: 24, tremor: 0.9, glintStyle: 'target' }, e: 'linear' },
    { d: 0.45, p: {}, e: 'outCubic' },
  ]},
  { id: 'soc_hypno_sync', name: 'Hypnotic Sync', cat: 'chaos', w: 2, frames: [
    { d: 0.3, p: { ...both({ w: 24, h: 44 }), glintStyle: 'spiral', glintIntensity: 1.8 }, e: 'outBack' },
    { d: 1.3, p: { glintStyle: 'spiral', leftAngle: -8, rightAngle: 8 }, e: 'linear' },
    { d: 0.45, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_laugh_tears', name: 'Laughing Till Sparkles', cat: 'playful', w: 3, frames: [
    { d: 0.14, p: { ...both({ lidB: 0.62, lidT: 0.15, h: 48 }), glintStyle: 'burst', eyeYOffset: -6 }, e: 'outBack' },
    { d: 0.7, p: { ...both({ lidB: 0.64 }), tremor: 1.6, glintStyle: 'burst' }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_curious_sniff', name: 'Quick Sniff Inspection', cat: 'attention', w: 3, frames: [
    { d: 0.1, p: { ...both({ w: 22, h: 36 }), ...dist(26), eyeYOffset: 6 }, e: 'outBack' },
    { d: 0.1, p: { eyeYOffset: 2 }, e: 'inQuad' },
    { d: 0.1, p: { eyeYOffset: 7 }, e: 'outBack' },
    { d: 0.35, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_apology_puppy', name: 'Apologetic Puppy Eyes', cat: 'emotion', w: 3, frames: [
    { d: 0.3, p: { ...both({ w: 26, h: 56, sc: 1.18 }), ...dist(32), gazeBiasY: -12, glintStyle: 'cute_anime', glintIntensity: 1.9, breath: 1.8 }, e: 'outBack' },
    { d: 1.2, p: { ...both({ sc: 1.16 }), breath: 2.1 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'outQuad' },
  ]},
  { id: 'soc_forgive_warm', name: 'Warm Forgiveness', cat: 'emotion', w: 3, frames: [
    { d: 0.35, p: { ...both({ lidT: 0.75 }) }, e: 'inOutCubic' },
    { d: 0.35, p: { ...both({ lidT: 0.18, lidB: 0.42, h: 46 }), glintStyle: 'heart', glintIntensity: 1.8 }, e: 'outBack' },
    { d: 0.8, p: { glintStyle: 'heart', breath: 2.0 }, e: 'linear' },
    { d: 0.45, p: {}, e: 'outQuad' },
  ]},
  { id: 'soc_secret_nod', name: 'Secret Nod', cat: 'playful', w: 2, frames: [
    { d: 0.08, p: { eyeYOffset: 12, ...both({ lidT: 0.6 }) }, e: 'snap' },
    { d: 0.14, p: { eyeYOffset: -4, ...both({ lidT: 0.1 }) }, e: 'outBack' },
    { d: 0.1, p: { leftLidTop: 1, glintStyle: 'diamond' }, e: 'snap' },
    { d: 0.35, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_rivalry_fire', name: 'Rivalry Spark', cat: 'wary', w: 2, frames: [
    { d: 0.1, p: { ...both({ w: 18, h: 52, lidT: 0.28 }), leftAngle: 14, rightAngle: -14, browAngle: 18, glintStyle: 'burst', glintIntensity: 1.9 }, e: 'outExpo' },
    { d: 0.9, p: { browAngle: 20, tremor: 1.1, glintStyle: 'burst' }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'soc_dizzy_together', name: 'Dizzy After Waltz', cat: 'chaos', w: 2, frames: [
    { d: 0.15, p: { leftOffsetY: -8, rightOffsetY: 8, leftAngle: -14, rightAngle: 14, glintStyle: 'spiral' }, e: 'outBack' },
    { d: 0.25, p: { leftOffsetY: 8, rightOffsetY: -8, leftAngle: 14, rightAngle: -14 }, e: 'inOutQuad' },
    { d: 0.25, p: { leftOffsetY: -5, rightOffsetY: 5 }, e: 'inOutQuad' },
    { d: 0.45, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_sleepy_cuddle', name: 'Sleepy Cuddle Eyes', cat: 'idle', w: 3, frames: [
    { d: 0.55, p: { ...both({ lidT: 0.82, lidB: 0.15 }), leftAngle: -4, rightAngle: 4, glintStyle: 'sleepy_z', breath: 2.2 }, e: 'inOutCubic' },
    { d: 1.6, p: { ...both({ lidT: 0.85 }), breath: 2.4 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'outQuad' },
  ]},
  /* ---- wave 3: eyes for the richer shared activities ---- */
  { id: 'soc_race_focus', name: 'Racing Determination', cat: 'attention', w: 3, frames: [
    { d: 0.1, p: { ...both({ w: 12, h: 54, lidT: 0.16 }), glintStyle: 'target', trackingDamping: 0.32, browAngle: 14 }, e: 'outExpo' },
    { d: 0.15, p: { ...both({ sc: 1.14 }), tremor: 1.4 }, e: 'outBack' },
    { d: 0.9, p: { ...both({ sc: 1.08 }), tremor: 1.6, trackingSaccade: 4 }, e: 'linear' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_guard_vigil', name: 'Watchful Vigil', cat: 'wary', w: 3, frames: [
    { d: 0.35, p: { ...both({ w: 19, h: 46, lidT: 0.34 }), browAngle: 16, trackingDamping: 0.2, glintStyle: 'crosshair' }, e: 'inOutCubic' },
    { d: 0.25, p: { trackingWeight: 0.2, gazeBiasX: -26 }, e: 'inOutQuad' },
    { d: 0.25, p: { trackingWeight: 0.2, gazeBiasX: 26 }, e: 'inOutQuad' },
    { d: 0.6, p: { glintStyle: 'crosshair', tremor: 0.6 }, e: 'hold' },
    { d: 0.4, p: {}, e: 'outQuad' },
  ]},
  { id: 'soc_gift_proud', name: 'Proud Offering', cat: 'emotion', w: 3, frames: [
    { d: 0.14, p: { ...both({ w: 23, h: 52, sc: 1.16, lidT: 0.14 }), glintStyle: 'diamond', glintIntensity: 1.8, browAngle: -10 }, e: 'outBack' },
    { d: 0.22, p: { leftAngle: -10, rightAngle: 10 }, e: 'inOutQuad' },
    { d: 0.7, p: { glintStyle: 'diamond', breath: 1.8 }, e: 'hold' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_gift_touched', name: 'Touched by the Gesture', cat: 'emotion', w: 3, frames: [
    { d: 0.12, p: { ...both({ w: 26, h: 56, sc: 1.2 }) }, e: 'outExpo' },
    { d: 0.4, p: { ...both({ lidT: 0.55, lidB: 0.3, h: 44 }), glintStyle: 'heart', glintIntensity: 1.9, breath: 2.1 }, e: 'inOutCubic' },
    { d: 1.1, p: { glintStyle: 'heart', breath: 2.3 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'inOutQuad' },
  ]},
  { id: 'soc_push_strain', name: 'Straining Against Them', cat: 'wary', w: 3, frames: [
    { d: 0.12, p: { ...both({ lidT: 0.55, w: 21, h: 40 }), leftAngle: 16, rightAngle: -16, browAngle: 20, tremor: 2.4 }, e: 'inBack' },
    { d: 0.8, p: { tremor: 3, leftAngle: 17, rightAngle: -17, glintStyle: 'void' }, e: 'linear' },
    { d: 0.45, p: {}, e: 'outCubic' },
  ]},
  { id: 'soc_peekaboo_reveal', name: 'Peek-a-BOO!', cat: 'playful', w: 4, frames: [
    { d: 0.16, p: both({ lidT: 1 }), e: 'inQuad' },
    { d: 0.4, p: both({ lidT: 1 }), e: 'hold' },
    { d: 0.07, p: { ...both({ lidT: 0, w: 26, h: 58, sc: 1.24 }), glintStyle: 'burst', glintIntensity: 2, eyeYOffset: -11 }, e: 'outExpo' },
    { d: 0.55, p: { glintStyle: 'cute_anime' }, e: 'outElastic' },
  ]},
  { id: 'soc_sync_spin_dizzy', name: 'Shared Dizzy Spin', cat: 'chaos', w: 3, frames: [
    { d: 0.2, p: { glintStyle: 'spiral', leftOffsetX: -7, rightOffsetX: 7, leftAngle: -12, rightAngle: 12 }, e: 'outBack' },
    { d: 1.1, p: { glintStyle: 'spiral', leftOffsetX: 6, rightOffsetX: -6, leftAngle: 10, rightAngle: -10, tremor: 1.2 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_showoff_grin', name: 'Show-Off Grin', cat: 'playful', w: 4, frames: [
    { d: 0.13, p: { leftLidBottom: 0.55, rightLidTop: 0.14, leftAngle: -9, rightAngle: 13, glintStyle: 'star', glintIntensity: 1.9 }, e: 'outBack' },
    { d: 0.16, p: { leftLidBottom: 0.3, rightLidBottom: 0.5, leftAngle: 11, rightAngle: -9 }, e: 'inOutQuad' },
    { d: 0.16, p: { leftLidBottom: 0.55, rightLidTop: 0.16, leftAngle: -8, rightAngle: 12 }, e: 'inOutQuad' },
    { d: 0.55, p: { glintStyle: 'burst' }, e: 'hold' },
    { d: 0.4, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_impressed_wow', name: 'Genuinely Impressed', cat: 'emotion', w: 3, frames: [
    { d: 0.1, p: { ...both({ w: 25, h: 58, sc: 1.22 }), glintStyle: 'star', glintIntensity: 2.0, eyeYOffset: -11 }, e: 'outExpo' },
    { d: 0.2, p: { ...both({ sc: 1.16 }), ...dist(30), glintStyle: 'star' }, e: 'outBack' },
    { d: 0.85, p: { ...both({ lidB: 0.3 }), glintStyle: 'heart', breath: 1.9 }, e: 'linear' },
    { d: 0.45, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_cheer_hype', name: 'Hype Cheer', cat: 'playful', w: 3, frames: [
    { d: 0.09, p: { ...both({ w: 24, h: 56, sc: 1.2, lidB: 0.3 }), glintStyle: 'burst', eyeYOffset: -10 }, e: 'outBack' },
    { d: 0.11, p: { ...both({ sc: 1.0 }), eyeYOffset: -2 }, e: 'inQuad' },
    { d: 0.09, p: { ...both({ sc: 1.18 }), eyeYOffset: -9 }, e: 'outBack' },
    { d: 0.11, p: { ...both({ sc: 1.0 }), eyeYOffset: -3 }, e: 'inQuad' },
    { d: 0.09, p: { ...both({ sc: 1.16 }), eyeYOffset: -8 }, e: 'outBack' },
    { d: 0.4, p: { glintStyle: 'star' }, e: 'outElastic' },
  ]},
  { id: 'soc_cheered_up', name: 'Cheered Right Up', cat: 'emotion', w: 3, frames: [
    { d: 0.35, p: { ...both({ lidT: 0.6, h: 38 }), glintIntensity: 0.5 }, e: 'inOutCubic' },
    { d: 0.2, p: { ...both({ lidT: 0.1, h: 52, w: 24, sc: 1.18 }), glintStyle: 'star', glintIntensity: 1.9 }, e: 'outBack' },
    { d: 0.9, p: { ...both({ lidB: 0.35 }), glintStyle: 'cute_anime', breath: 2.0 }, e: 'linear' },
    { d: 0.5, p: {}, e: 'outElastic' },
  ]},
  { id: 'soc_shared_curiosity', name: 'Curious Together', cat: 'attention', w: 4, frames: [
    { d: 0.2, p: { ...both({ w: 23, h: 50, sc: 1.12 }), leftScale: 1.16, rightScale: 1.06, glintStyle: 'double' }, e: 'outBack' },
    { d: 0.3, p: { trackingDamping: 0.26, trackingSaccade: 2 }, e: 'linear' },
    { d: 0.3, p: { leftScale: 1.06, rightScale: 1.16 }, e: 'inOutQuad' },
    { d: 0.5, p: { glintStyle: 'cute_anime' }, e: 'outElastic' },
  ]},

  { id: 'time_stop', name: 'Time Stop', cat: 'rare', w: 1, frames: [
    { d: 0.06, p: { ...both({ w: 25, h: 58, sc: 1.22 }), tremor: 0, trackingWeight: 0, glintStyle: 'ring', glintIntensity: 1.8, breath: 0 }, e: 'outExpo' },
    { d: 1.4, p: { ...both({ w: 25, h: 58 }), trackingWeight: 0, glintStyle: 'ring', breath: 0 }, e: 'hold' },
    { d: 0.1, p: { ...both({ sc: 0.95 }), trackingWeight: 1, glintStyle: 'burst' }, e: 'outExpo' },
    { d: 0.5, p: {}, e: 'outElastic' },
  ]},
];

/* ------------------------------------------------------------------
 * 5. PROCEDURAL VARIANT GENERATOR
 * ------------------------------------------------------------------ */

const GLINTS: GlintStyle[] = [
  'standard', 'double', 'star', 'heart', 'matrix', 'crosshair',
  'target', 'cute_anime', 'ring', 'spiral', 'sleepy_z', 'burst',
  'glitch_rgb', 'scan_bar', 'void', 'diamond',
];

const ADJ = ['Drifting', 'Silent', 'Curious', 'Restless', 'Velvet', 'Electric', 'Hollow', 'Gentle', 'Sharp', 'Fleeting', 'Lucid', 'Quiet', 'Wild', 'Amber', 'Frozen', 'Molten'];
const NOUN = ['Glance', 'Study', 'Pulse', 'Sweep', 'Regard', 'Flicker', 'Watch', 'Focus', 'Reverie', 'Signal', 'Trace', 'Notion', 'Impulse', 'Cadence'];

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** Builds a fresh, never-before-seen behavior out of random building blocks. */
export function generateProceduralBehavior(): BehaviorDef {
  const name = `${pick(ADJ)} ${pick(NOUN)}`;
  const glint = pick(GLINTS);
  const asym = Math.random() > 0.55;
  const wide = Math.random() > 0.5;
  const framesCount = 2 + Math.floor(Math.random() * 3);
  const eases: Ease[] = ['outBack', 'outCubic', 'inOutCubic', 'outElastic', 'outExpo', 'inOutQuad', 'snap', 'outQuart'];

  const frames: Frame[] = [];
  for (let i = 0; i < framesCount; i++) {
    const w = wide ? rnd(19, 26) : rnd(11, 18);
    const h = wide ? rnd(44, 58) : rnd(30, 44);
    frames.push({
      d: rnd(0.16, 0.55),
      e: pick(eases),
      p: {
        leftWidth: w * W * (asym ? rnd(0.85, 1.15) : 1),
        rightWidth: w * W,
        leftHeight: h * H * (asym ? rnd(0.85, 1.15) : 1),
        rightHeight: h * H,
        leftLidTop: Math.random() > 0.6 ? rnd(0, 0.6) : 0,
        rightLidTop: Math.random() > 0.6 ? rnd(0, 0.6) : 0,
        leftLidBottom: Math.random() > 0.78 ? rnd(0, 0.4) : 0,
        rightLidBottom: Math.random() > 0.78 ? rnd(0, 0.4) : 0,
        leftAngle: asym ? rnd(-14, 14) : 0,
        rightAngle: asym ? rnd(-14, 14) : 0,
        leftScale: rnd(0.9, 1.18),
        rightScale: rnd(0.9, 1.18),
        pupilDistance: rnd(30, 46) * D,
        eyeYOffset: rnd(-12, 4),
        trackingWeight: Math.random() > 0.7 ? rnd(0, 0.5) : 1,
        gazeBiasX: Math.random() > 0.65 ? rnd(-38, 38) : 0,
        gazeBiasY: Math.random() > 0.7 ? rnd(-26, 24) : 0,
        trackingSaccade: Math.random() > 0.7 ? rnd(2, 9) : 0,
        tremor: Math.random() > 0.82 ? rnd(1, 3) : 0,
        breath: rnd(1, 2),
        glintIntensity: rnd(0.6, 1.7),
        glintStyle: glint,
      },
    });
  }
  frames.push({ d: rnd(0.3, 0.5), p: {}, e: 'outCubic' });

  return { id: `proc_${Math.random().toString(36).slice(2, 8)}`, name, cat: 'idle', frames };
}

/* mood → behavior pools -------------------------------------------- */
const MOOD_MAP: Record<EyeMood, string[]> = {
  neutral: ['idle_breathe', 'settle_down', 'content_rest'],
  curious: ['tilt_study', 'brow_raise', 'double_take', 'up_ponder'],
  sleepy: ['doze_off', 'yawn_big', 'deep_sleep', 'meditate'],
  surprised: ['surprise_flare', 'startle_snap', 'shock_freeze'],
  suspicious: ['suspicious_slit', 'side_eye', 'skeptical', 'narrow_threat'],
  dizzy: ['dizzy_spiral', 'wobble_drunk', 'spin_out', 'vertigo'],
  happy: ['joy_sparkle', 'happy_arc', 'excited_bounce', 'kawaii_max'],
  wink: ['wink_left', 'wink_right', 'wink_combo', 'giggle_shake'],
  scanning: ['radar_sweep', 'scan_grid', 'slow_scan_idle', 'targeting_grid'],
  matrix: ['matrix_scan', 'data_upload', 'night_vision', 'boot_sequence'],
  laser_lock: ['lock_on', 'targeting_grid', 'super_focus', 'determined'],
  heart: ['love_struck', 'heart_explosion', 'adoring', 'wink_flirt'],
  shocked: ['shock_freeze', 'startle_snap', 'recoil', 'freeze_alert'],
  angry: ['angry_furrow', 'rage_burn', 'cold_glare', 'disapprove'],
  focused: ['determined', 'depth_focus', 'super_focus', 'hyper_track'],
  dazed: ['wobble_drunk', 'melt_down', 'desync', 'x_eyes'],
};

/* ------------------------------------------------------------------
 * 6. THE ENGINE
 * ------------------------------------------------------------------ */

export class EyeBehaviorEngine {
  private current: EyeShapeParams = defaultParams();
  private from: EyeShapeParams = defaultParams();
  private target: EyeShapeParams = defaultParams();

  private active: BehaviorDef | null = null;
  private frameIdx = 0;
  private frameT = 0;
  private mood: EyeMood = 'neutral';
  private name = 'Organic Cursor Tracking';
  private history: string[] = [];
  private playCount = 0;

  /* ---- public API ---- */

  getParams(): EyeShapeParams { return this.current; }
  getBehaviorName(): string { return this.name; }
  getMood(): EyeMood { return this.mood; }
  getCategory(): BehaviorCategory | 'tracking' { return this.active?.cat ?? 'tracking'; }
  getPlayCount(): number { return this.playCount; }
  static get libraryCount(): number { return BEHAVIORS.length; }

  /** Total distinct authored routines + procedural space estimate */
  static get totalVariants(): string {
    return `${BEHAVIORS.length}+`;
  }

  play(def: BehaviorDef) {
    this.active = def;
    this.name = def.name;
    this.frameIdx = 0;
    this.frameT = 0;
    this.from = { ...this.current };
    this.target = this.resolveFrame(def.frames[0]);
    this.playCount++;
    this.history.unshift(def.id);
    if (this.history.length > 8) this.history.pop();
  }

  playById(id: string): boolean {
    const def = BEHAVIORS.find((b) => b.id === id);
    if (!def) return false;
    this.play(def);
    return true;
  }

  playCategory(cat: BehaviorCategory) {
    const pool = BEHAVIORS.filter((b) => b.cat === cat);
    if (pool.length) this.play(this.weightedPick(pool));
  }

  /** Weighted random pick that avoids recently played routines. */
  triggerRandomBehavior() {
    // 12% chance to roll a brand-new procedural routine
    if (Math.random() < 0.12) {
      this.play(generateProceduralBehavior());
      return;
    }
    const fresh = BEHAVIORS.filter((b) => !this.history.includes(b.id));
    this.play(this.weightedPick(fresh.length > 12 ? fresh : BEHAVIORS));
  }

  setMood(mood: EyeMood, nameOverride?: string) {
    this.mood = mood;
    const pool = MOOD_MAP[mood] ?? [];
    const id = pool[Math.floor(Math.random() * pool.length)];
    const def = BEHAVIORS.find((b) => b.id === id);
    if (def) {
      this.play(def);
      if (nameOverride) this.name = nameOverride;
    } else if (nameOverride) {
      this.name = nameOverride;
    }
  }

  /** Legacy compatibility */
  applyBehaviorByName(id: string) {
    if (!this.playById(id)) this.triggerRandomBehavior();
  }

  update(dt: number) {
    if (!this.active) {
      // relax to defaults when nothing is playing
      this.blendToward(defaultParams(), Math.min(1, dt * 4));
      return;
    }

    const frames = this.active.frames;
    const frame = frames[this.frameIdx];
    this.frameT += dt;

    const u = Math.min(1, this.frameT / Math.max(0.0001, frame.d));
    const eased = EASE[frame.e ?? 'inOutQuad'](u);

    for (const k of NUMERIC_KEYS) {
      const a = this.from[k] as number;
      const b = this.target[k] as number;
      (this.current[k] as number) = a + (b - a) * eased;
    }
    this.current.glintStyle = this.target.glintStyle;

    if (u >= 1) {
      this.frameIdx++;
      this.frameT = 0;
      this.from = { ...this.current };
      if (this.frameIdx >= frames.length) {
        if (this.active.loop) {
          this.frameIdx = 0;
          this.target = this.resolveFrame(frames[0]);
        } else {
          this.active = null;
          this.name = 'Organic Cursor Tracking';
          this.target = defaultParams();
        }
      } else {
        this.target = this.resolveFrame(frames[this.frameIdx]);
      }
    }
  }

  /* ---- internals ---- */

  private resolveFrame(f: Frame): EyeShapeParams {
    return { ...defaultParams(), ...f.p } as EyeShapeParams;
  }

  private weightedPick(pool: BehaviorDef[]): BehaviorDef {
    const total = pool.reduce((s, b) => s + (b.w ?? 3), 0);
    let r = Math.random() * total;
    for (const b of pool) {
      r -= b.w ?? 3;
      if (r <= 0) return b;
    }
    return pool[pool.length - 1];
  }

  private blendToward(t: EyeShapeParams, amt: number) {
    for (const k of NUMERIC_KEYS) {
      const a = this.current[k] as number;
      (this.current[k] as number) = a + ((t[k] as number) - a) * amt;
    }
    this.current.glintStyle = t.glintStyle;
  }
}
