import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import { BEHAVIORS } from '../utils/eyeBehaviors';
import { t, tp, tl } from '../utils/i18n';
import type { RosterEntry } from './CreatureCanvas';

/** @deprecated — верхние статические шкалы удалены, оставлен для совместимости */
export const StatRow: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div className="flex items-center gap-2">
    <span className="text-[9px] font-semibold text-white/45 w-[64px] truncate">{label}</span>
    <div className="h-[3px] flex-1 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
      />
    </div>
    <span className="text-[9px] font-mono text-white/50 w-[26px] text-right tabular-nums">
      {Math.round(value)}
    </span>
  </div>
);

/** Маленькая полоска одной черты характера (0..1) */
const TraitBar: React.FC<{ label: string; v: number; color: string }> = ({
  label,
  v,
  color,
}) => (
  <div className="flex items-center gap-2">
    <span className="text-[8.5px] font-semibold text-white/40 w-[72px] truncate">{label}</span>
    <div className="h-[2.5px] flex-1 rounded-full bg-white/[0.08] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.max(2, Math.min(100, v * 100))}%`, background: color }}
      />
    </div>
    <span className="text-[8px] font-mono text-white/35 w-[22px] text-right tabular-nums">
      {Math.round(v * 100)}
    </span>
  </div>
);

interface WidgetOverlayProps {
  currentBehaviorName: string;
  uiHidden: boolean;
  centerMode: 'locked' | 'free' | 'auto';
  creatureScale: number;
}

const MOOD_EMOJI: Record<string, string> = {
  elated: '🤩', joyful: '😄', blissful: '😊', excited: '🤗', happy: '😃',
  content: '🙂', restless: '🫨', curious: '🧐', calm: '😌',
  irritable: '😒', uneasy: '😬', melancholy: '🥲', furious: '😡',
  grumpy: '😠', dejected: '😞',
};

const MIND_EMOJI: Record<string, string> = {
  serene: '🧘',
  curious: '🔍',
  playful: '🎈',
  hyper: '⚡',
  drowsy: '😪',
  moody: '🌧',
};

interface Bond {
  a: string;
  b: string;
  affinity: number;
  annoyance: number;
  games: number;
}

const ACTION_EMOJI: Record<string, string> = {
  'Coming over to you': '🫱',
  'Circling around you': '🌀',
  'Getting close & personal': '🤗',
  'Feeling teasing': '😜',
  'Hovering over you': '🛸',
  'Mirroring your position': '🪩',
  'Following you around': '🐾',
  'Investigating a corner': '🔎',
  'Patrolling the perimeter': '🛡️',
  'Peeking from the edge': '👀',
  'Spiralling inward': '🌪️',
  'Wandering off on its own': '🍃',
  'Settling down to rest': '🛋️',
  'ZOOMIES!!!': '🚀',
  'Sprinting across': '🏁',
  'Winding up a spin dash': '💫',
  'Bouncing to a rhythm': '🎵',
  'Freezing perfectly still': '🥶',
  'Keeping its distance': '🪞',
  'Startled — dashing away!': '💨',
  'Taking the centre stage': '🎪',
  'CHASING THE DOT!': '🔴',
  'Going for the snack': '⭐',
  'Answering your call': '📣',
  'A passing thought': '💭',
  'A brand-new notion': '✨',
  'Noticing something': '❕',
};

const MODE_META = {
  locked: { label: 'Locked', tone: 'text-white/70', dot: 'bg-white/50' },
  free: { label: 'Free Roam', tone: 'text-emerald-300', dot: 'bg-emerald-400' },
  auto: { label: 'Auto Pilot', tone: 'text-sky-300', dot: 'bg-sky-400' },
} as const;

