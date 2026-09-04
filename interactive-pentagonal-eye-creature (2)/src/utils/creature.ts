// ============================================================
//  PENTA — Creature Entity
//  Everything one individual needs: body physics, soft-body
//  vertices, its own Cortex, its own eye engine, its own meals.
//  Multiple instances can coexist and (later) interact.
// ============================================================

import { EyeBehaviorEngine, generateProceduralBehavior, BEHAVIORS } from './eyeBehaviors';
import { Cortex, Perception } from './mind';
import { ACTIONS, startAction, stepAction, RunningAction, ActionCtx } from './actions';
import { drawRoundedPolygon, getBasePentagonVertices, Point, clamp } from './math';
import {
  drawEye, makeStops, projectOnGradient, sampleStops,
  rgbString, mixRGB, parseColor, resolveGazeShift,
} from './eyes';
import { EatState, beginEating, stepEating, eatEyeCue, rollDisliked } from './eating';
import { soundFx } from './audio';
import { SocialDirective, SocialActor } from './social';
import { rollImpact, rollMealFX, ImpactFX } from './impact';
import { CreatureBurstEffect } from './burst';
import { t } from './i18n';
import { MouthBehaviorEngine } from './mouthBehaviors';
import { drawMouth } from './mouthRender';

export type CreatureKind = 'adult' | 'child';

export interface CreatureConfig {
  id: string;
  name: string;
  kind: CreatureKind;
  /** multiplies the global scale — children are smaller */
  sizeFactor: number;
  /** body tint (kept near-white; children skew warmer/cooler) */
  tint: string;
  /** how fast it thinks & moves */
  tempo: number;
  /** initial personality seed */
  boldness: number;
  sociability: number;
  playfulness: number;
  diligence: number;
  curiosity: number;
}

export function defaultConfig(kind: CreatureKind, index: number): CreatureConfig {
  const child = kind === 'child';
  // Цвета тела — палитра без голубого, капельку бледнее (на шаг светлее Tailwind)
  const vivid = ['#fda4af', '#fb7185', '#fcd34d', '#fbbf24', '#c4b5fd', '#f0abfc', '#f9a8d4', '#6ee7b7', '#fde047', '#bef264'];
  return {
    id: `penta_${Date.now()}_${index}`,
    name: child ? 'Pip' : 'Penta II',
    kind,
    sizeFactor: child ? 0.55 : 0.95,
    tint: vivid[Math.floor(Math.random() * vivid.length)],
    tempo: child ? 1.55 : 1,
    boldness: child ? 0.35 : 0.5 + Math.random() * 0.2,
    sociability: child ? 0.82 : 0.4 + Math.random() * 0.3,
    playfulness: child ? 0.9 : 0.45 + Math.random() * 0.3,
    diligence: child ? 0.22 : 0.45 + Math.random() * 0.3,
    curiosity: child ? 0.88 : 0.5 + Math.random() * 0.3,
  };
}

interface Crumb {
  x: number; y: number; vx: number; vy: number;
  life: number; max: number; color: string; size: number;
  kind: 'crumb' | 'sparkle' | 'heart';
  rot: number; vrot: number;
}

export class CreatureEntity {
  cfg: CreatureConfig;

  // body
  x: number; y: number;
  targetX: number; targetY: number;
  vx = 0; vy = 0;
  baseWidth = 212;
  baseHeight = 186;
  scaleX = 1; scaleY = 1;
  vScaleX = 0; vScaleY = 0;
  rotation = 0; vRotation = 0;

  isJumping = false;
  jumpPhase = 0;
  jumpTimer = 0;
  jumpPower = 1;
  jumpOrigin = { x: 0, y: 0 };

  isDragging = false;
  dragOffsetX = 0; dragOffsetY = 0;

  // brains
  eyes = new EyeBehaviorEngine();
  mind = new Cortex();
  action: RunningAction | null = null;

  // soft body
  verts = Array.from({ length: 5 }, () => ({ x: 0, y: 0, vx: 0, vy: 0 }));

  // gaze
  gaze = { x: 0, y: 0, vx: 0, vy: 0 };
  blink = { t: 0, next: 2 + Math.random() * 3, active: false, dur: 0.13 };
  pupil = { x: 0, y: 0, tx: 0, ty: 0 };

  // anchoring
  home: { x: number; y: number };
  shouldReturn = true;
  lastInteraction = performance.now();
  lastPoke = 0;
  lastReaction = 0;
  lastGlance = 0;
  lastTouchAt = 0;
  throwSample = { x: 0, y: 0, t: 0 };

  // eating
  eat: EatState | null = null;
  crumbs: Crumb[] = [];
  mealsEaten = 0;
  fullness = 0; // 0..1, decays over time
  /** food orbs it has decided (for now) to walk away from */
  private snubbed = new Map<string, number>();
  /** the orb it is currently curious about */
  focusFoodId: string | null = null;
  private foodMoodT = 0;
  /** fluctuating appetite quirk, drifts on its own */
  private appetiteBias = Math.random();

  // social
  social: SocialDirective | null = null;
  private socialActionId: string | null = null;
  private lastSocialEyes = 0;
  socialLabel: string | null = null;

  // ---- SMART EVOLVING MOOD (nothing preset, nothing configurable) ----
  /** valence: −1 miserable … +1 delighted */
  valence = 0.15;
  /** arousal: 0 flat … 1 frantic */
  arousal = 0.4;
  /** long-run temperament that drifts with lived experience */
  temperament = { cheer: 0.5, calm: 0.5, stubborn: 0.5, sociable: 0.55, brave: 0.5 };
  /** the emotional word shown in the HUD right now */
  moodWord = 'content';
  private moodWordT = 0;
  /** current lingering impact reaction */
  private impact: ImpactFX | null = null;
  private impactT = 0;
  /** accumulated experience counters that shape temperament */
  private exp = { hits: 0, meals: 0, socialWins: 0, socialFights: 0, pokes: 0, ignored: 0 };

  // stats
  happiness = 92;
  energyStat = 95;
  curiosityStat = 88;

  // mouth — full realistic system
  mouth = new MouthBehaviorEngine();
  private mouthTwitchT = 0;

  // advanced crystalline burst & quantum respawn state
  burst = new CreatureBurstEffect();

  private actionCtx: ActionCtx;

  constructor(cfg: CreatureConfig, x: number, y: number) {
    this.cfg = cfg;
    this.x = x; this.y = y;
    this.targetX = x; this.targetY = y;
    this.home = { x, y };
    this.jumpOrigin = { x, y };

    const P = this.mind.personality;
    P.boldness = cfg.boldness;
    P.sociability = cfg.sociability;
    P.playfulness = cfg.playfulness;
    P.diligence = cfg.diligence;
    P.curiosity = cfg.curiosity;

    this.actionCtx = {
      self: { x, y },
      cursor: { x, y, vx: 0, vy: 0, speed: 0 },
      bounds: { w: window.innerWidth, h: window.innerHeight, mx: 90, my: 90 },
      center: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      home: { x, y },
      food: [],
      tool: 'none',
      personality: P,
      energy: 1,
      canTravel: true,
    };
  }

  get sizeMul() { return this.cfg.sizeFactor; }

  bodyW(globalScale: number) {
    return this.baseWidth * globalScale * this.sizeMul * this.scaleX;
  }
  bodyH(globalScale: number) {
    return this.baseHeight * globalScale * this.sizeMul * this.scaleY;
  }

  /* ================================================================
   *  SMART EMOTIONAL MODEL
   *  Valence & arousal are a continuous 2D mood space. Events push
   *  the point around; temperament shapes how far and how fast.
   *  Temperament itself is learned from what actually happened.
   * ================================================================ */

  private pushMood(dValence: number, dArousal: number) {
    // temperament scales the reaction — stubborn ones feel less, excitable ones more
    const sens = 0.6 + this.temperament.cheer * 0.5 + (1 - this.temperament.calm) * 0.4;
    this.valence = Math.max(-1, Math.min(1, this.valence + dValence * sens));
    this.arousal = Math.max(0, Math.min(1, this.arousal + dArousal * sens));
  }

  /** Learned personality drifts toward whatever life keeps doing to it */
  private learn(dt: number) {
    const e = this.exp;
    // slow decay toward a mild baseline so it isn't permanent
    const decay = dt * 0.0006;
    this.temperament.cheer += (0.5 - this.temperament.cheer) * decay;
    this.temperament.calm += (0.5 - this.temperament.calm) * decay;
    this.temperament.stubborn += (0.5 - this.temperament.stubborn) * decay;
    this.temperament.sociable += (0.5 - this.temperament.sociable) * decay;
    this.temperament.brave += (0.5 - this.temperament.brave) * decay;

    // lived experience nudges traits
    if (e.meals > 0) this.temperament.cheer = Math.min(1, this.temperament.cheer + e.meals * 0.00004);
    if (e.hits > 0) {
      this.temperament.brave = Math.min(1, this.temperament.brave + e.hits * 0.00003);
      this.temperament.calm = Math.min(1, this.temperament.calm + e.hits * 0.00002);
    }
    if (e.socialWins > 0) this.temperament.sociable = Math.min(1, this.temperament.sociable + e.socialWins * 0.00005);
    if (e.socialFights > 0) {
      this.temperament.stubborn = Math.min(1, this.temperament.stubborn + e.socialFights * 0.00004);
      this.temperament.sociable = Math.max(0, this.temperament.sociable - e.socialFights * 0.00004);
    }
    if (e.ignored > 0) this.temperament.sociable = Math.max(0, this.temperament.sociable - e.ignored * 0.00004);
    if (e.pokes > 0) this.temperament.cheer = Math.min(1, this.temperament.cheer + e.pokes * 0.00002);
  }

