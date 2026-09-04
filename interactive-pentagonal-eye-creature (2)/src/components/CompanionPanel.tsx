import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CreatureConfig, CreatureKind, defaultConfig } from '../utils/creature';
import { X, Trash2, Baby, User, Dices, Users } from 'lucide-react';
import { tl, getLanguage } from '../utils/i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  companions: CreatureConfig[];
  setCompanions: React.Dispatch<React.SetStateAction<CreatureConfig[]>>;
}

const TINTS = [
  { label: 'Snow', v: '#FBFCFE' },
  { label: 'Warm', v: '#FFF7F2' },
  { label: 'Rose', v: '#FFF1F5' },
  { label: 'Mint', v: '#F1FFF8' },
  { label: 'Sky', v: '#F0F8FF' },
  { label: 'Lilac', v: '#F7F2FF' },
];

// Personality is LEARNED through lived experience — no manual sliders.
// Only the starting seed and the body/motion tuning are configurable.

const NAMES_CHILD = ['Pip', 'Bibi', 'Nub', 'Tock', 'Momo', 'Zuzu', 'Wisp', 'Dot'];
const NAMES_ADULT = ['Penta II', 'Vera', 'Oslo', 'Kite', 'Nova', 'Rune', 'Sable', 'Echo'];

export const CompanionPanel: React.FC<Props> = ({ isOpen, onClose, companions, setCompanions }) => {
  const [sel, setSel] = useState(0);
  if (!isOpen) return null;

  const add = (kind: CreatureKind) => {
    if (companions.length >= 3) return;
    const cfg = defaultConfig(kind, companions.length + 1);
    const pool = kind === 'child' ? NAMES_CHILD : NAMES_ADULT;
    cfg.name = pool[Math.floor(Math.random() * pool.length)];
    cfg.tint = TINTS[Math.floor(Math.random() * TINTS.length)].v;
    setCompanions((p) => [...p, cfg]);
    setSel(companions.length);
  };

  const remove = (id: string) => {
    setCompanions((p) => p.filter((c) => c.id !== id));
    setSel(0);
  };

  const patch = (id: string, part: Partial<CreatureConfig>) => {
    setCompanions((p) => p.map((c) => (c.id === id ? { ...c, ...part } : c)));
  };

  const randomise = (id: string) => {
    patch(id, {
      tint: TINTS[Math.floor(Math.random() * TINTS.length)].v,
      tempo: 0.6 + Math.random() * 1.4,
    });
  };

  const active = companions[sel];

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-3 bg-black/65 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[calc(100vh-1.5rem)] flex flex-col rounded-3xl bg-slate-900/92 backdrop-blur-2xl border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-white overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-300">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">{tl('Companions')}</h2>
              <p className="text-[10.5px] text-white/45">
                {companions.length}/3 ·{' '}
                {getLanguage() === 'ru'
                  ? 'у каждого свой разум и характер'
                  : 'each has its own mind & personality'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto settings-scroll px-4 py-3 min-h-0 space-y-3">
          {/* spawn buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => add('child')}
              disabled={companions.length >= 3}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-200 text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
              <Baby className="w-4 h-4" /> {tl('Add child')}
            </button>
            <button
              onClick={() => add('adult')}
              disabled={companions.length >= 3}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-200 text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
              <User className="w-4 h-4" /> {tl('Add adult')}
            </button>
          </div>

          {companions.length === 0 && (
            <div className="py-8 text-center">
              <div className="text-3xl mb-2">🔺</div>
              <p className="text-[11.5px] text-white/40 leading-relaxed">
                {getLanguage() === 'ru' ? 'Пента сейчас одна.' : 'Penta is alone right now.'}
                <br />
                {getLanguage() === 'ru'
                  ? 'Добавьте ребёнка или второго взрослого выше.'
                  : 'Add a child or a second adult above.'}
              </p>
            </div>
          )}

          {/* tabs */}
          {companions.length > 0 && (
            <>
              <div className="flex gap-1.5 flex-wrap">
                {companions.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => setSel(i)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10.5px] font-bold transition-all ${
                      i === sel
                        ? 'bg-white text-slate-900'
                        : 'bg-white/[0.07] text-white/60 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-black/20"
                      style={{ background: c.tint }}
                    />
                    {c.name}
                    <span className="opacity-50">{c.kind === 'child' ? '🍼' : '◆'}</span>
                  </button>
                ))}
              </div>

              {active && (
                <div className="space-y-3 pt-1">
                  {/* name + type */}
                  <div className="flex gap-2">
                    <input
                      value={active.name}
                      onChange={(e) => patch(active.id, { name: e.target.value.slice(0, 14) })}
                      className="flex-1 px-3 py-2 rounded-xl bg-white/[0.07] border border-white/10 text-[12px] font-semibold outline-none focus:border-white/30 transition-all"
                      placeholder={tl('Name')}
                    />
                    <button
                      onClick={() => randomise(active.id)}
                      className="px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/35 border border-purple-400/30 text-purple-200 transition-all active:scale-95"
                      title="Randomise personality"
                    >
                      <Dices className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remove(active.id)}
                      className="px-3 rounded-xl bg-red-500/15 hover:bg-red-500/30 border border-red-400/30 text-red-300 transition-all active:scale-95"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* kind */}
                  <div className="grid grid-cols-2 gap-2">
                    {(['child', 'adult'] as CreatureKind[]).map((k) => (
                      <button
                        key={k}
                        onClick={() =>
                          patch(active.id, {
                            kind: k,
                            sizeFactor: k === 'child' ? 0.55 : 0.95,
                            tempo: k === 'child' ? 1.55 : 1,
                          })
                        }
                        className={`py-2 rounded-xl text-[10.5px] font-bold uppercase tracking-wider border transition-all ${
                          active.kind === k
                            ? 'bg-white/20 border-white/40 text-white'
                            : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                        }`}
                      >
                        {k === 'child'
                          ? getLanguage() === 'ru' ? '🍼 Ребёнок' : '🍼 Child'
                          : getLanguage() === 'ru' ? '◆ Взрослый' : '◆ Adult'}
                      </button>
                    ))}
                  </div>

                  {/* size */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-white/70">{tl('Size')}</span>
                      <span className="font-mono text-fuchsia-300">
                        {Math.round(active.sizeFactor * 100)}%
                      </span>
                    </div>
                    <input
                      type="range" min="0.3" max="1.3" step="0.05"
                      value={active.sizeFactor}
                      onChange={(e) => patch(active.id, { sizeFactor: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* tempo */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-white/70">{tl('Restlessness')}</span>
                      <span className="font-mono text-fuchsia-300">
                        ×{active.tempo.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range" min="0.4" max="2.4" step="0.05"
                      value={active.tempo}
                      onChange={(e) => patch(active.id, { tempo: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* tint */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-white/70">{tl('Body tint')}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {TINTS.map((t) => (
                        <button
                          key={t.v}
                          onClick={() => patch(active.id, { tint: t.v })}
                          className={`h-8 w-8 rounded-lg border-2 transition-all ${
                            active.tint === t.v ? 'border-fuchsia-400 scale-110' : 'border-white/15 hover:border-white/40'
                          }`}
                          style={{ background: t.v }}
                          title={t.label}
                        />
                      ))}
                    </div>
                  </div>

                  {/* learned personality readout */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-white/70">{tl('Personality')}</span>
                      <span className="text-[9px] text-white/25 italic">{tl('learned from experience')}</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-white/40">
                      {getLanguage() === 'ru'
                        ? 'Черты растут сами от того, что с ними происходит: еда делает их веселее, удары — смелее и спокойнее, ссоры — упрямее, игнор — отчуждённее. Ничего здесь не задано заранее.'
                        : 'Traits grow on their own from what happens to them — meals make them cheerier, hard collisions make them braver and calmer, fights make them stubborn, being ignored makes them aloof. Nothing here is preset.'}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* footer */}
        <div className="px-4 py-2.5 border-t border-white/10 flex justify-between items-center shrink-0">
          <span className="text-[10px] text-white/30">
            {getLanguage() === 'ru'
              ? 'Они бродят, едят и реагируют сами по себе'
              : 'They roam, eat and react independently'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-semibold text-[11px] transition-all active:scale-95"
          >
            {tl('Done')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
