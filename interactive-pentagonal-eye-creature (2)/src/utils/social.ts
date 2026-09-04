// ============================================================
//  PENTA — Social Fabric
//  Relationships, mutual reactions, emergent games.
//  Nothing here is scheduled: bonds drift, moods flare,
//  and games start on a whim when the chemistry is right.
// ============================================================

export type GameKind =
  | 'tag' | 'follow' | 'circle' | 'mirror'
  | 'stare' | 'bounce' | 'hide' | 'huddle'
  | 'waltz' | 'boop_duo' | 'whisper' | 'acrobat'
  | 'comfort' | 'spook' | 'swim_sync' | 'standoff'
  | 'duet' | 'nap_cuddle'
  /* ---- wave 3: richer shared activities ---- */
  | 'race' | 'conga' | 'guard' | 'gift'
  | 'pushmatch' | 'peekaboo' | 'sync_spin' | 'showoff'
  | 'cheer_up' | 'watch_curser';

export interface SocialActor {
  id: string;
  name: string;
  kind: string;
  x: number;
  y: number;
  playfulness: number;
  sociability: number;
  boldness: number;
  curiosity: number;
  diligence: number;
  energy: number;
  busy: boolean;
}

export interface Relationship {
  affinity: number;    // -1 hostile … +1 bonded
  familiarity: number; // 0 … 1
  annoyance: number;   // transient 0 … 1
  excitement: number;  // transient 0 … 1
  lastInteract: number;
  gamesPlayed: number;
  bumps: number;
}

export interface ActiveGame {
  kind: GameKind;
  a: string;
  b: string;
  roleA: string;
  roleB: string;
  t: number;
  dur: number;
  /** free-form scratch space per game */
  data: Record<string, number>;
  label: string;
}

/** What a creature should do socially this frame */
export interface SocialDirective {
  partnerId: string | null;
  partner: { x: number; y: number } | null;
  /** action id to run, if the social layer wants to drive the body */
  action: string | null;
  /** eye category cue */
  eyes: string | null;
  /** look at the partner instead of the cursor */
  lookAtPartner: boolean;
  label: string | null;
  /** emotional colour of this moment */
  tone: 'neutral' | 'warm' | 'annoyed' | 'wary' | 'excited';
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];

const GAME_META: Record<GameKind, { label: string; roles: [string, string]; dur: [number, number] }> = {
  tag:        { label: 'playing tag',            roles: ['it', 'runner'],        dur: [7, 18] },
  follow:     { label: 'follow the leader',      roles: ['leader', 'follower'],  dur: [6, 16] },
  circle:     { label: 'circling together',      roles: ['orbit', 'orbit'],      dur: [5, 13] },
  mirror:     { label: 'mirroring moves',        roles: ['lead', 'copy'],        dur: [5, 12] },
  stare:      { label: 'a staring contest',      roles: ['stare', 'stare'],      dur: [3, 8]  },
  bounce:     { label: 'bouncing back & forth',  roles: ['bounce', 'bounce'],    dur: [5, 12] },
  hide:       { label: 'hide and seek',          roles: ['seeker', 'hider'],     dur: [7, 16] },
  huddle:     { label: 'huddling close',         roles: ['huddle', 'huddle'],    dur: [4, 11] },
  waltz:      { label: 'waltzing in the air',    roles: ['lead', 'partner'],     dur: [6, 14] },
  boop_duo:   { label: 'booping noses',          roles: ['booper', 'boopee'],    dur: [3, 7]  },
  whisper:    { label: 'whispering secrets',     roles: ['whisperer', 'listener'], dur: [4, 9] },
  acrobat:    { label: 'aerial acrobatics',      roles: ['leaper', 'base'],      dur: [5, 12] },
  comfort:    { label: 'comforting cuddle',      roles: ['comforter', 'comforted'], dur: [5, 11] },
  spook:      { label: 'sneak prank BOO!',       roles: ['sneaker', 'target'],   dur: [4, 9]  },
  swim_sync:  { label: 'synchronized swimming',  roles: ['swim', 'swim'],        dur: [6, 15] },
  standoff:   { label: 'jealous standoff',       roles: ['rival1', 'rival2'],    dur: [4, 9]  },
  duet:       { label: 'singing an air-duet',    roles: ['soprano', 'alto'],     dur: [5, 12] },
  nap_cuddle: { label: 'napping side by side',   roles: ['nap', 'nap'],          dur: [6, 16] },
  race:       { label: 'racing across the screen', roles: ['racer', 'racer'],     dur: [4, 9]  },
  conga:      { label: 'forming a conga line',   roles: ['front', 'back'],       dur: [7, 16] },
  guard:      { label: 'standing guard over them', roles: ['guard', 'guarded'],  dur: [5, 13] },
  gift:       { label: 'offering a gift',        roles: ['giver', 'receiver'],   dur: [4, 9]  },
  pushmatch:  { label: 'a pushing contest',      roles: ['pusher', 'bracer'],    dur: [4, 10] },
  peekaboo:   { label: 'playing peek-a-boo',     roles: ['hider', 'finder'],     dur: [5, 11] },
  sync_spin:  { label: 'spinning in sync',       roles: ['spin', 'spin'],        dur: [4, 10] },
  showoff:    { label: 'showing off tricks',     roles: ['star', 'audience'],    dur: [5, 12] },
  cheer_up:   { label: 'cheering them up',       roles: ['jester', 'sadling'],   dur: [5, 12] },
  watch_curser:{ label: 'watching the cursor together', roles: ['watch', 'watch'], dur: [5, 13] },
};

