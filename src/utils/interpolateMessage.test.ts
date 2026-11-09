import { describe, expect, it } from 'vitest';
import { interpolateMessage } from './interpolateMessage';

const names = { recipientName: 'Maya', senderName: 'Sam' };

describe('interpolateMessage', () => {
  it('replaces recipient and sender placeholders, including repeats', () => {
    expect(interpolateMessage('Dear {recipientName}, love {senderName}. {recipientName}!', names)).toBe(
      'Dear Maya, love Sam. Maya!',
    );
  });

  it('leaves unknown placeholders and plain text untouched', () => {
    expect(interpolateMessage('Hi {friend} and {recipientname}', names)).toBe('Hi {friend} and {recipientname}');
  });

  it('inserts names literally without interpreting markup or replacement patterns', () => {
    const tricky = { recipientName: '<img src=x onerror=alert(1)>', senderName: '$& $1 $$' };
    expect(interpolateMessage('{recipientName} / {senderName}', tricky)).toBe('<img src=x onerror=alert(1)> / $& $1 $$');
  });
});
