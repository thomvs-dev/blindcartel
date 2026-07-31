import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { CircleNotch, Seal } from '@phosphor-icons/react';
import {
  BrowserBlindCartelManager,
  BlindCartelAPI,
  getOrCreateSecrets,
} from '../lib/BrowserBlindCartelManager';
import { auctionById, auctionIdBytes } from '../lib/auctions';
import { CONTRACT_ADDRESS } from '../config';
import { useProgress } from '../components/ProgressProvider';
import type { TxFlowState } from '../components/TxFlow';
import { runTxFlow } from '../lib/runTxFlow';
import { AdvancedDetails } from '../components/AdvancedDetails';
import { toHex } from '../lib/blind-cartel';

type Props = {
  connected: boolean;
  busy: boolean;
  manager: BrowserBlindCartelManager;
  onBusy: (v: boolean) => void;
  onOpenConnect: () => void;
  onTxFlow: (flow: TxFlowState | ((prev: TxFlowState) => TxFlowState)) => void;
  onRefresh: () => Promise<void>;
  onSelectedBid: (hex: string) => void;
  onToast: (tone: 'ok' | 'warn' | 'info', title: string, body?: string) => void;
};

export function SealPage({
  connected,
  busy,
  manager,
  onBusy,
  onOpenConnect,
  onTxFlow,
  onRefresh,
  onSelectedBid,
  onToast,
}: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recordSeal, state } = useProgress();
  const auction = id ? auctionById(id) : undefined;
  const [sealed, setSealed] = useState(false);
  const secrets = useMemo(() => getOrCreateSecrets(), []);

  if (!auction) {
    return <Navigate to="/auctions" replace />;
  }

  if (!auction.canSeal) {
    return <Navigate to={`/auctions/${auction.id}`} replace />;
  }

  const auctionBytes = auctionIdBytes(auction);
  const previews = BlindCartelAPI.commitmentPreviews(secrets, auctionBytes);

  async function handleSeal() {
    if (!connected) {
      onOpenConnect();
      return;
    }
    onBusy(true);
    const ok = await runTxFlow({
      setFlow: onTxFlow,
      action: 'Seal bid',
      successTitle: 'Bid sealed',
      successDetail: `Your seal on ${auction!.title} is on the public registry. Amount stays dark.`,
      work: () => manager.submitSealedBid(CONTRACT_ADDRESS, auctionBytes),
      onRefresh,
      onError: (msg) => onToast('warn', 'Couldn’t seal', msg),
    });
    onBusy(false);
    if (ok) {
      onSelectedBid(previews.bidCommitment);
      recordSeal(auction!.title);
      setSealed(true);
      onToast('ok', 'Bid sealed', 'Contribution recorded privately.');
    }
  }

  return (
    <div className="mx-auto max-w-[640px] px-4 py-12 md:px-8 md:py-16">
      <Link
        to={`/auctions/${auction.id}`}
        className="font-mono text-[11px] uppercase tracking-[0.14em] text-bc-mute transition hover:text-bc-cyan"
      >
        ← {auction.title}
      </Link>

      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-bc-cyan">
        Seal wizard
      </p>
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight">Seal your bid</h1>
      <p className="mt-4 max-w-[48ch] text-lg leading-relaxed text-bc-mute">
        One private contribution for <span className="text-bc-ink">{auction.title}</span>. The board
        learns a commitment landed — not your amount.
      </p>

      {!sealed ? (
        <section className="mt-10 border border-bc-line bg-bc-elevated p-6 md:p-8">
          <ol className="m-0 list-none space-y-4 p-0">
            {[
              'Confirm you’re on the right market',
              'Connect if you haven’t',
              'Seal — proving can take up to a minute',
            ].map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="font-mono text-[11px] text-bc-cyan">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-bc-mute">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-8 flex flex-wrap gap-2">
            {!connected ? (
              <button
                type="button"
                onClick={onOpenConnect}
                className="inline-flex items-center gap-2 rounded-[var(--bc-radius)] bg-bc-cyan px-5 py-3 text-sm font-medium text-bc-cyan-ink transition hover:brightness-110 active:scale-[0.98]"
              >
                Connect to seal
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleSeal()}
                className="inline-flex items-center gap-2 rounded-[var(--bc-radius)] bg-bc-cyan px-5 py-3 text-sm font-medium text-bc-cyan-ink disabled:opacity-50 active:scale-[0.98]"
              >
                {busy ? <CircleNotch className="animate-spin" size={16} /> : <Seal size={16} weight="fill" />}
                Seal bid
              </button>
            )}
          </div>

          {state.showAdvanced ? (
            <AdvancedDetails label="Advanced (hex)">
              <p>Auction key: {auction.auctionKey}</p>
              <p>Resolved id: {toHex(auctionBytes)}</p>
              <p>Bid commitment preview: {previews.bidCommitment}</p>
            </AdvancedDetails>
          ) : null}
        </section>
      ) : (
        <section className="anim-shutter-lock mt-10 border border-[color-mix(in_srgb,var(--bc-cyan)_40%,transparent)] bg-bc-elevated p-6 text-center md:p-10">
          <Seal size={48} weight="duotone" className="mx-auto text-bc-cyan anim-seal-stamp" />
          <h2 className="font-display mt-5 text-2xl font-semibold">Bid locked</h2>
          <p className="mx-auto mt-3 max-w-[36ch] text-sm text-bc-mute">
            Your seal is on the board. Wait for the reveal window, or prove ownership now without
            revealing the amount.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/auctions/${auction.id}/results`)}
              className="rounded-[var(--bc-radius)] bg-bc-cyan px-5 py-3 text-sm font-medium text-bc-cyan-ink active:scale-[0.98]"
            >
              Board & prove
            </button>
            <Link
              to="/auctions"
              className="rounded-[var(--bc-radius)] border border-bc-line px-5 py-3 text-sm text-bc-ink transition hover:bg-bc-soft"
            >
              Back to lobby
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