export class SocialDirector {
  private rel = new Map<string, Relationship>();
  private games: ActiveGame[] = [];
  private gameCooldown = rnd(6, 20);
  /** transient per-creature directives, rebuilt each frame */
  private directives = new Map<string, SocialDirective>();
  /** momentary reaction flashes (glare, greeting…) */
  private flashes = new Map<string, { eyes: string; label: string; tone: SocialDirective['tone']; t: number }>();
  private lastBump = new Map<string, number>();
  private clock = 0;
  /** live tuning knobs fed from the settings panel */
  private cfg = { allowGames: true, allowFoodDrama: true, socialDrive: 1, personalSpace: 1 };

  /* ---------------- relationships ---------------- */

  private key(a: string, b: string) {
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  }

  rel_(a: string, b: string): Relationship {
    const k = this.key(a, b);
    let r = this.rel.get(k);
    if (!r) {
      r = {
        affinity: rnd(-0.15, 0.35),
        familiarity: 0,
        annoyance: 0,
        excitement: 0,
        lastInteract: -999,
        gamesPlayed: 0,
        bumps: 0,
      };
      this.rel.set(k, r);
    }
    return r;
  }

  getRelationship(a: string, b: string) {
    return this.rel_(a, b);
  }

  allRelationships() {
    return [...this.rel.entries()].map(([k, v]) => ({ pair: k.split('|'), ...v }));
  }

  /* ---------------- main tick ---------------- */

  update(
    dt: number,
    actors: SocialActor[],
    opts?: {
      allowGames?: boolean;
      allowFoodDrama?: boolean;
      socialDrive?: number;
      personalSpace?: number;
    }
  ) {
    this.cfg = {
      allowGames: opts?.allowGames ?? true,
      allowFoodDrama: opts?.allowFoodDrama ?? true,
      socialDrive: opts?.socialDrive ?? 1,
      personalSpace: opts?.personalSpace ?? 1,
    };
    this.clock += dt;
    this.directives.clear();

    // decay transient feelings
    for (const r of this.rel.values()) {
      r.annoyance = Math.max(0, r.annoyance - dt * 0.11);
      r.excitement = Math.max(0, r.excitement - dt * 0.09);
      // affinity slowly drifts to a mild neutral
      r.affinity += (0.05 - r.affinity) * dt * 0.004;
    }

    // decay flashes
    for (const [id, f] of [...this.flashes.entries()]) {
      f.t -= dt;
      if (f.t <= 0) this.flashes.delete(id);
    }

    if (actors.length < 2) {
      this.games = [];
      return;
    }

    this.detectProximity(dt, actors);
    this.stepGames(dt, actors);
    this.maybeStartGame(dt, actors);
    this.buildDirectives(actors);
  }