  /** Derives the word the HUD shows from where it sits in mood-space */
  private deriveMoodWord(): string {
    const v = this.valence;
    const a = this.arousal;
    if (v > 0.55) return a > 0.65 ? 'elated' : a > 0.3 ? 'joyful' : 'blissful';
    if (v > 0.2) return a > 0.65 ? 'excited' : a > 0.3 ? 'happy' : 'content';
    if (v > -0.15) return a > 0.7 ? 'restless' : a > 0.35 ? 'curious' : 'calm';
    if (v > -0.5) return a > 0.6 ? 'irritable' : a > 0.3 ? 'uneasy' : 'melancholy';
    return a > 0.6 ? 'furious' : a > 0.3 ? 'grumpy' : 'dejected';
  }

  private updateMood(dt: number) {
    this.moodWordT += dt;
    // mood always relaxes toward the temperament's home point
    const home = (this.temperament.cheer - 0.5) * 0.55;
    const pull = dt * (0.06 + this.temperament.calm * 0.07);
    this.valence += (home - this.valence) * pull;
    this.arousal += (0.28 + (1 - this.temperament.calm) * 0.2 - this.arousal) * dt * 0.05;

    // lingering impact feelings fade
    if (this.impact) {
      this.impactT += dt;
      if (this.impactT > this.impact.linger) this.impact = null;
    }

    if (this.moodWordT > 1.5) {
      this.moodWordT = 0;
      const w = this.deriveMoodWord();
      if (w !== this.moodWord) this.moodWord = w;
    }
    this.learn(dt);
  }

  getMoodWord() { return this.moodWord; }
  getValence() { return this.valence; }
  getArousal() { this.exp.hits = this.exp.hits; return this.arousal; }

  /** Hook for the social layer to report relationship outcomes */
  noteSocial(win: boolean) {
    if (win) { this.exp.socialWins++; this.pushMood(0.16, 0.14); }
    else { this.exp.socialFights++; this.pushMood(-0.14, 0.16); }
  }

  noteIgnored() { this.exp.ignored++; this.pushMood(-0.07, -0.02); }

  /* ================================================================
   *  COLLISION HANDLING — every hit rolls its own reaction
   * ================================================================ */

  handleImpact(
    speed: number,
    wallX: number,
    wallY: number,
    opts: {
      fx: { impactRipple: boolean; impactSound: boolean };
      mood: string;
      isLanding?: boolean;
      isEdgeTouch?: boolean;
      onRipple?: (x: number, y: number, scale: number, count: number, color: string) => void;
      onBehavior?: (label: string) => void;
      onEyes?: (cat: string) => void;
    }
  ) {
    const P = this.mind.personality;
    const fx = rollImpact({
      speed,
      isWall: !opts.isEdgeTouch,
      isEdgeTouch: opts.isEdgeTouch ?? false,
      mood: this.moodWord,
      energy: this.mind.getEnergy(),
      playfulness: P.playfulness,
      boldness: P.boldness,
      curiosity: P.curiosity,
      isLanding: opts.isLanding ?? false,
    });

    // record the experience — this is what makes mood & temperament learn
    const severity = Math.min(1, speed / 20);
    if (severity > 0.18) {
      this.exp.hits++;
      const toll = -0.05 - severity * 0.2;
      const annoyance = this.temperament.stubborn * 0.5 + (1 - this.temperament.brave) * 0.5;
      this.pushMood(toll * annoyance - (1 - annoyance) * 0.02, 0.1 + severity * 0.35);
    } else {
      this.pushMood(-0.01, 0.05);
    }

    if (fx.sound && opts.fx.impactSound) soundFx.playBounce(fx.pitch);
    if (fx.ripple && opts.fx.impactRipple && opts.onRipple) {
      opts.onRipple(wallX, wallY, fx.rippleScale, fx.rippleCount, fx.rippleColor);
    }

    // body response — scale springs get kicked instead of set (no violent shake)
    if (fx.squash !== 0) {
      this.vScaleX += -fx.squash * 0.55;
      this.vScaleY += fx.squash * 0.55;
    }
    if (fx.shake > 0) {
      const amp = Math.min(3.2, fx.shake * 0.28);
      this.verts.forEach((v) => {
        v.vx += (Math.random() - 0.5) * amp;
        v.vy += (Math.random() - 0.5) * amp;
      });
    }
    if (Math.abs(fx.tilt) > 0.001) this.vRotation += fx.tilt;

    // emotional follow-up
    if (fx.eyes && Math.random() < 0.62) opts.onEyes?.(fx.eyes);
    if (fx.label && Math.random() < 0.45) opts.onBehavior?.(fx.label);

    // keep the strongest lingering feeling
    if (!this.impact || fx.reaction === 'heavy' || fx.reaction === 'dizzy') {
      this.impact = fx;
      this.impactT = 0;
    }
    return fx;
  }

  /** Called for grazing touches — much gentler path */
  handleTouch(
    side: 'left' | 'right' | 'top' | 'bottom',
    opts: Parameters<CreatureEntity['handleImpact']>[3]
  ) {
    const fx = rollImpact({
      speed: 1.4 + Math.random() * 2,
      isWall: false,
      isEdgeTouch: true,
      mood: this.moodWord,
      energy: this.mind.getEnergy(),
      playfulness: this.mind.personality.playfulness,
      boldness: this.mind.personality.boldness,
      curiosity: this.mind.personality.curiosity,
      isLanding: false,
    });

    if (fx.sound && opts.fx.impactSound) soundFx.playBounce(fx.pitch * 0.72);
    if (fx.ripple && opts.fx.impactRipple && opts.onRipple) {
      const pad = this.bodyW(1) * 0.5;
      const x = side === 'left' ? this.x - pad : side === 'right' ? this.x + pad : this.x;
      const y = side === 'top' ? this.y - this.bodyH(1) * 0.4 : this.y + this.bodyH(1) * 0.45;
      opts.onRipple(x, y, fx.rippleScale * 0.7, 1, fx.rippleColor);
    }
    if (fx.shake > 0) {
      const amp = Math.min(1.6, fx.shake * 0.16);
      this.verts.forEach((v) => {
        v.vx += (Math.random() - 0.5) * amp;
        v.vy += (Math.random() - 0.5) * amp;
      });
    }
    if (fx.eyes && Math.random() < 0.35) opts.onEyes?.(fx.eyes);
    if (fx.label && Math.random() < 0.3) opts.onBehavior?.(fx.label);
  }

  /* ---------------- social identity ---------------- */

  toSocialActor(): SocialActor {
    const P = this.mind.personality;
    return {
      id: this.cfg.id,
      name: this.cfg.name,
      kind: this.cfg.kind,
      x: this.x,
      y: this.y,
      playfulness: P.playfulness,
      sociability: P.sociability,
      boldness: P.boldness,
      curiosity: P.curiosity,
      diligence: P.diligence,
      energy: this.mind.getEnergy(),
      busy: this.isDragging || this.eat !== null,
    };
  }

  /* ---------------- food appetite ---------------- */

  /** Slowly wandering appetite quirk — makes food interest unpredictable */
  private driftAppetite(dt: number) {
    this.foodMoodT += dt;
    if (this.foodMoodT > 3 + Math.random() * 9) {
      this.foodMoodT = 0;
      this.appetiteBias += (Math.random() - 0.5) * 0.5;
      this.appetiteBias = Math.min(1, Math.max(0, this.appetiteBias));
    }
    // snubs expire, so it may reconsider a snack it walked past
    for (const [id, until] of [...this.snubbed.entries()]) {
      if (performance.now() > until) this.snubbed.delete(id);
    }
  }

  /** 0..1 — how much it fancies this particular orb right now */
  appetiteFor(id: string, age: number, drive = 1): number {
    if (this.eat) return 0;
    if (this.snubbed.has(id)) return 0;
    const P = this.mind.personality;
    const hunger = 1 - this.fullness;
    // older food is less appealing, but curiosity can override that
    const freshness = Math.max(0.25, 1 - age / 90);
    const mood = this.appetiteBias;
    return Math.min(1,
      (hunger * 0.55 + mood * 0.25 + P.curiosity * 0.15 + freshness * 0.2 - this.fullness * 0.3) * drive
    );
  }

  /** Decides whether to actually swallow an orb it is touching */
  wantsToEat(id: string, age: number, drive = 1): boolean {
    const a = this.appetiteFor(id, age, drive);
    if (a <= 0) return false;
    // even when appetising, it sometimes just isn't in the mood
    if (Math.random() > a * 0.9 + 0.08) {
      this.snub(id);
      return false;
    }
    return true;
  }

  /** Walk away from this orb for a random while */
  snub(id: string) {
    this.snubbed.set(id, performance.now() + 2500 + Math.random() * 14000);
    if (this.focusFoodId === id) this.focusFoodId = null;
  }

  /* ---------------- eating ---------------- */

