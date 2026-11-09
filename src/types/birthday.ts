export type MemoryItem = {
  id: string;
  imageSrc?: string;
  alt: string;
  caption: string;
  dateLabel?: string;
  videoSrc?: string;
  posterSrc?: string;
};

export type Relationship = 'girlfriend' | 'boyfriend' | 'best-friend' | 'someone-special';

export type BirthdayConfig = {
  recipientName: string;
  senderName: string;
  relationship: Relationship;
  welcomeSubtitle: string;
  /** At least 8; mapped deterministically to the tree's heart blossoms. */
  heartMessages: string[];
  /** Exactly 6 for the default scene (missing ones are filled with defaults). */
  balloonMessages: string[];
  /** 3–12 memories. Zero memories renders 3 decorative sample cards. */
  memories: MemoryItem[];
  letterParagraphs: string[];
  /** Closing flourish shown with the fairytale ending beneath the opened letter. */
  letterClosingLine: string;
  musicSrc?: string;
  musicTitle?: string;
};
