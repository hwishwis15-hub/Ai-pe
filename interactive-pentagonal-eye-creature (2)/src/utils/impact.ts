// ============================================================
//  PENTA — Impact FX Policy
//  Every collision rolls fresh dice: how big the ripple is,
//  how loud the thud is, and how the body reacts emotionally.
//  Nothing is deterministic — including "didn't care at all".
// ============================================================

export type ImpactReaction =
  | 'ignore'       // not even a ripple
  | 'brush'        // tiny ripple, no sound
  | 'soft'         // small ripple + muted thud
  | 'solid'        // clear ripple + thud, standard squish
  | 'heavy'        // big ripple, deep thud, strong squash
  | 'bouncey'      // playful spring-back with a squeak
  | 'rattle'       // short shudder, several mini ripples
  | 'dizzy'        // wobbly recovery
  | 'startle'      // jump-scare style recoil
  | 'grumble'      // annoyed, eyes narrow
  | 'giggle'       // finds it funny
  | 'yawn';        // completely unimpressed

export interface ImpactFX {
  reaction: ImpactReaction;
  /** ripple ring */
  ripple: boolean;
  rippleScale: number;   // 0.4 … 2.2
  rippleColor: string;
  rippleCount: number;   // 1 … 3 concentric
  /** audio */
  sound: boolean;
  pitch: number;
  /** body response */
  squash: number;        // + = flatten, − = stretch
  shake: number;         // vertex wobble impulse
  tilt: number;
  /** emotional follow-up */
  eyes: string | null;
  label: string | null;
  /** how long the reaction lingers */
  linger: number;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

export interface ImpactContext {
  speed: number;
  isWall: boolean;
  isEdgeTouch: boolean;
  mood: string;
  energy: number;
  playfulness: number;
  boldness: number;
  curiosity: number;
  /** true when this is a landing after a jump */
  isLanding: boolean;
}

/**
 * Rolls a completely fresh reaction for a collision.
 * Personality and mood tilt the odds; nothing is guaranteed.
 */
export function rollImpact(ctx: ImpactContext): ImpactFX {
  const hard = Math.min(1, ctx.speed / 20);
  const r = Math.random();

  // --- decide the reaction family first ---
  let reaction: ImpactReaction;

  if (ctx.isEdgeTouch && !ctx.isWall) {
    // grazing a wall while flying: usually subtle or ignored
    if (r < 0.34) reaction = 'ignore';
    else if (r < 0.58) reaction = 'brush';
    else if (r < 0.74) reaction = 'soft';
    else if (r < 0.86) reaction = ctx.playfulness > 0.6 ? 'giggle' : 'solid';
    else if (r < 0.94) reaction = ctx.boldness > 0.55 ? 'grumble' : 'startle';
    else reaction = 'yawn';
  } else {
    // a real hit: severity still isn't guaranteed
    if (ctx.speed < 2.2) {
      if (r < 0.3) reaction = 'ignore';
      else if (r < 0.55) reaction = 'brush';
      else if (r < 0.8) reaction = 'soft';
      else reaction = pick(['solid', 'yawn', 'giggle']);
    } else if (ctx.speed < 9) {
      if (r < 0.12) reaction = 'ignore';
      else if (r < 0.28) reaction = 'brush';
      else if (r < 0.52) reaction = 'soft';
      else if (r < 0.74) reaction = 'solid';
      else if (r < 0.86) reaction = ctx.playfulness > 0.5 ? 'bouncey' : 'rattle';
      else reaction = pick(['dizzy', 'grumble', 'giggle', 'yawn']);
    } else {
      if (r < 0.06) reaction = 'brush';
      else if (r < 0.2) reaction = 'soft';
      else if (r < 0.42) reaction = 'solid';
      else if (r < 0.58) reaction = 'heavy';
      else if (r < 0.7) reaction = ctx.playfulness > 0.55 ? 'bouncey' : 'rattle';
      else if (r < 0.82) reaction = 'dizzy';
      else if (r < 0.92) reaction = 'startle';
      else reaction = pick(['grumble', 'giggle']);
    }
  }

  // landing after a jump always makes at least a soft impact
  if (ctx.isLanding && reaction === 'ignore') reaction = 'soft';

  const S = {
    ignore:     { ripple: false, sound: false, squash: 0,     shake: 0,   rippleScale: 0,   rippleCount: 0 },
    brush:      { ripple: true,  sound: false, squash: 0.02,  shake: 0.6, rippleScale: 0.45, rippleCount: 1 },
    soft:       { ripple: true,  sound: true,  squash: 0.07,  shake: 2,   rippleScale: 0.72, rippleCount: 1 },
    solid:      { ripple: true,  sound: true,  squash: 0.15,  shake: 5,   rippleScale: 1.05, rippleCount: 1 },
    heavy:      { ripple: true,  sound: true,  squash: 0.27,  shake: 9,   rippleScale: 1.6,  rippleCount: 2 },
    bouncey:    { ripple: true,  sound: true,  squash: -0.16, shake: 4,   rippleScale: 1.15, rippleCount: 1 },
    rattle:     { ripple: true,  sound: true,  squash: 0.11,  shake: 7,   rippleScale: 1.0,  rippleCount: 3 },
    dizzy:      { ripple: true,  sound: true,  squash: 0.19,  shake: 8,   rippleScale: 1.4,  rippleCount: 2 },
    startle:    { ripple: true,  sound: true,  squash: -0.22, shake: 6,   rippleScale: 1.3,  rippleCount: 1 },
    grumble:    { ripple: true,  sound: true,  squash: 0.13,  shake: 4,   rippleScale: 0.95, rippleCount: 1 },
    giggle:     { ripple: true,  sound: true,  squash: 0.09,  shake: 3.5, rippleScale: 1.1,  rippleCount: 2 },
    yawn:       { ripple: true,  sound: false, squash: 0.03,  shake: 1,   rippleScale: 0.55, rippleCount: 1 },
  }[reaction];

  // hard hits make whatever it does a touch more dramatic
  const boost = 0.65 + hard * 0.7;

  const eyeBy: Record<ImpactReaction, string | null> = {
    ignore: null,
    brush: null,
    soft: null,
    solid: 'startled',
    heavy: 'surprised',
    bouncey: 'happy',
    rattle: 'dizzy',
    dizzy: 'dizzy',
    startle: 'shocked',
    grumble: 'angry',
    giggle: 'wink',
    yawn: 'sleepy',
  };

  const labelBy: Record<ImpactReaction, string | null> = {
    ignore: null,
    brush: null,
    soft: null,
    solid: 'Thudded into the wall',
    heavy: 'Slammed into the wall!',
    bouncey: 'Boing! Off the wall',
    rattle: 'Rattled by the impact',
    dizzy: 'Seeing stars…',
    startle: 'Yikes! That startled it',
    grumble: 'Grumbling at the wall',
    giggle: 'Hehe, that tickled',
    yawn: 'Could not care less',
  };

  return {
    reaction,
    ripple: S.ripple,
    rippleScale: S.rippleScale * boost,
    rippleCount: S.rippleCount,
    // ripple colour follows the emotional tone of the reaction
    rippleColor:
      reaction === 'grumble' ? 'rgba(255,150,130,0.5)'
      : reaction === 'dizzy' ? 'rgba(200,170,255,0.5)'
      : reaction === 'giggle' || reaction === 'bouncey' ? 'rgba(255,220,170,0.5)'
      : reaction === 'heavy' || reaction === 'startle' ? 'rgba(190,215,255,0.55)'
      : 'rgba(255,255,255,0.4)',
    sound: S.sound,
    pitch: rnd(0.62, 1.35) * (reaction === 'heavy' ? 0.78 : reaction === 'bouncey' ? 1.35 : 1),
    squash: S.squash * (0.75 + boost * 0.45),
    shake: S.shake * boost,
    tilt: (Math.random() - 0.5) * S.shake * 0.06,
    eyes: eyeBy[reaction],
    label: labelBy[reaction],
    linger: reaction === 'dizzy' ? rnd(0.8, 1.9)
      : reaction === 'grumble' ? rnd(0.6, 1.6)
      : rnd(0.15, 0.55),
  };
}

/* ------------------------------------------------------------------ */
/*  EATING FX — also randomised independently                          */
/* ------------------------------------------------------------------ */

export type MealFxReaction =
  | 'silent_nibble'
  | 'tiny_pop'
  | 'satisfying'
  | 'juicy'
  | 'crunchy'
  | 'ecstatic';

export interface MealFX {
  reaction: MealFxReaction;
  ripple: boolean;
  rippleScale: number;
  rippleCount: number;
  rippleColor: string;
  sound: boolean;
  crunchCount: number;
  pitch: number;
  sparkle: boolean;
  crumbCount: number;
  label: string | null;
}

const MEAL_TABLE: Record<MealFxReaction, Omit<MealFX, 'reaction' | 'label' | 'pitch'>> = {
  silent_nibble: { ripple: false, rippleScale: 0,     rippleCount: 0, sound: false, crunchCount: 0, rippleColor: 'rgba(255,255,255,0)', sparkle: false, crumbCount: 1 },
  tiny_pop:      { ripple: true,  rippleScale: 0.5,   rippleCount: 1, sound: true,  crunchCount: 1, rippleColor: 'rgba(255,235,190,0.45)', sparkle: false, crumbCount: 3 },
  satisfying:    { ripple: true,  rippleScale: 0.9,   rippleCount: 1, sound: true,  crunchCount: 2, rippleColor: 'rgba(255,225,160,0.5)',  sparkle: true,  crumbCount: 6 },
  juicy:         { ripple: true,  rippleScale: 1.25,  rippleCount: 2, sound: true,  crunchCount: 3, rippleColor: 'rgba(255,190,200,0.5)',  sparkle: true,  crumbCount: 9 },
  crunchy:       { ripple: true,  rippleScale: 1.1,   rippleCount: 3, sound: true,  crunchCount: 4, rippleColor: 'rgba(240,220,180,0.55)', sparkle: false, crumbCount: 11 },
  ecstatic:      { ripple: true,  rippleScale: 1.8,   rippleCount: 3, sound: true,  crunchCount: 3, rippleColor: 'rgba(255,215,150,0.6)',  sparkle: true,  crumbCount: 14 },
};

export function rollMealFX(fullness: number, playfulness: number): MealFX {
  const r = Math.random();
  let reaction: MealFxReaction;

  if (r < 0.1) reaction = 'silent_nibble';
  else if (r < 0.26) reaction = 'tiny_pop';
  else if (r < 0.5) reaction = 'satisfying';
  else if (r < 0.7) reaction = 'juicy';
  else if (r < 0.87) reaction = 'crunchy';
  else reaction = 'ecstatic';

  const T = MEAL_TABLE[reaction];
  const labels: Record<MealFxReaction, string | null> = {
    silent_nibble: null,
    tiny_pop: 'A tiny pop',
    satisfying: 'Satisfying bite',
    juicy: 'Juicy mouthful!',
    crunchy: 'Crunch crunch crunch',
    ecstatic: 'Absolutely delicious!!',
  };

  return {
    reaction,
    ...T,
    // being less full → bigger appreciation
    rippleScale: T.rippleScale * (1 + (1 - fullness) * 0.35) * (0.75 + playfulness * 0.5),
    crunchCount: Math.max(1, Math.round(T.crunchCount * rnd(0.7, 1.5))),
    sound: T.sound,
    pitch: rnd(0.75, 1.45),
    crumbCount: Math.round(T.crumbCount * rnd(0.6, 1.4)),
    label: labels[reaction],
  };
}
