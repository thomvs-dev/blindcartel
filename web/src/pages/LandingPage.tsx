import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { EnvelopeSimple, EyeSlash, Seal } from '@phosphor-icons/react';
import { useProgress } from '../components/ProgressProvider';

const ease = [0.16, 1, 0.3, 1] as const;

export function LandingPage() {
  const reduce = useReducedMotion();
  const { state } = useProgress();
  const enterTo = state.onboarded ? '/home' : '/onboarding';

  return (
    <div>
      <section className="relative isolate min-h-[100dvh] overflow-hidden">
        <img
          src="/images/hero-vault.png"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div
          className="anim-metal-haze absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(105deg, rgba(11,14,17,0.94) 0%, rgba(11,14,17,0.82) 40%, rgba(11,14,17,0.45) 68%, rgba(11,14,17,0.72) 100%), radial-gradient(ellipse 55% 45% at 78% 28%, rgba(245,166,35,0.12), transparent 55%)',
          }}
          aria-hidden
        />

        <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1400px] flex-col justify-center px-4 pb-16 pt-24 md:px-8 md:pt-12">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="font-display mb-5 text-3xl font-semibold tracking-tight text-bc-ink md:text-5xl lg:text-6xl"
          >
            Blind <span className="text-bc-cyan">Cartel</span>
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduce ? 0 : 0.08, ease }}
            className="font-display max-w-[16ch] text-4xl leading-[1.08] font-medium tracking-tight md:text-5xl lg:text-6xl"
          >
            Seal the bid. Keep the signal dark.
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduce ? 0 : 0.16, ease }}
            className="mt-5 max-w-[42ch] text-base leading-relaxed text-bc-mute md:text-lg"
          >
            Rivals pool sealed AI intel without exposing signals — only commitments reach the board.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduce ? 0 : 0.24, ease }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              to={enterTo}
              className="rounded-[var(--bc-radius)] bg-bc-cyan px-5 py-3 text-sm font-medium whitespace-nowrap text-bc-cyan-ink transition-transform active:scale-[0.98]"
            >
              {state.onboarded ? 'Open desk' : 'Enter the cartel'}
            </Link>
            <Link
              to="/auctions"
              className="rounded-[var(--bc-radius)] border border-bc-line bg-bc-elevated px-5 py-3 text-sm font-medium whitespace-nowrap text-bc-ink transition-transform active:scale-[0.98]"
            >
              Browse auctions
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-bc-line">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-20 md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:px-8 md:py-28">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, ease }}
          >
            <h2 className="font-display m-0 max-w-[18ch] text-3xl leading-tight font-medium tracking-tight md:text-4xl">
              Industrial intrigue, sealed-envelope tension
            </h2>
            <p className="mt-4 max-w-[55ch] text-base leading-relaxed text-bc-mute">
              When rivals bid on the same intelligence, the amount is the signal. Blind Cartel turns
              that into a commitment — the board learns a seal landed, not what you offered.
            </p>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55, delay: reduce ? 0 : 0.08, ease }}
            className="flex items-center border-l border-bc-line pl-6 md:pl-8"
          >
            <div className="anim-countdown-pulse inline-flex flex-col items-start rounded-[var(--bc-radius)] border border-[color-mix(in_srgb,var(--bc-cyan)_40%,transparent)] bg-[color-mix(in_srgb,var(--bc-cyan)_8%,transparent)] px-6 py-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bc-cyan">
                Sealing window
              </p>
              <p className="font-display mt-2 text-2xl font-medium text-bc-ink">Open now</p>
              <p className="mt-1 text-sm text-bc-mute">Fraud intel Q3 · live desk</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-bc-line bg-bc-elevated">
        <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8 md:py-28">
          <h2 className="font-display m-0 text-3xl font-medium tracking-tight md:text-4xl">
            How the desk works
          </h2>
          <ol className="mt-12 m-0 grid list-none gap-10 p-0 md:grid-cols-3 md:gap-8">
            {[
              {
                icon: EnvelopeSimple,
                title: 'Pick an auction',
                body: 'Open the lobby, choose a live market, and step onto the auction desk.',
              },
              {
                icon: Seal,
                title: 'Seal your bid',
                body: 'Contribute privately. The registry records a commitment — never the amount.',
              },
              {
                icon: EyeSlash,
                title: 'Prove when ready',
                body: 'Show you sealed without revealing what you sealed. Clearance climbs with returns.',
              },
            ].map((step, i) => (
              <motion.li
                key={step.title}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.07, ease }}
                className="min-w-0"
              >
                <step.icon size={28} weight="duotone" className="text-bc-cyan" aria-hidden />
                <h3 className="font-display mt-4 m-0 text-xl font-medium tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 m-0 max-w-[36ch] text-sm leading-relaxed text-bc-mute">
                  {step.body}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="surface-day border-t border-bc-day-line">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-20 md:flex-row md:items-end md:justify-between md:px-8 md:py-28">
          <div>
            <h2 className="font-display m-0 max-w-[18ch] text-3xl font-medium tracking-tight md:text-4xl">
              Watcher → Courier → Sealed → Proven → Lead
            </h2>
            <p className="bc-mute mt-3 max-w-[48ch] text-base">
              Climb cartel clearance by sealing, proving, and returning for the next round — quiet
              standing, not arcade spam.
            </p>
          </div>
          <Link
            to={enterTo}
            className="inline-flex w-fit rounded-[var(--bc-radius)] bg-bc-steel px-5 py-3 text-sm font-medium text-bc-cyan transition-transform active:scale-[0.98]"
          >
            {state.onboarded ? 'Open desk' : 'Start orientation'}
          </Link>
        </div>
      </section>

      <footer className="border-t border-bc-line">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-bc-mute md:px-8">
          <span>Blind Cartel on Midnight</span>
          <Link to="/help" className="hover:text-bc-ink">
            Help & privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}
