/**
 * ✨ Edit this file to personalize the whole experience. ✨
 *
 * Every name, message, memory and media file lives here — components never
 * hard-code personal copy. `{recipientName}` and `{senderName}` placeholders
 * are replaced automatically anywhere in the text below.
 *
 * Media paths are relative to the `public/` folder, e.g. a photo saved as
 * `public/images/memories/beach.jpg` is referenced as `/images/memories/beach.jpg`.
 * Remember: everything in `public/` is publicly reachable by anyone with the link.
 */
import type { BirthdayConfig } from '../types/birthday';

export type { BirthdayConfig, MemoryItem, Relationship } from '../types/birthday';

export const birthdayConfig: BirthdayConfig = {
  recipientName: 'Birthday Star',
  senderName: 'Someone Who Cares',
  relationship: 'someone-special',
  welcomeSubtitle: 'I made a tiny magical world just for your birthday.',
  heartMessages: [
    'You make ordinary days feel magical.',
    'Your smile is a little piece of sunshine.',
    'You deserve all the happiness in the world.',
    'You bring warmth wherever you go.',
    'Your kindness is unforgettable.',
    'Life is sweeter with you around.',
    'You are wonderfully, uniquely you.',
    'Today is brighter because of you.',
    'Keep shining, birthday star!',
  ],
  balloonMessages: [
    'You make the world brighter! 💖',
    'Your smile is pure magic! ✨',
    'Today is all about you! 🎂',
    'You are one in a million! 💕',
    'Keep shining, birthday star! 🌟',
    'So many beautiful memories ahead! 🎈',
  ],
  memories: [
    { id: 'us-09', imageSrc: '/images/us/us-09.jpg', alt: 'Durga photo 09', caption: '' },
    { id: 'us-01', imageSrc: '/images/us/us-01.jpg', alt: 'Durga photo 01', caption: '' },
    { id: 'us-02', imageSrc: '/images/us/us-02.jpg', alt: 'Durga photo 02', caption: '' },
    { id: 'us-03', imageSrc: '/images/us/us-03.jpg', alt: 'Durga photo 03', caption: '' },
    { id: 'us-04', imageSrc: '/images/us/us-04.jpg', alt: 'Durga photo 04', caption: '' },
    { id: 'us-05', imageSrc: '/images/us/us-05.jpg', alt: 'Durga photo 05', caption: '' },
    { id: 'us-06', imageSrc: '/images/us/us-06.jpg', alt: 'Durga photo 06', caption: '' },
    { id: 'us-07', imageSrc: '/images/us/us-07.jpg', alt: 'Durga photo 07', caption: '' },
    { id: 'us-08', imageSrc: '/images/us/us-08.jpg', alt: 'Durga photo 08', caption: '' },
    { id: 'us-10', imageSrc: '/images/us/us-10.jpg', alt: 'Durga photo 10', caption: '' },
    { id: 'us-11', imageSrc: '/images/us/us-11.jpg', alt: 'Durga photo 11', caption: '' },
    { id: 'us-12', imageSrc: '/images/us/us-12.jpg', alt: 'Durga photo 12', caption: '' },
    { id: 'us-13', imageSrc: '/images/us/us-13.jpg', alt: 'Durga photo 13', caption: '' },
    { id: 'us-14', imageSrc: '/images/us/us-14.jpg', alt: 'Durga photo 14', caption: '' },
    { id: 'us-15', imageSrc: '/images/us/us-15.jpg', alt: 'Durga photo 15', caption: '' },
    { id: 'us-16', imageSrc: '/images/us/us-16.jpg', alt: 'Durga photo 16', caption: '' },
    { id: 'us-17', imageSrc: '/images/us/us-17.jpg', alt: 'Durga photo 17', caption: '' },
    { id: 'us-18', imageSrc: '/images/us/us-18.jpg', alt: 'Durga photo 18', caption: '' },
    { id: 'us-19', imageSrc: '/images/us/us-19.jpg', alt: 'Durga photo 19', caption: '' },
    { id: 'us-20', imageSrc: '/images/us/us-20.jpg', alt: 'Durga photo 20', caption: '' },
    { id: 'us-21', imageSrc: '/images/us/us-21.jpg', alt: 'Durga photo 21', caption: '' },
    { id: 'us-22', imageSrc: '/images/us/us-22.jpg', alt: 'Durga photo 22', caption: '' },
  ],
  letterParagraphs: [
    'Happy Birthday Durga! 🎂❤️🥳',
    'I hope ఈ 25th birthday నీ life లో చాలా happiness and beautiful memories ని ఇస్తుందని అనుకుంటున్నాను. 🥰✨ దేవుని దీవెనలు, ఆశీర్వాదాలు ఎప్పుడూ నీతో ఉండాలని దేవుణ్ణి ప్రార్థిస్తూ ఉంటాను. 🙏❤️',
    'ఇది కేవలం నీ birthday నే కాదు, ఇది నాకు కూడా ఒక special day. 💖 ఎందుకంటే నాకు ఇష్టమైన నువ్వు ఈ రోజే పుట్టావు కాబట్టి... ❤️',
    "I'm so glad that నువ్వు నా life లోకి వచ్చావు. 🫶 ఎన్నో beautiful memories and moments create చేశావు. 💕 నువ్వు చూపించే ప్రేమ, caring, loyalty, genuineness, honesty... ఇలా ఎన్నో beautiful qualities ఒక మనిషిలో ఉంటాయని prove చేశావు. ❤️",
    'ఇంకా నీ గురించి చెప్పాలంటే... నీ cute smile 😊 and ఆ cute eyes... Typing చేస్తున్నప్పుడు అవి గుర్తొచ్చి ఏం చెప్పాలో కూడా మర్చిపోతున్నా... 🙈❤️',
    'But anyways, Many More Happy Returns of the Day, బంగారం.... 🎂💗😘',
    'And చెప్పడం మర్చిపోయా... నీకో cute surprise ఉంది next! 🎁 నచ్చుతుందని అనుకుంటున్నా మరి....',
  ],
  letterClosingLine: 'May your next trip around the sun be filled with laughter, love, and little adventures.',
  // musicSrc: '/audio/our-song.mp3',
  // musicTitle: 'Our song',
};
