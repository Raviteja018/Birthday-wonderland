import type { MemoryItem } from '../types/birthday';

export const DEFAULT_RECIPIENT = 'Birthday Star';
export const DEFAULT_SENDER = 'Someone Who Cares';
export const DEFAULT_WELCOME_SUBTITLE = 'I made a tiny magical world just for your birthday.';

export const DEFAULT_HEART_MESSAGES = [
  'You make ordinary days feel magical.',
  'Your laugh is my favorite soundtrack.',
  'You deserve all the happiness today.',
  'You bring warmth wherever you go.',
  'Your kindness is unforgettable.',
  'Life is sweeter with you around.',
  'You are wonderfully, uniquely you.',
  'Today is brighter because of you.',
  'Keep shining, birthday star!',
];

export const DEFAULT_BALLOON_MESSAGES = [
  'You make the world brighter! 💖',
  'Your smile is pure magic! ✨',
  'Today is all about you! 🎂',
  'You are one in a million! 💕',
  'Keep shining, birthday star! 🌟',
  'So many beautiful memories ahead! 🎈',
];

export const DEFAULT_SAMPLE_MEMORIES: MemoryItem[] = [
  { id: 'sample-1', alt: 'Decorative placeholder for the first memory', caption: 'Sample memory — add your favorite memory here.' },
  { id: 'sample-2', alt: 'Decorative placeholder for the second memory', caption: 'Sample memory — add another happy moment here.' },
  { id: 'sample-3', alt: 'Decorative placeholder for the third memory', caption: 'Sample memory — add a moment worth remembering here.' },
];

export const DEFAULT_LETTER = [
  'Dear {recipientName},',
  'Happy Birthday! I hope today brings you a thousand tiny reasons to smile. You make the world brighter just by being in it. I made this little adventure to remind you how special you are.',
  "Here's to more laughter, wonderful memories, and beautiful surprises ahead.",
  'With love, {senderName} 💖',
];

export const DEFAULT_CLOSING_LINE =
  'May your next trip around the sun be filled with laughter, love, and little adventures.';
