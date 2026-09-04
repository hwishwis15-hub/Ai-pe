import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ThemeConfig, ActiveTool, Settings, CenterMode } from '../types';
import { THEMES } from '../utils/themes';
import { soundFx } from '../utils/audio';
import { BEHAVIORS } from '../utils/eyeBehaviors';
import { t, tl, tp, getLanguage } from '../utils/i18n';
import {
  Sparkles,
  Target,
  Pointer,
  Utensils,
  Feather,
  Volume2,
  VolumeX,
  Palette,
  Settings2,
  EyeOff,
  Maximize2,
  Zap,
  Layers,
  Lock,
  Unlock,
  Orbit,
  Minus,
  Plus,
  ChevronUp,
  Check,
  Crosshair,
  Drama,
  Shuffle,
  Users,
  AudioWaveform,
  Bomb,
  Languages,
  Circle,
} from 'lucide-react';

interface ToolbarProps {
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  currentTheme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  onOpenSettings: () => void;
  onOpenCompanions: () => void;
  onOpenFx: () => void;
  companionCount: number;
  fxActive: boolean;
  onToggleUiHide: () => void;
  uiHidden: boolean;
}

type PopoverId = 'theme' | 'size' | 'anchor' | 'moods' | null;

const MOOD_GROUPS: { id: string; label: string; emoji: string; tint: string }[] = [
  { id: 'blink', label: 'Blinks', emoji: '👁', tint: 'bg-slate-400' },
  { id: 'attention', label: 'Attention', emoji: '🎯', tint: 'bg-sky-400' },
  { id: 'emotion', label: 'Emotion', emoji: '💗', tint: 'bg-rose-400' },
  { id: 'idle', label: 'Idle', emoji: '😴', tint: 'bg-indigo-400' },
  { id: 'playful', label: 'Playful', emoji: '✨', tint: 'bg-amber-400' },
  { id: 'wary', label: 'Wary', emoji: '🧐', tint: 'bg-orange-400' },
  { id: 'tech', label: 'Tech', emoji: '🤖', tint: 'bg-emerald-400' },
  { id: 'chaos', label: 'Chaos', emoji: '💫', tint: 'bg-fuchsia-400' },
  { id: 'rare', label: 'Rare', emoji: '🌟', tint: 'bg-yellow-300' },
];

