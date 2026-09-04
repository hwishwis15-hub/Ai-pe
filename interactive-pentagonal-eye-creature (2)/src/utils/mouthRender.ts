// ============================================================
//  PENTA — Organic Mouth Renderer v3
//  Полностью переработанный органичный рот: мягкие, живые
//  губы без жёсткой геометрии, естественная полость, язык
//  как у живого существа, зубы с микро-неровностями.
//  Все формы — через органичные безье с живым шумом.
// ============================================================

import { MouthParams } from './mouthBehaviors';
import { mixRGB, parseColor, rgbString } from './eyes';

export interface MouthEnv {
  skin: string;
  isLight: boolean;
  time: number;
}

// органичный шум — мягкий, не резкий
// стабильный псевдо-рандом без мерцания — на основе seed, не Math.random
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

  // --- органичные уголки с живым дыханием ---
  // smile тянет уголки, quiver добавляет живую дрожь, organicNoise — дыхание
  const breath = Math.sin(t * 1.1) * 0.6 + Math.sin(t * 0.6) * 0.4;
  const micro = organicNoise(t, 7, quiver * 0.8);

  const cornerBaseY = -smile * w * 0.11 + breath * 0.3;
  const leftCorner = {
    x: -w / 2 + (mp.cornerLeft * 0.6) + organicNoise(t, 11, quiver * 0.7) + micro * 0.4,
    y: cornerBaseY + mp.cornerLeft * 0.35 + organicNoise(t, 13, quiver * 0.9) + micro * 0.5,
  };
  const rightCorner = {
    x: w / 2 + (mp.cornerRight * 0.6) + organicNoise(t, 17, quiver * 0.7) - micro * 0.4,
    y: cornerBaseY + mp.cornerRight * 0.35 + organicNoise(t, 19, quiver * 0.9) - micro * 0.5,
  };

  // органичная середина губ с мягким изгибом
  const upperMidY = -hClosed * 0.38 - upperRaise * 6.5 + breath * 0.4 + organicNoise(t, 3, 0.6);
  const lowerMidY = hClosed * 0.38 + lowerDroop * 5.5 + breath * 0.5 + organicNoise(t, 5, 0.6);

  const lipThick = hClosed * (0.68 - tight * 0.32) + Math.abs(smile) * 0.5;

  // внутренняя полость — органичный овал с мягкими краями
  const innerW = w * (0.68 + open * 0.16) + organicNoise(t, 23, 0.5);
  const innerH = open * (hClosed * 2.6 + 18 + lowerDroop * 5);
  const innerTopY = upperMidY + (open > 0.04 ? 2.2 : lipThick * 0.22);
  const innerBottomY = lowerMidY - (open > 0.04 ? 1.2 : lipThick * 0.22) + innerH * 0.52;
  const innerCenterY = (innerTopY + innerBottomY) / 2;

  // цвета губ — мягкие, органичные, на основе кожи тела
  const skinRGB = parseColor(env.skin);
  // верхняя губа чуть темнее и холоднее, нижняя — чуть теплее и светлее
  const upperBase = mixRGB(skinRGB, parseColor('#c9919a'), 0.22 + upperRaise * 0.08);
  const lowerBase = mixRGB(skinRGB, parseColor('#e3a8b1'), 0.26);
  const upperLip = rgbString(mixRGB(upperBase, parseColor('#8a4a56'), tight * 0.18));
  const lowerLip = rgbString(mixRGB(lowerBase, parseColor('#7a3040'), tight * 0.12));

  ctx.save();

  // ===== 1. ВНУТРЕННЯЯ ПОЛОСТЬ — мягкая, органичная, без жёстких углов =====
  if (open > 0.025 && innerH > 0.8) {
    ctx.save();
    // органичный путь полости с мягкими изгибами улыбки
    ctx.beginPath();
    const leftX = leftCorner.x + innerW * 0.09;
    const rightX = rightCorner.x - innerW * 0.09;
    // верхняя дуга — следует за улыбкой, с лёгким органичным прогибом
    const smileOffset = smile * 1.8;
    ctx.moveTo(leftX, innerTopY);
    ctx.bezierCurveTo(
      leftX + innerW * 0.18, innerTopY - 1.2 + smileOffset * 0.3,
      -innerW * 0.12, innerTopY - 0.8 + smileOffset * 0.2,
      0, innerTopY + smileOffset * 0.15
    );
    ctx.bezierCurveTo(
      innerW * 0.12, innerTopY - 0.8 + smileOffset * 0.2,
      rightX - innerW * 0.18, innerTopY - 1.2 + smileOffset * 0.3,
      rightX, innerTopY
    );
    // нижняя дуга — более округлая, органичная
    const bottomSmile = smile < 0 ? 5 : 1.5;
    ctx.bezierCurveTo(
      rightX - innerW * 0.08, innerBottomY + bottomSmile * 0.2,
      innerW * 0.14, innerBottomY + bottomSmile,
      0, innerBottomY + bottomSmile * 0.4
    );
    ctx.bezierCurveTo(
      -innerW * 0.14, innerBottomY + bottomSmile,
      leftX + innerW * 0.08, innerBottomY + bottomSmile * 0.2,
      leftX, innerTopY
    );
    ctx.closePath();

    // органичный градиент полости — мягкий, без резких переходов, как у живого
    const cavGrad = ctx.createRadialGradient(0, innerCenterY, 0, 0, innerCenterY, innerW * 0.85);
    const dark = 0.86 + mp.innerDark * 0.14;
    cavGrad.addColorStop(0, `rgba(14,10,20,${0.92 * dark})`);
    cavGrad.addColorStop(0.28, `rgba(22,16,30,${0.98 * dark})`);
    cavGrad.addColorStop(0.62, `rgba(32,20,38,0.98)`);
    cavGrad.addColorStop(1, `rgba(48,28,52,0.98)`);
    ctx.fillStyle = cavGrad;
    ctx.fill();

    // мягкая тень глубины — органичная, не линейная
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(0, innerCenterY + innerH * 0.12, innerW * 0.38, innerH * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // язычок — органичный, с живой текстурой
    if (open > 0.12) {
      ctx.fillStyle = 'rgba(0,0,0,0.14)';
      ctx.beginPath();
      ctx.ellipse(0, innerTopY + innerH * 0.1, innerW * 0.18, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // ----- ЯЗЫК — максимально органичный -----
    if (mp.tongueOut > 0.015) {
      ctx.save();
      const tongueH = mp.tongueOut * (innerH * 0.58 + 9) + organicNoise(t, 29, 0.4);
      const tongueW = w * (0.26 + mp.tongueOut * 0.16);
      const wob = mp.tongueWobble * tongueW * 0.22 + organicNoise(t * 1.4, 31, 0.7);
      const curl = mp.tongueCurl;
      // язык чуть дрожит органично
      const tongueQuat = organicNoise(t * 2.3, 37, quiver * 0.12);
      ctx.translate(wob + tongueQuat, innerBottomY - tongueH * 0.32 + organicNoise(t, 41, 0.6));

      const topY = -tongueH * 0.5;
      const bottomY = tongueH * 0.5;

      // органичная форма языка — не симметричный овал, а живая капля с изгибом
      ctx.beginPath();
      ctx.moveTo(-tongueW * 0.38, topY + tongueH * 0.08);
      ctx.bezierCurveTo(
        -tongueW * 0.48, topY + tongueH * 0.22 + curl * 6,
        -tongueW * 0.32, bottomY - tongueH * 0.08 + curl * 4,
        0, bottomY + curl * 2.5
      );
      ctx.bezierCurveTo(
        tongueW * 0.32, bottomY - tongueH * 0.08 + curl * 4,
        tongueW * 0.48, topY + tongueH * 0.22 + curl * 6,
        tongueW * 0.38, topY + tongueH * 0.08
      );
      // верх с мягкой ямкой посередине — как у настоящего языка
      ctx.bezierCurveTo(
        tongueW * 0.18, topY - 1.5,
        -tongueW * 0.18, topY - 1.5,
        -tongueW * 0.38, topY + tongueH * 0.08
      );
      ctx.closePath();

      // градиент языка — живой, с теплыми переходами
      const tongueGrad = ctx.createLinearGradient(0, topY, 0, bottomY);
      tongueGrad.addColorStop(0, '#e78e9a');
      tongueGrad.addColorStop(0.32, '#f0a0ac');
      tongueGrad.addColorStop(0.62, '#f4acb8');
      tongueGrad.addColorStop(1, '#c66e7a');
      ctx.fillStyle = tongueGrad;
      ctx.fill();

      // центральная бороздка языка — органичная, не прямая
      ctx.strokeStyle = 'rgba(128,48,58,0.22)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(organicNoise(t, 43, 0.3), topY + 4);
      ctx.bezierCurveTo(
        organicNoise(t, 43, 0.4), topY + tongueH * 0.35,
        organicNoise(t, 43, 0.4), topY + tongueH * 0.65,
        organicNoise(t, 43, 0.3), bottomY - 4
      );
      ctx.stroke();

      // боковые бороздки — едва заметные
      ctx.strokeStyle = 'rgba(128,48,58,0.10)';
      ctx.lineWidth = 0.45;
      [-1, 1].forEach(s => {
        ctx.beginPath();
        ctx.moveTo(s * tongueW * 0.14, topY + tongueH * 0.22);
        ctx.quadraticCurveTo(s * tongueW * 0.18, topY + tongueH * 0.48, s * tongueW * 0.12, bottomY - tongueH * 0.12);
        ctx.stroke();
      });

      // сосочки — органичные, разного размера, не сетка — стабильные
      ctx.fillStyle = 'rgba(138,58,68,0.16)';
      for (let i = 0; i < 9; i++) {
        const py = topY + (0.15 + stableRand(301 + i*13) * 0.65) * tongueH;
        const px = (stableRand(311 + i*19) - 0.5) * tongueW * 0.32;
        const r = 0.5 + stableRand(321 + i*23) * 0.9;
        ctx.beginPath();
        ctx.arc(px + organicNoise(t + i, 47, 0.15), py, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // влажные блики — органичные, не симметричные
      ctx.fillStyle = 'rgba(255,255,255,0.52)';
      ctx.beginPath();
      ctx.ellipse(-tongueW * 0.12 + organicNoise(t, 53, 0.4), topY + tongueH * 0.26, tongueW * 0.08, tongueH * 0.06, -0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.26)';
      ctx.beginPath();
      ctx.ellipse(tongueW * 0.10, topY + tongueH * 0.44, tongueW * 0.045, tongueH * 0.035, 0.35, 0, Math.PI * 2);
      ctx.fill();

      // мокрый край языка
      ctx.strokeStyle = 'rgba(198,110,122,0.18)';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      ctx.restore();
    }

    // ----- ВЕРХНИЕ ЗУБЫ — органичные, чуть неровные -----
    if (mp.teethUpper > 0.018 && open > 0.06) {
      ctx.save();
      ctx.beginPath();
      const th = mp.teethUpper * (innerH * 0.36 + 3.5);
      const leftTX = leftCorner.x + innerW * 0.11;
      const rightTX = rightCorner.x - innerW * 0.11;
      ctx.moveTo(leftTX, innerTopY);
      ctx.quadraticCurveTo(0, innerTopY - 0.8, rightTX, innerTopY);
      ctx.lineTo(rightTX, innerTopY + th);
      ctx.quadraticCurveTo(0, innerTopY + th + 1.2, leftTX, innerTopY + th);
      ctx.closePath();
      ctx.clip();

      // зубы — не плоский прямоугольник, а мягкий градиент с объёмом
      const teethGrad = ctx.createLinearGradient(0, innerTopY, 0, innerTopY + th);
      teethGrad.addColorStop(0, '#fefefe');
      teethGrad.addColorStop(0.55, '#f7f8fa');
      teethGrad.addColorStop(1, '#e6e9ee');
      ctx.fillStyle = teethGrad;
      ctx.fillRect(leftTX - 2, innerTopY - 2, innerW + 4, th + 4);

      // каждый зуб чуть разной ширины и с микро-неровностью — стабильно, без мерцания
      const toothCount = stableRand(101 + w*0.1 + innerTopY) > 0.5 ? 6 : 5;
      const totalW = rightTX - leftTX;
      for (let i = 1; i < toothCount; i++) {
        const wobble = (stableRand(211 + i*17) - 0.5) * 2.2;
        const tx = leftTX + (totalW * i) / toothCount + wobble;
        // разделитель — не прямая линия, а мягкая
        ctx.strokeStyle = 'rgba(148,163,184,0.13)';
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        ctx.moveTo(tx, innerTopY + 0.8);
        ctx.bezierCurveTo(tx + wobble * 0.3, innerTopY + th * 0.4, tx - wobble * 0.2, innerTopY + th * 0.7, tx, innerTopY + th - 0.8);
        ctx.stroke();

        // микро-блик на эмали — органичный
        if (i % 2 === 0) {
          ctx.fillStyle = 'rgba(255,255,255,0.18)';
          ctx.fillRect(tx + 1, innerTopY + 1.5, 0.7, th * 0.45);
        }
      }

      // десна — мягкая, органичная, не резкая линия
      const gumGrad = ctx.createLinearGradient(0, innerTopY - 1, 0, innerTopY + 2.5);
      gumGrad.addColorStop(0, 'rgba(218,138,148,0.32)');
      gumGrad.addColorStop(1, 'rgba(218,138,148,0)');
      ctx.fillStyle = gumGrad;
      ctx.fillRect(leftTX, innerTopY - 0.5, totalW, 2.2);

      ctx.restore();
    }

    // ----- НИЖНИЕ ЗУБЫ -----
    if (mp.teethLower > 0.018 && open > 0.14) {
      ctx.save();
      ctx.beginPath();
      const th = mp.teethLower * (innerH * 0.26 + 2.5);
      const leftBX = leftCorner.x + innerW * 0.14;
      const rightBX = rightCorner.x - innerW * 0.14;
      ctx.moveTo(leftBX, innerBottomY - th);
      ctx.quadraticCurveTo(0, innerBottomY - th - 0.6, rightBX, innerBottomY - th);
      ctx.lineTo(rightBX, innerBottomY);
      ctx.quadraticCurveTo(0, innerBottomY + 0.6, leftBX, innerBottomY);
      ctx.closePath();
      ctx.clip();

      const teethGrad = ctx.createLinearGradient(0, innerBottomY - th, 0, innerBottomY);
      teethGrad.addColorStop(0, '#f1f4f7');
      teethGrad.addColorStop(1, '#d4dae3');
      ctx.fillStyle = teethGrad;
      ctx.fillRect(leftBX - 2, innerBottomY - th, innerW, th + 2);

      ctx.strokeStyle = 'rgba(148,163,184,0.11)';
      ctx.lineWidth = 0.5;
      const toothCount = 4;
      for (let i = 1; i < toothCount; i++) {
        const tx = leftBX + ((rightBX - leftBX) * i) / toothCount + (stableRand(501 + i*17) - 0.5) * 1.6;
        ctx.beginPath();
        ctx.moveTo(tx, innerBottomY - th);
        ctx.lineTo(tx, innerBottomY);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // ===== 2. ВЕРХНЯЯ ГУБА — мягкая, органичная, без жёсткой М =====
  ctx.save();
  ctx.beginPath();
  const upperTopY = upperMidY - lipThick * (0.52 - tight * 0.16);
  // органичный изгиб верхней губы: мягкая дуга с едва заметным купидоном
  const cupidDepth = lipThick * 0.14 * (1 - tight * 0.4);
  const leftHumpX = -w * 0.16 + organicNoise(t, 61, 0.3);
  const rightHumpX = w * 0.16 + organicNoise(t, 67, 0.3);

  ctx.moveTo(leftCorner.x, leftCorner.y);
  // левая часть верхней губы — мягкая
  ctx.bezierCurveTo(
    leftCorner.x + w * 0.20, leftCorner.y - lipThick * 0.22 + organicNoise(t, 71, 0.4),
    leftHumpX, upperTopY - cupidDepth * 0.15,
    -w * 0.07, upperTopY + cupidDepth * 0.25
  );
  // купидонов желобок — очень мягкий
  ctx.bezierCurveTo(
    -w * 0.03, upperTopY + cupidDepth * 0.6,
    w * 0.03, upperTopY + cupidDepth * 0.6,
    w * 0.07, upperTopY + cupidDepth * 0.25
  );
  ctx.bezierCurveTo(
    rightHumpX, upperTopY - cupidDepth * 0.15,
    rightCorner.x - w * 0.20, rightCorner.y - lipThick * 0.22,
    rightCorner.x, rightCorner.y
  );
  // нижний край верхней губы — мягкая линия смыкания
  const upperBottomY = upperMidY + (open > 0.04 ? 1.8 : lipThick * 0.24);
  ctx.bezierCurveTo(
    rightCorner.x - w * 0.20, upperBottomY + organicNoise(t, 73, 0.3),
    w * 0.06, upperBottomY,
    0, upperBottomY
  );
  ctx.bezierCurveTo(
    -w * 0.06, upperBottomY,
    leftCorner.x + w * 0.20, upperBottomY + organicNoise(t, 79, 0.3),
    leftCorner.x, leftCorner.y
  );
  ctx.closePath();

  // органичный градиент верхней губы — без резких переходов
  const upGrad = ctx.createLinearGradient(0, upperTopY, 0, upperBottomY);
  upGrad.addColorStop(0, rgbString(mixRGB(parseColor(upperLip), parseColor('#ffffff'), 0.09)));
  upGrad.addColorStop(0.52, upperLip);
  upGrad.addColorStop(1, rgbString(mixRGB(parseColor(upperLip), parseColor('#5e2a36'), 0.20)));
  ctx.fillStyle = upGrad;
  ctx.fill();

  // мягкий блик на верхней губе — органичный, не резкая линия
  ctx.fillStyle = 'rgba(255,255,255,0.13)';
  ctx.beginPath();
  ctx.ellipse(0, upperTopY + cupidDepth * 0.45, w * 0.14, lipThick * 0.10, 0, 0, Math.PI * 2);
  ctx.fill();

  // органичные морщинки — едва заметные, не сетка
  ctx.strokeStyle = 'rgba(92,48,56,0.07)';
  ctx.lineWidth = 0.38;
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue;
    const lx = (i / 3) * w * 0.19 + organicNoise(t + i * 7, 83, 0.2);
    ctx.beginPath();
    ctx.moveTo(lx, upperTopY + cupidDepth * 0.3);
    ctx.quadraticCurveTo(lx + organicNoise(t, 89, 0.3), upperTopY + cupidDepth * 0.8, lx, upperBottomY - 0.5);
    ctx.stroke();
  }

  ctx.restore();

  // ===== 3. НИЖНЯЯ ГУБА — пухлая, органичная, живая =====
  ctx.save();
  ctx.beginPath();
  const lowerTopY = lowerMidY - (open > 0.04 ? 1.1 : lipThick * 0.20);
  const lowerBottomY = lowerMidY + lipThick * (0.88 - tight * 0.28);
  // органичная форма нижней губы — мягкий овал с лёгкой асимметрией улыбки
  const smileShift = smile * w * 0.02;
  ctx.moveTo(leftCorner.x, leftCorner.y);
  ctx.bezierCurveTo(
    leftCorner.x + w * 0.20, lowerTopY + organicNoise(t, 97, 0.3),
    -w * 0.13, lowerTopY + smileShift,
    0, lowerTopY + smileShift * 0.5
  );
  ctx.bezierCurveTo(
    w * 0.13, lowerTopY + smileShift,
    rightCorner.x - w * 0.20, lowerTopY + organicNoise(t, 101, 0.3),
    rightCorner.x, rightCorner.y
  );
  ctx.bezierCurveTo(
    rightCorner.x - w * 0.16, lowerBottomY + organicNoise(t, 103, 0.4),
    w * 0.10, lowerBottomY + (smile > 0 ? -1.2 : 1.0) + organicNoise(t, 107, 0.3),
    0, lowerBottomY
  );
  ctx.bezierCurveTo(
    -w * 0.10, lowerBottomY + (smile > 0 ? -1.2 : 1.0),
    leftCorner.x + w * 0.16, lowerBottomY + organicNoise(t, 109, 0.4),
    leftCorner.x, leftCorner.y
  );
  ctx.closePath();

  const lg = ctx.createLinearGradient(0, lowerTopY, 0, lowerBottomY);
  lg.addColorStop(0, rgbString(mixRGB(parseColor(lowerLip), parseColor('#ffffff'), 0.14)));
  lg.addColorStop(0.38, lowerLip);
  lg.addColorStop(1, rgbString(mixRGB(parseColor(lowerLip), parseColor('#5e2a36'), 0.24)));
  ctx.fillStyle = lg;
  ctx.fill();

  // органичный блик — мягкое пятно, не резкая точка, чуть смещается с дыханием
  const highlightX = organicNoise(t * 0.8, 113, 1.2);
  ctx.fillStyle = 'rgba(255,255,255,0.34)';
  ctx.beginPath();
  ctx.ellipse(highlightX, lowerTopY + lipThick * 0.30, w * 0.16, lipThick * 0.17, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.beginPath();
  ctx.ellipse(highlightX + w * 0.06, lowerTopY + lipThick * 0.36, w * 0.05, lipThick * 0.07, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // мягкая тень под нижней губой — органичная
  ctx.fillStyle = 'rgba(0,0,0,0.07)';
  ctx.beginPath();
  ctx.ellipse(0, lowerBottomY + 1.2, w * 0.28, lipThick * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // ===== 4. УГОЛКИ — органичные ямочки при улыбке =====
  if (smile > 0.18) {
    ctx.save();
    ctx.fillStyle = `rgba(118,62,72,${0.05 + smile * 0.06})`;
    [-1, 1].forEach(side => {
      const cx = side * w * 0.50 + organicNoise(t, side > 0 ? 127 : 131, 0.3);
      const cy = cornerBaseY + (side < 0 ? mp.cornerLeft : mp.cornerRight) * 0.3 - 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 2.8 + smile * 0.8, 1.6 + smile * 0.4, side * 0.32, 0, Math.PI * 2);
      ctx.fill();
      // микро-морщинка у уголка
      ctx.strokeStyle = `rgba(118,62,72,${0.06 + smile * 0.04})`;
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(cx - side * 1.2, cy - 0.8);
      ctx.quadraticCurveTo(cx, cy + 0.2, cx - side * 0.8, cy + 1.2);
      ctx.stroke();
    });
    ctx.restore();
  }

  // ===== 5. СЛЮНА — органичные нити, не прямые =====
  if (drool > 0.015) {
    ctx.save();
    ctx.globalAlpha = 0.42 * Math.min(1, drool * 1.2);
    const droolLenBase = drool * (7 + organicNoise(t, 137, 2));
    const threads = drool > 0.45 ? 2 : 1;
    for (let i = 0; i < threads; i++) {
      const side = i === 0 ? -0.55 : 0.55;
      const sx = w * side * 0.48 + organicNoise(t, 139 + i * 10, 0.6);
      const sy = lowerBottomY - 0.5;
      const len = droolLenBase * (0.85 + stableRand(401 + i*31) * 0.35) + organicNoise(t * 1.5, 149 + i * 5, 1.2);
      const wob = organicNoise(t * 1.8, 151 + i * 7, 0.8);

      // нить — органичная, чуть колышется
      ctx.strokeStyle = 'rgba(175,215,255,0.88)';
      ctx.lineWidth = 0.7 + drool * 0.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(
        sx + wob * 0.6, sy + len * 0.28,
        sx - wob * 0.4, sy + len * 0.62,
        sx + wob * 0.3, sy + len
      );
      ctx.stroke();

      // капля — органичная, не идеальный круг, чуть вытянута
      ctx.fillStyle = 'rgba(175,215,255,0.92)';
      ctx.beginPath();
      ctx.ellipse(sx + wob * 0.3, sy + len, 1.6 + drool * 1.3, 2.0 + drool * 1.6, wob * 0.08, 0, Math.PI * 2);
      ctx.fill();
      // блик на капле
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(sx + wob * 0.3 - 0.6, sy + len - 0.7, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ===== 6. ПОДБОРОДОК — органичная дрожь при плаче =====
  if (mp.quiver > 1.6 && mp.smile < -0.22) {
    ctx.save();
    ctx.strokeStyle = `rgba(102,52,62,${0.06 + Math.min(0.09, mp.quiver * 0.015)})`;
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    const qA = organicNoise(t * 3.2, 167, mp.quiver * 0.25);
    ctx.moveTo(-w * 0.22, lowerBottomY + 1.8 + qA * 0.4);
    ctx.quadraticCurveTo(qA * 0.6, lowerBottomY + 5 + qA, w * 0.22, lowerBottomY + 1.8 - qA * 0.4);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}