  startMeal(
    fx: number,
    fy: number,
    color: string,
    opts?: {
      fxSettings?: { foodRipple: boolean; foodSound: boolean };
      onRipple?: (x: number, y: number, scale: number, count: number, color: string) => void;
      onBehavior?: (label: string) => void;
    }
  ) {
    // decide if THIS bite is disliked — very rare, and more likely when already full or child
    const isChild = this.cfg.kind === 'child';
    const dislikeRoll = isChild ? this.fullness * 0.08 + 0.05 : 0;
    const disliked = rollDisliked(this.fullness) || Math.random() < dislikeRoll;

    this.eat = beginEating(fx, fy, color, disliked);
    this.mealsEaten++;
    this.exp.meals++;
    this.fullness = Math.min(1, this.fullness + 0.28);

    if (disliked) {
      // disliked food: mood drops, energy dips a bit, triggers nausea mouth
      this.happiness = Math.max(0, this.happiness - 8 - Math.random() * 12);
      this.energyStat = Math.max(0, this.energyStat - 4);
      this.pushMood(-0.32 - Math.random() * 0.25, 0.35 + Math.random() * 0.3);
      this.mouth.playById(Math.random() < 0.6 ? 'nausea_gag' : 'disgust_tongue');
      this.eyes.playById(Math.random() < 0.5 ? 'disgust_recoil' : 'suspicious_slit');
      opts?.onBehavior?.(disliked ? `${this.cfg.name} — фу, не понравилось` : `${this.cfg.name} жуёт`);
    } else {
      this.happiness = Math.min(100, this.happiness + 9 + Math.random() * 6);
      this.energyStat = Math.min(100, this.energyStat + 6);
      // happy eating mouth
      const chewPick = Math.random() < 0.5 ? 'chew_rhythmic' : 'chew_side';
      this.mouth.playById(chewPick);
    }

    // rolls its own enjoyment reaction for this particular meal
    const meal = rollMealFX(this.fullness, this.mind.personality.playfulness);
    if (!disliked) {
      if (meal.sound && opts?.fxSettings?.foodSound) {
        for (let i = 0; i < meal.crunchCount; i++) {
          setTimeout(() => soundFx.playMunch(), i * 90);
        }
      }
      if (meal.ripple && opts?.fxSettings?.foodRipple && opts.onRipple) {
        opts.onRipple(fx, fy, meal.rippleScale, meal.rippleCount, meal.rippleColor);
      }
      if (meal.label && Math.random() < 0.5) opts?.onBehavior?.(meal.label);

      // eating genuinely lifts the mood, scaled by how hungry it was
      const hunger = 1 - this.fullness;
      const isEcstatic = meal.reaction === 'ecstatic';
      this.pushMood(0.12 + (isEcstatic ? 0.2 : 0.1), 0.14 + hunger * 0.12);
    } else {
      // disliked: still some ripple but different colour, and a gag sound
      if (opts?.fxSettings?.foodRipple && opts.onRipple) {
        opts.onRipple(fx, fy, 0.7, 2, 'rgba(180,220,120,0.45)');
      }
      if (opts?.fxSettings?.foodSound) {
        setTimeout(() => soundFx.playChirp('annoyed'), 80);
      }
    }

    // personality nudge — food makes it friendlier (even if disliked, a bit)
    const P = this.mind.personality;
    P.sociability = Math.min(1, P.sociability + (disliked ? 0.005 : 0.02));
    P.playfulness = Math.min(1, P.playfulness + (disliked ? 0.002 : 0.015));
  }

