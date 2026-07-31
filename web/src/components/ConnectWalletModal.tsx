import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CircleNotch, Wallet, X } from '@phosphor-icons/react';
import { networkHint, networkLabel } from '../lib/networkLabels';
import { NETWORK_ID } from '../config';

type Props = {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onConnect: () => void;
};

export function ConnectWalletModal({ open, busy, onClose, onConnect }: Props) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-bc-steel/80 p-4 sm:items-center"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="connect-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !busy) onClose();
          }}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="relative w-full max-w-md border border-bc-line bg-bc-elevated p-6 md:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="absolute right-4 top-4 text-bc-mute transition hover:text-bc-ink disabled:opacity-40"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bc-cyan">
              Enter the desk
            </p>
            <h2 id="connect-title" className="font-display mt-2 text-2xl font-semibold tracking-tight">
              Connect
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-bc-mute">
              Blind Cartel uses Lace or 1AM to sign desk actions. Your bid amount stays private; only
              sealed commitments reach the registry.
            </p>

            <div className="mt-6 border border-bc-line bg-bc-soft/60 p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-bc-mute">Network</p>
              <p className="font-display mt-2 text-lg font-semibold text-bc-ink">
                {networkLabel(NETWORK_ID)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-bc-mute">{networkHint(NETWORK_ID)}</p>
            </div>

            <ul className="mt-6 space-y-2 text-sm text-bc-mute">
              <li className="flex gap-2">
                <span className="text-bc-cyan">01</span>
                Install Lace or 1AM with Midnight support
              </li>
              <li className="flex gap-2">
                <span className="text-bc-cyan">02</span>
                Unlock the extension, then approve this site
              </li>
              <li className="flex gap-2">
                <span className="text-bc-cyan">03</span>
                You’ll join the live auction desk automatically
              </li>
            </ul>

            <button
              type="button"
              disabled={busy}
              onClick={onConnect}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-[var(--bc-radius)] bg-bc-cyan px-4 py-3 text-sm font-medium text-bc-cyan-ink transition hover:brightness-110 disabled:opacity-50 active:scale-[0.98]"
            >
              {busy ? (
                <CircleNotch size={16} className="animate-spin" />
              ) : (
                <Wallet size={16} weight="bold" />
              )}
              {busy ? 'Connecting…' : 'Connect Lace or 1AM'}
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
