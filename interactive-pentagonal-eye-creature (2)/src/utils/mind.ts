// ============================================================
//  PENTA — Autonomous Mind v3  "Cortex"
//  Personality traits · utility-based goal selection ·
//  multi-step planning · salience perception · memory ·
//  energy budget · wilful ignoring · reinforcement learning
// ============================================================

import { Personality } from './actions';

export type MindState =
  | 'serene' | 'curious' | 'playful' | 'hyper' | 'drowsy' | 'moody';

export type StepKind = 'action' | 'eyes' | 'eyesRandom' | 'eyesProc' | 'wait' | 'jump' | 'hop';

export interface PlanStep {
  kind: StepKind;
  /** action id or eye-category */
  ref?: string;
  dur?: number;
  power?: number;
}

export interface Decision {
  type: 'none' | 'plan' | 'jump' | 'hop' | 'eyes' | 'eyesRandom' | 'eyesProc' | 'action';
  actionId?: string;
  cat?: string;
  power?: number;
  /** human-readable intention shown in the HUD */
  intent?: string;
  plan?: PlanStep[];
}

export interface Perception {
  cursorDist: number;
  cursorSpeed: number;
  cursorMoving: boolean;
  idleTime: number;
  foodNear: number;
  laserActive: boolean;
  canTravel: boolean;
  energy: number;
  atEdge: boolean;
  recentlyPoked: number; // seconds since last poke
  /** 0…1 — how much it wants company right now */
  socialPull: number;
  /** how the mood knobs are tuned */
  moodVolatility: number;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function weightedPick<T>(pairs: [T, number][]): T {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [v, w] of pairs) {
    r -= w;
    if (r <= 0) return v;
  }
  return pairs[pairs.length - 1][0];
}

/* ------------------------------------------------------------------ */
/*  TEMPERAMENT PROFILES                                               */
/* ------------------------------------------------------------------ */

interface Temperament {
  /** trait bias applied while deciding */
  bias: Partial<Personality>;
  /** seconds between self-initiated plans */
  gap: [number, number];
  dwell: [number, number];
  /** preferred action families */
  actions: [string, number][];
  eyes: [string, number][];
  chain: number;
  jump: number;
  hop: number;
}

const TEMPERAMENTS: Record<MindState, Temperament> = {
  serene: {
    bias: { diligence: 0.1, boldness: -0.05, playfulness: -0.1 },
    gap: [3.5, 10],
    dwell: [12, 26],
    actions: [['drift_away', 5], ['settle', 5], ['perch_center', 3], ['patrol', 2], ['bounce_rhythm', 2]],
    eyes: [['idle', 6], ['blink', 4], ['rare', 1]],
    chain: 0.05, jump: 0.004, hop: 0.01,
  },
  curious: {
    bias: { curiosity: 0.15 },
    gap: [1.8, 5.5],
    dwell: [9, 20],
    actions: [['approach', 6], ['inspect_corner', 4], ['shadow', 3], ['orbit', 3], ['patrol', 2], ['peek_edge', 2]],
    eyes: [['attention', 5], ['blink', 3], ['playful', 1]],
    chain: 0.18, jump: 0.012, hop: 0.05,
  },
  playful: {
    bias: { playfulness: 0.18, sociability: 0.08 },
    gap: [1.2, 3.6],
    dwell: [7, 15],
    actions: [['provoke', 5], ['orbit', 4], ['nuzzle', 4], ['zoomies', 3], ['circle_strafe', 3], ['follow', 3], ['spin_dash', 2]],
    eyes: [['playful', 6], ['emotion', 2], ['chaos', 1]],
    chain: 0.3, jump: 0.05, hop: 0.15,
  },
  hyper: {
    bias: { playfulness: 0.25, boldness: 0.1, diligence: -0.1 },
    gap: [0.5, 1.9],
    dwell: [4, 9],
    actions: [['zoomies', 6], ['dash_through', 4], ['spin_dash', 3], ['provoke', 3], ['circle_strafe', 3], ['flee', 1]],
    eyes: [['chaos', 5], ['tech', 3], ['playful', 3]],
    chain: 0.45, jump: 0.11, hop: 0.22,
  },
  drowsy: {
    bias: { diligence: -0.2, boldness: -0.1, curiosity: -0.1 },
    gap: [3.0, 9],
    dwell: [14, 30],
    actions: [['settle', 6], ['stalker_pause', 2], ['drift_away', 3], ['perch_center', 2]],
    eyes: [['idle', 7], ['blink', 3]],
    chain: 0.06, jump: 0.002, hop: 0.004,
  },
  moody: {
    bias: { boldness: -0.1, sociability: -0.1 },
    gap: [2.2, 6.5],
    dwell: [8, 18],
    actions: [['retreat', 4], ['peek_edge', 3], ['stalker_pause', 3], ['inspect_corner', 3], ['mirror', 2], ['drift_away', 2]],
    eyes: [['wary', 5], ['emotion', 4], ['blink', 2]],
    chain: 0.12, jump: 0.006, hop: 0.02,
  },
};

