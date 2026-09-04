import React, { useEffect, useRef } from 'react';
import { ThemeConfig, ActiveTool, Settings, FoodOrb, BallOrb } from '../types';
import { createBall, stepBall, drawBall, kickBall, carryBall } from '../utils/ball';
import { soundFx } from '../utils/audio';
import { ACTIONS, startAction } from '../utils/actions';
import { clamp } from '../utils/math';
import { ParticleSystem } from '../utils/particles';
import { CreatureEntity, CreatureConfig } from '../utils/creature';
import { SocialDirector } from '../utils/social';
import { FXSettings } from './FXPanel';
import { t } from '../utils/i18n';

export interface RosterEntry {
  id: string;
  name: string;
  kind: string;
  mood: string;
  valence: number;
  arousal: number;
  happiness: number;
  energy: number;
  curiosity: number;
  meals: number;
  intent: string;
  bursting: boolean;
  /** live personality — those same 6 learned traits, shown for every creature */
  boldness: number;
  sociability: number;
  playfulness: number;
  diligence: number;
  curiousityTrait: number;
  stubbornness: number;
  mouthName: string;
  tint: string;
}

interface CreatureCanvasProps {
  theme: ThemeConfig;
  settings: Settings;
  activeTool: ActiveTool;
  companions: CreatureConfig[];
  fxs: FXSettings;
  onBehaviorChange?: (name: string) => void;
  onStatsUpdate?: (stats: { happiness: number; energy: number; curiosity: number }) => void;
  onTintChange?: (id: string, tint: string) => void;
  onNameChange?: (id: string, name: string) => void;
}