const CENTER_MODES: { id: CenterMode; label: string; hint: string; icon: React.ElementType }[] = [
  { id: 'locked', label: 'Locked', hint: 'Always lives in the exact center', icon: Lock },
  { id: 'free', label: 'Free', hint: 'Stays wherever you drop it', icon: Unlock },
  { id: 'auto', label: 'Auto', hint: 'Roams free, returns home when ignored', icon: Orbit },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  currentTheme,
  setTheme,
  settings,
  setSettings,
  onOpenSettings,
  onOpenCompanions,
  onOpenFx,
  companionCount,
  fxActive,
  onToggleUiHide,
  uiHidden,
}) => {
  const [popover, setPopover] = useState<PopoverId>(null);
  const [anchorRect, setAnchorRect] = useState<{ left: number; top: number } | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Click-outside + Escape closes any open popover
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      // ignore clicks inside the toolbar
      if (rootRef.current?.contains(target)) return;
      // ignore clicks inside a portaled popover panel
      if (target?.closest('[data-penta-popover]')) return;
      setPopover(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPopover(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Stop pointer events from bubbling to document listener
  const handleRootPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  // Opens a popover anchored to the button that was clicked (fixed positioning,
  // so no ancestor can ever clip it) and closes any other one.
  const toggle = (id: Exclude<PopoverId, null>) => (e: React.MouseEvent<HTMLButtonElement>) => {
    if (popover === id) {
      setPopover(null);
      setAnchorRect(null);
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    setAnchorRect({ left: r.left + r.width / 2, top: r.top });
    setPopover(id);
  };

  const toggleSound = () => {
    const next = !settings.soundEnabled;
    setSettings((prev) => ({ ...prev, soundEnabled: next }));
    soundFx.setMuted(!next);
  };

  const callWindow = (fnName: string, arg?: string) => {
    const fn = (window as unknown as Record<string, unknown>)[fnName];
    if (typeof fn === 'function') (fn as (a?: string) => void)(arg);
  };

  const behaviorCount = BEHAVIORS.length;

  const setScale = (v: number) =>
    setSettings((prev) => ({ ...prev, creatureScale: Math.min(2, Math.max(0.5, +v.toFixed(2))) }));

  const nudgeScale = (delta: number) => setScale(settings.creatureScale + delta);



  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  };

  const activeMode = CENTER_MODES.find((m) => m.id === settings.centerMode)!;
  const ActiveModeIcon = activeMode.icon;

  // ------------------- Collapsed (wallpaper) mode -------------------
  if (uiHidden) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onToggleUiHide}
          className="group flex items-center gap-2.5 h-11 pl-3.5 pr-5 rounded-2xl bg-slate-950/70 backdrop-blur-2xl border border-white/12 text-white/90 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.9)] hover:border-white/25 transition-all active:scale-[0.97]"
          title="Show controls (H)"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[11px] font-semibold tracking-[0.14em] uppercase">
            Wallpaper mode
          </span>
        </button>
      </div>
    );
  }

  const sectionCls =
    'flex items-center gap-1 h-11 px-1.5 rounded-2xl bg-white/[0.045] border border-white/[0.07]';
  const ghostBtn =
    'h-8 w-8 shrink-0 grid place-items-center rounded-xl text-white/55 hover:text-white hover:bg-white/10 transition-all active:scale-90';
  const toolBtn = (active: boolean) =>
    `h-8 pl-2.5 pr-3 rounded-xl flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] transition-all active:scale-95 ${
      active
        ? 'bg-white text-slate-900 shadow-[0_4px_14px_-4px_rgba(255,255,255,0.6)]'
        : 'text-white/55 hover:text-white hover:bg-white/10'
    }`;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-1.5rem)] flex justify-center">
      <div ref={rootRef} onPointerDown={handleRootPointerDown} className="relative">
        {/* ---------------- Control Deck ---------------- */}
        {/* NOTE: no `overflow-hidden` here — popovers must be able to escape upward */}
        <div className="relative rounded-[26px] bg-slate-950/72 backdrop-blur-2xl border border-white/10 shadow-[0_24px_60px_-18px_rgba(0,0,0,0.95)]">
          {/* top hairline sheen */}
          <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          {/* subtle inner tint (clipped to the rounded card) */}
          <div className="pointer-events-none absolute inset-0 rounded-[26px] bg-gradient-to-b from-white/[0.06] to-transparent" />

          <div className="relative flex flex-wrap items-center justify-center gap-2 p-2 text-white">
            {/* ==== 1. Interaction tools ==== */}
            <div className={sectionCls}>
              <button onClick={() => setActiveTool('none')} className={toolBtn(activeTool === 'none')} title={`${t('tool.trackTip')} (1)`}>
                <Pointer className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">{t('tool.track')}</span>
              </button>
              <button
                onClick={() => setActiveTool('laser')}
                className={`${toolBtn(activeTool === 'laser')} ${activeTool === 'laser' ? '!bg-red-400 !text-red-950 shadow-[0_4px_14px_-4px_rgba(248,113,113,0.8)]' : ''}`}
                title={`${t('tool.laserTip')} (2)`}
              >
                <Target className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">{t('tool.laser')}</span>
              </button>
              <button
                onClick={() => setActiveTool('food')}
                className={`${toolBtn(activeTool === 'food')} ${activeTool === 'food' ? '!bg-amber-300 !text-amber-950 shadow-[0_4px_14px_-4px_rgba(252,211,77,0.8)]' : ''}`}
                title={`${t('tool.feedTip')} (3)`}
              >
                <Utensils className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">{t('tool.feed')}</span>
              </button>
              <button
                onClick={() => setActiveTool('ball')}
                className={`${toolBtn(activeTool === 'ball')} ${activeTool === 'ball' ? '!bg-sky-400 !text-sky-950 shadow-[0_4px_14px_-4px_rgba(56,189,248,0.85)]' : ''}`}
                title={`${t('tool.ballTip')} (5)`}
              >
                <Circle className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">{t('tool.ball')}</span>
              </button>
              <button
                onClick={() => setActiveTool('tickle')}
                className={`${toolBtn(activeTool === 'tickle')} ${activeTool === 'tickle' ? '!bg-pink-300 !text-pink-950 shadow-[0_4px_14px_-4px_rgba(249,168,212,0.8)]' : ''}`}
                title={`${t('tool.tickleTip')} (4)`}
              >
                <Feather className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">{t('tool.tickle')}</span>
              </button>
              <button
                onClick={() => setActiveTool('burst')}
                className={`${toolBtn(activeTool === 'burst')} ${activeTool === 'burst' ? '!bg-rose-400 !text-rose-950 shadow-[0_4px_14px_-4px_rgba(251,113,133,0.85)]' : ''}`}
                title={t('tool.burstTip') + ' (6 / X)'}
              >
                <Bomb className="h-3.5 w-3.5 text-rose-300" />
                <span className="hidden xl:inline">{t('tool.burst')}</span>
              </button>
            </div>

            {/* ==== 2. Actions ==== */}
            <div className={sectionCls}>
              <button
                onClick={() => callWindow('pentaJump')}
                className={ghostBtn}
                title={`${t('act.jump')} (Space)`}
              >
                <Zap className="h-4 w-4 text-indigo-300" />
              </button>
              <span className="h-5 w-px bg-white/10" />
              <button
                onClick={() => callWindow('pentaTriggerEye')}
                className={ghostBtn}
                title={`${t('act.eyes')} (E)`}
              >
                <Sparkles className="h-4 w-4 text-purple-300" />
              </button>
              <span className="h-5 w-px bg-white/10" />
              <button
                onClick={toggle('moods')}
                className={`${ghostBtn} ${popover === 'moods' ? '!bg-white !text-slate-900' : ''}`}
                title={t('act.library')}
              >
                <Drama className={`h-4 w-4 ${popover === 'moods' ? 'text-slate-900' : 'text-pink-300'}`} />
              </button>
              <span className="h-5 w-px bg-white/10" />
              <button
                onClick={() => setSettings((p) => ({ ...p, showShadow: !p.showShadow }))}
                className={`${ghostBtn} ${settings.showShadow ? 'text-white' : ''}`}
                title="Ground shadow (S)"
              >
                <Layers
                  className={`h-4 w-4 ${settings.showShadow ? 'text-slate-100' : 'text-white/30'}`}
                />
              </button>
            </div>

            {/* behavior library popover */}
            {popover === 'moods' && (
              <Popover width={330} align="center" anchor={anchorRect}>
                <div className="flex items-baseline justify-between px-3.5 pt-3 pb-2">
                  <span className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/35">
                    {tl('Behavior Library')}
                  </span>
                  <span className="text-[9.5px] font-mono text-purple-300/70">
                    {behaviorCount} {tl('routines')}
                  </span>
                </div>
                <div className="px-2.5 pb-2 grid grid-cols-3 gap-1.5">
                  {MOOD_GROUPS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => callWindow('pentaPlayCategory', g.id)}
                      className="group flex flex-col items-center gap-1 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.14] border border-white/[0.06] hover:border-white/20 transition-all active:scale-95"
                    >
                      <span className="text-base leading-none">{g.emoji}</span>
                      <span className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-white/60 group-hover:text-white">
                        {g.label}
                      </span>
                      <span className={`h-[2px] w-5 rounded-full ${g.tint} opacity-50 group-hover:opacity-100`} />
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => callWindow('pentaTriggerEye')}
                  className="mx-2.5 mb-2.5 h-8 w-[calc(100%-1.25rem)] rounded-xl bg-purple-500/25 hover:bg-purple-500/40 border border-purple-400/30 text-[10.5px] font-bold uppercase tracking-[0.1em] text-purple-100 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Shuffle className="h-3.5 w-3.5" /> {tl('Surprise me')}
                </button>
              </Popover>
            )}

            {/* ==== 3. Size ==== */}
            <div className={`${sectionCls} relative`}>
              <button
                onClick={toggle('size')}
                className={`h-8 pl-2.5 pr-2.5 rounded-xl flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.08em] transition-all ${
                  popover === 'size' ? 'bg-white text-slate-900' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="Creature size"
              >
                <Crosshair className="h-3.5 w-3.5" />
                <span className="font-mono tabular-nums text-[11px] tracking-normal">
                  {Math.round(settings.creatureScale * 100)}%
                </span>
                <ChevronUp
                  className={`h-3 w-3 transition-transform ${popover === 'size' ? 'rotate-180' : ''}`}
                />
              </button>

              {popover === 'size' && (
                <Popover width={268} align="left" anchor={anchorRect}>
                  <PopoverTitle>{tl('Body Scale')}</PopoverTitle>
                  <div className="flex items-center gap-2.5 px-3 pb-3">
                    <button onClick={() => nudgeScale(-0.05)} className="size-step" title="Smaller">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.05"
                      value={settings.creatureScale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="flex-1 accent-white"
                    />
                    <button onClick={() => nudgeScale(0.05)} className="size-step" title="Bigger">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="px-3 pb-3 flex flex-wrap gap-1.5">
                    {[
                      { l: 'S', v: 0.7 },
                      { l: 'M', v: 1 },
                      { l: 'L', v: 1.35 },
                      { l: 'XL', v: 1.75 },
                    ].map((p) => (
                      <button
                        key={p.l}
                        onClick={() => setScale(p.v)}
                        className={`flex-1 h-7 rounded-lg text-[10px] font-bold tracking-wider transition-all ${
                          Math.abs(settings.creatureScale - p.v) < 0.03
                            ? 'bg-white text-slate-900'
                            : 'bg-white/[0.07] text-white/60 hover:bg-white/15 hover:text-white'
                        }`}
                      >
                        {p.l}
                      </button>
                    ))}
                  </div>
                  <p className="px-3 pb-3 text-[10.5px] leading-relaxed text-white/35">
                    {tl('Scales the whole body — eyes and containment rescale automatically.')}
                  </p>
                </Popover>
              )}
            </div>

            {/* ==== 4. Anchor mode ==== */}
            <div className={`${sectionCls} relative`}>
              <button
                onClick={toggle('anchor')}
                className={`h-8 pl-2.5 pr-2.5 rounded-xl flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.08em] transition-all ${
                  popover === 'anchor'
                    ? 'bg-white text-slate-900'
                    : settings.centerMode === 'locked'
                    ? 'text-white/60 hover:text-white hover:bg-white/10'
                    : 'text-emerald-300 bg-emerald-400/10 hover:bg-emerald-400/20'
                }`}
                title="Screen anchoring (C)"
              >
                <ActiveModeIcon className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{tl(activeMode.label)}</span>
                <ChevronUp
                  className={`h-3 w-3 transition-transform ${popover === 'anchor' ? 'rotate-180' : ''}`}
                />
              </button>

              {popover === 'anchor' && (
                <Popover width={296} align="center" anchor={anchorRect}>
                  <PopoverTitle>{tl('Screen Anchoring')}</PopoverTitle>
                  <div className="px-2.5 pb-2 space-y-1">
                    {CENTER_MODES.map((m) => {
                      const Icon = m.icon;
                      const on = settings.centerMode === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            setSettings((p) => ({ ...p, centerMode: m.id }));
                            setPopover(null);
                          }}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                            on ? 'bg-white/[0.13] ring-1 ring-white/20' : 'hover:bg-white/[0.07]'
                          }`}
                        >
                          <span
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                              on ? 'bg-emerald-400 text-emerald-950' : 'bg-white/[0.07] text-white/60'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                          <span className="block text-[11.5px] font-bold tracking-wide text-white/95">
                            {tp(m.label)}
                          </span>
                          <span className="block text-[10.5px] leading-snug text-white/40">
                            {tl(m.hint)}
                          </span>
                          </span>
                          {on && <Check className="h-4 w-4 shrink-0 text-emerald-300" />}
                        </button>
                      );
                    })}
                  </div>
                  {settings.centerMode === 'auto' && (
                    <div className="px-3.5 pb-3">
                      <div className="flex items-center justify-between text-[10.5px] font-semibold text-white/50 pb-1.5">
                        <span>{tl('Return after idle')}</span>
                        <span className="font-mono text-emerald-300">{settings.autoReturnDelay}s</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="45"
                        step="1"
                        value={settings.autoReturnDelay}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, autoReturnDelay: parseInt(e.target.value) }))
                        }
                        className="w-full accent-emerald-400"
                      />
                    </div>
                  )}
                  <button
                    onClick={() => {
                      callWindow('pentaRecenter');
                      setPopover(null);
                    }}
                    className="mx-2.5 mb-2.5 h-8 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] text-[10.5px] font-bold uppercase tracking-[0.1em] text-white/75 hover:text-white transition-all flex items-center justify-center gap-1.5"
                  >
                    <Crosshair className="h-3.5 w-3.5" /> {tl('Snap to center now')}
                  </button>
                </Popover>
              )}
            </div>

            {/* ==== 5. Theme ==== */}
            <div className={`${sectionCls} relative`}>
              <button
                onClick={toggle('theme')}
                className={`h-8 pl-2.5 pr-2.5 rounded-xl flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.08em] transition-all ${
                  popover === 'theme' ? 'bg-white text-slate-900' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="Environment"
              >
                <Palette className="h-3.5 w-3.5" />
                <span className="hidden lg:inline max-w-[112px] truncate">{currentTheme.name}</span>
                <ChevronUp
                  className={`h-3 w-3 transition-transform ${popover === 'theme' ? 'rotate-180' : ''}`}
                />
              </button>

              {popover === 'theme' && (
                <Popover width={316} align="right" anchor={anchorRect}>
                  <PopoverTitle>{tl('Environments')}</PopoverTitle>
                  <div className="p-2.5 grid grid-cols-2 gap-1.5">
                    {THEMES.map((t) => {
                      const on = currentTheme.id === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setTheme(t);
                            setPopover(null);
                          }}
                          className={`group flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                            on ? 'bg-white/[0.14] ring-1 ring-white/20' : 'hover:bg-white/[0.07]'
                          }`}
                        >
                          <span
                            className="relative h-9 w-9 shrink-0 rounded-lg border border-white/15 shadow-inner overflow-hidden"
                            style={{
                              background: `linear-gradient(150deg, ${t.bgGradient[0]}, ${
                                t.bgGradient[t.bgGradient.length - 1]
                              })`,
                            }}
                          >
                            <span
                              className="absolute inset-x-0 bottom-0 h-1.5"
                              style={{ background: t.particleColor }}
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[11px] font-semibold leading-tight text-white/90 truncate">
                              {t.name}
                            </span>
                            <span className="block text-[9.5px] uppercase tracking-[0.12em] text-white/35">
                              {t.category}
                            </span>
                          </span>
                          {on && <Check className="h-3.5 w-3.5 shrink-0 text-emerald-300" />}
                        </button>
                      );
                    })}
                  </div>
                </Popover>
              )}
            </div>

            {/* ==== 6. System ==== */}
            <div className={sectionCls}>
              <button onClick={toggleSound} className={ghostBtn} title="Sound">
                {settings.soundEnabled ? (
                  <Volume2 className="h-4 w-4 text-emerald-300" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={onOpenCompanions}
                className={`${ghostBtn} relative`}
                title="Companions — add a child or another adult"
              >
                <Users className="h-4 w-4 text-fuchsia-300" />
                {companionCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-fuchsia-500 text-[8px] font-bold text-white">
                    {companionCount}
                  </span>
                )}
              </button>
              <button
                onClick={onOpenFx}
                className={ghostBtn}
                title="Effects & Sound — ripples, thuds, crunches"
              >
                <AudioWaveform className={`h-4 w-4 ${fxActive ? 'text-cyan-300' : 'text-white/35'}`} />
              </button>
              <button
                onClick={() =>
                  setSettings((p) => ({ ...p, language: p.language === 'ru' ? 'en' : 'ru' }))
                }
                className={ghostBtn}
                title={settings.language === 'ru' ? 'Русский / English' : 'English / Русский'}
              >
                <Languages className="h-4 w-4 text-emerald-300" />
              </button>
              <button onClick={onOpenSettings} className={ghostBtn} title={t('act.settings')}>
                <Settings2 className="h-4 w-4 text-white/70" />
              </button>
              <button onClick={toggleFullscreen} className={`${ghostBtn} hidden sm:grid`} title="Fullscreen">
                <Maximize2 className="h-4 w-4 text-white/70" />
              </button>
              <span className="h-5 w-px bg-white/10" />
              <button onClick={onToggleUiHide} className={ghostBtn} title="Wallpaper mode (H)">
                <EyeOff className="h-4 w-4 text-white/70" />
              </button>
            </div>
          </div>
        </div>

        {/* micro-caption */}
        <div className="mt-2 hidden md:flex items-center justify-center gap-3 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-white/25">
          <span>Space · {getLanguage() === 'ru' ? 'прыжок' : 'jump'}</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>E · {getLanguage() === 'ru' ? 'мимика' : 'expression'}</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span className="text-rose-400/80">X · {getLanguage() === 'ru' ? 'взрыв' : 'burst'}</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span className="text-purple-300/40">Q W R T Y U I O P · moods</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>C · anchor</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>H · wallpaper</span>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Popover shell (fixed-positioned, clipping-proof) ---------------- */
const Popover: React.FC<{
  children: React.ReactNode;
  width: number;
  anchor: { left: number; top: number } | null;
  align?: 'left' | 'center' | 'right';
}> = ({ children, width, anchor, align = 'center' }) => {
  // Horizontal position, clamped so the panel always stays on screen
  const margin = 12;
  let left: number;
  if (align === 'left') left = (anchor?.left ?? 0) - 24;
  else if (align === 'right') left = (anchor?.left ?? 0) - width + 24;
  else left = (anchor?.left ?? window.innerWidth / 2) - width / 2;

  left = Math.min(Math.max(left, margin), window.innerWidth - width - margin);

  // Distance from the bottom of the viewport up to just above the trigger
  const bottom = anchor ? window.innerHeight - anchor.top + 12 : 80;

  return createPortal(
    <div
      data-penta-popover=""
      style={{ width, left, bottom }}
      className="fixed z-[9999] rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-white/15 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.95)] overflow-hidden animate-pop-in"
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      {children}
    </div>,
    document.body
  );
};

const PopoverTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-3.5 pt-3 pb-2 text-[9.5px] font-bold uppercase tracking-[0.2em] text-white/35">
    {children}
  </div>
);