const TRANSITIONS: Record<MindState, [MindState, number][]> = {
  serene: [['curious', 4], ['drowsy', 3], ['playful', 2], ['moody', 1]],
  curious: [['playful', 4], ['serene', 3], ['moody', 2], ['hyper', 1]],
  playful: [['hyper', 3], ['curious', 3], ['serene', 2], ['moody', 1]],
  hyper: [['playful', 4], ['curious', 3], ['drowsy', 2], ['moody', 1]],
  drowsy: [['serene', 5], ['curious', 2], ['moody', 1]],
  moody: [['serene', 3], ['curious', 3], ['drowsy', 2], ['playful', 1]],
};

/* ------------------------------------------------------------------ */
/*  THE CORTEX                                                         */
/* ------------------------------------------------------------------ */

export class Cortex {
  /* ---- personality (drifts with experience) ---- */
  personality: Personality = {
    boldness: 0.5, sociability: 0.55, playfulness: 0.55, diligence: 0.5, curiosity: 0.65,
  };

  state: MindState = 'curious';
  /** current intention label for the HUD */
  intent = 'Observing the room';

  private stateT = 0;
  private stateDur = rnd(9, 20);
  private tempo = 1;

  private plan: PlanStep[] = [];
  private planIdx = 0;
  private stepT = 0;
  private activeActionId: string | null = null;

  private cooldown = 0;      // refractory before next self-plan
  private nextPlanAt = rnd(2, 5);
  private clock = 0;

  private boredom = 0;
  private energy = 1;

  /* ---- memory ---- */
  private pokeCount = 0;
  private lastPokeAt = -99;
  private clickHabit: number[] = [];   // inter-click intervals
  private ignoredClicks = 0;
  private honoredClicks = 0;
  private recentActions: string[] = [];

  /* ---------------- public API ---------------- */

  getState() { return this.state; }
  getIntent() { return this.intent; }
  getEnergy() { return this.energy; }
  getPersonality() { return this.personality; }
  isBusy() { return this.plan.length > 0 && this.planIdx < this.plan.length; }
  getActiveAction() { return this.activeActionId; }

  setTempo(rate: number) {
    this.tempo = 0.55 + (rate - 1) * 0.38;
  }

  /** user poked / grabbed the creature */
  notifyPoke(now: number) {
    this.pokeCount++;
    if (this.lastPokeAt > 0) this.clickHabit.push(now - this.lastPokeAt);
    if (this.clickHabit.length > 12) this.clickHabit.shift();
    this.lastPokeAt = now;
    this.boredom = 0;
    this.energy = clamp01(this.energy - 0.015);

    // reinforcement: being poked is social → nudge traits
    this.personality.sociability = clamp01(this.personality.sociability + 0.006);
    this.personality.playfulness = clamp01(this.personality.playfulness + 0.004);

    // being poked interrupts whatever it was doing (it *notices*)
    if (this.energy > 0.25 && Math.random() < 0.55) this.abortPlan();
  }

