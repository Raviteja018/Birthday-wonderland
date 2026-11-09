import { describe, expect, it } from 'vitest';
import { experienceReducer, initialExperienceState, type ExperienceAction, type ExperienceState } from './experienceReducer';
import { SceneIndex } from './constants';

const run = (actions: ExperienceAction[], from: ExperienceState = initialExperienceState) =>
  actions.reduce((state, action) => {
    const next = experienceReducer(state, action);
    // Release the transition lock after every navigation, as the app's timer does.
    return experienceReducer(next, { type: 'SET_TRANSITIONING', value: false });
  }, from);

const at = (sceneIndex: number, extra: Partial<ExperienceState> = {}): ExperienceState => ({
  ...initialExperienceState,
  sceneIndex,
  ...extra,
});

describe('experienceReducer navigation', () => {
  it('cannot go below scene 0 or above scene 5 (the letter is the finale)', () => {
    expect(run([{ type: 'GO_BACK' }]).sceneIndex).toBe(0);
    const letter = at(SceneIndex.Letter, { letterOpened: true, completedSceneIds: [0, 1, 2, 3, 4, 5] });
    expect(run([{ type: 'GO_NEXT' }], letter).sceneIndex).toBe(SceneIndex.Letter);
  });

  it('moves from welcome to the heart tree and marks welcome complete', () => {
    const state = run([{ type: 'GO_NEXT' }]);
    expect(state.sceneIndex).toBe(SceneIndex.HeartTree);
    expect(state.completedSceneIds).toContain(SceneIndex.Welcome);
  });

  it('blocks Continue until the scene activity is complete', () => {
    const tree = at(SceneIndex.HeartTree);
    expect(run([{ type: 'GO_NEXT' }], tree).sceneIndex).toBe(SceneIndex.HeartTree);
  });

  it('ignores navigation while a transition is running (double-click guard)', () => {
    const once = experienceReducer(initialExperienceState, { type: 'GO_NEXT' });
    expect(once.isTransitioning).toBe(true);
    const twice = experienceReducer(once, { type: 'SKIP_ACTIVITY' });
    expect(twice.sceneIndex).toBe(SceneIndex.HeartTree);
    expect(experienceReducer(once, { type: 'GO_BACK' }).sceneIndex).toBe(SceneIndex.HeartTree);
  });
});

