import { Link } from 'react-router-dom';
import { ShieldCheck, LockKey, Broadcast, Warning, Question } from '@phosphor-icons/react';

export function HelpPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-16 md:px-8 md:py-24">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bc-cyan">Help & privacy</p>
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
        How the desk keeps you private
      </h1>
      <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-bc-mute">
        Blind Cartel is a sealed intel desk on Midnight. Your contribution amount stays in witness so
        the market can stay public without naming who bid what.
      </p>

      <div className="mt-14 space-y-10">
        <div className="border-t border-bc-line pt-8">
          <div className="flex items-start gap-4">
            <LockKey size={24} className="mt-1 shrink-0 text-bc-cyan" weight="duotone" />
            <div>
              <h2 className="font-display text-xl font-semibold">What stays private</h2>
              <ul className="mt-3 space-y-2 text-bc-mute">
                <li>Your bid amount and bidder secret (kept in this browser)</li>
                <li>Any link between your Lace / 1AM wallet and a contribution</li>
                <li>The numeric value behind a sealed commitment</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-bc-line pt-8">
          <div className="flex items-start gap-4">
            <Broadcast size={24} className="mt-1 shrink-0 text-bc-cyan" weight="duotone" />
            <div>
              <h2 className="font-display text-xl font-semibold">What stays public</h2>
              <ul className="mt-3 space-y-2 text-bc-mute">
                <li>Sealed bid and bidder commitments on the market board</li>
                <li>Which auction a seal belongs to</li>
                <li>That ownership was proven for a commitment (not the amount)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-bc-line pt-8">
          <div className="flex items-start gap-4">
            <ShieldCheck size={24} className="mt-1 shrink-0 text-bc-cyan" weight="duotone" />
            <div>
              <h2 className="font-display text-xl font-semibold">What you can do</h2>
              <ul className="mt-3 space-y-2 text-bc-mute">
                <li>
                  <span className="text-bc-ink">Seal bid</span> — place a private seal on a live
                  auction
                </li>
                <li>
                  <span className="text-bc-ink">Prove your sealed bid</span> — show ownership without
                  revealing the amount
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-bc-line pt-8">
          <div className="flex items-start gap-4">
            <Question size={24} className="mt-1 shrink-0 text-bc-cyan" weight="duotone" />
            <div>
              <h2 className="font-display text-xl font-semibold">Wallets & waiting</h2>
              <ul className="mt-3 space-y-2 text-bc-mute">
                <li>Use Lace or 1AM set to the same desk network shown in Settings</li>
                <li>Proving can take up to a minute — keep the tab open</li>
                <li>Approve prompts in your wallet when they appear</li>
                <li>
                  Reveal and settle for auctions are not live yet — the board and prove flow work
                  today
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border border-bc-cyan/35 bg-bc-cyan/5 p-6">
          <div className="flex items-start gap-3">
            <Warning size={22} className="mt-0.5 shrink-0 text-bc-cyan" weight="fill" />
            <p className="text-sm leading-relaxed text-bc-ink/90">
              Someone watching the market can see a new seal appear when you contribute. They cannot
              map that seal back to your wallet or amount from desk data alone. Rotating secrets in
              Settings Advanced loses prove-ability for older seals.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-14 flex flex-wrap gap-3">
        <Link
          to="/auctions"
          className="inline-flex rounded-[var(--bc-radius)] bg-bc-cyan px-5 py-3 text-sm font-medium text-bc-cyan-ink transition hover:brightness-110 active:scale-[0.98]"
        >
          Open auction lobby
        </Link>
        <Link
          to="/settings"
          className="inline-flex rounded-[var(--bc-radius)] border border-bc-line px-5 py-3 text-sm text-bc-ink transition hover:bg-bc-soft"
        >
          Settings
        </Link>
      </div>
    </div>
  );
}