  /** user clicked empty space */
  notifyOutsideClick(now: number): 'ignored' | 'glance' | 'engage' {
    this.boredom = 0;
    if (this.lastPokeAt > 0) this.clickHabit.push(now - this.lastPokeAt);
    if (this.clickHabit.length > 12) this.clickHabit.shift();

    // Salience model: how interesting is this click really?
    const rapid = this.clickHabit.length > 2 &&
      this.clickHabit.slice(-3).every((d) => d < 700);
    const sleepy = this.state === 'drowsy';
    const busy = this.isBusy() && this.activeActionId !== null;

    let interest =
      (this.personality.curiosity * 0.35) +
      (this.personality.sociability * 0.25) +
      (this.state === 'playful' ? 0.2 : 0) +
      (this.state === 'hyper' ? 0.18 : 0) -
      (sleepy ? 0.35 : 0) -
      (this.state === 'serene' ? 0.15 : 0) -
      (busy ? 0.18 : 0) +
      (rapid ? 0.12 : 0) +
      rnd(-0.12, 0.12);

    interest = clamp01(interest);

    if (interest < 0.34) {
      this.ignoredClicks++;
      // repeated ignoring slowly makes it more aloof
      this.personality.sociability = clamp01(this.personality.sociability - 0.004);
      return 'ignored';
    }
    if (interest < 0.62) {
      this.honoredClicks++;
      return 'glance';
    }
    this.honoredClicks++;
    this.personality.curiosity = clamp01(this.personality.curiosity + 0.005);
    return 'engage';
  }

  /** should the creature come to a clicked spot? */
  shouldComeToClick(): boolean {
    const clingy = this.personality.sociability > 0.6;
    const obedient = this.personality.diligence > 0.55;
    const sleepy = this.state === 'drowsy' || this.state === 'serene';
    if (sleepy) return Math.random() < 0.12;
    const p = (clingy ? 0.42 : 0.16) + (obedient ? 0.18 : 0) + this.personality.playfulness * 0.12;
    return Math.random() < p;
  }

  /** a wall bounce or landing happened */
  notifyImpact(force: number) {
    this.energy = clamp01(this.energy - force * 0.01);
    // rough landings make it slightly more cautious
    if (force > 6) this.personality.boldness = clamp01(this.personality.boldness - 0.004);
  }

  /* ---------------- main tick ---------------- */

  update(dt: number, p: Perception): Decision {
    this.clock += dt;
    this.stepT += dt;
    this.stateT += dt;
    if (this.cooldown > 0) this.cooldown -= dt;

    // emotional state drives the whole motion appetite
    this.updateLiveliness(dt, this.valence, this.arousal, this.moodVolatility, p.socialPull);
    this.updateBodyBounce(dt);

    // temperament transitions speed up when they're feeling great or awful
    if (this.valence > 0.5 || this.valence < -0.5) {
      this.stateT += dt * 0.5;
    }

    // energy budget: actions drain, idleness restores
    if (this.activeActionId) this.energy = clamp01(this.energy - dt * 0.018);
    else this.energy = clamp01(this.energy + dt * (this.state === 'drowsy' ? 0.05 : 0.022));

    // boredom grows when nothing happens and nobody interacts
    const understimulated = !p.cursorMoving && p.idleTime > 3 && !this.isBusy();
    this.boredom = clamp01(this.boredom + (understimulated ? dt / 26 : -dt / 12));

    // personality slowly relaxes toward baseline
    this.driftPersonality(dt);

    // temperament lifecycle
    if (this.stateT >= this.stateDur) {
      this.setTemperament(weightedPick(TRANSITIONS[this.state]));
    }

    // ---- run the current plan ----
    if (this.isBusy()) {
      const res = this.advance(p);
      if (res) return res;
      return { type: 'none' };
    }

    // ---- action finished / no plan: wait for the next urge ----
    if (this.activeActionId) {
      this.activeActionId = null;
      // short refractory, scaled by energy & laziness
      const lazy = 1 - this.personality.diligence;
      this.cooldown = rnd(0.5, 2.2) * (1 + lazy * 0.8);
    }

    this.nextPlanAt -= dt;
    if (this.cooldown > 0 || this.nextPlanAt > 0) return { type: 'none' };

    // ---- deliberate: choose what it WANTS to do ----
    const plan = this.deliberate(p);
    const [gMin, gMax] = TEMPERAMENTS[this.state].gap;
    this.nextPlanAt = rnd(gMin, gMax) / this.tempo * (1 - this.boredom * 0.4);

    if (!plan) return { type: 'none' };
    return plan;
  }

