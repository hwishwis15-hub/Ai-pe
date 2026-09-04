import React, { useEffect, useRef } from 'react';
import { ThemeConfig, ActiveTool, Settings, FoodOrb } from '../types';
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
}

interface CreatureCanvasProps {
  theme: ThemeConfig;
  settings: Settings;
  activeTool: ActiveTool;
  companions: CreatureConfig[];
  fxs: FXSettings;
  onBehaviorChange?: (name: string) => void;
  onStatsUpdate?: (stats: { happiness: number; energy: number; curiosity: number }) => void;
}

export const CreatureCanvas: React.FC<CreatureCanvasProps> = ({
  theme,
  settings,
  activeTool,
  companions,
  fxs,
  onBehaviorChange,
  onStatsUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleSysRef = useRef<ParticleSystem>(new ParticleSystem());
  const creaturesRef = useRef<CreatureEntity[]>([]);
  const foodOrbsRef = useRef<FoodOrb[]>([]);
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

  // ---- primary creature is created once ----
  if (creaturesRef.current.length === 0) {
    const primary = new CreatureEntity(
      {
        id: 'penta_primary',
        name: 'Penta',
        kind: 'adult',
        sizeFactor: 1,
        tint: '#FBFCFE',
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

    const render = (now: number) => {
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
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.beginPath();
        ctx.arc(food.x, food.y, food.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = food.color;
        ctx.shadowColor = food.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(food.x - food.radius * 0.3, food.y - food.radius * 0.3, food.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fill();
        ctx.restore();

        // Contact does NOT force a meal — each creature decides for itself
        let eaten = false;
        const nearby = creaturesRef.current.filter(
          (c) => !c.eat && Math.hypot(food.x - c.x, food.y - c.y) < c.bodyW(settings.creatureScale) * 0.52
        );
        for (const c of nearby) {
          if (!c.wantsToEat(food.id, food.age, settings.appetite)) continue;
          c.startMeal(food.x, food.y, food.color, {
            fxSettings: { foodRipple: fxs.foodRipple, foodSound: fxs.foodSound },
            onRipple: (rx, ry, s, n, col) => {
              if (s > 0 && n > 0) particleSysRef.current.addRipple(rx, ry, col, s, n);
            },
            onBehavior: onBehaviorChange,
          });
          c.focusFoodId = null;
          onBehaviorChange?.(`${c.cfg.name} is savouring it`);
          onStatsUpdate?.({
            happiness: Math.round(c.happiness),
            energy: Math.round(c.energyStat),
            curiosity: Math.round(c.curiosityStat),
          });
          // if somebody else was heading for this snack, they take it personally
          for (const rival of creaturesRef.current) {
            if (rival === c) continue;
            const wasInterested =
              rival.focusFoodId === food.id ||
              Math.hypot(food.x - rival.x, food.y - rival.y) < 260;
            if (wasInterested) {
              socialRef.current.notifyFoodTheft(c.cfg.id, rival.cfg.id, c.cfg.name, rival.cfg.name);
              rival.focusFoodId = null;
            }
          }
          eaten = true;
          break;
        }
        if (eaten) foodOrbsRef.current.splice(i, 1);
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
        id: f.id, x: f.x, y: f.y, age: f.age ?? 0,
      }));

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
        // how much does it want company? closer bonds & low valence raise the pull
        const pull = list.length > 1
          ? Math.min(1, (1 - Math.max(-0.2, c.valence)) * 0.5 + settings.socialDrive * 0.3)
          : 0.15;

        c.update(dt, now, {
          social: socialRef.current.directiveFor(c.cfg.id),
          foodOrbs: foodInfo,
          width, height, mx, my,
          cursorVX: cursorVelRef.current.x,
          cursorVY: cursorVelRef.current.y,
          cursorSpeed,
          food: foodPts,
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
            if (scale <= 0 || count <= 0) return;
            particleSysRef.current.addRipple(rx, ry, color, scale, count);
          },
        });
      }

      // draw back-to-front by y so overlaps look right
      [...list].sort((a, b) => a.y - b.y).forEach((c) => {
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
        });
      });

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

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme, settings, activeTool, onBehaviorChange, onStatsUpdate]);

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
      foodOrbsRef.current.push({
        id: Math.random().toString(),
        x: mx, y: my,
        vx: (Math.random() - 0.5) * 4,
        vy: -3,
        radius: 12 * settings.foodSize,
        color: ['#F59E0B', '#EC4899', '#3B82F6', '#10B981', '#A855F7'][Math.floor(Math.random() * 5)],
        type: 'star',
      });
      soundFx.playChirp('happy');
      return;
    }

    const hit = hitTest(mx, my);

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
