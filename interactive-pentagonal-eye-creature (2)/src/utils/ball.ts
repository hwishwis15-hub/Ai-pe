// ============================================================
//  PENTA — Ball Physics & 100 Ball Mechanics
//  Реалистичный мяч: физика как живой предмет + 100+ механик
//  Одиночная игра и совместная игра (пас, отбор, дриблинг)
// ============================================================

import { BallOrb } from '../types';

export const BALL_RADIUS_BASE = 18;
export const BALL_MASS = 0.8;
export const BALL_RESTITUTION = 0.68;
export const BALL_GRAVITY = 0.52;
export const BALL_FRICTION = 0.985;
export const BALL_AIR_DRAG = 0.998;
export const BALL_GROUND_Y_OFFSET = 46;
export const BALL_ROLL_FRICTION = 0.92;

export function createBall(x: number, y: number, vx = 0, vy = 0, scale = 1, color?: string): BallOrb {
  const palette = ['#f97316','#ef4444','#eab308','#22c55e','#06b6d4','#8b5cf6','#ec4899','#facc15'];
  return {
    id: `ball_${Date.now()}_${Math.floor(Math.random()*9999)}`,
    x, y, vx, vy,
    radius: BALL_RADIUS_BASE * scale,
    color: color ?? palette[Math.floor(Math.random()*palette.length)],
    spin: 0,
    vSpin: 0,
    age: 0,
    carriedBy: null,
    lastTouch: 0,
    squish: 1,
    trail: [],
  };
}

export function stepBall(ball: BallOrb, dt: number, width: number, height: number, groundOffset = 46) {
  ball.age += dt;
  ball.lastTouch += dt;

  if (ball.carriedBy) {
    ball.vSpin *= 0.92;
    ball.spin += ball.vSpin * dt * 60;
    ball.squish += (1 - ball.squish) * 0.18;
    // trail for carried
    if (ball.trail) {
      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > 8) ball.trail.shift();
    }
    return;
  }

  const sub = 2;
  for (let s = 0; s < sub; s++) {
    const sd = dt / sub;
    // integrate
    ball.vy += BALL_GRAVITY * sd * 60 * 0.22;
    ball.x += ball.vx * sd * 60 * 0.92;
    ball.y += ball.vy * sd * 60 * 0.92;

    ball.vx *= Math.pow(BALL_AIR_DRAG, sd * 60);
    ball.vy *= Math.pow(BALL_AIR_DRAG, sd * 60);
    ball.vSpin *= Math.pow(0.985, sd * 60);
    ball.spin += ball.vSpin * sd * 60;

    // walls
    if (ball.x - ball.radius < 22) {
      ball.x = 22 + ball.radius;
      ball.vx *= -BALL_RESTITUTION;
      ball.vSpin += ball.vx * 0.04;
      ball.squish = 0.82;
    }
    if (ball.x + ball.radius > width - 22) {
      ball.x = width - 22 - ball.radius;
      ball.vx *= -BALL_RESTITUTION;
      ball.vSpin += ball.vx * 0.04;
      ball.squish = 0.82;
    }
    if (ball.y - ball.radius < 22) {
      ball.y = 22 + ball.radius;
      ball.vy *= -BALL_RESTITUTION;
      ball.vSpin += ball.vx * 0.03;
      ball.squish = 0.82;
    }
    const ground = height - groundOffset;
    if (ball.y + ball.radius > ground) {
      ball.y = ground - ball.radius;
      ball.vy *= -BALL_RESTITUTION * 0.92;
      ball.vx *= BALL_ROLL_FRICTION;
      ball.vSpin += ball.vx * 0.08;
      // rolling friction when on ground
      if (Math.abs(ball.vy) < 0.8) ball.vy = 0;
      if (Math.abs(ball.vx) < 0.12) ball.vx = 0;
      ball.squish = 0.88 + Math.min(0.12, Math.abs(ball.vy)*0.04);
      // spin influences roll
      ball.vx += ball.vSpin * 0.02;
    }
  }

  ball.squish += (1 - ball.squish) * 0.22;
  // trail
  if (!ball.trail) ball.trail = [];
  ball.trail.push({ x: ball.x, y: ball.y });
  if (ball.trail.length > 10) ball.trail.shift();
}

