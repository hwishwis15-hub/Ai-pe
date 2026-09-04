// ============================================================
//  PENTA — Mouth Behavior Engine v5 — Flexible Full Expression
//  75+ authored organic mouth routines + procedural organic variants — гибкие живые ткани, все эмоции выражены полностью — от нежности до экстаза/ярости
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
  | 'playful' | 'idle' | 'eating' | 'social' | 'rare' | 'ball' | 'neutral';

export interface MouthDef {
  id: string;
  name: string;
  cat: MouthCat;
  frames: MouthFrame[];
  w?: number;
}

export function defaultMouth(): MouthParams {
  return {
    width: 42,
    height: 11,
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
    { d: 0.18, p: m({ width: 48, height: 9.0, smile: 0.808, openness: 0.166, teethUpper: 0.396, cornerLeft: -1.7, cornerRight: -1.7 }), e: 'outBack' },
    { d: 0.8, p: m({ width: 46.0, smile: 0.706 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'grin_teeth', name: 'Teeth grin', cat: 'happy', w: 6, frames: [
    { d: 0.14, p: m({ width: 47.0, height: 10.0, smile: 0.826, openness: 0.386, teethUpper: 0.758, teethLower: 0.194, innerDark: 0.88 }), e: 'outBack' },
    { d: 0.7, p: m({ width: 48.0, smile: 0.837 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outElastic' },
  ]},
  { id: 'laugh_open', name: 'Open laugh', cat: 'happy', w: 6, frames: [
    { d: 0.12, p: m({ width: 46, height: 11.0, smile: 0.849, openness: 0.701, teethUpper: 0.747, teethLower: 0.571, tongueOut: 0.18, innerDark: 0.82 }), e: 'outBack' },
    { d: 0.6, p: m({ openness: 0.727, smile: 0.861 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'laugh_burst', name: 'Burst of laughter', cat: 'happy', w: 5, frames: [
    { d: 0.08, p: m({ width: 44, height: 12.0, smile: 0.895, openness: 0.845, teethUpper: 0.804, teethLower: 0.628, tongueOut: 0.520, quiver: 0.68 }), e: 'outCubic' },
    { d: 0.12, p: m({ openness: 0.581, tongueOut: 0.246 }), e: 'inQuad' },
    { d: 0.12, p: m({ openness: 0.818, tongueOut: 0.541, quiver: 0.78 }), e: 'outBack' },
    { d: 0.5, p: m({ openness: 0.727 }), e: 'outElastic' },
  ]},
  { id: 'giggle_titter', name: 'Giggle', cat: 'happy', w: 5, frames: [
    { d: 0.1, p: m({ width: 40, smile: 0.682, openness: 0.258, teethUpper: 0.308, tongueWobble: 0.176 }), e: 'outBack' },
    { d: 0.1, p: m({ openness: 0.11 }), e: 'inQuad' },
    { d: 0.1, p: m({ openness: 0.294, smile: 0.786 }), e: 'outBack' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'chuckle_closed', name: 'Closed chuckle', cat: 'happy', w: 4, frames: [
    { d: 0.18, p: m({ width: 38, smile: 0.577, openness: 0.074, teethUpper: 0.106, quiver: 0.51 }), e: 'outQuad' },
    { d: 0.6, p: m({ quiver: 0.702 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'beam_pride', name: 'Proud beam', cat: 'happy', w: 4, frames: [
    { d: 0.24, p: m({ width: 44, smile: 0.629, openness: 0.129, teethUpper: 0.308, cornerLeft: -0.85, cornerRight: -3.11, upperRaise: 0.123 }), e: 'outBack' },
    { d: 0.8, p: m({ smile: 0.650 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ecstatic_cheer', name: 'Ecstatic cheer', cat: 'happy', w: 3, frames: [
    { d: 0.08, p: m({ width: 48, height: 14.0, smile: 0.866, openness: 0.867, teethUpper: 0.804, teethLower: 0.575, tongueOut: 0.339, innerDark: 0.79 }), e: 'outCubic' },
    { d: 0.7, p: m({ openness: 0.818, quiver: 0.51 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outElastic' },
  ]},
  { id: 'content_hum', name: 'Content hum', cat: 'happy', w: 4, frames: [
    { d: 0.4, p: m({ width: 36, smile: 0.35, openness: 0.202, innerDark: 0.9, quiver: 0.255 }), e: 'inOutQuad' },
    { d: 0.8, p: m({ openness: 0.239, smile: 0.38 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'frown_soft', name: 'Soft frown', cat: 'sad', w: 7, frames: [
    { d: 0.32, p: m({ width: 34, height: 8.0, smile: -0.38, openness: 0.074, cornerLeft: 3.11, cornerRight: 3.11 }), e: 'outQuad' },
    { d: 0.9, p: m({ smile: -0.386 }), e: 'hold' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'frown_deep', name: 'Deep frown', cat: 'sad', w: 6, frames: [
    { d: 0.35, p: m({ width: 32, height: 9.0, smile: -0.791, openness: 0.202, teethLower: 0.158, cornerLeft: 5.18, cornerRight: 5.18, quiver: 0.595 }), e: 'inOutCubic' },
    { d: 1.0, p: m({ smile: -0.814, quiver: 0.702 }), e: 'hold' },
    { d: 0.45, p: m({}), e: 'outQuad' },
  ]},
  { id: 'pout_sulky', name: 'Sulky pout', cat: 'sad', w: 5, frames: [
    { d: 0.28, p: m({ width: 28, height: 11.0, smile: -0.35, openness: 0.166, lowerDroop: 0.484, upperRaise: 0.164, lipTight: 0.205 }), e: 'outBack' },
    { d: 0.8, p: m({ lowerDroop: 0.528 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'sob_tremble', name: 'Sobbing tremble', cat: 'sad', w: 4, frames: [
    { d: 0.12, p: m({ width: 34, smile: -0.629, openness: 0.35, quiver: 1.760, lowerDroop: 0.352, drool: 0.093 }), e: 'outQuad' },
    { d: 0.1, p: m({ openness: 0.166, quiver: 1.966 }), e: 'inQuad' },
    { d: 0.12, p: m({ openness: 0.386, quiver: 1.863 }), e: 'outQuad' },
    { d: 0.7, p: m({ quiver: 2.068 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'cry_open', name: 'Open cry', cat: 'sad', w: 4, frames: [
    { d: 0.18, p: m({ width: 36, height: 12.0, smile: -0.808, openness: 0.706, teethLower: 0.308, tongueOut: 0.098, quiver: 1.658, drool: 0.155, innerDark: 0.88 }), e: 'outBack' },
    { d: 0.8, p: m({ openness: 0.601, quiver: 1.863 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'cry_tight', name: 'Tight cry', cat: 'sad', w: 3, frames: [
    { d: 0.14, p: m({ width: 30, height: 7.0, smile: -0.629, openness: 0.11, lipTight: 0.64, quiver: 1.405, cornerLeft: 4.15, cornerRight: 4.15 }), e: 'inQuad' },
    { d: 0.7, p: m({ quiver: 1.760 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'lip_quiver', name: 'Lip quiver', cat: 'sad', w: 5, frames: [
    { d: 0.3, p: m({ width: 34, smile: -0.3, quiver: 1.405, lowerDroop: 0.22 }), e: 'outQuad' },
    { d: 0.8, p: m({ quiver: 1.966 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tears_stream', name: 'Streaming tears', cat: 'sad', w: 3, frames: [
    { d: 0.35, p: m({ width: 36, smile: -0.682, openness: 0.294, quiver: 1.142, drool: 0.217, innerDark: 0.9 }), e: 'inOutCubic' },
    { d: 1.2, p: m({ openness: 0.258, drool: 0.357, quiver: 1.332 }), e: 'linear' },
    { d: 0.5, p: m({}), e: 'outQuad' },
  ]},
  { id: 'whimper', name: 'Whimper', cat: 'sad', w: 4, frames: [
    { d: 0.1, p: m({ width: 32, smile: -0.414, openness: 0.276, quiver: 1.266, upperRaise: 0.205 }), e: 'outQuad' },
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
    { d: 0.14, p: m({ width: 42, height: 10.0, smile: -0.15, openness: 0.386, upperRaise: 0.822, teethUpper: 0.747, innerDark: 0.85 }), e: 'outBack' },
    { d: 0.7, p: m({ upperRaise: 0.852, quiver: 0.51 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'grimace_tight', name: 'Tight grimace', cat: 'angry', w: 5, frames: [
    { d: 0.12, p: m({ width: 38, height: 6.0, smile: -0.25, openness: 0.074, lipTight: 0.672, upperRaise: 0.287, lowerDroop: 0.22 }), e: 'inOutQuad' },
    { d: 0.6, p: m({ lipTight: 0.705, quiver: 0.595 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'fume_zigzag', name: 'Fuming zigzag', cat: 'angry', w: 4, frames: [
    { d: 0.1, p: m({ width: 40, smile: 0.1, openness: 0.166, cornerLeft: -3.11, cornerRight: 4.15, upperRaise: 0.246, quiver: 1.142 }), e: 'outQuad' },
    { d: 0.6, p: m({ quiver: 1.313 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'bite_anger', name: 'Angry bite', cat: 'angry', w: 3, frames: [
    { d: 0.12, p: m({ width: 36, openness: 0.506, teethUpper: 0.602, teethLower: 0.519, smile: -0.1, quiver: 0.78 }), e: 'outCubic' },
    { d: 0.1, p: m({ openness: 0.11, lipTight: 0.492 }), e: 'inQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'grumble_low', name: 'Low grumble', cat: 'angry', w: 4, frames: [
    { d: 0.22, p: m({ width: 36, height: 8.0, smile: -0.35, openness: 0.184, innerDark: 0.88, quiver: 0.68, upperRaise: 0.205 }), e: 'outQuad' },
    { d: 0.7, p: m({ quiver: 1.047 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'shout_angry', name: 'Angry shout', cat: 'angry', w: 3, frames: [
    { d: 0.06, p: m({ width: 46.0, height: 12.0, smile: -0.1, openness: 0.845, teethUpper: 0.718, teethLower: 0.549, tongueOut: 0.148, innerDark: 0.775 }), e: 'outCubic' },
    { d: 0.5, p: m({ openness: 0.798, quiver: 1.142 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'sneer_side', name: 'Side sneer', cat: 'angry', w: 4, frames: [
    { d: 0.2, p: m({ width: 40, smile: -0.15, openness: 0.11, cornerLeft: -4.15, cornerRight: 1.7, upperRaise: 0.369, teethUpper: 0.264 }), e: 'outCubic' },
    { d: 0.7, p: m({}), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'clench_jaw', name: 'Clenched jaw', cat: 'angry', w: 4, frames: [
    { d: 0.18, p: m({ width: 34, height: 5.0, smile: -0.1, openness: 0.028, lipTight: 0.738, quiver: 1.142, upperRaise: 0.164 }), e: 'inOutQuad' },
    { d: 0.6, p: m({ quiver: 1.313 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'disgust_nose', name: 'Nose wrinkle', cat: 'disgusted', w: 2, frames: [
    { d: 0.16, p: m({ width: 36, height: 9.0, smile: -0.442, openness: 0.202, upperRaise: 0.696, teethUpper: 0.308, tongueOut: 0.098, innerDark: 0.88 }), e: 'outBack' },
    { d: 0.7, p: m({ upperRaise: 0.735 }), e: 'hold' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'disgust_tongue', name: 'Tongue out disgust', cat: 'disgusted', w: 2, frames: [
    { d: 0.12, p: m({ width: 38, smile: -0.4, openness: 0.35, tongueOut: 0.595, tongueWobble: 0.176, teethUpper: 0.22, upperRaise: 0.328 }), e: 'outBack' },
    { d: 0.5, p: m({ tongueOut: 0.557, tongueWobble: -0.132 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'nausea_pre', name: 'Queasy', cat: 'disgusted', w: 1, frames: [
    { d: 0.22, p: m({ width: 34, smile: -0.35, openness: 0.258, tongueOut: 0.23, quiver: 1.332, drool: 0.112, innerDark: 0.9 }), e: 'outQuad' },
    { d: 0.6, p: m({ quiver: 1.405, drool: 0.174 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'nausea_gag', name: 'Gagging', cat: 'disgusted', w: 1, frames: [
    { d: 0.14, p: m({ width: 40, height: 14.0, smile: -0.32, openness: 0.818, tongueOut: 0.723, tongueCurl: -0.357, teethUpper: 0.484, teethLower: 0.519, quiver: 2.068, drool: 0.492, innerDark: 0.8 }), e: 'outCubic' },
    { d: 0.25, p: m({ openness: 0.662, tongueOut: 0.628, quiver: 2.273, drool: 0.571 }), e: 'inQuad' },
    { d: 0.35, p: m({ openness: 0.532, tongueOut: 0.435, quiver: 1.405, drool: 0.357 }), e: 'outQuad' },
    { d: 0.4, p: m({}), e: 'outCubic' },
  ]},
  { id: 'spit_out', name: 'Spitting out', cat: 'disgusted', w: 1, frames: [
    { d: 0.08, p: m({ width: 42, openness: 0.727, tongueOut: 0.628, teethUpper: 0.44, upperRaise: 0.451, quiver: 1.405, drool: 0.397 }), e: 'outCubic' },
    { d: 0.35, p: m({ openness: 0.276, tongueOut: 0.164 }), e: 'outBack' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'bleh_face', name: 'Bleh', cat: 'disgusted', w: 1, frames: [
    { d: 0.12, p: m({ width: 46, smile: -0.3, openness: 0.532, tongueOut: 0.628, tongueCurl: 0.297, tongueWobble: 0.264, teethUpper: 0.264, upperRaise: 0.369, quiver: 0.68 }), e: 'outBack' },
    { d: 0.5, p: m({ tongueWobble: -0.22 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'o_small', name: 'Small O', cat: 'surprised', w: 5, frames: [
    { d: 0.08, p: m({ width: 22.0, height: 12.0, openness: 0.532, smile: 0.05, innerDark: 0.85 }), e: 'outCubic' },
    { d: 0.5, p: m({ openness: 0.506 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'o_big', name: 'Big O', cat: 'surprised', w: 5, frames: [
    { d: 0.06, p: m({ width: 32, height: 14.0, openness: 0.818, smile: 0.08, innerDark: 0.79, tongueOut: 0.082 }), e: 'outCubic' },
    { d: 0.6, p: m({ openness: 0.727 }), e: 'hold' },
    { d: 0.45, p: m({}), e: 'outElastic' },
  ]},
  { id: 'gasp_shock', name: 'Shocked gasp', cat: 'surprised', w: 4, frames: [
    { d: 0.05, p: m({ width: 36, height: 13.0, openness: 0.845, smile: -0.05, teethUpper: 0.264, innerDark: 0.78 }), e: 'outCubic' },
    { d: 0.4, p: m({ openness: 0.662, quiver: 1.142 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outElastic' },
  ]},
  { id: 'jaw_drop', name: 'Jaw drop', cat: 'surprised', w: 4, frames: [
    { d: 0.22, p: m({ width: 38, height: 12.0, openness: 0.701, lowerDroop: 0.572, innerDark: 0.8, teethLower: 0.264 }), e: 'outBack' },
    { d: 0.6, p: m({ openness: 0.662 }), e: 'hold' },
    { d: 0.45, p: m({}), e: 'outQuad' },
  ]},
  { id: 'o_tiny_gasp', name: 'Tiny gasp', cat: 'surprised', w: 4, frames: [
    { d: 0.08, p: m({ width: 20.0, height: 12.0, openness: 0.386, innerDark: 0.88 }), e: 'outCubic' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'double_gasp', name: 'Double gasp', cat: 'surprised', w: 3, frames: [
    { d: 0.07, p: m({ width: 28, openness: 0.727 }), e: 'outCubic' },
    { d: 0.08, p: m({ openness: 0.138 }), e: 'inQuad' },
    { d: 0.07, p: m({ openness: 0.701, width: 32 }), e: 'outCubic' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tongue_stick', name: 'Tongue stick out', cat: 'playful', w: 5, frames: [
    { d: 0.14, p: m({ width: 36, smile: 0.35, openness: 0.294, tongueOut: 0.569, teethUpper: 0.176 }), e: 'outBack' },
    { d: 0.6, p: m({ tongueOut: 0.594 }), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tongue_wiggle', name: 'Tongue wiggle', cat: 'playful', w: 4, frames: [
    { d: 0.14, p: m({ width: 38, smile: 0.4, openness: 0.35, tongueOut: 0.606, tongueWobble: 0.396, teethUpper: 0.22 }), e: 'outBack' },
    { d: 0.5, p: m({ tongueWobble: -0.396, tongueOut: 0.616 }), e: 'linear' },
    { d: 0.14, p: m({ tongueWobble: 0.352 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tongue_curl', name: 'Tongue curl', cat: 'playful', w: 3, frames: [
    { d: 0.18, p: m({ width: 36, openness: 0.386, tongueOut: 0.628, tongueCurl: 0.552, teethUpper: 0.264 }), e: 'outBack' },
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
    { d: 0.14, p: m({ width: 36, openness: 0.294, cornerLeft: -3.11, cornerRight: 0.85, teethUpper: 0.176, smile: 0.12 }), e: 'outQuad' },
    { d: 0.12, p: m({ openness: 0.092, cornerLeft: -0.85 }), e: 'inQuad' },
    { d: 0.14, p: m({ openness: 0.331, cornerLeft: -4.15, cornerRight: 1.7 }), e: 'outQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'lick_lips', name: 'Lip licking', cat: 'eating', w: 5, frames: [
    { d: 0.16, p: m({ width: 38, openness: 0.202, tongueOut: 0.435, tongueWobble: 0.308, tongueCurl: 0.17, smile: 0.25 }), e: 'outBack' },
    { d: 0.2, p: m({ tongueWobble: -0.352, tongueOut: 0.541 }), e: 'linear' },
    { d: 0.18, p: m({ tongueWobble: 0.264, tongueOut: 0.387 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'savour_mmm', name: 'Mmm savouring', cat: 'eating', w: 5, frames: [
    { d: 0.35, p: m({ width: 38, smile: 0.650, openness: 0.074, teethUpper: 0.07, innerDark: 0.92, quiver: 0.17 }), e: 'outCubic' },
    { d: 0.8, p: m({ smile: 0.764, openness: 0.055, quiver: 0.255 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'savour_big', name: 'Big savouring', cat: 'eating', w: 4, frames: [
    { d: 0.22, p: m({ width: 42, smile: 0.808, openness: 0.258, teethUpper: 0.308, tongueOut: 0.123, innerDark: 0.88 }), e: 'outBack' },
    { d: 0.5, p: m({ openness: 0.166, smile: 0.767, quiver: 0.255 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'gulp_swallow', name: 'Gulp swallow', cat: 'eating', w: 4, frames: [
    { d: 0.1, p: m({ width: 34, openness: 0.532, innerDark: 0.82, tongueOut: 0.066 }), e: 'outCubic' },
    { d: 0.14, p: m({ openness: 0.046, lipTight: 0.369, width: 32 }), e: 'inQuad' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'food_gaze', name: 'Food gaze', cat: 'eating', w: 4, frames: [
    { d: 0.18, p: m({ width: 32, openness: 0.166, smile: 0.2, tongueOut: 0.123, innerDark: 0.9 }), e: 'outQuad' },
    { d: 0.6, p: m({ openness: 0.202, tongueOut: 0.18 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'crunch_loud', name: 'Loud crunch', cat: 'eating', w: 3, frames: [
    { d: 0.08, p: m({ width: 44, openness: 0.601, teethUpper: 0.602, teethLower: 0.467, smile: 0.25, innerDark: 0.82 }), e: 'outCubic' },
    { d: 0.08, p: m({ openness: 0.074, lipTight: 0.41 }), e: 'inQuad' },
    { d: 0.1, p: m({ openness: 0.532, teethUpper: 0.484 }), e: 'outCubic' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'idle_breathe_mouth', name: 'Mouth breathing', cat: 'idle', w: 5, frames: [
    { d: 0.8, p: m({ width: 34, openness: 0.074, smile: 0.08, innerDark: 0.93 }), e: 'inOutQuad' },
    { d: 0.8, p: m({ openness: 0.129, smile: 0.1 }), e: 'inOutQuad' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'yawn_small', name: 'Small yawn', cat: 'idle', w: 4, frames: [
    { d: 0.35, p: m({ width: 30, height: 14.0, openness: 0.532, lowerDroop: 0.44, innerDark: 0.82, tongueOut: 0.098 }), e: 'inOutCubic' },
    { d: 0.3, p: m({ openness: 0.601, tongueOut: 0.148 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'yawn_big', name: 'Big yawn', cat: 'idle', w: 3, frames: [
    { d: 0.45, p: m({ width: 28, height: 13.0, openness: 0.845, lowerDroop: 0.66, tongueOut: 0.339, innerDark: 0.76, teethLower: 0.264 }), e: 'inOutCubic' },
    { d: 0.4, p: m({ openness: 0.818, tongueOut: 0.387 }), e: 'hold' },
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
    { d: 0.5, p: m({ width: 32, smile: -0.05, openness: 0.11, drool: 0.357, lowerDroop: 0.264, innerDark: 0.92 }), e: 'inOutQuad' },
    { d: 1.0, p: m({ drool: 0.492, openness: 0.129 }), e: 'linear' },
    { d: 0.5, p: m({}), e: 'outQuad' },
  ]},
  { id: 'social_greet_mouth', name: 'Greeting mouth', cat: 'social', w: 4, frames: [
    { d: 0.14, p: m({ width: 40, smile: 0.609, openness: 0.202, teethUpper: 0.282, innerDark: 0.9 }), e: 'outBack' },
    { d: 0.5, p: m({ smile: 0.650, openness: 0.166 }), e: 'hold' },
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
    { d: 0.15, p: m({ width: 44, smile: 0.46, openness: 0.414, quiver: 1.914, cornerLeft: -4.15, cornerRight: 4.15, tongueOut: 0.246 }), e: 'outBack' },
    { d: 0.6, p: m({ quiver: 2.171, cornerLeft: 4.15, cornerRight: -4.15 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outElastic' },
  ]},
  { id: 'rare_elastic', name: 'Elastic mouth', cat: 'rare', w: 1, frames: [
    { d: 0.18, p: m({ width: 17.0, height: 13.0, openness: 0.727, smile: 0.1, innerDark: 0.79 }), e: 'inOutBack' },
    { d: 0.22, p: m({ width: 49.0, height: 8.0, openness: 0.202, smile: 0.808, teethUpper: 0.44 }), e: 'inOutBack' },
    { d: 0.45, p: m({}), e: 'outElastic' },
  ]},
  { id: 'rare_bubbles', name: 'Drool bubbles', cat: 'rare', w: 1, frames: [
    { d: 0.25, p: m({ width: 36, openness: 0.294, drool: 0.571, quiver: 0.68, lowerDroop: 0.308 }), e: 'outQuad' },
    { d: 0.8, p: m({ drool: 0.699, quiver: 1.142 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'rare_infinity', name: 'Infinity yawn', cat: 'rare', w: 1, frames: [
    { d: 0.6, p: m({ width: 26, height: 14.0, openness: 0.867, lowerDroop: 0.748, tongueOut: 0.435, innerDark: 0.74 }), e: 'inOutCubic' },
    { d: 0.8, p: m({ openness: 0.818 }), e: 'hold' },
    { d: 0.7, p: m({}), e: 'outBack' },
  ]},
  { id: 'smile_dimple', name: 'Dimpled smile', cat: 'happy', w: 4, frames: [
    { d: 0.2, p: m({ width: 44, height: 8.0, smile: 0.609, openness: 0.11, teethUpper: 0.246, cornerLeft: -3.11, cornerRight: -3.11, upperRaise: 0.098 }), e: 'outBack' },
    { d: 0.7, p: m({ smile: 0.650 }), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'grin_sideways', name: 'Sideways grin', cat: 'playful', w: 4, frames: [
    { d: 0.18, p: m({ width: 42, smile: 0.414, openness: 0.184, cornerLeft: -5.18, cornerRight: 1.7, teethUpper: 0.308, tongueWobble: 0.132 }), e: 'outBack' },
    { d: 0.6, p: m({}), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'laugh_tears_joy', name: 'Joy tears laugh', cat: 'happy', w: 3, frames: [
    { d: 0.1, p: m({ width: 46, smile: 0.849, openness: 0.727, teethUpper: 0.775, teethLower: 0.522, tongueOut: 0.148, quiver: 1.142, drool: 0.112 }), e: 'outCubic' },
    { d: 0.6, p: m({ openness: 0.688, quiver: 1.405, drool: 0.174 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outElastic' },
  ]},
  { id: 'pout_tremble', name: 'Trembling pout', cat: 'sad', w: 4, frames: [
    { d: 0.22, p: m({ width: 30, smile: -0.32, openness: 0.147, lowerDroop: 0.44, quiver: 1.313, lipTight: 0.164 }), e: 'outQuad' },
    { d: 0.7, p: m({ quiver: 1.760, lowerDroop: 0.528 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'sob_hiccup', name: 'Sob hiccup', cat: 'sad', w: 3, frames: [
    { d: 0.12, p: m({ width: 34, smile: -0.577, openness: 0.414, quiver: 1.863, drool: 0.124 }), e: 'outQuad' },
    { d: 0.06, p: m({ openness: 0.11, quiver: 1.142 }), e: 'outQuad' },
    { d: 0.12, p: m({ openness: 0.506, quiver: 1.966 }), e: 'outBack' },
    { d: 0.5, p: m({}), e: 'outQuad' },
  ]},
  { id: 'snarl_disgust', name: 'Disgust snarl', cat: 'disgusted', w: 3, frames: [
    { d: 0.14, p: m({ width: 40, smile: -0.4, openness: 0.35, upperRaise: 0.793, teethUpper: 0.652, tongueOut: 0.18, quiver: 0.68 }), e: 'outBack' },
    { d: 0.6, p: m({ upperRaise: 0.832, quiver: 0.78 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'yawn_teary', name: 'Teary yawn', cat: 'idle', w: 3, frames: [
    { d: 0.4, p: m({ width: 28, height: 12.0, openness: 0.701, lowerDroop: 0.528, tongueOut: 0.18, drool: 0.093, innerDark: 0.8 }), e: 'inOutCubic' },
    { d: 0.5, p: m({ openness: 0.727, drool: 0.155, quiver: 0.34 }), e: 'hold' },
    { d: 0.45, p: m({}), e: 'outCubic' },
  ]},
  { id: 'chew_bubble', name: 'Bubble gum chewing', cat: 'eating', w: 4, frames: [
    { d: 0.16, p: m({ width: 40, openness: 0.258, smile: 0.18, cornerLeft: -1.7, cornerRight: -0.85, teethUpper: 0.132 }), e: 'outQuad' },
    { d: 0.14, p: m({ openness: 0.386, width: 42, smile: 0.22 }), e: 'outQuad' },
    { d: 0.14, p: m({ openness: 0.166, width: 38 }), e: 'inQuad' },
    { d: 0.6, p: m({}), e: 'linear' },
  ]},
  { id: 'lick_corner', name: 'Corner lick', cat: 'eating', w: 3, frames: [
    { d: 0.18, p: m({ width: 34, openness: 0.166, tongueOut: 0.562, tongueWobble: 0.546, smile: 0.15 }), e: 'outBack' },
    { d: 0.3, p: m({ tongueWobble: -0.484, tongueOut: 0.520 }), e: 'linear' },
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
    { d: 0.06, p: m({ width: 34, height: 15.0, openness: 0.845, smile: -0.05, teethUpper: 0.308, innerDark: 0.77, tongueOut: 0.066 }), e: 'outCubic' },
    { d: 0.6, p: m({ openness: 0.804, quiver: 0.68 }), e: 'linear' },
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
    { d: 0.12, p: m({ width: 36, smile: -0.577, openness: 0.294, teethUpper: 0.396, teethLower: 0.22, upperRaise: 0.328, quiver: 1.313 }), e: 'outCubic' },
    { d: 0.5, p: m({ quiver: 1.658, openness: 0.258 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'smile_teeth_closed', name: 'Closed teeth smile', cat: 'happy', w: 4, frames: [
    { d: 0.18, p: m({ width: 42, smile: 0.629, openness: 0.074, teethUpper: 0.484, lipTight: 0.205 }), e: 'outBack' },
    { d: 0.6, p: m({}), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tongue_out_silly', name: 'Silly tongue out', cat: 'playful', w: 4, frames: [
    { d: 0.16, p: m({ width: 40, smile: 0.35, openness: 0.414, tongueOut: 0.688, tongueCurl: 0.17, teethUpper: 0.176 }), e: 'outBack' },
    { d: 0.5, p: m({ tongueWobble: 0.264 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'disgust_gag_hard', name: 'Hard gag', cat: 'disgusted', w: 1, frames: [
    { d: 0.12, p: m({ width: 44, height: 12.0, smile: -0.35, openness: 0.845, tongueOut: 0.748, tongueCurl: -0.425, teethUpper: 0.602, teethLower: 0.571, quiver: 2.273, drool: 0.595, innerDark: 0.79 }), e: 'outCubic' },
    { d: 0.2, p: m({ openness: 0.706, tongueOut: 0.587, quiver: 2.479, drool: 0.675 }), e: 'inQuad' },
    { d: 0.45, p: m({}), e: 'outCubic' },
  ]},
  { id: 'kiss_blow', name: 'Blown kiss', cat: 'playful', w: 3, frames: [
    { d: 0.16, p: m({ width: 21.0, height: 14.0, openness: 0.276, lipTight: 0.41 }), e: 'outBack' },
    { d: 0.08, p: m({ width: 26, openness: 0.532, lipTight: 0.123, innerDark: 0.82 }), e: 'outCubic' },
    { d: 0.35, p: m({ width: 36, smile: 0.577, openness: 0.11 }), e: 'outElastic' },
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
    { d: 0.08, p: m({ width: 44, smile: 0.791, openness: 0.706, teethUpper: 0.702, quiver: 1.142, upperRaise: 0.205 }), e: 'outCubic' },
    { d: 0.08, p: m({ openness: 0.202, quiver: 0.51 }), e: 'inQuad' },
    { d: 0.08, p: m({ openness: 0.662, quiver: 1.332 }), e: 'outCubic' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'yawn_big_tears', name: 'Yawn to tears', cat: 'idle', w: 2, frames: [
    { d: 0.5, p: m({ width: 26, height: 14.0, openness: 0.873, lowerDroop: 0.704, tongueOut: 0.387, drool: 0.136, innerDark: 0.75, quiver: 0.425 }), e: 'inOutCubic' },
    { d: 0.6, p: m({ openness: 0.832, drool: 0.198 }), e: 'hold' },
    { d: 0.6, p: m({}), e: 'outBack' },
  ]},
  { id: 'grimace_uneasy', name: 'Uneasy grimace', cat: 'sad', w: 3, frames: [
    { d: 0.2, p: m({ width: 36, smile: -0.2, openness: 0.166, cornerLeft: -3.11, cornerRight: 3.11, teethUpper: 0.176, upperRaise: 0.164, quiver: 0.51 }), e: 'outCubic' },
    { d: 0.6, p: m({ quiver: 0.68 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},

  // ===================== ULTRA ORGANIC NEW COMPLEX BEHAVIORS — 58 lifelike extended mimics =====================
  { id: 'smile_dawn_melting', name: 'Melting dawn smile', cat: 'happy', w: 5, frames: [
    { d: 0.32, p: m({ width: 38, height: 9.2, smile: 0.22, openness: 0.03, upperRaise: 0.08, cornerLeft: -0.6, cornerRight: -0.9, innerDark: 0.93 }), e: 'inOutQuad' },
    { d: 0.45, p: m({ width: 44, smile: 0.593, openness: 0.09, teethUpper: 0.18, cornerLeft: -1.8, cornerRight: -2.2, upperRaise: 0.14 }), e: 'outCubic' },
    { d: 0.7, p: m({ width: 46, smile: 0.661, openness: 0.11, teethUpper: 0.22, innerDark: 0.91 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'smile_bashful_shy', name: 'Bashful shy smile', cat: 'happy', w: 5, frames: [
    { d: 0.18, p: m({ width: 33, height: 7.8, smile: 0.32, openness: 0.02, cornerLeft: -0.4, cornerRight: -3.42, lipTight: 0.18, lowerDroop: 0.1 }), e: 'outBack' },
    { d: 0.55, p: m({ width: 36, smile: 0.42, openness: 0.05, teethUpper: 0.08, cornerRight: -3.90, upperRaise: 0.06 }), e: 'inOutQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'grin_crooked_charm', name: 'Crooked charming grin', cat: 'happy', w: 4, frames: [
    { d: 0.2, p: m({ width: 45, height: 9.8, smile: 0.756, openness: 0.24, teethUpper: 0.42, cornerLeft: -0.8, cornerRight: -4.64, upperRaise: 0.22, tongueWobble: 0.08 }), e: 'outBack' },
    { d: 0.65, p: m({ smile: 0.805, openness: 0.22, teethUpper: 0.44 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'laugh_silent_shake', name: 'Silent shoulder laugh', cat: 'happy', w: 4, frames: [
    { d: 0.1, p: m({ width: 42, height: 9.5, smile: 0.940, openness: 0.528, teethUpper: 0.707, teethLower: 0.28, quiver: 1.342, upperRaise: 0.18 }), e: 'outQuad' },
    { d: 0.08, p: m({ openness: 0.28, quiver: 0.7 }), e: 'inQuad' },
    { d: 0.08, p: m({ openness: 0.572, quiver: 1.755, smile: 0.940 }), e: 'outQuad' },
    { d: 0.08, p: m({ openness: 0.32, quiver: 1.098 }), e: 'inQuad' },
    { d: 0.45, p: m({}), e: 'outQuad' },
  ]},
  { id: 'chuckle_nose_wrinkle', name: 'Chuckle with nose wrinkle', cat: 'happy', w: 4, frames: [
    { d: 0.14, p: m({ width: 43, smile: 0.830, openness: 0.32, teethUpper: 0.48, upperRaise: 0.614, quiver: 0.6, cornerLeft: -1.2, cornerRight: -1.8 }), e: 'outBack' },
    { d: 0.12, p: m({ openness: 0.18, upperRaise: 0.42 }), e: 'inQuad' },
    { d: 0.14, p: m({ openness: 0.36, quiver: 1.037, upperRaise: 0.684 }), e: 'outBack' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'beam_adore_hold', name: 'Adoring beam hold', cat: 'happy', w: 3, frames: [
    { d: 0.28, p: m({ width: 46, height: 9.0, smile: 0.661, openness: 0.14, teethUpper: 0.32, cornerLeft: -1.4, cornerRight: -1.6, innerDark: 0.9, upperRaise: 0.1 }), e: 'outCubic' },
    { d: 1.1, p: m({ smile: 0.756, openness: 0.16, upperRaise: 0.12 }), e: 'hold' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'laugh_crescendo_build', name: 'Crescendo laugh build', cat: 'happy', w: 3, frames: [
    { d: 0.18, p: m({ width: 40, smile: 0.547, openness: 0.18, teethUpper: 0.22, quiver: 0.35 }), e: 'outQuad' },
    { d: 0.16, p: m({ width: 44, smile: 0.830, openness: 0.42, teethUpper: 0.593, quiver: 0.75 }), e: 'outBack' },
    { d: 0.14, p: m({ width: 48, smile: 0.940, openness: 0.781, teethUpper: 0.775, teethLower: 0.496, tongueOut: 0.18, quiver: 1.342, upperRaise: 0.22 }), e: 'outCubic' },
    { d: 0.5, p: m({ openness: 0.661, quiver: 1.037 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'smile_nostalgic_soft', name: 'Nostalgic soft smile', cat: 'happy', w: 4, frames: [
    { d: 0.42, p: m({ width: 37, height: 8.2, smile: 0.38, openness: 0.04, cornerLeft: -1.1, cornerRight: -1.4, lowerDroop: 0.12, innerDark: 0.94 }), e: 'inOutQuad' },
    { d: 0.9, p: m({ smile: 0.44, openness: 0.06, lowerDroop: 0.16 }), e: 'linear' },
    { d: 0.45, p: m({}), e: 'outQuad' },
  ]},
  { id: 'sorrow_quiver_chin', name: 'Chin quiver sorrow', cat: 'sad', w: 4, frames: [
    { d: 0.24, p: m({ width: 34, height: 8.8, smile: -0.547, openness: 0.14, lowerDroop: 0.32, quiver: 1.620, cornerLeft: 2.2, cornerRight: 2.4, lipTight: 0.12 }), e: 'outQuad' },
    { d: 0.6, p: m({ quiver: 2.228, lowerDroop: 0.42, smile: -0.593 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'pout_child_defiant', name: 'Defiant child pout', cat: 'sad', w: 4, frames: [
    { d: 0.22, p: m({ width: 29, height: 11.2, smile: -0.28, openness: 0.07, lowerDroop: 0.62, upperRaise: 0.18, lipTight: 0.22, cornerLeft: 1.2, cornerRight: 1.4 }), e: 'outBack' },
    { d: 0.7, p: m({ lowerDroop: 0.68, lipTight: 0.26 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'sob_catch_breath', name: 'Sob catch breath', cat: 'sad', w: 3, frames: [
    { d: 0.14, p: m({ width: 36, height: 12.2, smile: -0.756, openness: 0.684, teethLower: 0.22, quiver: 2.228, drool: 0.18, upperRaise: 0.12 }), e: 'outQuad' },
    { d: 0.1, p: m({ openness: 0.18, quiver: 1.098, drool: 0.12, smile: -0.42 }), e: 'inQuad' },
    { d: 0.16, p: m({ openness: 0.781, quiver: 2.633, drool: 0.333, smile: -0.830, lowerDroop: 0.32 }), e: 'outCubic' },
    { d: 0.5, p: m({ quiver: 1.823 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tearless_wail', name: 'Tearless wail', cat: 'sad', w: 3, frames: [
    { d: 0.12, p: m({ width: 40, height: 14.5, smile: -0.661, openness: 0.857, teethUpper: 0.32, teethLower: 0.448, tongueOut: 0.22, quiver: 2.498, innerDark: 0.82, lowerDroop: 0.28 }), e: 'outBack' },
    { d: 0.7, p: m({ openness: 0.781, quiver: 1.958 }), e: 'linear' },
    { d: 0.45, p: m({}), e: 'outCubic' },
  ]},
  { id: 'lip_tremor_nervous', name: 'Nervous lip tremor', cat: 'sad', w: 4, frames: [
    { d: 0.16, p: m({ width: 32, height: 7.2, smile: -0.22, openness: 0.05, lipTight: 0.38, quiver: 1.958, upperRaise: 0.12 }), e: 'outQuad' },
    { d: 0.5, p: m({ quiver: 2.498, lipTight: 0.42 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'sigh_heavy_droop', name: 'Heavy sigh droop', cat: 'sad', w: 4, frames: [
    { d: 0.28, p: m({ width: 36, height: 8.5, smile: -0.18, openness: 0.22, lowerDroop: 0.48, upperRaise: 0.08, innerDark: 0.9, quiver: 0.22 }), e: 'inOutQuad' },
    { d: 0.5, p: m({ openness: 0.28, lowerDroop: 0.52, innerDark: 0.86 }), e: 'linear' },
    { d: 0.45, p: m({}), e: 'outQuad' },
  ]},
  { id: 'wobble_lower_lip_hold', name: 'Lower lip wobble hold', cat: 'sad', w: 3, frames: [
    { d: 0.18, p: m({ width: 33, height: 8.2, smile: -0.38, openness: 0.12, lowerDroop: 0.42, quiver: 1.823, cornerLeft: 1.8, cornerRight: 1.9 }), e: 'outQuad' },
    { d: 0.65, p: m({ quiver: 2.363, lowerDroop: 0.48 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'snarl_hold_lip_curl', name: 'Lip curl hold snarl', cat: 'angry', w: 4, frames: [
    { d: 0.16, p: m({ width: 43, height: 9.8, smile: -0.18, openness: 0.38, upperRaise: 0.802, teethUpper: 0.707, lowerDroop: 0.08, innerDark: 0.84, cornerLeft: -0.6, cornerRight: -1.2, quiver: 0.52 }), e: 'outBack' },
    { d: 0.7, p: m({ upperRaise: 0.850, teethUpper: 0.730 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'jaw_shift_grind', name: 'Jaw shift grind', cat: 'angry', w: 4, frames: [
    { d: 0.14, p: m({ width: 37, height: 6.2, smile: -0.12, openness: 0.06, lipTight: 0.62, upperRaise: 0.22, cornerLeft: -2.2, cornerRight: 1.2, quiver: 0.65 }), e: 'inOutQuad' },
    { d: 0.12, p: m({ cornerLeft: 1.4, cornerRight: -2.4, openness: 0.08, lipTight: 0.66 }), e: 'outQuad' },
    { d: 0.5, p: m({ quiver: 1.037 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'huff_nostril_mouth', name: 'Huff nostril flare', cat: 'angry', w: 3, frames: [
    { d: 0.12, p: m({ width: 40, height: 7.8, smile: -0.22, openness: 0.18, upperRaise: 0.48, lowerDroop: 0.12, lipTight: 0.28, quiver: 0.55, teethUpper: 0.18 }), e: 'outBack' },
    { d: 0.45, p: m({ openness: 0.28, upperRaise: 0.614 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'clench_tick_rapid', name: 'Rapid clench tick', cat: 'angry', w: 3, frames: [
    { d: 0.08, p: m({ width: 32, height: 5.2, smile: -0.08, openness: 0.02, lipTight: 0.72, quiver: 1.159, upperRaise: 0.18 }), e: 'inQuad' },
    { d: 0.07, p: m({ lipTight: 0.78, quiver: 1.403 }), e: 'linear' },
    { d: 0.08, p: m({ lipTight: 0.68, quiver: 1.037 }), e: 'linear' },
    { d: 0.08, p: m({ lipTight: 0.76, quiver: 1.281 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'sneer_contempt_hold', name: 'Contempt sneer hold', cat: 'angry', w: 3, frames: [
    { d: 0.2, p: m({ width: 41, height: 8.2, smile: -0.12, openness: 0.14, cornerLeft: -3.90, cornerRight: 1.4, upperRaise: 0.684, teethUpper: 0.38 }), e: 'outCubic' },
    { d: 0.75, p: m({ upperRaise: 0.732, teethUpper: 0.42 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'grumble_throat_low', name: 'Throat grumble low', cat: 'angry', w: 3, frames: [
    { d: 0.26, p: m({ width: 35, height: 9.2, smile: -0.28, openness: 0.18, innerDark: 0.86, quiver: 0.7, upperRaise: 0.18, lowerDroop: 0.18 }), e: 'outQuad' },
    { d: 0.6, p: m({ quiver: 1.159, innerDark: 0.84 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'sour_lemon_squint', name: 'Sour lemon squint', cat: 'disgusted', w: 2, frames: [
    { d: 0.14, p: m({ width: 36, height: 7.2, smile: -0.593, openness: 0.12, upperRaise: 0.802, lowerDroop: 0.22, lipTight: 0.32, cornerLeft: 1.8, cornerRight: 1.9, teethUpper: 0.18, quiver: 0.55 }), e: 'outBack' },
    { d: 0.6, p: m({ upperRaise: 0.850, lipTight: 0.36 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'retch_suppressed', name: 'Suppressed retch', cat: 'disgusted', w: 2, frames: [
    { d: 0.16, p: m({ width: 38, height: 11.5, smile: -0.32, openness: 0.42, tongueOut: 0.378, quiver: 1.403, drool: 0.22, teethUpper: 0.28, innerDark: 0.86 }), e: 'outQuad' },
    { d: 0.2, p: m({ openness: 0.684, tongueOut: 0.634, quiver: 1.958, drool: 0.410 }), e: 'outCubic' },
    { d: 0.35, p: m({ openness: 0.28, tongueOut: 0.18, quiver: 0.75 }), e: 'outQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tongue_flick_dismissive', name: 'Dismissive tongue flick', cat: 'disgusted', w: 2, frames: [
    { d: 0.1, p: m({ width: 40, smile: -0.22, openness: 0.32, tongueOut: 0.554, tongueWobble: 0.18, upperRaise: 0.32, teethUpper: 0.22 }), e: 'outBack' },
    { d: 0.12, p: m({ tongueOut: 0.686, tongueWobble: -0.12, upperRaise: 0.36 }), e: 'linear' },
    { d: 0.08, p: m({ tongueOut: 0.18, openness: 0.14 }), e: 'inQuad' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'nose_wrinkle_deep_hold', name: 'Deep nose wrinkle hold', cat: 'disgusted', w: 2, frames: [
    { d: 0.18, p: m({ width: 37, height: 9.2, smile: -0.547, openness: 0.2, upperRaise: 0.873, teethUpper: 0.38, tongueOut: 0.08, innerDark: 0.87 }), e: 'outBack' },
    { d: 0.75, p: m({ upperRaise: 0.880 }), e: 'hold' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'bitter_shudder', name: 'Bitter shudder', cat: 'disgusted', w: 2, frames: [
    { d: 0.12, p: m({ width: 42, smile: -0.36, openness: 0.38, upperRaise: 0.614, teethUpper: 0.34, quiver: 1.159, tongueOut: 0.18, drool: 0.12 }), e: 'outBack' },
    { d: 0.35, p: m({ quiver: 1.688, upperRaise: 0.684, drool: 0.18 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'gasp_soft_inhale', name: 'Soft inhale gasp', cat: 'surprised', w: 4, frames: [
    { d: 0.14, p: m({ width: 28, height: 12.5, openness: 0.38, smile: 0.02, innerDark: 0.88, upperRaise: 0.1 }), e: 'outCubic' },
    { d: 0.4, p: m({ openness: 0.42, innerDark: 0.86 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'jaw_slack_amazed', name: 'Slack amazed jaw', cat: 'surprised', w: 4, frames: [
    { d: 0.26, p: m({ width: 38, height: 13.5, openness: 0.572, lowerDroop: 0.55, innerDark: 0.83, teethLower: 0.18, quiver: 0.28 }), e: 'outBack' },
    { d: 0.7, p: m({ openness: 0.528, lowerDroop: 0.58 }), e: 'hold' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'o_to_grin_transition', name: 'O to grin transition', cat: 'surprised', w: 3, frames: [
    { d: 0.12, p: m({ width: 24, height: 14.2, openness: 0.572, innerDark: 0.84 }), e: 'outCubic' },
    { d: 0.22, p: m({ width: 42, height: 9.2, smile: 0.593, openness: 0.18, teethUpper: 0.32 }), e: 'outBack' },
    { d: 0.5, p: m({ smile: 0.661, openness: 0.16 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'double_take_mouth', name: 'Double take mouth', cat: 'surprised', w: 3, frames: [
    { d: 0.1, p: m({ width: 30, height: 11.2, openness: 0.38, innerDark: 0.86 }), e: 'outCubic' },
    { d: 0.08, p: m({ openness: 0.08, smile: 0.05 }), e: 'inQuad' },
    { d: 0.12, p: m({ width: 34, height: 13.8, openness: 0.781, teethUpper: 0.22, innerDark: 0.8 }), e: 'outCubic' },
    { d: 0.5, p: m({ openness: 0.42 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'breath_hold_surprise', name: 'Breath hold surprise', cat: 'surprised', w: 3, frames: [
    { d: 0.08, p: m({ width: 26, height: 10.2, openness: 0.42, lipTight: 0.22, innerDark: 0.88 }), e: 'outCubic' },
    { d: 0.6, p: m({ openness: 0.44, lipTight: 0.24, quiver: 0.35 }), e: 'hold' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'fish_pucker_pop', name: 'Fish pucker pop', cat: 'playful', w: 4, frames: [
    { d: 0.16, p: m({ width: 22, height: 13.2, openness: 0.28, lipTight: 0.42, innerDark: 0.88, smile: 0.02 }), e: 'outBack' },
    { d: 0.1, p: m({ width: 18, openness: 0.42, lipTight: 0.22, innerDark: 0.84 }), e: 'outCubic' },
    { d: 0.14, p: m({ width: 28, openness: 0.12, smile: 0.32, lipTight: 0.18 }), e: 'outBack' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'raspberry_blow', name: 'Blow raspberry', cat: 'playful', w: 3, frames: [
    { d: 0.12, p: m({ width: 36, height: 8.2, smile: 0.22, openness: 0.22, tongueOut: 0.502, tongueWobble: 0.22, lipTight: 0.18, quiver: 1.037 }), e: 'outBack' },
    { d: 0.3, p: m({ tongueOut: 0.581, tongueWobble: -0.28, quiver: 1.403, lipTight: 0.12, drool: 0.12 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tongue_rolling_side_slow', name: 'Slow tongue roll side', cat: 'playful', w: 3, frames: [
    { d: 0.18, p: m({ width: 38, openness: 0.32, tongueOut: 0.686, tongueWobble: 0.38, tongueCurl: 0.18, teethUpper: 0.18 }), e: 'outBack' },
    { d: 0.45, p: m({ tongueWobble: -0.42, tongueOut: 0.766, tongueCurl: 0.22 }), e: 'inOutQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'lip_pop_bubble', name: 'Lip pop bubble', cat: 'playful', w: 3, frames: [
    { d: 0.14, p: m({ width: 26, height: 12.8, openness: 0.32, lipTight: 0.38, innerDark: 0.88 }), e: 'outBack' },
    { d: 0.06, p: m({ width: 32, openness: 0.684, lipTight: 0.08, innerDark: 0.82 }), e: 'outCubic' },
    { d: 0.14, p: m({ width: 24, openness: 0.14, lipTight: 0.32 }), e: 'inQuad' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'kiss_hearty_smooch', name: 'Hearty smooch', cat: 'playful', w: 3, frames: [
    { d: 0.18, p: m({ width: 20, height: 13.5, openness: 0.24, lipTight: 0.48, smile: 0.08, innerDark: 0.9 }), e: 'outBack' },
    { d: 0.12, p: m({ width: 18, openness: 0.38, lipTight: 0.28 }), e: 'outCubic' },
    { d: 0.28, p: m({ width: 34, smile: 0.593, openness: 0.1, lipTight: 0.12 }), e: 'outElastic' },
  ]},
  { id: 'whistle_warble_updown', name: 'Warble whistle updown', cat: 'playful', w: 3, frames: [
    { d: 0.18, p: m({ width: 20, height: 13.2, openness: 0.36, lipTight: 0.38, innerDark: 0.86, quiver: 0.38 }), e: 'outBack' },
    { d: 0.22, p: m({ openness: 0.42, quiver: 0.62, width: 19 }), e: 'linear' },
    { d: 0.22, p: m({ openness: 0.32, quiver: 0.42, width: 21 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'chew_toy_mock', name: 'Mock chew toy', cat: 'playful', w: 3, frames: [
    { d: 0.14, p: m({ width: 38, openness: 0.32, cornerLeft: -2.2, cornerRight: 1.2, teethUpper: 0.22, tongueOut: 0.18, quiver: 0.45 }), e: 'outQuad' },
    { d: 0.12, p: m({ openness: 0.12, cornerLeft: 1.4, cornerRight: -2.4 }), e: 'inQuad' },
    { d: 0.14, p: m({ openness: 0.36, cornerLeft: -3.42, quiver: 0.55 }), e: 'outQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'mouth_breath_nasal_slow', name: 'Slow nasal mouth breath', cat: 'idle', w: 4, frames: [
    { d: 0.9, p: m({ width: 34, height: 8.8, openness: 0.06, smile: 0.04, innerDark: 0.94, lowerDroop: 0.08 }), e: 'inOutQuad' },
    { d: 1.0, p: m({ openness: 0.12, smile: 0.06, lowerDroop: 0.12, innerDark: 0.92 }), e: 'inOutQuad' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'lip_lick_contemplative_slow', name: 'Contemplative lip lick slow', cat: 'idle', w: 4, frames: [
    { d: 0.22, p: m({ width: 35, height: 8.2, openness: 0.14, tongueOut: 0.378, tongueWobble: 0.28, smile: 0.12 }), e: 'outBack' },
    { d: 0.32, p: m({ tongueWobble: -0.32, tongueOut: 0.502 }), e: 'inOutQuad' },
    { d: 0.28, p: m({ tongueOut: 0.22, tongueWobble: 0.18, openness: 0.08 }), e: 'outQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'yawn_stifle_suppress', name: 'Stifled yawn suppress', cat: 'idle', w: 3, frames: [
    { d: 0.22, p: m({ width: 32, height: 10.2, openness: 0.32, lowerDroop: 0.28, lipTight: 0.18, innerDark: 0.88 }), e: 'inOutQuad' },
    { d: 0.18, p: m({ openness: 0.12, lipTight: 0.42, width: 30 }), e: 'inQuad' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'hum_contemplative_closed', name: 'Closed hum contemplative', cat: 'idle', w: 3, frames: [
    { d: 0.38, p: m({ width: 33, height: 7.2, smile: 0.18, openness: 0.04, lipTight: 0.22, quiver: 0.22, innerDark: 0.94 }), e: 'inOutQuad' },
    { d: 0.7, p: m({ quiver: 0.32, smile: 0.22, openness: 0.06 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'mutter_subvocal_rapid', name: 'Subvocal mutter rapid', cat: 'idle', w: 3, frames: [
    { d: 0.08, p: m({ width: 31, openness: 0.14, quiver: 0.42, cornerLeft: -0.8, cornerRight: 0.6 }), e: 'outQuad' },
    { d: 0.06, p: m({ openness: 0.22, width: 33, cornerLeft: 0.6, cornerRight: -0.8 }), e: 'inOutQuad' },
    { d: 0.07, p: m({ openness: 0.08, width: 30 }), e: 'inOutQuad' },
    { d: 0.06, p: m({ openness: 0.18, width: 32 }), e: 'inOutQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'breathe_through_sleepy', name: 'Sleepy mouth breathe through', cat: 'idle', w: 3, frames: [
    { d: 0.7, p: m({ width: 34, openness: 0.14, lowerDroop: 0.22, drool: 0.12, innerDark: 0.92, quiver: 0.18 }), e: 'inOutQuad' },
    { d: 0.9, p: m({ openness: 0.18, lowerDroop: 0.28, drool: 0.18 }), e: 'inOutQuad' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'nibble_delicate_front', name: 'Delicate front nibble', cat: 'eating', w: 4, frames: [
    { d: 0.1, p: m({ width: 33, height: 7.2, openness: 0.14, teethUpper: 0.32, teethLower: 0.12, smile: 0.12, cornerLeft: -0.6, cornerRight: -0.6 }), e: 'outBack' },
    { d: 0.08, p: m({ openness: 0.04, lipTight: 0.22 }), e: 'inQuad' },
    { d: 0.1, p: m({ openness: 0.16, teethUpper: 0.34 }), e: 'outBack' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'savor_eyes_shut_mmm_long', name: 'Long eyes-shut savor', cat: 'eating', w: 4, frames: [
    { d: 0.42, p: m({ width: 37, height: 7.8, smile: 0.661, openness: 0.06, teethUpper: 0.06, innerDark: 0.94, quiver: 0.18, lowerDroop: 0.1 }), e: 'outCubic' },
    { d: 1.0, p: m({ smile: 0.756, openness: 0.04, quiver: 0.26, innerDark: 0.95 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'crunch_crispy_wide', name: 'Crispy crunch wide', cat: 'eating', w: 3, frames: [
    { d: 0.08, p: m({ width: 44, height: 9.8, openness: 0.572, teethUpper: 0.593, teethLower: 0.448, smile: 0.22, innerDark: 0.84, quiver: 0.45 }), e: 'outCubic' },
    { d: 0.06, p: m({ openness: 0.08, lipTight: 0.38, width: 42 }), e: 'inQuad' },
    { d: 0.1, p: m({ openness: 0.528, teethUpper: 0.48, quiver: 0.55 }), e: 'outCubic' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'slurp_noodle_pull_slow', name: 'Noodle slurp pull', cat: 'eating', w: 3, frames: [
    { d: 0.14, p: m({ width: 32, height: 8.2, openness: 0.32, tongueOut: 0.330, tongueCurl: 0.22, lipTight: 0.18, innerDark: 0.88 }), e: 'outBack' },
    { d: 0.28, p: m({ openness: 0.38, tongueOut: 0.554, tongueCurl: -0.18, lipTight: 0.08 }), e: 'linear' },
    { d: 0.22, p: m({ openness: 0.08, lipTight: 0.32, tongueOut: 0.08 }), e: 'inQuad' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'smack_lips_after', name: 'Lip smack after', cat: 'eating', w: 4, frames: [
    { d: 0.12, p: m({ width: 38, openness: 0.22, smile: 0.28, lipTight: 0.12, tongueOut: 0.08 }), e: 'outBack' },
    { d: 0.08, p: m({ openness: 0.04, lipTight: 0.38, width: 36 }), e: 'inQuad' },
    { d: 0.1, p: m({ openness: 0.18, lipTight: 0.08, smile: 0.32 }), e: 'outBack' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'chew_gum_bubble_pop_big', name: 'Big gum bubble pop', cat: 'eating', w: 3, frames: [
    { d: 0.16, p: m({ width: 40, openness: 0.22, smile: 0.18, cornerLeft: -1.4, cornerRight: -1.2, teethUpper: 0.12 }), e: 'outQuad' },
    { d: 0.18, p: m({ width: 44, height: 10.2, openness: 0.38, smile: 0.22, innerDark: 0.86, tongueOut: 0.12 }), e: 'outBack' },
    { d: 0.06, p: m({ openness: 0.08, lipTight: 0.28, width: 38 }), e: 'inQuad' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'lick_lips_slow_sensual', name: 'Slow sensual lip lick', cat: 'eating', w: 4, frames: [
    { d: 0.28, p: m({ width: 38, height: 8.2, openness: 0.18, tongueOut: 0.554, tongueWobble: 0.42, tongueCurl: 0.12, smile: 0.22 }), e: 'outCubic' },
    { d: 0.42, p: m({ tongueWobble: -0.42, tongueOut: 0.634, tongueCurl: 0.08 }), e: 'inOutQuad' },
    { d: 0.32, p: m({ tongueOut: 0.330, openness: 0.1 }), e: 'outQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'whisper_conspiratorial_side', name: 'Conspiratorial whisper side', cat: 'social', w: 4, frames: [
    { d: 0.16, p: m({ width: 32, height: 7.2, openness: 0.12, cornerLeft: -3.42, cornerRight: 0.8, smile: 0.18, upperRaise: 0.08, quiver: 0.18 }), e: 'outCubic' },
    { d: 0.6, p: m({ openness: 0.16, cornerLeft: -3.90, quiver: 0.22 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'coo_affectionate_soft', name: 'Affectionate coo soft', cat: 'social', w: 4, frames: [
    { d: 0.22, p: m({ width: 36, height: 8.5, smile: 0.547, openness: 0.16, teethUpper: 0.12, cornerLeft: -1.2, cornerRight: -1.4, upperRaise: 0.08, innerDark: 0.92 }), e: 'outBack' },
    { d: 0.6, p: m({ smile: 0.593, openness: 0.14, teethUpper: 0.14 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'mock_gasp_playful_shock', name: 'Mock playful gasp', cat: 'social', w: 3, frames: [
    { d: 0.08, p: m({ width: 28, height: 12.2, openness: 0.528, smile: 0.18, innerDark: 0.86, upperRaise: 0.14, teethUpper: 0.12 }), e: 'outCubic' },
    { d: 0.22, p: m({ openness: 0.572, smile: 0.22, teethUpper: 0.16 }), e: 'hold' },
    { d: 0.35, p: m({ width: 40, smile: 0.42, openness: 0.14 }), e: 'outBack' },
  ]},
  { id: 'murmur_agreement_soft', name: 'Soft agreement murmur', cat: 'social', w: 3, frames: [
    { d: 0.14, p: m({ width: 34, height: 7.2, smile: 0.28, openness: 0.1, quiver: 0.28, innerDark: 0.92 }), e: 'outQuad' },
    { d: 0.45, p: m({ openness: 0.14, quiver: 0.35, smile: 0.32 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'bluff_pout_negotiate', name: 'Bluff pout negotiate', cat: 'social', w: 3, frames: [
    { d: 0.2, p: m({ width: 30, height: 9.8, smile: -0.18, openness: 0.08, lowerDroop: 0.42, lipTight: 0.18, cornerLeft: 0.8, cornerRight: 1.1 }), e: 'outBack' },
    { d: 0.6, p: m({ lowerDroop: 0.46, lipTight: 0.22 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'greet_big_warm_wide', name: 'Warm wide greet', cat: 'social', w: 4, frames: [
    { d: 0.18, p: m({ width: 44, height: 9.2, smile: 0.756, openness: 0.22, teethUpper: 0.38, teethLower: 0.08, cornerLeft: -1.8, cornerRight: -1.9, upperRaise: 0.12 }), e: 'outBack' },
    { d: 0.6, p: m({ smile: 0.805, openness: 0.18, teethUpper: 0.42 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'stutter_lip_quiver_word', name: 'Stutter word quiver', cat: 'rare', w: 2, frames: [
    { d: 0.07, p: m({ width: 33, openness: 0.18, quiver: 1.159, lipTight: 0.22, cornerLeft: -0.8, cornerRight: 0.6 }), e: 'outQuad' },
    { d: 0.06, p: m({ openness: 0.06, quiver: 0.62, lipTight: 0.32 }), e: 'inQuad' },
    { d: 0.07, p: m({ openness: 0.22, quiver: 1.281, cornerLeft: 0.6, cornerRight: -0.8 }), e: 'outQuad' },
    { d: 0.06, p: m({ openness: 0.08, quiver: 0.72 }), e: 'inQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'sneeze_buildup_inhale', name: 'Sneeze buildup inhale', cat: 'rare', w: 1, frames: [
    { d: 0.18, p: m({ width: 34, height: 8.2, smile: -0.08, openness: 0.12, upperRaise: 0.42, quiver: 0.45, innerDark: 0.9 }), e: 'inOutQuad' },
    { d: 0.12, p: m({ width: 38, height: 10.2, openness: 0.42, upperRaise: 0.732, teethUpper: 0.28, quiver: 1.037, innerDark: 0.86 }), e: 'outCubic' },
    { d: 0.08, p: m({ width: 44, height: 12.2, openness: 0.781, upperRaise: 0.850, teethUpper: 0.42, quiver: 1.403, drool: 0.08 }), e: 'outCubic' },
    { d: 0.35, p: m({ openness: 0.18, quiver: 0.45 }), e: 'outQuad' },
  ]},
  { id: 'hiccup_jolt_single', name: 'Single hiccup jolt', cat: 'rare', w: 1, frames: [
    { d: 0.06, p: m({ width: 32, height: 10.2, openness: 0.42, innerDark: 0.86, lowerDroop: 0.12, quiver: 1.037 }), e: 'outCubic' },
    { d: 0.06, p: m({ openness: 0.06, lipTight: 0.32, quiver: 0.42 }), e: 'inQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'hiccup_chain_three', name: 'Three hiccup chain', cat: 'rare', w: 1, frames: [
    { d: 0.06, p: m({ width: 32, openness: 0.38, innerDark: 0.86 }), e: 'outCubic' },
    { d: 0.05, p: m({ openness: 0.06 }), e: 'inQuad' },
    { d: 0.06, p: m({ width: 33, openness: 0.42 }), e: 'outCubic' },
    { d: 0.05, p: m({ openness: 0.06 }), e: 'inQuad' },
    { d: 0.06, p: m({ width: 34, openness: 0.495 }), e: 'outCubic' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'yawn_contagious_chain_long', name: 'Contagious yawn chain long', cat: 'rare', w: 1, frames: [
    { d: 0.42, p: m({ width: 30, height: 12.2, openness: 0.42, lowerDroop: 0.32, innerDark: 0.86, tongueOut: 0.08 }), e: 'inOutQuad' },
    { d: 0.38, p: m({ width: 27, height: 16.5, openness: 0.857, lowerDroop: 0.68, tongueOut: 0.330, innerDark: 0.78, drool: 0.08, quiver: 0.22 }), e: 'inOutCubic' },
    { d: 0.45, p: m({ openness: 0.781, lowerDroop: 0.62, drool: 0.14 }), e: 'hold' },
    { d: 0.5, p: m({}), e: 'outCubic' },
  ]},
  { id: 'shiver_chatter_teeth_cold', name: 'Cold chatter teeth', cat: 'rare', w: 1, frames: [
    { d: 0.08, p: m({ width: 34, openness: 0.22, teethUpper: 0.32, teethLower: 0.22, quiver: 1.917, lowerDroop: 0.12, cornerLeft: 1.2, cornerRight: 1.4 }), e: 'outQuad' },
    { d: 0.07, p: m({ openness: 0.08, quiver: 1.074 }), e: 'inQuad' },
    { d: 0.08, p: m({ openness: 0.26, quiver: 2.187 }), e: 'outQuad' },
    { d: 0.07, p: m({ openness: 0.1, quiver: 1.220 }), e: 'inQuad' },
    { d: 0.45, p: m({}), e: 'outQuad' },
  ]},
  { id: 'breath_hold_puff_cheeks_big', name: 'Puff cheeks breath hold', cat: 'rare', w: 2, frames: [
    { d: 0.22, p: m({ width: 38, height: 10.2, openness: 0.08, lipTight: 0.38, lowerDroop: 0.12, upperRaise: 0.08, quiver: 0.28, innerDark: 0.93 }), e: 'outCubic' },
    { d: 0.9, p: m({ lipTight: 0.42, quiver: 0.42, width: 40 }), e: 'hold' },
    { d: 0.12, p: m({ width: 36, openness: 0.38, lipTight: 0.08, quiver: 0.62 }), e: 'outCubic' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'sniff_inhale_mouth_closed', name: 'Sniff inhale mouth closed', cat: 'idle', w: 3, frames: [
    { d: 0.14, p: m({ width: 32, height: 7.2, openness: 0.04, lipTight: 0.32, upperRaise: 0.22, innerDark: 0.95 }), e: 'inQuad' },
    { d: 0.22, p: m({ openness: 0.08, lipTight: 0.28, upperRaise: 0.28 }), e: 'outQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tongue_tip_bite_gentle', name: 'Gentle tongue tip bite', cat: 'playful', w: 3, frames: [
    { d: 0.16, p: m({ width: 34, openness: 0.14, tongueOut: 0.22, teethUpper: 0.18, lipTight: 0.12, smile: 0.12 }), e: 'outBack' },
    { d: 0.45, p: m({ tongueOut: 0.26, teethUpper: 0.22 }), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'lip_twitch_single', name: 'Single lip twitch', cat: 'idle', w: 3, frames: [
    { d: 0.08, p: m({ width: 34, smile: 0.08, openness: 0.04, cornerLeft: -1.2, quiver: 0.42 }), e: 'outQuad' },
    { d: 0.15, p: m({ cornerLeft: 0.4, quiver: 0.22 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},



  // ============================================================
  //  ULTRA-REALISTIC EXPANSION v6 — 90+ новых сложнейших мимик
  //  Анатомически точные: уголки вверх при улыбке (corner -), вниз при грусти (corner +),
  //  Духенн, contempt, shame, awe, flirt, cringe и т.д. — 3-5 фаз onset-apex-offset
  // ============================================================
  { id: 'duchenne_true_joy', name: 'Духенн истинная радость', cat: 'happy', w: 6, frames: [
    { d: 0.24, p: m({ width: 44, height: 9.2, smile: 0.72, openness: 0.18, teethUpper: 0.42, cornerLeft: -2.2, cornerRight: -2.2, upperRaise: 0.18 }), e: 'outCubic' },
    { d: 0.55, p: m({ smile: 0.81, openness: 0.22, teethUpper: 0.55, cornerLeft: -2.6, cornerRight: -2.6 }), e: 'inOutQuad' },
    { d: 0.7, p: m({ smile: 0.68, openness: 0.12 }), e: 'outQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'polite_closed_smile', name: 'Вежливая закрытая улыбка', cat: 'happy', w: 7, frames: [
    { d: 0.22, p: m({ width: 36, height: 7.0, smile: 0.38, openness: 0.02, cornerLeft: -1.1, cornerRight: -1.1, lipTight: 0.08 }), e: 'outQuad' },
    { d: 1.1, p: m({ smile: 0.40 }), e: 'hold' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'smirk_asymmetric_left', name: 'Ухмылка асимметрия влево', cat: 'happy', w: 5, frames: [
    { d: 0.16, p: m({ width: 40, height: 8.0, smile: 0.52, openness: 0.06, cornerLeft: -2.8, cornerRight: 0.6, teethUpper: 0.18 }), e: 'outBack' },
    { d: 0.6, p: m({ smile: 0.56, cornerLeft: -2.5 }), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'smirk_asymmetric_right', name: 'Ухмылка вправо', cat: 'happy', w: 5, frames: [
    { d: 0.16, p: m({ width: 40, height: 8.0, smile: 0.52, openness: 0.06, cornerLeft: 0.6, cornerRight: -2.8, teethUpper: 0.18 }), e: 'outBack' },
    { d: 0.6, p: m({ smile: 0.56, cornerRight: -2.5 }), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'chuckle_shake', name: 'Хихик покачивание', cat: 'happy', w: 5, frames: [
    { d: 0.11, p: m({ width: 44, height: 10.2, smile: 0.74, openness: 0.38, teethUpper: 0.52, teethLower: 0.18, cornerLeft: -1.9, cornerRight: -1.9, quiver: 0.55 }), e: 'outQuad' },
    { d: 0.09, p: m({ openness: 0.26, quiver: 0.42 }), e: 'inQuad' },
    { d: 0.11, p: m({ openness: 0.41, quiver: 0.61 }), e: 'outQuad' },
    { d: 0.09, p: m({ openness: 0.24 }), e: 'inQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'giggle_nasal', name: 'Хихик носом', cat: 'happy', w: 5, frames: [
    { d: 0.13, p: m({ width: 38, height: 8.5, smile: 0.66, openness: 0.18, teethUpper: 0.32, cornerLeft: -1.6, cornerRight: -1.6, quiver: 0.38, upperRaise: 0.12 }), e: 'outQuad' },
    { d: 0.10, p: m({ openness: 0.09, smile: 0.62 }), e: 'inQuad' },
    { d: 0.12, p: m({ openness: 0.21 }), e: 'outQuad' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'laugh_cry_joy', name: 'Смех до слёз радости', cat: 'happy', w: 3, frames: [
    { d: 0.14, p: m({ width: 46, height: 11.5, smile: 0.86, openness: 0.62, teethUpper: 0.68, teethLower: 0.42, tongueOut: 0.12, cornerLeft: -2.4, cornerRight: -2.4, quiver: 0.62, drool: 0.04, innerDark: 0.84 }), e: 'outBack' },
    { d: 0.10, p: m({ openness: 0.48, quiver: 0.88 }), e: 'inQuad' },
    { d: 0.12, p: m({ openness: 0.66, quiver: 0.71 }), e: 'outQuad' },
    { d: 0.6, p: m({ smile: 0.79, quiver: 0.42 }), e: 'outQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'content_sigh_smile', name: 'Довольный вздох улыбка', cat: 'happy', w: 6, frames: [
    { d: 0.32, p: m({ width: 40, height: 9.0, smile: 0.48, openness: 0.20, teethUpper: 0.12, cornerLeft: -1.4, cornerRight: -1.4, innerDark: 0.9 }), e: 'inOutQuad' },
    { d: 0.45, p: m({ openness: 0.08, smile: 0.44, width: 38 }), e: 'outQuad' },
    { d: 0.50, p: m({ smile: 0.34 }), e: 'outQuad' },
  ]},
  { id: 'relief_half_smile', name: 'Облегчённая полуулыбка', cat: 'happy', w: 6, frames: [
    { d: 0.28, p: m({ width: 38, height: 8.2, smile: 0.31, openness: 0.11, cornerLeft: -0.9, cornerRight: -0.9, lowerDroop: 0.12, drool: 0.01 }), e: 'outQuad' },
    { d: 0.55, p: m({ smile: 0.36, openness: 0.06 }), e: 'inOutQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'pride_smile_chinup', name: 'Гордая улыбка подбородок вверх', cat: 'happy', w: 5, frames: [
    { d: 0.22, p: m({ width: 42, height: 8.5, smile: 0.58, openness: 0.14, teethUpper: 0.36, cornerLeft: -1.7, cornerRight: -1.7, upperRaise: 0.06, lowerDroop: -0.08 }), e: 'outBack' },
    { d: 0.75, p: m({ smile: 0.62 }), e: 'hold' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'embarrassed_corner_bite', name: 'Смущённая закусила уголок', cat: 'happy', w: 4, frames: [
    { d: 0.18, p: m({ width: 32, height: 7.8, smile: 0.28, openness: 0.05, cornerLeft: -0.6, cornerRight: 1.2, lipTight: 0.18, teethLower: 0.08 }), e: 'outQuad' },
    { d: 0.38, p: m({ cornerRight: 1.4, smile: 0.24, lipTight: 0.22 }), e: 'hold' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'nostalgic_wistful_smile', name: 'Ностальгическая улыбка', cat: 'happy', w: 5, frames: [
    { d: 0.30, p: m({ width: 36, height: 7.8, smile: 0.36, openness: 0.04, cornerLeft: -1.2, cornerRight: 0.8, quiver: 0.18, lowerDroop: 0.10, lipTight: 0.12 }), e: 'inOutQuad' },
    { d: 0.85, p: m({ smile: 0.32, quiver: 0.22, cornerRight: 0.95 }), e: 'hold' },
    { d: 0.42, p: m({}), e: 'outQuad' },
  ]},
  { id: 'bittersweet_smile_sadeyes', name: 'Горько-сладкая улыбка', cat: 'happy', w: 4, frames: [
    { d: 0.26, p: m({ width: 38, height: 8.2, smile: 0.44, openness: 0.07, cornerLeft: -1.5, cornerRight: 1.1, lowerDroop: 0.14, quiver: 0.28, teethUpper: 0.14 }), e: 'outCubic' },
    { d: 0.70, p: m({ smile: 0.39, cornerRight: 1.35, quiver: 0.34 }), e: 'linear' },
    { d: 0.38, p: m({}), e: 'outQuad' },
  ]},
  { id: 'smug_press_lips', name: 'Самодовольные сжатые губы', cat: 'happy', w: 5, frames: [
    { d: 0.24, p: m({ width: 30, height: 5.8, smile: 0.32, openness: 0.01, lipTight: 0.42, cornerLeft: -0.8, cornerRight: -0.8 }), e: 'outQuad' },
    { d: 0.55, p: m({ lipTight: 0.48, smile: 0.36 }), e: 'hold' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'beaming_open_cheeks', name: 'Сияющая щёки вверх', cat: 'happy', w: 6, frames: [
    { d: 0.20, p: m({ width: 46, height: 10.0, smile: 0.78, openness: 0.34, teethUpper: 0.58, cornerLeft: -2.7, cornerRight: -2.7, upperRaise: 0.14, lowerDroop: 0.04 }), e: 'outBack' },
    { d: 0.65, p: m({ smile: 0.82, openness: 0.28 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'grief_pang', name: 'Укол горя', cat: 'sad', w: 4, frames: [
    { d: 0.16, p: m({ width: 34, height: 9.2, smile: -0.58, openness: 0.22, cornerLeft: 3.8, cornerRight: 3.8, quiver: 0.88, lowerDroop: 0.28, upperRaise: 0.16, lipTight: 0.18 }), e: 'inQuad' },
    { d: 0.55, p: m({ smile: -0.66, openness: 0.14, quiver: 1.12 }), e: 'linear' },
    { d: 0.42, p: m({ quiver: 0.62 }), e: 'outQuad' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'disappointment_drop', name: 'Разочарование уголки вниз', cat: 'sad', w: 6, frames: [
    { d: 0.28, p: m({ width: 36, height: 7.8, smile: -0.44, openness: 0.06, cornerLeft: 2.9, cornerRight: 2.9, lowerDroop: 0.18, lipTight: 0.14 }), e: 'outQuad' },
    { d: 0.70, p: m({ smile: -0.48, cornerLeft: 3.2, cornerRight: 3.2 }), e: 'hold' },
    { d: 0.36, p: m({}), e: 'outQuad' },
  ]},
  { id: 'resigned_sigh_down', name: 'Смиренный вздох вниз', cat: 'sad', w: 5, frames: [
    { d: 0.30, p: m({ width: 38, height: 8.5, smile: -0.32, openness: 0.20, cornerLeft: 1.8, cornerRight: 1.8, lowerDroop: 0.22 }), e: 'inOutQuad' },
    { d: 0.42, p: m({ openness: 0.06, smile: -0.28, lowerDroop: 0.12 }), e: 'outQuad' },
    { d: 0.55, p: m({ smile: -0.22 }), e: 'outQuad' },
  ]},
  { id: 'lonely_droop_chin', name: 'Одиночество подбородок дрожит', cat: 'sad', w: 5, frames: [
    { d: 0.26, p: m({ width: 32, height: 8.0, smile: -0.42, openness: 0.08, cornerLeft: 2.4, cornerRight: 2.4, lowerDroop: 0.34, quiver: 0.58, lipTight: 0.22 }), e: 'outQuad' },
    { d: 0.80, p: m({ quiver: 0.92, smile: -0.46, lowerDroop: 0.38 }), e: 'linear' },
    { d: 0.38, p: m({}), e: 'outQuad' },
  ]},
  { id: 'shame_lower_lip_in', name: 'Стыд нижняя губа внутрь', cat: 'sad', w: 5, frames: [
    { d: 0.20, p: m({ width: 30, height: 6.5, smile: -0.26, openness: 0.04, lipTight: 0.38, lowerDroop: -0.12, cornerLeft: 1.4, cornerRight: 1.4, teethLower: 0.06 }), e: 'inQuad' },
    { d: 0.65, p: m({ lipTight: 0.44, cornerLeft: 1.6, cornerRight: 1.6 }), e: 'hold' },
    { d: 0.34, p: m({}), e: 'outQuad' },
  ]},
  { id: 'heartbreak_wail_big', name: 'Разбитое сердце вопль', cat: 'sad', w: 3, frames: [
    { d: 0.14, p: m({ width: 38, height: 12.2, smile: -0.88, openness: 0.74, teethLower: 0.42, tongueOut: 0.14, cornerLeft: 4.2, cornerRight: 4.2, quiver: 1.42, drool: 0.12, lowerDroop: 0.42, innerDark: 0.84 }), e: 'outBack' },
    { d: 0.12, p: m({ openness: 0.58, quiver: 1.88 }), e: 'inQuad' },
    { d: 0.14, p: m({ openness: 0.78, quiver: 1.62 }), e: 'outQuad' },
    { d: 0.70, p: m({ quiver: 0.88 }), e: 'outQuad' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'sniffle_nose_mouth', name: 'Шмыг нос-рот', cat: 'sad', w: 4, frames: [
    { d: 0.12, p: m({ width: 34, height: 8.2, smile: -0.36, openness: 0.06, upperRaise: 0.28, cornerLeft: 1.2, cornerRight: 1.2, quiver: 0.32, lipTight: 0.14 }), e: 'outQuad' },
    { d: 0.14, p: m({ openness: 0.12, upperRaise: 0.34 }), e: 'inQuad' },
    { d: 0.18, p: m({ openness: 0.04 }), e: 'outQuad' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'pout_sulk_child', name: 'Детский надутый', cat: 'sad', w: 5, frames: [
    { d: 0.22, p: m({ width: 26, height: 10.2, smile: -0.22, openness: 0.06, lowerDroop: 0.58, upperRaise: 0.08, lipTight: 0.08, cornerLeft: 0.8, cornerRight: 0.8 }), e: 'outBack' },
    { d: 0.65, p: m({ lowerDroop: 0.62 }), e: 'hold' },
    { d: 0.34, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tremble_chin_mentalis', name: 'Дрожь подбородка mentalis', cat: 'sad', w: 4, frames: [
    { d: 0.10, p: m({ width: 34, height: 7.6, smile: -0.48, openness: 0.08, quiver: 1.02, lowerDroop: 0.18, cornerLeft: 2.6, cornerRight: 2.6, lipTight: 0.28 }), e: 'outQuad' },
    { d: 0.09, p: m({ lowerDroop: 0.08, quiver: 1.24 }), e: 'inQuad' },
    { d: 0.10, p: m({ lowerDroop: 0.21, quiver: 1.42 }), e: 'outQuad' },
    { d: 0.55, p: m({ quiver: 0.62 }), e: 'outQuad' },
  ]},
  { id: 'tearless_wail_soft', name: 'Безслёзный тихий вой', cat: 'sad', w: 4, frames: [
    { d: 0.18, p: m({ width: 36, height: 10.2, smile: -0.62, openness: 0.44, cornerLeft: 3.4, cornerRight: 3.4, quiver: 0.92, lowerDroop: 0.28, teethLower: 0.16 }), e: 'outCubic' },
    { d: 0.65, p: m({ openness: 0.38, quiver: 1.18 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'indignant_huff_nostrils', name: 'Возмущённый фырк', cat: 'angry', w: 5, frames: [
    { d: 0.14, p: m({ width: 34, height: 7.2, smile: -0.22, openness: 0.07, lipTight: 0.36, upperRaise: 0.22, cornerLeft: 1.8, cornerRight: 1.8, quiver: 0.38 }), e: 'outQuad' },
    { d: 0.16, p: m({ openness: 0.04, upperRaise: 0.32, lipTight: 0.42 }), e: 'inQuad' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'contempt_unilateral', name: 'Презрение одностороннее', cat: 'angry', w: 5, frames: [
    { d: 0.18, p: m({ width: 38, height: 7.6, smile: 0.18, openness: 0.04, cornerLeft: -1.6, cornerRight: 2.2, upperRaise: 0.28, lipTight: 0.22 }), e: 'outCubic' },
    { d: 0.62, p: m({ cornerRight: 2.6, upperRaise: 0.32 }), e: 'hold' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'scorn_curl_upper', name: 'Презрительный загиб верхней', cat: 'angry', w: 4, frames: [
    { d: 0.16, p: m({ width: 36, height: 8.0, openness: 0.08, upperRaise: 0.52, cornerLeft: 0.4, cornerRight: 0.4, lipTight: 0.18, teethUpper: 0.22 }), e: 'outQuad' },
    { d: 0.55, p: m({ upperRaise: 0.58, teethUpper: 0.28 }), e: 'hold' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'furious_bare_teeth', name: 'Яростный оскал', cat: 'angry', w: 3, frames: [
    { d: 0.12, p: m({ width: 44, height: 10.2, smile: -0.18, openness: 0.42, teethUpper: 0.82, teethLower: 0.42, upperRaise: 0.42, lowerDroop: 0.18, cornerLeft: 1.6, cornerRight: 1.6, lipTight: 0.22, quiver: 0.42 }), e: 'outBack' },
    { d: 0.55, p: m({ openness: 0.48, quiver: 0.58 }), e: 'linear' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'simmer_hold_press', name: 'Сдерживаемая злость сжато', cat: 'angry', w: 5, frames: [
    { d: 0.26, p: m({ width: 28, height: 5.2, openness: 0.01, lipTight: 0.58, cornerLeft: 1.1, cornerRight: 1.1, upperRaise: 0.08, quiver: 0.32 }), e: 'inQuad' },
    { d: 0.75, p: m({ lipTight: 0.62, quiver: 0.48 }), e: 'hold' },
    { d: 0.34, p: m({}), e: 'outQuad' },
  ]},
  { id: 'jaw_clench_grind', name: 'Сжатие челюстей скрежет', cat: 'angry', w: 4, frames: [
    { d: 0.18, p: m({ width: 40, height: 6.2, openness: 0.04, lipTight: 0.48, cornerLeft: 0.9, cornerRight: 0.9, quiver: 0.28, teethUpper: 0.08 }), e: 'inQuad' },
    { d: 0.12, p: m({ width: 41, lipTight: 0.52, quiver: 0.42 }), e: 'linear' },
    { d: 0.14, p: m({ width: 39, quiver: 0.32 }), e: 'linear' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'snarl_nasolabial', name: 'Рык носогубка', cat: 'angry', w: 4, frames: [
    { d: 0.14, p: m({ width: 40, height: 9.0, openness: 0.16, upperRaise: 0.62, cornerLeft: 1.2, cornerRight: 1.2, teethUpper: 0.48, lipTight: 0.14 }), e: 'outQuad' },
    { d: 0.50, p: m({ upperRaise: 0.68, teethUpper: 0.54 }), e: 'hold' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'annoyed_eye_roll_mouth', name: 'Раздражённый закат губ', cat: 'angry', w: 5, frames: [
    { d: 0.20, p: m({ width: 36, height: 7.0, smile: -0.18, openness: 0.06, cornerLeft: 0.8, cornerRight: 1.6, lipTight: 0.18, lowerDroop: 0.12 }), e: 'outQuad' },
    { d: 0.45, p: m({ cornerRight: 1.9 }), e: 'hold' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'threat_press_lips_white', name: 'Угроза побледневшие сжатые', cat: 'angry', w: 3, frames: [
    { d: 0.16, p: m({ width: 26, height: 4.8, openness: 0.005, lipTight: 0.72, cornerLeft: 0.6, cornerRight: 0.6, innerDark: 0.96 }), e: 'inQuad' },
    { d: 0.62, p: m({ lipTight: 0.78, quiver: 0.22 }), e: 'hold' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'picky_purse_narrow', name: 'Придирчиво поджатые узко', cat: 'disgusted', w: 6, frames: [
    { d: 0.20, p: m({ width: 26, height: 6.2, openness: 0.02, lipTight: 0.32, upperRaise: 0.18, lowerDroop: 0.08, cornerLeft: 0.6, cornerRight: 0.6 }), e: 'outQuad' },
    { d: 0.55, p: m({ width: 24, lipTight: 0.38 }), e: 'hold' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'queasy_swallow', name: 'Тошнотный глоток', cat: 'disgusted', w: 4, frames: [
    { d: 0.18, p: m({ width: 32, height: 7.8, openness: 0.08, upperRaise: 0.38, lowerDroop: 0.12, lipTight: 0.16, cornerLeft: 0.8, cornerRight: 0.8 }), e: 'outQuad' },
    { d: 0.22, p: m({ openness: 0.02, upperRaise: 0.44, lipTight: 0.22 }), e: 'inQuad' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'bitter_taste_tongue', name: 'Горький вкус язык наружу', cat: 'disgusted', w: 5, frames: [
    { d: 0.16, p: m({ width: 34, height: 8.2, openness: 0.18, upperRaise: 0.32, tongueOut: 0.18, tongueCurl: 0.22, cornerLeft: 0.6, cornerRight: 0.6 }), e: 'outQuad' },
    { d: 0.32, p: m({ tongueOut: 0.24, tongueCurl: 0.32 }), e: 'hold' },
    { d: 0.28, p: m({}), e: 'outQuad' },
  ]},
  { id: 'sour_suck_cheeks', name: 'Кислые втянутые щёки', cat: 'disgusted', w: 5, frames: [
    { d: 0.18, p: m({ width: 24, height: 7.0, openness: 0.03, lipTight: 0.28, cornerLeft: 0.4, cornerRight: 0.4, upperRaise: 0.12 }), e: 'outQuad' },
    { d: 0.42, p: m({ width: 22, lipTight: 0.34 }), e: 'hold' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'nose_wrinkle_upper_sneer', name: 'Сморщенный нос усмешка', cat: 'disgusted', w: 4, frames: [
    { d: 0.14, p: m({ width: 36, height: 8.5, openness: 0.06, upperRaise: 0.58, cornerLeft: 0.7, cornerRight: 0.7, lipTight: 0.12, teethUpper: 0.14 }), e: 'outQuad' },
    { d: 0.55, p: m({ upperRaise: 0.62 }), e: 'hold' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'gag_recoil_tongue', name: 'Рвотный позыв откат языка', cat: 'disgusted', w: 3, frames: [
    { d: 0.12, p: m({ width: 38, height: 11.0, openness: 0.58, tongueOut: 0.42, tongueCurl: 0.42, upperRaise: 0.36, cornerLeft: 0.4, cornerRight: 0.4, quiver: 0.38, innerDark: 0.82 }), e: 'outBack' },
    { d: 0.18, p: m({ openness: 0.32, tongueOut: 0.22 }), e: 'inQuad' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'gasp_silent_O', name: 'Беззвучный вздох О', cat: 'surprised', w: 6, frames: [
    { d: 0.10, p: m({ width: 32, height: 11.2, openness: 0.58, cornerLeft: -0.2, cornerRight: -0.2, lowerDroop: 0.28, innerDark: 0.86 }), e: 'outCubic' },
    { d: 0.55, p: m({ openness: 0.48 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'awe_open_soft', name: 'Трепет мягко открыт', cat: 'surprised', w: 5, frames: [
    { d: 0.22, p: m({ width: 36, height: 10.2, openness: 0.38, cornerLeft: -0.4, cornerRight: -0.4, lowerDroop: 0.18, teethUpper: 0.14 }), e: 'outQuad' },
    { d: 0.75, p: m({ openness: 0.34 }), e: 'hold' },
    { d: 0.38, p: m({}), e: 'outQuad' },
  ]},
  { id: 'startle_jolt_mouth', name: 'Испуг рывок рта', cat: 'surprised', w: 3, frames: [
    { d: 0.07, p: m({ width: 34, height: 12.0, openness: 0.62, cornerLeft: 0.2, cornerRight: 0.2, lowerDroop: 0.32, quiver: 0.42 }), e: 'outQuad' },
    { d: 0.10, p: m({ openness: 0.34, quiver: 0.22 }), e: 'inQuad' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'double_take_O_mouth', name: 'Двойной дубль О', cat: 'surprised', w: 4, frames: [
    { d: 0.11, p: m({ width: 34, height: 11.0, openness: 0.48, cornerLeft: 0.0, cornerRight: 0.0, lowerDroop: 0.22 }), e: 'outQuad' },
    { d: 0.10, p: m({ openness: 0.18 }), e: 'inQuad' },
    { d: 0.12, p: m({ openness: 0.54 }), e: 'outQuad' },
    { d: 0.40, p: m({}), e: 'outQuad' },
  ]},
  { id: 'breath_hold_awe', name: 'Затаил дыхание трепет', cat: 'surprised', w: 4, frames: [
    { d: 0.28, p: m({ width: 30, height: 9.5, openness: 0.22, cornerLeft: -0.3, cornerRight: -0.3, lipTight: 0.08, innerDark: 0.90 }), e: 'inQuad' },
    { d: 0.62, p: m({ openness: 0.18, lipTight: 0.12 }), e: 'hold' },
    { d: 0.34, p: m({}), e: 'outQuad' },
  ]},
  { id: 'jaw_drop_slow', name: 'Медленно падает челюсть', cat: 'surprised', w: 5, frames: [
    { d: 0.42, p: m({ width: 36, height: 10.8, openness: 0.52, lowerDroop: 0.42, cornerLeft: -0.2, cornerRight: -0.2 }), e: 'inOutCubic' },
    { d: 0.55, p: m({ openness: 0.58 }), e: 'linear' },
    { d: 0.40, p: m({}), e: 'outQuad' },
  ]},
  { id: 'flirt_bite_lower_lip', name: 'Флирт закусила нижнюю', cat: 'playful', w: 5, frames: [
    { d: 0.18, p: m({ width: 34, height: 8.2, openness: 0.07, smile: 0.42, cornerLeft: -1.4, cornerRight: -0.2, teethUpper: 0.22, lowerDroop: 0.08 }), e: 'outQuad' },
    { d: 0.42, p: m({ smile: 0.48, cornerLeft: -1.6, teethUpper: 0.26 }), e: 'hold' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'cheeky_wink_mouth_asym', name: 'Хитрый рот асим', cat: 'playful', w: 5, frames: [
    { d: 0.14, p: m({ width: 38, height: 7.8, smile: 0.48, openness: 0.04, cornerLeft: -1.8, cornerRight: 0.8, lipTight: 0.08 }), e: 'outBack' },
    { d: 0.50, p: m({ smile: 0.52, cornerLeft: -2.0 }), e: 'hold' },
    { d: 0.28, p: m({}), e: 'outQuad' },
  ]},
  { id: 'mischief_pout_tongue_side', name: 'Озорной высунул вбок', cat: 'playful', w: 4, frames: [
    { d: 0.14, p: m({ width: 36, height: 9.0, openness: 0.16, smile: 0.28, tongueOut: 0.22, tongueWobble: 0.42, cornerLeft: -0.8, cornerRight: -0.6 }), e: 'outBack' },
    { d: 0.38, p: m({ tongueWobble: 0.58 }), e: 'linear' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tongue_out_silly_wide', name: 'Глупый высунут широко', cat: 'playful', w: 4, frames: [
    { d: 0.12, p: m({ width: 40, height: 10.2, openness: 0.42, tongueOut: 0.48, tongueWobble: 0.18, cornerLeft: 0.2, cornerRight: 0.2, smile: 0.18 }), e: 'outBack' },
    { d: 0.55, p: m({ tongueOut: 0.52, tongueWobble: 0.32 }), e: 'linear' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'lip_pop_bubble_v2', name: 'Пузырь лопнул губами', cat: 'playful', w: 4, frames: [
    { d: 0.12, p: m({ width: 24, height: 10.2, openness: 0.04, lipTight: 0.08 }), e: 'inQuad' },
    { d: 0.08, p: m({ width: 44, openness: 0.18, lipTight: 0.02 }), e: 'outQuad' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'kiss_blow_air', name: 'Воздушный поцелуй', cat: 'playful', w: 6, frames: [
    { d: 0.18, p: m({ width: 22, height: 9.2, openness: 0.04, lipTight: 0.12, cornerLeft: 0.2, cornerRight: 0.2 }), e: 'outQuad' },
    { d: 0.14, p: m({ width: 20, lipTight: 0.18 }), e: 'inQuad' },
    { d: 0.16, p: m({ width: 28, openness: 0.08 }), e: 'outQuad' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'whistle_tune', name: 'Свист мелодия', cat: 'playful', w: 5, frames: [
    { d: 0.16, p: m({ width: 20, height: 8.5, openness: 0.06, lipTight: 0.18, cornerLeft: 0.3, cornerRight: 0.3 }), e: 'outQuad' },
    { d: 0.28, p: m({ width: 22, openness: 0.08 }), e: 'linear' },
    { d: 0.28, p: m({ width: 18, openness: 0.05 }), e: 'linear' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'mock_surprise_gasp_play', name: 'Игровой вздох удивления', cat: 'playful', w: 4, frames: [
    { d: 0.10, p: m({ width: 38, height: 11.2, openness: 0.48, smile: 0.32, cornerLeft: -1.2, cornerRight: -1.2 }), e: 'outBack' },
    { d: 0.42, p: m({ openness: 0.28, smile: 0.38 }), e: 'outQuad' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'daydream_mouth_part', name: 'Мечтательный приоткрыт', cat: 'idle', w: 5, frames: [
    { d: 0.34, p: m({ width: 36, height: 8.8, openness: 0.12, cornerLeft: 0.2, cornerRight: 0.2, lowerDroop: 0.12, innerDark: 0.92 }), e: 'inOutQuad' },
    { d: 1.1, p: m({ openness: 0.09 }), e: 'hold' },
    { d: 0.42, p: m({}), e: 'outQuad' },
  ]},
  { id: 'concentration_tongue_tip', name: 'Концентрация кончик языка', cat: 'idle', w: 4, frames: [
    { d: 0.22, p: m({ width: 32, height: 7.2, openness: 0.08, tongueOut: 0.08, cornerLeft: 0.3, cornerRight: 0.3, lipTight: 0.12 }), e: 'outQuad' },
    { d: 0.75, p: m({ tongueOut: 0.10 }), e: 'hold' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'lip_press_think', name: 'Думает сжал губы', cat: 'idle', w: 6, frames: [
    { d: 0.20, p: m({ width: 32, height: 6.0, openness: 0.01, lipTight: 0.32, cornerLeft: 0.4, cornerRight: 0.4 }), e: 'inQuad' },
    { d: 0.75, p: m({ lipTight: 0.38 }), e: 'hold' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'micro_smile_flicker', name: 'Микроулыбка вспышка', cat: 'idle', w: 7, frames: [
    { d: 0.12, p: m({ width: 36, height: 7.2, smile: 0.28, openness: 0.02, cornerLeft: -0.8, cornerRight: -0.8 }), e: 'outQuad' },
    { d: 0.16, p: m({ smile: 0.08 }), e: 'inQuad' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'breath_nasal_slow_idle', name: 'Дыхание носом медленно', cat: 'idle', w: 5, frames: [
    { d: 0.48, p: m({ width: 34, height: 7.0, openness: 0.03, lowerDroop: 0.06, innerDark: 0.93 }), e: 'inOutQuad' },
    { d: 0.55, p: m({ lowerDroop: 0.02 }), e: 'inOutQuad' },
    { d: 0.42, p: m({}), e: 'outQuad' },
  ]},
  { id: 'swallow_idle', name: 'Сглотнул в покое', cat: 'idle', w: 4, frames: [
    { d: 0.14, p: m({ width: 32, height: 6.8, openness: 0.04, lipTight: 0.22, upperRaise: 0.08 }), e: 'inQuad' },
    { d: 0.18, p: m({ lipTight: 0.28, openness: 0.01 }), e: 'inQuad' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'yawn_small_covert', name: 'Скрытый маленький зевок', cat: 'idle', w: 4, frames: [
    { d: 0.28, p: m({ width: 36, height: 10.0, openness: 0.32, lowerDroop: 0.22, cornerLeft: 0.2, cornerRight: 0.2 }), e: 'inOutQuad' },
    { d: 0.38, p: m({ openness: 0.12 }), e: 'outQuad' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'lip_lick_quick', name: 'Быстро облизнул', cat: 'idle', w: 6, frames: [
    { d: 0.10, p: m({ width: 36, openness: 0.06, tongueOut: 0.12 }), e: 'outQuad' },
    { d: 0.12, p: m({ tongueOut: 0.18, tongueWobble: 0.32 }), e: 'linear' },
    { d: 0.14, p: m({ tongueOut: 0.02 }), e: 'outQuad' },
    { d: 0.26, p: m({}), e: 'outQuad' },
  ]},
  { id: 'savor_eyes_closed_mmm', name: 'Смак глаза закрыты ммм', cat: 'eating', w: 5, frames: [
    { d: 0.22, p: m({ width: 36, height: 8.2, openness: 0.12, smile: 0.32, cornerLeft: -0.9, cornerRight: -0.9, lowerDroop: 0.08 }), e: 'outQuad' },
    { d: 0.32, p: m({ openness: 0.04, smile: 0.36 }), e: 'inQuad' },
    { d: 0.48, p: m({ smile: 0.38 }), e: 'hold' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'chew_side_right', name: 'Жует справа', cat: 'eating', w: 6, frames: [
    { d: 0.14, p: m({ width: 38, height: 8.5, openness: 0.12, cornerLeft: 0.4, cornerRight: -0.6, lowerDroop: 0.14 }), e: 'outQuad' },
    { d: 0.12, p: m({ openness: 0.04, cornerRight: -0.2 }), e: 'inQuad' },
    { d: 0.14, p: m({ openness: 0.13 }), e: 'outQuad' },
    { d: 0.12, p: m({ openness: 0.03 }), e: 'inQuad' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'chew_side_left', name: 'Жует слева', cat: 'eating', w: 6, frames: [
    { d: 0.14, p: m({ width: 38, height: 8.5, openness: 0.12, cornerLeft: -0.6, cornerRight: 0.4, lowerDroop: 0.14 }), e: 'outQuad' },
    { d: 0.12, p: m({ openness: 0.04, cornerLeft: -0.2 }), e: 'inQuad' },
    { d: 0.14, p: m({ openness: 0.13 }), e: 'outQuad' },
    { d: 0.12, p: m({ openness: 0.03 }), e: 'inQuad' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'crunch_crispy_loud', name: 'Хруст громкий', cat: 'eating', w: 4, frames: [
    { d: 0.10, p: m({ width: 40, height: 9.2, openness: 0.28, teethUpper: 0.42, teethLower: 0.18, cornerLeft: 0.1, cornerRight: 0.1 }), e: 'outQuad' },
    { d: 0.12, p: m({ openness: 0.06, teethUpper: 0.22 }), e: 'inQuad' },
    { d: 0.10, p: m({ openness: 0.22 }), e: 'outQuad' },
    { d: 0.28, p: m({}), e: 'outQuad' },
  ]},
  { id: 'slurp_noodle_pull', name: 'Втянул лапшу', cat: 'eating', w: 4, frames: [
    { d: 0.16, p: m({ width: 30, height: 9.5, openness: 0.18, lowerDroop: 0.18, tongueOut: 0.08 }), e: 'outQuad' },
    { d: 0.22, p: m({ width: 26, openness: 0.08, lipTight: 0.14 }), e: 'inQuad' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'lip_smack_after_eat', name: 'Чмок после еды', cat: 'eating', w: 5, frames: [
    { d: 0.12, p: m({ width: 28, height: 6.5, openness: 0.03, lipTight: 0.12 }), e: 'outQuad' },
    { d: 0.10, p: m({ openness: 0.08, lipTight: 0.04 }), e: 'outQuad' },
    { d: 0.12, p: m({ openness: 0.02, lipTight: 0.14 }), e: 'inQuad' },
    { d: 0.28, p: m({}), e: 'outQuad' },
  ]},
  { id: 'greet_warm_wide_social', name: 'Приветствие тёплое широко', cat: 'social', w: 6, frames: [
    { d: 0.16, p: m({ width: 44, height: 9.0, smile: 0.68, openness: 0.14, teethUpper: 0.38, cornerLeft: -1.8, cornerRight: -1.8 }), e: 'outBack' },
    { d: 0.55, p: m({ smile: 0.72 }), e: 'hold' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'whisper_conspire_side', name: 'Шепчет заговор сбоку', cat: 'social', w: 5, frames: [
    { d: 0.18, p: m({ width: 32, height: 7.2, openness: 0.08, cornerLeft: -0.8, cornerRight: 0.9, smile: 0.08, lowerDroop: 0.06 }), e: 'outQuad' },
    { d: 0.55, p: m({ cornerRight: 1.1, openness: 0.06 }), e: 'hold' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'coo_soft_affection', name: 'Воркует мягко', cat: 'social', w: 5, frames: [
    { d: 0.20, p: m({ width: 34, height: 8.2, smile: 0.32, openness: 0.09, cornerLeft: -0.7, cornerRight: -0.7, lowerDroop: 0.08 }), e: 'inOutQuad' },
    { d: 0.50, p: m({ smile: 0.38, openness: 0.06 }), e: 'hold' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'agree_murmur_nod_mouth', name: 'Согласие мычанием', cat: 'social', w: 5, frames: [
    { d: 0.12, p: m({ width: 34, openness: 0.04, smile: 0.18, cornerLeft: -0.5, cornerRight: -0.5 }), e: 'outQuad' },
    { d: 0.10, p: m({ openness: 0.08 }), e: 'inQuad' },
    { d: 0.12, p: m({ openness: 0.02 }), e: 'outQuad' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'bluff_pout_negotiate_v2', name: 'Торг надул губы', cat: 'social', w: 4, frames: [
    { d: 0.20, p: m({ width: 30, height: 9.8, openness: 0.04, lowerDroop: 0.44, upperRaise: 0.08, cornerLeft: 0.4, cornerRight: 0.4, lipTight: 0.06 }), e: 'outBack' },
    { d: 0.52, p: m({ lowerDroop: 0.48 }), e: 'hold' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'apologetic_press_lips', name: 'Виновато сжал губы', cat: 'social', w: 5, frames: [
    { d: 0.18, p: m({ width: 30, height: 5.8, openness: 0.01, lipTight: 0.42, cornerLeft: 1.1, cornerRight: 1.1, smile: -0.08 }), e: 'inQuad' },
    { d: 0.52, p: m({ lipTight: 0.46, cornerLeft: 1.3, cornerRight: 1.3 }), e: 'hold' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'cringe_secondhand', name: 'Кринж испанский стыд', cat: 'rare', w: 3, frames: [
    { d: 0.16, p: m({ width: 36, height: 8.2, smile: -0.12, openness: 0.08, cornerLeft: 1.6, cornerRight: 1.6, upperRaise: 0.18, lowerDroop: 0.14, lipTight: 0.22, quiver: 0.22 }), e: 'outQuad' },
    { d: 0.55, p: m({ upperRaise: 0.24, quiver: 0.32 }), e: 'hold' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'schadenfreude_suppress', name: 'Злорадство подавляет', cat: 'rare', w: 3, frames: [
    { d: 0.16, p: m({ width: 38, height: 7.6, smile: 0.42, openness: 0.04, cornerLeft: -1.4, cornerRight: 0.8, lipTight: 0.22, upperRaise: 0.08 }), e: 'outQuad' },
    { d: 0.14, p: m({ lipTight: 0.32, smile: 0.28 }), e: 'inQuad' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'awe_goosebumps_mouth', name: 'Мурашки трепет рот', cat: 'rare', w: 3, frames: [
    { d: 0.22, p: m({ width: 36, height: 9.8, openness: 0.28, lowerDroop: 0.18, cornerLeft: -0.3, cornerRight: -0.3, quiver: 0.18, innerDark: 0.88 }), e: 'inOutQuad' },
    { d: 0.62, p: m({ openness: 0.22, quiver: 0.28 }), e: 'hold' },
    { d: 0.36, p: m({}), e: 'outQuad' },
  ]},
  { id: 'bittersweet_tears_smile', name: 'Слёзы сквозь улыбку', cat: 'rare', w: 2, frames: [
    { d: 0.20, p: m({ width: 38, height: 8.8, smile: 0.38, openness: 0.12, cornerLeft: -1.1, cornerRight: 1.4, quiver: 0.42, lowerDroop: 0.16, drool: 0.04 }), e: 'outCubic' },
    { d: 0.65, p: m({ smile: 0.32, cornerRight: 1.7, quiver: 0.58 }), e: 'linear' },
    { d: 0.38, p: m({}), e: 'outQuad' },
  ]},
  { id: 'nervous_lip_chew', name: 'Нервно грызёт губу', cat: 'rare', w: 4, frames: [
    { d: 0.14, p: m({ width: 34, height: 7.2, openness: 0.06, teethUpper: 0.18, lowerDroop: 0.08, cornerLeft: 0.6, cornerRight: 0.6, quiver: 0.22 }), e: 'outQuad' },
    { d: 0.18, p: m({ teethUpper: 0.26, lowerDroop: 0.12, quiver: 0.32 }), e: 'linear' },
    { d: 0.22, p: m({ teethUpper: 0.14 }), e: 'outQuad' },
    { d: 0.28, p: m({}), e: 'outQuad' },
  ]},
  { id: 'contempt_sneer_hold', name: 'Презрительная усмешка держит', cat: 'rare', w: 3, frames: [
    { d: 0.18, p: m({ width: 40, height: 7.8, smile: 0.12, openness: 0.04, cornerLeft: -1.9, cornerRight: 1.4, upperRaise: 0.34, lipTight: 0.18 }), e: 'outQuad' },
    { d: 0.68, p: m({ upperRaise: 0.38, cornerRight: 1.7 }), e: 'hold' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'shame_look_away_mouth', name: 'Стыд отвёл взгляд рот', cat: 'rare', w: 4, frames: [
    { d: 0.20, p: m({ width: 32, height: 6.8, smile: -0.18, openness: 0.03, lipTight: 0.28, cornerLeft: 1.2, cornerRight: 1.2, lowerDroop: -0.08 }), e: 'inQuad' },
    { d: 0.55, p: m({ lipTight: 0.34, cornerLeft: 1.45, cornerRight: 1.45 }), e: 'hold' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'excitement_bubble_mouth', name: 'Возбуждение пузырь рта', cat: 'rare', w: 3, frames: [
    { d: 0.11, p: m({ width: 42, height: 10.2, smile: 0.62, openness: 0.28, teethUpper: 0.32, cornerLeft: -1.6, cornerRight: -1.6, quiver: 0.22 }), e: 'outBack' },
    { d: 0.09, p: m({ openness: 0.18, quiver: 0.32 }), e: 'inQuad' },
    { d: 0.11, p: m({ openness: 0.32 }), e: 'outQuad' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'pensive_purse_lips_side', name: 'Задумчиво поджал вбок', cat: 'rare', w: 4, frames: [
    { d: 0.22, p: m({ width: 30, height: 6.2, openness: 0.02, lipTight: 0.28, cornerLeft: 0.8, cornerRight: 0.2, smile: -0.04 }), e: 'outQuad' },
    { d: 0.60, p: m({ lipTight: 0.34, cornerLeft: 1.0 }), e: 'hold' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'flustered_apologize_mumble', name: 'Смущённо бормочет извинение', cat: 'rare', w: 4, frames: [
    { d: 0.10, p: m({ width: 36, height: 7.8, smile: -0.08, openness: 0.14, cornerLeft: 0.9, cornerRight: 0.9, quiver: 0.38, lowerDroop: 0.12 }), e: 'outQuad' },
    { d: 0.08, p: m({ openness: 0.06, quiver: 0.48 }), e: 'inQuad' },
    { d: 0.10, p: m({ openness: 0.12 }), e: 'outQuad' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'relief_exhale_mouth', name: 'Выдох облегчения рот', cat: 'rare', w: 4, frames: [
    { d: 0.18, p: m({ width: 38, height: 9.2, openness: 0.26, smile: 0.22, cornerLeft: -0.7, cornerRight: -0.7, lowerDroop: 0.14 }), e: 'outQuad' },
    { d: 0.32, p: m({ openness: 0.08, smile: 0.28 }), e: 'outQuad' },
    { d: 0.38, p: m({}), e: 'outQuad' },
  ]},
  { id: 'doubt_side_purse', name: 'Сомнение поджал вбок', cat: 'rare', w: 4, frames: [
    { d: 0.20, p: m({ width: 32, height: 6.8, openness: 0.03, lipTight: 0.24, cornerLeft: 1.4, cornerRight: -0.4, smile: -0.06 }), e: 'outQuad' },
    { d: 0.52, p: m({ lipTight: 0.30, cornerLeft: 1.6 }), e: 'hold' },
    { d: 0.30, p: m({}), e: 'outQuad' },
  ]},
  { id: 'anticipation_bite_lip_fast', name: 'Предвкушение кусает быстро', cat: 'rare', w: 3, frames: [
    { d: 0.12, p: m({ width: 34, height: 7.4, openness: 0.08, teethUpper: 0.22, cornerLeft: 0.4, cornerRight: 0.4, smile: 0.18, quiver: 0.18 }), e: 'outQuad' },
    { d: 0.14, p: m({ teethUpper: 0.28, quiver: 0.28 }), e: 'linear' },
    { d: 0.28, p: m({}), e: 'outQuad' },
  ]},
  { id: 'disbelief_mouth_agape_hold', name: 'Неверие рот открыт держит', cat: 'rare', w: 3, frames: [
    { d: 0.16, p: m({ width: 36, height: 11.2, openness: 0.48, cornerLeft: 0.2, cornerRight: 0.2, lowerDroop: 0.22, innerDark: 0.86 }), e: 'outCubic' },
    { d: 0.75, p: m({ openness: 0.42 }), e: 'hold' },
    { d: 0.38, p: m({}), e: 'outQuad' },
  ]},



  // ============================================================
  //  BALL — 100 реалистичных мимик с мячом (одиночная и совместная игра)
  //  Уголки вверх при радости/аззарте, вниз при досаде — анатомия как выше
  // ============================================================
  { id: 'ball_bite_hold_001', name: 'Кусь держит мяч #1', cat: 'ball', w: 5, frames: [
    { d: 0.18, p: m({ width: 41.0, height: 7.9, smile: 0.20, openness: 0.16, teethUpper: 0.57, tongueOut: 0.06, cornerLeft: 0.2, cornerRight: -1.7, upperRaise: 0.20, lowerDroop: 0.02, lipTight: 0.03, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.33, p: m({ smile: 0.16, openness: 0.20, teethUpper: 0.58, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.47, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_toss_up_002', name: 'Подброс вверх ртом #2', cat: 'ball', w: 6, frames: [
    { d: 0.14, p: m({ width: 32.1, height: 10.3, smile: 0.22, openness: 0.38, teethUpper: 0.16, tongueOut: 0.25, cornerLeft: -1.2, cornerRight: -1.1, upperRaise: 0.09, lowerDroop: 0.06, lipTight: 0.15, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.39, p: m({ smile: 0.24, openness: 0.35, teethUpper: 0.11, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.34, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_excited_pant_003', name: 'Взволнованное пыхтит с мячом #3', cat: 'ball', w: 3, frames: [
    { d: 0.13, p: m({ width: 38.9, height: 11.6, smile: 0.60, openness: 0.40, teethUpper: 0.43, tongueOut: 0.21, cornerLeft: -1.9, cornerRight: -2.1, upperRaise: 0.02, lowerDroop: 0.15, lipTight: 0.16, quiver: 0.48, drool: 0.02 }), e: 'outQuad' },
    { d: 0.51, p: m({ smile: 0.64, openness: 0.36, teethUpper: 0.41, quiver: 0.48 }), e: 'inOutQuad' },
    { d: 0.34, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_dribble_tap_004', name: 'Тюкает носом #4', cat: 'ball', w: 6, frames: [
    { d: 0.12, p: m({ width: 33.9, height: 10.1, smile: 0.35, openness: 0.17, teethUpper: 0.11, tongueOut: 0.00, cornerLeft: -1.2, cornerRight: -1.3, upperRaise: 0.11, lowerDroop: 0.02, lipTight: 0.00, quiver: 0.14, drool: 0.04 }), e: 'outQuad' },
    { d: 0.37, p: m({ smile: 0.41, openness: 0.20, teethUpper: 0.06, quiver: 0.14 }), e: 'inOutQuad' },
    { d: 0.43, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_catch_snap_005', name: 'Ловит щелчком #5', cat: 'ball', w: 2, frames: [
    { d: 0.12, p: m({ width: 40.3, height: 7.0, smile: 0.23, openness: 0.40, teethUpper: 0.39, tongueOut: 0.01, cornerLeft: -0.6, cornerRight: -0.1, upperRaise: 0.03, lowerDroop: 0.02, lipTight: 0.06, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.37, p: m({ smile: 0.24, openness: 0.43, teethUpper: 0.35, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_chew_gnaw_006', name: 'Грызёт мяч #6', cat: 'ball', w: 5, frames: [
    { d: 0.21, p: m({ width: 41.1, height: 11.1, smile: 0.09, openness: 0.07, teethUpper: 0.26, tongueOut: 0.06, cornerLeft: 0.1, cornerRight: 0.6, upperRaise: 0.03, lowerDroop: 0.04, lipTight: 0.04, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.51, p: m({ smile: 0.08, openness: 0.04, teethUpper: 0.29, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.38, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_blow_push_007', name: 'Дует толкает #7', cat: 'ball', w: 2, frames: [
    { d: 0.2, p: m({ width: 44.4, height: 7.2, smile: 0.10, openness: 0.15, teethUpper: 0.03, tongueOut: 0.00, cornerLeft: -0.2, cornerRight: 0.0, upperRaise: 0.02, lowerDroop: 0.06, lipTight: 0.17, quiver: 0.01, drool: 0.00 }), e: 'outQuad' },
    { d: 0.38, p: m({ smile: 0.13, openness: 0.12, teethUpper: 0.00, quiver: 0.01 }), e: 'inOutQuad' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_frustrated_growl_008', name: 'Рычит досада мяч #8', cat: 'ball', w: 5, frames: [
    { d: 0.2, p: m({ width: 32.0, height: 11.8, smile: -0.23, openness: 0.16, teethUpper: 0.49, tongueOut: 0.01, cornerLeft: 2.0, cornerRight: 0.3, upperRaise: 0.09, lowerDroop: 0.05, lipTight: 0.05, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.24, p: m({ smile: -0.19, openness: 0.19, teethUpper: 0.44, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_joy_bark_009', name: 'Радостный гав с мячом #9', cat: 'ball', w: 4, frames: [
    { d: 0.12, p: m({ width: 35.7, height: 9.1, smile: 0.69, openness: 0.53, teethUpper: 0.55, tongueOut: 0.15, cornerLeft: -2.5, cornerRight: -2.3, upperRaise: 0.11, lowerDroop: 0.07, lipTight: 0.04, quiver: 0.00, drool: 0.07 }), e: 'outQuad' },
    { d: 0.25, p: m({ smile: 0.73, openness: 0.52, teethUpper: 0.61, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.38, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_focus_stare_010', name: 'Сосредоточен на мяче #10', cat: 'ball', w: 4, frames: [
    { d: 0.22, p: m({ width: 35.3, height: 9.5, smile: 0.07, openness: 0.10, teethUpper: 0.09, tongueOut: 0.00, cornerLeft: -0.4, cornerRight: -0.6, upperRaise: 0.10, lowerDroop: 0.00, lipTight: 0.19, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.51, p: m({ smile: 0.08, openness: 0.11, teethUpper: 0.11, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.28, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_bite_hold_011', name: 'Кусь держит мяч #11', cat: 'ball', w: 2, frames: [
    { d: 0.15, p: m({ width: 39.5, height: 7.2, smile: 0.27, openness: 0.18, teethUpper: 0.51, tongueOut: 0.04, cornerLeft: -0.5, cornerRight: -0.3, upperRaise: 0.16, lowerDroop: 0.10, lipTight: 0.14, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.46, p: m({ smile: 0.28, openness: 0.14, teethUpper: 0.51, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.31, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_toss_up_012', name: 'Подброс вверх ртом #12', cat: 'ball', w: 3, frames: [
    { d: 0.17, p: m({ width: 44.6, height: 8.9, smile: 0.21, openness: 0.43, teethUpper: 0.15, tongueOut: 0.18, cornerLeft: -0.9, cornerRight: -1.1, upperRaise: 0.18, lowerDroop: 0.06, lipTight: 0.09, quiver: 0.24, drool: 0.00 }), e: 'outQuad' },
    { d: 0.52, p: m({ smile: 0.21, openness: 0.41, teethUpper: 0.16, quiver: 0.24 }), e: 'inOutQuad' },
    { d: 0.42, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_excited_pant_013', name: 'Взволнованное пыхтит с мячом #13', cat: 'ball', w: 6, frames: [
    { d: 0.22, p: m({ width: 36.2, height: 8.2, smile: 0.70, openness: 0.36, teethUpper: 0.37, tongueOut: 0.20, cornerLeft: -1.6, cornerRight: -2.1, upperRaise: 0.03, lowerDroop: 0.20, lipTight: 0.17, quiver: 0.00, drool: 0.01 }), e: 'outQuad' },
    { d: 0.29, p: m({ smile: 0.72, openness: 0.37, teethUpper: 0.33, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_dribble_tap_014', name: 'Тюкает носом #14', cat: 'ball', w: 4, frames: [
    { d: 0.16, p: m({ width: 37.2, height: 9.2, smile: 0.37, openness: 0.22, teethUpper: 0.18, tongueOut: 0.04, cornerLeft: -1.2, cornerRight: -1.2, upperRaise: 0.10, lowerDroop: 0.03, lipTight: 0.11, quiver: 0.00, drool: 0.04 }), e: 'outQuad' },
    { d: 0.26, p: m({ smile: 0.39, openness: 0.25, teethUpper: 0.19, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_catch_snap_015', name: 'Ловит щелчком #15', cat: 'ball', w: 3, frames: [
    { d: 0.16, p: m({ width: 42.0, height: 7.1, smile: 0.20, openness: 0.42, teethUpper: 0.40, tongueOut: 0.04, cornerLeft: 0.7, cornerRight: -1.6, upperRaise: 0.13, lowerDroop: 0.11, lipTight: 0.15, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.28, p: m({ smile: 0.17, openness: 0.38, teethUpper: 0.36, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.39, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_chew_gnaw_016', name: 'Грызёт мяч #16', cat: 'ball', w: 6, frames: [
    { d: 0.19, p: m({ width: 35.4, height: 9.0, smile: 0.05, openness: 0.06, teethUpper: 0.23, tongueOut: 0.08, cornerLeft: 0.5, cornerRight: 0.2, upperRaise: 0.02, lowerDroop: 0.07, lipTight: 0.07, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.34, p: m({ smile: 0.08, openness: 0.09, teethUpper: 0.24, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.41, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_blow_push_017', name: 'Дует толкает #17', cat: 'ball', w: 2, frames: [
    { d: 0.19, p: m({ width: 46.4, height: 7.6, smile: 0.04, openness: 0.11, teethUpper: 0.00, tongueOut: 0.00, cornerLeft: 0.2, cornerRight: -0.0, upperRaise: 0.09, lowerDroop: 0.11, lipTight: 0.01, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.49, p: m({ smile: 0.04, openness: 0.15, teethUpper: 0.04, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.43, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_frustrated_growl_018', name: 'Рычит досада мяч #18', cat: 'ball', w: 5, frames: [
    { d: 0.12, p: m({ width: 42.0, height: 8.6, smile: -0.27, openness: 0.19, teethUpper: 0.56, tongueOut: 0.00, cornerLeft: 0.9, cornerRight: 1.0, upperRaise: 0.23, lowerDroop: 0.11, lipTight: 0.09, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.29, p: m({ smile: -0.27, openness: 0.18, teethUpper: 0.55, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_joy_bark_019', name: 'Радостный гав с мячом #19', cat: 'ball', w: 5, frames: [
    { d: 0.18, p: m({ width: 38.6, height: 9.4, smile: 0.74, openness: 0.51, teethUpper: 0.57, tongueOut: 0.15, cornerLeft: -2.0, cornerRight: -2.3, upperRaise: 0.08, lowerDroop: 0.15, lipTight: 0.15, quiver: 0.00, drool: 0.03 }), e: 'outQuad' },
    { d: 0.32, p: m({ smile: 0.80, openness: 0.49, teethUpper: 0.54, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.34, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_focus_stare_020', name: 'Сосредоточен на мяче #20', cat: 'ball', w: 4, frames: [
    { d: 0.19, p: m({ width: 37.4, height: 9.9, smile: 0.05, openness: 0.06, teethUpper: 0.02, tongueOut: 0.04, cornerLeft: -0.3, cornerRight: -0.2, upperRaise: 0.11, lowerDroop: 0.02, lipTight: 0.01, quiver: 0.05, drool: 0.00 }), e: 'outQuad' },
    { d: 0.4, p: m({ smile: 0.10, openness: 0.05, teethUpper: 0.00, quiver: 0.05 }), e: 'inOutQuad' },
    { d: 0.47, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_bite_hold_021', name: 'Кусь держит мяч #21', cat: 'ball', w: 3, frames: [
    { d: 0.15, p: m({ width: 43.2, height: 8.1, smile: 0.23, openness: 0.23, teethUpper: 0.51, tongueOut: 0.07, cornerLeft: -0.8, cornerRight: -0.8, upperRaise: 0.14, lowerDroop: 0.01, lipTight: 0.03, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.33, p: m({ smile: 0.26, openness: 0.20, teethUpper: 0.55, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_toss_up_022', name: 'Подброс вверх ртом #22', cat: 'ball', w: 4, frames: [
    { d: 0.13, p: m({ width: 45.1, height: 8.8, smile: 0.20, openness: 0.46, teethUpper: 0.15, tongueOut: 0.19, cornerLeft: -0.3, cornerRight: -2.1, upperRaise: 0.12, lowerDroop: 0.02, lipTight: 0.11, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.27, p: m({ smile: 0.24, openness: 0.43, teethUpper: 0.13, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.29, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_excited_pant_023', name: 'Взволнованное пыхтит с мячом #23', cat: 'ball', w: 2, frames: [
    { d: 0.19, p: m({ width: 46.4, height: 7.7, smile: 0.57, openness: 0.30, teethUpper: 0.40, tongueOut: 0.15, cornerLeft: -2.0, cornerRight: -1.8, upperRaise: 0.08, lowerDroop: 0.16, lipTight: 0.03, quiver: 0.00, drool: 0.01 }), e: 'outQuad' },
    { d: 0.39, p: m({ smile: 0.62, openness: 0.28, teethUpper: 0.40, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_dribble_tap_024', name: 'Тюкает носом #24', cat: 'ball', w: 6, frames: [
    { d: 0.19, p: m({ width: 38.6, height: 11.8, smile: 0.36, openness: 0.17, teethUpper: 0.14, tongueOut: 0.01, cornerLeft: -0.9, cornerRight: -1.1, upperRaise: 0.02, lowerDroop: 0.10, lipTight: 0.04, quiver: 0.19, drool: 0.06 }), e: 'outQuad' },
    { d: 0.35, p: m({ smile: 0.33, openness: 0.14, teethUpper: 0.09, quiver: 0.19 }), e: 'inOutQuad' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_catch_snap_025', name: 'Ловит щелчком #25', cat: 'ball', w: 5, frames: [
    { d: 0.12, p: m({ width: 35.4, height: 9.0, smile: 0.26, openness: 0.34, teethUpper: 0.32, tongueOut: 0.01, cornerLeft: -0.6, cornerRight: -0.7, upperRaise: 0.04, lowerDroop: 0.05, lipTight: 0.21, quiver: 0.39, drool: 0.00 }), e: 'outQuad' },
    { d: 0.51, p: m({ smile: 0.28, openness: 0.34, teethUpper: 0.32, quiver: 0.39 }), e: 'inOutQuad' },
    { d: 0.46, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_chew_gnaw_026', name: 'Грызёт мяч #26', cat: 'ball', w: 2, frames: [
    { d: 0.13, p: m({ width: 44.9, height: 8.0, smile: -0.03, openness: 0.12, teethUpper: 0.23, tongueOut: 0.05, cornerLeft: 0.3, cornerRight: 0.6, upperRaise: 0.13, lowerDroop: 0.01, lipTight: 0.21, quiver: 0.15, drool: 0.00 }), e: 'outQuad' },
    { d: 0.41, p: m({ smile: -0.08, openness: 0.08, teethUpper: 0.19, quiver: 0.15 }), e: 'inOutQuad' },
    { d: 0.45, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_blow_push_027', name: 'Дует толкает #27', cat: 'ball', w: 6, frames: [
    { d: 0.16, p: m({ width: 39.1, height: 7.3, smile: 0.14, openness: 0.12, teethUpper: 0.05, tongueOut: 0.00, cornerLeft: 0.1, cornerRight: -0.2, upperRaise: 0.09, lowerDroop: 0.00, lipTight: 0.14, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.27, p: m({ smile: 0.14, openness: 0.13, teethUpper: 0.03, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_frustrated_growl_028', name: 'Рычит досада мяч #28', cat: 'ball', w: 6, frames: [
    { d: 0.15, p: m({ width: 46.3, height: 7.6, smile: -0.27, openness: 0.22, teethUpper: 0.51, tongueOut: 0.03, cornerLeft: 1.3, cornerRight: 1.0, upperRaise: 0.29, lowerDroop: 0.06, lipTight: 0.03, quiver: 0.24, drool: 0.00 }), e: 'outQuad' },
    { d: 0.38, p: m({ smile: -0.21, openness: 0.24, teethUpper: 0.51, quiver: 0.24 }), e: 'inOutQuad' },
    { d: 0.29, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_joy_bark_029', name: 'Радостный гав с мячом #29', cat: 'ball', w: 2, frames: [
    { d: 0.16, p: m({ width: 40.0, height: 9.8, smile: 0.66, openness: 0.51, teethUpper: 0.51, tongueOut: 0.09, cornerLeft: -1.5, cornerRight: -3.3, upperRaise: 0.02, lowerDroop: 0.19, lipTight: 0.14, quiver: 0.00, drool: 0.04 }), e: 'outQuad' },
    { d: 0.5, p: m({ smile: 0.68, openness: 0.53, teethUpper: 0.49, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.29, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_focus_stare_030', name: 'Сосредоточен на мяче #30', cat: 'ball', w: 4, frames: [
    { d: 0.21, p: m({ width: 34.6, height: 7.8, smile: 0.03, openness: 0.13, teethUpper: 0.07, tongueOut: 0.02, cornerLeft: -0.3, cornerRight: -0.2, upperRaise: 0.07, lowerDroop: 0.05, lipTight: 0.03, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.39, p: m({ smile: 0.01, openness: 0.13, teethUpper: 0.06, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.29, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_bite_hold_031', name: 'Кусь держит мяч #31', cat: 'ball', w: 3, frames: [
    { d: 0.15, p: m({ width: 37.1, height: 10.9, smile: 0.23, openness: 0.19, teethUpper: 0.50, tongueOut: 0.05, cornerLeft: -0.4, cornerRight: -0.6, upperRaise: 0.24, lowerDroop: 0.07, lipTight: 0.02, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.51, p: m({ smile: 0.25, openness: 0.19, teethUpper: 0.47, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.44, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_toss_up_032', name: 'Подброс вверх ртом #32', cat: 'ball', w: 5, frames: [
    { d: 0.21, p: m({ width: 37.1, height: 11.1, smile: 0.21, openness: 0.46, teethUpper: 0.21, tongueOut: 0.26, cornerLeft: -0.9, cornerRight: -1.0, upperRaise: 0.17, lowerDroop: 0.08, lipTight: 0.05, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.25, p: m({ smile: 0.19, openness: 0.48, teethUpper: 0.27, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.28, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_excited_pant_033', name: 'Взволнованное пыхтит с мячом #33', cat: 'ball', w: 5, frames: [
    { d: 0.15, p: m({ width: 34.9, height: 10.4, smile: 0.53, openness: 0.38, teethUpper: 0.38, tongueOut: 0.14, cornerLeft: -1.9, cornerRight: -1.6, upperRaise: 0.00, lowerDroop: 0.21, lipTight: 0.06, quiver: 0.00, drool: 0.04 }), e: 'outQuad' },
    { d: 0.47, p: m({ smile: 0.50, openness: 0.35, teethUpper: 0.45, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.36, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_dribble_tap_034', name: 'Тюкает носом #34', cat: 'ball', w: 2, frames: [
    { d: 0.18, p: m({ width: 40.3, height: 11.7, smile: 0.29, openness: 0.15, teethUpper: 0.19, tongueOut: 0.02, cornerLeft: -1.0, cornerRight: -1.0, upperRaise: 0.11, lowerDroop: 0.11, lipTight: 0.16, quiver: 0.18, drool: 0.01 }), e: 'outQuad' },
    { d: 0.32, p: m({ smile: 0.25, openness: 0.12, teethUpper: 0.16, quiver: 0.18 }), e: 'inOutQuad' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_catch_snap_035', name: 'Ловит щелчком #35', cat: 'ball', w: 6, frames: [
    { d: 0.22, p: m({ width: 33.8, height: 11.9, smile: 0.17, openness: 0.44, teethUpper: 0.36, tongueOut: 0.05, cornerLeft: -0.5, cornerRight: -0.5, upperRaise: 0.06, lowerDroop: 0.05, lipTight: 0.03, quiver: 0.33, drool: 0.00 }), e: 'outQuad' },
    { d: 0.3, p: m({ smile: 0.20, openness: 0.44, teethUpper: 0.43, quiver: 0.33 }), e: 'inOutQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_chew_gnaw_036', name: 'Грызёт мяч #36', cat: 'ball', w: 5, frames: [
    { d: 0.19, p: m({ width: 44.3, height: 7.1, smile: 0.04, openness: 0.06, teethUpper: 0.19, tongueOut: 0.05, cornerLeft: 0.9, cornerRight: -0.7, upperRaise: 0.10, lowerDroop: 0.06, lipTight: 0.12, quiver: 0.13, drool: 0.00 }), e: 'outQuad' },
    { d: 0.27, p: m({ smile: 0.02, openness: 0.05, teethUpper: 0.11, quiver: 0.13 }), e: 'inOutQuad' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_blow_push_037', name: 'Дует толкает #37', cat: 'ball', w: 3, frames: [
    { d: 0.19, p: m({ width: 40.9, height: 8.0, smile: 0.11, openness: 0.19, teethUpper: 0.00, tongueOut: 0.01, cornerLeft: -0.3, cornerRight: -0.1, upperRaise: 0.08, lowerDroop: 0.10, lipTight: 0.07, quiver: 0.02, drool: 0.00 }), e: 'outQuad' },
    { d: 0.26, p: m({ smile: 0.16, openness: 0.22, teethUpper: 0.04, quiver: 0.02 }), e: 'inOutQuad' },
    { d: 0.36, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_frustrated_growl_038', name: 'Рычит досада мяч #38', cat: 'ball', w: 3, frames: [
    { d: 0.19, p: m({ width: 46.2, height: 9.5, smile: -0.16, openness: 0.16, teethUpper: 0.51, tongueOut: 0.00, cornerLeft: 1.4, cornerRight: 0.9, upperRaise: 0.28, lowerDroop: 0.05, lipTight: 0.17, quiver: 0.17, drool: 0.00 }), e: 'outQuad' },
    { d: 0.31, p: m({ smile: -0.21, openness: 0.14, teethUpper: 0.52, quiver: 0.17 }), e: 'inOutQuad' },
    { d: 0.33, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_joy_bark_039', name: 'Радостный гав с мячом #39', cat: 'ball', w: 2, frames: [
    { d: 0.19, p: m({ width: 47.9, height: 7.0, smile: 0.75, openness: 0.42, teethUpper: 0.50, tongueOut: 0.10, cornerLeft: -2.5, cornerRight: -2.3, upperRaise: 0.04, lowerDroop: 0.08, lipTight: 0.06, quiver: 0.40, drool: 0.06 }), e: 'outQuad' },
    { d: 0.26, p: m({ smile: 0.72, openness: 0.45, teethUpper: 0.49, quiver: 0.40 }), e: 'inOutQuad' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_focus_stare_040', name: 'Сосредоточен на мяче #40', cat: 'ball', w: 6, frames: [
    { d: 0.15, p: m({ width: 32.6, height: 10.4, smile: 0.14, openness: 0.16, teethUpper: 0.06, tongueOut: 0.05, cornerLeft: -0.3, cornerRight: -0.4, upperRaise: 0.11, lowerDroop: 0.01, lipTight: 0.02, quiver: 0.06, drool: 0.00 }), e: 'outQuad' },
    { d: 0.51, p: m({ smile: 0.18, openness: 0.17, teethUpper: 0.10, quiver: 0.06 }), e: 'inOutQuad' },
    { d: 0.33, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_bite_hold_041', name: 'Кусь держит мяч #41', cat: 'ball', w: 2, frames: [
    { d: 0.15, p: m({ width: 37.2, height: 9.3, smile: 0.25, openness: 0.23, teethUpper: 0.54, tongueOut: 0.07, cornerLeft: -0.5, cornerRight: -0.4, upperRaise: 0.27, lowerDroop: 0.09, lipTight: 0.15, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.28, p: m({ smile: 0.29, openness: 0.21, teethUpper: 0.53, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_toss_up_042', name: 'Подброс вверх ртом #42', cat: 'ball', w: 6, frames: [
    { d: 0.21, p: m({ width: 43.8, height: 7.5, smile: 0.36, openness: 0.42, teethUpper: 0.22, tongueOut: 0.22, cornerLeft: -0.8, cornerRight: -1.1, upperRaise: 0.25, lowerDroop: 0.11, lipTight: 0.17, quiver: 0.31, drool: 0.00 }), e: 'outQuad' },
    { d: 0.34, p: m({ smile: 0.36, openness: 0.44, teethUpper: 0.22, quiver: 0.31 }), e: 'inOutQuad' },
    { d: 0.47, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_excited_pant_043', name: 'Взволнованное пыхтит с мячом #43', cat: 'ball', w: 2, frames: [
    { d: 0.22, p: m({ width: 32.8, height: 11.4, smile: 0.53, openness: 0.38, teethUpper: 0.38, tongueOut: 0.18, cornerLeft: -1.2, cornerRight: -2.7, upperRaise: 0.11, lowerDroop: 0.22, lipTight: 0.17, quiver: 0.25, drool: 0.06 }), e: 'outQuad' },
    { d: 0.44, p: m({ smile: 0.56, openness: 0.35, teethUpper: 0.42, quiver: 0.25 }), e: 'inOutQuad' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_dribble_tap_044', name: 'Тюкает носом #44', cat: 'ball', w: 3, frames: [
    { d: 0.2, p: m({ width: 47.3, height: 10.2, smile: 0.38, openness: 0.22, teethUpper: 0.25, tongueOut: 0.00, cornerLeft: -1.0, cornerRight: -0.9, upperRaise: 0.12, lowerDroop: 0.05, lipTight: 0.20, quiver: 0.00, drool: 0.07 }), e: 'outQuad' },
    { d: 0.29, p: m({ smile: 0.44, openness: 0.24, teethUpper: 0.27, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.31, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_catch_snap_045', name: 'Ловит щелчком #45', cat: 'ball', w: 6, frames: [
    { d: 0.16, p: m({ width: 34.0, height: 11.6, smile: 0.23, openness: 0.40, teethUpper: 0.32, tongueOut: 0.00, cornerLeft: -0.5, cornerRight: -0.1, upperRaise: 0.07, lowerDroop: 0.03, lipTight: 0.10, quiver: 0.25, drool: 0.00 }), e: 'outQuad' },
    { d: 0.35, p: m({ smile: 0.20, openness: 0.43, teethUpper: 0.28, quiver: 0.25 }), e: 'inOutQuad' },
    { d: 0.34, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_chew_gnaw_046', name: 'Грызёт мяч #46', cat: 'ball', w: 4, frames: [
    { d: 0.19, p: m({ width: 34.2, height: 11.1, smile: 0.08, openness: 0.17, teethUpper: 0.21, tongueOut: 0.10, cornerLeft: 0.0, cornerRight: 0.5, upperRaise: 0.12, lowerDroop: 0.03, lipTight: 0.06, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.46, p: m({ smile: 0.05, openness: 0.14, teethUpper: 0.17, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.41, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_blow_push_047', name: 'Дует толкает #47', cat: 'ball', w: 6, frames: [
    { d: 0.16, p: m({ width: 33.9, height: 8.0, smile: 0.06, openness: 0.14, teethUpper: 0.00, tongueOut: 0.00, cornerLeft: -0.2, cornerRight: 0.3, upperRaise: 0.14, lowerDroop: 0.03, lipTight: 0.19, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.26, p: m({ smile: 0.01, openness: 0.17, teethUpper: 0.00, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_frustrated_growl_048', name: 'Рычит досада мяч #48', cat: 'ball', w: 2, frames: [
    { d: 0.13, p: m({ width: 36.8, height: 8.5, smile: -0.18, openness: 0.18, teethUpper: 0.45, tongueOut: 0.01, cornerLeft: 1.5, cornerRight: 1.2, upperRaise: 0.12, lowerDroop: 0.04, lipTight: 0.04, quiver: 0.21, drool: 0.00 }), e: 'outQuad' },
    { d: 0.35, p: m({ smile: -0.15, openness: 0.22, teethUpper: 0.51, quiver: 0.21 }), e: 'inOutQuad' },
    { d: 0.48, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_joy_bark_049', name: 'Радостный гав с мячом #49', cat: 'ball', w: 4, frames: [
    { d: 0.2, p: m({ width: 46.7, height: 7.4, smile: 0.63, openness: 0.44, teethUpper: 0.53, tongueOut: 0.16, cornerLeft: -2.5, cornerRight: -2.5, upperRaise: 0.10, lowerDroop: 0.09, lipTight: 0.16, quiver: 0.71, drool: 0.07 }), e: 'outQuad' },
    { d: 0.33, p: m({ smile: 0.68, openness: 0.44, teethUpper: 0.52, quiver: 0.71 }), e: 'inOutQuad' },
    { d: 0.37, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_focus_stare_050', name: 'Сосредоточен на мяче #50', cat: 'ball', w: 4, frames: [
    { d: 0.16, p: m({ width: 32.1, height: 9.1, smile: 0.05, openness: 0.14, teethUpper: 0.10, tongueOut: 0.02, cornerLeft: 0.8, cornerRight: -1.4, upperRaise: 0.05, lowerDroop: 0.01, lipTight: 0.15, quiver: 0.11, drool: 0.00 }), e: 'outQuad' },
    { d: 0.34, p: m({ smile: 0.09, openness: 0.10, teethUpper: 0.11, quiver: 0.11 }), e: 'inOutQuad' },
    { d: 0.29, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_bite_hold_051', name: 'Кусь держит мяч #51', cat: 'ball', w: 3, frames: [
    { d: 0.15, p: m({ width: 46.1, height: 11.7, smile: 0.22, openness: 0.22, teethUpper: 0.48, tongueOut: 0.10, cornerLeft: -0.3, cornerRight: -0.7, upperRaise: 0.22, lowerDroop: 0.03, lipTight: 0.19, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.45, p: m({ smile: 0.17, openness: 0.24, teethUpper: 0.56, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.39, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_toss_up_052', name: 'Подброс вверх ртом #52', cat: 'ball', w: 3, frames: [
    { d: 0.18, p: m({ width: 42.6, height: 11.6, smile: 0.26, openness: 0.45, teethUpper: 0.19, tongueOut: 0.19, cornerLeft: -1.2, cornerRight: -1.4, upperRaise: 0.11, lowerDroop: 0.04, lipTight: 0.21, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.5, p: m({ smile: 0.32, openness: 0.43, teethUpper: 0.22, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.47, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_excited_pant_053', name: 'Взволнованное пыхтит с мячом #53', cat: 'ball', w: 3, frames: [
    { d: 0.16, p: m({ width: 34.8, height: 8.4, smile: 0.71, openness: 0.35, teethUpper: 0.37, tongueOut: 0.18, cornerLeft: -1.8, cornerRight: -1.6, upperRaise: 0.03, lowerDroop: 0.16, lipTight: 0.01, quiver: 0.26, drool: 0.04 }), e: 'outQuad' },
    { d: 0.3, p: m({ smile: 0.68, openness: 0.35, teethUpper: 0.33, quiver: 0.26 }), e: 'inOutQuad' },
    { d: 0.33, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_dribble_tap_054', name: 'Тюкает носом #54', cat: 'ball', w: 2, frames: [
    { d: 0.17, p: m({ width: 47.9, height: 11.0, smile: 0.34, openness: 0.18, teethUpper: 0.24, tongueOut: 0.06, cornerLeft: -1.0, cornerRight: -1.3, upperRaise: 0.09, lowerDroop: 0.05, lipTight: 0.01, quiver: 0.00, drool: 0.01 }), e: 'outQuad' },
    { d: 0.31, p: m({ smile: 0.36, openness: 0.22, teethUpper: 0.17, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.38, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_catch_snap_055', name: 'Ловит щелчком #55', cat: 'ball', w: 3, frames: [
    { d: 0.2, p: m({ width: 32.6, height: 11.3, smile: 0.20, openness: 0.34, teethUpper: 0.41, tongueOut: 0.03, cornerLeft: -0.3, cornerRight: -0.6, upperRaise: 0.02, lowerDroop: 0.08, lipTight: 0.18, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.45, p: m({ smile: 0.19, openness: 0.38, teethUpper: 0.48, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.44, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_chew_gnaw_056', name: 'Грызёт мяч #56', cat: 'ball', w: 2, frames: [
    { d: 0.12, p: m({ width: 35.0, height: 10.6, smile: 0.11, openness: 0.13, teethUpper: 0.16, tongueOut: 0.07, cornerLeft: 0.3, cornerRight: -0.0, upperRaise: 0.04, lowerDroop: 0.10, lipTight: 0.14, quiver: 0.14, drool: 0.00 }), e: 'outQuad' },
    { d: 0.48, p: m({ smile: 0.17, openness: 0.09, teethUpper: 0.21, quiver: 0.14 }), e: 'inOutQuad' },
    { d: 0.34, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_blow_push_057', name: 'Дует толкает #57', cat: 'ball', w: 4, frames: [
    { d: 0.18, p: m({ width: 45.5, height: 9.3, smile: 0.08, openness: 0.18, teethUpper: 0.00, tongueOut: 0.00, cornerLeft: 1.0, cornerRight: -1.2, upperRaise: 0.10, lowerDroop: 0.10, lipTight: 0.02, quiver: 0.03, drool: 0.00 }), e: 'outQuad' },
    { d: 0.36, p: m({ smile: 0.04, openness: 0.16, teethUpper: 0.00, quiver: 0.03 }), e: 'inOutQuad' },
    { d: 0.34, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_frustrated_growl_058', name: 'Рычит досада мяч #58', cat: 'ball', w: 3, frames: [
    { d: 0.18, p: m({ width: 33.7, height: 9.2, smile: -0.28, openness: 0.23, teethUpper: 0.48, tongueOut: 0.00, cornerLeft: 1.1, cornerRight: 0.9, upperRaise: 0.16, lowerDroop: 0.09, lipTight: 0.12, quiver: 0.11, drool: 0.00 }), e: 'outQuad' },
    { d: 0.34, p: m({ smile: -0.25, openness: 0.26, teethUpper: 0.55, quiver: 0.11 }), e: 'inOutQuad' },
    { d: 0.34, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_joy_bark_059', name: 'Радостный гав с мячом #59', cat: 'ball', w: 3, frames: [
    { d: 0.19, p: m({ width: 42.6, height: 8.6, smile: 0.74, openness: 0.54, teethUpper: 0.47, tongueOut: 0.13, cornerLeft: -2.1, cornerRight: -2.2, upperRaise: 0.05, lowerDroop: 0.07, lipTight: 0.00, quiver: 0.00, drool: 0.07 }), e: 'outQuad' },
    { d: 0.41, p: m({ smile: 0.78, openness: 0.51, teethUpper: 0.45, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.28, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_focus_stare_060', name: 'Сосредоточен на мяче #60', cat: 'ball', w: 5, frames: [
    { d: 0.16, p: m({ width: 41.0, height: 11.6, smile: 0.14, openness: 0.16, teethUpper: 0.12, tongueOut: 0.06, cornerLeft: -0.5, cornerRight: -0.6, upperRaise: 0.03, lowerDroop: 0.03, lipTight: 0.17, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.29, p: m({ smile: 0.19, openness: 0.12, teethUpper: 0.19, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.46, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_bite_hold_061', name: 'Кусь держит мяч #61', cat: 'ball', w: 3, frames: [
    { d: 0.2, p: m({ width: 36.3, height: 8.3, smile: 0.18, openness: 0.20, teethUpper: 0.48, tongueOut: 0.06, cornerLeft: -0.4, cornerRight: -0.6, upperRaise: 0.15, lowerDroop: 0.04, lipTight: 0.20, quiver: 0.19, drool: 0.00 }), e: 'outQuad' },
    { d: 0.49, p: m({ smile: 0.14, openness: 0.19, teethUpper: 0.53, quiver: 0.19 }), e: 'inOutQuad' },
    { d: 0.32, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_toss_up_062', name: 'Подброс вверх ртом #62', cat: 'ball', w: 6, frames: [
    { d: 0.17, p: m({ width: 40.1, height: 8.0, smile: 0.36, openness: 0.41, teethUpper: 0.16, tongueOut: 0.18, cornerLeft: -0.9, cornerRight: -1.2, upperRaise: 0.12, lowerDroop: 0.03, lipTight: 0.02, quiver: 0.26, drool: 0.00 }), e: 'outQuad' },
    { d: 0.3, p: m({ smile: 0.40, openness: 0.43, teethUpper: 0.08, quiver: 0.26 }), e: 'inOutQuad' },
    { d: 0.47, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_excited_pant_063', name: 'Взволнованное пыхтит с мячом #63', cat: 'ball', w: 2, frames: [
    { d: 0.21, p: m({ width: 44.1, height: 11.1, smile: 0.54, openness: 0.38, teethUpper: 0.37, tongueOut: 0.15, cornerLeft: -1.6, cornerRight: -2.1, upperRaise: 0.08, lowerDroop: 0.23, lipTight: 0.16, quiver: 0.00, drool: 0.06 }), e: 'outQuad' },
    { d: 0.43, p: m({ smile: 0.52, openness: 0.41, teethUpper: 0.35, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.31, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_dribble_tap_064', name: 'Тюкает носом #64', cat: 'ball', w: 4, frames: [
    { d: 0.13, p: m({ width: 36.7, height: 10.6, smile: 0.44, openness: 0.15, teethUpper: 0.17, tongueOut: 0.03, cornerLeft: -0.3, cornerRight: -2.3, upperRaise: 0.01, lowerDroop: 0.04, lipTight: 0.22, quiver: 0.00, drool: 0.04 }), e: 'outQuad' },
    { d: 0.4, p: m({ smile: 0.39, openness: 0.15, teethUpper: 0.10, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.38, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_catch_snap_065', name: 'Ловит щелчком #65', cat: 'ball', w: 5, frames: [
    { d: 0.2, p: m({ width: 36.0, height: 8.0, smile: 0.10, openness: 0.36, teethUpper: 0.32, tongueOut: 0.02, cornerLeft: -0.4, cornerRight: -0.3, upperRaise: 0.14, lowerDroop: 0.06, lipTight: 0.02, quiver: 0.21, drool: 0.00 }), e: 'outQuad' },
    { d: 0.26, p: m({ smile: 0.15, openness: 0.37, teethUpper: 0.24, quiver: 0.21 }), e: 'inOutQuad' },
    { d: 0.34, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_chew_gnaw_066', name: 'Грызёт мяч #66', cat: 'ball', w: 4, frames: [
    { d: 0.17, p: m({ width: 35.2, height: 7.2, smile: 0.06, openness: 0.07, teethUpper: 0.29, tongueOut: 0.03, cornerLeft: 0.3, cornerRight: 0.6, upperRaise: 0.08, lowerDroop: 0.03, lipTight: 0.20, quiver: 0.15, drool: 0.00 }), e: 'outQuad' },
    { d: 0.25, p: m({ smile: 0.11, openness: 0.09, teethUpper: 0.21, quiver: 0.15 }), e: 'inOutQuad' },
    { d: 0.34, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_blow_push_067', name: 'Дует толкает #67', cat: 'ball', w: 5, frames: [
    { d: 0.21, p: m({ width: 44.3, height: 10.0, smile: 0.07, openness: 0.09, teethUpper: 0.00, tongueOut: 0.04, cornerLeft: 0.0, cornerRight: 0.3, upperRaise: 0.06, lowerDroop: 0.04, lipTight: 0.05, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.36, p: m({ smile: 0.12, openness: 0.06, teethUpper: 0.00, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.45, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_frustrated_growl_068', name: 'Рычит досада мяч #68', cat: 'ball', w: 2, frames: [
    { d: 0.17, p: m({ width: 36.6, height: 9.3, smile: -0.25, openness: 0.14, teethUpper: 0.54, tongueOut: 0.00, cornerLeft: 0.9, cornerRight: 1.4, upperRaise: 0.23, lowerDroop: 0.10, lipTight: 0.20, quiver: 0.23, drool: 0.00 }), e: 'outQuad' },
    { d: 0.34, p: m({ smile: -0.25, openness: 0.14, teethUpper: 0.52, quiver: 0.23 }), e: 'inOutQuad' },
    { d: 0.37, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_joy_bark_069', name: 'Радостный гав с мячом #69', cat: 'ball', w: 5, frames: [
    { d: 0.19, p: m({ width: 39.0, height: 10.5, smile: 0.65, openness: 0.49, teethUpper: 0.49, tongueOut: 0.12, cornerLeft: -1.9, cornerRight: -2.3, upperRaise: 0.06, lowerDroop: 0.19, lipTight: 0.02, quiver: 0.00, drool: 0.04 }), e: 'outQuad' },
    { d: 0.49, p: m({ smile: 0.69, openness: 0.47, teethUpper: 0.45, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.43, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_focus_stare_070', name: 'Сосредоточен на мяче #70', cat: 'ball', w: 4, frames: [
    { d: 0.18, p: m({ width: 45.7, height: 8.6, smile: 0.18, openness: 0.13, teethUpper: 0.09, tongueOut: 0.00, cornerLeft: -0.4, cornerRight: -0.2, upperRaise: 0.02, lowerDroop: 0.11, lipTight: 0.02, quiver: 0.05, drool: 0.00 }), e: 'outQuad' },
    { d: 0.23, p: m({ smile: 0.24, openness: 0.12, teethUpper: 0.03, quiver: 0.05 }), e: 'inOutQuad' },
    { d: 0.41, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_bite_hold_071', name: 'Кусь держит мяч #71', cat: 'ball', w: 2, frames: [
    { d: 0.13, p: m({ width: 33.8, height: 8.8, smile: 0.14, openness: 0.24, teethUpper: 0.49, tongueOut: 0.10, cornerLeft: -0.0, cornerRight: -1.8, upperRaise: 0.15, lowerDroop: 0.06, lipTight: 0.05, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.38, p: m({ smile: 0.14, openness: 0.23, teethUpper: 0.45, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.29, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_toss_up_072', name: 'Подброс вверх ртом #72', cat: 'ball', w: 4, frames: [
    { d: 0.18, p: m({ width: 32.7, height: 9.5, smile: 0.32, openness: 0.37, teethUpper: 0.22, tongueOut: 0.22, cornerLeft: -1.1, cornerRight: -0.8, upperRaise: 0.09, lowerDroop: 0.01, lipTight: 0.11, quiver: 0.25, drool: 0.00 }), e: 'outQuad' },
    { d: 0.45, p: m({ smile: 0.27, openness: 0.41, teethUpper: 0.26, quiver: 0.25 }), e: 'inOutQuad' },
    { d: 0.28, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_excited_pant_073', name: 'Взволнованное пыхтит с мячом #73', cat: 'ball', w: 4, frames: [
    { d: 0.12, p: m({ width: 42.8, height: 11.9, smile: 0.62, openness: 0.39, teethUpper: 0.48, tongueOut: 0.18, cornerLeft: -1.6, cornerRight: -1.6, upperRaise: 0.14, lowerDroop: 0.20, lipTight: 0.06, quiver: 0.00, drool: 0.05 }), e: 'outQuad' },
    { d: 0.29, p: m({ smile: 0.67, openness: 0.42, teethUpper: 0.49, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.34, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_dribble_tap_074', name: 'Тюкает носом #74', cat: 'ball', w: 3, frames: [
    { d: 0.15, p: m({ width: 44.9, height: 9.3, smile: 0.35, openness: 0.22, teethUpper: 0.24, tongueOut: 0.06, cornerLeft: -1.4, cornerRight: -1.0, upperRaise: 0.05, lowerDroop: 0.04, lipTight: 0.20, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.5, p: m({ smile: 0.40, openness: 0.25, teethUpper: 0.19, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.48, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_catch_snap_075', name: 'Ловит щелчком #75', cat: 'ball', w: 4, frames: [
    { d: 0.14, p: m({ width: 40.2, height: 10.4, smile: 0.19, openness: 0.38, teethUpper: 0.43, tongueOut: 0.03, cornerLeft: -0.2, cornerRight: -0.1, upperRaise: 0.02, lowerDroop: 0.08, lipTight: 0.22, quiver: 0.30, drool: 0.00 }), e: 'outQuad' },
    { d: 0.25, p: m({ smile: 0.23, openness: 0.39, teethUpper: 0.50, quiver: 0.30 }), e: 'inOutQuad' },
    { d: 0.44, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_chew_gnaw_076', name: 'Грызёт мяч #76', cat: 'ball', w: 2, frames: [
    { d: 0.2, p: m({ width: 43.0, height: 8.8, smile: 0.02, openness: 0.10, teethUpper: 0.25, tongueOut: 0.07, cornerLeft: 0.2, cornerRight: 0.5, upperRaise: 0.02, lowerDroop: 0.09, lipTight: 0.05, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.28, p: m({ smile: 0.02, openness: 0.14, teethUpper: 0.21, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.47, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_blow_push_077', name: 'Дует толкает #77', cat: 'ball', w: 3, frames: [
    { d: 0.17, p: m({ width: 47.4, height: 9.9, smile: 0.08, openness: 0.14, teethUpper: 0.00, tongueOut: 0.00, cornerLeft: -0.2, cornerRight: 0.2, upperRaise: 0.11, lowerDroop: 0.01, lipTight: 0.15, quiver: 0.02, drool: 0.00 }), e: 'outQuad' },
    { d: 0.34, p: m({ smile: 0.10, openness: 0.18, teethUpper: 0.03, quiver: 0.02 }), e: 'inOutQuad' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_frustrated_growl_078', name: 'Рычит досада мяч #78', cat: 'ball', w: 4, frames: [
    { d: 0.21, p: m({ width: 41.6, height: 9.7, smile: -0.22, openness: 0.22, teethUpper: 0.54, tongueOut: 0.00, cornerLeft: 1.8, cornerRight: 0.4, upperRaise: 0.18, lowerDroop: 0.12, lipTight: 0.00, quiver: 0.19, drool: 0.00 }), e: 'outQuad' },
    { d: 0.26, p: m({ smile: -0.27, openness: 0.24, teethUpper: 0.47, quiver: 0.19 }), e: 'inOutQuad' },
    { d: 0.34, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_joy_bark_079', name: 'Радостный гав с мячом #79', cat: 'ball', w: 4, frames: [
    { d: 0.2, p: m({ width: 39.1, height: 10.3, smile: 0.75, openness: 0.43, teethUpper: 0.55, tongueOut: 0.14, cornerLeft: -2.0, cornerRight: -2.3, upperRaise: 0.09, lowerDroop: 0.24, lipTight: 0.19, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.31, p: m({ smile: 0.80, openness: 0.40, teethUpper: 0.62, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.33, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_focus_stare_080', name: 'Сосредоточен на мяче #80', cat: 'ball', w: 4, frames: [
    { d: 0.16, p: m({ width: 40.4, height: 11.4, smile: 0.14, openness: 0.13, teethUpper: 0.05, tongueOut: 0.05, cornerLeft: -0.5, cornerRight: -0.5, upperRaise: 0.08, lowerDroop: 0.07, lipTight: 0.10, quiver: 0.10, drool: 0.00 }), e: 'outQuad' },
    { d: 0.34, p: m({ smile: 0.11, openness: 0.10, teethUpper: 0.08, quiver: 0.10 }), e: 'inOutQuad' },
    { d: 0.48, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_bite_hold_081', name: 'Кусь держит мяч #81', cat: 'ball', w: 3, frames: [
    { d: 0.16, p: m({ width: 47.3, height: 9.2, smile: 0.19, openness: 0.26, teethUpper: 0.54, tongueOut: 0.08, cornerLeft: -0.6, cornerRight: -0.3, upperRaise: 0.20, lowerDroop: 0.01, lipTight: 0.10, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.45, p: m({ smile: 0.14, openness: 0.27, teethUpper: 0.56, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.43, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_toss_up_082', name: 'Подброс вверх ртом #82', cat: 'ball', w: 2, frames: [
    { d: 0.2, p: m({ width: 36.6, height: 7.5, smile: 0.24, openness: 0.47, teethUpper: 0.16, tongueOut: 0.22, cornerLeft: -1.3, cornerRight: -1.1, upperRaise: 0.17, lowerDroop: 0.11, lipTight: 0.02, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.41, p: m({ smile: 0.24, openness: 0.47, teethUpper: 0.11, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_excited_pant_083', name: 'Взволнованное пыхтит с мячом #83', cat: 'ball', w: 5, frames: [
    { d: 0.13, p: m({ width: 47.9, height: 10.1, smile: 0.56, openness: 0.35, teethUpper: 0.35, tongueOut: 0.16, cornerLeft: -2.1, cornerRight: -2.0, upperRaise: 0.03, lowerDroop: 0.22, lipTight: 0.05, quiver: 0.31, drool: 0.04 }), e: 'outQuad' },
    { d: 0.46, p: m({ smile: 0.59, openness: 0.36, teethUpper: 0.35, quiver: 0.31 }), e: 'inOutQuad' },
    { d: 0.43, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_dribble_tap_084', name: 'Тюкает носом #84', cat: 'ball', w: 4, frames: [
    { d: 0.14, p: m({ width: 39.9, height: 7.8, smile: 0.40, openness: 0.15, teethUpper: 0.21, tongueOut: 0.05, cornerLeft: -0.9, cornerRight: -1.2, upperRaise: 0.03, lowerDroop: 0.10, lipTight: 0.10, quiver: 0.00, drool: 0.08 }), e: 'outQuad' },
    { d: 0.3, p: m({ smile: 0.44, openness: 0.12, teethUpper: 0.28, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.47, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_catch_snap_085', name: 'Ловит щелчком #85', cat: 'ball', w: 3, frames: [
    { d: 0.21, p: m({ width: 47.0, height: 11.0, smile: 0.21, openness: 0.42, teethUpper: 0.31, tongueOut: 0.02, cornerLeft: 0.8, cornerRight: -1.0, upperRaise: 0.12, lowerDroop: 0.01, lipTight: 0.22, quiver: 0.37, drool: 0.00 }), e: 'outQuad' },
    { d: 0.51, p: m({ smile: 0.15, openness: 0.41, teethUpper: 0.35, quiver: 0.37 }), e: 'inOutQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_chew_gnaw_086', name: 'Грызёт мяч #86', cat: 'ball', w: 4, frames: [
    { d: 0.17, p: m({ width: 43.4, height: 7.2, smile: 0.04, openness: 0.09, teethUpper: 0.29, tongueOut: 0.06, cornerLeft: 0.0, cornerRight: 0.5, upperRaise: 0.05, lowerDroop: 0.11, lipTight: 0.01, quiver: 0.14, drool: 0.00 }), e: 'outQuad' },
    { d: 0.37, p: m({ smile: -0.01, openness: 0.10, teethUpper: 0.36, quiver: 0.14 }), e: 'inOutQuad' },
    { d: 0.34, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_blow_push_087', name: 'Дует толкает #87', cat: 'ball', w: 3, frames: [
    { d: 0.2, p: m({ width: 47.9, height: 7.2, smile: 0.12, openness: 0.20, teethUpper: 0.05, tongueOut: 0.01, cornerLeft: -0.2, cornerRight: -0.2, upperRaise: 0.01, lowerDroop: 0.01, lipTight: 0.10, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.36, p: m({ smile: 0.07, openness: 0.20, teethUpper: 0.09, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.37, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_frustrated_growl_088', name: 'Рычит досада мяч #88', cat: 'ball', w: 5, frames: [
    { d: 0.13, p: m({ width: 45.2, height: 7.9, smile: -0.13, openness: 0.21, teethUpper: 0.52, tongueOut: 0.00, cornerLeft: 1.2, cornerRight: 1.4, upperRaise: 0.22, lowerDroop: 0.09, lipTight: 0.06, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.41, p: m({ smile: -0.12, openness: 0.25, teethUpper: 0.56, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.43, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_joy_bark_089', name: 'Радостный гав с мячом #89', cat: 'ball', w: 5, frames: [
    { d: 0.2, p: m({ width: 40.1, height: 7.2, smile: 0.81, openness: 0.48, teethUpper: 0.51, tongueOut: 0.16, cornerLeft: -2.1, cornerRight: -2.2, upperRaise: 0.06, lowerDroop: 0.19, lipTight: 0.21, quiver: 0.00, drool: 0.04 }), e: 'outQuad' },
    { d: 0.44, p: m({ smile: 0.83, openness: 0.50, teethUpper: 0.43, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.41, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_focus_stare_090', name: 'Сосредоточен на мяче #90', cat: 'ball', w: 5, frames: [
    { d: 0.22, p: m({ width: 34.3, height: 11.7, smile: 0.19, openness: 0.06, teethUpper: 0.11, tongueOut: 0.00, cornerLeft: -0.7, cornerRight: -0.5, upperRaise: 0.02, lowerDroop: 0.06, lipTight: 0.13, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.45, p: m({ smile: 0.23, openness: 0.06, teethUpper: 0.15, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.39, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_bite_hold_091', name: 'Кусь держит мяч #91', cat: 'ball', w: 2, frames: [
    { d: 0.22, p: m({ width: 43.3, height: 7.8, smile: 0.20, openness: 0.27, teethUpper: 0.55, tongueOut: 0.05, cornerLeft: -0.9, cornerRight: -0.4, upperRaise: 0.09, lowerDroop: 0.01, lipTight: 0.16, quiver: 0.29, drool: 0.00 }), e: 'outQuad' },
    { d: 0.26, p: m({ smile: 0.23, openness: 0.25, teethUpper: 0.55, quiver: 0.29 }), e: 'inOutQuad' },
    { d: 0.47, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_toss_up_092', name: 'Подброс вверх ртом #92', cat: 'ball', w: 4, frames: [
    { d: 0.14, p: m({ width: 41.9, height: 11.7, smile: 0.37, openness: 0.38, teethUpper: 0.19, tongueOut: 0.24, cornerLeft: -0.3, cornerRight: -2.0, upperRaise: 0.28, lowerDroop: 0.03, lipTight: 0.01, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.37, p: m({ smile: 0.37, openness: 0.41, teethUpper: 0.21, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.37, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_excited_pant_093', name: 'Взволнованное пыхтит с мячом #93', cat: 'ball', w: 2, frames: [
    { d: 0.22, p: m({ width: 46.2, height: 11.5, smile: 0.62, openness: 0.39, teethUpper: 0.41, tongueOut: 0.16, cornerLeft: -1.8, cornerRight: -1.7, upperRaise: 0.03, lowerDroop: 0.19, lipTight: 0.08, quiver: 0.00, drool: 0.06 }), e: 'outQuad' },
    { d: 0.23, p: m({ smile: 0.66, openness: 0.42, teethUpper: 0.48, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.47, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_dribble_tap_094', name: 'Тюкает носом #94', cat: 'ball', w: 6, frames: [
    { d: 0.17, p: m({ width: 39.9, height: 8.9, smile: 0.44, openness: 0.18, teethUpper: 0.17, tongueOut: 0.05, cornerLeft: -1.2, cornerRight: -0.9, upperRaise: 0.02, lowerDroop: 0.09, lipTight: 0.05, quiver: 0.00, drool: 0.02 }), e: 'outQuad' },
    { d: 0.37, p: m({ smile: 0.45, openness: 0.21, teethUpper: 0.15, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.31, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_catch_snap_095', name: 'Ловит щелчком #95', cat: 'ball', w: 3, frames: [
    { d: 0.2, p: m({ width: 39.8, height: 11.4, smile: 0.21, openness: 0.37, teethUpper: 0.35, tongueOut: 0.01, cornerLeft: -0.3, cornerRight: -0.7, upperRaise: 0.07, lowerDroop: 0.05, lipTight: 0.06, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.31, p: m({ smile: 0.23, openness: 0.39, teethUpper: 0.28, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_chew_gnaw_096', name: 'Грызёт мяч #96', cat: 'ball', w: 2, frames: [
    { d: 0.12, p: m({ width: 40.3, height: 10.8, smile: -0.02, openness: 0.15, teethUpper: 0.19, tongueOut: 0.07, cornerLeft: -0.0, cornerRight: 0.4, upperRaise: 0.04, lowerDroop: 0.01, lipTight: 0.00, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.37, p: m({ smile: -0.01, openness: 0.17, teethUpper: 0.13, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_blow_push_097', name: 'Дует толкает #97', cat: 'ball', w: 2, frames: [
    { d: 0.13, p: m({ width: 36.1, height: 8.7, smile: 0.10, openness: 0.20, teethUpper: 0.00, tongueOut: 0.03, cornerLeft: 0.3, cornerRight: -0.3, upperRaise: 0.06, lowerDroop: 0.08, lipTight: 0.03, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.26, p: m({ smile: 0.07, openness: 0.18, teethUpper: 0.07, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.33, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_frustrated_growl_098', name: 'Рычит досада мяч #98', cat: 'ball', w: 6, frames: [
    { d: 0.16, p: m({ width: 35.1, height: 11.8, smile: -0.17, openness: 0.23, teethUpper: 0.52, tongueOut: 0.04, cornerLeft: 1.0, cornerRight: 1.5, upperRaise: 0.16, lowerDroop: 0.07, lipTight: 0.15, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.36, p: m({ smile: -0.23, openness: 0.22, teethUpper: 0.58, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_joy_bark_099', name: 'Радостный гав с мячом #99', cat: 'ball', w: 4, frames: [
    { d: 0.15, p: m({ width: 42.2, height: 7.0, smile: 0.79, openness: 0.51, teethUpper: 0.47, tongueOut: 0.10, cornerLeft: -1.2, cornerRight: -3.4, upperRaise: 0.04, lowerDroop: 0.13, lipTight: 0.18, quiver: 0.00, drool: 0.02 }), e: 'outQuad' },
    { d: 0.44, p: m({ smile: 0.82, openness: 0.49, teethUpper: 0.41, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.37, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ball_focus_stare_100', name: 'Сосредоточен на мяче #100', cat: 'ball', w: 2, frames: [
    { d: 0.17, p: m({ width: 47.3, height: 7.4, smile: 0.14, openness: 0.13, teethUpper: 0.02, tongueOut: 0.00, cornerLeft: -0.5, cornerRight: -0.1, upperRaise: 0.01, lowerDroop: 0.05, lipTight: 0.22, quiver: 0.00, drool: 0.00 }), e: 'outQuad' },
    { d: 0.35, p: m({ smile: 0.12, openness: 0.13, teethUpper: 0.00, quiver: 0.00 }), e: 'inOutQuad' },
    { d: 0.42, p: m({}), e: 'outQuad' },
  ]},

];

/* ---------------- procedural generator ---------------- */

export function generateProceduralMouth(): MouthDef {
  const cat = (['happy','sad','angry','disgusted','surprised','playful','idle','eating','social','ball'] as MouthCat[])[Math.floor(Math.random()*10)];
  const frames: MouthFrame[] = [];
  const n = 2 + Math.floor(Math.random()*3);
  for (let i = 0; i < n; i++) {
    // реалистичные анатомические связи: улыбка → уголки вверх (corner -), грусть → вниз (corner +)
    let smileBase = (Math.random()-0.5)*1.18;
    let opennessBase = Math.random() > 0.45 ? Math.random()*0.52 : 0.02 * Math.random();
    // категория-специфичные корректировки
    if (cat==='happy') { smileBase = 0.28 + Math.random()*0.62; opennessBase = Math.random()*0.42; }
    if (cat==='sad') { smileBase = -0.22 - Math.random()*0.58; opennessBase = Math.random()*0.32; }
    if (cat==='angry') { smileBase = -0.14 - Math.random()*0.38; opennessBase = Math.random()*0.22; }
    if (cat==='disgusted') { smileBase = -0.08 - Math.random()*0.32; opennessBase = Math.random()*0.18; }
    if (cat==='surprised') { smileBase = (Math.random()-0.5)*0.28; opennessBase = 0.22 + Math.random()*0.42; }
    if (cat==='playful') { smileBase = 0.18 + Math.random()*0.52; opennessBase = Math.random()*0.48; }
    if (cat==='ball') { smileBase = 0.14 + Math.random()*0.48; opennessBase = 0.12 + Math.random()*0.38; }
    // уголки анатомически: smile>0 → corner -, smile<0 → corner +
    const cornerBias = -smileBase * 2.8; // вверх при улыбке, вниз при грусти
    const asym = (Math.random()-0.5)*1.2; // асимметрия
    const cornerLeft = cornerBias + asym + (Math.random()-0.5)*0.9;
    const cornerRight = cornerBias - asym + (Math.random()-0.5)*0.9;
    frames.push({
      d: 0.12 + Math.random()*0.42,
      e: (['outBack','outCubic','inOutQuad','outElastic','outQuad'] as Ease[])[Math.floor(Math.random()*5)],
      p: {
        width: 27 + Math.random()*22,
        height: 6 + Math.random()*7.5,
        openness: opennessBase,
        smile: smileBase,
        upperRaise: cat==='disgusted'||cat==='angry' ? Math.random()*0.58 : Math.random() > 0.68 ? Math.random()*0.42 : 0,
        lowerDroop: cat==='sad'||cat==='surprised' ? Math.random()*0.42 : Math.random() > 0.65 ? Math.random()*0.32 : 0,
        cornerLeft,
        cornerRight,
        teethUpper: opennessBase > 0.14 && Math.random() > 0.46 ? Math.random()*0.62 : 0,
        teethLower: opennessBase > 0.28 && Math.random() > 0.58 ? Math.random()*0.42 : 0,
        tongueOut: cat==='playful'||cat==='disgusted' ? (Math.random() > 0.56 ? Math.random()*0.38 : 0) : (Math.random() > 0.78 ? Math.random()*0.28 : 0),
        tongueWobble: (Math.random()-0.5)*0.62,
        tongueCurl: (Math.random()-0.5)*0.42,
        lipTight: cat==='angry' ? 0.18 + Math.random()*0.28 : Math.random() > 0.70 ? Math.random()*0.34 : 0,
        quiver: cat==='sad' ? Math.random()*0.92 : Math.random() > 0.76 ? Math.random()*0.88 : 0,
        drool: Math.random() > 0.90 ? Math.random()*0.22 : 0,
        innerDark: 0.86 + Math.random()*0.08,
      }
    });
  }
  frames.push({ d: 0.28 + Math.random()*0.28, p: {}, e: 'outQuad' });
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
    // гибкая эластичность: большие скачки (полное выражение эмоций) получают лёгкий овершут — живая ткань, не пластик
    const deltaOpen = Math.abs((this.target.openness as number) - (this.from.openness as number));
    const deltaSmile = Math.abs((this.target.smile as number) - (this.from.smile as number));
    const deltaRaise = Math.abs((this.target.upperRaise as number) - (this.from.upperRaise as number));
    const deltaQuiver = Math.abs((this.target.quiver as number) - (this.from.quiver as number));
    const intensity = Math.max(deltaOpen*1.4, deltaSmile*0.9, deltaRaise*1.3, deltaQuiver*0.18);
    if (intensity > 0.28) {
      const flex = Math.min(0.085, intensity*0.11);
      eased += Math.sin(eased * Math.PI) * flex * (1 - u) * (this.active!.frames.length > 2 ? 1.12 : 1);
      // для самых ярких эмоций — лёгкая упругая отдача в конце
      if (intensity > 0.55 && u > 0.72) eased += Math.sin((u-0.72)*Math.PI*3.2) * 0.018 * intensity;
    }
    // органичная микро-неровность easing
    eased += Math.sin(u*Math.PI*2)*0.016*(1-u);
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