  /* ---------------- proximity & spontaneous reactions ---------------- */

  private detectProximity(dt: number, actors: SocialActor[]) {
    for (let i = 0; i < actors.length; i++) {
      for (let j = i + 1; j < actors.length; j++) {
        const A = actors[i];
        const B = actors[j];
        const d = Math.hypot(A.x - B.x, A.y - B.y);
        const r = this.rel_(A.id, B.id);

        // getting to know each other simply by being near
        if (d < 420) {
          r.familiarity = clamp01(r.familiarity + dt * 0.02 * (1 - d / 420));
        }

        // personal-space intrusion (user-tunable comfort radius)
        const comfort = 150 * this.cfg.personalSpace;
        if (d < comfort) {
          const crowd = (comfort - d) / comfort;
          const tolerance = (A.sociability + B.sociability) * 0.5;
          if (tolerance < 0.55) {
            r.annoyance = clamp01(r.annoyance + dt * crowd * 0.35 * (0.8 - tolerance));
          } else {
            r.excitement = clamp01(r.excitement + dt * crowd * 0.22);
            r.affinity = clamp01(r.affinity + dt * crowd * 0.012) ;
          }
        }

        // a real bump
        const bumpKey = this.key(A.id, B.id);
        const lastB = this.lastBump.get(bumpKey) ?? -999;
        if (d < 92 && this.clock - lastB > 1.6) {
          this.lastBump.set(bumpKey, this.clock);
          r.bumps++;
          const friendly = r.affinity > 0.15 || (A.playfulness + B.playfulness) / 2 > 0.6;
          if (friendly) {
            r.excitement = clamp01(r.excitement + 0.4);
            r.affinity = Math.min(1, r.affinity + 0.05);
            this.flash(A.id, 'playful', `bumped into ${B.name}`, 'excited');
            this.flash(B.id, 'playful', `bumped by ${A.name}`, 'excited');
          } else {
            r.annoyance = clamp01(r.annoyance + 0.45);
            r.affinity = Math.max(-1, r.affinity - 0.06);
            this.flash(A.id, 'wary', `annoyed at ${B.name}`, 'annoyed');
            this.flash(B.id, 'wary', `glaring at ${A.name}`, 'annoyed');
          }
        }

        /* ---- WAVE 3: mood-aware emergent mechanics ---- */

        // EMPATHY: a happy one drifts toward a miserable one to cheer it up
        if (this.clock % 7 < dt && d < 700) {
          const sad = r.affinity > -0.1 && (A.energy < 0.35 || B.energy < 0.35);
          if (sad && Math.random() < 0.45) {
            const sadOne = A.energy < B.energy ? A : B;
            const helper = sadOne === A ? B : A;
            if (helper.playfulness > 0.4 || helper.sociability > 0.55) {
              this.startSpecific(helper.id, sadOne.id, 'cheer_up',
                helper.sociability > 0.7 ? 'comfort' : 'cheer_up');
              r.affinity = Math.min(1, r.affinity + 0.12);
            }
          }
        }

        // PROTECTION: a bold one guards a timid one when they're close
        if (d < 340 && this.clock % 11 < dt && Math.random() < 0.4) {
          const timid = A.boldness < 0.38 ? A : B.boldness < 0.38 ? B : null;
          const brave = timid === A ? B : A;
          if (timid && brave.boldness > 0.6 && r.affinity > 0.1) {
            this.startSpecific(brave.id, timid.id, 'guard', 'guard');
          }
        }

        // GIFTING: an affectionate one brings an offering
        if (d < 300 && r.affinity > 0.45 && this.clock % 13 < dt && Math.random() < 0.3) {
          this.startSpecific(A.id, B.id, 'gift', 'gift');
          r.excitement = clamp01(r.excitement + 0.3);
        }

        // SPONTANEOUS MUTUAL GAZE & EXPRESSIVE REACTIONS
        if (d < 540 && Math.random() < dt * 0.14) {
          const inGame = this.gameFor(A.id) || this.gameFor(B.id);
          if (!inGame && !A.busy && !B.busy) {
            const warmth = r.affinity + (A.sociability + B.sociability) * 0.25 - r.annoyance;
            const roll = Math.random();
            if (r.annoyance > 0.45 && roll < 0.5) {
              this.flash(A.id, 'wary', `glaring angrily at ${B.name}`, 'annoyed');
              this.flash(B.id, 'wary', `scowling back at ${A.name}`, 'annoyed');
            } else if (warmth > 0.5 && roll < 0.38) {
              this.flash(A.id, 'emotion', `beaming at ${B.name}`, 'warm');
              this.flash(B.id, 'emotion', `sparkling at ${A.name}`, 'warm');
              r.excitement = clamp01(r.excitement + 0.28);
            } else if (A.playfulness > 0.65 && roll < 0.65) {
              this.flash(A.id, 'playful', `teasing ${B.name}`, 'excited');
              this.flash(B.id, 'playful', `smirking at ${A.name}`, 'excited');
            } else if (roll < 0.82) {
              this.flash(A.id, 'attention', `curious about ${B.name}`, 'neutral');
            } else {
              this.flash(A.id, 'emotion', `shy blush seeing ${B.name}`, 'warm');
            }
          }
        }
      }
    }
  }

