import React, { useState } from 'react';
import { Settings } from '../types';
import { THEMES } from '../utils/themes';
import { soundFx } from '../utils/audio';
import { t, tl, getLanguage } from '../utils/i18n';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  themeId?: string;
  onTheme?: (id: string) => void;
}

/* ---------------- primitives ---------------- */

const Slider: React.FC<{
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  fmt?: (v: number) => string;
  onChange: (v: number) => void;
  accent?: string;
}> = ({ label, hint, value, min, max, step = 0.01, fmt, onChange, accent = '#818cf8' }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="group">
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-semibold text-white/80">{tl(label)}</span>
        <span
          className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md tabular-nums"
          style={{ color: accent, background: `${accent}18` }}
        >
          {fmt ? fmt(value) : value.toFixed(2)}
        </span>
      </div>
      {hint && <p className="text-[9.5px] text-white/30 leading-tight mb-1.5 -mt-0.5">{tl(hint)}</p>}
      <div className="relative h-4 flex items-center">
        <div className="absolute inset-x-0 h-[3px] rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: `linear-gradient(90deg,${accent}66,${accent})` }}
          />
        </div>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="relative w-full opacity-0 cursor-pointer"
          style={{ height: 16 }}
        />
        <div
          className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-md pointer-events-none transition-transform group-hover:scale-110"
          style={{ left: `calc(${pct}% - 7px)` }}
        />
      </div>
    </div>
  );
};

const Toggle: React.FC<{
  label: string;
  hint?: string;
  on: boolean;
  onChange: () => void;
  accent?: string;
}> = ({ label, hint, on, onChange, accent = '#34d399' }) => (
  <button
    onClick={onChange}
    className={`w-full flex items-center justify-between gap-3 py-2 px-2.5 rounded-xl border transition-all ${
      on ? 'bg-white/[0.07] border-white/15' : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
    }`}
  >
    <span className="text-left min-w-0">
      <span className="block text-[11px] font-semibold text-white/85">{tl(label)}</span>
      {hint && <span className="block text-[9.5px] text-white/30 leading-tight">{tl(hint)}</span>}
    </span>
    <span
      className="relative w-9 h-5 rounded-full shrink-0 transition-all"
      style={{ background: on ? accent : 'rgba(255,255,255,0.14)' }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
        style={{ left: on ? 19 : 2 }}
      />
    </span>
  </button>
);

const Seg: React.FC<{
  label: string;
  options: { v: string; l: string }[];
  value: string;
  onChange: (v: string) => void;
  accent?: string;
}> = ({ label, options, value, onChange, accent = '#818cf8' }) => (
  <div>
    <span className="block text-[11px] font-semibold text-white/80 mb-1.5">{tl(label)}</span>
    <div className="grid grid-cols-2 gap-1.5">
      {options.map((o) => {
        const on = value === o.v;
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className="py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all"
            style={{
              background: on ? `${accent}30` : 'rgba(255,255,255,0.03)',
              borderColor: on ? `${accent}88` : 'rgba(255,255,255,0.07)',
              color: on ? '#fff' : 'rgba(255,255,255,0.45)',
            }}
          >
            {tl(o.l)}
          </button>
        );
      })}
    </div>
  </div>
);

const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="rounded-2xl bg-white/[0.025] border border-white/[0.06] p-3 space-y-3">
    <div className="flex items-center gap-2 pb-1 border-b border-white/[0.06]">
      <span className="text-sm leading-none">{icon}</span>
      <span className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-white/45">{tl(title)}</span>
    </div>
    {children}
  </div>
);

/* ---------------- tabs ---------------- */

const TABS = [
  { id: 'body', label: 'Body', icon: '🔺' },
  { id: 'motion', label: 'Motion', icon: '💫' },
  { id: 'mind', label: 'Mind', icon: '🧠' },
  { id: 'eyes', label: 'Eyes', icon: '👁' },
  { id: 'social', label: 'Social', icon: '🤝' },
  { id: 'scene', label: 'Scene', icon: '🌌' },
  { id: 'lang', label: 'Lang', icon: '🌐' },
] as const;

