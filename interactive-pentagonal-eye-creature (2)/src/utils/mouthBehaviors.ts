// ============================================================
//  PENTA — Mouth Behavior Engine v2
//  75+ authored realistic mouth routines + procedural variants
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
    { d: 0.22, p: m({ width: 38, height: 8, smile: 0.42, openness: 0.04, teethUpper: 0.08 }), e: 'outBack' },
    { d: 0.9, p: m({ width: 40, smile: 0.46, openness: 0.05 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'smile_wide', name: 'Wide smile', cat: 'happy', w: 7, frames: [
    { d: 0.18, p: m({ width: 48, height: 9, smile: 0.72, openness: 0.18, teethUpper: 0.45, cornerLeft: -2, cornerRight: -2 }), e: 'outBack' },
    { d: 0.8, p: m({ width: 50, smile: 0.76 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'grin_teeth', name: 'Teeth grin', cat: 'happy', w: 6, frames: [
    { d: 0.14, p: m({ width: 52, height: 10, smile: 0.88, openness: 0.42, teethUpper: 0.92, teethLower: 0.22, innerDark: 0.88 }), e: 'outBack' },
    { d: 0.7, p: m({ width: 54, smile: 0.9 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outElastic' },
  ]},
  { id: 'laugh_open', name: 'Open laugh', cat: 'happy', w: 6, frames: [
    { d: 0.12, p: m({ width: 46, height: 11, smile: 0.92, openness: 0.78, teethUpper: 0.9, teethLower: 0.55, tongueOut: 0.22, innerDark: 0.82 }), e: 'outBack' },
    { d: 0.6, p: m({ openness: 0.82, smile: 0.94 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'laugh_burst', name: 'Burst of laughter', cat: 'happy', w: 5, frames: [
    { d: 0.08, p: m({ width: 44, height: 12, smile: 1, openness: 0.92, teethUpper: 1, teethLower: 0.8, tongueOut: 0.48, quiver: 0.8 }), e: 'outExpo' },
    { d: 0.12, p: m({ openness: 0.6, tongueOut: 0.3 }), e: 'inQuad' },
    { d: 0.12, p: m({ openness: 0.88, tongueOut: 0.5, quiver: 1 }), e: 'outBack' },
    { d: 0.5, p: m({ openness: 0.7 }), e: 'outElastic' },
  ]},
  { id: 'giggle_titter', name: 'Giggle', cat: 'happy', w: 5, frames: [
    { d: 0.1, p: m({ width: 40, smile: 0.65, openness: 0.28, teethUpper: 0.35, tongueWobble: 0.2 }), e: 'outBack' },
    { d: 0.1, p: m({ openness: 0.12 }), e: 'inQuad' },
    { d: 0.1, p: m({ openness: 0.32, smile: 0.7 }), e: 'outBack' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'chuckle_closed', name: 'Closed chuckle', cat: 'happy', w: 4, frames: [
    { d: 0.18, p: m({ width: 38, smile: 0.55, openness: 0.08, teethUpper: 0.12, quiver: 0.6 }), e: 'outQuad' },
    { d: 0.6, p: m({ quiver: 0.9 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'beam_pride', name: 'Proud beam', cat: 'happy', w: 4, frames: [
    { d: 0.24, p: m({ width: 44, smile: 0.6, openness: 0.14, teethUpper: 0.35, cornerLeft: -1, cornerRight: -3, upperRaise: 0.15 }), e: 'outBack' },
    { d: 0.8, p: m({ smile: 0.62 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'ecstatic_cheer', name: 'Ecstatic cheer', cat: 'happy', w: 3, frames: [
    { d: 0.08, p: m({ width: 48, height: 14, smile: 0.95, openness: 0.95, teethUpper: 1, teethLower: 0.7, tongueOut: 0.35, innerDark: 0.78 }), e: 'outExpo' },
    { d: 0.7, p: m({ openness: 0.88, quiver: 0.6 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outElastic' },
  ]},
  { id: 'content_hum', name: 'Content hum', cat: 'happy', w: 4, frames: [
    { d: 0.4, p: m({ width: 36, smile: 0.35, openness: 0.22, innerDark: 0.9, quiver: 0.3 }), e: 'inOutQuad' },
    { d: 0.8, p: m({ openness: 0.26, smile: 0.38 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'frown_soft', name: 'Soft frown', cat: 'sad', w: 7, frames: [
    { d: 0.32, p: m({ width: 34, height: 8, smile: -0.38, openness: 0.08, cornerLeft: 3, cornerRight: 3 }), e: 'outQuad' },
    { d: 0.9, p: m({ smile: -0.42 }), e: 'hold' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'frown_deep', name: 'Deep frown', cat: 'sad', w: 6, frames: [
    { d: 0.35, p: m({ width: 32, height: 9, smile: -0.82, openness: 0.22, teethLower: 0.18, cornerLeft: 5, cornerRight: 5, quiver: 0.7 }), e: 'inOutCubic' },
    { d: 1.0, p: m({ smile: -0.86, quiver: 0.9 }), e: 'hold' },
    { d: 0.45, p: m({}), e: 'outQuad' },
  ]},
  { id: 'pout_sulky', name: 'Sulky pout', cat: 'sad', w: 5, frames: [
    { d: 0.28, p: m({ width: 28, height: 11, smile: -0.35, openness: 0.18, lowerDroop: 0.55, upperRaise: 0.2, lipTight: 0.25 }), e: 'outBack' },
    { d: 0.8, p: m({ lowerDroop: 0.6 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'sob_tremble', name: 'Sobbing tremble', cat: 'sad', w: 4, frames: [
    { d: 0.12, p: m({ width: 34, smile: -0.6, openness: 0.38, quiver: 2.2, lowerDroop: 0.4, drool: 0.15 }), e: 'outQuad' },
    { d: 0.1, p: m({ openness: 0.18, quiver: 2.6 }), e: 'inQuad' },
    { d: 0.12, p: m({ openness: 0.42, quiver: 2.4 }), e: 'outQuad' },
    { d: 0.7, p: m({ quiver: 2.8 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'cry_open', name: 'Open cry', cat: 'sad', w: 4, frames: [
    { d: 0.18, p: m({ width: 36, height: 12, smile: -0.72, openness: 0.68, teethLower: 0.35, tongueOut: 0.12, quiver: 2, drool: 0.25, innerDark: 0.88 }), e: 'outBack' },
    { d: 0.8, p: m({ openness: 0.62, quiver: 2.4 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'cry_tight', name: 'Tight cry', cat: 'sad', w: 3, frames: [
    { d: 0.14, p: m({ width: 30, height: 7, smile: -0.6, openness: 0.12, lipTight: 0.78, quiver: 1.8, cornerLeft: 4, cornerRight: 4 }), e: 'inQuad' },
    { d: 0.7, p: m({ quiver: 2.2 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'lip_quiver', name: 'Lip quiver', cat: 'sad', w: 5, frames: [
    { d: 0.3, p: m({ width: 34, smile: -0.3, quiver: 1.8, lowerDroop: 0.25 }), e: 'outQuad' },
    { d: 0.8, p: m({ quiver: 2.6 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tears_stream', name: 'Streaming tears', cat: 'sad', w: 3, frames: [
    { d: 0.35, p: m({ width: 36, smile: -0.65, openness: 0.32, quiver: 1.2, drool: 0.35, innerDark: 0.9 }), e: 'inOutCubic' },
    { d: 1.2, p: m({ openness: 0.28, drool: 0.45, quiver: 1.4 }), e: 'linear' },
    { d: 0.5, p: m({}), e: 'outQuad' },
  ]},
  { id: 'whimper', name: 'Whimper', cat: 'sad', w: 4, frames: [
    { d: 0.1, p: m({ width: 32, smile: -0.45, openness: 0.3, quiver: 1.5, upperRaise: 0.25 }), e: 'outQuad' },
    { d: 0.08, p: m({ openness: 0.12 }), e: 'inQuad' },
    { d: 0.1, p: m({ openness: 0.34 }), e: 'outQuad' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'dejected_flat', name: 'Dejected line', cat: 'sad', w: 4, frames: [
    { d: 0.4, p: m({ width: 30, height: 5, smile: -0.2, openness: 0.02, lipTight: 0.6, innerDark: 0.95 }), e: 'inOutQuad' },
    { d: 1.2, p: m({}), e: 'hold' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'snarl_upper', name: 'Upper snarl', cat: 'angry', w: 5, frames: [
    { d: 0.14, p: m({ width: 42, height: 10, smile: -0.15, openness: 0.42, upperRaise: 0.85, teethUpper: 0.9, innerDark: 0.85 }), e: 'outBack' },
    { d: 0.7, p: m({ upperRaise: 0.88, quiver: 0.6 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'grimace_tight', name: 'Tight grimace', cat: 'angry', w: 5, frames: [
    { d: 0.12, p: m({ width: 38, height: 6, smile: -0.25, openness: 0.08, lipTight: 0.82, upperRaise: 0.35, lowerDroop: 0.25 }), e: 'inBack' },
    { d: 0.6, p: m({ lipTight: 0.86, quiver: 0.7 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'fume_zigzag', name: 'Fuming zigzag', cat: 'angry', w: 4, frames: [
    { d: 0.1, p: m({ width: 40, smile: 0.1, openness: 0.18, cornerLeft: -3, cornerRight: 4, upperRaise: 0.3, quiver: 1.2 }), e: 'snap' },
    { d: 0.6, p: m({ quiver: 1.6 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'bite_anger', name: 'Angry bite', cat: 'angry', w: 3, frames: [
    { d: 0.12, p: m({ width: 36, openness: 0.5, teethUpper: 0.6, teethLower: 0.5, smile: -0.1, quiver: 1 }), e: 'outExpo' },
    { d: 0.1, p: m({ openness: 0.12, lipTight: 0.6 }), e: 'inQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'grumble_low', name: 'Low grumble', cat: 'angry', w: 4, frames: [
    { d: 0.22, p: m({ width: 36, height: 8, smile: -0.35, openness: 0.2, innerDark: 0.88, quiver: 0.8, upperRaise: 0.25 }), e: 'outQuad' },
    { d: 0.7, p: m({ quiver: 1.1 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'shout_angry', name: 'Angry shout', cat: 'angry', w: 3, frames: [
    { d: 0.06, p: m({ width: 50, height: 16, smile: -0.1, openness: 0.92, teethUpper: 0.85, teethLower: 0.65, tongueOut: 0.18, innerDark: 0.75 }), e: 'outExpo' },
    { d: 0.5, p: m({ openness: 0.85, quiver: 1.2 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'sneer_side', name: 'Side sneer', cat: 'angry', w: 4, frames: [
    { d: 0.2, p: m({ width: 40, smile: -0.15, openness: 0.12, cornerLeft: -4, cornerRight: 2, upperRaise: 0.45, teethUpper: 0.3 }), e: 'outCubic' },
    { d: 0.7, p: m({}), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'clench_jaw', name: 'Clenched jaw', cat: 'angry', w: 4, frames: [
    { d: 0.18, p: m({ width: 34, height: 5, smile: -0.1, openness: 0.03, lipTight: 0.9, quiver: 1.2, upperRaise: 0.2 }), e: 'inBack' },
    { d: 0.6, p: m({ quiver: 1.6 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'disgust_nose', name: 'Nose wrinkle', cat: 'disgusted', w: 2, frames: [
    { d: 0.16, p: m({ width: 36, height: 9, smile: -0.48, openness: 0.22, upperRaise: 0.72, teethUpper: 0.35, tongueOut: 0.12, innerDark: 0.88 }), e: 'outBack' },
    { d: 0.7, p: m({ upperRaise: 0.76 }), e: 'hold' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'disgust_tongue', name: 'Tongue out disgust', cat: 'disgusted', w: 2, frames: [
    { d: 0.12, p: m({ width: 38, smile: -0.4, openness: 0.38, tongueOut: 0.55, tongueWobble: 0.2, teethUpper: 0.25, upperRaise: 0.4 }), e: 'outBack' },
    { d: 0.5, p: m({ tongueOut: 0.6, tongueWobble: -0.15 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'nausea_pre', name: 'Queasy', cat: 'disgusted', w: 1, frames: [
    { d: 0.22, p: m({ width: 34, smile: -0.35, openness: 0.28, tongueOut: 0.28, quiver: 1.4, drool: 0.18, innerDark: 0.9 }), e: 'outQuad' },
    { d: 0.6, p: m({ quiver: 1.8, drool: 0.28 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'nausea_gag', name: 'Gagging', cat: 'disgusted', w: 1, frames: [
    { d: 0.14, p: m({ width: 40, height: 14, smile: -0.32, openness: 0.88, tongueOut: 0.88, tongueCurl: -0.42, teethUpper: 0.55, teethLower: 0.5, quiver: 2.8, drool: 0.62, innerDark: 0.8 }), e: 'outExpo' },
    { d: 0.25, p: m({ openness: 0.72, tongueOut: 0.72, quiver: 3.2, drool: 0.72 }), e: 'inQuad' },
    { d: 0.35, p: m({ openness: 0.55, tongueOut: 0.45, quiver: 1.8, drool: 0.45 }), e: 'outQuad' },
    { d: 0.4, p: m({}), e: 'outCubic' },
  ]},
  { id: 'spit_out', name: 'Spitting out', cat: 'disgusted', w: 1, frames: [
    { d: 0.08, p: m({ width: 42, openness: 0.82, tongueOut: 0.72, teethUpper: 0.5, upperRaise: 0.55, quiver: 1.8, drool: 0.5 }), e: 'outExpo' },
    { d: 0.35, p: m({ openness: 0.3, tongueOut: 0.2 }), e: 'outBack' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'bleh_face', name: 'Bleh', cat: 'disgusted', w: 1, frames: [
    { d: 0.12, p: m({ width: 46, smile: -0.3, openness: 0.55, tongueOut: 0.72, tongueCurl: 0.35, tongueWobble: 0.3, teethUpper: 0.3, upperRaise: 0.45, quiver: 0.8 }), e: 'outBack' },
    { d: 0.5, p: m({ tongueWobble: -0.25 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'o_small', name: 'Small O', cat: 'surprised', w: 5, frames: [
    { d: 0.08, p: m({ width: 22, height: 16, openness: 0.55, smile: 0.05, innerDark: 0.85 }), e: 'outExpo' },
    { d: 0.5, p: m({ openness: 0.5 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'o_big', name: 'Big O', cat: 'surprised', w: 5, frames: [
    { d: 0.06, p: m({ width: 32, height: 20, openness: 0.88, smile: 0.08, innerDark: 0.78, tongueOut: 0.1 }), e: 'outExpo' },
    { d: 0.6, p: m({ openness: 0.82 }), e: 'hold' },
    { d: 0.45, p: m({}), e: 'outElastic' },
  ]},
  { id: 'gasp_shock', name: 'Shocked gasp', cat: 'surprised', w: 4, frames: [
    { d: 0.05, p: m({ width: 36, height: 18, openness: 0.92, smile: -0.05, teethUpper: 0.3, innerDark: 0.76 }), e: 'outExpo' },
    { d: 0.4, p: m({ openness: 0.72, quiver: 1.2 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outElastic' },
  ]},
  { id: 'jaw_drop', name: 'Jaw drop', cat: 'surprised', w: 4, frames: [
    { d: 0.22, p: m({ width: 38, height: 16, openness: 0.78, lowerDroop: 0.65, innerDark: 0.8, teethLower: 0.3 }), e: 'outBack' },
    { d: 0.6, p: m({ openness: 0.72 }), e: 'hold' },
    { d: 0.45, p: m({}), e: 'outQuad' },
  ]},
  { id: 'o_tiny_gasp', name: 'Tiny gasp', cat: 'surprised', w: 4, frames: [
    { d: 0.08, p: m({ width: 18, height: 12, openness: 0.42, innerDark: 0.88 }), e: 'outExpo' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'double_gasp', name: 'Double gasp', cat: 'surprised', w: 3, frames: [
    { d: 0.07, p: m({ width: 28, openness: 0.7 }), e: 'outExpo' },
    { d: 0.08, p: m({ openness: 0.15 }), e: 'inQuad' },
    { d: 0.07, p: m({ openness: 0.78, width: 32 }), e: 'outExpo' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tongue_stick', name: 'Tongue stick out', cat: 'playful', w: 5, frames: [
    { d: 0.14, p: m({ width: 36, smile: 0.35, openness: 0.32, tongueOut: 0.62, teethUpper: 0.2 }), e: 'outBack' },
    { d: 0.6, p: m({ tongueOut: 0.66 }), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tongue_wiggle', name: 'Tongue wiggle', cat: 'playful', w: 4, frames: [
    { d: 0.14, p: m({ width: 38, smile: 0.4, openness: 0.38, tongueOut: 0.68, tongueWobble: 0.45, teethUpper: 0.25 }), e: 'outBack' },
    { d: 0.5, p: m({ tongueWobble: -0.45, tongueOut: 0.7 }), e: 'linear' },
    { d: 0.14, p: m({ tongueWobble: 0.4 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tongue_curl', name: 'Tongue curl', cat: 'playful', w: 3, frames: [
    { d: 0.18, p: m({ width: 36, openness: 0.42, tongueOut: 0.72, tongueCurl: 0.65, teethUpper: 0.3 }), e: 'outBack' },
    { d: 0.5, p: m({ tongueCurl: -0.4, tongueWobble: 0.2 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'kiss_mwah', name: 'Kiss mwah', cat: 'playful', w: 4, frames: [
    { d: 0.14, p: m({ width: 22, height: 14, openness: 0.32, smile: 0.2, lipTight: 0.45, innerDark: 0.88 }), e: 'outBack' },
    { d: 0.1, p: m({ width: 18, openness: 0.45, lipTight: 0.2 }), e: 'outExpo' },
    { d: 0.3, p: m({ width: 26, smile: 0.5 }), e: 'outBack' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'whistle', name: 'Whistle', cat: 'playful', w: 3, frames: [
    { d: 0.18, p: m({ width: 20, height: 16, openness: 0.38, smile: 0.15, lipTight: 0.35, innerDark: 0.85 }), e: 'outBack' },
    { d: 0.5, p: m({ openness: 0.42, quiver: 0.4 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'cheeky_bite', name: 'Cheeky lip bite', cat: 'playful', w: 4, frames: [
    { d: 0.18, p: m({ width: 34, smile: 0.25, openness: 0.12, lowerDroop: 0.15, teethUpper: 0.35, lipTight: 0.3, cornerLeft: -2, cornerRight: 1 }), e: 'outBack' },
    { d: 0.6, p: m({}), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'chew_rhythmic', name: 'Rhythmic chewing', cat: 'eating', w: 6, frames: [
    { d: 0.12, p: m({ width: 38, openness: 0.38, smile: 0.15, teethUpper: 0.25, innerDark: 0.88 }), e: 'outQuad' },
    { d: 0.12, p: m({ openness: 0.12, smile: 0.2 }), e: 'inQuad' },
    { d: 0.12, p: m({ openness: 0.42, smile: 0.18 }), e: 'outQuad' },
    { d: 0.12, p: m({ openness: 0.1 }), e: 'inQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'chew_side', name: 'Side chewing', cat: 'eating', w: 5, frames: [
    { d: 0.14, p: m({ width: 36, openness: 0.32, cornerLeft: -3, cornerRight: 1, teethUpper: 0.2, smile: 0.12 }), e: 'outQuad' },
    { d: 0.12, p: m({ openness: 0.1, cornerLeft: -1 }), e: 'inQuad' },
    { d: 0.14, p: m({ openness: 0.36, cornerLeft: -4, cornerRight: 2 }), e: 'outQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'lick_lips', name: 'Lip licking', cat: 'eating', w: 5, frames: [
    { d: 0.16, p: m({ width: 38, openness: 0.22, tongueOut: 0.45, tongueWobble: 0.35, tongueCurl: 0.2, smile: 0.25 }), e: 'outBack' },
    { d: 0.2, p: m({ tongueWobble: -0.4, tongueOut: 0.5 }), e: 'linear' },
    { d: 0.18, p: m({ tongueWobble: 0.3, tongueOut: 0.4 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'savour_mmm', name: 'Mmm savouring', cat: 'eating', w: 5, frames: [
    { d: 0.35, p: m({ width: 38, smile: 0.62, openness: 0.08, teethUpper: 0.08, innerDark: 0.92, quiver: 0.2 }), e: 'outCubic' },
    { d: 0.8, p: m({ smile: 0.68, openness: 0.06, quiver: 0.3 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'savour_big', name: 'Big savouring', cat: 'eating', w: 4, frames: [
    { d: 0.22, p: m({ width: 42, smile: 0.72, openness: 0.28, teethUpper: 0.35, tongueOut: 0.15, innerDark: 0.88 }), e: 'outBack' },
    { d: 0.5, p: m({ openness: 0.18, smile: 0.78, quiver: 0.3 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'gulp_swallow', name: 'Gulp swallow', cat: 'eating', w: 4, frames: [
    { d: 0.1, p: m({ width: 34, openness: 0.55, innerDark: 0.82, tongueOut: 0.08 }), e: 'outExpo' },
    { d: 0.14, p: m({ openness: 0.05, lipTight: 0.45, width: 32 }), e: 'inQuad' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'food_gaze', name: 'Food gaze', cat: 'eating', w: 4, frames: [
    { d: 0.18, p: m({ width: 32, openness: 0.18, smile: 0.2, tongueOut: 0.15, innerDark: 0.9 }), e: 'outQuad' },
    { d: 0.6, p: m({ openness: 0.22, tongueOut: 0.22 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'crunch_loud', name: 'Loud crunch', cat: 'eating', w: 3, frames: [
    { d: 0.08, p: m({ width: 44, openness: 0.62, teethUpper: 0.6, teethLower: 0.45, smile: 0.25, innerDark: 0.82 }), e: 'outExpo' },
    { d: 0.08, p: m({ openness: 0.08, lipTight: 0.5 }), e: 'inQuad' },
    { d: 0.1, p: m({ openness: 0.55, teethUpper: 0.55 }), e: 'outExpo' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'idle_breathe_mouth', name: 'Mouth breathing', cat: 'idle', w: 5, frames: [
    { d: 0.8, p: m({ width: 34, openness: 0.08, smile: 0.08, innerDark: 0.93 }), e: 'inOutQuad' },
    { d: 0.8, p: m({ openness: 0.14, smile: 0.1 }), e: 'inOutQuad' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'yawn_small', name: 'Small yawn', cat: 'idle', w: 4, frames: [
    { d: 0.35, p: m({ width: 30, height: 14, openness: 0.55, lowerDroop: 0.5, innerDark: 0.82, tongueOut: 0.12 }), e: 'inOutCubic' },
    { d: 0.3, p: m({ openness: 0.62, tongueOut: 0.18 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'yawn_big', name: 'Big yawn', cat: 'idle', w: 3, frames: [
    { d: 0.45, p: m({ width: 28, height: 18, openness: 0.92, lowerDroop: 0.75, tongueOut: 0.35, innerDark: 0.72, teethLower: 0.3 }), e: 'inOutCubic' },
    { d: 0.4, p: m({ openness: 0.88, tongueOut: 0.4 }), e: 'hold' },
    { d: 0.5, p: m({}), e: 'outCubic' },
  ]},
  { id: 'mumble', name: 'Mumble', cat: 'idle', w: 4, frames: [
    { d: 0.1, p: m({ width: 32, openness: 0.18, smile: 0.05, quiver: 0.4 }), e: 'outQuad' },
    { d: 0.08, p: m({ openness: 0.28, width: 34 }), e: 'inOutQuad' },
    { d: 0.09, p: m({ openness: 0.14, smile: -0.05 }), e: 'inOutQuad' },
    { d: 0.1, p: m({ openness: 0.22 }), e: 'inOutQuad' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'drool_sleepy', name: 'Sleepy drool', cat: 'idle', w: 2, frames: [
    { d: 0.5, p: m({ width: 32, smile: -0.05, openness: 0.12, drool: 0.45, lowerDroop: 0.3, innerDark: 0.92 }), e: 'inOutQuad' },
    { d: 1.0, p: m({ drool: 0.62, openness: 0.14 }), e: 'linear' },
    { d: 0.5, p: m({}), e: 'outQuad' },
  ]},
  { id: 'social_greet_mouth', name: 'Greeting mouth', cat: 'social', w: 4, frames: [
    { d: 0.14, p: m({ width: 40, smile: 0.58, openness: 0.22, teethUpper: 0.32, innerDark: 0.9 }), e: 'outBack' },
    { d: 0.5, p: m({ smile: 0.62, openness: 0.18 }), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'social_annoyed_mouth', name: 'Annoyed mouth', cat: 'social', w: 4, frames: [
    { d: 0.18, p: m({ width: 34, smile: -0.35, openness: 0.12, lipTight: 0.55, upperRaise: 0.35, cornerLeft: 2, cornerRight: -1 }), e: 'outCubic' },
    { d: 0.7, p: m({ quiver: 0.6 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'social_excited_mouth', name: 'Excited chatter', cat: 'social', w: 4, frames: [
    { d: 0.08, p: m({ width: 38, smile: 0.45, openness: 0.35, quiver: 0.8, teethUpper: 0.25 }), e: 'outBack' },
    { d: 0.08, p: m({ openness: 0.14 }), e: 'inQuad' },
    { d: 0.08, p: m({ openness: 0.38 }), e: 'outBack' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'rare_wobble_all', name: 'Wobbling mouth', cat: 'rare', w: 2, frames: [
    { d: 0.15, p: m({ width: 44, smile: 0.5, openness: 0.45, quiver: 2.5, cornerLeft: -4, cornerRight: 4, tongueOut: 0.3 }), e: 'outBack' },
    { d: 0.6, p: m({ quiver: 3, cornerLeft: 4, cornerRight: -4 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outElastic' },
  ]},
  { id: 'rare_elastic', name: 'Elastic mouth', cat: 'rare', w: 1, frames: [
    { d: 0.18, p: m({ width: 12, height: 18, openness: 0.82, smile: 0.1, innerDark: 0.78 }), e: 'inOutBack' },
    { d: 0.22, p: m({ width: 56, height: 8, openness: 0.22, smile: 0.72, teethUpper: 0.5 }), e: 'inOutBack' },
    { d: 0.45, p: m({}), e: 'outElastic' },
  ]},
  { id: 'rare_bubbles', name: 'Drool bubbles', cat: 'rare', w: 1, frames: [
    { d: 0.25, p: m({ width: 36, openness: 0.32, drool: 0.72, quiver: 0.8, lowerDroop: 0.35 }), e: 'outQuad' },
    { d: 0.8, p: m({ drool: 0.88, quiver: 1.2 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'rare_infinity', name: 'Infinity yawn', cat: 'rare', w: 1, frames: [
    { d: 0.6, p: m({ width: 26, height: 20, openness: 0.95, lowerDroop: 0.85, tongueOut: 0.45, innerDark: 0.68 }), e: 'inOutCubic' },
    { d: 0.8, p: m({ openness: 0.88 }), e: 'hold' },
    { d: 0.7, p: m({}), e: 'outBack' },
  ]},
  { id: 'smile_dimple', name: 'Dimpled smile', cat: 'happy', w: 4, frames: [
    { d: 0.2, p: m({ width: 44, height: 8, smile: 0.58, openness: 0.12, teethUpper: 0.28, cornerLeft: -3, cornerRight: -3, upperRaise: 0.12 }), e: 'outBack' },
    { d: 0.7, p: m({ smile: 0.62 }), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'grin_sideways', name: 'Sideways grin', cat: 'playful', w: 4, frames: [
    { d: 0.18, p: m({ width: 42, smile: 0.45, openness: 0.2, cornerLeft: -5, cornerRight: 2, teethUpper: 0.35, tongueWobble: 0.15 }), e: 'outBack' },
    { d: 0.6, p: m({}), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'laugh_tears_joy', name: 'Joy tears laugh', cat: 'happy', w: 3, frames: [
    { d: 0.1, p: m({ width: 46, smile: 0.92, openness: 0.82, teethUpper: 0.95, teethLower: 0.6, tongueOut: 0.18, quiver: 1.2, drool: 0.18 }), e: 'outExpo' },
    { d: 0.6, p: m({ openness: 0.76, quiver: 1.8, drool: 0.28 }), e: 'linear' },
    { d: 0.4, p: m({}), e: 'outElastic' },
  ]},
  { id: 'pout_tremble', name: 'Trembling pout', cat: 'sad', w: 4, frames: [
    { d: 0.22, p: m({ width: 30, smile: -0.32, openness: 0.16, lowerDroop: 0.5, quiver: 1.6, lipTight: 0.2 }), e: 'outQuad' },
    { d: 0.7, p: m({ quiver: 2.2, lowerDroop: 0.6 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'sob_hiccup', name: 'Sob hiccup', cat: 'sad', w: 3, frames: [
    { d: 0.12, p: m({ width: 34, smile: -0.55, openness: 0.45, quiver: 2.4, drool: 0.2 }), e: 'outQuad' },
    { d: 0.06, p: m({ openness: 0.12, quiver: 1.2 }), e: 'snap' },
    { d: 0.12, p: m({ openness: 0.5, quiver: 2.6 }), e: 'outBack' },
    { d: 0.5, p: m({}), e: 'outQuad' },
  ]},
  { id: 'snarl_disgust', name: 'Disgust snarl', cat: 'disgusted', w: 3, frames: [
    { d: 0.14, p: m({ width: 40, smile: -0.4, openness: 0.38, upperRaise: 0.82, teethUpper: 0.65, tongueOut: 0.22, quiver: 0.8 }), e: 'outBack' },
    { d: 0.6, p: m({ upperRaise: 0.86, quiver: 1 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'yawn_teary', name: 'Teary yawn', cat: 'idle', w: 3, frames: [
    { d: 0.4, p: m({ width: 28, height: 16, openness: 0.78, lowerDroop: 0.6, tongueOut: 0.22, drool: 0.15, innerDark: 0.8 }), e: 'inOutCubic' },
    { d: 0.5, p: m({ openness: 0.82, drool: 0.25, quiver: 0.4 }), e: 'hold' },
    { d: 0.45, p: m({}), e: 'outCubic' },
  ]},
  { id: 'chew_bubble', name: 'Bubble gum chewing', cat: 'eating', w: 4, frames: [
    { d: 0.16, p: m({ width: 40, openness: 0.28, smile: 0.18, cornerLeft: -2, cornerRight: -1, teethUpper: 0.15 }), e: 'outQuad' },
    { d: 0.14, p: m({ openness: 0.42, width: 42, smile: 0.22 }), e: 'outQuad' },
    { d: 0.14, p: m({ openness: 0.18, width: 38 }), e: 'inQuad' },
    { d: 0.6, p: m({}), e: 'linear' },
  ]},
  { id: 'lick_corner', name: 'Corner lick', cat: 'eating', w: 3, frames: [
    { d: 0.18, p: m({ width: 34, openness: 0.18, tongueOut: 0.52, tongueWobble: 0.62, smile: 0.15 }), e: 'outBack' },
    { d: 0.3, p: m({ tongueWobble: -0.55, tongueOut: 0.48 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'kiss_pout', name: 'Duck pout', cat: 'playful', w: 4, frames: [
    { d: 0.18, p: m({ width: 20, height: 14, openness: 0.28, smile: 0.05, lipTight: 0.55, innerDark: 0.88 }), e: 'outBack' },
    { d: 0.5, p: m({ width: 18, openness: 0.22 }), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'whistle_long', name: 'Long whistle', cat: 'playful', w: 3, frames: [
    { d: 0.22, p: m({ width: 18, height: 14, openness: 0.42, lipTight: 0.42, innerDark: 0.84, quiver: 0.5 }), e: 'outBack' },
    { d: 0.9, p: m({ openness: 0.45, quiver: 0.7 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'o_shocked_big', name: 'Big shocked O', cat: 'surprised', w: 4, frames: [
    { d: 0.06, p: m({ width: 34, height: 22, openness: 0.92, smile: -0.05, teethUpper: 0.35, innerDark: 0.74, tongueOut: 0.08 }), e: 'outExpo' },
    { d: 0.6, p: m({ openness: 0.86, quiver: 0.8 }), e: 'linear' },
    { d: 0.45, p: m({}), e: 'outElastic' },
  ]},
  { id: 'mumble_fast', name: 'Fast mumble', cat: 'idle', w: 3, frames: [
    { d: 0.07, p: m({ width: 32, openness: 0.22, quiver: 0.6 }), e: 'snap' },
    { d: 0.07, p: m({ openness: 0.38, width: 36 }), e: 'snap' },
    { d: 0.07, p: m({ openness: 0.16, width: 30 }), e: 'snap' },
    { d: 0.07, p: m({ openness: 0.32, width: 34 }), e: 'snap' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'grimace_pain', name: 'Pain grimace', cat: 'sad', w: 3, frames: [
    { d: 0.12, p: m({ width: 36, smile: -0.55, openness: 0.32, teethUpper: 0.45, teethLower: 0.25, upperRaise: 0.4, quiver: 1.6 }), e: 'outExpo' },
    { d: 0.5, p: m({ quiver: 2, openness: 0.28 }), e: 'linear' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'smile_teeth_closed', name: 'Closed teeth smile', cat: 'happy', w: 4, frames: [
    { d: 0.18, p: m({ width: 42, smile: 0.6, openness: 0.08, teethUpper: 0.55, lipTight: 0.25 }), e: 'outBack' },
    { d: 0.6, p: m({}), e: 'hold' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'tongue_out_silly', name: 'Silly tongue out', cat: 'playful', w: 4, frames: [
    { d: 0.16, p: m({ width: 40, smile: 0.35, openness: 0.45, tongueOut: 0.82, tongueCurl: 0.2, teethUpper: 0.2 }), e: 'outBack' },
    { d: 0.5, p: m({ tongueWobble: 0.3 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'disgust_gag_hard', name: 'Hard gag', cat: 'disgusted', w: 1, frames: [
    { d: 0.12, p: m({ width: 44, height: 16, smile: -0.35, openness: 0.92, tongueOut: 0.92, tongueCurl: -0.5, teethUpper: 0.6, teethLower: 0.55, quiver: 3.2, drool: 0.75, innerDark: 0.78 }), e: 'outExpo' },
    { d: 0.2, p: m({ openness: 0.68, tongueOut: 0.65, quiver: 3.6, drool: 0.85 }), e: 'inQuad' },
    { d: 0.45, p: m({}), e: 'outCubic' },
  ]},
  { id: 'kiss_blow', name: 'Blown kiss', cat: 'playful', w: 3, frames: [
    { d: 0.16, p: m({ width: 20, height: 14, openness: 0.3, lipTight: 0.5 }), e: 'outBack' },
    { d: 0.08, p: m({ width: 26, openness: 0.55, lipTight: 0.15, innerDark: 0.82 }), e: 'outExpo' },
    { d: 0.35, p: m({ width: 36, smile: 0.55, openness: 0.12 }), e: 'outElastic' },
  ]},
  { id: 'smile_shy_closed', name: 'Shy closed smile', cat: 'happy', w: 4, frames: [
    { d: 0.28, p: m({ width: 34, smile: 0.38, openness: 0.04, cornerLeft: -1, cornerRight: -2, teethUpper: 0.05 }), e: 'outQuad' },
    { d: 0.7, p: m({ smile: 0.42 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'frown_pouty', name: 'Pouty frown', cat: 'sad', w: 4, frames: [
    { d: 0.24, p: m({ width: 30, smile: -0.42, openness: 0.14, lowerDroop: 0.62, upperRaise: 0.18, lipTight: 0.2 }), e: 'outBack' },
    { d: 0.7, p: m({ lowerDroop: 0.66 }), e: 'hold' },
    { d: 0.35, p: m({}), e: 'outQuad' },
  ]},
  { id: 'o_whisper', name: 'Whispered O', cat: 'playful', w: 3, frames: [
    { d: 0.14, p: m({ width: 22, height: 12, openness: 0.32, smile: 0.1, innerDark: 0.9 }), e: 'outQuad' },
    { d: 0.5, p: m({ openness: 0.36 }), e: 'linear' },
    { d: 0.3, p: m({}), e: 'outQuad' },
  ]},
  { id: 'laugh_snort', name: 'Snorting laugh', cat: 'happy', w: 3, frames: [
    { d: 0.08, p: m({ width: 44, smile: 0.82, openness: 0.68, teethUpper: 0.7, quiver: 1.2, upperRaise: 0.25 }), e: 'outExpo' },
    { d: 0.08, p: m({ openness: 0.22, quiver: 0.6 }), e: 'inQuad' },
    { d: 0.08, p: m({ openness: 0.72, quiver: 1.4 }), e: 'outExpo' },
    { d: 0.4, p: m({}), e: 'outQuad' },
  ]},
  { id: 'yawn_big_tears', name: 'Yawn to tears', cat: 'idle', w: 2, frames: [
    { d: 0.5, p: m({ width: 26, height: 20, openness: 0.96, lowerDroop: 0.8, tongueOut: 0.4, drool: 0.22, innerDark: 0.7, quiver: 0.5 }), e: 'inOutCubic' },
    { d: 0.6, p: m({ openness: 0.9, drool: 0.32 }), e: 'hold' },
    { d: 0.6, p: m({}), e: 'outBack' },
  ]},
  { id: 'grimace_uneasy', name: 'Uneasy grimace', cat: 'sad', w: 3, frames: [
    { d: 0.2, p: m({ width: 36, smile: -0.2, openness: 0.18, cornerLeft: -3, cornerRight: 3, teethUpper: 0.2, upperRaise: 0.2, quiver: 0.6 }), e: 'outCubic' },
    { d: 0.6, p: m({ quiver: 0.8 }), e: 'hold' },
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
      e: (['outBack','outCubic','inOutQuad','outElastic','snap'] as Ease[])[Math.floor(Math.random()*5)],
      p: {
        width: 28 + Math.random()*24,
        height: 6 + Math.random()*9,
        openness: Math.random() > 0.4 ? Math.random()*0.7 : 0,
        smile: (Math.random()-0.5)*1.6,
        upperRaise: Math.random() > 0.7 ? Math.random()*0.6 : 0,
        lowerDroop: Math.random() > 0.7 ? Math.random()*0.5 : 0,
        cornerLeft: (Math.random()-0.5)*6,
        cornerRight: (Math.random()-0.5)*6,
        teethUpper: Math.random() > 0.5 ? Math.random()*0.8 : 0,
        teethLower: Math.random() > 0.6 ? Math.random()*0.5 : 0,
        tongueOut: Math.random() > 0.65 ? Math.random()*0.7 : 0,
        tongueWobble: (Math.random()-0.5)*0.8,
        lipTight: Math.random() > 0.7 ? Math.random()*0.6 : 0,
        quiver: Math.random() > 0.75 ? Math.random()*2 : 0,
        drool: Math.random() > 0.85 ? Math.random()*0.5 : 0,
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
        (this.current[k] as number) = a + ((t[k] as number)-a)*Math.min(1, dt*3.2);
      }
      return;
    }
    const fr = this.active.frames[this.frameIdx];
    this.frameT += dt;
    const u = Math.min(1, this.frameT / Math.max(0.0001, fr.d));
    const eased = EASE[fr.e ?? 'inOutQuad'](u);
    for (const k of NUMERIC) {
      const a = this.from[k] as number;
      const b = this.target[k] as number;
      (this.current[k] as number) = a + (b-a)*eased;
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