export const WidgetOverlay: React.FC<WidgetOverlayProps> = ({
  currentBehaviorName,
  uiHidden,
  centerMode,
  creatureScale,
}) => {
  const [time, setTime] = useState<string>('');
  const [mindState, setMindState] = useState<string>('curious');
  const [intent, setIntent] = useState<string>('Observing the room');
  const [mood, setMood] = useState('content');
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [social, setSocial] = useState<string | null>(null);
  const [bond, setBond] = useState<Bond | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      const ms = (window as unknown as { pentaMindState?: string }).pentaMindState;
      if (ms) setMindState(ms);
      const it = (window as unknown as { pentaIntent?: string }).pentaIntent;
      if (it) setIntent(it);
      const md = (window as unknown as { pentaMood?: string }).pentaMood;
      if (md) setMood(md);
      const sc = (window as unknown as { pentaSocial?: string | null }).pentaSocial;
      setSocial(sc ?? null);
      const bd = (window as unknown as { pentaBond?: Bond | null }).pentaBond;
      setBond(bd ?? null);
      const rs = (window as unknown as { pentaRoster?: RosterEntry[] }).pentaRoster;
      if (rs) setRoster(rs);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (uiHidden) return null;

  return (
    <>
      {/* Top Left: Title & Active Eye Behavior Badge */}
      <div className="fixed top-6 left-6 z-40 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-950/40 backdrop-blur-xl border border-white/10 shadow-lg text-white">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-sm tracking-wider uppercase text-white/90">PENTA</span>
          <span className="text-xs text-white/40 font-mono">{tl('v2.5 AI COMPANION')}</span>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/35 backdrop-blur-md border border-white/8 text-xs text-white/80 w-fit max-w-[380px]">
          <Sparkles className="w-3.5 h-3.5 shrink-0 text-purple-400 animate-pulse" />
          <span className="font-semibold text-purple-200 truncate">{tp(currentBehaviorName)}</span>
          <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-purple-400/15 text-[9px] font-mono font-bold text-purple-300/80">
            {BEHAVIORS.length}
          </span>
        </div>

        {/* live intention — what the creature has decided to do */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950/30 backdrop-blur-md border border-white/5 text-[10.5px] w-fit max-w-[380px]">
          <span className="text-sm leading-none shrink-0">{ACTION_EMOJI[intent] ?? '🧠'}</span>
          <span className="text-white/55 font-semibold uppercase tracking-[0.1em] shrink-0">{t('hud.intent')}</span>
          <span className="text-amber-200/90 font-medium truncate">{tp(intent)}</span>
        </div>

        {/* social moment between creatures */}
        {social && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-fuchsia-950/30 backdrop-blur-md border border-fuchsia-400/15 text-[10.5px] w-fit max-w-[400px] animate-pop-in">
            <span className="text-sm leading-none shrink-0">🤝</span>
            <span className="text-fuchsia-300/70 font-semibold uppercase tracking-[0.1em] shrink-0">{t('hud.social')}</span>
            <span className="text-fuchsia-100/90 font-medium truncate">{tp(social)}</span>
          </div>
        )}

        {/* bond meter */}
        {bond && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/30 backdrop-blur-md border border-white/5 text-[10px] w-fit">
            <span className="text-white/60 font-semibold truncate max-w-[70px]">{bond.a}</span>
            <div className="relative h-[3px] w-20 rounded-full bg-white/10 overflow-hidden">
              <div
                className="absolute top-0 h-full rounded-full transition-all duration-700"
                style={{
                  left: bond.affinity >= 0 ? '50%' : `${50 + bond.affinity * 50}%`,
                  width: `${Math.abs(bond.affinity) * 50}%`,
                  background: bond.affinity >= 0
                    ? 'linear-gradient(90deg,#f472b6,#a78bfa)'
                    : 'linear-gradient(90deg,#f87171,#fb923c)',
                }}
              />
              <div className="absolute left-1/2 top-0 h-full w-px bg-white/25" />
            </div>
            <span className="text-white/60 font-semibold truncate max-w-[70px]">{bond.b}</span>
            <span className="text-white/25 font-mono">
              {bond.affinity >= 0 ? '♥' : '✖'}{Math.round(Math.abs(bond.affinity) * 100)}
            </span>
            {bond.games > 0 && (
              <span className="text-fuchsia-300/60 font-mono">·{bond.games}🎮</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950/25 backdrop-blur-md border border-white/5 text-[10px] font-semibold uppercase tracking-[0.12em] w-fit">
          <span className={`h-1.5 w-1.5 rounded-full ${MODE_META[centerMode].dot}`} />
          <span className={MODE_META[centerMode].tone}>{tl(MODE_META[centerMode].label)}</span>
          <span className="text-white/20">·</span>
          <span className="text-white/40 font-mono tracking-normal">
            {Math.round(creatureScale * 100)}%
          </span>
          <span className="text-white/20">·</span>
          <span className="flex items-center gap-1">
            <span className="text-sm leading-none">{MIND_EMOJI[mindState] ?? '🧠'}</span>
            <span className="text-fuchsia-300/80">{mindState}</span>
          </span>
          <span className="text-white/20">·</span>
          <span className="flex items-center gap-1" title={t('hud.mood')}>
            <span className="text-sm leading-none">{MOOD_EMOJI[mood] ?? '✨'}</span>
            <span className="text-rose-300/80">{tp(mood)}</span>
          </span>
        </div>
      </div>

      {/* Right: панели настроения для КАЖДОГО персонажа (не только Пенты) */}
      {roster.length > 0 && (
        <div className="fixed top-24 right-6 z-40 flex flex-col gap-2 pointer-events-none max-h-[calc(100vh-9rem)] overflow-y-auto settings-scroll pr-1">
          {roster.map((r, idx) => (
            <div
              key={r.id}
              className="w-[236px] rounded-2xl backdrop-blur-xl border shadow-lg px-3 py-2.5 animate-pop-in pointer-events-auto overflow-hidden relative"
              style={{
                background: `linear-gradient(135deg, ${r.tint}1E, rgba(2,6,23,0.68))`,
                borderColor: `${r.tint}55`,
                boxShadow: `0 8px 32px ${r.tint}20, inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}
            >
              {/* верхняя полоска — точь-в-точь цвет самой полоски метрики: градиент как у StatRow */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{
                  background:
                    r.tint === '#fb7185' || r.tint === '#f43f5e'
                      ? 'linear-gradient(90deg,#fb7185,#f43f5e)'
                      : r.tint === '#fbbf24' || r.tint === '#f59e0b'
                      ? 'linear-gradient(90deg,#fbbf24,#f59e0b)'
                      : 'linear-gradient(90deg,#38bdf8,#0ea5e9)',
                }}
              />
              {/* Имя + тип + настроение */}
              <button
                onClick={() => setCollapsed((p) => ({ ...p, [r.id]: !p[r.id] }))}
                className="w-full flex items-center justify-between gap-2 mb-2 text-left"
                title={collapsed[r.id] ? tl('Expand metrics') : tl('Collapse metrics')}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0 border border-white/20 shadow-sm"
                    style={{ background: r.tint }}
                  />
                  <span className="text-[13px] leading-none shrink-0">
                    {r.kind === 'child' ? '🍼' : '🔺'}
                  </span>
                  <span className="text-[11.5px] font-bold text-white/95 truncate">
                    {r.name}
                  </span>
                  {idx === 0 && (
                    <span className="shrink-0 text-[8px] font-bold uppercase tracking-wider text-emerald-300/70">
                      ★
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[12px] leading-none">{MOOD_EMOJI[r.mood] ?? '✨'}</span>
                  <span className="text-[10px] font-semibold text-rose-300/85">
                    {tp(r.mood)}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-white/35 transition-transform ${collapsed[r.id] ? '-rotate-90' : ''}`}
                  />
                </div>
              </button>

              {/* Меню цвета — каждому персонажу уже на сцене (главный + компаньоны) */}
              <div className="flex items-center gap-1 mb-2 -mt-0.5 flex-wrap">
                <span className="text-[7px] font-bold uppercase tracking-[0.14em] text-white/25 mr-1">Цвет:</span>
                {['#fb7185', '#f43f5e', '#fbbf24', '#f59e0b', '#38bdf8', '#0ea5e9'].map((col) => (
                  <button
                    key={col}
                    onClick={() => (window as unknown as { pentaSetTint?: (id: string, tint: string) => void }).pentaSetTint?.(r.id, col)}
                    className={`h-[18px] w-[18px] rounded-full border-2 transition-all shrink-0 ${
                      r.tint === col ? 'border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'border-white/20 hover:border-white/50 hover:scale-105'
                    }`}
                    style={{ background: col }}
                    title={col}
                  />
                ))}
              </div>

              {/* Индикатор взрыва */}
              {r.bursting && (
                <div className="mb-2 px-2 py-1 rounded-lg bg-rose-500/20 border border-rose-400/30 text-[9px] font-bold uppercase tracking-wider text-rose-200 text-center animate-pulse">
                  {t('hud.bursting')}
                </div>
              )}

              {!collapsed[r.id] && (
              <>
              {/* Настроение (валентность) — отклонение от центра */}
              <div className="mt-2 pt-1.5 border-t border-white/[0.08]">
                <div className="flex items-center justify-between text-[8.5px] font-semibold uppercase tracking-[0.14em] text-white/30 mb-1">
                  <span>{t('hud.mood')}</span>
                  <span className="font-mono text-white/45">
                    {r.valence >= 0 ? '♥' : '✖'}
                    {Math.round(Math.abs(r.valence) * 100)}
                  </span>
                </div>
                <div className="relative h-[3px] w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="absolute top-0 h-full rounded-full transition-all duration-700"
                    style={{
                      left:
                        r.valence >= 0 ? '50%' : `${50 + r.valence * 50}%`,
                      width: `${Math.abs(r.valence) * 50}%`,
                      background:
                        r.valence >= 0
                          ? 'linear-gradient(90deg,#f472b6,#a78bfa)'
                          : 'linear-gradient(90deg,#f87171,#fb923c)',
                    }}
                  />
                  <div className="absolute left-1/2 top-0 h-full w-px bg-white/25" />
                </div>
              </div>

              {/* Намерение + рот + счётчик еды */}
              <div className="mt-2 pt-1.5 border-t border-white/[0.08] space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-[9.5px] font-medium text-amber-200/80 truncate"
                    title={tp(r.intent)}
                  >
                    {ACTION_EMOJI[r.intent] ?? '🧠'} {tp(r.intent)}
                  </span>
                  <span className="shrink-0 text-[9px] font-mono text-amber-200/70" title={t('hud.meals')}>
                    ⭐{r.meals}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-pink-200/70 truncate" title={tp(r.mouthName)}>
                  <span className="shrink-0">👄</span>
                  <span className="truncate">{tp(r.mouthName)}</span>
                </div>
              </div>

              {/* Характер — 6 базовых черт + живые счастье/энергия (реально отражают происходящее) */}
              <div className="mt-1.5 pt-1.5 border-t border-white/[0.08] space-y-1">
                <div className="text-[7.5px] font-bold uppercase tracking-[0.16em] text-white/25 mb-0.5">
                  {tl('Personality')}
                </div>
                <TraitBar label={t('trait.boldness')} v={r.boldness} color="linear-gradient(90deg,#f87171,#fb923c)" />
                <TraitBar label={t('trait.sociability')} v={r.sociability} color="linear-gradient(90deg,#38bdf8,#818cf8)" />
                <TraitBar label={t('trait.playfulness')} v={r.playfulness} color="linear-gradient(90deg,#fbbf24,#f472b6)" />
                <TraitBar label={t('trait.diligence')} v={r.diligence} color="linear-gradient(90deg,#34d399,#22d3ee)" />
                <TraitBar label={t('trait.curiosity')} v={r.curiousityTrait} color="linear-gradient(90deg,#c084fc,#e879f9)" />
                <TraitBar label={t('trait.stubbornness')} v={r.stubbornness} color="linear-gradient(90deg,#fb923c,#f43f5e)" />
                <div className="pt-1 mt-1 border-t border-white/[0.06] space-y-1">
                  <div className="text-[7px] font-bold uppercase tracking-[0.16em] text-white/20">— LIVE —</div>
                  <TraitBar label={t('stat.happy')} v={r.happiness / 100} color="linear-gradient(90deg,#fb7185,#f43f5e)" />
                  <TraitBar label={t('stat.energy')} v={r.energy / 100} color="linear-gradient(90deg,#fbbf24,#f59e0b)" />
                </div>
              </div>
              </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Top Right: minimal clock only (metric panels are per-character now) */}
      <div className="fixed top-6 right-6 z-40 flex items-center gap-3 pointer-events-none">
        <div className="px-4 py-2 rounded-2xl bg-slate-950/50 backdrop-blur-xl border border-white/10 shadow-lg text-white font-mono text-sm tracking-wider font-semibold">
          {time}
        </div>
      </div>
    </>
  );
};
