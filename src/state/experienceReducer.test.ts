import { describe, expect, it } from 'vitest';
import { LAST_SCENE, SceneIndex } from './constants';
import { experienceReducer, initialExperienceState, type ExperienceAction, type ExperienceState } from './experienceReducer';

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

describe('experienceReducer', () => {
  it('cannot go below the first scene or above the last', () => {
    expect(run([{ type: 'GO_BACK' }]).sceneIndex).toBe(0);
    expect(run([{ type: 'GO_NEXT' }], at(LAST_SCENE, { completedSceneIds: [0, 1, 2, 3, 4] })).sceneIndex).toBe(LAST_SCENE);
  });

  it('opening the gift completes the welcome scene and moves to the cake', () => {
    const state = run([{ type: 'GO_NEXT' }]);
    expect(state.sceneIndex).toBe(SceneIndex.Cake);
    expect(state.completedSceneIds).toContain(SceneIndex.Welcome);
  });

  it('the cake needs all candles out before it can be cut, and cutting unlocks Continue', () => {
    const early = run([{ type: 'CUT_CAKE' }], at(SceneIndex.Cake));
    expect(early.cakeCut).toBe(false);
    const state = run(
      [{ type: 'EXTINGUISH_CANDLE', id: 0 }, { type: 'EXTINGUISH_CANDLE', id: 0 }, { type: 'EXTINGUISH_CANDLE', id: 1 }, { type: 'EXTINGUISH_CANDLE', id: 2 }, { type: 'CUT_CAKE' }],
      at(SceneIndex.Cake),
    );
    expect(state.extinguishedCandleIds).toEqual([0, 1, 2]);
    expect(state.cakeCut).toBe(true);
    expect(state.completedSceneIds).toContain(SceneIndex.Cake);
  });

  it('memories only complete through MARK_COMPLETE', () => {
    const entered = run([{ type: 'GO_NEXT' }], at(SceneIndex.Cake, { completedSceneIds: [0, 1] }));
    expect(entered.sceneIndex).toBe(SceneIndex.Memories);
    expect(entered.completedSceneIds).not.toContain(SceneIndex.Memories);
    const done = run([{ type: 'MARK_COMPLETE', sceneIndex: SceneIndex.Memories }], entered);
    expect(done.completedSceneIds).toContain(SceneIndex.Memories);
  });

  it('opening the letter completes it', () => {
    const state = run([{ type: 'OPEN_LETTER' }], at(SceneIndex.Letter));
    expect(state.letterOpened).toBe(true);
    expect(state.completedSceneIds).toContain(SceneIndex.Letter);
  });

  it('replay resets every interaction but keeps the audio preference', () => {
    const played = at(SceneIndex.Finale, {
      completedSceneIds: [0, 1, 2, 3],
      extinguishedCandleIds: [0, 1, 2],
      cakeCut: true,
      letterOpened: true,
      isMusicEnabled: true,
    });
    const state = run([{ type: 'REPLAY' }], played);
    expect(state).toEqual({ ...initialExperienceState, isMusicEnabled: true });
  });
});