  /* ---------------- internals ---------------- */

  private driftPersonality(dt: number) {
    const base = { boldness: 0.5, sociability: 0.55, playfulness: 0.55, diligence: 0.5, curiosity: 0.65 };
    const rate = dt * 0.004;
    for (const k of Object.keys(base) as (keyof Personality)[]) {
      this.personality[k] = clamp01(this.personality[k] + (base[k] - this.personality[k]) * rate);
    }
  }

  private setTemperament(next: MindState) {
    this.state = next;
    this.stateT = 0;
    const t = TEMPERAMENTS[next];
    this.stateDur = rnd(t.dwell[0], t.dwell[1]);
    // apply the temperament's trait bias
    for (const k of Object.keys(t.bias) as (keyof Personality)[]) {
      this.personality[k] = clamp01(this.personality[k] + (t.bias[k] ?? 0));
    }
    // a new mood often kicks off an immediate urge
    if (Math.random() < 0.55) this.nextPlanAt = Math.min(this.nextPlanAt, rnd(0.2, 0.9));
  }

  private abortPlan() {
    this.plan = [];
    this.planIdx = 0;
    this.activeActionId = null;
    this.cooldown = rnd(0.3, 0.9);
  }

  /**
   * STOCHASTIC DELIBERATION.
   * Utility scores still shape the odds, but the final pick is
   * heavily randomised — the creature is wilful, not scriptable.
   */
  private deliberate(p: Perception): Decision | null {
    const P = this.personality;
    const T = TEMPERAMENTS[this.state];
    const distScore = clamp01(1 - p.cursorDist / 900);

    type Cand = { id: string; score: number; intent: string; plan: PlanStep[] };
    const cands: Cand[] = [];

    const push = (id: string, score: number, intent: string, plan: PlanStep[]) => {
      // novelty bonus: avoid repeating what it just did
      const recentIdx = this.recentActions.lastIndexOf(id);
      const novelty = recentIdx === -1 ? 0.14 : -0.1 * (this.recentActions.length - recentIdx);
      cands.push({ id, score: score + novelty + rnd(-0.09, 0.09), intent, plan });
    };

    /* --- social / approach family --- */
    if (p.canTravel) {
      push('approach',
        P.sociability * 0.55 + P.curiosity * 0.3 + distScore * 0.2 + this.energy * 0.1,
        'Coming over to you',
        [{ kind: 'action', ref: 'approach' }, { kind: 'eyes', ref: 'attention' }]);

      push('orbit',
        P.playfulness * 0.5 + P.sociability * 0.25 + this.energy * 0.25,
        'Circling around you',
        [{ kind: 'action', ref: 'orbit' }, { kind: 'eyes', ref: 'playful' }]);

      push('shadow',
        P.curiosity * 0.4 + P.playfulness * 0.25,
        'Lurking nearby',
        [{ kind: 'action', ref: 'shadow' }, { kind: 'eyes', ref: 'attention' }]);
    }

    /* --- free-roam only: wandering & exploring --- */
    if (p.canTravel) {
      push('roam',
        0.5 + P.curiosity * 0.3 + this.boredom * 0.3,
        'Wandering wherever',
        [{ kind: 'action', ref: 'roam' }, { kind: 'eyes', ref: 'attention' }]);

      push('meander',
        0.45 + (1 - P.diligence) * 0.3 + this.boredom * 0.2,
        'Meandering about',
        [{ kind: 'action', ref: 'meander' }, { kind: 'eyes', ref: 'idle' }]);

      push('inspect',
        P.curiosity * 0.45 + this.boredom * 0.3,
        'Checking something out',
        [{ kind: 'action', ref: 'inspect' }, { kind: 'eyes', ref: 'attention' }]);
    }

    /* --- high-arousal family --- */
    if (this.energy > 0.45 && p.canTravel) {
      push('frenzy',
        P.playfulness * 0.5 + this.energy * 0.35 + this.boredom * 0.3,
        'FRENZY!',
        [{ kind: 'action', ref: 'frenzy' }, { kind: 'eyes', ref: 'chaos' }, { kind: 'hop' }]);

      push('burst',
        P.playfulness * 0.45 + this.energy * 0.3,
        'Sudden burst',
        [{ kind: 'action', ref: 'burst' }, { kind: 'eyes', ref: 'playful' }]);

      push('dart',
        P.playfulness * 0.4 + this.energy * 0.3 + P.boldness * 0.2,
        'Darting off',
        [{ kind: 'action', ref: 'dart' }, { kind: 'eyes', ref: 'attention' }]);

      push('dart_by',
        P.playfulness * 0.35 + P.sociability * 0.25,
        'Zooming past',
        [{ kind: 'action', ref: 'dart_by' }, { kind: 'eyes', ref: 'playful' }]);
    }

    /* --- low-arousal family --- */
    push('settle',
      (1 - P.diligence) * 0.4 + (1 - this.energy) * 0.5 + (this.state === 'drowsy' ? 0.4 : 0),
      'Settling down to rest',
      [{ kind: 'action', ref: 'settle' }, { kind: 'eyes', ref: 'idle' }]);

    push('hover_still',
      (1 - P.playfulness) * 0.3 + P.curiosity * 0.2 + rnd(0, 0.3),
      'Hovering still',
      [{ kind: 'action', ref: 'hover_still' }, { kind: 'eyes', ref: 'idle' }]);

    push('drift',
      (1 - P.sociability) * 0.45 + (1 - this.energy) * 0.3 + this.boredom * 0.25,
      'Drifting aimlessly',
      [{ kind: 'action', ref: 'drift' }, { kind: 'eyes', ref: 'idle' }]);

    /* --- context-triggered family (very high salience) --- */
    if (p.laserActive) {
      push('chase_laser', 0.75 + P.playfulness * 0.3, 'CHASING THE DOT!',
        [{ kind: 'action', ref: 'chase_laser' }, { kind: 'eyes', ref: 'laser_lock' }]);
    }
    if (p.foodNear > 0) {
      // food is the single most salient thing in its world
      push('seek_food', 1.6 + Math.min(0.5, p.foodNear * 0.15), 'Going for the snack',
        [{ kind: 'action', ref: 'seek_food' }, { kind: 'eyes', ref: 'emotion' }]);
    }
    if (p.atEdge && this.state === 'moody') {
      push('evade', 0.6, 'Keeping its distance',
        [{ kind: 'action', ref: 'evade' }, { kind: 'eyes', ref: 'wary' }]);
    }
    if (p.cursorSpeed > 20 && P.boldness < 0.45) {
      push('flinch', 0.55 + (1 - P.boldness) * 0.3, 'Startled!',
        [{ kind: 'action', ref: 'flinch' }, { kind: 'eyes', ref: 'surprised' }]);
    }
    if (p.recentlyPoked < 1.2 && P.playfulness > 0.6) {
      push('come_here', 0.5, 'Answering your call',
        [{ kind: 'action', ref: 'come_here' }, { kind: 'eyes', ref: 'playful' }]);
    }

    // eye-only plans (cheap, always available)
    const eyesCat = weightedPick(T.eyes);
    push('eyes_only',
      0.28 + P.diligence * 0.15,
      'A passing thought',
      [{ kind: 'eyes', ref: eyesCat }]);

    if (Math.random() < 0.14) {
      push('eyes_proc', 0.3, 'A brand-new notion',
        [{ kind: 'eyesProc' }]);
    }

    if (!cands.length) return null;

    // ── RANDOMISED SELECTION ────────────────────────────────
    // Softmax-like sampling over the whole candidate list: the best
    // option usually wins, but ANY option can win on a whim.
    // This is what kills the "pattern" feel.
    const TEMP = 0.30; // higher = more chaotic
    const max = Math.max(...cands.map((c) => c.score));
    const exps = cands.map((c) => Math.exp((c.score - max) / TEMP));
    const sum = exps.reduce((a, b) => a + b, 0);
    let roll = Math.random() * sum;
    let idx = 0;
    for (let i = 0; i < exps.length; i++) {
      roll -= exps[i];
      if (roll <= 0) { idx = i; break; }
    }
    // occasionally throw the ranking away completely
    if (Math.random() < 0.12) idx = Math.floor(Math.random() * cands.length);
    const chosen = cands[idx];

    this.recentActions.unshift(chosen.id);
    if (this.recentActions.length > 6) this.recentActions.pop();

    this.plan = chosen.plan;
    this.planIdx = 0;
    this.stepT = 0;
    this.activeActionId = null;
    this.intent = chosen.intent;

    return {
      type: 'plan',
      intent: chosen.intent,
      plan: chosen.plan,
      actionId: chosen.plan.find((s) => s.kind === 'action')?.ref,
    };
  }