export const CreatureCanvas: React.FC<CreatureCanvasProps> = ({
  theme,
  settings,
  activeTool,
  companions,
  fxs,
  onBehaviorChange,
  onStatsUpdate,
  onTintChange,
  onNameChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleSysRef = useRef<ParticleSystem>(new ParticleSystem());
  const creaturesRef = useRef<CreatureEntity[]>([]);
  const foodOrbsRef = useRef<FoodOrb[]>([]);
  const ballOrbsRef = useRef<BallOrb[]>([]);
  const ballDragRef = useRef<BallOrb | null>(null);
  const socialRef = useRef<SocialDirector>(new SocialDirector());
  // (blaster removed)

  const mouseRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    down: false,
  });
  const prevCursorRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const cursorVelRef = useRef({ x: 0, y: 0 });
  const draggedRef = useRef<CreatureEntity | null>(null);

  // ---- primary creature is created once — бледный тёплый розовый, без голубого ----
  if (creaturesRef.current.length === 0) {
    const primary = new CreatureEntity(
      {
        id: 'penta_primary',
        name: 'Penta',
        kind: 'adult',
        sizeFactor: 1,
        tint: '#fda4af',
        tempo: 1,
        boldness: 0.5,
        sociability: 0.55,
        playfulness: 0.55,
        diligence: 0.5,
        curiosity: 0.65,
      },
      window.innerWidth / 2,
      window.innerHeight / 2
    );
    creaturesRef.current.push(primary);
  }

  // ---- sync companions list ----
  useEffect(() => {
    const list = creaturesRef.current;
    // remove companions no longer present
    for (let i = list.length - 1; i >= 1; i--) {
      if (!companions.find((c) => c.id === list[i].cfg.id)) list.splice(i, 1);
    }
    // add new ones
    for (const cfg of companions) {
      if (!list.find((e) => e.cfg.id === cfg.id)) {
        const px = clamp(
          window.innerWidth / 2 + (Math.random() - 0.5) * 420,
          120,
          window.innerWidth - 120
        );
        const py = clamp(
          window.innerHeight / 2 + (Math.random() - 0.5) * 260,
          120,
          window.innerHeight - 120
        );
        const ent = new CreatureEntity(cfg, px, py);
        list.push(ent);
        soundFx.playChirp('happy');
      } else {
        // live-update config (size, tint, tempo, traits)
        const ent = list.find((e) => e.cfg.id === cfg.id)!;
        ent.cfg = { ...cfg };
        const P = ent.mind.personality;
        P.boldness = cfg.boldness;
        P.sociability = cfg.sociability;
        P.playfulness = cfg.playfulness;
        P.diligence = cfg.diligence;
        P.curiosity = cfg.curiosity;
      }
    }
  }, [companions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let lastTime = performance.now();

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particleSysRef.current.resize(
        window.innerWidth,
        window.innerHeight,
        settings.particlesCount,
        theme.particleColor
      );
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // (blaster removed)

    const primary = () => creaturesRef.current[0];

    (window as unknown as { pentaJump?: (p?: number) => void }).pentaJump = (p = 1) =>
      primary()?.doJump(p, settings.centerMode);
    (window as unknown as { pentaTriggerEye?: () => void }).pentaTriggerEye = () => {
      const c = primary();
      if (!c) return;
      c.eyes.triggerRandomBehavior();
      onBehaviorChange?.(c.eyes.getBehaviorName());
      soundFx.playChirp('happy');
    };
    (window as unknown as { pentaPlayCategory?: (c: string) => void }).pentaPlayCategory = (cat) => {
      const c = primary();
      if (!c) return;
      c.eyes.playCategory(cat as never);
      onBehaviorChange?.(c.eyes.getBehaviorName());
    };
    (window as unknown as { pentaTriggerBurst?: (idx?: number) => void }).pentaTriggerBurst = (idx = 0) => {
      const c = creaturesRef.current[idx] ?? primary();
      if (!c) return;
      c.triggerBurst(settings.creatureScale, onBehaviorChange);
    };
    (window as unknown as { pentaRecenter?: () => void }).pentaRecenter = () => {
      for (const c of creaturesRef.current) {
        c.home = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        c.lastInteraction = 0;
      }
      soundFx.playChirp('curious');
    };

    (window as unknown as { pentaSetTint?: (id: string, tint: string) => void }).pentaSetTint = (id, tint) => {
      const c = creaturesRef.current.find((e) => e.cfg.id === id);
      if (c) {
        c.cfg.tint = tint;
        c.lastInteraction = performance.now();
        // лёгкий всплеск чтобы было видно смену цвета
        c.vScaleX = 0.12;
        c.vScaleY = -0.12;
      }
      if (id !== 'penta_primary' && onTintChange) onTintChange(id, tint);
    };

    (window as unknown as { pentaSetName?: (id: string, name: string) => void }).pentaSetName = (id, name) => {
      const clean = (name || '').trim().slice(0, 14);
      if (!clean) return;
      const c = creaturesRef.current.find((e) => e.cfg.id === id);
      if (c) {
        c.cfg.name = clean;
        c.lastInteraction = performance.now();
      }
      if (id !== 'penta_primary' && onNameChange) onNameChange(id, clean);
    };

    const render = (now: number) => {
      try {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      /* ---------- background ---------- */
      ctx.save();
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      theme.bgGradient.forEach((color, idx) => {
        grad.addColorStop(idx / (theme.bgGradient.length - 1), color);
      });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      if (theme.id === 'voidglow') {
        const inner = ctx.createRadialGradient(
          width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.62
        );
        inner.addColorStop(0, 'rgba(245, 247, 255, 0.09)');
        inner.addColorStop(0.18, 'rgba(200, 210, 255, 0.05)');
        inner.addColorStop(0.38, 'rgba(140, 150, 190, 0.025)');
        inner.addColorStop(0.72, 'rgba(20, 22, 32, 0)');
        inner.addColorStop(1, 'transparent');
        ctx.fillStyle = inner;
        ctx.fillRect(0, 0, width, height);

        const vig = ctx.createRadialGradient(
          width / 2, height / 2, Math.min(width, height) * 0.35,
          width / 2, height / 2, Math.max(width, height) * 0.95
        );
        vig.addColorStop(0, 'transparent');
        vig.addColorStop(1, 'rgba(0,0,0,0.55)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, width, height);
      }

      if (settings.cursorGlow) {
        const ag = ctx.createRadialGradient(mx, my, 10, mx, my, Math.max(width, height) * 0.6);
        ag.addColorStop(0, theme.ambientLightColor);
        ag.addColorStop(1, 'transparent');
        ctx.fillStyle = ag;
        ctx.fillRect(0, 0, width, height);
      }

      if (theme.gridOverlay) {
        ctx.strokeStyle = 'rgba(255,255,255,0.035)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
        for (let y = 0; y < height; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
      }
      ctx.restore();

      if (settings.showParticles) {
        particleSysRef.current.updateAndDraw(ctx, mx, my, theme.particleColor);
      }

      /* ---------- cursor velocity ---------- */
      const cvx = (mx - prevCursorRef.current.x) / Math.max(dt, 0.001) * 0.016;
      const cvy = (my - prevCursorRef.current.y) / Math.max(dt, 0.001) * 0.016;
      cursorVelRef.current.x += (cvx - cursorVelRef.current.x) * 0.25;
      cursorVelRef.current.y += (cvy - cursorVelRef.current.y) * 0.25;
      prevCursorRef.current.x = mx;
      prevCursorRef.current.y = my;
      const cursorSpeed = Math.hypot(cursorVelRef.current.x, cursorVelRef.current.y);

      /* ---------- ball: real physics, solo & duet play (100+ mechanics) ---------- */
      for (let i = ballOrbsRef.current.length - 1; i >= 0; i--) {
        const ball = ballOrbsRef.current[i];
        // carry handling — if carried, stick to carrier mouth
        if (ball.carriedBy) {
          const carrier = creaturesRef.current.find(c => c.cfg.id === ball.carriedBy);
          if (carrier) {
            // mouth position approx
            const headY = carrier.y - carrier.bodyH(settings.creatureScale) * 0.22;
            // use creature x,y + slight offset toward facing (vx)
            const offX = Math.cos(carrier.rotation) * 18 + (carrier.vx || 0) * 0.08;
            carryBall(ball, carrier.x + offX, headY + 8, carrier.cfg.id);
            // auto throw if carrier does toss action or random
            if (carrier.action && ['toss_ball','carry_ball'].includes(carrier.action.def.id) && Math.random() < 0.02) {
              const a = Math.atan2(carrier.vy || -3, carrier.vx || 5 + Math.random()*4) + (Math.random()-0.5)*0.6;
              const pow = 7 + Math.random()*9;
              kickBall(ball, a, pow, (Math.random()-0.5)*1.2);
              try { carrier.mouth.playById(['ball_toss_up_002','ball_toss_up_012','ball_joy_bark_009','ball_excited_pant_003'][Math.floor(Math.random()*4)]); } catch {}
              try { carrier.mouth.playCategory('ball'); } catch {}
            }
            // drop if too long carried
            if (ball.lastTouch > 2.5 + Math.random()*2.5 && Math.random() < 0.012) {
              const a = Math.random()*Math.PI*2;
              kickBall(ball, a, 4 + Math.random()*5);
            }
          } else {
            ball.carriedBy = null;
          }
        } else {
          stepBall(ball, dt, width, height, 46);
        }

        // ball-ball collisions
        for (let j = i+1; j < ballOrbsRef.current.length; j++) {
          const other = ballOrbsRef.current[j];
          if (other.carriedBy) continue;
          const dx = other.x - ball.x;
          const dy = other.y - ball.y;
          const d = Math.hypot(dx, dy) || 1;
          const minD = ball.radius + other.radius;
          if (d < minD) {
            const nx = dx / d, ny = dy / d;
            const overlap = (minD - d) * 0.5;
            ball.x -= nx * overlap; ball.y -= ny * overlap;
            other.x += nx * overlap; other.y += ny * overlap;
            // elastic exchange
            const v1 = ball.vx * nx + ball.vy * ny;
            const v2 = other.vx * nx + other.vy * ny;
            const imp = (v1 - v2) * 0.62;
            ball.vx -= imp * nx; ball.vy -= imp * ny;
            other.vx += imp * nx; other.vy += imp * ny;
            ball.vSpin += imp * 0.04; other.vSpin -= imp * 0.04;
            ball.squish = 0.86; other.squish = 0.86;
          }
        }

        // lifetime fade
        const blife = settings.ballLifetime > 0 ? settings.ballLifetime : Infinity;
        const bfadeStart = blife * 0.82;
        const bstale = ball.age > bfadeStart ? (ball.age - bfadeStart) / (blife - bfadeStart) : 0;
        if (bstale >= 1) { ballOrbsRef.current.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = 1 - bstale * 0.7;
        drawBall(ctx, ball, now);
        ctx.restore();

        // creature <-> ball collisions & mouth triggers (100+ mouth anims)
        for (const c of creaturesRef.current) {
          const bw = c.bodyW(settings.creatureScale) * 0.42;
          const dx = ball.x - c.x;
          const dy = ball.y - (c.y - c.bodyH(settings.creatureScale)*0.05);
          const dist = Math.hypot(dx, dy);
          const touchR = bw * 0.55 + ball.radius;
          if (dist < touchR && !ball.carriedBy) {
            // push ball
            const ang = Math.atan2(dy, dx);
            const impPower = Math.hypot(c.vx, c.vy) * 0.42 + 2.2;
            // body bump
            ball.vx += Math.cos(ang) * impPower * 0.18;
            ball.vy += Math.sin(ang) * impPower * 0.18;
            ball.vSpin += (c.vx * 0.02);
            ball.squish = 0.84;
            // chance to bite & carry
            const wantsCarry = c.mind.getPersonality ? c.mind.getPersonality().playfulness > 0.42 : Math.random() < 0.6;
            if (dist < bw*0.42 + ball.radius*0.65 && Math.random() < (wantsCarry ? 0.035 : 0.012)) {
              carryBall(ball, ball.x, ball.y, c.cfg.id);
              try { c.mouth.playById(['ball_bite_hold_001','ball_catch_snap_005','ball_bite_hold_011','ball_catch_snap_015'][Math.floor(Math.random()*4)]); } catch {}
              // also trigger ball-category random for variety
              if (Math.random() < 0.5) { try { c.mouth.playCategory('ball'); } catch {} }
              c.lastInteraction = now;
              // happy chirp
              try { (c as any).pushMood?.(0.12, 0.10); } catch {}
            } else if (Math.random() < 0.018) {
              // dribble / nose tap mouth
              try { c.mouth.playById(['ball_dribble_tap_004','ball_dribble_tap_014','ball_blow_push_007','ball_focus_stare_010'][Math.floor(Math.random()*4)]); } catch {}
            }
            // creature also gets nudged a bit
            c.vx -= Math.cos(ang) * 0.8;
            c.vy -= Math.sin(ang) * 0.8;
          }
        }
      }

      /* ---------- food: lands, lingers, tempts ---------- */
      for (let i = foodOrbsRef.current.length - 1; i >= 0; i--) {
        const food = foodOrbsRef.current[i];
        food.age = (food.age ?? 0) + dt;

        if (!food.settled) {
          food.x += food.vx;
          food.y += food.vy;
          food.vy += 0.2;
          food.vx *= 0.99;
          if (food.y > height - 60) {
            food.y = height - 60;
            food.vy *= -0.45;
            food.vx *= 0.78;
            if (Math.abs(food.vy) < 1.2 && Math.abs(food.vx) < 0.5) {
              food.settled = true;
              food.vx = 0; food.vy = 0;
            }
          }
        } else {
          // resting snacks drift a hair so they feel alive
          food.y = height - 60 + Math.sin(now * 0.0016 + food.x * 0.01) * 2.2;
        }

        // stale snacks eventually fade away (lifetime is user-tunable)
        const life = settings.foodLifetime > 0 ? settings.foodLifetime : Infinity;
        const fadeStart = life * 0.75;
        const stale = food.age > fadeStart ? (food.age - fadeStart) / (life - fadeStart) : 0;
        if (stale >= 1) { foodOrbsRef.current.splice(i, 1); continue; }

        const pulse = 1 + Math.sin(now * 0.006 + food.x) * 0.12;
        const fade = 1 - stale * 0.75;
        const isChildFood = food.forKind === 'child';
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.beginPath();
        ctx.arc(food.x, food.y, food.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = food.color;
        ctx.shadowColor = food.color;
        ctx.shadowBlur = isChildFood ? 9 : 12;
        ctx.fill();
        if (isChildFood) {
          // тонкий белый кант чтобы маленький корм сразу отличался от взрослого
          ctx.shadowBlur = 0;
          ctx.strokeStyle = 'rgba(255,255,255,0.92)';
          ctx.lineWidth = 1.6;
          ctx.stroke();
          // маленькая иконка-сердечко/точка внутри для дополнительной подсказки
          ctx.beginPath();
          ctx.arc(food.x + food.radius * 0.35, food.y + food.radius * 0.35, Math.max(1.2, food.radius * 0.18), 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.95)';
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(food.x - food.radius * 0.3, food.y - food.radius * 0.3, food.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fill();
        ctx.restore();

        // Contact does NOT force a meal — each creature decides for itself
        let eaten = false;
        let nearby: typeof creaturesRef.current = [];
        try {
          nearby = creaturesRef.current.filter(
            (c) => { try { return !c.eat && (food.forKind ? c.cfg.kind === food.forKind : true) && Math.hypot(food.x - c.x, food.y - c.y) < c.bodyW(settings.creatureScale) * 0.52; } catch { return false; } }
          );
        } catch { nearby = []; }
        for (const c of nearby) {
          try {
            if (!c.wantsToEat(food.id, food.age, settings.appetite)) continue;
          } catch { continue; }
          try {
            c.startMeal(food.x, food.y, food.color, {
              fxSettings: { foodRipple: fxs.foodRipple, foodSound: fxs.foodSound },
              onRipple: (rx, ry, s, n, col) => {
                try { if (s > 0 && n > 0) particleSysRef.current.addRipple(rx, ry, col, s, n); } catch {}
              },
              onBehavior: onBehaviorChange,
            });
          } catch (e) { console.error('[PENTA] startMeal', e); continue; }
          try { c.focusFoodId = null; } catch {}
          try { onBehaviorChange?.(`${c.cfg.name} is savouring it`); } catch {}
          try {
            onStatsUpdate?.({
              happiness: Math.round(c.happiness),
              energy: Math.round(c.energyStat),
              curiosity: Math.round(c.curiosityStat),
            });
          } catch {}
          // if somebody else was heading for this snack, they take it personally
          try {
            for (const rival of creaturesRef.current) {
              if (rival === c) continue;
              let wasInterested = false;
              try {
                wasInterested =
                  rival.focusFoodId === food.id ||
                  Math.hypot(food.x - rival.x, food.y - rival.y) < 260;
              } catch { wasInterested = false; }
              if (wasInterested) {
                try { socialRef.current.notifyFoodTheft(c.cfg.id, rival.cfg.id, c.cfg.name, rival.cfg.name); } catch {}
                try { rival.focusFoodId = null; } catch {}
              }
            }
          } catch {}
          eaten = true;
          break;
        }
        if (eaten) { try { foodOrbsRef.current.splice(i, 1); } catch {} }
      }

      /* ---------- laser ---------- */
      if (activeTool === 'laser') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(mx, my, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#EF4444';
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = 22;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mx, my, 16, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(239,68,68,0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      /* ---------- quantum burst reticle tool ---------- */
      if (activeTool === 'burst') {
        ctx.save();
        const pulse = Math.sin(now * 0.008) * 4;
        const rot = now * 0.0025;
        ctx.translate(mx, my);
        ctx.rotate(rot);

        // Outer pulsing hazard ring
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, 26 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Inner crosshair brackets
        ctx.setLineDash([]);
        ctx.strokeStyle = '#FDA4AF';
        ctx.lineWidth = 2;
        const s = 14;
        [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].forEach((ang) => {
          ctx.save();
          ctx.rotate(ang);
          ctx.beginPath();
          ctx.moveTo(s, -6);
          ctx.lineTo(s, 0);
          ctx.lineTo(s - 6, 0);
          ctx.stroke();
          ctx.restore();
        });

        // Glowing center core
        ctx.fillStyle = '#FB7185';
        ctx.shadowColor = '#F43F5E';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      /* ---------- creatures ---------- */
      const list = creaturesRef.current;
      const foodPts = foodOrbsRef.current.map((f) => ({ x: f.x, y: f.y }));
      const foodInfo = foodOrbsRef.current.map((f) => ({
        id: f.id, x: f.x, y: f.y, age: f.age ?? 0, forKind: (f.forKind ?? 'adult') as 'adult' | 'child',
      }));
      const ballPts = ballOrbsRef.current.map(b => ({ x: b.x, y: b.y, vx: b.vx, vy: b.vy, radius: b.radius, id: b.id, carriedBy: b.carriedBy }));
      const ballFocus = ballPts.length ? ballPts.reduce((best:any, cur:any) => {
        const cx = creaturesRef.current[0]?.x ?? width/2;
        const cy = creaturesRef.current[0]?.y ?? height/2;
        const d0 = Math.hypot(cur.x - cx, cur.y - cy);
        const bd = best ? Math.hypot(best.x - cx, best.y - cy) : Infinity;
        return d0 < bd ? cur : best;
      }, null as any) : null;

      // social fabric: relationships, moods and emergent games
      const actors = list.map((c) => c.toSocialActor());
      socialRef.current.update(dt, actors, {
        allowGames: settings.allowGames,
        allowFoodDrama: settings.allowFoodDrama,
        socialDrive: settings.socialDrive,
        personalSpace: settings.personalSpace,
      });

      // each creature gets a "how much do I want company" drive from its bonds
      for (let i = 0; i < list.length; i++) {
        list[i].hoverBobScale = settings.hoverBob;
        list[i].jiggleScale = settings.softBodyJiggle;
        list[i].tiltScale = settings.turnTilt;
      }

      // draw bonds between creatures that are engaged with each other
      if (settings.showBonds) for (const g of socialRef.current.activeGames()) {
        const A = list.find((c) => c.cfg.id === g.a);
        const B = list.find((c) => c.cfg.id === g.b);
        if (!A || !B) continue;
        const d = Math.hypot(A.x - B.x, A.y - B.y);
        if (d > 620) continue;
        const rel = socialRef.current.getRelationship(g.a, g.b);
        const warm = rel.affinity > 0;
        const alpha = Math.max(0, 0.16 * (1 - d / 620)) * (0.6 + Math.sin(now * 0.004) * 0.4);
        ctx.save();
        ctx.strokeStyle = warm
          ? `rgba(244, 190, 255, ${alpha})`
          : `rgba(255, 170, 150, ${alpha})`;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([5, 9]);
        ctx.lineDashOffset = -now * 0.03;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        const midX = (A.x + B.x) / 2 + Math.sin(now * 0.002) * 26;
        const midY = (A.y + B.y) / 2 - 40 + Math.cos(now * 0.0018) * 22;
        ctx.quadraticCurveTo(midX, midY, B.x, B.y);
        ctx.stroke();
        ctx.restore();
      }

      for (const c of list) {
        try {
        // how much does it want company? closer bonds & low valence raise the pull
        const pull = list.length > 1
          ? Math.min(1, (1 - Math.max(-0.2, c.valence)) * 0.5 + settings.socialDrive * 0.3)
          : 0.15;

        c.update(dt, now, {
          social: (()=>{ try{ return socialRef.current.directiveFor(c.cfg.id); } catch { return null; }})(),
          foodOrbs: foodInfo,
          width, height, mx, my,
          cursorVX: cursorVelRef.current.x,
          cursorVY: cursorVelRef.current.y,
          cursorSpeed,
          food: foodPts,
          balls: ballPts,
          focusBall: ballFocus,
          tool: activeTool,
          globalScale: settings.creatureScale,
          centerMode: settings.centerMode,
          autoReturnDelay: settings.autoReturnDelay,
          springStiffness: settings.springStiffness,
          tempoRate: settings.randomBehaviorRate,
          socialPull: pull,
          moodVolatility: settings.moodVolatility,
          motionEnergy: settings.motionEnergy,
          maxSpeed: settings.maxSpeed,
          restitution: settings.restitution,
          softBodyJiggle: settings.softBodyJiggle,
          hoverBob: settings.hoverBob,
          turnTilt: settings.turnTilt,
          eyeTracking: settings.eyeTracking,
          blinkRate: settings.blinkRate,
          saccadeAmount: settings.saccadeAmount,
          glintBrightness: settings.glintBrightness,
          eyeFreedom: settings.eyeFreedom,
          appetite: settings.appetite,
          stubbornness: settings.stubbornness,
          others: list,
          fxSettings: {
            impactRipple: fxs.impactRipple,
            impactSound: fxs.impactSound,
            foodRipple: fxs.foodRipple,
            foodSound: fxs.foodSound,
          },
          onBehavior: c === list[0] ? onBehaviorChange : undefined,
          onRipple: (rx, ry, scale, count, color) => {
            try { if (scale <= 0 || count <= 0) return;
            particleSysRef.current.addRipple(rx, ry, color, scale, count); } catch {}
          },
        });
        } catch (e) { console.error('[PENTA] c.update', c.cfg.id, e); }
      }

      // draw back-to-front by y so overlaps look right — тела без ников, ники рисуем отдельным верхним слоем
      [...list].sort((a, b) => a.y - b.y).forEach((c) => {
        try {
          c.draw(ctx, {
            mx, my,
            globalScale: settings.creatureScale,
            cornerRoundness: settings.cornerRoundness,
            bodyMaterial: settings.bodyMaterial,
            showShadow: settings.showShadow,
            showRimLight: settings.showRimLight,
            themeCategory: theme.category,
            themeShadow: theme.shadowColor,
            height,
            eyeTracking: settings.eyeTracking,
            blinkRate: settings.blinkRate,
            saccadeAmount: settings.saccadeAmount,
            glintBrightness: settings.glintBrightness,
            eyeFreedom: settings.eyeFreedom,
            showMouths: settings.showMouths,
            showNicks: false,
          });
        } catch (e) { console.error('[PENTA] c.draw', c.cfg.id, e); }
      });

      // — НИКИ строго над каждым телом (включая главного Penta) — отдельным слоем поверх всех тел, всегда горизонтально и всегда видно
      if (settings.showNicks) {
        for (const c of [...list].sort((a, b) => a.y - b.y)) {
          try {
            if (c.isBursting()) continue;
            const curH = c.bodyH(settings.creatureScale);
            const eatLift = c.eat?.lift ?? 0;
            // @ts-ignore — bodyBounce и hoverBobScale публичны в рантайме
            const bounce = (c.mind as unknown as { bodyBounce: number }).bodyBounce * (c.hoverBobScale ?? 1);
            const jitterY = c.burst.phase === 'charge' ? (Math.random() - 0.5) * 4 : 0;
            const jitterX = c.burst.phase === 'charge' ? (Math.random() - 0.5) * 4 : 0;
          const nx = c.x + jitterX;
          const ny = c.y + eatLift + bounce + jitterY - curH / 2 - 22;
          ctx.save();
          ctx.translate(nx, ny);
          const name = c.cfg.name || 'Penta';
          ctx.font = '700 11px "Plus Jakarta Sans", system-ui, sans-serif';
          const padX = 10;
          let w = 0;
          try { w = ctx.measureText(name).width + padX * 2; } catch { w = name.length * 7 + padX * 2; }
          w = Math.max(w, 44);
          const h = 18;
          const r = 9;
          const x1 = -w / 2, y1 = -h / 2, x2 = w / 2, y2 = h / 2;
          // тень
          ctx.shadowColor = 'rgba(0,0,0,0.35)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetY = 2;
          // пилюля
          ctx.fillStyle = 'rgba(15,23,42,0.88)';
          // @ts-ignore
          ctx.strokeStyle = c.cfg.tint;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          // @ts-ignore
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
          // сброс тени для обводки свечения
          ctx.shadowColor = c.cfg.tint;
          ctx.shadowBlur = 12;
          ctx.stroke();
          // текст
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(name, 0, 0.5);
          ctx.restore();
          } catch { /* nick must never break the game */ }
        }
      }

      // expose EVERY creature's state to the HUD (panels for all companions)
      const roster: RosterEntry[] = list.map((c) => ({
        id: c.cfg.id,
        name: c.cfg.name,
        kind: c.cfg.kind,
        mood: c.getMoodWord(),
        valence: c.valence,
        arousal: c.arousal,
        happiness: Math.round(c.happiness),
        energy: Math.round(c.energyStat),
        curiosity: Math.round(c.curiosityStat),
        meals: c.mealsEaten,
        intent: c.isBursting()
          ? t('burst.overload')
          : c.eat
          ? `Eating · ${c.eat.phase}`
          : c.mind.getIntent(),
        bursting: c.isBursting(),
        boldness: c.mind.personality.boldness,
        sociability: c.mind.personality.sociability,
        playfulness: c.mind.personality.playfulness,
        diligence: c.mind.personality.diligence,
        curiousityTrait: c.mind.personality.curiosity,
        stubbornness: c.temperament.stubborn,
        mouthName: c.mouth.getName(),
        tint: c.cfg.tint,
      }));
      (window as unknown as Record<string, unknown>).pentaRoster = roster;

      const p = list[0];
      if (p) {
        (window as unknown as Record<string, unknown>).pentaMindState = p.mind.getState();
        (window as unknown as Record<string, unknown>).pentaIntent = p.eat
          ? `Enjoying a meal · ${p.eat.phase}`
          : p.mind.getIntent();
        (window as unknown as Record<string, unknown>).pentaEnergy = p.mind.getEnergy();
        (window as unknown as Record<string, unknown>).pentaPersonality = { ...p.mind.personality };
        (window as unknown as Record<string, unknown>).pentaMeals = p.mealsEaten;
        (window as unknown as Record<string, unknown>).pentaMood = p.getMoodWord();

        // social readout
        const games = socialRef.current.activeGames();
        if (games.length) {
          const g = games[0];
          const A = list.find((c) => c.cfg.id === g.a);
          const B = list.find((c) => c.cfg.id === g.b);
          (window as unknown as Record<string, unknown>).pentaSocial =
            A && B ? `${A.cfg.name} & ${B.cfg.name} — ${g.label}` : null;
        } else {
          const withLabel = list.find((c) => c.socialLabel);
          (window as unknown as Record<string, unknown>).pentaSocial = withLabel
            ? `${withLabel.cfg.name}: ${withLabel.socialLabel}`
            : null;
        }

        // strongest bond, for the relationship meter
        const rels = socialRef.current.allRelationships();
        if (rels.length) {
          const best = rels.reduce((a, b) => (Math.abs(b.affinity) > Math.abs(a.affinity) ? b : a));
          const A = list.find((c) => c.cfg.id === best.pair[0]);
          const B = list.find((c) => c.cfg.id === best.pair[1]);
          (window as unknown as Record<string, unknown>).pentaBond = A && B
            ? { a: A.cfg.name, b: B.cfg.name, affinity: best.affinity, annoyance: best.annoyance, games: best.gamesPlayed }
            : null;
        } else {
          (window as unknown as Record<string, unknown>).pentaBond = null;
        }
      }

      } catch (e) { console.error('[PENTA] render', e); }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme, settings, activeTool, onBehaviorChange, onStatsUpdate, onTintChange, onNameChange]);

  /* ---------------- pointer ---------------- */

  const hitTest = (mx: number, my: number): CreatureEntity | null => {
    // topmost (largest y) first
    const sorted = [...creaturesRef.current].sort((a, b) => b.y - a.y);
    for (const c of sorted) {
      const w = c.bodyW(settings.creatureScale);
      const h = c.bodyH(settings.creatureScale);
      if (Math.abs(mx - c.x) < w * 0.54 && Math.abs(my - c.y) < h * 0.62) return c;
    }
    return null;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const now = performance.now();

    mouseRef.current.x = mx;
    mouseRef.current.y = my;
    mouseRef.current.down = true;

    if (activeTool === 'food') {
      const pickColor = () => ['#F59E0B', '#EC4899', '#3B82F6', '#10B981', '#A855F7'][Math.floor(Math.random() * 5)];
      const hasChild = creaturesRef.current.some((c) => c.cfg.kind === 'child');
      if (hasChild) {
        // mixed sprinkle: one adult-sized and one child-sized, so each kind has its own snack
        foodOrbsRef.current.push({
          id: Math.random().toString(),
          x: mx + (Math.random() - 0.5) * 10,
          y: my + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 4,
          vy: -3,
          radius: 12 * settings.foodSize,
          color: pickColor(),
          type: 'star',
          forKind: 'adult',
        });
        foodOrbsRef.current.push({
          id: Math.random().toString(),
          x: mx + (Math.random() - 0.5) * 18,
          y: my + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 4,
          vy: -3,
          radius: 7 * settings.foodSize,
          color: pickColor(),
          type: 'star',
          forKind: 'child',
        });
        // a little extra scatter so the sprinkle feels generous (keeps kind balance)
        if (Math.random() < 0.5) {
          const kind = Math.random() < 0.5 ? 'adult' as const : 'child' as const;
          foodOrbsRef.current.push({
            id: Math.random().toString(),
            x: mx + (Math.random() - 0.5) * 26,
            y: my + (Math.random() - 0.5) * 14,
            vx: (Math.random() - 0.5) * 4,
            vy: -3,
            radius: (kind === 'adult' ? 12 : 7) * settings.foodSize,
            color: pickColor(),
            type: 'star',
            forKind: kind,
          });
        }
      } else {
        foodOrbsRef.current.push({
          id: Math.random().toString(),
          x: mx, y: my,
          vx: (Math.random() - 0.5) * 4,
          vy: -3,
          radius: 12 * settings.foodSize,
          color: pickColor(),
          type: 'star',
          forKind: 'adult',
        });
      }
      soundFx.playChirp('happy');
      return;
    }

    const hit = hitTest(mx, my);

    if (activeTool === 'ball') {
      // spawn or drag ball — click creates, drag throws
      const existing = ballOrbsRef.current.find(b => Math.hypot(b.x - mx, b.y - my) < b.radius + 22);
      if (existing && !existing.carriedBy) {
        ballDragRef.current = existing;
        (existing as any)._dragStartX = existing.x;
        (existing as any)._dragStartY = existing.y;
        existing.vx = 0; existing.vy = 0;
        return;
      }
      const scale = settings.ballSize;
      const b = createBall(mx, my, (Math.random()-0.5)*3, -2 - Math.random()*2, scale);
      // give initial toss toward random direction for fun
      b.vx += (Math.random()-0.5)*6;
      b.vy += (Math.random()-0.5)*6;
      ballOrbsRef.current.push(b);
      // limit to 4 balls
      if (ballOrbsRef.current.length > 4) ballOrbsRef.current.shift();
      // mouth excited
      for (const c of creaturesRef.current) {
        if (Math.hypot(c.x - mx, c.y - my) < 320) {
          try { c.mouth.playById('ball_excited_pant_003'); } catch {}
          try { c.mouth.playCategory('ball'); } catch {}
        }
      }
      soundFx.playChirp('happy');
      return;
    }

    if (activeTool === 'burst') {
      if (hit) {
        hit.triggerBurst(settings.creatureScale, onBehaviorChange);
        if (fxs.impactRipple) {
          particleSysRef.current.addRipple(hit.x, hit.y, 'rgba(251,113,133,0.95)', 1.6, 3);
        }
        return;
      }

      // If clicked empty space, find the nearest creature within range
      const near = creaturesRef.current
        .filter((c) => !c.isBursting())
        .sort((a, b) => Math.hypot(a.x - mx, a.y - my) - Math.hypot(b.x - mx, b.y - my))[0];

      if (near && Math.hypot(near.x - mx, near.y - my) < 360) {
        near.triggerBurst(settings.creatureScale, onBehaviorChange);
      } else {
        particleSysRef.current.addRipple(mx, my, 'rgba(244,63,94,0.85)', 1.2, 2);
        soundFx.playBurstCharge();
      }
      return;
    }

    if (hit) {
      hit.isDragging = true;
      draggedRef.current = hit;
      hit.dragOffsetX = mx - hit.x;
      hit.dragOffsetY = my - hit.y;
      hit.vx = 0; hit.vy = 0;
      hit.action = null;
      hit.lastInteraction = now;
      hit.lastPoke = now;
      hit.throwSample = { x: mx, y: my, t: now };
      hit.verts.forEach((v) => {
        v.vx += (Math.random() - 0.5) * 14;
        v.vy += (Math.random() - 0.5) * 14;
      });
      hit.vScaleX = 0.2;
      hit.vScaleY = -0.2;
      particleSysRef.current.addRipple(mx, my, 'rgba(255,255,255,0.45)');

      const P = hit.mind.personality;
      const st = hit.mind.getState();
      const base = st === 'drowsy' ? 0.4 : st === 'hyper' ? 0.92 : st === 'playful' ? 0.88 : 0.7;
      const chance = clamp(base + (P.sociability - 0.5) * 0.3, 0.2, 0.95);
      if (now - hit.lastReaction > 650 && Math.random() < chance) {
        hit.mind.notifyPoke(now);
        const r = Math.random();
        if (r < P.playfulness * 0.5) hit.eyes.playCategory('playful' as never);
        else if (r < 0.7) hit.eyes.playCategory('emotion' as never);
        else hit.eyes.triggerRandomBehavior();
        if (hit === creaturesRef.current[0]) onBehaviorChange?.(hit.eyes.getBehaviorName());
        hit.lastReaction = now;
        soundFx.playChirp('happy');
      } else if (Math.random() < 0.5) {
        soundFx.playBlink();
      }
      return;
    }

    // --- empty space click: each creature decides on its own ---
    particleSysRef.current.addRipple(mx, my, theme.particleColor);

    for (const c of creaturesRef.current) {
      if (c.eat) continue;
      // stubbornness gives them a mind of their own about responding at all
      if (Math.random() < settings.stubbornness) {
        c.noteIgnored();
        continue;
      }
      const verdict = c.mind.notifyOutsideClick(now);
      if (now - c.lastReaction < 700) continue;

      if (verdict === 'ignored') continue;

      if (activeTool === 'laser') {
        if (verdict === 'engage' && settings.centerMode !== 'locked' && Math.random() < 0.55) {
          const def = ACTIONS.find((a) => a.id === 'chase_laser');
          if (def) {
            c.action = startAction(def, {
              self: { x: c.x, y: c.y },
              cursor: { x: mx, y: my, vx: 0, vy: 0, speed: 0 },
              bounds: { w: window.innerWidth, h: window.innerHeight, mx: 90, my: 90 },
              center: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
              home: c.home,
              food: [],
              tool: activeTool,
              personality: c.mind.personality,
              energy: c.mind.getEnergy(),
              canTravel: true,
            });
            c.mind.forceAction('chase_laser', 'Chasing the dot');
          }
        } else {
          c.eyes.setMood('laser_lock');
        }
        if (c === creaturesRef.current[0]) onBehaviorChange?.('Chasing the dot');
        c.lastReaction = now;
        soundFx.playLaserLock();
        continue;
      }

      if (verdict === 'engage' && c.mind.shouldComeToClick() && settings.centerMode !== 'locked') {
        const def = ACTIONS.find((a) => a.id === 'come_here');
        if (def) {
          c.action = startAction(def, {
            self: { x: c.x, y: c.y },
            cursor: { x: mx, y: my, vx: 0, vy: 0, speed: 0 },
            bounds: { w: window.innerWidth, h: window.innerHeight, mx: 90, my: 90 },
            center: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
            home: c.home,
            food: [],
            tool: activeTool,
            personality: c.mind.personality,
            energy: c.mind.getEnergy(),
            canTravel: true,
          });
          c.mind.forceAction('come_here', 'Coming over');
        }
        if (c === creaturesRef.current[0]) onBehaviorChange?.('Coming over');
        c.lastReaction = now;
        continue;
      }

      if (verdict === 'glance') {
        const bx = mx - c.x;
        const by = my - c.y;
        const d = Math.hypot(bx, by) || 1;
        const reach = Math.min(1, d / 500);
        c.gaze.vx += (bx / d) * reach * 13;
        c.gaze.vy += (by / d) * reach * 9;
        c.lastGlance = now;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const now = performance.now();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;

    const d = draggedRef.current;
    if (d) {
      const prev = d.throwSample;
      const dtS = Math.max(0.016, (now - prev.t) / 1000);
      const vx = (mouseRef.current.x - prev.x) / dtS;
      const vy = (mouseRef.current.y - prev.y) / dtS;
      d.vx = d.vx * 0.6 + vx * 0.04;
      d.vy = d.vy * 0.6 + vy * 0.04;
      d.throwSample = { x: mouseRef.current.x, y: mouseRef.current.y, t: now };
      d.lastInteraction = now;
    }

    if (activeTool === 'tickle') {
      for (const c of creaturesRef.current) {
        if (Math.hypot(mouseRef.current.x - c.x, mouseRef.current.y - c.y) < 120) {
          c.lastInteraction = now;
          if (now - c.lastReaction > 700 && Math.random() < 0.42) {
            c.vScaleX = Math.sin(now * 0.05) * 0.13;
            soundFx.playGiggle();
            c.eyes.playCategory('playful' as never);
            if (c === creaturesRef.current[0]) onBehaviorChange?.(c.eyes.getBehaviorName());
            c.lastReaction = now;
          } else {
            c.vScaleX = Math.sin(now * 0.05) * 0.06;
          }
        }
      }
    }
  };

  const handlePointerUp = () => {
    if (ballDragRef.current) {
      const b = ballDragRef.current;
      const rect2 = canvasRef.current?.getBoundingClientRect();
      if (rect2) {
        void (window as any).lastBallUX; void (window as any).lastBallUY;
        // compute velocity from drag delta
        const dx = b.x - (b as any)._dragStartX;
        const dy = b.y - (b as any)._dragStartY;
        if (dx !== undefined) {
          b.vx = dx * 0.22;
          b.vy = dy * 0.22;
          if (Math.hypot(b.vx, b.vy) < 1.5) { b.vx = (Math.random()-0.5)*4; b.vy = -3; }
          b.vSpin = dx * 0.008;
        }
      }
      // also simple throw if no drag start recorded
      if (Math.hypot(b.vx, b.vy) < 0.5) { b.vx = (Math.random()-0.5)*8; b.vy = -4 - Math.random()*4; }
      ballDragRef.current = null;
    }
    mouseRef.current.down = false;
    const now = performance.now();
    const d = draggedRef.current;
    if (d) {
      d.isDragging = false;
      d.vScaleX = -0.2;
      d.vScaleY = 0.25;
      soundFx.playBounce(1.1);
      if (settings.centerMode === 'locked') { d.vx = 0; d.vy = 0; }
      else {
        d.vx *= 1.15; d.vy *= 1.15;
        const sp = Math.hypot(d.vx, d.vy);
        if (sp > 28) { d.vx = (d.vx / sp) * 28; d.vy = (d.vy / sp) * 28; }
        const m = 60 * settings.creatureScale;
        d.home.x = clamp(d.x, m, window.innerWidth - m);
        d.home.y = clamp(d.y, m, window.innerHeight - m);
      }
      if (now - d.lastReaction > 800 && Math.random() < 0.55) {
        d.eyes.playCategory(Math.hypot(d.vx, d.vy) > 8 ? ('chaos' as never) : ('playful' as never));
        d.lastReaction = now;
      }
      draggedRef.current = null;
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="absolute inset-0 w-full h-full cursor-crosshair touch-none select-none"
    />
  );
};