  private spawnCrumbs(n: number, kind: Crumb['kind'], color: string, w: number, h: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = kind === 'sparkle' ? 0.6 + Math.random() * 2.4 : 1 + Math.random() * 3.6;
      this.crumbs.push({
        x: this.x + (Math.random() - 0.5) * w * 0.5,
        y: this.y + h * 0.12 + (Math.random() - 0.5) * h * 0.25,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - (kind === 'crumb' ? 0.5 : 1.6),
        life: 0,
        max: kind === 'sparkle' ? 0.5 + Math.random() * 0.8 : 0.6 + Math.random() * 0.9,
        color,
        size: kind === 'heart' ? 4 + Math.random() * 4 : 1.5 + Math.random() * 2.8,
        kind,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 6,
      });
    }
  }

  private updateEating(dt: number, globalScale: number) {
    if (!this.eat) return;
    const w = this.bodyW(globalScale);
    const h = this.bodyH(globalScale);
    const prevPhase = this.eat.phase;
    const alive = stepEating(this.eat, dt);
    const e = this.eat;

    if (e.emitCrumbs) this.spawnCrumbs(3 + Math.floor(Math.random() * 5), 'crumb', e.foodColor, w, h);
    if (e.emitSparkle) this.spawnCrumbs(1 + Math.floor(Math.random() * 3), 'sparkle', '#FFFFFF', w, h);
    if (e.emitHearts) this.spawnCrumbs(2 + Math.floor(Math.random() * 3), 'heart', '#FB7185', w, h);
    if (e.playCrunch) soundFx.playMunch();
    if (e.playGulp) soundFx.playChirp('happy');

    // feed the body
    this.vScaleY -= e.squash * 0.12;
    this.vScaleX += e.squash * 0.10;
    this.rotation += (e.tilt - this.rotation) * 0.14;

    // eye cues change as the meal progresses
    const cue = eatEyeCue(e);
    if (cue && Math.random() < 0.06) {
      const known = BEHAVIORS.some((b) => b.cat === cue);
      if (known) this.eyes.playCategory(cue as never);
      else this.eyes.setMood(cue as never);
    }

    // mouth cues — complex, realistic, unpredictable
    if (e.phase !== prevPhase) {
      if (e.disliked) {
        if (e.phase === 'bite') this.mouth.playById('spit_out');
        else if (e.phase === 'chew') this.mouth.playById(Math.random() < 0.5 ? 'nausea_pre' : 'disgust_nose');
        else if (e.phase === 'savour') this.mouth.playById('nausea_gag');
        else if (e.phase === 'afterglow') this.mouth.playById('disgust_tongue');
        else if (e.phase === 'greedy') this.mouth.playById('bleh_face');
      } else {
        if (e.phase === 'notice') this.mouth.playById('o_small');
        else if (e.phase === 'sniff') this.mouth.playById('food_gaze');
        else if (e.phase === 'bite') this.mouth.playById('crunch_loud');
        else if (e.phase === 'chew') {
          const pick = Math.random() < 0.5 ? 'chew_rhythmic' : 'chew_side';
          this.mouth.playById(pick);
        } else if (e.phase === 'savour') {
          const pick = Math.random() < 0.5 ? 'savour_mmm' : 'savour_big';
          this.mouth.playById(pick);
        } else if (e.phase === 'afterglow') {
          this.mouth.playById(Math.random() < 0.6 ? 'smile_wide' : 'lick_lips');
        } else if (e.phase === 'greedy') {
          this.mouth.playById('food_gaze');
        }
      }
    } else {
      // during chew, occasionally switch side or lick
      if (e.phase === 'chew' && Math.random() < 0.04) {
        this.mouth.playById(Math.random() < 0.5 ? 'chew_rhythmic' : 'chew_side');
      }
      if (e.phase === 'savour' && Math.random() < 0.02) {
        this.mouth.playById('lick_lips');
      }
    }

    if (!alive) {
      this.eat = null;
      // after meal, a lingering satisfaction or disgust
      if (e.disliked) {
        this.mouth.playById('bleh_face');
        this.pushMood(-0.18, 0.18);
      } else {
        this.mouth.playById(Math.random() < 0.5 ? 'smile_soft' : 'savour_mmm');
        this.pushMood(0.22, 0.12);
      }
    }
  }

  private updateCrumbs(dt: number) {
    for (let i = this.crumbs.length - 1; i >= 0; i--) {
      const c = this.crumbs[i];
      c.life += dt;
      c.x += c.vx;
      c.y += c.vy;
      c.rot += c.vrot * dt;
      if (c.kind === 'crumb') c.vy += 0.22;
      else c.vy -= 0.04;
      c.vx *= 0.97;
      c.vy *= 0.97;
      if (c.life >= c.max) this.crumbs.splice(i, 1);
    }
  }

  private drawCrumbs(ctx: CanvasRenderingContext2D) {
    for (const c of this.crumbs) {
      const a = 1 - c.life / c.max;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      if (c.kind === 'heart') {
        ctx.fillStyle = c.color;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 8;
        const s = c.size;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.35);
        ctx.bezierCurveTo(s, -s * 0.4, s * 0.4, -s, 0, -s * 0.35);
        ctx.bezierCurveTo(-s * 0.4, -s, -s, -s * 0.4, 0, s * 0.35);
        ctx.fill();
      } else if (c.kind === 'sparkle') {
        ctx.strokeStyle = c.color;
        ctx.shadowColor = c.color;
        ctx.shadowBlur = 10;
        ctx.lineWidth = 1.3;
        const s = c.size * 2;
        ctx.beginPath();
        ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
        ctx.moveTo(0, -s); ctx.lineTo(0, s);
        ctx.stroke();
      } else {
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.arc(0, 0, c.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /* ---------------- main update ---------------- */

  update(
    dt: number,
    now: number,
    env: {
      width: number; height: number;
      mx: number; my: number;
      cursorVX: number; cursorVY: number; cursorSpeed: number;
      food: { x: number; y: number }[];
      tool: string;
      globalScale: number;
      centerMode: string;
      autoReturnDelay: number;
      springStiffness: number;
      tempoRate: number;
      fxSettings: { impactRipple: boolean; impactSound: boolean; foodRipple: boolean; foodSound: boolean };
      /** 0…1 — how much it craves company right now */
      socialPull: number;
      moodVolatility: number;
      motionEnergy: number;
      maxSpeed: number;
      restitution: number;
      softBodyJiggle: number;
      hoverBob: number;
      turnTilt: number;
      eyeTracking: number;
      blinkRate: number;
      saccadeAmount: number;
      glintBrightness: number;
      eyeFreedom: number;
      appetite: number;
      stubbornness: number;
      others: CreatureEntity[];
      social?: SocialDirective | null;
      foodOrbs?: { id: string; x: number; y: number; age: number }[];
      onBehavior?: (name: string) => void;
      onRipple?: (x: number, y: number, scale: number, count: number, color: string) => void;
    }
  ) {
    const { width, height, mx, my, globalScale, centerMode } = env;
    this.eyes.update(dt);
    this.mouth.update(dt);
    this.updateEating(dt, globalScale);
    this.updateCrumbs(dt);
    this.driftAppetite(dt);
    this.updateMood(dt);
    this.social = env.social ?? null;

    // счастье и энергия теперь ЖИВЫЕ — отражают валентность/возбуждение и энергию мозга, а не статику
    const targetHappy = clamp(50 + this.valence * 42 + this.arousal * 6 + (this.temperament.cheer - 0.5) * 10, 5, 98);
    this.happiness += (targetHappy - this.happiness) * Math.min(1, dt * 1.4);
    // лёгкая микро-дрожь чтобы было видно жизнь даже в покое
    this.happiness = clamp(this.happiness + Math.sin(performance.now() * 0.0013 + this.cfg.tempo * 2.1) * 0.05, 0, 100);
    const targetEnergy = clamp(this.mind.getEnergy() * 100 * (0.88 + this.arousal * 0.14), 4, 100);
    this.energyStat += (targetEnergy - this.energyStat) * Math.min(1, dt * 1.9);
    this.curiosityStat = clamp(this.mind.personality.curiosity * 100, 5, 100);

    // Autonomous mouth twitches — mood-driven, completely random timing
    this.mouthTwitchT += dt;
    if (!this.eat && !this.isDragging && !this.isBursting()) {
      const nextMouthIn = 2.5 + Math.random() * 5.5 - this.arousal * 1.2 - Math.abs(this.valence) * 0.8;
      if (this.mouthTwitchT > nextMouthIn) {
        this.mouthTwitchT = 0;
        const v = this.valence;
        const a = this.arousal;
        const roll = Math.random();
        if (this.social) {
          if (this.social.tone === 'warm') this.mouth.playCategory('happy');
          else if (this.social.tone === 'annoyed') this.mouth.playCategory('angry');
          else if (this.social.tone === 'wary') this.mouth.playCategory('sad');
          else this.mouth.playCategory('social');
        } else if (v > 0.5) {
          if (a > 0.6) this.mouth.playById(roll < 0.5 ? 'laugh_open' : 'laugh_burst');
          else this.mouth.playById(roll < 0.5 ? 'smile_wide' : 'grin_teeth');
        } else if (v > 0.15) {
          this.mouth.playById(roll < 0.5 ? 'smile_soft' : 'content_hum');
        } else if (v < -0.45) {
          if (a > 0.6) this.mouth.playById(roll < 0.5 ? 'shout_angry' : 'snarl_upper');
          else this.mouth.playById(roll < 0.5 ? 'frown_deep' : 'cry_open');
        } else if (v < -0.15) {
          this.mouth.playById(roll < 0.5 ? 'frown_soft' : 'pout_sulky');
        } else {
          if (Math.random() < 0.5) this.mouth.triggerRandom();
        }
        this.lastReaction = now;
      }
    }

    // Update burst deconstruction & quantum reassembly
    if (this.isBursting()) {
      this.burst.update(dt, { w: width, h: height });
      if (this.burst.phase === 'charge') {
        // High-frequency quantum shudder
        this.vScaleX = (Math.random() - 0.5) * 0.25;
        this.vScaleY = (Math.random() - 0.5) * 0.25;
        this.vRotation = (Math.random() - 0.5) * 0.15;
      }
      if (this.burst.phase === 'shatter' || this.burst.phase === 'vortex' || this.burst.phase === 'reassemble') {
        // Physical body is deconstructed into shards
        this.action = null;
        this.eat = null;
        return;
      }
    }

    // fullness slowly decays so it wants food again later
    this.fullness = Math.max(0, this.fullness - dt * 0.012);

    const perception: Perception = {
      cursorDist: Math.hypot(mx - this.x, my - this.y),
      cursorSpeed: env.cursorSpeed,
      cursorMoving: env.cursorSpeed > 1.2,
      idleTime: (now - this.lastInteraction) / 1000,
      foodNear: this.fullness > 0.8 ? 0 : env.food.length,
      laserActive: env.tool === 'laser',
      canTravel: centerMode !== 'locked',
      energy: this.mind.getEnergy(),
      atEdge: this.x < 140 || this.x > width - 140 || this.y < 140 || this.y > height - 140,
      recentlyPoked: (now - this.lastPoke) / 1000,
      socialPull: env.socialPull ?? 0,
      moodVolatility: env.moodVolatility,
    };

    // feed emotion into the mind so it converts into motion appetite
    this.mind.setEmotion(this.valence, this.arousal, env.moodVolatility);

    this.mind.setAllowTravel(centerMode !== 'locked');
    this.mind.setTempo(clamp(this.cfg.tempo * env.tempoRate, 0.5, 8));

    const busyEating = this.eat !== null;

    /* ---------- SOCIAL OVERRIDE ---------- */
    const soc = this.social;
    const now2 = performance.now();
    this.socialLabel = soc?.label ?? null;

    if (soc && !busyEating && !this.isDragging) {
      // a social action outranks whatever the solo mind wanted
      const needsRestart = soc.action && (this.socialActionId !== soc.action || !this.action);
      if (needsRestart) {
        const def = ACTIONS.find((a) => a.id === soc.action);
        if (def) {
          this.action = startAction(def, this.actionCtx);
          const changed = this.socialActionId !== soc.action;
          this.socialActionId = soc.action;
          if (changed && soc.label) env.onBehavior?.(soc.label);
        }
      } else if (!soc.action) {
        this.socialActionId = null;
      }
      // social eye reactions fire on their own irregular rhythm
      if (soc.eyes && now2 - this.lastSocialEyes > 900 + Math.random() * 2600) {
        this.lastSocialEyes = now2;
        const known = BEHAVIORS.some((b) => b.cat === soc.eyes);
        if (known) this.eyes.playCategory(soc.eyes as never);
        else this.eyes.setMood(soc.eyes as never);
        if (soc.label) env.onBehavior?.(soc.label);
      }
      // game-specific eye flourish, fired on the game's own irregular beat
      if (soc.action && now2 - this.lastSocialEyes > 1500 && Math.random() < dt * 1.6) {
        const flourish: Record<string, string> = {
          chase_partner: 'soc_tag_thrill',
          flee_partner: 'soc_panic_flee',
          waltz_partner: 'soc_dizzy_together',
          whisper_partner: 'soc_conspire_wink',
          spook_sneak_partner: 'soc_peekaboo_reveal',
          huddle_partner: 'soc_warm_gaze',
          comfort_partner: 'soc_comfort_soft',
          nap_cuddle_partner: 'soc_sleepy_cuddle',
          stand_off_partner: 'soc_rivalry_fire',
          standoff_partner: 'soc_rivalry_fire',
          bump_partner: 'soc_tag_thrill',
          gift_partner: 'soc_gift_proud',
          guard_partner: 'soc_guard_vigil',
          showoff_partner: 'soc_showoff_grin',
          side_by_side_partner: 'soc_shared_curiosity',
          follow_partner: 'soc_curious_sniff',
          lead_partner: 'soc_showoff_grin',
          mirror_partner: 'soc_mimic',
          orbit_partner: 'soc_sparkle_eyes',
          boop_partner: 'soc_mocking_tongue',
          acrobat_partner: 'soc_tag_thrill',
          hide_from_partner: 'soc_shy_peek',
          face_partner: 'soc_stare_lock',
          avoid_partner: 'soc_scoff',
          greet_partner: 'soc_greet',
        };
        const id = flourish[soc.action];
        if (id && Math.random() < 0.55) {
          this.eyes.playById(id);
          this.lastSocialEyes = now2;
        }
      }
    } else {
      this.socialActionId = null;
    }

    /* ---------- SPONTANEOUS FOOD CURIOSITY ---------- */
    if (!busyEating && !this.isDragging && !this.action && env.foodOrbs?.length) {
      // completely unscheduled — a random urge to go look at a snack
      if (Math.random() < dt * 0.22) {
        const candidates = env.foodOrbs
          .filter((f) => this.appetiteFor(f.id, f.age) > 0.12)
          .sort((a, b) => Math.hypot(a.x - this.x, a.y - this.y) - Math.hypot(b.x - this.x, b.y - this.y));
        const target = candidates[Math.floor(Math.random() * Math.min(3, candidates.length))];
        if (target) {
          const def = ACTIONS.find((a) => a.id === 'inspect_food');
          if (def && centerMode !== 'locked') {
            this.focusFoodId = target.id;
            this.actionCtx.focusFood = { x: target.x, y: target.y };
            this.action = startAction(def, this.actionCtx);
            env.onBehavior?.(`${this.cfg.name} eyes the snack`);
            if (Math.random() < 0.5) this.eyes.playCategory('attention' as never);
          }
        }
      }
    }

    // if the inspect action ended without eating, it may snub that orb
    if (this.focusFoodId && !this.action && !this.eat) {
      if (Math.random() < 0.55) this.snub(this.focusFoodId);
      this.focusFoodId = null;
      this.actionCtx.focusFood = null;
    }

    const socialBusy = !!(soc && soc.action);
    const decision = (this.isDragging || busyEating || socialBusy)
      ? { type: 'none' as const }
      : this.mind.update(dt, perception);

    if (decision.type !== 'none') {
      switch (decision.type) {
        case 'plan':
          if (decision.intent) env.onBehavior?.(decision.intent);
          break;
        case 'eyesRandom':
          this.eyes.triggerRandomBehavior();
          env.onBehavior?.(this.eyes.getBehaviorName());
          break;
        case 'eyesProc':
          this.eyes.play(generateProceduralBehavior());
          env.onBehavior?.(this.eyes.getBehaviorName());
          break;
        case 'eyes':
          if (decision.cat) {
            const known = BEHAVIORS.some((b) => b.cat === decision.cat);
            if (known) this.eyes.playCategory(decision.cat as never);
            else this.eyes.setMood(decision.cat as never);
            env.onBehavior?.(decision.intent ?? this.eyes.getBehaviorName());
          }
          break;
        case 'action': {
          if (decision.actionId) {
            const def = ACTIONS.find((a) => a.id === decision.actionId);
            if (def) {
              this.action = startAction(def, this.actionCtx);
              env.onBehavior?.(def.label);
            }
          }
          break;
        }
        case 'jump':
          this.doJump(decision.power ?? 1, centerMode);
          break;
        case 'hop':
          this.doJump(0.45 + Math.random() * 0.2, centerMode);
          break;
      }
    }

    // spontaneous organic flight twitches & rare jumps
    if (!this.isDragging && !this.isJumping && !this.action && !busyEating) {
      const tw = this.mind.randomTwitch(dt);
      const rr = (a: number, b: number) => a + Math.random() * (b - a);
      const L = this.mind.liveliness;
      if (tw === 'jump') {
        this.doJump(rr(0.8, 1.2), centerMode);
      } else if (tw === 'hop') {
        this.doJump(rr(0.35, 0.6), centerMode);
      } else if (tw === 'glide') {
        // smooth graceful drift in a chosen direction — livelier = farther
        const ang = Math.random() * Math.PI * 2;
        const f = rr(3, 7) * (0.6 + L * 0.7);
        this.vx += Math.cos(ang) * f;
        this.vy += Math.sin(ang) * f;
      } else if (tw === 'swoop') {
        // sudden darting arc
        const ang = Math.random() * Math.PI * 2;
        const f = rr(9, 18) * (0.55 + L * 0.6);
        this.vx += Math.cos(ang) * f;
        this.vy += Math.sin(ang) * f;
        this.vScaleX = -0.12;
        this.vScaleY = 0.12;
      } else if (tw === 'kick') {
        this.vx += (Math.random() - 0.5) * rr(5, 14) * (0.6 + L * 0.6);
        this.vy += (Math.random() - 0.5) * rr(5, 14) * (0.6 + L * 0.6);
      } else if (tw === 'wiggle') {
        // playful shimmy with no travel at all
        this.vRotation += (Math.random() - 0.5) * 0.5 * (0.6 + L);
        this.verts.forEach((v) => { v.vy += (Math.random() - 0.5) * 4 * (0.5 + L * 0.6); });
      }
    }

    // refresh action context
    this.actionCtx.self.x = this.x;
    this.actionCtx.self.y = this.y;
    this.actionCtx.cursor = { x: mx, y: my, vx: env.cursorVX, vy: env.cursorVY, speed: env.cursorSpeed };
    this.actionCtx.bounds = { w: width, h: height, mx: 90 * globalScale * this.sizeMul, my: 90 * globalScale * this.sizeMul };
    this.actionCtx.center = { x: width / 2, y: height / 2 };
    this.actionCtx.home = this.home;
    this.actionCtx.food = this.fullness > 0.8 ? [] : env.food;
    this.actionCtx.tool = env.tool;
    this.actionCtx.energy = this.mind.getEnergy();
    this.actionCtx.canTravel = centerMode !== 'locked';
    this.actionCtx.partner = soc?.partner ?? null;
    if (this.focusFoodId && env.foodOrbs) {
      const f = env.foodOrbs.find((o) => o.id === this.focusFoodId);
      this.actionCtx.focusFood = f ? { x: f.x, y: f.y } : null;
      if (!f) this.focusFoodId = null;
    }

    let actionRot = 0;
    let actionSquish = 0;
    let actionActive = false;

    if (this.action && !this.isDragging && !busyEating) {
      const body = { x: this.x, y: this.y, vx: this.vx, vy: this.vy, targetX: this.targetX, targetY: this.targetY };
      const res = stepAction(this.action, body, dt, this.actionCtx);
      this.targetX = body.targetX;
      this.targetY = body.targetY;
      this.vx = body.vx;
      this.vy = body.vy;
      actionRot = res.rot;
      actionSquish = res.squish;
      actionActive = true;
      if (res.done) {
        this.action = null;
        this.mind.finishAction();
        if (centerMode !== 'locked') {
          const mm = 70 * globalScale * this.sizeMul;
          this.home.x = clamp(this.x, mm, width - mm);
          this.home.y = clamp(this.y, mm, height - mm);
        }
      }
    }

    /* ---------- physics ---------- */
    const approxW = this.baseWidth * globalScale * this.sizeMul * this.scaleX;
    const approxH = this.baseHeight * globalScale * this.sizeMul * this.scaleY;
    const marginX = approxW * 0.52 + 18;
    const marginY = approxH * 0.52 + 18;

    if (this.isDragging) {
      this.targetX = mx - this.dragOffsetX;
      this.targetY = my - this.dragOffsetY;
      this.x = this.targetX;
      this.y = this.targetY;
      this.rotation = clamp(this.vx * 0.02, -0.4, 0.4);
    } else if (this.isJumping) {
      this.jumpTimer += dt;
      if (this.jumpPhase === 1 && this.jumpTimer > 0.08) {
        this.jumpPhase = 2;
        this.vy = (-18 - Math.random() * 4) * this.jumpPower;
        this.vScaleY = 0.38 * this.jumpPower;
        this.vScaleX = -0.24 * this.jumpPower;
        this.vRotation = (Math.random() - 0.5) * 0.3 * this.jumpPower;
      } else if (this.jumpPhase === 2) {
        this.vy += 0.8;
        this.y += this.vy;
        this.rotation += this.vRotation;
        if (this.y >= this.jumpOrigin.y) {
          this.y = this.jumpOrigin.y;
          this.vy = 0; this.vRotation = 0; this.rotation = 0;
          this.jumpPhase = 3;
          this.vScaleY = -0.34; this.vScaleX = 0.3;
          this.jumpTimer = 0;
          this.handleImpact(5 + Math.random() * 3, this.x, this.y + approxH / 2, {
            fx: env.fxSettings,
            mood: this.moodWord,
            isLanding: true,
            onRipple: (rx, ry, s, c, col) => env.onRipple?.(rx, ry, s, c, col),
            onBehavior: env.onBehavior,
            onEyes: (cat) => {
              const known = BEHAVIORS.some((b) => b.cat === cat);
              if (known) this.eyes.playCategory(cat as never);
              else this.eyes.setMood(cat as never);
            },
          });
        }
      } else if (this.jumpPhase === 3 && this.jumpTimer > 0.15) {
        this.isJumping = false;
        this.jumpPhase = 0;
      }
    } else if (busyEating) {
      // during a meal it holds position; the hop is a visual offset (see draw)
      this.x += (this.targetX - this.x) * 0.06;
      this.y += (this.targetY - this.y) * 0.06;
    } else {
      const idleTime = now * 0.002;
      const bobX = Math.sin(idleTime * 0.7 + this.cfg.tempo) * 11 * this.sizeMul;
      const bobY = Math.cos(idleTime * 1.1 + this.cfg.tempo) * 13 * this.sizeMul;
      const cx = width / 2;
      const cy = height / 2;
      const idleFor = (now - this.lastInteraction) / 1000;

      if (centerMode === 'locked') {
        this.home.x = cx; this.home.y = cy; this.shouldReturn = true;
      } else if (centerMode === 'free') {
        this.shouldReturn = false;
      } else {
        this.shouldReturn = idleFor > env.autoReturnDelay;
        if (this.shouldReturn) { this.home.x = cx; this.home.y = cy; }
      }

      const speed = Math.hypot(this.vx, this.vy);
      const hasThrow = speed > 0.25 && centerMode !== 'locked';

      if (actionActive) {
        const dxA = this.targetX - this.x;
        const dyA = this.targetY - this.y;
        const k = 0.11;
        this.x += dxA * k;
        this.y += dyA * k;
        this.vx = dxA * k * 0.6;
        this.vy = dyA * k * 0.6;

        let b = false;
        if (this.x <= marginX) { this.x = marginX; b = true; }
        else if (this.x >= width - marginX) { this.x = width - marginX; b = true; }
        if (this.y <= marginY) { this.y = marginY; b = true; }
        else if (this.y >= height - marginY) { this.y = height - marginY; b = true; }
        if (b) { this.vScaleX = (Math.random() - 0.5) * 0.14; this.vScaleY = (Math.random() - 0.5) * 0.14; }

        const tr = Math.abs(actionRot) > 0.001 ? actionRot : clamp((mx - this.x) * 0.0006, -0.25, 0.25);
        this.rotation += (tr - this.rotation) * 0.14;
        if (Math.abs(actionSquish) > 0.001) {
          this.scaleX += actionSquish * 0.35;
          this.scaleY -= actionSquish * 0.35;
        }
      } else if (hasThrow) {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.975;
        this.vy *= 0.975;

        let bounced = false;
        if (this.x <= marginX) { this.x = marginX; this.vx = Math.abs(this.vx) * 0.62; bounced = true; }
        else if (this.x >= width - marginX) { this.x = width - marginX; this.vx = -Math.abs(this.vx) * 0.62; bounced = true; }
        if (this.y <= marginY) { this.y = marginY; this.vy = Math.abs(this.vy) * 0.62; bounced = true; }
        else if (this.y >= height - marginY) { this.y = height - marginY; this.vy = -Math.abs(this.vy) * 0.62; bounced = true; }

        if (bounced) {
          // every collision rolls a completely fresh reaction
          const speedBefore = speed;
          this.handleImpact(speedBefore, this.x, this.y, {
            fx: env.fxSettings,
            mood: this.moodWord,
            onRipple: (rx, ry, scale, count, color) =>
              env.onRipple?.(rx, ry, scale, count, color),
            onBehavior: env.onBehavior,
            onEyes: (cat) => {
              const known = BEHAVIORS.some((b) => b.cat === cat);
              if (known) this.eyes.playCategory(cat as never);
              else this.eyes.setMood(cat as never);
            },
          });
          this.lastInteraction = now;
        }

        if (Math.hypot(this.vx, this.vy) < 0.35) {
          this.vx = 0; this.vy = 0;
          this.home.x = clamp(this.x, marginX, width - marginX);
          this.home.y = clamp(this.y, marginY, height - marginY);
        } else {
          this.rotation = clamp(this.vx * 0.03, -0.55, 0.55);
        }
        this.x += bobX * 0.12;
        this.y += bobY * 0.12;
      } else if (centerMode !== 'locked' && !this.shouldReturn) {
        // ===== FREE ROAM AUTONOMOUS FLIGHT (smooth & sudden gliding) =====
        // Liveliness scales everything: a joyful creature surges, a glum one crawls
        const L = this.mind.liveliness * env.motionEnergy;
        const nt = now * 0.00075 + this.cfg.tempo * 19;
        // heading wanders faster when lively
        const headRate = 1.3 * (0.7 + L * 0.5);
        const ang = Math.sin(nt * headRate) * Math.PI + Math.cos(nt * 0.77) * 2;
        const surge = (0.8 + Math.sin(nt * 2.1) * 1.4) * (0.45 + L * 0.75);
        this.vx += Math.cos(ang) * surge * 0.18;
        this.vy += Math.sin(ang) * surge * 0.18;
        // energetic bursts: lively creatures get random speed kicks
        if (Math.random() < 0.006 * L) {
          const ka = Math.random() * Math.PI * 2;
          this.vx += Math.cos(ka) * 4 * L;
          this.vy += Math.sin(ka) * 4 * L;
        }
        // clamp to the user's max speed
        const spCap = env.maxSpeed * (0.55 + L * 0.45);
        const spNow = Math.hypot(this.vx, this.vy);
        if (spNow > spCap) { this.vx = (this.vx / spNow) * spCap; this.vy = (this.vy / spNow) * spCap; }
        const dragF = 0.97 - Math.min(0.03, L * 0.012);
        this.vx *= dragF;
        this.vy *= dragF;
        this.x += this.vx;
        this.y += this.vy;

        // soft contact with a wall (flying slowly) or a real bounce
        const touchSpeed = Math.hypot(this.vx, this.vy);
        const side: 'left' | 'right' | 'top' | 'bottom' | null =
          this.x <= marginX ? 'left' : this.x >= width - marginX ? 'right'
          : this.y <= marginY ? 'top' : this.y >= height - marginY ? 'bottom' : null;

        if (this.x <= marginX) { this.x = marginX; this.vx = Math.abs(this.vx) * env.restitution; }
        else if (this.x >= width - marginX) { this.x = width - marginX; this.vx = -Math.abs(this.vx) * env.restitution; }
        if (this.y <= marginY) { this.y = marginY; this.vy = Math.abs(this.vy) * env.restitution; }
        else if (this.y >= height - marginY) { this.y = height - marginY; this.vy = -Math.abs(this.vy) * env.restitution; }

        if (side && now - this.lastTouchAt > 1400) {
          this.lastTouchAt = now;
          if (touchSpeed > 2.4) {
            this.handleImpact(touchSpeed, this.x, this.y, {
              fx: env.fxSettings,
              mood: this.moodWord,
              onRipple: (rx, ry, s, c, col) => env.onRipple?.(rx, ry, s, c, col),
              onBehavior: env.onBehavior,
              onEyes: (cat) => {
                const known = BEHAVIORS.some((b) => b.cat === cat);
                if (known) this.eyes.playCategory(cat as never);
                else this.eyes.setMood(cat as never);
              },
            });
          } else {
            // grazing contact — up to and including total indifference
            this.handleTouch(side, {
              fx: env.fxSettings,
              mood: this.moodWord,
              onRipple: (rx, ry, s, c, col) => env.onRipple?.(rx, ry, s, c, col),
              onBehavior: env.onBehavior,
              onEyes: (cat) => {
                const known = BEHAVIORS.some((b) => b.cat === cat);
                if (known) this.eyes.playCategory(cat as never);
                else this.eyes.setMood(cat as never);
              },
            });
          }
        }

        this.targetX = this.x + this.vx * 4;
        this.targetY = this.y + this.vy * 4;
        const tr = clamp(this.vx * 0.035 * env.turnTilt, -0.32, 0.32);
        this.rotation += (tr - this.rotation) * 0.12;
      } else {
        const ax = cx;
        const ay = cy;
        this.targetX = ax + bobX;
        this.targetY = ay + bobY;
        this.x += (this.targetX - this.x) * 0.045;
        this.y += (this.targetY - this.y) * 0.045;
        const tr = clamp((mx - this.x) * 0.0006, -0.25, 0.25);
        this.rotation += (tr - this.rotation) * 0.1;
      }
    }

    // gentle separation so creatures don't overlap
    for (const o of env.others) {
      if (o === this) continue;
      const dx = this.x - o.x;
      const dy = this.y - o.y;
      const d = Math.hypot(dx, dy) || 1;
      const minD = (approxW + o.bodyW(globalScale)) * 0.42;
      if (d < minD) {
        const push = (minD - d) / minD;
        this.x += (dx / d) * push * 2.2;
        this.y += (dy / d) * push * 2.2;
      }
    }

    // clamp
    const m = 40 * globalScale * this.sizeMul;
    if (centerMode === 'locked') {
      this.x = clamp(this.x, m, width - m);
      this.y = clamp(this.y, m, height - m);
    } else {
      this.x = clamp(this.x, m * 0.6, width - m * 0.6);
      this.y = clamp(this.y, m * 0.6, height - m * 0.6);
    }

    // scale springs
    const k = env.springStiffness;
    const damp = 0.78;
    this.vScaleX += (1 - this.scaleX) * k; this.vScaleX *= damp; this.scaleX += this.vScaleX;
    this.vScaleY += (1 - this.scaleY) * k; this.vScaleY *= damp; this.scaleY += this.vScaleY;
  }

  /** set each frame from the settings so the bounce amplitude is tunable */
  hoverBobScale = 1;
  /** soft-body wobble amount, set each frame */
  jiggleScale = 1;
  /** how much it leans into turns, set each frame */
  tiltScale = 1;

  doJump(power: number, centerMode: string) {
    if (centerMode === 'locked') return;
    if (this.isJumping || this.isDragging || this.eat || this.isBursting()) return;
    this.isJumping = true;
    this.jumpPhase = 1;
    this.jumpTimer = 0;
    this.jumpPower = power;
    this.jumpOrigin = { x: this.x, y: this.y };
    soundFx.playBounce(0.9 + power * 0.4);
    this.vScaleX = 0.22 * power;
    this.vScaleY = -0.28 * power;
  }

  isBursting(): boolean {
    return this.burst.phase !== 'none' && this.burst.phase !== 'done';
  }

  triggerBurst(globalScale = 1, onBehavior?: (text: string) => void) {
    if (this.isBursting()) return;
    const curW = this.bodyW(globalScale);
    const curH = this.bodyH(globalScale);
    this.action = null;
    this.eat = null;
    this.vx = 0;
    this.vy = 0;
    this.isDragging = false;
    this.isJumping = false;
    this.eyes.playById('shock_freeze');
    onBehavior?.(`${this.cfg.name} — ${t('burst.overload')}`);

    this.burst.trigger(this.x, this.y, curW, curH, this.cfg.tint, () => {
      // Quantum Respawn Reassembly Callback:
      this.x = this.burst.respawnX;
      this.y = this.burst.respawnY;
      this.targetX = this.x;
      this.targetY = this.y;
      this.vx = 0;
      this.vy = 0;
      this.rotation = 0;
      this.vRotation = 0;
      // Elastic rebirth squash & bounce
      this.scaleX = 1.35;
      this.scaleY = 0.65;
      this.vScaleX = -0.3;
      this.vScaleY = 0.35;
      this.energyStat = Math.min(100, this.energyStat + 25);
      this.happiness = Math.min(100, this.happiness + 20);
      this.pushMood(0.35, 0.45);
      this.eyes.playById('awaken_fresh');
      onBehavior?.(`${this.cfg.name} — ${t('burst.reconstituted')}`);
      soundFx.playChirp('happy');
    });
  }

  /* ---------------- draw ---------------- */

  draw(
    ctx: CanvasRenderingContext2D,
    env: {
      mx: number; my: number;
      globalScale: number;
      cornerRoundness: number;
      bodyMaterial: string;
      showShadow: boolean;
      showRimLight: boolean;
      themeCategory: string;
      themeShadow: string;
      height: number;
      eyeTracking?: number;
      blinkRate?: number;
      saccadeAmount?: number;
      glintBrightness?: number;
      eyeFreedom?: number;
      eyeScale?: number;
      showMouths?: boolean;
      mouthScale?: number;
      showTears?: boolean;
      showDrool?: boolean;
      showNicks?: boolean;
    }
  ) {
    const curW = this.bodyW(env.globalScale);
    const curH = this.bodyH(env.globalScale);

    // When shattered into quantum shards, render the deconstruction & reassembly scene instead
    if (this.burst.phase === 'shatter' || this.burst.phase === 'vortex' || this.burst.phase === 'reassemble') {
      this.burst.draw(ctx);
      return;
    }

    this.drawCrumbs(ctx);

    // eating hop + mood breathing bounce are pure visual offsets (never move the body)
    const eatLift = this.eat ? this.eat.lift : 0;
    const moodBounce = this.eat ? 0 : this.mind.bodyBounce * this.hoverBobScale;
    // Jitter if charging burst
    const chargeJitterX = this.burst.phase === 'charge' ? (Math.random() - 0.5) * 7 : 0;
    const chargeJitterY = this.burst.phase === 'charge' ? (Math.random() - 0.5) * 7 : 0;

    ctx.save();
    ctx.translate(this.x + chargeJitterX, this.y + eatLift + moodBounce + chargeJitterY);
    ctx.rotate(this.rotation);
    try {

    const baseVerts = getBasePentagonVertices(curW, curH);
    const jig = this.jiggleScale;
    const vertices: Point[] = baseVerts.map((bp, i) => {
      const o = this.verts[i];
      o.vx += -o.x * 0.2; o.vx *= 0.75; o.x += o.vx * jig;
      o.vy += -o.y * 0.2; o.vy *= 0.75; o.y += o.vy * jig;
      return { x: bp.x + o.x, y: bp.y + o.y };
    });

    // shadow
    if (env.showShadow) {
      const lift = clamp((env.height / 2 - this.y) / 220, 0, 1.4);
      const ss = clamp(1 - lift * 0.55, 0.25, 1);
      const sa = clamp(1 - lift * 0.7, 0.15, 1);
      ctx.save();
      ctx.filter = 'blur(14px)';
      ctx.globalAlpha = sa * (env.themeCategory === 'light' ? 0.55 : 0.9);
      ctx.beginPath();
      ctx.ellipse(0, curH / 2 + 26 + lift * 22, curW * 0.72 * ss, 17 * ss * this.sizeMul, 0, 0, Math.PI * 2);
      ctx.fillStyle = env.themeShadow;
      ctx.fill();
      ctx.restore();
    }

    // body gradient — ПОЛНЫЙ ЦВЕТ: всё тело в свой tint, без белого центра
    const lightAngle = Math.atan2(env.my - this.y, env.mx - this.x);
    const gx0 = -Math.cos(lightAngle) * curW * 0.62;
    const gy0 = -Math.sin(lightAngle) * curH * 0.62;
    const gx1 = Math.cos(lightAngle) * curW * 0.62;
    const gy1 = Math.sin(lightAngle) * curH * 0.62;

    const baseTint = parseColor(this.cfg.tint);
    const tintLight = rgbString(mixRGB(baseTint, parseColor('#FFFFFF'), 0.33));
    const tintDark = rgbString(mixRGB(baseTint, parseColor('#000000'), 0.20));
    const tintMidDark = rgbString(mixRGB(baseTint, parseColor('#000000'), 0.10));
    const mats: Record<string, string[]> = {
      matte: [tintLight, this.cfg.tint, tintDark],
      glossy: [tintLight, this.cfg.tint, tintMidDark],
      glowing: [tintLight, this.cfg.tint, tintDark],
      hologram: [tintLight, this.cfg.tint, tintDark],
    };
    const bodyStops = makeStops(mats[env.bodyMaterial] ?? mats.matte);
    const bodyGrad = ctx.createLinearGradient(gx0, gy0, gx1, gy1);
    bodyStops.forEach((s) => bodyGrad.addColorStop(s.t, rgbString(s.color)));

    const radius = 26 * env.cornerRoundness * this.sizeMul;

    ctx.save();
    if (env.bodyMaterial === 'glowing') { ctx.shadowColor = 'rgba(255,255,255,0.85)'; ctx.shadowBlur = 38; }
    else if (env.bodyMaterial === 'hologram') { ctx.shadowColor = 'rgba(56,189,248,0.65)'; ctx.shadowBlur = 28; }
    else { ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 8; }
    drawRoundedPolygon(ctx, vertices, radius);
    ctx.fillStyle = bodyGrad;
    ctx.fill();
    ctx.restore();

    // inner shading — приглушён, чтобы не выбеливать полный цвет тела
    ctx.save();
    drawRoundedPolygon(ctx, vertices, radius);
    ctx.clip();
    const ig = ctx.createLinearGradient(0, -curH * 0.7, 0, curH * 0.4);
    ig.addColorStop(0, 'rgba(255,255,255,0.36)');
    ig.addColorStop(0.45, 'rgba(255,255,255,0.10)');
    ig.addColorStop(1, 'rgba(0,0,0,0.06)');
    ctx.fillStyle = ig;
    ctx.fill();
    ctx.restore();

    if (env.showRimLight) {
      drawRoundedPolygon(ctx, vertices, radius);
      ctx.strokeStyle = env.themeCategory === 'light' ? 'rgba(148,163,184,0.45)' : 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    // burst charge glow is drawn at the end of draw()

    /* ---- eyes ---- */
    const ep = this.eyes.getParams();
    const sm = this.sizeMul;

    const b = this.blink;
    b.t += 1 / 60;
    const blinkMul = 1 / Math.max(0.15, env.blinkRate ?? 1);
    if (!b.active && b.t > b.next) {
      b.active = true; b.t = 0;
      b.dur = Math.random() > 0.7 ? 0.26 : 0.13;
      b.next = (2.2 + Math.random() * 4.5) * blinkMul;
    }
    let blinkAmt = 0;
    if (b.active) {
      const bp = b.t / b.dur;
      if (bp >= 1) { b.active = false; blinkAmt = 0; }
      else blinkAmt = Math.sin(Math.PI * bp);
    }
    // eyes squeeze shut while savouring
    const savourShut = this.eat && this.eat.phase === 'savour' ? 0.72 : 0;
    const lidL = Math.max(ep.leftLidTop, blinkAmt, savourShut);
    const lidR = Math.max(ep.rightLidTop, blinkAmt, savourShut);

    const g = this.gaze;
    // when socially engaged it looks at the other creature, not the cursor
    const soc = this.social;
    const lookX = soc?.lookAtPartner && soc.partner ? soc.partner.x : env.mx;
    const lookY = soc?.lookAtPartner && soc.partner ? soc.partner.y : env.my;
    const rgx = lookX - this.x;
    const rgy = lookY - this.y;
    const dist = Math.hypot(rgx, rgy) || 1;
    const reach = Math.min(1, dist / 420);
    const tw = ep.trackingWeight;
    const trackGain = 4.4 * (env.eyeTracking ?? 1);
    const dX = (rgx / dist) * reach * 100 * ep.trackingDamping * trackGain * tw + ep.gazeBiasX;
    const dY = (rgy / dist) * reach * 100 * ep.trackingDamping * trackGain * tw + ep.gazeBiasY;
    const gK = 0.16 * (env.eyeTracking ?? 1);
    g.vx += (dX - g.x) * gK; g.vx *= 0.72; g.x += g.vx;
    g.vy += (dY - g.y) * gK; g.vy *= 0.72; g.y += g.vy;

    const tSec = performance.now() * 0.001;
    const saccMul = env.saccadeAmount ?? 1;
    const saccX = (Math.random() - 0.5) * ep.trackingSaccade * saccMul;
    const saccY = (Math.random() - 0.5) * ep.trackingSaccade * 0.6 * saccMul;
    const trX = ep.tremor ? (Math.random() - 0.5) * ep.tremor * 2 : 0;
    const trY = ep.tremor ? (Math.random() - 0.5) * ep.tremor * 1.4 : 0;
    const breathY = Math.sin(tSec * 1.15) * (ep.breath ?? 1) * 1.6;

    const pp = this.pupil;
    pp.tx = clamp(-g.x * 0.055, -4, 4);
    pp.ty = clamp(-g.y * 0.055, -4, 4);
    pp.x += (pp.tx - pp.x) * 0.1;
    pp.y += (pp.ty - pp.y) * 0.1;

    const pad = (9 + 4 * env.globalScale) * sm / (env.eyeFreedom ?? 1);
    const halfDist = (ep.pupilDistance / 2) * sm;
    const maxHW = (Math.max(ep.leftWidth, ep.rightWidth) / 2) * sm;
    const maxHH = (Math.max(ep.leftHeight, ep.rightHeight) / 2) * sm;
    const offPad = Math.max(
      Math.abs(ep.leftOffsetX), Math.abs(ep.rightOffsetX),
      Math.abs(ep.leftOffsetY), Math.abs(ep.rightOffsetY)
    ) * sm + Math.abs(ep.tremor) * 2;

    const safe = resolveGazeShift(
      g.x + saccX + trX,
      g.y + saccY + trY + breathY,
      halfDist, maxHW, maxHH, pad + offPad, vertices
    );

    const squash = clamp((this.scaleX - 1) * 0.6, -0.25, 0.25);
    const eyeYBase = ep.eyeYOffset * sm + safe.y;
    const lex = -halfDist + safe.x + ep.leftOffsetX * sm;
    const rex = halfDist + safe.x + ep.rightOffsetX * sm;
    const ley = eyeYBase + ep.leftOffsetY * sm;
    const rey = eyeYBase + ep.rightOffsetY * sm;

    const lRGB = mixRGB(sampleStops(bodyStops, projectOnGradient(lex, eyeYBase, gx0, gy0, gx1, gy1)), parseColor('#FFFFFF'), 0.05);
    const rRGB = mixRGB(sampleStops(bodyStops, projectOnGradient(rex, eyeYBase, gx0, gy0, gx1, gy1)), parseColor('#FFFFFF'), 0.05);

    ctx.save();
    drawRoundedPolygon(ctx, vertices, radius);
    ctx.clip();

    const eatGlint = this.eat
      ? (this.eat.phase === 'savour' ? 'heart' : this.eat.phase === 'afterglow' ? 'burst' : ep.glintStyle)
      : ep.glintStyle;

    const eyeSc = env.eyeScale ?? 1;
    try { drawEye(ctx, {
      x: lex, y: ley,
      width: ep.leftWidth * sm * eyeSc,
      height: ep.leftHeight * sm * eyeSc * (1 - squash * 0.5),
      angle: (ep.leftAngle * Math.PI) / 180 + this.rotation * 0.25,
      scale: ep.leftScale,
      lidTop: lidL, lidBottom: ep.leftLidBottom,
      lidColor: rgbString(lRGB),
      glintStyle: eatGlint as never,
      glintPhase: { x: pp.x, y: pp.y },
      squint: clamp(Math.abs(g.x) / 140, 0, 0.6) * 0.35,
      bodyIsLight: env.themeCategory === 'light',
      glintIntensity: ep.glintIntensity * (env.glintBrightness ?? 1) * (this.eat ? 1.4 : 1),
    }); } catch(e){ console.error('[PENTA] drawEye left', e); }

    try { drawEye(ctx, {
      x: rex, y: rey,
      width: ep.rightWidth * sm * eyeSc,
      height: ep.rightHeight * sm * eyeSc * (1 - squash * 0.5),
      angle: (ep.rightAngle * Math.PI) / 180 + this.rotation * 0.25,
      scale: ep.rightScale,
      lidTop: lidR, lidBottom: ep.rightLidBottom,
      lidColor: rgbString(rRGB),
      glintStyle: eatGlint as never,
      glintPhase: { x: pp.x, y: pp.y },
      squint: clamp(Math.abs(g.x) / 140, 0, 0.6) * 0.35,
      bodyIsLight: env.themeCategory === 'light',
      glintIntensity: ep.glintIntensity * (env.glintBrightness ?? 1) * (this.eat ? 1.4 : 1),
    }); } catch(e){ console.error('[PENTA] drawEye right', e); }

    // ---- realistic mouth (full-fledged, mood-driven) ----
    if (env.showMouths) {
      ctx.save();
      drawRoundedPolygon(ctx, vertices, radius);
      ctx.clip();

      const mouthY = curH * 0.22;
      const mouthSkinRGB = mixRGB(
        sampleStops(bodyStops, projectOnGradient(0, mouthY, gx0, gy0, gx1, gy1)),
        parseColor('#FFFFFF'),
        0.03
      );
      const mouthSkin = rgbString(mouthSkinRGB);

      ctx.translate(0, mouthY);
      const mpRaw = this.mouth.getParams();
      const mp = {
        ...mpRaw,
        width: mpRaw.width * sm * (env.mouthScale ?? 1),
        height: mpRaw.height * sm * (env.mouthScale ?? 1),
        drool: (env.showDrool ?? true) ? mpRaw.drool : 0,
      };

      // if eating, the eating system already drives mouth via behavior engine,
      // but we also add a tiny extra openness from the eat lift phase
      // (handled via the behavior itself)

      try { drawMouth(ctx, mp as never, {
        skin: mouthSkin,
        isLight: env.themeCategory === 'light',
        time: performance.now() * 0.001 + this.cfg.tempo * 7,
      }); } catch(e){ console.error('[PENTA] drawMouth', e); }

      ctx.restore();
    }

    // ---- tears when crying (realistic, not just mouth) ----
    const mpForTears = this.mouth.getParams();
    const crying = mpForTears.quiver > 1.6 && mpForTears.smile < -0.25 && (this.valence < -0.2 || this.moodWord === 'dejected' || this.moodWord === 'melancholy');
    if (crying && env.showMouths && (env.showTears ?? true)) {
      ctx.save();
      drawRoundedPolygon(ctx, vertices, radius);
      ctx.clip();
      const tNow = performance.now() * 0.001;
      const tearAlpha = 0.35 + Math.sin(tNow * 3) * 0.15;
      const tearCount = mpForTears.quiver > 2.2 ? 2 : 1;
      for (let side = 0; side < tearCount; side++) {
        const eyeX = (side === 0 ? -1 : 1) * (this.eyes.getParams().pupilDistance / 2) * sm;
        const eyeY = this.eyes.getParams().eyeYOffset * sm - curH * 0.02;
        const tx = eyeX + (Math.random() - 0.5) * 3;
        const ty = eyeY + curH * 0.12;
        const dropLen = 6 + Math.sin(tNow * 2 + side) * 2 + mpForTears.quiver * 1.5;
        ctx.fillStyle = `rgba(140,190,255,${tearAlpha})`;
        ctx.beginPath();
        ctx.ellipse(tx, ty + dropLen * 0.5, 2.2, dropLen * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // glint on tear
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.arc(tx - 0.6, ty + 1, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // — ник строго над телом, намертво привязан к x,y (следует за физикой), контр-поворот чтобы остаться горизонтально —
    if (env.showNicks !== false) {
      ctx.save();
      ctx.translate(0, -curH / 2 - 22);
      ctx.rotate(-this.rotation);
      const name = this.cfg.name;
      ctx.font = '700 11px "Plus Jakarta Sans", system-ui, sans-serif';
      const padX = 10;
      let w = 0;
      try { w = ctx.measureText(name).width + padX * 2; } catch { w = name.length * 7 + padX * 2; }
      const h = 18;
      const r = 9;
      const x1 = -w / 2, y1 = -h / 2, x2 = w / 2, y2 = h / 2;
      ctx.fillStyle = 'rgba(15,23,42,0.78)';
      (ctx as unknown as { shadowColor: string; shadowBlur: number }).shadowColor = this.cfg.tint;
      (ctx as unknown as { shadowBlur: number }).shadowBlur = 0;
      ctx.strokeStyle = this.cfg.tint;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      // @ts-ignore — roundRect may not be typed
      if (typeof (ctx as unknown as { roundRect?: Function }).roundRect === 'function') {
        (ctx as unknown as { roundRect: (x:number,y:number,w:number,h:number,r:number)=>void }).roundRect(x1, y1, w, h, r);
      } else {
        ctx.moveTo(x1 + r, y1);
        // @ts-ignore
        ctx.arcTo(x2, y1, x2, y2, r);
        // @ts-ignore
        ctx.arcTo(x2, y2, x1, y2, r);
        // @ts-ignore
        ctx.arcTo(x1, y2, x1, y1, r);
        // @ts-ignore
        ctx.arcTo(x1, y1, x2, y1, r);
        ctx.closePath();
      }
      ctx.fill();
      ctx.stroke();
      ctx.shadowColor = this.cfg.tint;
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(name, 0, 0.5);
      ctx.restore();
    }

    } catch(e){ console.error('[PENTA] creature draw', (e as Error)?.message, e); } finally { try{ ctx.restore(); }catch{} try{ ctx.restore(); }catch{} }

    // If in charge phase, overlay the radiant singularity on top
    try {
    if (this.burst.phase === 'charge') {
      this.burst.draw(ctx);
    }
    } catch(e){ console.error('[PENTA] burst draw', e); }
  }

}