type TabId = typeof TABS[number]['id'];

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, setSettings, themeId, onTheme }) => {
  const [tab, setTab] = useState<TabId>('body');
  if (!isOpen) return null;

  const s = settings;
  const set = (p: Partial<Settings>) => setSettings((prev) => ({ ...prev, ...p }));

  const handleAmbient = (checked: boolean) => {
    set({ ambientAudio: checked });
    soundFx.toggleAmbient(checked);
  };

  return (
    <div className="fixed inset-0 z-[9997] flex items-center justify-center p-3 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl h-[min(680px,calc(100vh-1.5rem))] flex flex-col rounded-3xl bg-[#0a0b12]/95 backdrop-blur-2xl border border-white/12 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)] text-white overflow-hidden">

        {/* ---- header ---- */}
        <div className="shrink-0 relative">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
          <div className="flex items-center justify-between px-4 pt-3.5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/20 border border-white/10">
                <span className="text-[15px] leading-none">🔺</span>
              </div>
              <div>
                <h2 className="text-[15px] font-bold tracking-tight leading-none">{t('set.title')}</h2>
                <p className="text-[10px] text-white/35 mt-0.5">{t('set.subtitle')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.13] text-white/60 hover:text-white transition-all active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ---- tab bar ---- */}
          <div className="px-3 pb-2.5 flex gap-1 overflow-x-auto settings-scroll">
            {TABS.map((tb) => {
              const on = tab === tb.id;
              return (
                <button
                  key={tb.id}
                  onClick={() => setTab(tb.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10.5px] font-bold uppercase tracking-[0.08em] transition-all ${
                    on
                      ? 'bg-white text-slate-900 shadow-[0_4px_14px_-4px_rgba(255,255,255,0.4)]'
                      : 'text-white/45 hover:text-white/80 hover:bg-white/[0.07]'
                  }`}
                >
                  <span className="text-[12px] leading-none">{tb.icon}</span>
                  {tb.id === 'body' ? t('set.tabBody')
                    : tb.id === 'motion' ? t('set.tabMotion')
                    : tb.id === 'mind' ? t('set.tabMind')
                    : tb.id === 'eyes' ? t('set.tabEyes')
                    : tb.id === 'social' ? t('set.tabSocial')
                    : tb.id === 'scene' ? t('set.tabScene')
                    : t('set.tabLang')}
                </button>
              );
            })}
          </div>
          <div className="h-px bg-white/[0.07]" />
        </div>

        {/* ---- body ---- */}
        <div className="flex-1 overflow-y-auto settings-scroll px-4 py-3.5 min-h-0">
          {tab === 'body' && (
            <div className="space-y-3">
              <Section title="Shape & Size" icon="📐">
                <Slider label="Creature size" hint="Scales the whole body, eyes included" value={s.creatureScale}
                  min={0.5} max={2} step={0.05} fmt={(v) => `${Math.round(v * 100)}%`} accent="#818cf8"
                  onChange={(v) => set({ creatureScale: v })} />
                <Slider label="Corner softness" hint="How rounded the five edges are" value={s.cornerRoundness}
                  min={0.1} max={1} step={0.05} fmt={(v) => `${Math.round(v * 100)}%`} accent="#818cf8"
                  onChange={(v) => set({ cornerRoundness: v })} />
                <Slider label="Soft-body jiggle" hint="How much the silhouette wobbles and deforms" value={s.softBodyJiggle}
                  min={0} max={1.6} step={0.05} fmt={(v) => `${Math.round(v * 100)}%`} accent="#a78bfa"
                  onChange={(v) => set({ softBodyJiggle: v })} />
              </Section>

              <Section title="Material" icon="🎨">
                <Seg label="Surface finish" value={s.bodyMaterial} accent="#f472b6"
                  options={[
                    { v: 'matte', l: 'Matte' }, { v: 'glossy', l: 'Glossy' },
                    { v: 'glowing', l: 'Glow' }, { v: 'hologram', l: 'Holo' },
                  ]}
                  onChange={(v) => set({ bodyMaterial: v as Settings['bodyMaterial'] })} />
                <Toggle label="Rim outline" hint="Subtle contour highlight on the edge" on={s.showRimLight}
                  onChange={() => set({ showRimLight: !s.showRimLight })} accent="#22d3ee" />
                <Toggle label="Ground shadow" hint="Contact shadow plus lifted airborne shadow" on={s.showShadow}
                  onChange={() => set({ showShadow: !s.showShadow })} accent="#22d3ee" />
              </Section>
            </div>
          )}

          {tab === 'motion' && (
            <div className="space-y-3">
              <Section title="Flight" icon="🕊️">
                <Slider label="Motion energy" hint="Overall eagerness to move — the master liveliness dial" value={s.motionEnergy}
                  min={0.2} max={2.5} step={0.05} fmt={(v) => `×${v.toFixed(2)}`} accent="#34d399"
                  onChange={(v) => set({ motionEnergy: v })} />
                <Slider label="Top speed" hint="Fastest they can travel across the screen" value={s.maxSpeed}
                  min={4} max={30} step={0.5} fmt={(v) => v.toFixed(1)} accent="#34d399"
                  onChange={(v) => set({ maxSpeed: v })} />
                <Slider label="Hover bob" hint="Idle breathing float amplitude" value={s.hoverBob}
                  min={0} max={2.5} step={0.05} fmt={(v) => `${Math.round(v * 100)}%`} accent="#34d399"
                  onChange={(v) => set({ hoverBob: v })} />
                <Slider label="Turn tilt" hint="How much they lean into direction changes" value={s.turnTilt}
                  min={0} max={2} step={0.05} fmt={(v) => `${Math.round(v * 100)}%`} accent="#34d399"
                  onChange={(v) => set({ turnTilt: v })} />
              </Section>

              <Section title="Physics" icon="⚙️">
                <Slider label="Body spring" hint="Stiffness of the squash-and-stretch springs" value={s.springStiffness}
                  min={0.03} max={0.35} step={0.005} fmt={(v) => v.toFixed(3)} accent="#fbbf24"
                  onChange={(v) => set({ springStiffness: v })} />
                <Slider label="Wall bounce" hint="Energy kept when ricocheting off an edge" value={s.restitution}
                  min={0.2} max={0.95} step={0.01} fmt={(v) => `${Math.round(v * 100)}%`} accent="#fbbf24"
                  onChange={(v) => set({ restitution: v })} />
              </Section>

              <Section title="Anchoring" icon="📍">
                <Seg label="Where it lives" value={s.centerMode} accent="#60a5fa"
                  options={[
                    { v: 'locked', l: 'Centered' }, { v: 'free', l: 'Free roam' }, { v: 'auto', l: 'Auto' },
                  ]}
                  onChange={(v) => set({ centerMode: v as Settings['centerMode'] })} />
                {s.centerMode === 'auto' && (
                  <Slider label="Idle return delay" hint="Seconds of being ignored before it drifts home" value={s.autoReturnDelay}
                    min={4} max={60} step={1} fmt={(v) => `${v}s`} accent="#60a5fa"
                    onChange={(v) => set({ autoReturnDelay: v })} />
                )}
              </Section>
            </div>
          )}

          {tab === 'mind' && (
            <div className="space-y-3">
              <Section title="Temperament" icon="🧠">
                <Slider label="Mood volatility" hint="How hard events push their emotions around" value={s.moodVolatility}
                  min={0.2} max={2.2} step={0.05} fmt={(v) => `×${v.toFixed(2)}`} accent="#c084fc"
                  onChange={(v) => set({ moodVolatility: v })} />
                <Slider label="Mood recovery" hint="How quickly they calm back to neutral" value={s.moodRecovery}
                  min={0.3} max={2.5} step={0.05} fmt={(v) => `×${v.toFixed(2)}`} accent="#c084fc"
                  onChange={(v) => set({ moodRecovery: v })} />
                <Slider label="Behavior rate" hint="Base tempo of self-initiated impulses" value={s.randomBehaviorRate}
                  min={1} max={5} step={1} fmt={(v) => `level ${v}`} accent="#c084fc"
                  onChange={(v) => set({ randomBehaviorRate: v })} />
                <Slider label="Spontaneity" hint="Extra unprompted antics on top of the base tempo" value={s.spontaneity}
                  min={0.2} max={2.5} step={0.05} fmt={(v) => `×${v.toFixed(2)}`} accent="#c084fc"
                  onChange={(v) => set({ spontaneity: v })} />
              </Section>

              <Section title="Drives" icon="🎯">
                <Slider label="Appetite" hint="Baseline hunger — how much food tempts them" value={s.appetite}
                  min={0.2} max={2} step={0.05} fmt={(v) => `×${v.toFixed(2)}`} accent="#fb923c"
                  onChange={(v) => set({ appetite: v })} />
                <Slider label="Social drive" hint="How eagerly they seek out each other" value={s.socialDrive}
                  min={0} max={2} step={0.05} fmt={(v) => `×${v.toFixed(2)}`} accent="#fb923c"
                  onChange={(v) => set({ socialDrive: v })} />
                <Slider label="Boredom rate" hint="How fast they get restless without stimulation" value={s.boredomRate}
                  min={0.2} max={2.5} step={0.05} fmt={(v) => `×${v.toFixed(2)}`} accent="#fb923c"
                  onChange={(v) => set({ boredomRate: v })} />
                <Slider label="Stubbornness" hint="Chance they simply ignore your clicks" value={s.stubbornness}
                  min={0} max={1} step={0.01} fmt={(v) => `${Math.round(v * 100)}%`} accent="#fb923c"
                  onChange={(v) => set({ stubbornness: v })} />
              </Section>

              <Section title="Voice" icon="🔊">
                <Toggle label="Sound effects" hint="Master audio switch" on={s.soundEnabled}
                  onChange={() => {
                    set({ soundEnabled: !s.soundEnabled });
                    soundFx.setMuted(s.soundEnabled);
                  }} accent="#10b981" />
                <Toggle label="Ambient soundscape" hint="Warm low sine drone in the background" on={s.ambientAudio}
                  onChange={() => handleAmbient(!s.ambientAudio)}
                  accent="#10b981" />
              </Section>
            </div>
          )}

          {tab === 'eyes' && (
            <div className="space-y-3">
              <Section title="Gaze" icon="👁">
                <Slider label="Eye tracking" hint="How sharply the eyes follow the cursor" value={s.eyeTracking}
                  min={0.4} max={2.2} step={0.05} fmt={(v) => `×${v.toFixed(2)}`} accent="#38bdf8"
                  onChange={(v) => set({ eyeTracking: v })} />
                <Slider label="Eye freedom" hint="How far the eyes may wander inside the face" value={s.eyeFreedom}
                  min={0.5} max={1.6} step={0.02} fmt={(v) => `${Math.round(v * 100)}%`} accent="#38bdf8"
                  onChange={(v) => set({ eyeFreedom: v })} />
                <Slider label="Eye scale" hint="Overall eye size multiplier" value={s.eyeScale}
                  min={0.6} max={1.6} step={0.02} fmt={(v) => `${Math.round(v * 100)}%`} accent="#38bdf8"
                  onChange={(v) => set({ eyeScale: v })} />
                <Slider label="Saccade jitter" hint="Tiny involuntary eye twitches" value={s.saccadeAmount}
                  min={0} max={2} step={0.05} fmt={(v) => `${Math.round(v * 100)}%`} accent="#38bdf8"
                  onChange={(v) => set({ saccadeAmount: v })} />
              </Section>

              <Section title="Expression" icon="✨">
                <Slider label="Blink rate" hint="How often they blink on their own" value={s.blinkRate}
                  min={0.2} max={3} step={0.05} fmt={(v) => `×${v.toFixed(2)}`} accent="#f472b6"
                  onChange={(v) => set({ blinkRate: v })} />
                <Slider label="Glint brightness" hint="Strength of the specular highlights" value={s.glintBrightness}
                  min={0.3} max={2} step={0.05} fmt={(v) => `×${v.toFixed(2)}`} accent="#f472b6"
                  onChange={(v) => set({ glintBrightness: v })} />
              </Section>

              <Section title="Mouth — realistic" icon="👄">
                <Toggle label="Show mouths" hint="Optional mood-driven realistic mouths for every creature" on={s.showMouths}
                  onChange={() => set({ showMouths: !s.showMouths })} accent="#f472b6" />
                <Slider label="Mouth scale" hint="Size of the mouth" value={s.mouthScale}
                  min={0.5} max={1.8} step={0.02} fmt={(v) => `${Math.round(v * 100)}%`} accent="#f472b6"
                  onChange={(v) => set({ mouthScale: v })} />
                <Toggle label="Show tears" hint="Tear drops when they cry" on={s.showTears}
                  onChange={() => set({ showTears: !s.showTears })} accent="#60a5fa" />
                <Toggle label="Show drool" hint="Saliva threads and droplets" on={s.showDrool}
                  onChange={() => set({ showDrool: !s.showDrool })} accent="#60a5fa" />
                <p className="text-[9.5px] text-white/30 leading-relaxed">
                  Рты показывают радость, улыбку, слёзы, грусть, зевки, жевание, облизывание, покусывание губы, язык, свист, поцелуй, отвращение и тошноту — очень редко, только если еда не понравилась. Всё анимируется реалистичными кривыми губ, зубами и языком.
                </p>
              </Section>
            </div>
          )}

          {tab === 'social' && (
            <div className="space-y-3">
              <Section title="Together" icon="🤝">
                <Toggle label="Allow games" hint="Tag, waltz, hide & seek, whispering and more" on={s.allowGames}
                  onChange={() => set({ allowGames: !s.allowGames })} accent="#f472b6" />
                <Toggle label="Food drama" hint="Jealousy and squabbles over stolen snacks" on={s.allowFoodDrama}
                  onChange={() => set({ allowFoodDrama: !s.allowFoodDrama })} accent="#f472b6" />
                <Slider label="Personal space" hint="How close they like to sit to each other" value={s.personalSpace}
                  min={0.4} max={1.8} step={0.05} fmt={(v) => `${Math.round(v * 100)}%`} accent="#f472b6"
                  onChange={(v) => set({ personalSpace: v })} />
              </Section>

              <Section title="Effects" icon="💥">
                <p className="text-[9.5px] text-white/30 leading-relaxed">
                  {tl('Collision and eating effects have their own dedicated panel — open it with the waveform button in the toolbar to tune ripples and sounds separately.')}
                </p>
              </Section>
            </div>
          )}

          {tab === 'lang' && (
            <div className="space-y-3">
              <Section title="Language" icon="🌐">
                <Seg label={t('l.language')} value={s.language} accent="#a78bfa"
                  options={[
                    { v: 'ru', l: t('opt.ru') }, { v: 'en', l: t('opt.en') },
                  ]}
                  onChange={(v) => set({ language: v as Settings['language'] })} />
                <p className="text-[9.5px] text-white/30 leading-relaxed">
                  {getLanguage() === 'ru'
                    ? 'Русский выбран по умолчанию. Перевод применяется ко всем панелям, настройкам, подсказкам и сообщениям о поведении.'
                    : 'Russian is the default. Translation applies to all panels, settings, tooltips and behavior messages.'}
                </p>
              </Section>
            </div>
          )}

          {tab === 'scene' && (
            <div className="space-y-3">
              <Section title="Environment" icon="🌌">
                <span className="block text-[11px] font-semibold text-white/80 mb-1.5">Backdrop theme</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {THEMES.map((t) => {
                    const on = themeId === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => onTheme?.(t.id)}
                        className="flex items-center gap-2 p-1.5 rounded-xl border transition-all hover:bg-white/[0.07]"
                        style={{
                          borderColor: on ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.07)',
                          background: on ? 'rgba(255,255,255,0.08)' : 'transparent',
                        }}
                      >
                        <span
                          className="h-8 w-8 shrink-0 rounded-lg border border-white/15"
                          style={{ background: `linear-gradient(150deg,${t.bgGradient[0]},${t.bgGradient[t.bgGradient.length - 1]})` }}
                        />
                        <span className="min-w-0 text-left">
                          <span className="block text-[10px] font-semibold text-white/85 truncate">{t.name}</span>
                          <span className="block text-[8.5px] uppercase tracking-[0.12em] text-white/30">{t.category}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[9.5px] text-white/30">
                  Themes are also switchable from the palette button in the toolbar.
                </p>
              </Section>

              <Section title="Ambience" icon="✨">
                <Toggle label="Floating dust" hint="Ambient particles drifting across the scene" on={s.showParticles}
                  onChange={() => set({ showParticles: !s.showParticles })} accent="#22d3ee" />
                <Toggle label="Cursor glow" hint="Volumetric light following the pointer" on={s.cursorGlow}
                  onChange={() => set({ cursorGlow: !s.cursorGlow })} accent="#22d3ee" />
                <Toggle label="Relationship bonds" hint="Dotted tethers drawn between interacting creatures" on={s.showBonds}
                  onChange={() => set({ showBonds: !s.showBonds })} accent="#22d3ee" />
                <Slider label="Particle count" hint="How much dust fills the air" value={s.particlesCount}
                  min={0} max={140} step={1} fmt={(v) => `${v}`} accent="#22d3ee"
                  onChange={(v) => set({ particlesCount: Math.round(v) })} />
              </Section>

              <Section title="Food" icon="⭐">
                <Slider label="Food size" hint="Size of dropped food orbs" value={s.foodSize}
                  min={0.5} max={2} step={0.05} fmt={(v) => `${Math.round(v * 100)}%`} accent="#fbbf24"
                  onChange={(v) => set({ foodSize: v })} />
                <Slider label="Snack shelf life" hint="Seconds before uneaten food fades away" value={s.foodLifetime}
                  min={0} max={240} step={5} fmt={(v) => (v === 0 ? 'forever' : `${v}s`)} accent="#fbbf24"
                  onChange={(v) => set({ foodLifetime: v })} />
              </Section>
            </div>
          )}
        </div>

        {/* ---- footer ---- */}
        <div className="shrink-0 px-4 py-2.5 border-t border-white/[0.07] flex items-center justify-between gap-3">
          <span className="text-[9.5px] text-white/25">
            {TABS.find((tb) => tb.id === tab)?.icon}{' '}
            {tab === 'body' ? t('set.tabBody')
              : tab === 'motion' ? t('set.tabMotion')
              : tab === 'mind' ? t('set.tabMind')
              : tab === 'eyes' ? t('set.tabEyes')
              : tab === 'social' ? t('set.tabSocial')
              : tab === 'scene' ? t('set.tabScene')
              : t('set.tabLang')}{' '}
            · {t('set.applies')}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-400 hover:to-fuchsia-400 text-white font-bold text-[11px] transition-all active:scale-95 shadow-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
