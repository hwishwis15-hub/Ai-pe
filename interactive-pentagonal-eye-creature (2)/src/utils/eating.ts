// ============================================================
//  PENTA — Eating & Savouring System
//  Multi-phase, never-repeating food enjoyment:
//  notice → approach → nibble → chew → savour → afterglow
//  Every phase has randomised sub-beats, so no two meals look alike.
// ============================================================

export type EatPhase =
  | 'idle'
  | 'notice'    // spots the food, eyes flare
  | 'sniff'     // hovers over it, inspecting
  | 'bite'      // the actual chomp
  | 'chew'      // rhythmic squash with random tempo
  | 'savour'    // blissed-out, eyes closed, slow sway
  | 'afterglow' // sparkles, contentment, slow return
  | 'greedy';   // wants more, looks around

export interface EatStyle {
  /** how many chew beats */
  chewCount: number;
  /** seconds per chew beat */
  chewTempo: number;
  /** how deep the squash goes */
  chewDepth: number;
  /** savour duration */
  savourDur: number;
  /** does it wiggle side to side while savouring */
  swayAmp: number;
  swaySpeed: number;
  /** spin/tilt flourish on the bite */
  biteSpin: number;
  /** little hop on the bite */
  biteHop: number;
  /** eye routine picked for the savour phase */
  savourEyes: string;
  /** afterglow sparkle burst count */
  sparkles: number;
  /** does it do a happy shiver at the end */
  shiver: number;
  /** gulp pitch */
  pitch: number;
  /** does it get greedy and look for more */
  greedy: boolean;
}