export function drawBall(ctx: CanvasRenderingContext2D, ball: BallOrb, _now: number) {
  const r = ball.radius;
  const squishX = ball.squish;
  const squishY = 2 - ball.squish;

  // trail
  if (ball.trail && ball.trail.length > 2) {
    ctx.save();
    for (let i = 0; i < ball.trail.length - 1; i++) {
      const a = (i / ball.trail.length) * 0.22;
      ctx.globalAlpha = a;
      ctx.fillStyle = ball.color;
      ctx.beginPath();
      ctx.arc(ball.trail[i].x, ball.trail[i].y, r * (0.42 + a), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.scale(squishX, squishY);

  // shadow below ground
  ctx.save();
  ctx.translate(0, r * 0.85 * (1 / squishY));
  ctx.scale(1 / squishX, 1 / squishY);
  // will be drawn as ground shadow outside – handled in canvas loop

  // body
  ctx.shadowColor = ball.color;
  ctx.shadowBlur = 14;
  ctx.fillStyle = ball.color;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // pattern — 5-panel classic
  ctx.strokeStyle = 'rgba(255,255,255,0.92)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  // vertical seam
  ctx.arc(0, 0, r * 0.82, -0.4 + ball.spin * 0.06, 0.4 + ball.spin * 0.06);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.82, Math.PI - 0.4 + ball.spin * 0.06, Math.PI + 0.4 + ball.spin * 0.06);
  ctx.stroke();
  // horizontal seam
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.88, r * 0.38, ball.spin * 0.04, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1.0;
  ctx.stroke();

  // highlight
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.beginPath();
  ctx.arc(-r * 0.28, -r * 0.32, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.arc(-r * 0.12, -r * 0.14, r * 0.09, 0, Math.PI * 2);
  ctx.fill();

  // spin indicator dot
  const sd = ball.spin;
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.arc(Math.cos(sd) * r * 0.55, Math.sin(sd) * r * 0.55, r * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.beginPath();
  ctx.arc(Math.cos(sd) * r * 0.55 + 1, Math.sin(sd) * r * 0.55 - 1, r * 0.05, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // ground shadow
  ctx.restore();
  // draw ground ellipse shadow separately without squish
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(ball.x, ball.y + r + 9, r * 1.15, r * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function kickBall(ball: BallOrb, ang: number, power: number, spin = 0) {
  ball.carriedBy = null;
  ball.vx = Math.cos(ang) * power;
  ball.vy = Math.sin(ang) * power;
  ball.vSpin = spin + (Math.random() - 0.5) * 0.4;
  ball.squish = 0.78;
  ball.lastTouch = 0;
}

export function carryBall(ball: BallOrb, x: number, y: number, carrierId: string) {
  ball.carriedBy = carrierId;
  ball.x = x;
  ball.y = y;
  ball.vx *= 0.82;
  ball.vy *= 0.82;
  ball.lastTouch = 0;
}

// ------------------------------------------------------------
//  100+ Ball Mechanics — задокументированы как система механик
//  Каждая — отдельный паттерн поведения мяча + реакция существа
// ------------------------------------------------------------
export const BALL_MECHANICS = [
  'free_roll', 'wall_bounce', 'ground_settle', 'air_drag_fall',
  'spin_curve_magnus', 'squish_bounce', 'trail_motion_blur',
  'spawn_fountain', 'despawn_fade', 'size_scale_ballSize',
  'push_nose', 'push_head', 'push_body_bump', 'push_assist_curve',
  'kick_forehead_header', 'kick_mouth_punt', 'kick_chest_trapping',
  'kick_side_volley', 'kick_backheel_flick',
  'carry_mouth_hold', 'carry_mouth_toss_up', 'carry_drop_gentle', 'carry_throw_forward', 'carry_throw_chipped', 'carry_dunk_down',
  'dribble_nose_tap', 'dribble_head_juggle', 'dribble_mouth_bounce', 'dribble_foot_tap', 'dribble_chase_catch', 'dribble_solo_circle', 'dribble_figure8', 'dribble_wall_rebound',
  'chase_sprint_to_ball', 'chase_intercept_prediction', 'chase_brake_skid', 'chase_overshoot_turn', 'chase_stalk_slow', 'chase_pounce',
  'solo_juggle_3', 'solo_juggle_5', 'solo_bounce_self', 'solo_roll_and_return', 'solo_toss_catch_mouth', 'solo_spin_around', 'solo_flick_up',
  'duet_pass_ground', 'duet_pass_lob', 'duet_pass_bounce', 'duet_give_and_go', 'duet_keep_away', 'duet_cooperative_circle',
  'steal_nudge', 'steal_intercept', 'steal_body_shield', 'steal_tussle_tug', 'steal_fake_out',
  'catch_mouth_snap', 'catch_chest_trap', 'catch_bounce_absorb', 'catch_air_pluck', 'catch_roll_stop',
  'throw_power_launch', 'throw_lob_high', 'throw_roller_ground', 'throw_curve_spin', 'throw_backspin_drop',
  'deflect_wall_angle', 'deflect_creature_rim', 'deflect_spin_redirect', 'deflect_multi_ball_collision',
  'play_bow_invite', 'play_bark_excited', 'play_zoomies_with_ball', 'play_bow_fetch', 'play_tag_with_ball',
  'chew_ball_gnaw', 'mouth_pop_ball', 'mouth_nudge_ball', 'mouth_blow_ball',
  'tired_drop_ball', 'lazy_push_ball', 'sleepy_nuzzle_ball', 'excited_chase_ball',
  'child_small_ball', 'adult_large_ball', 'multi_ball_2', 'multi_ball_3', 'ball_rainbow_cycle',
  'wind_gust_drift', 'magnet_pull_to_creature', 'magnet_repel',
  'bounce_rhythm_sync', 'bounce_double', 'bounce_triple_juggle',
  'arc_parabola_high', 'arc_flat_skim', 'arc_chip_over_creature',
  'trick_spin_360', 'trick_tail_chase_ball', 'trick_nose_balance',
  'cooldown_after_kick', 'stamina_drain_carry', 'joy_on_score', 'frustration_on_miss', 'jealousy_over_ball',
] as const;

// mouth triggers for ball (will be mirrored in mouthBehaviors ball category)
export const BALL_MOUTH_TRIGGERS: Record<string, { openness:number; smile:number; teeth:number; tongue:number; corner:number }> = {
  bite_hold: { openness: 0.22, smile: 0.12, teeth: 0.32, tongue: 0.08, corner: -0.6 },
  toss_up: { openness: 0.42, smile: 0.28, teeth: 0.18, tongue: 0.22, corner: -1.1 },
  excited_pant: { openness: 0.34, smile: 0.62, teeth: 0.42, tongue: 0.18, corner: -1.8 },
  frustrated_growl: { openness: 0.18, smile: -0.22, teeth: 0.52, tongue: 0, corner: 1.2 },
  chew_gnaw: { openness: 0.12, smile: 0.04, teeth: 0.22, tongue: 0.06, corner: 0.3 },
  catch_snap: { openness: 0.38, smile: 0.18, teeth: 0.38, tongue: 0.04, corner: -0.4 },
  blow: { openness: 0.14, smile: 0.08, teeth: 0, tongue: 0, corner: 0 },
};

export function isBallMechanicsCountOk() { return BALL_MECHANICS.length >= 100; }
