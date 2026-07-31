import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CheckCircle, CircleNotch, Seal, WarningCircle, X } from '@phosphor-icons/react';

export type TxPhase =
  | 'idle'
  | 'preparing'
  | 'proving'
  | 'confirming'
  | 'settling'
  | 'success'
  | 'failure';

export type TxFlowState = {
  open: boolean;
  phase: TxPhase;
  action: string;
  successTitle?: string;
  detail?: string;
  error?: string | null;
};

type Props = {
  flow: TxFlowState;
  onClose: () => void;
};

const STEPS: { id: TxPhase; label: string }[] = [
  { id: 'preparing', label: 'Preparing' },
  { id: 'proving', label: 'Proving' },
  { id: 'confirming', label: 'Confirming' },
  { id: 'settling', label: 'Settling' },
];

function stepIndex(phase: TxPhase): number {
  if (phase === 'success' || phase === 'failure') return STEPS.length;
  const i = STEPS.findIndex((s) => s.id === phase);
  return i < 0 ? 0 : i;
}

export function TxFlow({ flow, onClose }: Props) {
  const reduce = useReducedMotion();
  const active = stepIndex(flow.phase);
  const done = flow.phase === 'success';
  const failed = flow.phase === 'failure';
  const canClose = done || failed;

  return (
    <AnimatePresence>
      {flow.open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-bc-steel/80 p-4 sm:items-center"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="txflow-title"
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md border border-bc-line bg-bc-elevated p-6 md:p-8"
          >
            {canClose ? (
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 text-bc-mute transition hover:text-bc-ink"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            ) : null}

            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bc-cyan">
              Desk transaction
            </p>
            <h2 id="txflow-title" className="font-display mt-2 text-2xl font-semibold tracking-tight">
              {flow.action}
            </h2>

            {!done && !failed ? (
              <p className="mt-3 text-sm leading-relaxed text-bc-mute">
                Sealing privately can take up to a minute while your proof is built. Keep this tab
                open and approve in your wallet when asked.
              </p>
            ) : null}

            <ol className="mt-8 space-y-3">
              {STEPS.map((step, i) => {
                const isActive = !done && !failed && i === active;
                const isPast = done || i < active;
                return (
                  <li key={step.id} className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center border text-[11px] font-mono ${
                        isPast
                          ? 'border-bc-cyan/40 bg-bc-cyan/10 text-bc-cyan'
                          : isActive
                            ? 'border-bc-cyan text-bc-cyan'
                            : 'border-bc-line text-bc-mute'
                      }`}
                    >
                      {isPast ? (
                        <CheckCircle size={14} weight="fill" />
                      ) : isActive ? (
                        <CircleNotch size={14} className="animate-spin" />
                      ) : (
                        String(i + 1).padStart(2, '0')
                      )}
                    </span>
                    <span className={`text-sm ${isActive || isPast ? 'text-bc-ink' : 'text-bc-mute'}`}>
                      {step.label}
                      {isActive && step.id === 'proving' ? (
                        <span className="ml-2 font-mono text-[11px] text-bc-mute">~1 min</span>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ol>

            {done ? (
              <div className="mt-8 flex flex-col items-center border border-bc-cyan/25 bg-bc-cyan/5 px-4 py-8 text-center">
                <Seal size={40} weight="duotone" className="text-bc-cyan anim-seal-stamp" />
                <p className="font-display mt-4 text-xl font-semibold text-bc-ink">
                  {flow.successTitle ?? 'Bid sealed'}
                </p>
                {flow.detail ? (
                  <p className="mt-2 max-w-[32ch] text-sm text-bc-mute">{flow.detail}</p>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 rounded-[var(--bc-radius)] bg-bc-cyan px-5 py-2.5 text-sm font-medium text-bc-cyan-ink transition hover:brightness-110 active:scale-[0.98]"
                >
                  Done
                </button>
              </div>
            ) : null}

            {failed ? (
              <div className="mt-8 border border-bc-rust/35 bg-bc-rust/5 px-4 py-6">
                <div className="flex items-start gap-3">
                  <WarningCircle size={22} weight="fill" className="mt-0.5 shrink-0 text-bc-rust" />
                  <div>
                    <p className="font-display text-lg font-semibold">Couldn’t finish</p>
                    <p className="mt-2 text-sm leading-relaxed text-bc-mute">
                      {flow.error ?? 'Something went wrong. Try again in a moment.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-5 rounded-[var(--bc-radius)] border border-bc-line px-4 py-2 text-sm text-bc-ink transition hover:bg-bc-soft active:scale-[0.98]"
                >
                  Close
                </button>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export const idleTxFlow = (): TxFlowState => ({
  open: false,
  phase: 'idle',
  action: '',
});