export interface EatState {
  phase: EatPhase;
  t: number;
  phaseDur: number;
  style: EatStyle;
  beat: number;
  foodX: number;
  foodY: number;
  foodColor: string;
  /** true if this particular bite is disliked — triggers nausea very rarely */
  disliked: boolean;
  /** accumulated output for the body */
  squash: number;
  tilt: number;
  lift: number;
  /** one-shot flags the canvas consumes */
  emitCrumbs: boolean;
  emitSparkle: boolean;
  emitHearts: boolean;
  playGulp: boolean;
  playCrunch: boolean;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

/** Every meal gets a freshly randomised "style" — this is what stops repetition */
export function rollEatStyle(): EatStyle {
  const gusto = Math.random(); // overall enthusiasm for THIS meal
  return {
    chewCount: Math.round(rnd(2, 7) + gusto * 3),
    chewTempo: rnd(0.09, 0.26) * (1.3 - gusto * 0.5),
    chewDepth: rnd(0.10, 0.30) * (0.7 + gusto * 0.7),
    savourDur: rnd(0.5, 2.1) * (0.6 + gusto),
    swayAmp: Math.random() < 0.65 ? rnd(0.04, 0.22) : 0,
    swaySpeed: rnd(1.6, 5.5),
    biteSpin: (Math.random() - 0.5) * rnd(0.1, 0.65),
    biteHop: Math.random() < 0.55 ? rnd(8, 34) * (0.5 + gusto) : 0,
    savourEyes: pick([
      'emotion', 'emotion', 'playful', 'happy', 'rare', 'idle',
    ]),
    sparkles: Math.round(rnd(3, 14) * (0.4 + gusto)),
    shiver: Math.random() < 0.45 ? rnd(0.05, 0.2) : 0,
    pitch: rnd(0.75, 1.5),
    greedy: Math.random() < 0.35,
  };
}

/** Rolls whether THIS bite is disliked — very rare, and only if not already full */
export function rollDisliked(fullness: number): boolean {
  // base 4%, rises to ~10% when very full, children a bit pickier handled by caller
  const base = 0.04 + fullness * 0.06;
  return Math.random() < base;
}

export function beginEating(x: number, y: number, color: string, disliked = false): EatState {
  const style = rollEatStyle();
  return {
    phase: 'notice',
    t: 0,
    phaseDur: rnd(0.08, 0.3),
    style,
    beat: 0,
    foodX: x,
    foodY: y,
    foodColor: color,
    disliked,
    squash: 0,
    tilt: 0,
    lift: 0,
    emitCrumbs: false,
    emitSparkle: false,
    emitHearts: false,
    playGulp: false,
    playCrunch: false,
  };
}

/** Advances the meal. Returns true while still eating. */
export function stepEating(e: EatState, dt: number): boolean {
  e.t += dt;
  e.emitCrumbs = false;
  e.emitSparkle = false;
  e.emitHearts = false;
  e.playGulp = false;
  e.playCrunch = false;

  const S = e.style;
  const p = Math.min(1, e.t / Math.max(0.0001, e.phaseDur));

  switch (e.phase) {
    case 'notice': {
      // quick anticipatory stretch upward
      e.lift = -Math.sin(p * Math.PI) * rnd(3, 6);
      e.squash = -Math.sin(p * Math.PI) * 0.06;
      if (p >= 1) advance(e, 'sniff', rnd(0.12, 0.55));
      break;
    }

    case 'sniff': {
      // small erratic bobbing while inspecting
      e.lift = Math.sin(e.t * rnd(9, 13)) * 2.2;
      e.tilt = Math.sin(e.t * 4.2) * 0.05;
      e.squash = 0.02 * Math.sin(e.t * 7);
      if (p >= 1) {
        advance(e, 'bite', rnd(0.1, 0.2));
        e.playCrunch = true;
        e.emitCrumbs = true;
      }
      break;
    }

    case 'bite': {
      // sharp compress + optional hop and spin flourish
      const k = Math.sin(p * Math.PI);
      e.squash = k * rnd(0.28, 0.42);
      e.lift = -k * S.biteHop;
      e.tilt = k * S.biteSpin;
      if (p >= 1) {
        advance(e, 'chew', S.chewTempo);
        e.beat = 0;
      }
      break;
    }

    case 'chew': {
      // rhythmic but tempo-jittered squash beats
      const k = Math.sin(p * Math.PI);
      const dir = e.beat % 2 === 0 ? 1 : -0.6;
      e.squash = k * S.chewDepth * dir;
      e.tilt = k * (e.beat % 2 === 0 ? 0.05 : -0.05) * (S.swayAmp > 0 ? 1 : 0.4);
      e.lift = -k * 3;
      if (p >= 1) {
        e.beat++;
        if (Math.random() < 0.12) e.emitCrumbs = true;
        if (e.beat >= S.chewCount) {
          advance(e, 'savour', S.savourDur);
          e.playGulp = true;
          e.emitHearts = Math.random() < 0.55;
        } else {
          // each beat gets its own jittered tempo — never metronomic
          advance(e, 'chew', S.chewTempo * rnd(0.65, 1.5));
        }
      }
      break;
    }

    case 'savour': {
      // slow blissful sway + gentle breathing squash
      e.squash = Math.sin(e.t * 2.1) * 0.07 - 0.03;
      e.tilt = Math.sin(e.t * S.swaySpeed) * S.swayAmp;
      e.lift = Math.sin(e.t * 1.7) * 4;
      if (Math.random() < 0.05) e.emitSparkle = true;
      if (p >= 1) advance(e, 'afterglow', rnd(0.4, 1.2));
      break;
    }

    case 'afterglow': {
      // sparkle burst then settle, optional happy shiver
      const shiver = S.shiver ? Math.sin(e.t * 34) * S.shiver * (1 - p) : 0;
      e.squash = shiver;
      e.tilt = shiver * 0.5;
      e.lift = -(1 - p) * 3;
      if (Math.random() < 0.14) e.emitSparkle = true;
      if (p >= 1) {
        if (S.greedy) advance(e, 'greedy', rnd(0.4, 1.3));
        else { e.phase = 'idle'; return false; }
      }
      break;
    }

    case 'greedy': {
      // looks around hoping for more
      e.tilt = Math.sin(e.t * 3.4) * 0.12;
      e.lift = Math.sin(e.t * 2.2) * 3;
      e.squash = 0;
      if (p >= 1) { e.phase = 'idle'; return false; }
      break;
    }

    default:
      return false;
  }

  return true;
}

function advance(e: EatState, phase: EatPhase, dur: number) {
  e.phase = phase;
  e.t = 0;
  e.phaseDur = dur;
}

/** Eye category the meal wants at this moment */
export function eatEyeCue(e: EatState): string | null {
  switch (e.phase) {
    case 'notice': return 'surprised';
    case 'bite': return 'happy';
    case 'savour': return e.style.savourEyes;
    case 'greedy': return 'attention';
    default: return null;
  }
}
