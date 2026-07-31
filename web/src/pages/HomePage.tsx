import { Link } from 'react-router-dom';
import { ArrowRight, Fire, TrendUp } from '@phosphor-icons/react';
import { useProgress } from '../components/ProgressProvider';
import { liveAuction } from '../lib/auctions';
import { currentSeasonId } from '../lib/progress';

type Props = {
  bidCount: number;
  connected: boolean;
  onOpenConnect: () => void;
};

function XpSegments({ pct }: { pct: number }) {
  const filled = Math.round((pct / 100) * 20);
  return (
    <div className="xp-segments" aria-hidden>
      {Array.from({ length: 20 }, (_, i) => (
        <span key={i} className={i < filled ? 'on' : undefined} />
      ))}
    </div>
  );
}

export function HomePage({ bidCount, connected, onOpenConnect }: Props) {
  const { state, rank } = useProgress();
  const live = liveAuction();
  const pct = Math.round(rank.progress * 100);
  const season = currentSeasonId();

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-bc-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="led" aria-hidden />
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bc-ok">
              System online
            </p>
          </div>
          <h1 className="mt-2 font-mono text-2xl font-medium tracking-tight text-bc-ink md:text-3xl">
            {state.displayName}
          </h1>
          <p className="mt-1 max-w-[48ch] font-mono text-[12px] text-bc-mute">
            {rank.current.blurb}
          </p>
        </div>
        <div className="border border-bc-line bg-bc-elevated px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bc-mute">
          Ops · Season {season}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <div className="border border-bc-line bg-bc-elevated p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bc-mute">
            Clearance
          </p>
          <p className="mt-2 font-mono text-lg font-medium text-bc-cyan md:text-xl">
            {rank.current.label}
          </p>
        </div>
        <div className="border border-bc-line bg-bc-elevated p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bc-mute">XP</p>
          <p className="mt-2 font-mono text-lg font-medium tabular-nums md:text-xl">
            {state.xp}
          </p>
        </div>
        <div className="border border-bc-line bg-bc-elevated p-3">
          <div className="flex items-center gap-1.5 text-bc-mute">
            <Fire size={12} weight="fill" className="text-bc-cyan" />
            <p className="font-mono text-[10px] uppercase tracking-[0.14em]">Streak</p>
          </div>
          <p className="mt-2 font-mono text-lg font-medium tabular-nums md:text-xl">
            {state.streak}
            <span className="ml-1 text-xs text-bc-mute">d</span>
          </p>
        </div>
        <div className="border border-bc-line bg-bc-elevated p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bc-mute">
            Seals
          </p>
          <p className="mt-2 font-mono text-lg font-medium tabular-nums md:text-xl">
            {state.seasonSeals}
          </p>
        </div>
      </div>

      <div className="mt-2 border border-bc-line bg-bc-elevated p-3 md:p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bc-mute">
            Clearance progress
          </p>
          <p className="font-mono text-[11px] tabular-nums text-bc-cyan">{pct}%</p>
        </div>
        <div className="mt-3">
          <XpSegments pct={pct} />
        </div>
        <p className="mt-2 font-mono text-[11px] text-bc-mute">
          {rank.next
            ? `${rank.next.minXp - state.xp} XP → ${rank.next.label}`
            : 'Top clearance'}
        </p>
      </div>

      <section className="mt-4 border border-bc-line bg-bc-elevated">
        <div className="flex items-center justify-between gap-3 border-b border-bc-line px-3 py-2 md:px-4">
          <div className="flex items-center gap-2">
            <span className="led-amber" aria-hidden />
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-bc-cyan">
              Live auction
            </p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-bc-mute">
            Channel open
          </p>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4 p-3 md:p-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-mono text-lg font-medium tracking-tight md:text-xl">
              {live.title}
            </h2>
            <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-bc-mute">
              {live.summary}
            </p>
            {bidCount > 0 ? (
              <p className="mt-3 inline-flex items-center gap-2 font-mono text-xs text-bc-mute">
                <TrendUp size={14} className="text-bc-cyan" />
                {bidCount} sealed contributions on the board
              </p>
            ) : (
              <p className="mt-3 font-mono text-xs text-bc-mute">
                Board is quiet — be the first seal.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {!connected ? (
              <button
                type="button"
                onClick={onOpenConnect}
                className="inline-flex items-center gap-2 rounded-[var(--bc-radius)] border border-bc-line px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-bc-ink transition hover:bg-bc-soft active:scale-[0.98]"
              >
                Connect first
              </button>
            ) : null}
            <Link
              to={`/auctions/${live.id}/seal`}
              className="inline-flex items-center gap-2 rounded-[var(--bc-radius)] bg-bc-cyan px-3 py-2 font-mono text-xs font-medium uppercase tracking-[0.12em] text-bc-cyan-ink transition hover:brightness-110 active:scale-[0.98]"
            >
              Seal bid
              <ArrowRight size={12} weight="bold" />
            </Link>
            <Link
              to="/auctions"
              className="inline-flex items-center gap-2 rounded-[var(--bc-radius)] border border-bc-line px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-bc-ink transition hover:bg-bc-soft active:scale-[0.98]"
            >
              Auction lobby
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
