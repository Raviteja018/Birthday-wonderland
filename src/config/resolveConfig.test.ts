import { describe, expect, it } from 'vitest';
import { birthdayConfig } from './birthdayConfig';
import { DEFAULT_BALLOON_MESSAGES, DEFAULT_CLOSING_LINE } from './defaults';
import { heartMessageFor, resolveConfig } from './resolveConfig';
import { BALLOON_COUNT, HEART_COUNT, MAX_MEMORIES, MIN_HEART_MESSAGES } from '../state/constants';

describe('resolveConfig', () => {
  it('accepts the bundled sample config without warnings', () => {
    const config = resolveConfig(birthdayConfig);
    expect(config.warnings).toEqual([]);
    expect(config.recipientName).toBe('Birthday Star');
    expect(config.heartMessages.length).toBeGreaterThanOrEqual(MIN_HEART_MESSAGES);
    expect(config.balloonMessages).toHaveLength(BALLOON_COUNT);
    expect(config.memories).toHaveLength(3);
    expect(config.memories.every((m) => m.isSample)).toBe(true);
    expect(config.letterParagraphs[0]).toBe('Dear Birthday Star,');
    expect(config.letterParagraphs.at(-1)).toBe('With love, Someone Who Cares 💖');
    expect(config.musicSrc).toBeUndefined();
  });

  it('falls back to default names when they are blank', () => {
    const config = resolveConfig({ ...birthdayConfig, recipientName: '   ', senderName: '' });
    expect(config.recipientName).toBe('Birthday Star');
    expect(config.senderName).toBe('Someone Who Cares');
  });

  it('interpolates names into every message list', () => {
    const config = resolveConfig({
      ...birthdayConfig,
      recipientName: 'Maya',
      senderName: 'Sam',
      heartMessages: Array.from({ length: 8 }, () => 'Hi {recipientName}'),
      letterClosingLine: 'From {senderName}',
    });
    expect(config.heartMessages.every((m) => m === 'Hi Maya')).toBe(true);
    expect(config.letterClosingLine).toBe('From Sam');
    expect(config.letterParagraphs[0]).toBe('Dear Maya,');
  });

  it('fills missing hearts, balloons, memories, letter and final message with safe defaults', () => {
    const config = resolveConfig({
      heartMessages: ['Only one'],
      balloonMessages: ['A', '', 'B'],
      memories: [],
      letterParagraphs: [],
      letterClosingLine: '',
    });
    expect(config.heartMessages).toHaveLength(MIN_HEART_MESSAGES);
    expect(config.heartMessages[0]).toBe('Only one');
    expect(config.heartMessages.every(Boolean)).toBe(true);
    expect(config.balloonMessages).toEqual(['A', 'B', ...DEFAULT_BALLOON_MESSAGES.slice(2)]);
    expect(config.memories).toHaveLength(3);
    expect(config.memories.every((m) => m.isSample && !m.imageSrc)).toBe(true);
    expect(config.letterParagraphs.length).toBeGreaterThan(1);
    expect(config.letterClosingLine).toBe(DEFAULT_CLOSING_LINE);
    expect(config.warnings.length).toBeGreaterThan(0);
  });

  it('trims extra balloons and caps memories at the maximum', () => {
    const memories = Array.from({ length: 15 }, (_, i) => ({ id: `m${i}`, alt: `Alt ${i}`, caption: `C ${i}`, imageSrc: `/p${i}.jpg` }));
    const config = resolveConfig({ ...birthdayConfig, balloonMessages: Array(9).fill('x'), memories });
    expect(config.balloonMessages).toHaveLength(BALLOON_COUNT);
    expect(config.memories).toHaveLength(MAX_MEMORIES);
    expect(config.memories[0].isSample).toBe(false);
  });

  it('switches letter copy for non-romantic relationships', () => {
    expect(resolveConfig({ ...birthdayConfig, relationship: 'best-friend' }).copy.letterHeading).toBe('A letter just for you');
    expect(resolveConfig({ ...birthdayConfig, relationship: 'girlfriend' }).copy.letterHeading).toBe('A letter from my heart');
  });

  it('maps every heart leaf to a message deterministically', () => {
    const config = resolveConfig(birthdayConfig);
    for (let id = 0; id < HEART_COUNT; id++) {
      expect(heartMessageFor(config, id)).toBe(heartMessageFor(config, id));
      expect(heartMessageFor(config, id)).toBeTruthy();
    }
  });
});