  /* ---- LIVELINESS: mood converts directly into motion appetite ---- */

  /** exposed so the emotional model in creature.ts can drive this */
  setMood(v: number, a: number) { this.valence = v; this.arousal = a; }

  private valence = 0.15;
  private arousal = 0.4;
  private moodVolatility = 1;

  /** fed from creature.ts each frame */
  setEmotion(v: number, a: number, volatility: number) {
    this.valence = v;
    this.arousal = a;
    this.moodVolatility = volatility;
  }

  /** 0.25 … 2.6 — how much this creature wants to MOVE right now */
  liveliness = 1;
  /** visual-only vertical bounce of the body (never changes position) */
  bodyBounce = 0;
  private bounceVel = 0;
  private moodTicker = 0;
  /** external drives fed in from the creature each frame */
  externalDrive = 1;

  /**
   * Feels: valence & arousal convert into a continuous "want to move".
   * Happy+awake → bouncy and exploratory. Miserable → sluggish.
   * Angry → restless, sharp bursts.
   */
  private updateLiveliness(dt: number, v: number, a: number, volatility: number, socialPull: number) {
    this.moodTicker += dt;
    // base homeostatic activity level
    let target = 0.85;
    if (v > 0.35) target = 1.15 + a * 0.85;                 // joyful → very active
    else if (v > 0.05) target = 0.95 + a * 0.6;             // content → lively
    else if (v > -0.25) target = 0.7 + a * 0.7;             // uneasy → fidgety
    else target = 0.45 + a * 0.55;                          // miserable → sluggish or frantic

    // temperaments colour it further
    if (this.state === 'hyper') target *= 1.35;
    if (this.state === 'playful') target *= 1.2;
    if (this.state === 'drowsy') target *= 0.55;
    if (this.state === 'serene') target *= 0.8;

    // loneliness pulls it toward seeking contact
    target *= 0.85 + socialPull * 0.35;

    // energy gates it
    target *= 0.45 + this.energy * 0.75;

    // volatility makes the target itself unstable — never a flat cruise
    const wobble = Math.sin(this.moodTicker * (1.7 + volatility)) * 0.22 * volatility;

    this.liveliness += (target + wobble - this.liveliness) * Math.min(1, dt * 1.6);
    this.liveliness = Math.max(0.18, Math.min(3.2, this.liveliness));
  }

