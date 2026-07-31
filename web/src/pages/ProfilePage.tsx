import { Link } from 'react-router-dom';
import { Trophy } from '@phosphor-icons/react';
import { useProgress } from '../components/ProgressProvider';
import { ACHIEVEMENTS, currentSeasonId } from '../lib/progress';

export function ProfilePage() {
  const { state, rank } = useProgress();
  const season = currentSeasonId();

  return (
    <div className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bc-cyan">Profile</p>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight">
            {state.displayName}
          </h1>
          <p className="mt-3 text-bc-mute">
            {rank.current.label} · {state.xp} XP · {state.streak}-day streak
          </p>
        </div>
        <Link
          to="/settings"
          className="rounded-[var(--bc-radius)] border border-bc-line px-4 py-2 text-sm text-bc-ink transition hover:bg-bc-soft"
        >
          Settings
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Seals', value: state.seals },
          { label: 'Ownership proofs', value: state.proofs },
          { label: `Season ${season}`, value: state.seasonSeals },
          { label: 'Achievements', value: state.achievements.length },
        ].map((stat) => (
          <div key={stat.label} className="border border-bc-line bg-bc-elevated p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-bc-mute">
              {stat.label}
            </p>
            <p className="font-display mt-2 text-3xl font-semibold text-bc-cyan">{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-14">
        <div className="flex items-center gap-2">
          <Trophy size={22} weight="duotone" className="text-bc-cyan" />
          <h2 className="font-display text-2xl font-semibold">Achievements</h2>
        </div>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ACHIEVEMENTS.map((ach) => {
            const unlocked = state.achievements.includes(ach.id);
            return (
              <li
                key={ach.id}
                className={`border p-5 ${
                  unlocked
                    ? 'border-bc-cyan/35 bg-bc-elevated'
                    : 'border-bc-line bg-bc-soft/40 opacity-55'
                }`}
              >
                <p className="font-display text-lg font-semibold">{ach.title}</p>
                <p className="mt-2 text-sm text-bc-mute">{ach.blurb}</p>
                <p className="mt-3 font-mono text-[11px] text-bc-mute">
                  {unlocked ? 'Unlocked' : 'Locked'} · +{ach.xp} XP
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
