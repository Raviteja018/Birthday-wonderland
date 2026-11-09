export const SCENE_COUNT = 5;
export const LAST_SCENE = SCENE_COUNT - 1;
export const HEART_COUNT = 9;
export const HEARTS_TO_DISCOVER = 3;
export const CANDLE_COUNT = 3;
export const BALLOON_COUNT = 6;
export const MIN_HEART_MESSAGES = 8;
export const MIN_MEMORIES = 3;
export const MAX_MEMORIES = 24;

/** The six chapters. The love letter is the finale — there is no seventh scene. */
export const SCENES = [
  { id: 'welcome', title: 'A little surprise for you!' },
  { id: 'cake', title: 'Cut the cake!' },
  { id: 'memories', title: 'A walk down memory lane' },
  { id: 'letter', title: 'A letter from my heart' },
  { id: 'finale', title: 'One last surprise!' },
] as const;

export type SceneId = (typeof SCENES)[number]['id'];

export const SceneIndex = {
  Welcome: 0,
  Cake: 1,
  Memories: 2,
  Letter: 3,
  Finale: 4,
} as const;
