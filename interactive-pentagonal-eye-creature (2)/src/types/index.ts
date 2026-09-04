export type ThemeId = 
  | 'obsidian' 
  | 'aurora' 
  | 'cybergrid' 
  | 'studio' 
  | 'nebula' 
  | 'sunset' 
  | 'biolum' 
  | 'zen'
  | 'voidglow';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  category: 'dark' | 'light' | 'vibrant';
  bgGradient: string[];
  particleColor: string;
  shadowColor: string;
  ambientLightColor: string;
  gridOverlay?: boolean;
}

export type EyeMood = 
  | 'neutral' 
  | 'curious' 
  | 'sleepy' 
  | 'surprised' 
  | 'suspicious' 
  | 'dizzy' 
  | 'happy' 
  | 'wink' 
  | 'scanning' 
  | 'matrix' 
  | 'laser_lock' 
  | 'heart' 
  | 'shocked' 
  | 'angry' 
  | 'focused' 
  | 'dazed';

export type ActiveTool = 'none' | 'laser' | 'food' | 'tickle' | 'burst' | 'force';

export interface CreatureState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  scaleX: number;
  scaleY: number;
  isJumping: boolean;
  isDragging: boolean;
  isPoked: boolean;
  happiness: number; // 0 - 100
  energy: number;    // 0 - 100
  curiosity: number; // 0 - 100
  currentBehaviorName: string;
}

export interface FoodOrb {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  type: 'star' | 'berry' | 'energy';
  /** seconds since it landed — older snacks are less tempting */
  age?: number;
  settled?: boolean;
}

export interface Settings {
  soundEnabled: boolean;
  ambientAudio: boolean;
  creatureScale: number;
  cornerRoundness: number; // 0 to 1
  springStiffness: number;
  eyeTrackingSpeed: number;
  randomBehaviorRate: number; // 1 (rare) to 5 (frequent)
  bodyMaterial: 'matte' | 'glossy' | 'glowing' | 'hologram';
  particlesCount: number;
  showWidgets: boolean;
  showShadow: boolean;   // ground contact shadow under the creature
  showRimLight: boolean; // subtle outline around the body
  fpsCap: number;
  centerMode: CenterMode; // how the creature anchors on screen
  autoReturnDelay: number; // seconds of no interaction before auto-return

  /* ---- MOTION & PHYSICS ---- */
  /** global multiplier on how eagerly they fly around */
  motionEnergy: number;        // 0.2 … 2.5
  /** top flight speed */
  maxSpeed: number;            // 4 … 30
  /** bounce energy kept on wall hit */
  restitution: number;         // 0.2 … 0.95
  /** soft-body vertex wobbliness */
  softBodyJiggle: number;      // 0 … 1.6
  /** idle hover bob amplitude */
  hoverBob: number;            // 0 … 2.5
  /** how strongly they tilt into turns */
  turnTilt: number;            // 0 … 2

  /* ---- MIND & AUTONOMY ---- */
  /** mood swings: how hard events push their emotions */
  moodVolatility: number;      // 0.2 … 2.2
  /** how fast they calm back down */
  moodRecovery: number;        // 0.3 … 2.5
  /** base hunger drive — how much they want food */
  appetite: number;            // 0.2 … 2
  /** how much they seek company */
  socialDrive: number;         // 0 … 2
  /** how quickly they get bored and act out */
  boredomRate: number;         // 0.2 … 2.5
  /** chance they deliberately ignore you */
  stubbornness: number;        // 0 … 1
  /** how often they act without any prompt */
  spontaneity: number;         // 0.2 … 2.5

  /* ---- EYES & EXPRESSION ---- */
  /** eye pursuit responsiveness */
  eyeTracking: number;         // 0.4 … 2.2
  /** autonomous blink frequency */
  blinkRate: number;           // 0.2 … 3
  /** micro-saccade jitter */
  saccadeAmount: number;       // 0 … 2
  /** specular highlight strength */
  glintBrightness: number;     // 0.3 … 2
  /** how wide the eyes wander inside the face */
  eyeFreedom: number;          // 0.5 … 1.6
  /** show expressive animated mouths */
  showMouths: boolean;
  /** mouth size multiplier */
  mouthScale: number;            // 0.5 … 1.8
  /** eye size multiplier */
  eyeScale: number;              // 0.6 … 1.6
  /** show crying tears */
  showTears: boolean;
  /** show drool/saliva */
  showDrool: boolean;
  /** food orb size */
  foodSize: number;              // 0.5 … 2

  /* ---- SOCIAL ---- */
  /** allow them to start games together */
  allowGames: boolean;
  /** allow them to share/squabble over food */
  allowFoodDrama: boolean;
  /** how close they like to sit to each other */
  personalSpace: number;       // 0.4 … 1.8

  /* ---- LANGUAGE ---- */
  /** interface language: Russian by default */
  language: 'ru' | 'en';

  /* ---- AMBIENCE ---- */
  /** show ambient floating dust */
  showParticles: boolean;
  /** cursor volumetric glow */
  cursorGlow: boolean;
  /** relationship tether lines between creatures */
  showBonds: boolean;
  /** food shelf-life in seconds (0 = never spoils) */
  foodLifetime: number;        // 0 … 240
}

/** locked = always returns to center · free = stays where you leave it · auto = decides itself */
export type CenterMode = 'locked' | 'free' | 'auto';