describe('experienceReducer activities', () => {
  it('counts unique hearts only and unlocks at 3', () => {
    let state = run([{ type: 'GO_NEXT' }, { type: 'DISCOVER_HEART', id: 0 }, { type: 'DISCOVER_HEART', id: 0 }, { type: 'DISCOVER_HEART', id: 1 }]);
    expect(state.discoveredHeartIds).toEqual([0, 1]);
    expect(state.completedSceneIds).not.toContain(SceneIndex.HeartTree);
    state = run([{ type: 'DISCOVER_HEART', id: 99 }, { type: 'DISCOVER_HEART', id: -1 }], state);
    expect(state.discoveredHeartIds).toEqual([0, 1]);
    state = run([{ type: 'DISCOVER_HEART', id: 5 }], state);
    expect(state.completedSceneIds).toContain(SceneIndex.HeartTree);
    expect(run([{ type: 'GO_NEXT' }], state).sceneIndex).toBe(SceneIndex.Cake);
  });

  it('requires all three candles before the cake can be cut', () => {
    let state = run([{ type: 'EXTINGUISH_CANDLE', id: 0 }, { type: 'EXTINGUISH_CANDLE', id: 0 }, { type: 'EXTINGUISH_CANDLE', id: 1 }, { type: 'CUT_CAKE' }], at(SceneIndex.Cake));
    expect(state.extinguishedCandleIds).toEqual([0, 1]);
    expect(state.cakeCut).toBe(false);
    state = run([{ type: 'EXTINGUISH_CANDLE', id: 2 }, { type: 'CUT_CAKE' }], state);
    expect(state.cakeCut).toBe(true);
    expect(state.completedSceneIds).toContain(SceneIndex.Cake);
  });

  it('deduplicates balloon pops, unlocks at 6 and resets only the balloons', () => {
    let state = run([0, 0, 1, 2, 3, 4].map((id) => ({ type: 'POP_BALLOON', id }) as const), at(SceneIndex.Balloons));
    expect(state.poppedBalloonIds).toHaveLength(5);
    expect(state.completedSceneIds).not.toContain(SceneIndex.Balloons);
    state = run([{ type: 'POP_BALLOON', id: 5 }], state);
    expect(state.completedSceneIds).toContain(SceneIndex.Balloons);
    state = run([{ type: 'RESET_BALLOONS' }], state);
    expect(state.poppedBalloonIds).toEqual([]);
    expect(state.completedSceneIds).toContain(SceneIndex.Balloons);
    expect(state.sceneIndex).toBe(SceneIndex.Balloons);
  });

  it('keeps the memory index in bounds and marks a memory viewed', () => {
    const memories = at(SceneIndex.Memories);
    expect(run([{ type: 'SET_MEMORY_INDEX', index: 9, count: 3 }], memories).memoryIndex).toBe(2);
    expect(run([{ type: 'SET_MEMORY_INDEX', index: -4, count: 3 }], memories).memoryIndex).toBe(0);
    expect(run([{ type: 'SET_MEMORY_INDEX', index: 1, count: 3 }], memories).hasViewedMemory).toBe(true);
  });

  it('marks memories viewed on arrival and preserves the index across Back/Next', () => {
    const balloonsDone = at(SceneIndex.Balloons, { completedSceneIds: [0, 1, 2, 3] });
    let state = run([{ type: 'GO_NEXT' }], balloonsDone);
    expect(state.sceneIndex).toBe(SceneIndex.Memories);
    expect(state.hasViewedMemory).toBe(true);
    state = run([{ type: 'SET_MEMORY_INDEX', index: 2, count: 3 }, { type: 'GO_BACK' }, { type: 'GO_NEXT' }], state);
    expect(state.sceneIndex).toBe(SceneIndex.Memories);
    expect(state.memoryIndex).toBe(2);
  });

  it('opening the letter completes the final chapter', () => {
    const state = run([{ type: 'OPEN_LETTER' }], at(SceneIndex.Letter, { completedSceneIds: [0, 1, 2, 3, 4] }));
    expect(state.letterOpened).toBe(true);
    expect(state.completedSceneIds).toContain(SceneIndex.Letter);
  });

  it('skip marks the current activity complete and advances; the letter itself is never skipped', () => {
    let state = run([{ type: 'GO_NEXT' }]);
    for (const scene of [SceneIndex.HeartTree, SceneIndex.Cake, SceneIndex.Balloons, SceneIndex.Memories]) {
      expect(state.sceneIndex).toBe(scene);
      state = run([{ type: 'SKIP_ACTIVITY' }], state);
      expect(state.completedSceneIds).toContain(scene);
    }
    expect(state.sceneIndex).toBe(SceneIndex.Letter);
    expect(run([{ type: 'SKIP_ACTIVITY' }], state).sceneIndex).toBe(SceneIndex.Letter);
  });

  it('replay from the letter finale resets every interaction but keeps the audio preference', () => {
    const played = at(SceneIndex.Letter, {
      completedSceneIds: [0, 1, 2, 3, 4, 5],
      discoveredHeartIds: [0, 1, 2],
      extinguishedCandleIds: [0, 1, 2],
      cakeCut: true,
      poppedBalloonIds: [0, 1, 2, 3, 4, 5],
      memoryIndex: 2,
      hasViewedMemory: true,
      letterOpened: true,
      isMusicEnabled: true,
    });
    const state = run([{ type: 'REPLAY' }], played);
    expect(state).toEqual({ ...initialExperienceState, isMusicEnabled: true });
  });
});
