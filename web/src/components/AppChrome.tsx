import { NavLink, Link } from 'react-router-dom';
import {
  CircleNotch,
  GearSix,
  House,
  ListBullets,
  Pulse,
  SignOut,
  User,
  Wallet,
} from '@phosphor-icons/react';
import { useProgress } from './ProgressProvider';

const links = [
  { to: '/home', label: 'Home', Icon: House },
  { to: '/auctions', label: 'Auctions', Icon: ListBullets },
  { to: '/activity', label: 'Activity', Icon: Pulse },
  { to: '/profile', label: 'Profile', Icon: User },
  { to: '/settings', label: 'Settings', Icon: GearSix },
];

type Props = {
  bare?: boolean;
  connected: boolean;
  busy: boolean;
  onOpenConnect: () => void;
  onDisconnect: () => void;
};

function Monogram({ to }: { to: string }) {
  return (
    <Link
      to={to}
      title="Blind Cartel"
      className="font-display flex h-9 w-9 items-center justify-center bg-bc-cyan text-[13px] font-bold tracking-tight text-bc-cyan-ink"
    >
      BC
    </Link>
  );
}

export function AppChrome({ bare, connected, busy, onOpenConnect, onDisconnect }: Props) {
  const { state, rank } = useProgress();

  if (bare) {
    return (
      <header className="absolute left-0 right-0 top-0 z-40">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <Monogram to="/" />
            <Link
              to="/"
              className="font-display text-sm font-semibold tracking-tight text-bc-ink"
            >
              Blind Cartel
            </Link>
          </div>
          <Link
            to="/help"
            className="font-mono text-[11px] uppercase tracking-[0.14em] text-bc-mute transition hover:text-bc-ink"
          >
            Help
          </Link>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* Desktop left icon rail */}
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden w-14 flex-col border-r border-bc-line bg-bc-elevated md:flex"
        aria-label="Command rail"
      >
        <div className="flex h-14 items-center justify-center border-b border-bc-line">
          <Monogram to="/home" />
        </div>

        <nav className="flex flex-1 flex-col items-center gap-1 py-3">
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              aria-label={label}
              className={({ isActive }) =>
                `relative flex h-10 w-10 items-center justify-center transition-colors ${
                  isActive
                    ? 'bg-bc-soft text-bc-cyan'
                    : 'text-bc-mute hover:bg-bc-soft hover:text-bc-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <span
                      className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 bg-bc-cyan"
                      aria-hidden
                    />
                  ) : null}
                  <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-2 border-t border-bc-line py-3">
          {connected ? (
            <button
              type="button"
              onClick={onDisconnect}
              disabled={busy}
              title="Leave"
              aria-label="Leave"
              className="flex h-9 w-9 items-center justify-center border border-bc-line bg-bc-steel text-bc-mute transition hover:border-bc-mute hover:text-bc-ink disabled:opacity-50"
            >
              <SignOut size={16} weight="bold" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenConnect}
              disabled={busy}
              title="Connect"
              aria-label="Connect"
              className="flex h-9 w-9 items-center justify-center bg-bc-cyan text-bc-cyan-ink transition hover:brightness-110 disabled:opacity-50"
            >
              {busy ? (
                <CircleNotch size={16} className="animate-spin" />
              ) : (
                <Wallet size={16} weight="bold" />
              )}
            </button>
          )}
        </div>
      </aside>

      {/* Mobile: utility bar + segmented control (top, not bottom tabs) */}
      <header className="sticky top-0 z-40 border-b border-bc-line bg-bc-elevated md:hidden">
        <div className="flex h-12 items-center justify-between gap-3 px-3">
          <div className="flex min-w-0 items-center gap-2">
            <Monogram to="/home" />
            <div className="min-w-0">
              <p className="font-display truncate text-xs font-semibold tracking-tight">
                Blind Cartel
              </p>
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-bc-mute">
                {state.displayName} · {rank.current.label}
              </p>
            </div>
          </div>
          {connected ? (
            <button
              type="button"
              onClick={onDisconnect}
              disabled={busy}
              title="Leave"
              aria-label="Leave"
              className="flex h-8 w-8 shrink-0 items-center justify-center border border-bc-line text-bc-mute"
            >
              <SignOut size={14} weight="bold" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenConnect}
              disabled={busy}
              title="Connect"
              aria-label="Connect"
              className="flex h-8 w-8 shrink-0 items-center justify-center bg-bc-cyan text-bc-cyan-ink"
            >
              {busy ? (
                <CircleNotch size={14} className="animate-spin" />
              ) : (
                <Wallet size={14} weight="bold" />
              )}
            </button>
          )}
        </div>

        <nav
          className="flex border-t border-bc-line"
          aria-label="Primary"
        >
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                `flex-1 border-r border-bc-line px-1 py-2 text-center font-mono text-[10px] uppercase tracking-[0.1em] last:border-r-0 ${
                  isActive
                    ? 'bg-bc-soft text-bc-cyan'
                    : 'text-bc-mute'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
    </>
  );
}