  private flash(id: string, eyes: string, label: string, tone: SocialDirective['tone']) {
    this.flashes.set(id, { eyes, label, tone, t: rnd(0.9, 2.6) });
  }

  /**
   * Starts a specific game between two specific creatures, bypassing chemistry.
   * Used by the emergent empathy / protection / gifting mechanics.
   */
  startSpecific(aId: string, bId: string, kind: GameKind, forceKind?: GameKind) {
    if (this.gameFor(aId) || this.gameFor(bId)) return;
    const meta = GAME_META[forceKind ?? kind];
    const swap = Math.random() < 0.5;
    this.games.push({
      kind: forceKind ?? kind,
      a: swap ? bId : aId,
      b: swap ? aId : bId,
      roleA: meta.roles[0],
      roleB: meta.roles[1],
      t: 0,
      dur: rnd(meta.dur[0], meta.dur[1]),
      data: { swapAt: rnd(2.5, 6), phase: Math.random(), beat: rnd(0.6, 1.6) },
      label: meta.label,
    });
    const r = this.rel_(aId, bId);
    r.gamesPlayed++;
    r.excitement = clamp01(r.excitement + 0.35);
  }

  /** external event: someone stole a snack */
  notifyFoodTheft(thiefId: string, victimId: string, thiefName: string, victimName: string) {
    if (!this.cfg.allowFoodDrama) return;
    const r = this.rel_(thiefId, victimId);
    r.annoyance = clamp01(r.annoyance + 0.55);
    r.affinity = Math.max(-1, r.affinity - 0.08);
    this.flash(victimId, 'wary', `${thiefName} took the snack!`, 'annoyed');
    this.flash(thiefId, 'playful', `snatched it from ${victimName}`, 'excited');
  }

  /* ---------------- games ---------------- */

  gameFor(id: string): ActiveGame | null {
    return this.games.find((g) => g.a === id || g.b === id) ?? null;
  }

  activeGames() {
    return this.games;
  }

