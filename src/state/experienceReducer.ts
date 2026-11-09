import {
  CANDLE_COUNT,
  HEART_COUNT,
  HEARTS_TO_DISCOVER,
  LAST_SCENE,
  SceneIndex,
} from './constants';

export type ExperienceState = {
  sceneIndex: number;
  completedSceneIds: number[];
  discoveredHeartIds: number[];
  extinguishedCandleIds: number[];
  cakeCut: boolean;
  memoryIndex: number;
  hasViewedMemory: boolean;
  letterOpened: boolean;
  isTransitioning: boolean;
  isMusicEnabled: boolean;
};

export type ExperienceAction =
  | { type: 'GO_NEXT' }
  | { type: 'GO_BACK' }
  | { type: 'MARK_COMPLETE'; sceneIndex: number }
  | { type: 'DISCOVER_HEART'; id: number }
  | { type: 'EXTINGUISH_CANDLE'; id: number }
  | { type: 'CUT_CAKE' }
  | { type: 'SET_MEMORY_INDEX'; index: number; count: number }
  | { type: 'OPEN_LETTER' }
  | { type: 'SKIP_ACTIVITY' }
  | { type: 'REPLAY' }
  | { type: 'SET_MUSIC_ENABLED'; enabled: boolean }
  | { type: 'SET_TRANSITIONING'; value: boolean };

export const initialExperienceState: ExperienceState = {
  sceneIndex: SceneIndex.Welcome,
  completedSceneIds: [],
  discoveredHeartIds: [],
  extinguishedCandleIds: [],
  cakeCut: false,
  memoryIndex: 0,
  hasViewedMemory: false,
  letterOpened: false,
  isTransitioning: false,
  isMusicEnabled: false,
};

/** Scenes whose activity can be skipped (the welcome gift and the letter have their own actions). */
export const SKIPPABLE_SCENES: readonly number[] = [
  SceneIndex.Cake,
  SceneIndex.Memories,
];

const inRange = (id: number, count: number) => Number.isInteger(id) && id >= 0 && id < count;
const addUnique = (list: number[], id: number) => (list.includes(id) ? list : [...list, id]);

function activityDone(state: ExperienceState, scene: number): boolean {
  switch (scene) {
    case SceneIndex.Cake:
      return state.cakeCut;
    case SceneIndex.Memories:
      return false; // completed only via MARK_COMPLETE once the gallery has scrolled 70%
    case SceneIndex.Letter:
      return state.letterOpened;
    default:
      return false;
  }
}

export const isSceneComplete = (state: ExperienceState, scene: number) =>
  state.completedSceneIds.includes(scene);

/** Completion is sticky: once a scene is done it stays done until Replay. */
function withCompletion(state: ExperienceState): ExperienceState {
  let completed = state.completedSceneIds;
  for (let scene = SceneIndex.Cake; scene <= LAST_SCENE; scene++) {
    if (!completed.includes(scene) && activityDone(state, scene)) completed = [...completed, scene];
  }
  return completed === state.completedSceneIds ? state : { ...state, completedSceneIds: completed };
}

function moveTo(state: ExperienceState, sceneIndex: number): ExperienceState {
  return {
    ...state,
    sceneIndex,
    isTransitioning: true,
  };
}

function reduce(state: ExperienceState, action: ExperienceAction): ExperienceState {
  switch (action.type) {
    case 'GO_NEXT': {
      if (state.isTransitioning || state.sceneIndex >= LAST_SCENE) return state;
      // Opening the welcome gift is that scene's whole activity.
      const current =
        state.sceneIndex === SceneIndex.Welcome
          ? { ...state, completedSceneIds: addUnique(state.completedSceneIds, SceneIndex.Welcome) }
          : state;
      if (!isSceneComplete(current, current.sceneIndex)) return state;
      return moveTo(current, current.sceneIndex + 1);
    }
    case 'GO_BACK':
      if (state.isTransitioning || state.sceneIndex <= 0) return state;
      return moveTo(state, state.sceneIndex - 1);
    case 'MARK_COMPLETE':
      if (!inRange(action.sceneIndex, LAST_SCENE + 1)) return state;
      return { ...state, completedSceneIds: addUnique(state.completedSceneIds, action.sceneIndex) };
    case 'SKIP_ACTIVITY': {
      if (state.isTransitioning || !SKIPPABLE_SCENES.includes(state.sceneIndex)) return state;
      const skipped = { ...state, completedSceneIds: addUnique(state.completedSceneIds, state.sceneIndex) };
      return moveTo(skipped, state.sceneIndex + 1);
    }
    case 'DISCOVER_HEART':
      if (!inRange(action.id, HEART_COUNT)) return state;
      return { ...state, discoveredHeartIds: addUnique(state.discoveredHeartIds, action.id) };
    case 'EXTINGUISH_CANDLE':
      if (!inRange(action.id, CANDLE_COUNT)) return state;
      return { ...state, extinguishedCandleIds: addUnique(state.extinguishedCandleIds, action.id) };
    case 'CUT_CAKE':
      if (state.cakeCut || state.extinguishedCandleIds.length < CANDLE_COUNT) return state;
      return { ...state, cakeCut: true };
    case 'SET_MEMORY_INDEX': {
      if (action.count <= 0) return state;
      const index = Math.min(Math.max(Math.trunc(action.index) || 0, 0), action.count - 1);
      return { ...state, memoryIndex: index, hasViewedMemory: true };
    }
    case 'OPEN_LETTER':
      return state.letterOpened ? state : { ...state, letterOpened: true };
    case 'REPLAY':
      return {
        ...initialExperienceState,
        isMusicEnabled: state.isMusicEnabled,
        isTransitioning: state.sceneIndex !== SceneIndex.Welcome,
      };
    case 'SET_MUSIC_ENABLED':
      return state.isMusicEnabled === action.enabled ? state : { ...state, isMusicEnabled: action.enabled };
    case 'SET_TRANSITIONING':
      return state.isTransitioning === action.value ? state : { ...state, isTransitioning: action.value };
  }
}

export function experienceReducer(state: ExperienceState, action: ExperienceAction): ExperienceState {
  return withCompletion(reduce(state, action));
}
