import type { BirthdayConfig, MemoryItem, Relationship } from '../types/birthday';
import { interpolateMessage } from '../utils/interpolateMessage';
import { BALLOON_COUNT, MAX_MEMORIES, MIN_HEART_MESSAGES } from '../state/constants';
import {
  DEFAULT_BALLOON_MESSAGES,
  DEFAULT_CLOSING_LINE,
  DEFAULT_HEART_MESSAGES,
  DEFAULT_LETTER,
  DEFAULT_RECIPIENT,
  DEFAULT_SAMPLE_MEMORIES,
  DEFAULT_SENDER,
  DEFAULT_WELCOME_SUBTITLE,
} from './defaults';

export type RelationshipCopy = {
  letterHeading: string;
  letterTeaser: string;
};

const RELATIONSHIP_COPY: Record<Relationship, RelationshipCopy> = {
  girlfriend: { letterHeading: 'A letter from my heart', letterTeaser: 'I wrote something just for you...' },
  boyfriend: { letterHeading: 'A letter from my heart', letterTeaser: 'I wrote something just for you...' },
  'someone-special': { letterHeading: 'A letter from my heart', letterTeaser: 'I wrote something just for you...' },
  'best-friend': { letterHeading: 'A letter just for you', letterTeaser: 'I wrote something for my favorite person...' },
};

export type ResolvedMemory = MemoryItem & { isSample: boolean };

/** A fully validated config: every string is interpolated and every list has a safe size. */
export type ResolvedConfig = {
  recipientName: string;
  senderName: string;
  relationship: Relationship;
  copy: RelationshipCopy;
  welcomeSubtitle: string;
  heartMessages: string[];
  balloonMessages: string[];
  memories: ResolvedMemory[];
  letterParagraphs: string[];
  letterClosingLine: string;
  musicSrc?: string;
  musicTitle?: string;
  warnings: string[];
};

const clean = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');
const cleanList = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(clean).filter(Boolean) : [];
const optionalPath = (value: unknown): string | undefined => clean(value) || undefined;

export function resolveConfig(raw: Partial<BirthdayConfig>): ResolvedConfig {
  const warnings: string[] = [];
  const recipientName = clean(raw.recipientName) || DEFAULT_RECIPIENT;
  const senderName = clean(raw.senderName) || DEFAULT_SENDER;
  const names = { recipientName, senderName };
  const fill = (text: string) => interpolateMessage(text, names);

  const relationship: Relationship =
    raw.relationship && raw.relationship in RELATIONSHIP_COPY ? raw.relationship : 'someone-special';

  let heartMessages = cleanList(raw.heartMessages);
  if (heartMessages.length < MIN_HEART_MESSAGES) {
    warnings.push(`heartMessages has ${heartMessages.length} entries; filled to ${MIN_HEART_MESSAGES} with defaults.`);
    const extras = DEFAULT_HEART_MESSAGES.filter((m) => !heartMessages.includes(m));
    heartMessages = [...heartMessages, ...extras].slice(0, Math.max(MIN_HEART_MESSAGES, heartMessages.length));
  }

  let balloonMessages = cleanList(raw.balloonMessages);
  if (balloonMessages.length !== BALLOON_COUNT) {
    warnings.push(`balloonMessages should have exactly ${BALLOON_COUNT} entries (found ${balloonMessages.length}).`);
    balloonMessages = [...balloonMessages, ...DEFAULT_BALLOON_MESSAGES.slice(balloonMessages.length)].slice(0, BALLOON_COUNT);
  }

  const rawMemories = Array.isArray(raw.memories) ? raw.memories.filter((m) => m && typeof m === 'object') : [];
  let memories: ResolvedMemory[] = rawMemories.slice(0, MAX_MEMORIES).map((m, i) => {
    const imageSrc = optionalPath(m.imageSrc);
    const videoSrc = optionalPath(m.videoSrc);
    const isSample = (!imageSrc && !videoSrc) || /(^|\/)sample-[^/]*$/.test(imageSrc ?? '');
    return {
      id: clean(m.id) || `memory-${i + 1}`,
      imageSrc,
      videoSrc,
      posterSrc: optionalPath(m.posterSrc),
      alt: fill(clean(m.alt) || `Memory ${i + 1}`),
      caption: fill(clean(m.caption)),
      dateLabel: clean(m.dateLabel) || undefined,
      isSample,
    };
  });
  if (rawMemories.length > MAX_MEMORIES) warnings.push(`Only the first ${MAX_MEMORIES} memories are shown.`);
  if (memories.length === 0) {
    warnings.push('No memories configured; showing decorative sample cards.');
    memories = DEFAULT_SAMPLE_MEMORIES.map((m) => ({ ...m, isSample: true }));
  }

  const letterSource = cleanList(raw.letterParagraphs);
  const letterParagraphs = (letterSource.length ? letterSource : DEFAULT_LETTER).map(fill);

  return {
    recipientName,
    senderName,
    relationship,
    copy: RELATIONSHIP_COPY[relationship],
    welcomeSubtitle: fill(clean(raw.welcomeSubtitle) || DEFAULT_WELCOME_SUBTITLE),
    heartMessages: heartMessages.map(fill),
    balloonMessages: balloonMessages.map(fill),
    memories,
    letterParagraphs,
    letterClosingLine: fill(clean(raw.letterClosingLine) || DEFAULT_CLOSING_LINE),
    musicSrc: optionalPath(raw.musicSrc),
    musicTitle: clean(raw.musicTitle) || undefined,
    warnings,
  };
}

/** Heart leaf N always shows the same message, cycling if there are more leaves than messages. */
export const heartMessageFor = (config: ResolvedConfig, heartId: number) =>
  config.heartMessages[heartId % config.heartMessages.length];