  private maybeStartGame(dt: number, actors: SocialActor[]) {
    if (!this.cfg.allowGames) return;
    // social drive scales how eagerly they seek each other out
    this.gameCooldown -= dt * Math.max(0.15, this.cfg.socialDrive);
    if (this.gameCooldown > 0) return;

    const free = actors.filter((a) => !a.busy && !this.gameFor(a.id));
    if (free.length < 2) {
      this.gameCooldown = rnd(3, 8);
      return;
    }

    // try a random pair — chemistry decides
    const A = pick(free);
    const B = pick(free.filter((x) => x.id !== A.id));
    if (!B) { this.gameCooldown = rnd(3, 8); return; }

    const r = this.rel_(A.id, B.id);
    const dist = Math.hypot(A.x - B.x, A.y - B.y);
    const chemistry =
      (A.playfulness + B.playfulness) * 0.35 +
      r.affinity * 0.4 +
      r.familiarity * 0.2 +
      (A.energy + B.energy) * 0.15 -
      r.annoyance * 0.7 -
      Math.min(0.35, dist / 2600);

    if (Math.random() > clamp01(chemistry)) {
      this.gameCooldown = rnd(4, 14);
      return;
    }

    // choose a game that suits the pair
    const pool: [GameKind, number][] = [
      ['tag',        (A.playfulness + B.playfulness) * 0.5 + A.energy * 0.3],
      ['waltz',      Math.max(0.1, r.affinity * 0.65 + (A.sociability + B.sociability) * 0.3)],
      ['follow',     Math.max(0.1, r.affinity * 0.45 + B.sociability * 0.35)],
      ['circle',     0.35 + r.affinity * 0.35],
      ['boop_duo',   (A.playfulness + B.playfulness) * 0.5 + r.affinity * 0.3],
      ['whisper',    A.sociability * 0.4 + B.curiosity * 0.4],
      ['acrobat',    (A.playfulness + A.energy) * 0.45],
      ['comfort',    (r.affinity > 0.2 || B.energy < 0.45) ? 0.45 : 0.05],
      ['spook',      A.playfulness * 0.45 + (1 - B.boldness) * 0.2],
      ['swim_sync',  Math.max(0.15, r.affinity * 0.4 + A.diligence * 0.3)],
      ['standoff',   0.15 + r.annoyance * 0.65],
      ['mirror',     A.curiosity * 0.35 + B.curiosity * 0.35],
      ['stare',      0.2 + r.annoyance * 0.45],
      ['bounce',     (A.playfulness + B.playfulness) * 0.4],
      ['hide',       A.curiosity * 0.35 + (1 - B.boldness) * 0.35],
      ['huddle',     Math.max(0.1, r.affinity * 0.55 + (A.sociability + B.sociability) * 0.3)],
      ['duet',       (A.playfulness + B.sociability) * 0.35],
      ['nap_cuddle', (2 - A.energy - B.energy) * 0.4 + r.affinity * 0.3],
      /* wave 3 */
      ['race',       (A.playfulness + B.playfulness) * 0.4 + (A.energy + B.energy) * 0.3],
      ['conga',      r.affinity * 0.5 + B.diligence * 0.3],
      ['guard',      Math.max(0.05, (1 - B.boldness) * 0.5 + r.affinity * 0.3)],
      ['gift',       r.affinity * 0.55 + A.sociability * 0.35],
      ['pushmatch',  (A.playfulness + B.boldness) * 0.4 + r.annoyance * 0.3],
      ['peekaboo',   A.playfulness * 0.5 + (1 - B.boldness) * 0.25],
      ['sync_spin',  r.affinity * 0.4 + (A.playfulness + B.playfulness) * 0.25],
      ['showoff',    A.playfulness * 0.55 + B.curiosity * 0.3],
      ['cheer_up',   Math.max(0.05, (1 - B.energy) * 0.5 + r.affinity * 0.35)],
      ['watch_curser', (A.curiosity + B.curiosity) * 0.35],
    ];
    const total = pool.reduce((s, [, w]) => s + Math.max(0.02, w), 0);
    let roll = Math.random() * total;
    let kind: GameKind = 'tag';
    for (const [k, w] of pool) {
      roll -= Math.max(0.02, w);
      if (roll <= 0) { kind = k; break; }
    }

    const meta = GAME_META[kind];
    const swap = Math.random() < 0.5;
    this.games.push({
      kind,
      a: swap ? B.id : A.id,
      b: swap ? A.id : B.id,
      roleA: meta.roles[0],
      roleB: meta.roles[1],
      t: 0,
      dur: rnd(meta.dur[0], meta.dur[1]),
      data: { swapAt: rnd(2.5, 6), phase: 0, beat: rnd(0.6, 1.6) },
      label: meta.label,
    });

    r.excitement = clamp01(r.excitement + 0.45);
    r.gamesPlayed++;
    this.gameCooldown = rnd(14, 55);
  }

