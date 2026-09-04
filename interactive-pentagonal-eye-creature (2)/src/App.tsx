import { useState, useEffect, useCallback } from 'react';
import { ThemeConfig, ActiveTool, Settings, CenterMode } from './types';
import { THEMES } from './utils/themes';
import { CreatureCanvas } from './components/CreatureCanvas';
import { Toolbar } from './components/Toolbar';
import { WidgetOverlay } from './components/WidgetOverlay';
import { SettingsModal } from './components/SettingsModal';
import { CompanionPanel } from './components/CompanionPanel';
import { FXPanel, FXSettings } from './components/FXPanel';
import { CreatureConfig } from './utils/creature';
import { soundFx } from './utils/audio';
import { setLanguage } from './utils/i18n';

export function App() {
  const [currentTheme, setTheme] = useState<ThemeConfig>(
    THEMES.find((t) => t.id === 'voidglow') ?? THEMES[0]
  );
  const [activeTool, setActiveTool] = useState<ActiveTool>('none');
  const [currentBehaviorName, setCurrentBehaviorName] = useState<string>('Organic Cursor Tracking');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCompanionsOpen, setIsCompanionsOpen] = useState<boolean>(false);
  const [companions, setCompanions] = useState<CreatureConfig[]>([]);
  const [isFxOpen, setIsFxOpen] = useState<boolean>(false);
  const [uiHidden, setUiHidden] = useState<boolean>(false);

  const [, setStats] = useState({
    happiness: 92,
    energy: 95,
    curiosity: 88,
  });

  const [settings, setSettings] = useState<Settings>({
    soundEnabled: true,
    ambientAudio: false,
    creatureScale: 1.0,
    cornerRoundness: 0.65,
    springStiffness: 0.12,
    eyeTrackingSpeed: 1.0,
    randomBehaviorRate: 3,
    bodyMaterial: 'matte',
    particlesCount: 45,
    showWidgets: true,
    showShadow: true,
    showRimLight: true,
    fpsCap: 60,
    centerMode: 'locked',
    autoReturnDelay: 12,

    motionEnergy: 1,
    maxSpeed: 18,
    restitution: 0.62,
    softBodyJiggle: 1,
    hoverBob: 1,
    turnTilt: 1,

    moodVolatility: 1,
    moodRecovery: 1,
    appetite: 1,
    socialDrive: 1,
    boredomRate: 1,
    stubbornness: 0.25,
    spontaneity: 1,

    eyeTracking: 1,
    blinkRate: 1,
    saccadeAmount: 1,
    glintBrightness: 1,
    eyeFreedom: 1,
    showMouths: true,
    mouthScale: 1,
    eyeScale: 1,
    showTears: true,
    showDrool: true,
    foodSize: 1,

    allowGames: true,
    allowFoodDrama: true,
    personalSpace: 1,

    language: 'ru',

    showParticles: true,
    cursorGlow: true,
    showBonds: true,
    foodLifetime: 100,
    showNicks: true,
  });

  const [fxs, setFxs] = useState<FXSettings>({
    impactRipple: true,
    impactSound: true,
    foodRipple: true,
    foodSound: true,
    masterSound: true,
  });

  // keep the audio engine's channels in sync with the FX panel
  useEffect(() => {
    soundFx.setChannels({
      master: fxs.masterSound && settings.soundEnabled,
      impact: fxs.impactSound,
      food: fxs.foodSound,
      voice: true,
    });
  }, [fxs, settings.soundEnabled]);

  // Global Keyboard Shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      if (typeof (window as unknown as { pentaJump?: () => void }).pentaJump === 'function') {
        (window as unknown as { pentaJump: () => void }).pentaJump();
      }
    } else if (e.key.toLowerCase() === 'e' || e.key.toLowerCase() === 'b') {
      if (typeof (window as unknown as { pentaTriggerEye?: () => void }).pentaTriggerEye === 'function') {
        (window as unknown as { pentaTriggerEye: () => void }).pentaTriggerEye();
      }
    } else if (e.key.toLowerCase() === 'h') {
      setUiHidden((prev) => !prev);
    } else if (e.key.toLowerCase() === 's') {
      setSettings((prev) => ({ ...prev, showShadow: !prev.showShadow }));
    } else if (e.key.toLowerCase() === 'c') {
      setSettings((prev) => {
        const order: CenterMode[] = ['locked', 'free', 'auto'];
        const next = order[(order.indexOf(prev.centerMode) + 1) % order.length];
        return { ...prev, centerMode: next };
      });
    } else if (e.key === '+' || e.key === '=') {
      setSettings((prev) => ({
        ...prev,
        creatureScale: Math.min(2, +(prev.creatureScale + 0.05).toFixed(2)),
      }));
    } else if (e.key === '-' || e.key === '_') {
      setSettings((prev) => ({
        ...prev,
        creatureScale: Math.max(0.5, +(prev.creatureScale - 0.05).toFixed(2)),
      }));
    } else if (e.key === '1') {
      setActiveTool('none');
    } else if (e.key === '2') {
      setActiveTool('laser');
    } else if (e.key === '3') {
      setActiveTool('food');
    } else if (e.key === '4') {
      setActiveTool('tickle');
    } else if (e.key === '6') {
      setActiveTool('burst');
    } else if (e.key.toLowerCase() === 'x') {
      const fn = (window as unknown as { pentaTriggerBurst?: () => void }).pentaTriggerBurst;
      if (typeof fn === 'function') fn();
    } else {
      // Q W R T Y U I O P → play a specific behavior category
      const catKeys: Record<string, string> = {
        q: 'blink', w: 'attention', r: 'emotion', t: 'idle', y: 'playful',
        u: 'wary', i: 'tech', o: 'chaos', p: 'rare',
      };
      const cat = catKeys[e.key.toLowerCase()];
      if (cat) {
        const fn = (window as unknown as Record<string, unknown>).pentaPlayCategory;
        if (typeof fn === 'function') (fn as (c: string) => void)(cat);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Язык интерфейса (русский по умолчанию) — применяется мгновенно
  const [langTick, setLangTick] = useState(0);
  useEffect(() => {
    setLanguage(settings.language);
    setLangTick((v) => v + 1);
  }, [settings.language]);

  return (
    <div
      key={`lang-${langTick}`}
      className="relative w-screen h-screen overflow-hidden select-none font-sans bg-slate-950"
    >

      {/* HTML5 Canvas Rendering Engine */}
      <CreatureCanvas
        theme={currentTheme}
        settings={settings}
        activeTool={activeTool}
        companions={companions}
        fxs={fxs}
        onBehaviorChange={setCurrentBehaviorName}
        onStatsUpdate={setStats}
        onTintChange={(id, tint) => setCompanions((prev) => prev.map((c) => (c.id === id ? { ...c, tint } : c)))}
        onNameChange={(id, name) => setCompanions((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)))}
      />

      {/* Top Floating Widget HUD */}
      <WidgetOverlay
        currentBehaviorName={currentBehaviorName}
        uiHidden={uiHidden}
        centerMode={settings.centerMode}
        creatureScale={settings.creatureScale}
      />

      {/* Bottom Floating Glass Control Toolbar */}
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        currentTheme={currentTheme}
        setTheme={setTheme}
        settings={settings}
        setSettings={setSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCompanions={() => setIsCompanionsOpen(true)}
        onOpenFx={() => setIsFxOpen(true)}
        fxActive={fxs.masterSound && (fxs.impactRipple || fxs.foodRipple || fxs.impactSound || fxs.foodSound)}
        companionCount={companions.length}
        onToggleUiHide={() => setUiHidden((prev) => !prev)}
        uiHidden={uiHidden}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
        themeId={currentTheme.id}
        onTheme={(id) => {
          const t = THEMES.find((x) => x.id === id);
          if (t) setTheme(t);
        }}
      />

      {/* Companion manager */}
      <CompanionPanel
        isOpen={isCompanionsOpen}
        onClose={() => setIsCompanionsOpen(false)}
        companions={companions}
        setCompanions={setCompanions}
      />

      {/* Effects & Sound panel */}
      <FXPanel
        isOpen={isFxOpen}
        onClose={() => setIsFxOpen(false)}
        fx={{ ...fxs, allowGames: settings.allowGames, allowFoodDrama: settings.allowFoodDrama }}
        setFx={setFxs}
      />

    </div>
  );
}

export default App;
