import { useState } from 'react';
import { Warning } from '@phosphor-icons/react';
import { useProgress } from '../components/ProgressProvider';
import { networkLabel } from '../lib/networkLabels';
import { NETWORK_ID, CONTRACT_ADDRESS } from '../config';
import { AdvancedDetails } from '../components/AdvancedDetails';
import { useToasts } from '../components/StatusToasts';
import { rotateSecrets, getOrCreateSecrets } from '../lib/BrowserBlindCartelManager';
import { toHex } from '../lib/blind-cartel';

export function SettingsPage() {
  const { state, updateSettings, resetLocalData } = useProgress();
  const { push } = useToasts();
  const [name, setName] = useState(state.displayName);

  function saveName() {
    updateSettings({ displayName: name.trim() || 'Anonymous agent' });
    push({ tone: 'ok', title: 'Display name saved' });
  }

  function handleReset() {
    if (!window.confirm('Reset local standing, achievements, and preferences on this device?')) {
      return;
    }
    resetLocalData();
    setName('Anonymous agent');
    push({ tone: 'info', title: 'Local data cleared', body: 'Orientation will restart next visit.' });
  }

  function handleRotateSecrets() {
    if (
      !window.confirm(
        'Rotate local secrets? You will lose the ability to prove ownership of bids sealed with the previous secret. This cannot be undone.',
      )
    ) {
      return;
    }
    rotateSecrets();
    push({
      tone: 'warn',
      title: 'Secrets rotated',
      body: 'New local secret for future seals. Old seals can no longer be proven from this browser.',
    });
  }

  const secrets = state.showAdvanced ? getOrCreateSecrets() : null;

  return (
    <div className="mx-auto max-w-[640px] px-4 py-12 md:px-8 md:py-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-3 text-bc-mute">Preferences stay in this browser.</p>

      <section className="mt-10 space-y-8">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-bc-mute">
            Display name
          </span>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              className="min-w-0 flex-1 rounded-[var(--bc-radius)] border border-bc-line bg-bc-elevated px-4 py-3 text-sm text-bc-ink outline-none focus:border-bc-cyan focus:ring-2 focus:ring-bc-cyan/20"
            />
            <button
              type="button"
              onClick={saveName}
              className="shrink-0 rounded-[var(--bc-radius)] bg-bc-cyan px-4 py-2 text-sm font-medium text-bc-cyan-ink"
            >
              Save
            </button>
          </div>
        </label>

        <label className="flex cursor-pointer items-start justify-between gap-4 border border-bc-line bg-bc-elevated px-4 py-4">
          <span>
            <span className="block text-sm font-medium text-bc-ink">Compact mode</span>
            <span className="mt-1 block text-xs text-bc-mute">
              Tighter spacing for smaller screens.
            </span>
          </span>
          <input
            type="checkbox"
            checked={state.compactMode}
            onChange={(e) => updateSettings({ compactMode: e.target.checked })}
            className="mt-1 h-4 w-4 accent-[var(--bc-cyan)]"
          />
        </label>

        <label className="flex cursor-pointer items-start justify-between gap-4 border border-bc-line bg-bc-elevated px-4 py-4">
          <span>
            <span className="block text-sm font-medium text-bc-ink">Show advanced details</span>
            <span className="mt-1 block text-xs text-bc-mute">
              Reveal contract addresses and hex ids where they appear. Not needed for normal sealing.
            </span>
          </span>
          <input
            type="checkbox"
            checked={state.showAdvanced}
            onChange={(e) => updateSettings({ showAdvanced: e.target.checked })}
            className="mt-1 h-4 w-4 accent-[var(--bc-cyan)]"
          />
        </label>

        <div className="border border-bc-line bg-bc-elevated px-4 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-bc-mute">Network</p>
          <p className="font-display mt-2 text-xl font-semibold">{networkLabel(NETWORK_ID)}</p>
        </div>

        <AdvancedDetails label="Deployment details">
          <p>Network id: {NETWORK_ID}</p>
          <p>Contract: {CONTRACT_ADDRESS}</p>
          {secrets ? (
            <>
              <p>Local secret (prefix): {toHex(secrets.bidderSecret).slice(0, 16)}…</p>
              <p>Local amount bytes (prefix): {toHex(secrets.bidAmount).slice(0, 16)}…</p>
            </>
          ) : null}
        </AdvancedDetails>

        <div className="border border-bc-rust/35 bg-bc-rust/5 p-5">
          <div className="flex items-start gap-3">
            <Warning size={20} weight="fill" className="mt-0.5 shrink-0 text-bc-rust" />
            <div>
              <p className="text-sm font-medium text-bc-ink">Rotate local secrets</p>
              <p className="mt-2 text-xs leading-relaxed text-bc-mute">
                Generates a new bidder secret and amount for future seals. You will lose ownership
                proofs for bids sealed with the previous secret.
              </p>
              <button
                type="button"
                onClick={handleRotateSecrets}
                className="mt-4 rounded-[var(--bc-radius)] border border-bc-rust/50 px-3 py-1.5 text-xs text-bc-rust transition hover:bg-bc-rust/10"
              >
                Rotate secrets
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="rounded-[var(--bc-radius)] border border-bc-line px-4 py-2.5 text-sm text-bc-mute transition hover:border-bc-rust hover:text-bc-rust"
        >
          Reset local data
        </button>
      </section>
    </div>
  );
}