  private stepGames(dt: number, actors: SocialActor[]) {
    for (let i = this.games.length - 1; i >= 0; i--) {
      const g = this.games[i];
      g.t += dt;

      const A = actors.find((a) => a.id === g.a);
      const B = actors.find((a) => a.id === g.b);
      if (!A || !B || A.busy || B.busy) { this.endGame(i, false); continue; }

      const r = this.rel_(g.a, g.b);
      const d = Math.hypot(A.x - B.x, A.y - B.y);

      // tag: roles flip on a touch
      if (g.kind === 'tag') {
        g.data.swapAt -= dt;
        if (d < 130 && g.data.swapAt <= 0) {
          const t = g.roleA; g.roleA = g.roleB; g.roleB = t;
          g.data.swapAt = rnd(2.2, 5.5);
          r.excitement = clamp01(r.excitement + 0.3);
          this.flash(g.a, 'playful', 'tagged!', 'excited');
          this.flash(g.b, 'playful', 'tagged!', 'excited');
        }
      }

      // follow: leader occasionally changes
      if (g.kind === 'follow' && Math.random() < dt * 0.06) {
        const t = g.roleA; g.roleA = g.roleB; g.roleB = t;
      }

      // stare: someone eventually cracks
      if (g.kind === 'stare' && g.t > 2 && Math.random() < dt * 0.25) {
        const loser = Math.random() < 0.5 ? g.a : g.b;
        const winner = loser === g.a ? g.b : g.a;
        this.flash(loser, 'chaos', 'blinked first!', 'excited');
        this.flash(winner, 'playful', 'won the stare-off', 'warm');
        r.affinity = Math.min(1, r.affinity + 0.06);
        this.endGame(i, true);
        continue;
      }

      // bounce: alternate who moves in
      if (g.kind === 'bounce') {
        g.data.beat -= dt;
        if (g.data.beat <= 0) {
          g.data.phase = g.data.phase > 0.5 ? 0 : 1;
          g.data.beat = rnd(0.7, 1.8);
        }
      }

      // race: they pick a shared lane and sprint; the lead swaps randomly
      if (g.kind === 'race' && Math.random() < dt * 0.5) {
        const t = g.roleA; g.roleA = g.roleB; g.roleB = t;
      }

      // peekaboo: the hider reveals itself periodically
      if (g.kind === 'peekaboo') {
        g.data.beat -= dt;
        if (g.data.beat <= 0) {
          g.data.beat = rnd(1.1, 2.6);
          g.data.phase = g.data.phase > 0.5 ? 0 : 1;
          this.flash(g.a, 'playful', 'peek!', 'excited');
        }
      }

      // pushmatch: bracing phases alternate with shove phases
      if (g.kind === 'pushmatch') {
        g.data.beat -= dt;
        if (g.data.beat <= 0) {
          g.data.beat = rnd(0.8, 2.0);
          g.data.phase = g.data.phase > 0.5 ? 0 : 1;
          if (g.data.phase > 0.5) {
            r.annoyance = clamp01(r.annoyance + 0.06);
            this.flash(g.a, 'wary', 'shoving!', 'annoyed');
          }
        }
      }

      // showoff: the star changes trick on a whim
      if (g.kind === 'showoff' && Math.random() < dt * 0.35) {
        this.flash(g.a, 'playful', 'look at this!', 'excited');
        this.flash(g.b, 'emotion', `impressed by ${actors.find((x) => x.id === g.a)?.name ?? 'them'}`, 'warm');
      }

      // sync_spin: spin direction flips together
      if (g.kind === 'sync_spin' && Math.random() < dt * 0.3) {
        g.data.phase = g.data.phase > 0.5 ? 0 : 1;
      }

      // conga: back creature periodically nudges forward
      if (g.kind === 'conga' && d < 130 && Math.random() < dt * 0.6) {
        this.flash(g.b, 'playful', 'keeping up!', 'excited');
      }

      // games simply build excitement over time
      r.excitement = clamp01(r.excitement + dt * 0.02);

      // drifting too far apart ends most games
      if (d > 900 && g.kind !== 'hide' && Math.random() < dt * 0.7) {
        this.endGame(i, false);
        continue;
      }

      if (g.t >= g.dur) this.endGame(i, true);
    }
  }

