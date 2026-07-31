/** Shared across deploy, CLI, tests, and browser — must stay in sync. */
export const blindCartelPrivateStateKey = 'blindCartelPrivateState' as const;
export type BlindCartelPrivateStateId = typeof blindCartelPrivateStateKey;