  /**
   * A gentle spring-driven body bounce. This is the "breathing" hop —
   * purely cosmetic, so it never teleports the creature.
   */
  private updateBodyBounce(dt: number) {
    // excited states breathe faster and higher
    const rate = 3.2 + this.liveliness * 3.4;
    const amp = (0.9 + this.liveliness * 2.6) * (this.state === 'drowsy' ? 0.3 : 1);
    const spring = 0.16 + this.liveliness * 0.05;
    // random excited kicks keep it from ever looking mechanical
    if (Math.random() < dt * (0.35 * this.liveliness)) this.bounceVel += rnd(1.2, 3.4) * this.liveliness;
    this.bounceVel += (Math.sin(this.moodTicker * rate) * amp - this.bodyBounce) * spring;
    this.bounceVel *= 0.86;
    this.bodyBounce += this.bounceVel;
    this.bodyBounce = Math.max(-26, Math.min(26, this.bodyBounce));
  }

  /**
   * Spontaneous motion impulse (scaled by dt so 60 FPS doesn't spam jumps!).
   * Rates scale with liveliness — a happy creature fidgets a lot more.
   */
  randomTwitch(dt: number): 'none' | 'jump' | 'hop' | 'kick' | 'swoop' | 'glide' | 'wiggle' {
    if (!this.allowTravel) return 'none';
    const L = this.liveliness * this.externalDrive;
    const r = Math.random();
    // Rare special vertical jumps — the mood can make them far more likely
    const jumpRate = 0.011 * (0.4 + L * 0.9) * (this.state === 'playful' || this.state === 'hyper' ? 2.1 : 1);
    if (r < dt * jumpRate) return 'jump';
    if (r < dt * jumpRate * 2.4 && this.state === 'playful') return 'hop';
    if (r < dt * 0.30 * L) return 'glide';
    if (r < dt * 0.20 * L * this.energy) return 'swoop';
    if (r < dt * 0.14 * L) return 'kick';
    if (r < dt * 0.10 * L) return 'wiggle';
    return 'none';
  }

