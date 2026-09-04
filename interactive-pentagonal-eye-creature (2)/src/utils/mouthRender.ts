// ============================================================
//  PENTA — Organic Mouth Renderer v5.1 — Clean Normal
//  Чёткий одиночный рот, нормальные не раздутые губы,
//  гибкая живая ткань, без второго рта снизу, без пластика
// ============================================================

import { MouthParams } from './mouthBehaviors';
import { mixRGB, parseColor, rgbString } from './eyes';

export interface MouthEnv {
  skin: string;
  isLight: boolean;
  time: number;
}

function stableRand(seed: number) {
  const s = Math.sin(seed * 127.1 + seed * 0.3) * 43758.5453;
  return s - Math.floor(s);
}
function organicNoise(t: number, seed: number, amp = 1) {
  return Math.sin(t * 0.7 + seed) * 0.5 * amp + Math.sin(t * 1.3 + seed * 1.7) * 0.3 * amp + Math.sin(t * 2.1 + seed * 0.9) * 0.2 * amp;
}

export function drawMouth(
  ctx: CanvasRenderingContext2D,
  mp: MouthParams,
  env: MouthEnv
) {
  // нормальный размер — без раздутия 1.14/1.18
  const w = mp.width;
  const hClosed = mp.height;
  const open = Math.max(0, Math.min(1, mp.openness));
  const smile = Math.max(-1, Math.min(1, mp.smile));
  const upperRaise = mp.upperRaise;
  const lowerDroop = mp.lowerDroop;
  const tight = mp.lipTight;
  const quiver = mp.quiver;
  const drool = mp.drool;
  const t = env.time;

  const breath = Math.sin(t * 1.1) * 0.45 + Math.sin(t * 0.6) * 0.25;
  const micro = organicNoise(t, 7, quiver * 0.5);

  const cornerBaseY = -smile * w * 0.09 + breath * 0.22;
  const leftCorner = {
    x: -w / 2 + (mp.cornerLeft * 0.5) + organicNoise(t, 11, quiver * 0.45) + micro * 0.25,
    y: cornerBaseY + mp.cornerLeft * 0.28 + organicNoise(t, 13, quiver * 0.5) + micro * 0.3,
  };
  const rightCorner = {
    x: w / 2 + (mp.cornerRight * 0.5) + organicNoise(t, 17, quiver * 0.45) - micro * 0.25,
    y: cornerBaseY + mp.cornerRight * 0.28 + organicNoise(t, 19, quiver * 0.5) - micro * 0.3,
  };

  // середина губ
  const upperMidY = -hClosed * 0.30 - upperRaise * 4.2 + breath * 0.28 + organicNoise(t, 3, 0.35);
  const lowerMidY = hClosed * 0.30 + lowerDroop * 3.2 + breath * 0.30 + organicNoise(t, 5, 0.35);

  // НОРМАЛЬНЫЕ губы — не раздутые: базовый коэффициент 0.58, растяжка истончает умеренно
  const stretch = Math.abs(smile) * 0.18 + open * 0.10;
  const lipThick = Math.max(2.8, hClosed * (0.58 - tight * 0.18 - stretch * 0.18) );

  // полость — чёткая одиночная
  const innerW = w * (0.66 + open * 0.14) + organicNoise(t, 23, 0.35);
  const innerH = open * (hClosed * 2.2 + 14 + lowerDroop * 3.5);
  // ЧЁТКО: при закрытом рте губы смыкаются в одну линию без щели (без второго рта)
  const isClosed = open <= 0.035;
  const midLine = (upperMidY + lowerMidY) * 0.5;
  const innerTopY = isClosed ? midLine : upperMidY + 1.6;
  const innerBottomY = isClosed ? midLine : lowerMidY - 0.8 + innerH * 0.48;
  const innerCenterY = (innerTopY + innerBottomY) / 2;

  const skinRGB = parseColor(env.skin);
  const upperBase = mixRGB(skinRGB, parseColor('#c97c86'), 0.14);
  const lowerBase = mixRGB(skinRGB, parseColor('#d99aa0'), 0.16);
  const upperLip = rgbString(mixRGB(upperBase, parseColor('#7a3440'), tight * 0.10));
  const lowerLip = rgbString(mixRGB(lowerBase, parseColor('#6f2f3a'), tight * 0.07));

  ctx.save();

  // ===== 1. ПОЛОСТЬ — только один чёткий рот, без второго снизу =====
  if (!isClosed && innerH > 0.9) {
    ctx.save();
    ctx.beginPath();
    const leftX = leftCorner.x + innerW * 0.08;
    const rightX = rightCorner.x - innerW * 0.08;
    const smileOffset = smile * 1.2;
    ctx.moveTo(leftX, innerTopY);
    ctx.bezierCurveTo(
      leftX + innerW * 0.16, innerTopY - 0.8 + smileOffset * 0.25,
      -innerW * 0.10, innerTopY - 0.5 + smileOffset * 0.18,
      0, innerTopY + smileOffset * 0.12
    );
    ctx.bezierCurveTo(
      innerW * 0.10, innerTopY - 0.5 + smileOffset * 0.18,
      rightX - innerW * 0.16, innerTopY - 0.8 + smileOffset * 0.25,
      rightX, innerTopY
    );
    const bottomSmile = smile < 0 ? 3.5 : 1.0;
    ctx.bezierCurveTo(
      rightX - innerW * 0.07, innerBottomY + bottomSmile * 0.18,
      innerW * 0.12, innerBottomY + bottomSmile,
      0, innerBottomY + bottomSmile * 0.35
    );
    ctx.bezierCurveTo(
      -innerW * 0.12, innerBottomY + bottomSmile,
      leftX + innerW * 0.07, innerBottomY + bottomSmile * 0.18,
      leftX, innerTopY
    );
    ctx.closePath();

    const cavGrad = ctx.createRadialGradient(0, innerCenterY, 0, 0, innerCenterY, innerW * 0.82);
    const dark = 0.88 + mp.innerDark * 0.12;
    cavGrad.addColorStop(0, `rgba(16,12,22,${0.94 * dark})`);
    cavGrad.addColorStop(0.35, `rgba(24,18,32,${0.98 * dark})`);
    cavGrad.addColorStop(1, `rgba(44,26,48,0.98)`);
    ctx.fillStyle = cavGrad;
    ctx.fill();

    // тонкая тень глубины — чёткая
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ctx.beginPath();
    ctx.ellipse(0, innerCenterY + innerH * 0.10, innerW * 0.32, innerH * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ----- ЯЗЫК — чёткий, не раздутый -----
    if (mp.tongueOut > 0.02) {
      ctx.save();
      const tongueH = mp.tongueOut * (innerH * 0.55 + 8) + organicNoise(t, 29, 0.3);
      const tongueW = w * (0.24 + mp.tongueOut * 0.12);
      const wob = mp.tongueWobble * tongueW * 0.18 + organicNoise(t * 1.4, 31, 0.4);
      const curl = mp.tongueCurl;
      ctx.translate(wob, innerBottomY - tongueH * 0.30 + organicNoise(t, 41, 0.35));

      const topY = -tongueH * 0.5;
      const bottomY = tongueH * 0.5;

      ctx.beginPath();
      ctx.moveTo(-tongueW * 0.34, topY + tongueH * 0.07);
      ctx.bezierCurveTo(
        -tongueW * 0.42, topY + tongueH * 0.20 + curl * 4,
        -tongueW * 0.28, bottomY - tongueH * 0.07 + curl * 2.5,
        0, bottomY + curl * 1.5
      );
      ctx.bezierCurveTo(
        tongueW * 0.28, bottomY - tongueH * 0.07 + curl * 2.5,
        tongueW * 0.42, topY + tongueH * 0.20 + curl * 4,
        tongueW * 0.34, topY + tongueH * 0.07
      );
      ctx.bezierCurveTo(
        tongueW * 0.15, topY - 1.0,
        -tongueW * 0.15, topY - 1.0,
        -tongueW * 0.34, topY + tongueH * 0.07
      );
      ctx.closePath();

      const tongueGrad = ctx.createLinearGradient(0, topY, 0, bottomY);
      tongueGrad.addColorStop(0, '#e68a96');
      tongueGrad.addColorStop(0.5, '#f0a0ac');
      tongueGrad.addColorStop(1, '#c66e7a');
      ctx.fillStyle = tongueGrad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(128,48,58,0.18)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(0, topY + 3);
      ctx.bezierCurveTo(0, topY + tongueH * 0.35, 0, topY + tongueH * 0.65, 0, bottomY - 3);
      ctx.stroke();

      // блик языка — один чёткий
      ctx.fillStyle = 'rgba(255,255,255,0.38)';
      ctx.beginPath();
      ctx.ellipse(-tongueW * 0.09, topY + tongueH * 0.24, tongueW * 0.06, tongueH * 0.045, -0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(160,90,100,0.14)';
      ctx.lineWidth = 0.45;
      ctx.stroke();
      ctx.restore();
    }

    // ----- ВЕРХНИЕ ЗУБЫ — чёткие, ровные -----
    if (mp.teethUpper > 0.022 && open > 0.055) {
      ctx.save();
      ctx.beginPath();
      const th = mp.teethUpper * (innerH * 0.32 + 2.8);
      const leftTX = leftCorner.x + innerW * 0.10;
      const rightTX = rightCorner.x - innerW * 0.10;
      ctx.moveTo(leftTX, innerTopY);
      ctx.quadraticCurveTo(0, innerTopY - 0.5, rightTX, innerTopY);
      ctx.lineTo(rightTX, innerTopY + th);
      ctx.quadraticCurveTo(0, innerTopY + th + 0.8, leftTX, innerTopY + th);
      ctx.closePath();
      ctx.clip();

      const teethGrad = ctx.createLinearGradient(0, innerTopY, 0, innerTopY + th);
      teethGrad.addColorStop(0, '#fefefe');
      teethGrad.addColorStop(1, '#e8ecf0');
      ctx.fillStyle = teethGrad;
      ctx.fillRect(leftTX - 2, innerTopY - 1, innerW + 4, th + 3);

      const toothCount = stableRand(101 + w*0.11) > 0.5 ? 6 : 5;
      const totalW = rightTX - leftTX;
      for (let i = 1; i < toothCount; i++) {
        const wobble = (stableRand(211 + i*17) - 0.5) * 1.4;
        const tx = leftTX + (totalW * i) / toothCount + wobble;
        ctx.strokeStyle = 'rgba(148,163,184,0.11)';
        ctx.lineWidth = 0.45;
        ctx.beginPath();
        ctx.moveTo(tx, innerTopY + 0.6);
        ctx.lineTo(tx, innerTopY + th - 0.6);
        ctx.stroke();
      }
      // десна — тонкая чёткая
      ctx.fillStyle = 'rgba(218,138,148,0.22)';
      ctx.fillRect(leftTX, innerTopY - 0.3, totalW, 1.4);
      ctx.restore();
    }

    // ----- НИЖНИЕ ЗУБЫ -----
    if (mp.teethLower > 0.022 && open > 0.12) {
      ctx.save();
      ctx.beginPath();
      const th = mp.teethLower * (innerH * 0.22 + 2.0);
      const leftBX = leftCorner.x + innerW * 0.12;
      const rightBX = rightCorner.x - innerW * 0.12;
      ctx.moveTo(leftBX, innerBottomY - th);
      ctx.quadraticCurveTo(0, innerBottomY - th - 0.4, rightBX, innerBottomY - th);
      ctx.lineTo(rightBX, innerBottomY);
      ctx.quadraticCurveTo(0, innerBottomY + 0.4, leftBX, innerBottomY);
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = '#f1f4f7';
      ctx.fillRect(leftBX - 2, innerBottomY - th, innerW, th + 2);
      ctx.strokeStyle = 'rgba(148,163,184,0.09)';
      ctx.lineWidth = 0.4;
      for (let i = 1; i < 4; i++) {
        const tx = leftBX + ((rightBX - leftBX) * i) / 4 + (stableRand(501 + i*17) - 0.5) * 1.0;
        ctx.beginPath();
        ctx.moveTo(tx, innerBottomY - th);
        ctx.lineTo(tx, innerBottomY);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // ===== 2. ВЕРХНЯЯ ГУБА — нормальная, чёткая, не раздутая =====
  ctx.save();
  ctx.beginPath();
  const upperTopY = upperMidY - lipThick * 0.42;
  const cupidDepth = lipThick * 0.12;
  const leftHumpX = -w * 0.13 + organicNoise(t, 61, 0.18);
  const rightHumpX = w * 0.13 + organicNoise(t, 67, 0.18);

  ctx.moveTo(leftCorner.x, leftCorner.y);
  ctx.bezierCurveTo(
    leftCorner.x + w * 0.18, leftCorner.y - lipThick * 0.14,
    leftHumpX, upperTopY - cupidDepth * 0.12,
    -w * 0.05, upperTopY + cupidDepth * 0.18
  );
  ctx.bezierCurveTo(
    -w * 0.02, upperTopY + cupidDepth * 0.42,
    w * 0.02, upperTopY + cupidDepth * 0.42,
    w * 0.05, upperTopY + cupidDepth * 0.18
  );
  ctx.bezierCurveTo(
    rightHumpX, upperTopY - cupidDepth * 0.12,
    rightCorner.x - w * 0.18, rightCorner.y - lipThick * 0.14,
    rightCorner.x, rightCorner.y
  );
  // нижний край — ЧЁТКАЯ линия смыкания (один рот!)
  const upperBottomY = isClosed ? midLine : upperMidY + 1.2;
  ctx.bezierCurveTo(
    rightCorner.x - w * 0.16, upperBottomY,
    w * 0.05, upperBottomY,
    0, upperBottomY
  );
  ctx.bezierCurveTo(
    -w * 0.05, upperBottomY,
    leftCorner.x + w * 0.16, upperBottomY,
    leftCorner.x, leftCorner.y
  );
  ctx.closePath();

  const upGrad = ctx.createLinearGradient(0, upperTopY, 0, upperBottomY);
  upGrad.addColorStop(0, rgbString(mixRGB(parseColor(upperLip), parseColor('#ffffff'), 0.05)));
  upGrad.addColorStop(0.55, upperLip);
  upGrad.addColorStop(1, rgbString(mixRGB(parseColor(upperLip), parseColor('#4a1f28'), 0.14)));
  ctx.fillStyle = upGrad;
  ctx.fill();
  // тонкий матовый блик — чёткий
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.beginPath();
  ctx.ellipse(0, upperTopY + lipThick*0.18, w * 0.09, lipThick * 0.055, 0, 0, Math.PI * 2);
  ctx.fill();
  // вертикальные складки — едва видны, чёткие
  ctx.strokeStyle = 'rgba(92,48,56,0.045)';
  ctx.lineWidth = 0.28;
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue;
    const lx = (i / 3) * w * 0.14;
    ctx.beginPath();
    ctx.moveTo(lx, upperTopY + 0.8);
    ctx.lineTo(lx, upperBottomY - 0.4);
    ctx.stroke();
  }
  ctx.restore();

  // ===== 3. НИЖНЯЯ ГУБА — нормальная, не раздутая, чёткая =====
  ctx.save();
  ctx.beginPath();
  const lowerTopY = isClosed ? midLine : lowerMidY - 0.9;
  const lowerBottomY = lowerMidY + lipThick * 0.68;
  const smileShift = smile * w * 0.015;
  ctx.moveTo(leftCorner.x, leftCorner.y);
  ctx.bezierCurveTo(
    leftCorner.x + w * 0.16, lowerTopY,
    -w * 0.11, lowerTopY + smileShift,
    0, lowerTopY + smileShift * 0.4
  );
  ctx.bezierCurveTo(
    w * 0.11, lowerTopY + smileShift,
    rightCorner.x - w * 0.16, lowerTopY,
    rightCorner.x, rightCorner.y
  );
  ctx.bezierCurveTo(
    rightCorner.x - w * 0.13, lowerBottomY,
    w * 0.09, lowerBottomY + (smile > 0 ? -0.8 : 0.6),
    0, lowerBottomY
  );
  ctx.bezierCurveTo(
    -w * 0.09, lowerBottomY + (smile > 0 ? -0.8 : 0.6),
    leftCorner.x + w * 0.13, lowerBottomY,
    leftCorner.x, leftCorner.y
  );
  ctx.closePath();

  const lg = ctx.createLinearGradient(0, lowerTopY, 0, lowerBottomY);
  lg.addColorStop(0, rgbString(mixRGB(parseColor(lowerLip), parseColor('#ffffff'), 0.06)));
  lg.addColorStop(0.45, lowerLip);
  lg.addColorStop(1, rgbString(mixRGB(parseColor(lowerLip), parseColor('#4a1f28'), 0.16)));
  ctx.fillStyle = lg;
  ctx.fill();
  // один чёткий блик
  ctx.fillStyle = 'rgba(255,255,255,0.13)';
  ctx.beginPath();
  ctx.ellipse(0, lowerTopY + lipThick * 0.24, w * 0.11, lipThick * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();
  // убран второй-рот эффект: нет тени под губой, нет второй линии
  ctx.restore();

  // ===== 4. УГОЛКИ — только при улыбке, чёткие ямочки =====
  if (smile > 0.22 && !isClosed) {
    ctx.save();
    ctx.fillStyle = `rgba(118,62,72,${0.04 + smile * 0.04})`;
    [-1, 1].forEach(side => {
      const cx = side * w * 0.47;
      const cy = cornerBaseY - 1.2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 1.8 + smile * 0.5, 1.0 + smile * 0.25, side * 0.25, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // ===== 5. СЛЮНА — только при drool>0.11, не создаёт второй рот =====
  if (drool > 0.11) {
    ctx.save();
    ctx.globalAlpha = 0.35 * Math.min(1, drool);
    const droolLen = drool * 6;
    const sx = w * 0.42 * (drool > 0.4 ? -0.55 : 0.55);
    const sy = lowerBottomY - 0.3;
    const wob = organicNoise(t * 1.6, 151, 0.5);
    ctx.strokeStyle = 'rgba(165,205,255,0.85)';
    ctx.lineWidth = 0.6 + drool * 0.3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.bezierCurveTo(sx + wob*0.4, sy+droolLen*0.3, sx - wob*0.2, sy+droolLen*0.6, sx + wob*0.2, sy+droolLen);
    ctx.stroke();
    ctx.fillStyle = 'rgba(165,205,255,0.9)';
    ctx.beginPath();
    ctx.ellipse(sx + wob*0.2, sy+droolLen, 1.1 + drool, 1.4 + drool, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  // убран подбородочный второй рот (quiver line)

  ctx.restore();
}
