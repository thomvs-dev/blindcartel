import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, Seal } from '@phosphor-icons/react';
import { auctionById, statusLabel } from '../lib/auctions';

type Props = {
  bidCount: number;
  connected: boolean;
  onOpenConnect: () => void;
};

export function AuctionDeskPage({ bidCount, connected, onOpenConnect }: Props) {
  const { id } = useParams<{ id: string }>();
  const auction = id ? auctionById(id) : undefined;

  if (!auction) {
    return <Navigate to="/auctions" replace />;
  }

  const live = auction.status === 'live';

  return (
    <div className="mx-auto max-w-[800px] px-4 py-12 md:px-8 md:py-16">
      <Link
        to="/auctions"
        className="font-mono text-[11px] uppercase tracking-[0.14em] text-bc-mute transition hover:text-bc-cyan"
      >
        ← Lobby
      </Link>

      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-bc-cyan">
        Auction desk · {statusLabel(auction.status)}
      </p>
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
        {auction.title}
      </h1>
      <p className="mt-4 max-w-[55ch] text-lg leading-relaxed text-bc-mute">{auction.summary}</p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <span
          className={`inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] ${
            live
              ? 'anim-countdown-pulse border-[color-mix(in_srgb,var(--bc-cyan)_45%,transparent)] text-bc-cyan'
              : 'border-bc-line text-bc-mute'
          }`}
        >
          {auction.countdownHint}
        </span>
        <span className="font-mono text-[11px] text-bc-mute">{auction.category}</span>
      </div>

      <p className="mt-8 max-w-[52ch] text-sm leading-relaxed text-bc-mute">{auction.stakes}</p>

      {live && bidCount > 0 ? (
        <p className="mt-6 font-mono text-xs text-bc-mute">
          {bidCount} sealed contribution{bidCount === 1 ? '' : 's'} on the board
        </p>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-2">
        {live ? (
          <>
            {!connected ? (
              <button
                type="button"
                onClick={onOpenConnect}
                className="inline-flex items-center gap-2 rounded-[var(--bc-radius)] bg-bc-cyan px-5 py-3 text-sm font-medium text-bc-cyan-ink transition hover:brightness-110 active:scale-[0.98]"
              >
                Connect to seal
              </button>
            ) : (
              <Link
                to={`/auctions/${auction.id}/seal`}
                className="inline-flex items-center gap-2 rounded-[var(--bc-radius)] bg-bc-cyan px-5 py-3 text-sm font-medium text-bc-cyan-ink transition hover:brightness-110 active:scale-[0.98]"
              >
                <Seal size={16} weight="fill" />
                Seal bid
                <ArrowRight size={14} weight="bold" />
              </Link>
            )}
            <Link
              to={`/auctions/${auction.id}/results`}
              className="inline-flex items-center gap-2 rounded-[var(--bc-radius)] border border-bc-line px-5 py-3 text-sm text-bc-ink transition hover:bg-bc-soft active:scale-[0.98]"
            >
              View board & prove
            </Link>
          </>
        ) : (
          <div className="border border-bc-line bg-bc-elevated p-5">
            <p className="font-display text-lg font-medium">Not open for sealing</p>
            <p className="mt-2 max-w-[44ch] text-sm text-bc-mute">
              {auction.status === 'upcoming'
                ? 'This market is catalogued for the next cycle. Check back when the sealing window opens.'
                : 'This market is closed. Browse the lobby for a live desk.'}
            </p>
            <Link
              to="/auctions"
              className="mt-4 inline-flex text-sm text-bc-cyan hover:underline"
            >
              Back to lobby
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
