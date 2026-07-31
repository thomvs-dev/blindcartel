import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { AUCTIONS, statusLabel, type Auction } from '../lib/auctions';
import { useProgress } from '../components/ProgressProvider';

type Props = {
  bidCount: number;
};

function AuctionRow({ auction, liveSeals }: { auction: Auction; liveSeals: number }) {
  const open = auction.status === 'live';
  return (
    <li>
      <Link
        to={`/auctions/${auction.id}`}
        className={`group flex flex-col gap-3 border border-bc-line bg-bc-elevated p-5 transition hover:border-[color-mix(in_srgb,var(--bc-cyan)_45%,var(--bc-line))] active:scale-[0.995] sm:flex-row sm:items-center sm:justify-between ${
          open ? 'anim-countdown-pulse' : ''
        }`}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.14em] ${
                open ? 'text-bc-cyan' : 'text-bc-mute'
              }`}
            >
              {statusLabel(auction.status)} · {auction.category}
            </span>
            {open && liveSeals > 0 ? (
              <span className="font-mono text-[10px] text-bc-mute">{liveSeals} on board</span>
            ) : null}
          </div>
          <h2 className="font-display mt-2 text-xl font-semibold tracking-tight group-hover:text-bc-cyan">
            {auction.title}
          </h2>
          <p className="mt-1 max-w-[52ch] text-sm text-bc-mute">{auction.summary}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="font-mono text-[11px] text-bc-mute">{auction.closesLabel}</span>
          <ArrowRight
            size={16}
            weight="bold"
            className="text-bc-mute transition group-hover:text-bc-cyan"
          />
        </div>
      </Link>
    </li>
  );
}

export function AuctionsPage({ bidCount }: Props) {
  const { recordMarketVisit } = useProgress();

  useEffect(() => {
    recordMarketVisit();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per lobby open
  }, []);

  return (
    <div className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bc-cyan">Auction lobby</p>
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
        Open markets
      </h1>
      <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-bc-mute">
        One live desk is wired to Midnight today. Upcoming markets are catalogued — seal when they
        open.
      </p>

      <ul className="mt-10 space-y-3">
        {AUCTIONS.map((auction) => (
          <AuctionRow
            key={auction.id}
            auction={auction}
            liveSeals={auction.status === 'live' ? bidCount : 0}
          />
        ))}
      </ul>
    </div>
  );
}