  private endGame(index: number, completed: boolean) {
    const g = this.games[index];
    if (!g) return;
    const r = this.rel_(g.a, g.b);
    if (completed) {
      r.affinity = Math.min(1, r.affinity + rnd(0.06, 0.18));
      r.familiarity = clamp01(r.familiarity + 0.1);
      this.flash(g.a, 'emotion', `enjoyed ${g.label}`, 'warm');
      this.flash(g.b, 'emotion', `enjoyed ${g.label}`, 'warm');
    }
    this.games.splice(index, 1);
    this.gameCooldown = Math.max(this.gameCooldown, rnd(10, 40));
  }

  /* ---------------- directives ---------------- */

  private buildDirectives(actors: SocialActor[]) {
    for (const a of actors) {
      const dir: SocialDirective = {
        partnerId: null, partner: null, action: null,
        eyes: null, lookAtPartner: false, label: null, tone: 'neutral',
      };

      const g = this.gameFor(a.id);
      if (g) {
        const isA = g.a === a.id;
        const partnerId = isA ? g.b : g.a;
        const role = isA ? g.roleA : g.roleB;
        const P = actors.find((x) => x.id === partnerId);
        if (P) {
          dir.partnerId = partnerId;
          dir.partner = { x: P.x, y: P.y };
          dir.lookAtPartner = true;
          dir.label = `${g.label} with ${P.name}`;
          dir.tone = 'excited';

          switch (g.kind) {
            case 'tag':
              dir.action = role === 'it' ? 'chase_partner' : 'flee_partner';
              dir.eyes = role === 'it' ? 'attention' : 'playful';
              break;
            case 'waltz':
              dir.action = 'waltz_partner';
              dir.eyes = 'emotion';
              dir.tone = 'warm';
              break;
            case 'follow':
              dir.action = role === 'leader' ? 'lead_partner' : 'follow_partner';
              dir.eyes = role === 'leader' ? 'playful' : 'attention';
              break;
            case 'circle':
              dir.action = 'orbit_partner';
              dir.eyes = 'playful';
              break;
            case 'boop_duo':
              dir.action = 'boop_partner';
              dir.eyes = 'playful';
              break;
            case 'whisper':
              dir.action = 'whisper_partner';
              dir.eyes = role === 'whisperer' ? 'playful' : 'surprised';
              break;
            case 'acrobat':
              dir.action = 'acrobat_partner';
              dir.eyes = 'playful';
              break;
            case 'comfort':
              dir.action = 'comfort_partner';
              dir.eyes = 'emotion';
              dir.tone = 'warm';
              break;
            case 'spook':
              dir.action = role === 'sneaker' ? 'spook_sneak_partner' : 'face_partner';
              dir.eyes = role === 'sneaker' ? 'playful' : 'surprised';
              break;
            case 'swim_sync':
              dir.action = 'swim_sync_partner';
              dir.eyes = 'emotion';
              dir.tone = 'warm';
              break;
            case 'standoff':
              dir.action = 'standoff_partner';
              dir.eyes = 'wary';
              dir.tone = 'annoyed';
              break;
            case 'mirror':
              dir.action = role === 'lead' ? 'lead_partner' : 'mirror_partner';
              dir.eyes = 'attention';
              break;
            case 'stare':
              dir.action = 'face_partner';
              dir.eyes = 'wary';
              dir.tone = 'wary';
              break;
            case 'bounce': {
              const mover = g.data.phase > 0.5 ? g.a : g.b;
              dir.action = mover === a.id ? 'bump_partner' : 'face_partner';
              dir.eyes = 'playful';
              break;
            }
            case 'hide':
              dir.action = role === 'seeker' ? 'chase_partner' : 'hide_from_partner';
              dir.eyes = role === 'seeker' ? 'attention' : 'wary';
              break;
            case 'huddle':
              dir.action = 'huddle_partner';
              dir.eyes = 'emotion';
              dir.tone = 'warm';
              break;
            case 'duet':
              dir.action = 'duet_bob_partner';
              dir.eyes = 'happy';
              dir.tone = 'warm';
              break;
            case 'nap_cuddle':
              dir.action = 'nap_cuddle_partner';
              dir.eyes = 'idle';
              dir.tone = 'warm';
              break;
            /* ---- wave 3 ---- */
            case 'race':
              dir.action = role === 'racer' ? 'lead_partner' : 'follow_partner';
              dir.eyes = 'attention';
              break;
            case 'conga':
              dir.action = role === 'front' ? 'lead_partner' : 'follow_partner';
              dir.eyes = 'playful';
              break;
            case 'guard':
              dir.action = role === 'guard' ? 'guard_partner' : 'huddle_partner';
              dir.eyes = 'wary';
              dir.tone = 'wary';
              break;
            case 'gift':
              dir.action = 'gift_partner';
              dir.eyes = role === 'giver' ? 'emotion' : 'surprised';
              dir.tone = 'warm';
              break;
            case 'pushmatch':
              dir.action = role === 'pusher' ? 'bump_partner' : 'face_partner';
              dir.eyes = 'wary';
              dir.tone = 'annoyed';
              break;
            case 'peekaboo':
              dir.action = role === 'hider' ? 'hide_from_partner' : 'chase_partner';
              dir.eyes = 'playful';
              break;
            case 'sync_spin':
              dir.action = 'orbit_partner';
              dir.eyes = 'dizzy';
              break;
            case 'showoff':
              dir.action = role === 'star' ? 'showoff_partner' : 'face_partner';
              dir.eyes = role === 'star' ? 'playful' : 'attention';
              break;
            case 'cheer_up':
              dir.action = role === 'jester' ? 'comfort_partner' : 'huddle_partner';
              dir.eyes = role === 'jester' ? 'playful' : 'idle';
              dir.tone = 'warm';
              break;
            case 'watch_curser':
              dir.action = 'side_by_side_partner';
              dir.eyes = 'attention';
              break;
          }
        }
      } else {
        // no game — but maybe a flash reaction or a strong feeling toward someone
        let bestId: string | null = null;
        let bestScore = 0;
        for (const o of actors) {
          if (o.id === a.id) continue;
          const r = this.rel_(a.id, o.id);
          const d = Math.hypot(a.x - o.x, a.y - o.y);
          if (d > 600) continue;
          const intensity = Math.max(r.annoyance, r.excitement) * (1 - d / 700);
          if (intensity > bestScore) { bestScore = intensity; bestId = o.id; }
        }
        if (bestId && bestScore > 0.22) {
          const O = actors.find((x) => x.id === bestId)!;
          const r = this.rel_(a.id, bestId);
          dir.partnerId = bestId;
          dir.partner = { x: O.x, y: O.y };
          dir.lookAtPartner = Math.random() < 0.85;
          if (r.annoyance > r.excitement) {
            dir.tone = 'annoyed';
            dir.eyes = 'wary';
            dir.label = `irritated by ${O.name}`;
            if (r.annoyance > 0.55 && Math.random() < 0.02) dir.action = 'avoid_partner';
          } else {
            dir.tone = 'warm';
            dir.eyes = 'emotion';
            dir.label = `fond of ${O.name}`;
            if (r.excitement > 0.5 && Math.random() < 0.02) dir.action = 'greet_partner';
          }
        }
      }

      // a fresh flash overrides the ambient feeling
      const f = this.flashes.get(a.id);
      if (f) {
        dir.eyes = f.eyes;
        dir.label = f.label;
        dir.tone = f.tone;
        if (!dir.partner) {
          // look at whoever the flash is about, if we can find them
          const other = actors.find((x) => x.id !== a.id);
          if (other) { dir.partner = { x: other.x, y: other.y }; dir.lookAtPartner = true; }
        } else {
          dir.lookAtPartner = true;
        }
      }

      this.directives.set(a.id, dir);
    }
  }

  directiveFor(id: string): SocialDirective | null {
    return this.directives.get(id) ?? null;
  }

  /** Consume a one-shot eye cue so it fires only once */
  consumeFlash(id: string): { eyes: string; label: string; tone: string } | null {
    const f = this.flashes.get(id);
    if (!f) return null;
    if (f.t > 0 && !(f as { used?: boolean }).used) {
      (f as { used?: boolean }).used = true;
      return { eyes: f.eyes, label: f.label, tone: f.tone };
    }
    return null;
  }
}
