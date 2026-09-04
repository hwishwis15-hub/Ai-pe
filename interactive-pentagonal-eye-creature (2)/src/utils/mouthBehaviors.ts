// ============================================================
//  PENTA — Mouth Behavior Engine v3 — Organic
//  75+ authored organic mouth routines + procedural organic variants — мягкие, живые, без резких экстремумов
// ============================================================

import { EASE, Ease } from './eyeBehaviors';

export interface MouthParams {
  width: number;
  height: number;
  openness: number;
  smile: number;
  upperRaise: number;
  lowerDroop: number;
  cornerLeft: number;
  cornerRight: number;
  teethUpper: number;
  teethLower: number;
  tongueOut: number;
  tongueWobble: number;
  tongueCurl: number;
  lipTight: number;
  quiver: number;
  drool: number;
  innerDark: number;
}

export type MP = Partial<MouthParams>;

export interface MouthFrame {
  d: number;
  p: MP;
  e?: Ease;
}

export type MouthCat =
  | 'happy' | 'sad' | 'angry' | 'disgusted' | 'surprised'
  | 'playful' | 'idle' | 'eating' | 'social' | 'rare' | 'neutral';

export interface MouthDef {
  id: string;
  name: string;
  cat: MouthCat;
  frames: MouthFrame[];
  w?: number;
}

export function defaultMouth(): MouthParams {
  return {
    width: 36,
    height: 9,
    openness: 0,
    smile: 0,
    upperRaise: 0,
    lowerDroop: 0,
    cornerLeft: 0,
    cornerRight: 0,
    teethUpper: 0,
    teethLower: 0,
    tongueOut: 0,
    tongueWobble: 0,
    tongueCurl: 0,
    lipTight: 0,
    quiver: 0,
    drool: 0,
    innerDark: 0.92,
  };
}

const NUMERIC: (keyof MouthParams)[] = [
  'width','height','openness','smile','upperRaise','lowerDroop',
  'cornerLeft','cornerRight','teethUpper','teethLower',
  'tongueOut','tongueWobble','tongueCurl','lipTight','quiver','drool','innerDark'
];

const m = (o: MP): MP => o;

