import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import pino from 'pino';
import type { SealedBidEntryView } from '@api/common-types.js';
import { AppChrome } from './components/AppChrome';
import { ConnectWalletModal } from './components/ConnectWalletModal';
import { ProgressProvider, useProgress } from './components/ProgressProvider';
import { RequireOnboarded } from './components/RequireOnboarded';
import { ToastProvider, useToasts } from './components/StatusToasts';
import { idleTxFlow, TxFlow, type TxFlowState } from './components/TxFlow';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { HomePage } from './pages/HomePage';
import { AuctionsPage } from './pages/AuctionsPage';
import { AuctionDeskPage } from './pages/AuctionDeskPage';
import { SealPage } from './pages/SealPage';
import { ResultsPage } from './pages/ResultsPage';
import { ActivityPage } from './pages/ActivityPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';
import {
  BrowserBlindCartelManager,
  BlindCartelAPI,
  friendlyError,
} from './lib/BrowserBlindCartelManager';
import { CONTRACT_ADDRESS, INDEXER_URL, NETWORK_ID } from './config';
import { networkLabel } from './lib/networkLabels';

function AppShell() {
  const location = useLocation();
  const { state, recordConnect } = useProgress();
  const { push } = useToasts();

  const managerRef = useRef<BrowserBlindCartelManager | null>(null);
  const [connected, setConnected] = useState(false);
  const [unshieldedAddress, setUnshieldedAddress] = useState<string | null>(null);
  const [entries, setEntries] = useState<SealedBidEntryView[]>([]);
  const [bidCount, setBidCount] = useState(0);
  const [selectedBid, setSelectedBid] = useState('');
  const [busy, setBusy] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [txFlow, setTxFlow] = useState<TxFlowState>(idleTxFlow);

  const bareChrome =
    location.pathname === '/' || location.pathname === '/onboarding';

  const getManager = useCallback(() => {
    if (!managerRef.current) {
      const logger = pino({ level: 'warn', browser: { asObject: true } });
      managerRef.current = new BrowserBlindCartelManager(logger);
    }
    return managerRef.current;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const registry = await BlindCartelAPI.fetchRegistryState(
        INDEXER_URL,
        CONTRACT_ADDRESS,
        NETWORK_ID,
      );
      setEntries(registry.entries);
      setBidCount(registry.bidCount);
    } catch {
      // Quiet refresh failures
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), 15_000);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    document.documentElement.classList.toggle('compact', state.compactMode);
  }, [state.compactMode]);

  async function onConnect() {
    setBusy(true);
    try {
      const manager = getManager();
      const session = await manager.getSession();
      await manager.join(CONTRACT_ADDRESS);
      setUnshieldedAddress(session.unshieldedAddress);
      setConnected(true);
      setConnectOpen(false);
      recordConnect();
      push({
        tone: 'ok',
        title: 'You’re on the desk',
        body: `Connected on ${networkLabel(NETWORK_ID)}.`,
      });
    } catch (e) {
      push({
        tone: 'warn',
        title: 'Couldn’t connect',
        body: friendlyError(e),
      });
    } finally {
      setBusy(false);
    }
  }

  async function onDisconnect() {
    setBusy(true);
    try {
      await getManager().disconnect();
    } catch {
      // ignore
    }
    setConnected(false);
    setUnshieldedAddress(null);
    setBusy(false);
    push({ tone: 'info', title: 'Left the desk' });
  }

  return (
    <div className="min-h-[100dvh] bg-bc-steel text-bc-ink">
      <AppChrome
        bare={bareChrome}
        connected={connected}
        busy={busy}
        onOpenConnect={() => setConnectOpen(true)}
        onDisconnect={() => void onDisconnect()}
      />

      <div className={bareChrome ? undefined : 'md:pl-14'}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            path="/home"
            element={
              <RequireOnboarded>
                <HomePage
                  bidCount={bidCount}
                  connected={connected}
                  onOpenConnect={() => setConnectOpen(true)}
                />
              </RequireOnboarded>
            }
          />
          <Route path="/auctions" element={<AuctionsPage bidCount={bidCount} />} />
          <Route
            path="/auctions/:id"
            element={
              <AuctionDeskPage
                bidCount={bidCount}
                connected={connected}
                onOpenConnect={() => setConnectOpen(true)}
              />
            }
          />
          <Route
            path="/auctions/:id/seal"
            element={
              <RequireOnboarded>
                <SealPage
                  connected={connected}
                  busy={busy}
                  manager={getManager()}
                  onBusy={setBusy}
                  onOpenConnect={() => setConnectOpen(true)}
                  onTxFlow={setTxFlow}
                  onRefresh={refresh}
                  onSelectedBid={setSelectedBid}
                  onToast={(tone, title, body) => push({ tone, title, body })}
                />
              </RequireOnboarded>
            }
          />
          <Route
            path="/auctions/:id/results"
            element={
              <RequireOnboarded>
                <ResultsPage
                  entries={entries}
                  bidCount={bidCount}
                  selectedBid={selectedBid}
                  connected={connected}
                  busy={busy}
                  manager={getManager()}
                  onBusy={setBusy}
                  onOpenConnect={() => setConnectOpen(true)}
                  onSelectedBid={setSelectedBid}
                  onTxFlow={setTxFlow}
                  onRefresh={refresh}
                  onToast={(tone, title, body) => push({ tone, title, body })}
                />
              </RequireOnboarded>
            }
          />
          <Route
            path="/activity"
            element={
              <RequireOnboarded>
                <ActivityPage />
              </RequireOnboarded>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireOnboarded>
                <ProfilePage />
              </RequireOnboarded>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireOnboarded>
                <SettingsPage />
              </RequireOnboarded>
            }
          />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/app" element={<Navigate to="/home" replace />} />
          <Route path="/desk" element={<Navigate to="/auctions" replace />} />
          <Route path="/market" element={<Navigate to="/auctions" replace />} />
          <Route path="/privacy" element={<Navigate to="/help" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {!bareChrome ? (
          <footer className="border-t border-bc-line py-6 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-bc-mute">
            Blind Cartel — sealed intel, public commitments
            {state.showAdvanced && unshieldedAddress ? (
              <span className="mt-2 block opacity-70 normal-case tracking-normal">
                Session {unshieldedAddress.slice(0, 8)}…{unshieldedAddress.slice(-4)}
              </span>
            ) : null}
          </footer>
        ) : null}
      </div>

      <ConnectWalletModal
        open={connectOpen}
        busy={busy}
        onClose={() => setConnectOpen(false)}
        onConnect={() => void onConnect()}
      />
      <TxFlow flow={txFlow} onClose={() => setTxFlow(idleTxFlow())} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ProgressProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </ProgressProvider>
    </BrowserRouter>
  );
}
