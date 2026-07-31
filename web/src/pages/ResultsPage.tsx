import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CheckCircle, CircleNotch, Warning } from '@phosphor-icons/react';
import type { SealedBidEntryView } from '@api/common-types.js';
import { BrowserBlindCartelManager } from '../lib/BrowserBlindCartelManager';
import { auctionById, auctionIdHex, labelForAuctionHex } from '../lib/auctions';
import { bidCommitmentFromHex } from '../lib/blind-cartel';
import { CONTRACT_ADDRESS } from '../config';
import { useProgress } from '../components/ProgressProvider';
import type { TxFlowState } from '../components/TxFlow';
import { runTxFlow } from '../lib/runTxFlow';

type Props = {
  entries: SealedBidEntryView[];
  bidCount: number;
  selectedBid: string;
  connected: boolean;
  busy: boolean;
  manager: BrowserBlindCartelManager;
  onBusy: (v: boolean) => void;
  onOpenConnect: () => void;
  onSelectedBid: (hex: string) => void;
  onTxFlow: (flow: TxFlowState | ((prev: TxFlowState) => TxFlowState)) => void;
  onRefresh: () => Promise<void>;
  onToast: (tone: 'ok' | 'warn' | 'info', title: string, body?: string) => void;
};

function trunc(hex: string, head = 8, tail = 4): string {
  return hex.length <= head + tail + 1 ? hex : `${hex.slice(0, head)}…${hex.slice(-tail)}`;
}