  private allowTravel = true;

  setAllowTravel(v: boolean) {
    this.allowTravel = v;
  }

  /** Is a spontaneous jump allowed right now? (free-roam only) */
  canJump(): boolean {
    return this.allowTravel && this.energy > 0.2;
  }

  /** How long to idle after finishing something — fully randomised */
  randomRefractory(): number {
    const lazy = 1 - this.personality.diligence;
    const sleepy = this.state === 'drowsy' ? 2.2 : this.state === 'serene' ? 1.6 : 1;
    return rnd(0.15, 1.4) * sleepy * (1 + lazy * rnd(0, 1.8));
  }

  /** Executes plan steps; returns a Decision when a new cue must be surfaced */
  private advance(_p: Perception): Decision | null {
    if (this.planIdx >= this.plan.length) {
      this.plan = [];
      return null;
    }

    const step = this.plan[this.planIdx];

    switch (step.kind) {
      case 'action': {
        if (!this.activeActionId) {
          this.activeActionId = step.ref ?? null;
          return { type: 'action', actionId: step.ref, intent: this.intent };
        }
        // let the executor run it; it reports completion via finishAction()
        return null;
      }
      case 'eyes':
        this.planIdx++;
        this.stepT = 0;
        return { type: 'eyes', cat: step.ref, intent: this.intent };
      case 'eyesRandom':
        this.planIdx++;
        return { type: 'eyesRandom', intent: this.intent };
      case 'eyesProc':
        this.planIdx++;
        return { type: 'eyesProc', intent: this.intent };
      case 'jump':
        this.planIdx++;
        return { type: 'jump', power: step.power ?? 1, intent: this.intent };
      case 'hop':
        this.planIdx++;
        return { type: 'hop', power: step.power ?? 0.5, intent: this.intent };
      case 'wait': {
        const need = step.dur ?? 0.5;
        if (this.stepT >= need) { this.planIdx++; this.stepT = 0; }
        return null;
      }
      default:
        this.planIdx++;
        return null;
    }
  }

  /** Called by the executor when a body action completes */
  finishAction() {
    this.activeActionId = null;
    // if this was the last step, close the plan
    const remaining = this.plan.slice(this.planIdx).filter((s) => s.kind !== 'action');
    if (remaining.length === 0) {
      this.plan = [];
      this.planIdx = 0;
    } else {
      // skip to the next non-action step
      while (this.planIdx < this.plan.length && this.plan[this.planIdx].kind === 'action') this.planIdx++;
      if (this.planIdx >= this.plan.length) { this.plan = []; this.planIdx = 0; }
    }
    this.cooldown = rnd(0.4, 1.8);
  }

  /** Force a specific action right now (used by click responses) */
  forceAction(id: string, intent: string): Decision {
    this.plan = [{ kind: 'action', ref: id }, { kind: 'eyes', ref: 'attention' }];
    this.planIdx = 0;
    this.activeActionId = null;
    this.intent = intent;
    this.nextPlanAt = rnd(3, 7);
    return { type: 'action', actionId: id, intent };
  }

  /** Inject an eye-only impulse without touching the body plan */
  cueEyes(cat: string): Decision {
    this.intent = 'Noticing something';
    return { type: 'eyes', cat, intent: this.intent };
  }
}
