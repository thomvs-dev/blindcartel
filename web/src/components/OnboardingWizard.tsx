import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, EyeSlash, Seal, Stack } from '@phosphor-icons/react';
import { useProgress } from './ProgressProvider';

type Props = {
  onComplete: () => void;
};

const STEPS = [
  {
    id: 'what',
    icon: Stack,
    title: 'What Blind Cartel is',
    body: 'A sealed intel desk on Midnight. You contribute to private auctions — the market only sees commitments, never your amount.',
  },
  {
    id: 'private',
    icon: EyeSlash,
    title: 'What stays private',
    body: 'Your bid amount, bidder secret, and any link between your wallet and a contribution stay sealed. The registry learns that a valid seal landed once.',
  },
  {
    id: 'do',
    icon: Seal,
    title: 'What you’ll do',
    body: 'Connect once, seal a contribution on a live auction, optionally prove you contributed — without revealing the amount or naming yourself.',
  },
] as const;

export function OnboardingWizard({ onComplete }: Props) {
  const { completeOnboarding, state } = useProgress();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(
    state.displayName === 'Anonymous agent' ? '' : state.displayName,
  );
  const reduce = useReducedMotion();
  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  function finish() {
    completeOnboarding(name.trim() || 'Anonymous agent');
    onComplete();
  }

  return (
    <div className="mx-auto max-w-[640px] px-4 py-12 md:px-8 md:py-20">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-bc-cyan">
        Orientation · {String(step + 1).padStart(2, '0')} / 03
      </p>

      <motion.div
        key={current.id}
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-8"
      >
        <current.icon size={36} weight="duotone" className="text-bc-cyan" />
        <h1 className="font-display mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
          {current.title}
        </h1>
        <p className="mt-5 max-w-[48ch] text-lg leading-relaxed text-bc-mute">{current.body}</p>
      </motion.div>

      {last ? (
        <label className="mt-10 block">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-bc-mute">
            Display name (local only)
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Anonymous agent"
            maxLength={40}
            className="mt-2 w-full rounded-[var(--bc-radius)] border border-bc-line bg-bc-elevated px-4 py-3 text-sm text-bc-ink outline-none transition focus:border-bc-cyan focus:ring-2 focus:ring-bc-cyan/20"
          />
          <span className="mt-2 block text-xs text-bc-mute">
            Stored in this browser. Never sent to the ledger.
          </span>
        </label>
      ) : null}

      <div className="mt-10 flex flex-wrap items-center gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="inline-flex items-center gap-2 rounded-[var(--bc-radius)] border border-bc-line px-4 py-2.5 text-sm text-bc-ink transition hover:bg-bc-soft active:scale-[0.98]"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        ) : null}
        {!last ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-2 rounded-[var(--bc-radius)] bg-bc-cyan px-5 py-2.5 text-sm font-medium text-bc-cyan-ink transition hover:brightness-110 active:scale-[0.98]"
          >
            Continue
            <ArrowRight size={14} weight="bold" />
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            className="inline-flex items-center gap-2 rounded-[var(--bc-radius)] bg-bc-cyan px-5 py-2.5 text-sm font-medium text-bc-cyan-ink transition hover:brightness-110 active:scale-[0.98]"
          >
            Enter desk
            <ArrowRight size={14} weight="bold" />
          </button>
        )}
      </div>

      <div className="mt-12 flex gap-2">
        {STEPS.map((s, i) => (
          <span
            key={s.id}
            className={`h-1 flex-1 transition ${i <= step ? 'bg-bc-cyan' : 'bg-bc-line'}`}
          />
        ))}
      </div>
    </div>
  );
}