export const MOUTH_BEHAVIORS: MouthDef[] = [
  { id: 'smile_soft', name: 'Soft smile', cat: 'happy', w: 8, frames: [
    { d: 0.22, p: m({ width: 38, height: 8.0, smile: 0.386, openness: 0.037, teethUpper: 0.07 }), e: 'outBack' },
    { d: 0.9, p: m({ width: 40, smile: 0.423, openness: 0.046 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'smile_wide', name: 'Wide smile', cat: 'happy', w: 7, frames: [
    { d: 0.18, p: m({ width: 48, height: 9.0, smile: 0.662, openness: 0.166, teethUpper: 0.396, cornerLeft: -1.7, cornerRight: -1.7 }), e: 'outBack' },
    { d: 0.8, p: m({ width: 46.0, smile: 0.619 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'grin_teeth', name: 'Teeth grin', cat: 'happy', w: 6, frames: [
    { d: 0.14, p: m({ width: 47.0, height: 10.0, smile: 0.677, openness: 0.386, teethUpper: 0.665, teethLower: 0.194, innerDark: 0.88 }), e: 'outBack' },
    { d: 0.7, p: m({ width: 48.0, smile: 0.686 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outElastic' },
  ]},
  { id: 'laugh_open', name: 'Open laugh', cat: 'happy', w: 6, frames: [
    { d: 0.12, p: m({ width: 46, height: 11.0, smile: 0.696, openness: 0.594, teethUpper: 0.655, teethLower: 0.484, tongueOut: 0.18, innerDark: 0.82 }), e: 'outBack' },
    { d: 0.6, p: m({ openness: 0.616, smile: 0.706 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'laugh_burst', name: 'Burst of laughter', cat: 'happy', w: 5, frames: [
    { d: 0.08, p: m({ width: 44, height: 12.0, smile: 0.734, openness: 0.671, teethUpper: 0.705, teethLower: 0.532, tongueOut: 0.394, quiver: 0.68 }), e: 'outCubic' },
    { d: 0.12, p: m({ openness: 0.528, tongueOut: 0.246 }), e: 'inQuad' },
    { d: 0.12, p: m({ openness: 0.649, tongueOut: 0.41, quiver: 0.78 }), e: 'outBack' },
    { d: 0.5, p: m({ openness: 0.616 }), e: 'outElastic' },
  ]},
  { id: 'giggle_titter', name: 'Giggle', cat: 'happy', w: 5, frames: [
    { d: 0.1, p: m({ width: 40, smile: 0.598, openness: 0.258, teethUpper: 0.308, tongueWobble: 0.176 }), e: 'outBack' },
    { d: 0.1, p: m({ openness: 0.11 }), e: 'inQuad' },
    { d: 0.1, p: m({ openness: 0.294, smile: 0.644 }), e: 'outBack' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'chuckle_closed', name: 'Closed chuckle', cat: 'happy', w: 4, frames: [
    { d: 0.18, p: m({ width: 38, smile: 0.506, openness: 0.074, teethUpper: 0.106, quiver: 0.51 }), e: 'outQuad' },
    { d: 0.6, p: m({ quiver: 0.702 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'beam_pride', name: 'Proud beam', cat: 'happy', w: 4, frames: [
    { d: 0.24, p: m({ width: 44, smile: 0.552, openness: 0.129, teethUpper: 0.308, cornerLeft: -0.85, cornerRight: -2.55, upperRaise: 0.123 }), e: 'outBack' },
    { d: 0.8, p: m({ smile: 0.57 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ecstatic_cheer', name: 'Ecstatic cheer', cat: 'happy', w: 3, frames: [
    { d: 0.08, p: m({ width: 48, height: 14.0, smile: 0.71, openness: 0.688, teethUpper: 0.705, teethLower: 0.487, tongueOut: 0.287, innerDark: 0.79 }), e: 'outCubic' },
    { d: 0.7, p: m({ openness: 0.649, quiver: 0.51 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outElastic' },
  ]},
  { id: 'content_hum', name: 'Content hum', cat: 'happy', w: 4, frames: [
    { d: 0.4, p: m({ width: 36, smile: 0.35, openness: 0.202, innerDark: 0.9, quiver: 0.255 }), e: 'inOutQuad' },
    { d: 0.8, p: m({ openness: 0.239, smile: 0.38 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'frown_soft', name: 'Soft frown', cat: 'sad', w: 7, frames: [
    { d: 0.32, p: m({ width: 34, height: 8.0, smile: -0.38, openness: 0.074, cornerLeft: 2.55, cornerRight: 2.55 }), e: 'outQuad' },
    { d: 0.9, p: m({ smile: -0.386 }), e: 'hold' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'frown_deep', name: 'Deep frown', cat: 'sad', w: 6, frames: [
    { d: 0.35, p: m({ width: 32, height: 9.0, smile: -0.648, openness: 0.202, teethLower: 0.158, cornerLeft: 4.25, cornerRight: 4.25, quiver: 0.595 }), e: 'inOutCubic' },
    { d: 1.0, p: m({ smile: -0.667, quiver: 0.702 }), e: 'hold' },
    { d: 0.45, p: m({}), e: 'outQuad' },
  ]},
  { id: 'pout_sulky', name: 'Sulky pout', cat: 'sad', w: 5, frames: [
    { d: 0.28, p: m({ width: 28, height: 11.0, smile: -0.35, openness: 0.166, lowerDroop: 0.484, upperRaise: 0.164, lipTight: 0.205 }), e: 'outBack' },
    { d: 0.8, p: m({ lowerDroop: 0.528 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'sob_tremble', name: 'Sobbing tremble', cat: 'sad', w: 4, frames: [
    { d: 0.12, p: m({ width: 34, smile: -0.552, openness: 0.35, quiver: 1.304, lowerDroop: 0.352, drool: 0.093 }), e: 'outQuad' },
    { d: 0.1, p: m({ openness: 0.166, quiver: 1.456 }), e: 'inQuad' },
    { d: 0.12, p: m({ openness: 0.386, quiver: 1.38 }), e: 'outQuad' },
    { d: 0.7, p: m({ quiver: 1.532 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'cry_open', name: 'Open cry', cat: 'sad', w: 4, frames: [
    { d: 0.18, p: m({ width: 36, height: 12.0, smile: -0.662, openness: 0.598, teethLower: 0.308, tongueOut: 0.098, quiver: 1.228, drool: 0.155, innerDark: 0.88 }), e: 'outBack' },
    { d: 0.8, p: m({ openness: 0.546, quiver: 1.38 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'cry_tight', name: 'Tight cry', cat: 'sad', w: 3, frames: [
    { d: 0.14, p: m({ width: 30, height: 7.0, smile: -0.552, openness: 0.11, lipTight: 0.64, quiver: 1.152, cornerLeft: 3.4, cornerRight: 3.4 }), e: 'inQuad' },
    { d: 0.7, p: m({ quiver: 1.304 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'lip_quiver', name: 'Lip quiver', cat: 'sad', w: 5, frames: [
    { d: 0.3, p: m({ width: 34, smile: -0.3, quiver: 1.152, lowerDroop: 0.22 }), e: 'outQuad' },
    { d: 0.8, p: m({ quiver: 1.456 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tears_stream', name: 'Streaming tears', cat: 'sad', w: 3, frames: [
    { d: 0.35, p: m({ width: 36, smile: -0.598, openness: 0.294, quiver: 0.936, drool: 0.217, innerDark: 0.9 }), e: 'inOutCubic' },
    { d: 1.2, p: m({ openness: 0.258, drool: 0.279, quiver: 1.092 }), e: 'linear' },
    { d: 0.5, p: m({}), e: 'outQuad' },
  ]},
  { id: 'whimper', name: 'Whimper', cat: 'sad', w: 4, frames: [
    { d: 0.1, p: m({ width: 32, smile: -0.414, openness: 0.276, quiver: 1.038, upperRaise: 0.205 }), e: 'outQuad' },
    { d: 0.08, p: m({ openness: 0.11 }), e: 'inQuad' },
    { d: 0.1, p: m({ openness: 0.313 }), e: 'outQuad' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'dejected_flat', name: 'Dejected line', cat: 'sad', w: 4, frames: [
    { d: 0.4, p: m({ width: 30, height: 5.0, smile: -0.2, openness: 0.018, lipTight: 0.492, innerDark: 0.95 }), e: 'inOutQuad' },
    { d: 1.2, p: m({}), e: 'hold' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'snarl_upper', name: 'Upper snarl', cat: 'angry', w: 5, frames: [
    { d: 0.14, p: m({ width: 42, height: 10.0, smile: -0.15, openness: 0.386, upperRaise: 0.697, teethUpper: 0.655, innerDark: 0.85 }), e: 'outBack' },
    { d: 0.7, p: m({ upperRaise: 0.722, quiver: 0.51 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'grimace_tight', name: 'Tight grimace', cat: 'angry', w: 5, frames: [
    { d: 0.12, p: m({ width: 38, height: 6.0, smile: -0.25, openness: 0.074, lipTight: 0.672, upperRaise: 0.287, lowerDroop: 0.22 }), e: 'inOutQuad' },
    { d: 0.6, p: m({ lipTight: 0.705, quiver: 0.595 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'fume_zigzag', name: 'Fuming zigzag', cat: 'angry', w: 4, frames: [
    { d: 0.1, p: m({ width: 40, smile: 0.1, openness: 0.166, cornerLeft: -2.55, cornerRight: 3.4, upperRaise: 0.246, quiver: 0.936 }), e: 'outQuad' },
    { d: 0.6, p: m({ quiver: 1.076 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'bite_anger', name: 'Angry bite', cat: 'angry', w: 3, frames: [
    { d: 0.12, p: m({ width: 36, openness: 0.46, teethUpper: 0.528, teethLower: 0.44, smile: -0.1, quiver: 0.78 }), e: 'outCubic' },
    { d: 0.1, p: m({ openness: 0.11, lipTight: 0.492 }), e: 'inQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'grumble_low', name: 'Low grumble', cat: 'angry', w: 4, frames: [
    { d: 0.22, p: m({ width: 36, height: 8.0, smile: -0.35, openness: 0.184, innerDark: 0.88, quiver: 0.68, upperRaise: 0.205 }), e: 'outQuad' },
    { d: 0.7, p: m({ quiver: 0.858 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'shout_angry', name: 'Angry shout', cat: 'angry', w: 3, frames: [
    { d: 0.06, p: m({ width: 46.0, height: 12.0, smile: -0.1, openness: 0.671, teethUpper: 0.63, teethLower: 0.465, tongueOut: 0.148, innerDark: 0.775 }), e: 'outCubic' },
    { d: 0.5, p: m({ openness: 0.633, quiver: 0.936 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'sneer_side', name: 'Side sneer', cat: 'angry', w: 4, frames: [
    { d: 0.2, p: m({ width: 40, smile: -0.15, openness: 0.11, cornerLeft: -3.4, cornerRight: 1.7, upperRaise: 0.369, teethUpper: 0.264 }), e: 'outCubic' },
    { d: 0.7, p: m({}), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'clench_jaw', name: 'Clenched jaw', cat: 'angry', w: 4, frames: [
    { d: 0.18, p: m({ width: 34, height: 5.0, smile: -0.1, openness: 0.028, lipTight: 0.738, quiver: 0.936, upperRaise: 0.164 }), e: 'inOutQuad' },
    { d: 0.6, p: m({ quiver: 1.076 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'disgust_nose', name: 'Nose wrinkle', cat: 'disgusted', w: 2, frames: [
    { d: 0.16, p: m({ width: 36, height: 9.0, smile: -0.442, openness: 0.202, upperRaise: 0.59, teethUpper: 0.308, tongueOut: 0.098, innerDark: 0.88 }), e: 'outBack' },
    { d: 0.7, p: m({ upperRaise: 0.623 }), e: 'hold' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'disgust_tongue', name: 'Tongue out disgust', cat: 'disgusted', w: 2, frames: [
    { d: 0.12, p: m({ width: 38, smile: -0.4, openness: 0.35, tongueOut: 0.451, tongueWobble: 0.176, teethUpper: 0.22, upperRaise: 0.328 }), e: 'outBack' },
    { d: 0.5, p: m({ tongueOut: 0.422, tongueWobble: -0.132 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'nausea_pre', name: 'Queasy', cat: 'disgusted', w: 1, frames: [
    { d: 0.22, p: m({ width: 34, smile: -0.35, openness: 0.258, tongueOut: 0.23, quiver: 1.092, drool: 0.112, innerDark: 0.9 }), e: 'outQuad' },
    { d: 0.6, p: m({ quiver: 1.152, drool: 0.174 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'nausea_gag', name: 'Gagging', cat: 'disgusted', w: 1, frames: [
    { d: 0.14, p: m({ width: 40, height: 14.0, smile: -0.32, openness: 0.649, tongueOut: 0.548, tongueCurl: -0.357, teethUpper: 0.484, teethLower: 0.44, quiver: 1.532, drool: 0.384, innerDark: 0.8 }), e: 'outCubic' },
    { d: 0.25, p: m({ openness: 0.561, tongueOut: 0.476, quiver: 1.684, drool: 0.446 }), e: 'inQuad' },
    { d: 0.35, p: m({ openness: 0.484, tongueOut: 0.369, quiver: 1.152, drool: 0.279 }), e: 'outQuad' },
    { d: 0.4, p: m({}), e: 'outCubic' },
  ]},
  { id: 'spit_out', name: 'Spitting out', cat: 'disgusted', w: 1, frames: [
    { d: 0.08, p: m({ width: 42, openness: 0.616, tongueOut: 0.476, teethUpper: 0.44, upperRaise: 0.451, quiver: 1.152, drool: 0.31 }), e: 'outCubic' },
    { d: 0.35, p: m({ openness: 0.276, tongueOut: 0.164 }), e: 'outBack' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'bleh_face', name: 'Bleh', cat: 'disgusted', w: 1, frames: [
    { d: 0.12, p: m({ width: 46, smile: -0.3, openness: 0.484, tongueOut: 0.476, tongueCurl: 0.297, tongueWobble: 0.264, teethUpper: 0.264, upperRaise: 0.369, quiver: 0.68 }), e: 'outBack' },
    { d: 0.5, p: m({ tongueWobble: -0.22 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'o_small', name: 'Small O', cat: 'surprised', w: 5, frames: [
    { d: 0.08, p: m({ width: 22.0, height: 12.0, openness: 0.484, smile: 0.05, innerDark: 0.85 }), e: 'outCubic' },
    { d: 0.5, p: m({ openness: 0.46 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'o_big', name: 'Big O', cat: 'surprised', w: 5, frames: [
    { d: 0.06, p: m({ width: 32, height: 14.0, openness: 0.649, smile: 0.08, innerDark: 0.79, tongueOut: 0.082 }), e: 'outCubic' },
    { d: 0.6, p: m({ openness: 0.616 }), e: 'hold' },
    { d: 0.45, p: m({}), e: 'outElastic' },
  ]},
  { id: 'gasp_shock', name: 'Shocked gasp', cat: 'surprised', w: 4, frames: [
    { d: 0.05, p: m({ width: 36, height: 13.0, openness: 0.671, smile: -0.05, teethUpper: 0.264, innerDark: 0.78 }), e: 'outCubic' },
    { d: 0.4, p: m({ openness: 0.561, quiver: 0.936 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outElastic' },
  ]},
  { id: 'jaw_drop', name: 'Jaw drop', cat: 'surprised', w: 4, frames: [
    { d: 0.22, p: m({ width: 38, height: 12.0, openness: 0.594, lowerDroop: 0.572, innerDark: 0.8, teethLower: 0.264 }), e: 'outBack' },
    { d: 0.6, p: m({ openness: 0.561 }), e: 'hold' },
    { d: 0.45, p: m({}), e: 'outQuad' },
  ]},
  { id: 'o_tiny_gasp', name: 'Tiny gasp', cat: 'surprised', w: 4, frames: [
    { d: 0.08, p: m({ width: 20.0, height: 12.0, openness: 0.386, innerDark: 0.88 }), e: 'outCubic' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'double_gasp', name: 'Double gasp', cat: 'surprised', w: 3, frames: [
    { d: 0.07, p: m({ width: 28, openness: 0.616 }), e: 'outCubic' },
    { d: 0.08, p: m({ openness: 0.138 }), e: 'inQuad' },
    { d: 0.07, p: m({ openness: 0.594, width: 32 }), e: 'outCubic' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tongue_stick', name: 'Tongue stick out', cat: 'playful', w: 5, frames: [
    { d: 0.14, p: m({ width: 36, smile: 0.35, openness: 0.294, tongueOut: 0.431, teethUpper: 0.176 }), e: 'outBack' },
    { d: 0.6, p: m({ tongueOut: 0.45 }), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tongue_wiggle', name: 'Tongue wiggle', cat: 'playful', w: 4, frames: [
    { d: 0.14, p: m({ width: 38, smile: 0.4, openness: 0.35, tongueOut: 0.459, tongueWobble: 0.396, teethUpper: 0.22 }), e: 'outBack' },
    { d: 0.5, p: m({ tongueWobble: -0.396, tongueOut: 0.467 }), e: 'linear' },
    { d: 0.14, p: m({ tongueWobble: 0.352 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tongue_curl', name: 'Tongue curl', cat: 'playful', w: 3, frames: [
    { d: 0.18, p: m({ width: 36, openness: 0.386, tongueOut: 0.476, tongueCurl: 0.552, teethUpper: 0.264 }), e: 'outBack' },
    { d: 0.5, p: m({ tongueCurl: -0.34, tongueWobble: 0.176 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'kiss_mwah', name: 'Kiss mwah', cat: 'playful', w: 4, frames: [
    { d: 0.14, p: m({ width: 22.0, height: 14.0, openness: 0.294, smile: 0.2, lipTight: 0.369, innerDark: 0.88 }), e: 'outBack' },
    { d: 0.1, p: m({ width: 20.0, openness: 0.414, lipTight: 0.164 }), e: 'outCubic' },
    { d: 0.3, p: m({ width: 26, smile: 0.46 }), e: 'outBack' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'whistle', name: 'Whistle', cat: 'playful', w: 3, frames: [
    { d: 0.18, p: m({ width: 21.0, height: 12.0, openness: 0.35, smile: 0.15, lipTight: 0.287, innerDark: 0.85 }), e: 'outBack' },
    { d: 0.5, p: m({ openness: 0.386, quiver: 0.34 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'cheeky_bite', name: 'Cheeky lip bite', cat: 'playful', w: 4, frames: [
    { d: 0.18, p: m({ width: 34, smile: 0.25, openness: 0.11, lowerDroop: 0.132, teethUpper: 0.308, lipTight: 0.246, cornerLeft: -1.7, cornerRight: 0.85 }), e: 'outBack' },
    { d: 0.6, p: m({}), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'chew_rhythmic', name: 'Rhythmic chewing', cat: 'eating', w: 6, frames: [
    { d: 0.12, p: m({ width: 38, openness: 0.35, smile: 0.15, teethUpper: 0.22, innerDark: 0.88 }), e: 'outQuad' },
    { d: 0.12, p: m({ openness: 0.11, smile: 0.2 }), e: 'inQuad' },
    { d: 0.12, p: m({ openness: 0.386, smile: 0.18 }), e: 'outQuad' },
    { d: 0.12, p: m({ openness: 0.092 }), e: 'inQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'chew_side', name: 'Side chewing', cat: 'eating', w: 5, frames: [
    { d: 0.14, p: m({ width: 36, openness: 0.294, cornerLeft: -2.55, cornerRight: 0.85, teethUpper: 0.176, smile: 0.12 }), e: 'outQuad' },
    { d: 0.12, p: m({ openness: 0.092, cornerLeft: -0.85 }), e: 'inQuad' },
    { d: 0.14, p: m({ openness: 0.331, cornerLeft: -3.4, cornerRight: 1.7 }), e: 'outQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'lick_lips', name: 'Lip licking', cat: 'eating', w: 5, frames: [
    { d: 0.16, p: m({ width: 38, openness: 0.202, tongueOut: 0.369, tongueWobble: 0.308, tongueCurl: 0.17, smile: 0.25 }), e: 'outBack' },
    { d: 0.2, p: m({ tongueWobble: -0.352, tongueOut: 0.41 }), e: 'linear' },
    { d: 0.18, p: m({ tongueWobble: 0.264, tongueOut: 0.328 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'savour_mmm', name: 'Mmm savouring', cat: 'eating', w: 5, frames: [
    { d: 0.35, p: m({ width: 38, smile: 0.57, openness: 0.074, teethUpper: 0.07, innerDark: 0.92, quiver: 0.17 }), e: 'outCubic' },
    { d: 0.8, p: m({ smile: 0.626, openness: 0.055, quiver: 0.255 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'savour_big', name: 'Big savouring', cat: 'eating', w: 4, frames: [
    { d: 0.22, p: m({ width: 42, smile: 0.662, openness: 0.258, teethUpper: 0.308, tongueOut: 0.123, innerDark: 0.88 }), e: 'outBack' },
    { d: 0.5, p: m({ openness: 0.166, smile: 0.629, quiver: 0.255 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'gulp_swallow', name: 'Gulp swallow', cat: 'eating', w: 4, frames: [
    { d: 0.1, p: m({ width: 34, openness: 0.484, innerDark: 0.82, tongueOut: 0.066 }), e: 'outCubic' },
    { d: 0.14, p: m({ openness: 0.046, lipTight: 0.369, width: 32 }), e: 'inQuad' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'food_gaze', name: 'Food gaze', cat: 'eating', w: 4, frames: [
    { d: 0.18, p: m({ width: 32, openness: 0.166, smile: 0.2, tongueOut: 0.123, innerDark: 0.9 }), e: 'outQuad' },
    { d: 0.6, p: m({ openness: 0.202, tongueOut: 0.18 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'crunch_loud', name: 'Loud crunch', cat: 'eating', w: 3, frames: [
    { d: 0.08, p: m({ width: 44, openness: 0.546, teethUpper: 0.528, teethLower: 0.396, smile: 0.25, innerDark: 0.82 }), e: 'outCubic' },
    { d: 0.08, p: m({ openness: 0.074, lipTight: 0.41 }), e: 'inQuad' },
    { d: 0.1, p: m({ openness: 0.484, teethUpper: 0.484 }), e: 'outCubic' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'idle_breathe_mouth', name: 'Mouth breathing', cat: 'idle', w: 5, frames: [
    { d: 0.8, p: m({ width: 34, openness: 0.074, smile: 0.08, innerDark: 0.93 }), e: 'inOutQuad' },
    { d: 0.8, p: m({ openness: 0.129, smile: 0.1 }), e: 'inOutQuad' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'yawn_small', name: 'Small yawn', cat: 'idle', w: 4, frames: [
    { d: 0.35, p: m({ width: 30, height: 14.0, openness: 0.484, lowerDroop: 0.44, innerDark: 0.82, tongueOut: 0.098 }), e: 'inOutCubic' },
    { d: 0.3, p: m({ openness: 0.546, tongueOut: 0.148 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'yawn_big', name: 'Big yawn', cat: 'idle', w: 3, frames: [
    { d: 0.45, p: m({ width: 28, height: 13.0, openness: 0.671, lowerDroop: 0.66, tongueOut: 0.287, innerDark: 0.76, teethLower: 0.264 }), e: 'inOutCubic' },
    { d: 0.4, p: m({ openness: 0.649, tongueOut: 0.328 }), e: 'hold' },
    { d: 0.5, p: m({}), e: 'outCubic' },
  ]},
  { id: 'mumble', name: 'Mumble', cat: 'idle', w: 4, frames: [
    { d: 0.1, p: m({ width: 32, openness: 0.166, smile: 0.05, quiver: 0.34 }), e: 'outQuad' },
    { d: 0.08, p: m({ openness: 0.258, width: 34 }), e: 'inOutQuad' },
    { d: 0.09, p: m({ openness: 0.129, smile: -0.05 }), e: 'inOutQuad' },
    { d: 0.1, p: m({ openness: 0.202 }), e: 'inOutQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'drool_sleepy', name: 'Sleepy drool', cat: 'idle', w: 2, frames: [
    { d: 0.5, p: m({ width: 32, smile: -0.05, openness: 0.11, drool: 0.279, lowerDroop: 0.264, innerDark: 0.92 }), e: 'inOutQuad' },
    { d: 1.0, p: m({ drool: 0.384, openness: 0.129 }), e: 'linear' },
    { d: 0.5, p: m({}), e: 'outQuad' },
  ]},
  { id: 'social_greet_mouth', name: 'Greeting mouth', cat: 'social', w: 4, frames: [
    { d: 0.14, p: m({ width: 40, smile: 0.534, openness: 0.202, teethUpper: 0.282, innerDark: 0.9 }), e: 'outBack' },
    { d: 0.5, p: m({ smile: 0.57, openness: 0.166 }), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'social_annoyed_mouth', name: 'Annoyed mouth', cat: 'social', w: 4, frames: [
    { d: 0.18, p: m({ width: 34, smile: -0.35, openness: 0.11, lipTight: 0.451, upperRaise: 0.287, cornerLeft: 1.7, cornerRight: -0.85 }), e: 'outCubic' },
    { d: 0.7, p: m({ quiver: 0.51 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'social_excited_mouth', name: 'Excited chatter', cat: 'social', w: 4, frames: [
    { d: 0.08, p: m({ width: 38, smile: 0.414, openness: 0.322, quiver: 0.68, teethUpper: 0.22 }), e: 'outBack' },
    { d: 0.08, p: m({ openness: 0.129 }), e: 'inQuad' },
    { d: 0.08, p: m({ openness: 0.35 }), e: 'outBack' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'rare_wobble_all', name: 'Wobbling mouth', cat: 'rare', w: 2, frames: [
    { d: 0.15, p: m({ width: 44, smile: 0.46, openness: 0.414, quiver: 1.418, cornerLeft: -3.4, cornerRight: 3.4, tongueOut: 0.246 }), e: 'outBack' },
    { d: 0.6, p: m({ quiver: 1.608, cornerLeft: 3.4, cornerRight: -3.4 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outElastic' },
  ]},
  { id: 'rare_elastic', name: 'Elastic mouth', cat: 'rare', w: 1, frames: [
    { d: 0.18, p: m({ width: 17.0, height: 13.0, openness: 0.616, smile: 0.1, innerDark: 0.79 }), e: 'inOutBack' },
    { d: 0.22, p: m({ width: 49.0, height: 8.0, openness: 0.202, smile: 0.662, teethUpper: 0.44 }), e: 'inOutBack' },
    { d: 0.45, p: m({}), e: 'outElastic' },
  ]},
  { id: 'rare_bubbles', name: 'Drool bubbles', cat: 'rare', w: 1, frames: [
    { d: 0.25, p: m({ width: 36, openness: 0.294, drool: 0.446, quiver: 0.68, lowerDroop: 0.308 }), e: 'outQuad' },
    { d: 0.8, p: m({ drool: 0.546, quiver: 0.936 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'rare_infinity', name: 'Infinity yawn', cat: 'rare', w: 1, frames: [
    { d: 0.6, p: m({ width: 26, height: 14.0, openness: 0.688, lowerDroop: 0.748, tongueOut: 0.369, innerDark: 0.74 }), e: 'inOutCubic' },
    { d: 0.8, p: m({ openness: 0.649 }), e: 'hold' },
    { d: 0.7, p: m({}), e: 'outBack' },
  ]},
  { id: 'smile_dimple', name: 'Dimpled smile', cat: 'happy', w: 4, frames: [
    { d: 0.2, p: m({ width: 44, height: 8.0, smile: 0.534, openness: 0.11, teethUpper: 0.246, cornerLeft: -2.55, cornerRight: -2.55, upperRaise: 0.098 }), e: 'outBack' },
    { d: 0.7, p: m({ smile: 0.57 }), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'grin_sideways', name: 'Sideways grin', cat: 'playful', w: 4, frames: [
    { d: 0.18, p: m({ width: 42, smile: 0.414, openness: 0.184, cornerLeft: -4.25, cornerRight: 1.7, teethUpper: 0.308, tongueWobble: 0.132 }), e: 'outBack' },
    { d: 0.6, p: m({}), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'laugh_tears_joy', name: 'Joy tears laugh', cat: 'happy', w: 3, frames: [
    { d: 0.1, p: m({ width: 46, smile: 0.696, openness: 0.616, teethUpper: 0.68, teethLower: 0.442, tongueOut: 0.148, quiver: 0.936, drool: 0.112 }), e: 'outCubic' },
    { d: 0.6, p: m({ openness: 0.583, quiver: 1.152, drool: 0.174 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outElastic' },
  ]},
  { id: 'pout_tremble', name: 'Trembling pout', cat: 'sad', w: 4, frames: [
    { d: 0.22, p: m({ width: 30, smile: -0.32, openness: 0.147, lowerDroop: 0.44, quiver: 1.076, lipTight: 0.164 }), e: 'outQuad' },
    { d: 0.7, p: m({ quiver: 1.304, lowerDroop: 0.528 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'sob_hiccup', name: 'Sob hiccup', cat: 'sad', w: 3, frames: [
    { d: 0.12, p: m({ width: 34, smile: -0.506, openness: 0.414, quiver: 1.38, drool: 0.124 }), e: 'outQuad' },
    { d: 0.06, p: m({ openness: 0.11, quiver: 0.936 }), e: 'outQuad' },
    { d: 0.12, p: m({ openness: 0.46, quiver: 1.456 }), e: 'outBack' },
    { d: 0.5, p: m({}), e: 'outQuad' },
  ]},
  { id: 'snarl_disgust', name: 'Disgust snarl', cat: 'disgusted', w: 3, frames: [
    { d: 0.14, p: m({ width: 40, smile: -0.4, openness: 0.35, upperRaise: 0.672, teethUpper: 0.572, tongueOut: 0.18, quiver: 0.68 }), e: 'outBack' },
    { d: 0.6, p: m({ upperRaise: 0.705, quiver: 0.78 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'yawn_teary', name: 'Teary yawn', cat: 'idle', w: 3, frames: [
    { d: 0.4, p: m({ width: 28, height: 12.0, openness: 0.594, lowerDroop: 0.528, tongueOut: 0.18, drool: 0.093, innerDark: 0.8 }), e: 'inOutCubic' },
    { d: 0.5, p: m({ openness: 0.616, drool: 0.155, quiver: 0.34 }), e: 'hold' },
    { d: 0.45, p: m({}), e: 'outCubic' },
  ]},
  { id: 'chew_bubble', name: 'Bubble gum chewing', cat: 'eating', w: 4, frames: [
    { d: 0.16, p: m({ width: 40, openness: 0.258, smile: 0.18, cornerLeft: -1.7, cornerRight: -0.85, teethUpper: 0.132 }), e: 'outQuad' },
    { d: 0.14, p: m({ openness: 0.386, width: 42, smile: 0.22 }), e: 'outQuad' },
    { d: 0.14, p: m({ openness: 0.166, width: 38 }), e: 'inQuad' },
    { d: 0.6, p: m({}), e: 'linear' },
  ]},
  { id: 'lick_corner', name: 'Corner lick', cat: 'eating', w: 3, frames: [
    { d: 0.18, p: m({ width: 34, openness: 0.166, tongueOut: 0.426, tongueWobble: 0.546, smile: 0.15 }), e: 'outBack' },
    { d: 0.3, p: m({ tongueWobble: -0.484, tongueOut: 0.394 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'kiss_pout', name: 'Duck pout', cat: 'playful', w: 4, frames: [
    { d: 0.18, p: m({ width: 21.0, height: 14.0, openness: 0.258, smile: 0.05, lipTight: 0.451, innerDark: 0.88 }), e: 'outBack' },
    { d: 0.5, p: m({ width: 20.0, openness: 0.202 }), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'whistle_long', name: 'Long whistle', cat: 'playful', w: 3, frames: [
    { d: 0.22, p: m({ width: 20.0, height: 14.0, openness: 0.386, lipTight: 0.344, innerDark: 0.84, quiver: 0.425 }), e: 'outBack' },
    { d: 0.9, p: m({ openness: 0.414, quiver: 0.595 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'o_shocked_big', name: 'Big shocked O', cat: 'surprised', w: 4, frames: [
    { d: 0.06, p: m({ width: 34, height: 15.0, openness: 0.671, smile: -0.05, teethUpper: 0.308, innerDark: 0.77, tongueOut: 0.066 }), e: 'outCubic' },
    { d: 0.6, p: m({ openness: 0.638, quiver: 0.68 }), e: 'linear' },
    { d: 0.45, p: m({}), e: 'outElastic' },
  ]},
  { id: 'mumble_fast', name: 'Fast mumble', cat: 'idle', w: 3, frames: [
    { d: 0.07, p: m({ width: 32, openness: 0.202, quiver: 0.51 }), e: 'outQuad' },
    { d: 0.07, p: m({ openness: 0.35, width: 36 }), e: 'outQuad' },
    { d: 0.07, p: m({ openness: 0.147, width: 30 }), e: 'outQuad' },
    { d: 0.07, p: m({ openness: 0.294, width: 34 }), e: 'outQuad' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'grimace_pain', name: 'Pain grimace', cat: 'sad', w: 3, frames: [
    { d: 0.12, p: m({ width: 36, smile: -0.506, openness: 0.294, teethUpper: 0.396, teethLower: 0.22, upperRaise: 0.328, quiver: 1.076 }), e: 'outCubic' },
    { d: 0.5, p: m({ quiver: 1.228, openness: 0.258 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'smile_teeth_closed', name: 'Closed teeth smile', cat: 'happy', w: 4, frames: [
    { d: 0.18, p: m({ width: 42, smile: 0.552, openness: 0.074, teethUpper: 0.484, lipTight: 0.205 }), e: 'outBack' },
    { d: 0.6, p: m({}), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tongue_out_silly', name: 'Silly tongue out', cat: 'playful', w: 4, frames: [
    { d: 0.16, p: m({ width: 40, smile: 0.35, openness: 0.414, tongueOut: 0.521, tongueCurl: 0.17, teethUpper: 0.176 }), e: 'outBack' },
    { d: 0.5, p: m({ tongueWobble: 0.264 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'disgust_gag_hard', name: 'Hard gag', cat: 'disgusted', w: 1, frames: [
    { d: 0.12, p: m({ width: 44, height: 12.0, smile: -0.35, openness: 0.671, tongueOut: 0.567, tongueCurl: -0.425, teethUpper: 0.528, teethLower: 0.484, quiver: 1.684, drool: 0.465, innerDark: 0.79 }), e: 'outCubic' },
    { d: 0.2, p: m({ openness: 0.598, tongueOut: 0.445, quiver: 1.836, drool: 0.527 }), e: 'inQuad' },
    { d: 0.45, p: m({}), e: 'outCubic' },
  ]},
  { id: 'kiss_blow', name: 'Blown kiss', cat: 'playful', w: 3, frames: [
    { d: 0.16, p: m({ width: 21.0, height: 14.0, openness: 0.276, lipTight: 0.41 }), e: 'outBack' },
    { d: 0.08, p: m({ width: 26, openness: 0.484, lipTight: 0.123, innerDark: 0.82 }), e: 'outCubic' },
    { d: 0.35, p: m({ width: 36, smile: 0.506, openness: 0.11 }), e: 'outElastic' },
  ]},
  { id: 'smile_shy_closed', name: 'Shy closed smile', cat: 'happy', w: 4, frames: [
    { d: 0.28, p: m({ width: 34, smile: 0.38, openness: 0.037, cornerLeft: -0.85, cornerRight: -1.7, teethUpper: 0.044 }), e: 'outQuad' },
    { d: 0.7, p: m({ smile: 0.386 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'frown_pouty', name: 'Pouty frown', cat: 'sad', w: 4, frames: [
    { d: 0.24, p: m({ width: 30, smile: -0.386, openness: 0.129, lowerDroop: 0.546, upperRaise: 0.148, lipTight: 0.164 }), e: 'outBack' },
    { d: 0.7, p: m({ lowerDroop: 0.581 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'o_whisper', name: 'Whispered O', cat: 'playful', w: 3, frames: [
    { d: 0.14, p: m({ width: 22.0, height: 12.0, openness: 0.294, smile: 0.1, innerDark: 0.9 }), e: 'outQuad' },
    { d: 0.5, p: m({ openness: 0.331 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'laugh_snort', name: 'Snorting laugh', cat: 'happy', w: 3, frames: [
    { d: 0.08, p: m({ width: 44, smile: 0.648, openness: 0.598, teethUpper: 0.616, quiver: 0.936, upperRaise: 0.205 }), e: 'outCubic' },
    { d: 0.08, p: m({ openness: 0.202, quiver: 0.51 }), e: 'inQuad' },
    { d: 0.08, p: m({ openness: 0.561, quiver: 1.092 }), e: 'outCubic' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'yawn_big_tears', name: 'Yawn to tears', cat: 'idle', w: 2, frames: [
    { d: 0.5, p: m({ width: 26, height: 14.0, openness: 0.693, lowerDroop: 0.704, tongueOut: 0.328, drool: 0.136, innerDark: 0.75, quiver: 0.425 }), e: 'inOutCubic' },
    { d: 0.6, p: m({ openness: 0.66, drool: 0.198 }), e: 'hold' },
    { d: 0.6, p: m({}), e: 'outBack' },
  ]},
  { id: 'grimace_uneasy', name: 'Uneasy grimace', cat: 'sad', w: 3, frames: [
    { d: 0.2, p: m({ width: 36, smile: -0.2, openness: 0.166, cornerLeft: -2.55, cornerRight: 2.55, teethUpper: 0.176, upperRaise: 0.164, quiver: 0.51 }), e: 'outCubic' },
    { d: 0.6, p: m({ quiver: 0.68 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
];

/* ---------------- procedural generator ---------------- */

export function generateProceduralMouth(): MouthDef {
  const cat = (['happy','sad','angry','surprised','playful','idle'] as MouthCat[])[Math.floor(Math.random()*6)];
  const frames: MouthFrame[] = [];
  const n = 2 + Math.floor(Math.random()*3);
  for (let i = 0; i < n; i++) {
    frames.push({
      d: 0.12 + Math.random()*0.45,
      e: (['outBack','outCubic','inOutQuad','outElastic','outQuad'] as Ease[])[Math.floor(Math.random()*5)],
      p: {
        width: 28 + Math.random()*24,
        height: 6 + Math.random()*9,
        openness: Math.random() > 0.45 ? Math.random()*0.52 : 0,
        smile: (Math.random()-0.5)*1.18,
        upperRaise: Math.random() > 0.7 ? Math.random()*0.6 : 0,
        lowerDroop: Math.random() > 0.7 ? Math.random()*0.5 : 0,
        cornerLeft: (Math.random()-0.5)*6,
        cornerRight: (Math.random()-0.5)*6,
        teethUpper: Math.random() > 0.52 ? Math.random()*0.58 : 0,
        teethLower: Math.random() > 0.6 ? Math.random()*0.5 : 0,
        tongueOut: Math.random() > 0.68 ? Math.random()*0.48 : 0,
        tongueWobble: (Math.random()-0.5)*0.8,
        lipTight: Math.random() > 0.72 ? Math.random()*0.42 : 0,
        quiver: Math.random() > 0.78 ? Math.random()*1.15 : 0,
        drool: Math.random() > 0.88 ? Math.random()*0.32 : 0,
      }
    });
  }
  frames.push({ d: 0.3 + Math.random()*0.3, p: {}, e: 'outQuad' });
  return {
    id: `mproc_${Math.random().toString(36).slice(2,7)}`,
    name: `Mouth · ${cat}`,
    cat,
    frames,
  };
}

/* ---------------- engine ---------------- */

export class MouthBehaviorEngine {
  private current: MouthParams = defaultMouth();
  private from: MouthParams = defaultMouth();
  private target: MouthParams = defaultMouth();
  private active: MouthDef | null = null;
  private frameIdx = 0;
  private frameT = 0;
  private name = 'Neutral mouth';
  private history: string[] = [];

  getParams(): MouthParams { return this.current; }
  getName(): string { return this.name; }
  static get count() { return MOUTH_BEHAVIORS.length; }

  play(def: MouthDef) {
    this.active = def;
    this.name = def.name;
    this.frameIdx = 0;
    this.frameT = 0;
    this.from = { ...this.current };
    this.target = { ...defaultMouth(), ...def.frames[0].p } as MouthParams;
    this.history.unshift(def.id);
    if (this.history.length > 7) this.history.pop();
  }

  playById(id: string) {
    const d = MOUTH_BEHAVIORS.find((x) => x.id === id);
    if (d) this.play(d);
  }

  playCategory(cat: MouthCat) {
    const pool = MOUTH_BEHAVIORS.filter((x) => x.cat === cat);
    if (pool.length) {
      const total = pool.reduce((s,b)=>s+(b.w??3),0);
      let r = Math.random()*total;
      let chosen = pool[pool.length-1];
      for (const b of pool) { r -= b.w??3; if (r<=0){ chosen=b; break; } }
      this.play(chosen);
    }
  }

  triggerRandom() {
    if (Math.random() < 0.1) { this.play(generateProceduralMouth()); return; }
    const fresh = MOUTH_BEHAVIORS.filter((b)=>!this.history.includes(b.id));
    const pool = fresh.length > 10 ? fresh : MOUTH_BEHAVIORS;
    const total = pool.reduce((s,b)=>s+(b.w??3),0);
    let r = Math.random()*total;
    let chosen = pool[pool.length-1];
    for (const b of pool) { r -= b.w??3; if (r<=0){ chosen=b; break; } }
    this.play(chosen);
  }

  update(dt: number) {
    if (!this.active) {
      const t = defaultMouth();
      for (const k of NUMERIC) {
        const a = this.current[k] as number;
        // органичное затухание — мягкая пружина, не линейная
        const spring = 2.8 + Math.sin(Date.now()*0.001 + (k.length))*0.15;
        (this.current[k] as number) = a + ((t[k] as number)-a)*Math.min(1, dt*spring);
      }
      // органичное микродыхание в покое
      const breath = Math.sin(Date.now()*0.0011)*0.22;
      (this.current.height as number) += breath * 0.08 * dt;
      return;
    }
    const fr = this.active.frames[this.frameIdx];
    this.frameT += dt;
    const u = Math.min(1, this.frameT / Math.max(0.0001, fr.d));
    // органичный easing — чуть более мягкий чем исходный
    let eased = EASE[fr.e ?? 'inOutQuad'](u);
    // органичная микро-неровность easing
    eased += Math.sin(u*Math.PI*2)*0.018*(1-u);
    eased = Math.max(0, Math.min(1, eased));
    for (const k of NUMERIC) {
      const a = this.from[k] as number;
      const b = this.target[k] as number;
      (this.current[k] as number) = a + (b-a)*eased;
    }
    // органичный шум для живости рта
    if (this.current.quiver > 0.15) {
      const n = Math.sin(Date.now()*0.012 + this.frameIdx)*0.04;
      (this.current.cornerLeft as number) += n;
      (this.current.cornerRight as number) -= n*0.7;
    }
    if (u >= 1) {
      this.frameIdx++;
      this.frameT = 0;
      this.from = { ...this.current };
      if (this.frameIdx >= this.active.frames.length) {
        this.active = null;
        this.name = 'Neutral mouth';
        this.target = defaultMouth();
      } else {
        this.target = { ...defaultMouth(), ...this.active.frames[this.frameIdx].p } as MouthParams;
      }
    }
  }
}
