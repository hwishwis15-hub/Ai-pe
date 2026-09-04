// ============================================================
//  PENTA — Realistic Mouth Renderer
//  Full-fledged, non-primitive mouth with lips, teeth, tongue,
//  inner cavity shading, saliva glints and drool.
// ============================================================

import { MouthParams } from './mouthBehaviors';
import { mixRGB, parseColor, rgbString } from './eyes';

export interface MouthEnv {
  skin: string;          // body-sampled colour for seamless lip blend
  isLight: boolean;
  time: number;          // seconds
}

/**
 * Draws a single realistic mouth centred at (0,0) in the current transform.
 * `mp` is the animated parameter set from MouthBehaviorEngine.
 */
export function drawMouth(
  ctx: CanvasRenderingContext2D,
  mp: MouthParams,
  env: MouthEnv
) {
  const w = mp.width;
  const hClosed = mp.height;
  const open = Math.max(0, Math.min(1, mp.openness));
  const smile = Math.max(-1, Math.min(1, mp.smile));
  const upperRaise = mp.upperRaise;
  const lowerDroop = mp.lowerDroop;
  const tight = mp.lipTight;
  const quiver = mp.quiver;
  const drool = mp.drool;

  // --- corner positions with smile + asymmetry + quiver ---
  const cornerBaseY = -smile * w * 0.13;
  const q = (amp: number) => (quiver ? (Math.random() - 0.5) * amp * quiver : 0);

  const leftCorner = {
    x: -w / 2 + q(1.2),
    y: cornerBaseY + mp.cornerLeft + q(1.5),
  };
  const rightCorner = {
    x: w / 2 + q(1.2),
    y: cornerBaseY + mp.cornerRight + q(1.5),
  };

  // mid points
  const upperMidY = -hClosed * 0.42 - upperRaise * 8 + q(0.9);
  const lowerMidY = hClosed * 0.42 + lowerDroop * 6 + q(0.9);

  // lip thickness modulated by tightness
  const lipThick = hClosed * (0.75 - tight * 0.45);

  // inner cavity dimensions
  const innerW = w * (0.72 + open * 0.14);
  const innerH = open * (hClosed * 2.8 + 20 + lowerDroop * 6);

  const innerTopY = upperMidY + (open > 0.05 ? 2 : lipThick * 0.25);
  const innerBottomY = lowerMidY - (open > 0.05 ? 1 : lipThick * 0.25) + innerH * 0.55;

  // skin-derived lip colours
  const skinRGB = parseColor(env.skin);
  const upperLipRGB = mixRGB(skinRGB, parseColor('#d8a0a8'), 0.18 + (upperRaise * 0.15));
  const lowerLipRGB = mixRGB(skinRGB, parseColor('#e8b0b8'), 0.22);
  const upperLip = rgbString(upperLipRGB);
  const lowerLip = rgbString(lowerLipRGB);

  ctx.save();

  // ----- 1. INNER CAVITY (only when open) -----
  if (open > 0.03 && innerH > 1) {
    // cavity shape with smile-curved corners
    ctx.save();
    ctx.beginPath();
    // top edge of cavity
    ctx.moveTo(leftCorner.x + innerW * 0.08, innerTopY);
    ctx.quadraticCurveTo(0, innerTopY - (smile > 0 ? 2 : -1), rightCorner.x - innerW * 0.08, innerTopY);
    // bottom edge
    ctx.quadraticCurveTo(0, innerBottomY + (smile < 0 ? 6 : 2), leftCorner.x + innerW * 0.08, innerTopY);
    ctx.closePath();

    // volumetric dark gradient with realistic throat depth
    const cavGrad = ctx.createRadialGradient(0, (innerTopY + innerBottomY) / 2, 0, 0, (innerTopY + innerBottomY) / 2, innerW * 0.9);
    cavGrad.addColorStop(0, `rgba(8,6,14,${0.88 + mp.innerDark * 0.12})`);
    cavGrad.addColorStop(0.32, `rgba(18,14,26,${0.96})`);
    cavGrad.addColorStop(0.72, `rgba(28,18,36,${0.98})`);
    cavGrad.addColorStop(1, `rgba(42,22,52,${0.98})`);
    ctx.fillStyle = cavGrad;
    ctx.fill();

    // throat depth + uvula shadow
    const throatGrad = ctx.createLinearGradient(0, innerTopY, 0, innerBottomY);
    throatGrad.addColorStop(0, 'rgba(0,0,0,0.18)');
    throatGrad.addColorStop(0.45, 'rgba(0,0,0,0)');
    throatGrad.addColorStop(0.82, 'rgba(0,0,0,0.32)');
    throatGrad.addColorStop(1, 'rgba(0,0,0,0.52)');
    ctx.fillStyle = throatGrad;
    ctx.fill();

    // uvula hint when wide open
    if (open > 0.65) {
      ctx.fillStyle = 'rgba(180,100,110,0.35)';
      ctx.beginPath();
      ctx.ellipse(0, innerTopY + innerH * 0.32, 3.2, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // ----- tongue -----
    if (mp.tongueOut > 0.02) {
      ctx.save();
      const tongueH = mp.tongueOut * (innerH * 0.62 + 10);
      const tongueW = w * (0.28 + mp.tongueOut * 0.18);
      const wob = mp.tongueWobble * tongueW * 0.25;
      const curl = mp.tongueCurl;
      ctx.translate(wob, innerBottomY - tongueH * 0.35);

      // tongue body with curl
      ctx.beginPath();
      const topY = -tongueH * 0.5;
      const bottomY = tongueH * 0.5;
      ctx.moveTo(-tongueW * 0.42, topY);
      ctx.bezierCurveTo(
        -tongueW * 0.5, topY + tongueH * 0.2 + curl * 8,
        -tongueW * 0.35, bottomY - tongueH * 0.15 + curl * 6,
        0, bottomY + curl * 4
      );
      ctx.bezierCurveTo(
        tongueW * 0.35, bottomY - tongueH * 0.15 + curl * 6,
        tongueW * 0.5, topY + tongueH * 0.2 + curl * 8,
        tongueW * 0.42, topY
      );
      ctx.quadraticCurveTo(0, topY - 4, -tongueW * 0.42, topY);
      ctx.closePath();

      const tongueGrad = ctx.createLinearGradient(0, topY, 0, bottomY);
      tongueGrad.addColorStop(0, '#e8909a');
      tongueGrad.addColorStop(0.5, '#f4a8b2');
      tongueGrad.addColorStop(1, '#c86a78');
      ctx.fillStyle = tongueGrad;
      ctx.fill();

      // tongue midline + papillae texture
      ctx.strokeStyle = 'rgba(120,40,50,0.32)';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.moveTo(0, topY + 3);
      ctx.lineTo(0, bottomY - 3);
      ctx.stroke();
      // papillae dots
      ctx.fillStyle = 'rgba(140,60,70,0.18)';
      for (let i = 0; i < 7; i++) {
        const py = topY + (i / 7) * tongueH * 0.7 + Math.random() * 2;
        const px = (Math.random() - 0.5) * tongueW * 0.3;
        ctx.beginPath();
        ctx.arc(px, py, 0.6 + Math.random() * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // saliva glints on tongue — two layers
      ctx.fillStyle = 'rgba(255,255,255,0.58)';
      ctx.beginPath();
      ctx.ellipse(-tongueW * 0.14, topY + tongueH * 0.28, tongueW * 0.09, tongueH * 0.07, -0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.32)';
      ctx.beginPath();
      ctx.ellipse(tongueW * 0.12, topY + tongueH * 0.42, tongueW * 0.05, tongueH * 0.04, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // wet edge around tongue
      ctx.strokeStyle = 'rgba(200,120,130,0.22)';
      ctx.lineWidth = 0.7;
      ctx.stroke();

      ctx.restore();
    }

    // ----- upper teeth -----
    if (mp.teethUpper > 0.02 && open > 0.08) {
      ctx.save();
      ctx.beginPath();
      const th = mp.teethUpper * (innerH * 0.38 + 4);
      ctx.moveTo(leftCorner.x + innerW * 0.1, innerTopY);
      ctx.quadraticCurveTo(0, innerTopY - 1, rightCorner.x - innerW * 0.1, innerTopY);
      ctx.lineTo(rightCorner.x - innerW * 0.1, innerTopY + th);
      ctx.quadraticCurveTo(0, innerTopY + th + 2, leftCorner.x + innerW * 0.1, innerTopY + th);
      ctx.closePath();
      ctx.clip();

      const teethGrad = ctx.createLinearGradient(0, innerTopY, 0, innerTopY + th);
      teethGrad.addColorStop(0, '#ffffff');
      teethGrad.addColorStop(0.6, '#f8fafc');
      teethGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = teethGrad;
      ctx.fillRect(leftCorner.x, innerTopY - 2, w, th + 4);

      // individual tooth separators + subtle enamel shading
      ctx.strokeStyle = 'rgba(100,116,139,0.20)';
      ctx.lineWidth = 0.7;
      const toothCount = 6;
      for (let i = 1; i < toothCount; i++) {
        const tx = leftCorner.x + innerW * 0.1 + (innerW * 0.8 * i) / toothCount;
        ctx.beginPath();
        ctx.moveTo(tx, innerTopY + 1);
        ctx.lineTo(tx + (Math.random() - 0.5) * 1.4, innerTopY + th - 1);
        ctx.stroke();
        // tiny enamel highlight on each tooth edge
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.moveTo(tx + 1.2, innerTopY + 2);
        ctx.lineTo(tx + 1.2, innerTopY + th * 0.6);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(100,116,139,0.20)';
        ctx.lineWidth = 0.7;
      }

      // gum line with slight pink gradient
      const gumGrad = ctx.createLinearGradient(0, innerTopY - 2, 0, innerTopY + 3);
      gumGrad.addColorStop(0, 'rgba(220,140,150,0.45)');
      gumGrad.addColorStop(1, 'rgba(180,110,120,0.15)');
      ctx.fillStyle = gumGrad;
      ctx.fillRect(leftCorner.x + innerW * 0.08, innerTopY - 1, innerW * 0.84, 3.5);

      ctx.strokeStyle = 'rgba(180,120,130,0.38)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(leftCorner.x + innerW * 0.08, innerTopY + 1.2);
      ctx.quadraticCurveTo(0, innerTopY - 0.6, rightCorner.x - innerW * 0.08, innerTopY + 1.2);
      ctx.stroke();

      ctx.restore();
    }

    // ----- lower teeth -----
    if (mp.teethLower > 0.02 && open > 0.18) {
      ctx.save();
      ctx.beginPath();
      const th = mp.teethLower * (innerH * 0.28 + 3);
      ctx.moveTo(leftCorner.x + innerW * 0.14, innerBottomY - th);
      ctx.quadraticCurveTo(0, innerBottomY - th - 1, rightCorner.x - innerW * 0.14, innerBottomY - th);
      ctx.lineTo(rightCorner.x - innerW * 0.14, innerBottomY);
      ctx.quadraticCurveTo(0, innerBottomY + 1, leftCorner.x + innerW * 0.14, innerBottomY);
      ctx.closePath();
      ctx.clip();

      const teethGrad = ctx.createLinearGradient(0, innerBottomY - th, 0, innerBottomY);
      teethGrad.addColorStop(0, '#f1f5f9');
      teethGrad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = teethGrad;
      ctx.fillRect(leftCorner.x, innerBottomY - th, w, th + 2);

      ctx.strokeStyle = 'rgba(100,116,139,0.16)';
      ctx.lineWidth = 0.6;
      const toothCount = 4;
      for (let i = 1; i < toothCount; i++) {
        const tx = leftCorner.x + innerW * 0.14 + (innerW * 0.72 * i) / toothCount;
        ctx.beginPath();
        ctx.moveTo(tx, innerBottomY - th);
        ctx.lineTo(tx, innerBottomY);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // ----- 2. UPPER LIP (M-shaped with philtrum dip + realistic volume) -----
  ctx.save();
  ctx.beginPath();
  // top contour
  const upperTopY = upperMidY - lipThick * (0.55 - tight * 0.2);
  const dip = lipThick * 0.22 * (1 - tight * 0.5);
  ctx.moveTo(leftCorner.x, leftCorner.y);
  // left hump of M
  ctx.bezierCurveTo(
    leftCorner.x + w * 0.18, leftCorner.y - lipThick * 0.4,
    -w * 0.18, upperTopY - dip * 0.2,
    -w * 0.08, upperTopY + dip * 0.3
  );
  // philtrum dip
  ctx.bezierCurveTo(
    -w * 0.02, upperTopY + dip,
    w * 0.02, upperTopY + dip,
    w * 0.08, upperTopY + dip * 0.3
  );
  // right hump
  ctx.bezierCurveTo(
    w * 0.18, upperTopY - dip * 0.2,
    rightCorner.x - w * 0.18, rightCorner.y - lipThick * 0.4,
    rightCorner.x, rightCorner.y
  );
  // bottom edge back
  const upperBottomY = upperMidY + (open > 0.05 ? 1.5 : lipThick * 0.28);
  ctx.bezierCurveTo(
    rightCorner.x - w * 0.22, upperBottomY + (rightCorner.y - leftCorner.y) * 0.2,
    w * 0.08, upperBottomY,
    0, upperBottomY
  );
  ctx.bezierCurveTo(
    -w * 0.08, upperBottomY,
    leftCorner.x + w * 0.22, upperBottomY + (leftCorner.y - rightCorner.y) * 0.2,
    leftCorner.x, leftCorner.y
  );
  ctx.closePath();

  // upper lip volume gradient — slightly darker at bottom edge
  const upGrad = ctx.createLinearGradient(0, upperTopY, 0, upperBottomY);
  upGrad.addColorStop(0, rgbString(mixRGB(parseColor(upperLip), parseColor('#ffffff'), 0.12)));
  upGrad.addColorStop(0.55, upperLip);
  upGrad.addColorStop(1, rgbString(mixRGB(parseColor(upperLip), parseColor('#5a1a2a'), 0.28)));
  ctx.fillStyle = upGrad;
  ctx.fill();

  // philtrum ridge — two faint vertical highlights
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 0.6;
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.moveTo(side * w * 0.04, upperTopY - lipThick * 0.35);
    ctx.quadraticCurveTo(side * w * 0.02, upperTopY + dip * 0.4, side * w * 0.06, upperBottomY);
    ctx.stroke();
  });

  // cupid's bow highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.58)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-w * 0.18, upperTopY + dip * 0.15);
  ctx.quadraticCurveTo(0, upperTopY + dip * 0.6, w * 0.18, upperTopY + dip * 0.15);
  ctx.stroke();

  // realistic lip wrinkles — radiating from vermillion border
  ctx.strokeStyle = 'rgba(90,40,50,0.14)';
  ctx.lineWidth = 0.45;
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    const lx = (i / 4) * w * 0.28;
    const len = lipThick * (0.35 + Math.abs(i) * 0.08);
    ctx.beginPath();
    ctx.moveTo(lx, upperTopY + dip * 0.45);
    ctx.lineTo(lx + (Math.random() - 0.5) * 1.8, upperTopY + dip * 0.45 + len);
    ctx.stroke();
  }

  // upper lip shadow under nose
  ctx.fillStyle = 'rgba(15,23,42,0.12)';
  ctx.beginPath();
  ctx.ellipse(0, upperTopY - lipThick * 0.25, w * 0.22, lipThick * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // ----- 3. LOWER LIP (fuller, with realistic volume & wet highlight) -----
  ctx.save();
  ctx.beginPath();
  const lowerTopY = lowerMidY - (open > 0.05 ? 1 : lipThick * 0.22);
  const lowerBottomY = lowerMidY + lipThick * (0.9 - tight * 0.35);
  ctx.moveTo(leftCorner.x, leftCorner.y);
  ctx.bezierCurveTo(
    leftCorner.x + w * 0.22, lowerTopY,
    -w * 0.12, lowerTopY,
    0, lowerTopY
  );
  ctx.bezierCurveTo(
    w * 0.12, lowerTopY,
    rightCorner.x - w * 0.22, lowerTopY,
    rightCorner.x, rightCorner.y
  );
  ctx.bezierCurveTo(
    rightCorner.x - w * 0.18, lowerBottomY,
    w * 0.12, lowerBottomY + (smile > 0 ? -2 : 2),
    0, lowerBottomY
  );
  ctx.bezierCurveTo(
    -w * 0.12, lowerBottomY + (smile > 0 ? -2 : 2),
    leftCorner.x + w * 0.18, lowerBottomY,
    leftCorner.x, leftCorner.y
  );
  ctx.closePath();

  // lower lip volume — three-stop gradient for 3D fullness
  const lg = ctx.createLinearGradient(0, lowerTopY, 0, lowerBottomY);
  lg.addColorStop(0, rgbString(mixRGB(parseColor(lowerLip), parseColor('#ffffff'), 0.18)));
  lg.addColorStop(0.42, lowerLip);
  lg.addColorStop(1, rgbString(mixRGB(parseColor(lowerLip), parseColor('#5a1a2a'), 0.32)));
  ctx.fillStyle = lg;
  ctx.fill();

  // central tubercle bulge highlight
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.beginPath();
  ctx.ellipse(0, lowerTopY + lipThick * 0.32, w * 0.19, lipThick * 0.20, 0, 0, Math.PI * 2);
  ctx.fill();
  // secondary smaller glint
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath();
  ctx.ellipse(w * 0.08, lowerTopY + lipThick * 0.38, w * 0.07, lipThick * 0.09, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // lower lip vertical crease (mentolabial)
  ctx.strokeStyle = 'rgba(90,40,50,0.13)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, lowerTopY + lipThick * 0.15);
  ctx.lineTo(0, lowerBottomY - lipThick * 0.15);
  ctx.stroke();

  // lower lip rim shadow
  ctx.strokeStyle = 'rgba(60,20,30,0.22)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();

  // ----- 4. CORNER DIMPLES / SHADOWS when smiling -----
  if (smile > 0.25) {
    ctx.save();
    ctx.fillStyle = `rgba(120,60,70,${0.08 + smile * 0.08})`;
    [-1, 1].forEach((side) => {
      const cx = side * w * 0.52;
      const cy = cornerBaseY + (side < 0 ? mp.cornerLeft : mp.cornerRight) * 0.5 - 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 3.5, 2.2, side * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // ----- 5. DROOL / SALIVA -----
  if (drool > 0.02) {
    ctx.save();
    ctx.globalAlpha = 0.55 * drool;
    ctx.fillStyle = 'rgba(180,220,255,0.85)';
    ctx.strokeStyle = 'rgba(140,190,255,0.9)';
    ctx.lineWidth = 0.8;
    // one or two drool threads from corners or center
    const threads = drool > 0.5 ? 2 : 1;
    for (let i = 0; i < threads; i++) {
      const side = i === 0 ? -0.6 : 0.6;
      const sx = w * side * 0.5;
      const sy = lowerBottomY;
      const len = drool * (8 + Math.random() * 18);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(
        sx + (Math.random() - 0.5) * 4, sy + len * 0.3,
        sx + (Math.random() - 0.5) * 3, sy + len * 0.7,
        sx + (Math.random() - 0.5) * 2, sy + len
      );
      ctx.stroke();
      // droplet at end
      ctx.beginPath();
      ctx.arc(sx + (Math.random() - 0.5) * 2, sy + len, 1.8 + drool * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ----- 6. TEARS connection: if mouth is sobbing, draw quivering chin -----
  if (mp.quiver > 1.8 && mp.smile < -0.3) {
    ctx.save();
    ctx.strokeStyle = `rgba(100,50,60,${0.08 + Math.min(0.12, mp.quiver * 0.02)})`;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-w * 0.25, lowerBottomY + 2);
    ctx.quadraticCurveTo(0, lowerBottomY + 6 + Math.sin(env.time * 13) * 1.5, w * 0.25, lowerBottomY + 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}