export function ResultsPage({
  entries,
  bidCount,
  selectedBid,
  connected,
  busy,
  manager,
  onBusy,
  onOpenConnect,
  onSelectedBid,
  onTxFlow,
  onRefresh,
  onToast,
}: Props) {
  const { id } = useParams<{ id: string }>();
  const { recordProve, state } = useProgress();
  const auction = id ? auctionById(id) : undefined;

  const auctionEntries = useMemo(() => {
    if (!auction) return entries;
    const hex = auctionIdHex(auction);
    const filtered = entries.filter(
      (e) => e.auctionId.trim().replace(/^0x/i, '').toLowerCase() === hex,
    );
    return filtered.length > 0 ? filtered : entries;
  }, [auction, entries]);

  if (!auction) {
    return <Navigate to="/auctions" replace />;
  }

  async function handleProve() {
    if (!connected) {
      onOpenConnect();
      return;
    }
    if (!selectedBid) {
      onToast('info', 'Select a seal first', 'Tap a sealed contribution, then prove it was yours.');
      return;
    }

    onBusy(true);
    const ok = await runTxFlow({
      setFlow: onTxFlow,
      action: 'Prove your sealed bid',
      successTitle: 'Ownership proven',
      successDetail: 'You proved you contributed without revealing the amount.',
      work: () =>
        manager.proveBidOwnership(CONTRACT_ADDRESS, bidCommitmentFromHex(selectedBid)),
      onRefresh,
      onError: (msg) => onToast('warn', 'Couldn’t prove', msg),
    });
    onBusy(false);
    if (ok) {
      recordProve();
      onToast('ok', 'Ownership proven', 'Contribution proven privately.');
    }
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
      <Link
        to={`/auctions/${auction.id}`}
        className="font-mono text-[11px] uppercase tracking-[0.14em] text-bc-mute transition hover:text-bc-cyan"
      >
        ← {auction.title}
      </Link>

      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-bc-cyan">
        Board & prove
      </p>
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
        Sealed contributions
      </h1>
      <p className="mt-4 max-w-[52ch] text-lg leading-relaxed text-bc-mute">
        Public commitments for this market. Prove ownership without revealing the amount.
      </p>

      {!auction.revealAvailable ? (
        <div className="mt-8 flex items-start gap-3 border border-[color-mix(in_srgb,var(--bc-rust)_40%,transparent)] bg-[color-mix(in_srgb,var(--bc-rust)_8%,transparent)] p-4">
          <Warning size={20} weight="fill" className="mt-0.5 shrink-0 text-bc-rust" />
          <div>
            <p className="text-sm font-medium text-bc-ink">Reveal & settle not open yet</p>
            <p className="mt-1 text-sm text-bc-mute">
              Full auction reveal and settlement land in a later circuit pass. You can still seal and
              prove ownership today.
            </p>
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-2">
        {!connected ? (
          <button
            type="button"
            onClick={onOpenConnect}
            className="inline-flex items-center gap-2 rounded-[var(--bc-radius)] bg-bc-cyan px-4 py-2.5 text-sm font-medium text-bc-cyan-ink transition hover:brightness-110 active:scale-[0.98]"
          >
            Connect to prove
          </button>
        ) : (
          <button
            type="button"
            disabled={busy || !selectedBid}
            onClick={() => void handleProve()}
            className="inline-flex items-center gap-2 rounded-[var(--bc-radius)] bg-bc-cyan px-4 py-2.5 text-sm font-medium text-bc-cyan-ink disabled:opacity-50 active:scale-[0.98]"
          >
            {busy ? (
              <CircleNotch size={16} className="animate-spin" />
            ) : (
              <CheckCircle size={16} />
            )}
            Prove your sealed bid
          </button>
        )}
        {auction.canSeal ? (
          <Link
            to={`/auctions/${auction.id}/seal`}
            className="inline-flex items-center rounded-[var(--bc-radius)] border border-bc-line px-4 py-2.5 text-sm text-bc-ink transition hover:bg-bc-soft"
          >
            Seal another
          </Link>
        ) : null}
        <button
          type="button"
          onClick={() => void onRefresh()}
          disabled={busy}
          className="inline-flex items-center rounded-[var(--bc-radius)] border border-bc-line px-4 py-2.5 text-sm text-bc-ink transition hover:bg-bc-soft disabled:opacity-40"
        >
          Refresh board
        </button>
      </div>

      <p className="mt-6 font-mono text-xs text-bc-mute">
        {bidCount} total on registry
        {auctionEntries.length !== bidCount
          ? ` · ${auctionEntries.length} shown for this desk`
          : null}
      </p>

      {auctionEntries.length === 0 ? (
        <div className="mt-12 border border-bc-line bg-bc-elevated p-8 text-center">
          <p className="font-display text-xl font-medium">No seals on the board yet</p>
          <p className="mx-auto mt-2 max-w-[40ch] text-sm text-bc-mute">
            Be the first contribution — amounts stay private; only the commitment appears here.
          </p>
          {auction.canSeal ? (
            <Link
              to={`/auctions/${auction.id}/seal`}
              className="mt-6 inline-flex rounded-[var(--bc-radius)] bg-bc-cyan px-5 py-2.5 text-sm font-medium text-bc-cyan-ink"
            >
              Seal bid
            </Link>
          ) : null}
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {auctionEntries.map((entry, index) => {
            const active = selectedBid === entry.bidCommitment;
            return (
              <li key={entry.bidCommitment}>
                <button
                  type="button"
                  onClick={() => onSelectedBid(entry.bidCommitment)}
                  className={`w-full border p-5 text-left transition active:scale-[0.99] ${
                    active
                      ? 'border-[color-mix(in_srgb,var(--bc-cyan)_50%,transparent)] bg-[color-mix(in_srgb,var(--bc-cyan)_10%,transparent)]'
                      : 'border-bc-line bg-bc-elevated hover:border-bc-mute'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-bc-mute">
                      Seal {String(index + 1).padStart(2, '0')}
                    </span>
                    {active ? (
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-bc-cyan">
                        Selected
                      </span>
                    ) : null}
                  </div>
                  <p className="font-display mt-3 text-lg font-semibold">
                    {labelForAuctionHex(entry.auctionId)}
                  </p>
                  {state.showAdvanced ? (
                    <>
                      <p className="mt-2 font-mono text-[11px] text-bc-mute">
                        bid {trunc(entry.bidCommitment)}
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-bc-mute">
                        agent {trunc(entry.bidderCommitment)}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-xs text-bc-mute">Commitment on registry</p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
