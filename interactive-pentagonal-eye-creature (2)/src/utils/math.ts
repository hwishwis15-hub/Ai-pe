export interface Point {
  x: number;
  y: number;
}

// Pentagon base shape builder
// User requirement: 1 bottom flat edge, 2 side edges, top angled head vertex (5 vertices), slightly rounded corners.
export function getBasePentagonVertices(width: number, height: number): Point[] {
  const hw = width / 2;
  const hh = height / 2;

  // 5 vertices relative to center (0,0) — WIDE stance:
  // 0: Top head vertex (center top)
  // 1: Top-right shoulder
  // 2: Bottom-right foot corner
  // 3: Bottom-left foot corner
  // 4: Top-left shoulder
  return [
    { x: 0, y: -hh * 1.06 },        // Top head angle
    { x: hw * 1.0, y: -hh * 0.26 }, // Top-right shoulder (widened)
    { x: hw * 0.95, y: hh },        // Bottom-right corner (long flat base)
    { x: -hw * 0.95, y: hh },       // Bottom-left corner
    { x: -hw * 1.0, y: -hh * 0.26 },// Top-left shoulder (widened)
  ];
}

// Draw smooth rounded polygon path onto HTML5 Canvas 2D context
export function drawRoundedPolygon(
  ctx: CanvasRenderingContext2D,
  pts: Point[],
  radius: number
) {
  if (pts.length < 3) return;

  ctx.beginPath();
  const len = pts.length;

  for (let i = 0; i < len; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % len];
    const p0 = pts[(i - 1 + len) % len];

    // Calculate vectors
    const v1 = { x: p0.x - p1.x, y: p0.y - p1.y };
    const v2 = { x: p2.x - p1.x, y: p2.y - p1.y };

    const len1 = Math.hypot(v1.x, v1.y);
    const len2 = Math.hypot(v2.x, v2.y);

    const actualRadius = Math.min(radius, len1 / 2, len2 / 2);

    const np0 = {
      x: p1.x + (v1.x / len1) * actualRadius,
      y: p1.y + (v1.y / len1) * actualRadius,
    };
    const np2 = {
      x: p1.x + (v2.x / len2) * actualRadius,
      y: p1.y + (v2.y / len2) * actualRadius,
    };

    if (i === 0) {
      ctx.moveTo(np0.x, np0.y);
    } else {
      ctx.lineTo(np0.x, np0.y);
    }

    ctx.quadraticCurveTo(p1.x, p1.y, np2.x, np2.y);
  }

  ctx.closePath();
}

// Check if a point is inside a polygon
export function isPointInPolygon(p: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;

    const intersect = ((yi > p.y) !== (yj > p.y)) &&
      (p.x < (xj - xi) * (p.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Spring physics step
export function updateSpring(
  current: number,
  target: number,
  velocity: number,
  stiffness: number = 0.15,
  damping: number = 0.75
): [number, number] {
  const force = (target - current) * stiffness;
  const newVelocity = (velocity + force) * damping;
  const newCurrent = current + newVelocity;
  return [newCurrent, newVelocity];
}

// Smooth linear interpolation
export function lerp(start: number, end: number, amt: number): number {
  return (1 - amt) * start + amt * end;
}

// Clamp helper
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}
