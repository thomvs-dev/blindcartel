/**
 * Local cartel clearance — retention without leaking identity on-chain.
 * Season contributions + streaks; wallet link stays private.
 */

export type ClearanceId = 'watcher' | 'courier' | 'sealed' | 'proven' | 'cartel_lead';

export type AchievementId =
  | 'first_steps'
  | 'bid_sealed'
  | 'ownership_proven'
  | 'lobby_regular'
  | 'streak_3'
  | 'streak_7'
  | 'returned_agent'
  | 'season_three';

export type HistoryEvent = {
  id: string;
  at: number;
  kind: 'onboarded' | 'connected' | 'seal' | 'prove' | 'visit_lobby' | 'achievement';
  label: string;
  detail?: string;
};

export type ProgressState = {
  displayName: string;
  onboarded: boolean;
  xp: number;
  streak: number;
  lastVisitDay: string | null;
  seals: number;
  proofs: number;
  lobbyVisits: number;
  /** Seals attributed to the current local season */
  seasonSeals: number;
  seasonId: string;
  achievements: AchievementId[];
  history: HistoryEvent[];
  compactMode: boolean;
  showAdvanced: boolean;
};

const STORAGE_KEY = 'blind-cartel-progress-v2';

/** Calendar-ish season key — local only, not on-chain. */
export function currentSeasonId(): string {
  const d = new Date();
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${d.getFullYear()}-Q${q}`;
}

export const CLEARANCE: {
  id: ClearanceId;
  label: string;
  minXp: number;
  blurb: string;
}[] = [
  {
    id: 'watcher',
    label: 'Watcher',
    minXp: 0,
    blurb: 'Clearance 0 — observing the lobby. No seal on record yet.',
  },
  {
    id: 'courier',
    label: 'Courier',
    minXp: 20,
    blurb: 'Clearance I — you’re on the desk. Standing begins.',
  },
  {
    id: 'sealed',
    label: 'Sealed',
    minXp: 60,
    blurb: 'Clearance II — a sealed contribution is on the registry.',
  },
  {
    id: 'proven',
    label: 'Proven',
    minXp: 120,
    blurb: 'Clearance III — ownership proven. Trusted presence.',
  },
  {
    id: 'cartel_lead',
    label: 'Cartel lead',
    minXp: 220,
    blurb: 'Clearance IV — habitual return. Desk regular.',
  },
];

/** @deprecated use CLEARANCE */
export const RANKS = CLEARANCE;

export const ACHIEVEMENTS: {
  id: AchievementId;
  title: string;
  blurb: string;
  xp: number;
}[] = [
  { id: 'first_steps', title: 'Clearance granted', blurb: 'Finished cartel orientation.', xp: 15 },
  { id: 'bid_sealed', title: 'First seal', blurb: 'Sealed your first contribution.', xp: 40 },
  {
    id: 'ownership_proven',
    title: 'Proven seal',
    blurb: 'Proved you contributed — without revealing the amount.',
    xp: 35,
  },
  { id: 'lobby_regular', title: 'Lobby regular', blurb: 'Checked the auction lobby three times.', xp: 20 },
  { id: 'streak_3', title: 'Three-day cadence', blurb: 'Returned three days in a row.', xp: 25 },
  { id: 'streak_7', title: 'Week on the desk', blurb: 'Seven-day return streak.', xp: 50 },
  { id: 'returned_agent', title: 'Returned agent', blurb: 'Came back after sealing.', xp: 15 },
  {
    id: 'season_three',
    title: 'Season contributor',
    blurb: 'Three successful seals this season.',
    xp: 30,
  },
];

const defaultState = (): ProgressState => ({
  displayName: 'Anonymous agent',
  onboarded: false,
  xp: 0,
  streak: 0,
  lastVisitDay: null,
  seals: 0,
  proofs: 0,
  lobbyVisits: 0,
  seasonSeals: 0,
  seasonId: currentSeasonId(),
  achievements: [],
  history: [],
  compactMode: false,
  showAdvanced: false,
});

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function dayDiff(a: string, b: string): number {
  const ms = Date.parse(b) - Date.parse(a);
  return Math.round(ms / 86_400_000);
}

function migrate(raw: Partial<ProgressState> & { marketVisits?: number }): ProgressState {
  const base = defaultState();
  const season = currentSeasonId();
  const lobbyVisits = raw.lobbyVisits ?? raw.marketVisits ?? 0;
  return {
    ...base,
    ...raw,
    lobbyVisits,
    seasonId: raw.seasonId === season ? (raw.seasonId ?? season) : season,
    seasonSeals: raw.seasonId === season ? (raw.seasonSeals ?? 0) : 0,
    history: raw.history?.slice(0, 40) ?? [],
    achievements: (raw.achievements ?? []).filter((id) =>
      ACHIEVEMENTS.some((a) => a.id === id),
    ) as AchievementId[],
  };
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Migrate v1 if present
      const legacy = localStorage.getItem('blind-cartel-progress-v1');
      if (legacy) {
        const parsed = JSON.parse(legacy) as Partial<ProgressState> & { marketVisits?: number };
        const next = migrate(parsed);
        saveProgress(next);
        return next;
      }
      return defaultState();
    }
    const parsed = JSON.parse(raw) as Partial<ProgressState> & { marketVisits?: number };
    return migrate(parsed);
  } catch {
    return defaultState();
  }
}

export function saveProgress(state: ProgressState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function rankForXp(xp: number) {
  let current = CLEARANCE[0];
  for (const rank of CLEARANCE) {
    if (xp >= rank.minXp) current = rank;
  }
  const idx = CLEARANCE.findIndex((r) => r.id === current.id);
  const next = CLEARANCE[idx + 1] ?? null;
  const span = next ? next.minXp - current.minXp : 1;
  const into = next ? xp - current.minXp : span;
  const progress = next ? Math.min(1, into / span) : 1;
  return { current, next, progress };
}

function pushHistory(
  state: ProgressState,
  kind: HistoryEvent['kind'],
  label: string,
  detail?: string,
): ProgressState {
  const event: HistoryEvent = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    at: Date.now(),
    kind,
    label,
    detail,
  };
  return { ...state, history: [event, ...state.history].slice(0, 40) };
}

function unlock(state: ProgressState, id: AchievementId): ProgressState {
  if (state.achievements.includes(id)) return state;
  const meta = ACHIEVEMENTS.find((a) => a.id === id);
  if (!meta) return state;
  let next = {
    ...state,
    achievements: [...state.achievements, id],
    xp: state.xp + meta.xp,
  };
  next = pushHistory(next, 'achievement', meta.title, meta.blurb);
  return next;
}

export function recordVisit(state: ProgressState): ProgressState {
  const today = todayKey();
  const season = currentSeasonId();
  let working = state;
  if (working.seasonId !== season) {
    working = { ...working, seasonId: season, seasonSeals: 0 };
  }

  if (working.lastVisitDay === today) return working;

  let streak = 1;
  if (working.lastVisitDay) {
    const diff = dayDiff(working.lastVisitDay, today);
    streak = diff === 1 ? working.streak + 1 : 1;
  }

  let next: ProgressState = {
    ...working,
    streak,
    lastVisitDay: today,
    xp: working.xp + 2,
  };
  next = pushHistory(next, 'visit_lobby', 'Returned to the desk', `Day streak: ${streak}`);

  if (streak >= 3) next = unlock(next, 'streak_3');
  if (streak >= 7) next = unlock(next, 'streak_7');
  if (working.seals > 0) next = unlock(next, 'returned_agent');

  return next;
}

export function completeOnboarding(state: ProgressState, displayName: string): ProgressState {
  let next: ProgressState = {
    ...state,
    displayName: displayName.trim() || state.displayName,
    onboarded: true,
    xp: state.xp + 10,
  };
  next = pushHistory(next, 'onboarded', 'Orientation complete', next.displayName);
  next = unlock(next, 'first_steps');
  return next;
}

export function recordConnect(state: ProgressState): ProgressState {
  let next = { ...state, xp: state.xp + 8 };
  next = pushHistory(next, 'connected', 'Entered the desk', 'Session linked');
  return next;
}

export function recordSeal(state: ProgressState, auctionLabel: string): ProgressState {
  const season = currentSeasonId();
  const seasonSeals =
    state.seasonId === season ? state.seasonSeals + 1 : 1;
  let next: ProgressState = {
    ...state,
    seals: state.seals + 1,
    seasonSeals,
    seasonId: season,
    xp: state.xp + 30,
  };
  next = pushHistory(next, 'seal', `Sealed on ${auctionLabel}`, 'Contribution recorded privately');
  next = unlock(next, 'bid_sealed');
  if (seasonSeals >= 3) next = unlock(next, 'season_three');
  return next;
}

export function recordProve(state: ProgressState): ProgressState {
  let next: ProgressState = {
    ...state,
    proofs: state.proofs + 1,
    xp: state.xp + 25,
  };
  next = pushHistory(next, 'prove', 'Ownership proven', 'Contribution proven privately');
  next = unlock(next, 'ownership_proven');
  return next;
}

export function recordMarketVisit(state: ProgressState): ProgressState {
  const lobbyVisits = state.lobbyVisits + 1;
  let next: ProgressState = {
    ...state,
    lobbyVisits,
    xp: state.xp + (lobbyVisits <= 3 ? 3 : 0),
  };
  if (lobbyVisits === 1) {
    next = pushHistory(next, 'visit_lobby', 'Opened the auction lobby');
  }
  if (lobbyVisits >= 3) next = unlock(next, 'lobby_regular');
  return next;
}

export function updateSettings(
  state: ProgressState,
  patch: Partial<Pick<ProgressState, 'displayName' | 'compactMode' | 'showAdvanced'>>,
): ProgressState {
  return { ...state, ...patch };
}

export function resetProgress(): ProgressState {
  const fresh = defaultState();
  saveProgress(fresh);
  return fresh;
}
