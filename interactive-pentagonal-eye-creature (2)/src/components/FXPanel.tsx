import React from 'react';
import { tl } from '../utils/i18n';

export interface FXSettings {
  /** collision ripple rings */
  impactRipple: boolean;
  /** collision thud sounds */
  impactSound: boolean;
  /** food ripple rings */
  foodRipple: boolean;
  /** food crunch sounds */
  foodSound: boolean;
  /** global master switch */
  masterSound: boolean;
  /** passthrough knobs so the panel can read the shared settings */
  allowGames?: boolean;
  allowFoodDrama?: boolean;
  socialDrive?: number;
  personalSpace?: number;
}

interface Props {
  isOpen: boolean;
  fx: FXSettings;
  setFx: React.Dispatch<React.SetStateAction<FXSettings>>;
  onClose: () => void;
}

interface RowProps {
  icon: React.ReactNode;
  title: string;
  hint: string;
  on: boolean;
  onToggle: () => void;
  accent: string;
}

const Row: React.FC<RowProps> = ({ icon, title, hint, on, onToggle, accent }) => (
  <button
    onClick={onToggle}
    className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${
      on ? 'bg-white/[0.09] border-white/20' : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07]'
    }`}
  >
    <div className="flex items-center gap-2.5 text-left min-w-0">
      <span className={`shrink-0 ${on ? accent : 'text-white/30'}`}>{icon}</span>
      <div className="min-w-0">
        <span className="block text-[11px] font-bold text-white/90 truncate">{tl(title)}</span>
        <span className="block text-[9.5px] text-white/35 truncate">{tl(hint)}</span>
      </div>
    </div>
    <span className={`relative w-9 h-5 rounded-full transition-all shrink-0 ${on ? 'bg-emerald-500' : 'bg-white/15'}`}>
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
          on ? 'left-[19px]' : 'left-0.5'
        }`}
      />
    </span>
  </button>
);

const Divider: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-2 pt-2 pb-1">
    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">{tl(label)}</span>
    <span className="flex-1 h-px bg-white/[0.07]" />
  </div>
);

export const FXPanel: React.FC<Props> = ({ isOpen, fx, setFx, onClose }) => {
  const toggle = (k: keyof FXSettings) =>
    setFx((p) => ({ ...p, [k]: !p[k] }));

  if (!isOpen) return null;

  const anyVisual = fx.impactRipple || fx.foodRipple;
  const anyAudio = fx.masterSound && (fx.impactSound || fx.foodSound);

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-3 bg-black/65 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md max-h-[calc(100vh-1.5rem)] flex flex-col rounded-3xl bg-slate-900/92 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-white overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3" />
                <circle cx="12" cy="12" r="8" opacity="0.6" />
                <circle cx="12" cy="12" r="11" opacity="0.3" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">{tl('Effects & Sound')}</h2>
              <p className="text-[10.5px] text-white/45">{tl('Tune ripples and thuds')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto settings-scroll px-4 py-3 space-y-2 min-h-0">
          <Divider label="Collisions" />
          <Row
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="4" />
                <circle cx="12" cy="12" r="9" opacity="0.5" />
              </svg>
            }
            title="Impact ripples"
            hint="Expanding rings when it hits a wall"
            on={fx.impactRipple}
            onToggle={() => toggle('impactRipple')}
            accent="text-cyan-300"
          />
          <Row
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 5 6 9H2v6h4l5 4V5z" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              </svg>
            }
            title="Impact sounds"
            hint="Thud and bounce audio on collision"
            on={fx.impactSound}
            onToggle={() => toggle('impactSound')}
            accent="text-cyan-300"
          />

          <Divider label="Eating" />
          <Row
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="4" />
                <circle cx="12" cy="12" r="9" opacity="0.5" />
              </svg>
            }
            title="Food ripples"
            hint="Rings when it bites down"
            on={fx.foodRipple}
            onToggle={() => toggle('foodRipple')}
            accent="text-amber-300"
          />
          <Row
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 5 6 9H2v6h4l5 4V5z" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              </svg>
            }
            title="Food sounds"
            hint="Crunch and gulp audio while eating"
            on={fx.foodSound}
            onToggle={() => toggle('foodSound')}
            accent="text-amber-300"
          />

          <Divider label="Global" />
          <Row
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 5 6 9H2v6h4l5 4V5z" />
                {fx.masterSound ? <path d="M15.5 8.5a5 5 0 0 1 0 7" /> : <path d="m22 9-6 6M16 9l6 6" />}
              </svg>
            }
            title="Master sound"
            hint="Mute absolutely everything at once"
            on={fx.masterSound}
            onToggle={() => toggle('masterSound')}
            accent="text-emerald-300"
          />
        </div>

        {/* summary footer */}
        <div className="px-4 py-2.5 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="flex gap-3 text-[9.5px] font-semibold">
            <span className={anyVisual ? 'text-cyan-300/80' : 'text-white/25 line-through'}>
              ◉ Ripples
            </span>
            <span className={anyAudio ? 'text-emerald-300/80' : 'text-white/25 line-through'}>
              ♪ Audio
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-[11px] transition-all active:scale-95"
          >
            {tl('Done')}
          </button>
        </div>
      </div>
    </div>
  );
};
