# Birthday Wonderland 🎁

A personalized, interactive birthday surprise: a 3–5 minute fairytale mini-adventure in **six chapters** that works on phones and desktops, by touch, mouse or keyboard. No accounts, backend, camera or microphone needed.

| # | Chapter | What the visitor does |
|---|---------|------------------------|
| 1 | **Welcome** – “A little surprise for you!” | The twilight sky brightens, butterflies cross, and a smiling gift opens (ribbon wiggle → lid lift → confetti) |
| 2 | **Magical Heart Tree** | A sparkling seed plants a tree that grows on entry; tapping any 3 of 9 glowing heart blossoms reveals little compliments |
| 3 | **Birthday Cake** | Blows out 3 candles (each sends a wish-star floating up), then cuts the cake |
| 4 | **Pop the Balloons** | Six balloons rise in and bob; popping all 6 reveals messages that stay re-readable |
| 5 | **Memory Lane** | Flips through Polaroid memories in a pressed-flower scrapbook (buttons, ← →, or swipe) |
| 6 | **Love Letter — the finale** | Breaks the heart seal and reads the letter inside a moonlit fairytale ending: fireflies, butterflies, drifting petals, a one-time confetti flourish, and a “Happy Birthday” flourish beneath the letter |

**The letter is the ending.** There is no seventh scene: once it's open the visitor can stay as long as they like, with **Replay from beginning** (resets everything, keeps sound and animation preferences) and **Read letter again** (returns focus to the letter). Every activity has **Skip activity** (the letter has **Skip opening animation**, which still shows the full letter), a **Back** button from chapter 2 onwards, and a `Chapter X of 6` indicator with six tiny stars.

Built with React 19, TypeScript, Vite, Tailwind CSS v4, Motion for React (`motion`) and `canvas-confetti`. All illustrations are original inline SVG/CSS.

---

## Quick start

Requires Node.js 20+ (developed on Node 22).

```bash
npm install
npm run dev        # http://localhost:5173
```

The bundled sample configuration works immediately: no photos, music or video needed.

## Personalize it

Everything personal lives in **one file: [`src/config/birthdayConfig.ts`](src/config/birthdayConfig.ts)**. Components never hard-code names or messages.

```ts
export const birthdayConfig: BirthdayConfig = {
  recipientName: 'Maya',
  senderName: 'Sam',
  relationship: 'girlfriend', // 'girlfriend' | 'boyfriend' | 'best-friend' | 'someone-special'
  welcomeSubtitle: 'I made a tiny magical world just for your birthday.',
  heartMessages: [/* at least 8 */],
  balloonMessages: [/* exactly 6 */],
  memories: [/* 3–12 */],
  letterParagraphs: ['Dear {recipientName},', '…', 'With love, {senderName} 💖'],
  letterClosingLine: 'May your next trip around the sun be filled with…',
  musicSrc: '/audio/our-song.mp3',   // optional
  musicTitle: 'Our song',            // optional
};
```

- **Placeholders.** `{recipientName}` and `{senderName}` are replaced in every message. Text is always rendered as plain text, so names can't inject HTML.
- **Relationship.** `best-friend` switches the letter heading to friendlier, non-romantic wording. Review the sample messages to match your relationship.
- **Safe defaults.** Blank names fall back to “Birthday Star” and “Someone Who Cares”. Too few heart messages are topped up to 8, balloon messages are padded or trimmed to 6, and zero memories shows 3 decorative sample cards. In dev mode, the browser console lists anything that was auto-filled.

### Photos (Memory Lane)

1. Put images in `public/images/memories/`, e.g. `public/images/memories/beach.jpg`.
2. Reference them **without** `public`:

```ts
memories: [
  { id: 'beach', imageSrc: '/images/memories/beach.jpg', alt: 'Us laughing on the beach at sunset', caption: 'That windy beach day', dateLabel: 'June 2024' },
  { id: 'video-1', videoSrc: '/video/first-dance.mp4', posterSrc: '/video/first-dance.jpg', alt: 'Video of our first dance', caption: 'Our first dance' },
],
```

- Write real descriptive `alt` text; screen-reader users hear it.
- Resize photos to about 1600 px on the long side and compress them (WebP/AVIF or quality-80 JPEG; [Squoosh](https://squoosh.app) works well). Cards use a 4:3 frame (`object-cover`).
- Delete the three `sample-*.svg` entries (and files) once you add your own. Images named `sample-*` are labelled “Sample”.
- A missing or broken photo/video shows a friendly illustrated placeholder, never a broken-image icon.
- Memory videos never autoplay. They use native controls, and background music pauses while one plays. Add captions for videos with speech when you can.

### Music and sounds

- Sound is **off by default**. The **Sound** button in the header turns on gentle synthesized sound effects (no audio files) and, if `musicSrc` is set, loops your song.
- Put the file in `public/audio/` (MP3 is the most compatible) and set `musicSrc: '/audio/our-song.mp3'`.
- If the song can't load or the browser blocks playback, a short non-blocking note appears and the rest of the site works normally.
- Music pauses when the tab is hidden and resumes when it's visible again (if sound is on).

### Animation settings (the ✨ Magic button)

- **Reduce animations** — a visible switch, independent of the OS setting, that stills every ambient loop and animation. The OS-level `prefers-reduced-motion` is always honored too.
- **Magic intensity** — `Gentle` or `Full` controls ambient particle density (fireflies, petals, floating stars). It never affects required story actions.
- Both choices persist in `localStorage` (and degrade gracefully if storage is blocked).
- For tests and screenshots, loading any page with `?motion=reduce` deterministically disables all ambient motion.

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check (`tsc -b`) and production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | ESLint (TypeScript + React Hooks rules) |
| `npm run test` | Vitest unit and component tests |
| `npx playwright install chromium` | One-time browser download for e2e tests |
| `npm run test:e2e` | Playwright end-to-end tests (builds, serves `dist` on 127.0.0.1:4173) |

### What the tests cover

- **Unit/component** (`src/**/*.test.ts(x)`): placeholder interpolation, config validation and fallbacks, reducer bounds (0–5) and completion rules (unique hearts, candles before cutting, balloon dedupe and local reset, memory bounds, skip, letter completion, replay keeping the audio choice), and full component flows for every chapter — including the letter finale (closing line, read-again focus, replay), the Magic settings persistence, focus management, swipe/arrow-key gallery navigation, broken-photo fallback, clipboard fallback, and blocked or missing music.
- **End-to-end** (`tests/`, mobile 390×844 touch and desktop 1440×900):
  - the full happy path ending on the letter finale plus replay; the same flow with reduced motion; a keyboard-only playthrough
  - Back from every chapter preserving state, “Read letter again” focus, skip-everything, double-click guard, reload resets to chapter 1
  - no horizontal overflow at 320/375/390/768/1024/1440/1920 px
  - controls reachable and unclipped in mobile landscape and at 200% zoom; long-letter scrolling
  - broken memory asset fallback; the in-app Reduce-animations toggle
  - axe-core scan (WCAG 2.1 A/AA) of every chapter state including the finale and the settings panel
  - no console errors or failed requests

### Troubleshooting

- **Windows: “Vitest failed to find the runner”.** Your terminal's path uses a lower-case drive letter (`c:\…`), and Vitest loads twice. `cd C:\Users\…\birthday-wonderland` (capital `C:`) and run again.
- **Playwright: “Executable doesn't exist”.** Run `npx playwright install chromium`.
- **E2e flakiness on low-memory machines.** The config already caps Playwright at 2 workers; lower it to 1 with `npx playwright test --workers=1` if browsers still crash.

## Deploy (static hosting)

No server, database or environment variables are needed.

**Vercel:** import the repo, framework “Vite”, build command `npm run build`, output directory `dist`.
**Netlify:** build command `npm run build`, publish directory `dist`.
**Anywhere else:** run `npm run build` and upload the contents of `dist/`.

The app has no client-side routes, so no rewrite rules are required. After deploying, check: the direct URL loads over HTTPS, a refresh returns to chapter 1, a real phone works, and the link preview (title, description, `og-image.png`) looks right. To change the preview, replace `public/og-image.png` (1200×630) and edit the meta tags in `index.html`.

**To update:** edit `birthdayConfig.ts` or `public/` media, then rebuild and redeploy (or push, if your host builds from git).

## Privacy: please read

- Everything in `public/` and everything in the config is **publicly downloadable by anyone who has the link**. An unlisted URL is **not** access control; links get forwarded, previewed and indexed.
- Don't publish photos, videos or words you wouldn't be comfortable with anyone seeing. Never put passwords, addresses or other secrets in the project.
- Truly private content needs authentication and private storage (e.g. password-protected hosting), which is outside this static project's scope.
- The site collects nothing: no analytics, cookies, forms or tracking. Animation preferences are stored only in the visitor's own browser. The only third-party request is Google Fonts (optional; the site falls back to system fonts if it's blocked or offline). To avoid it entirely, remove the font `<link>` tags from `index.html`.

## Assets and licensing

- All illustrations (gift, tree, cake, balloons, envelope, moon, butterflies, fireflies, petals, sample memory SVGs, favicon) are original SVG/CSS made for this project, and you may reuse and modify them.
- Sound effects are synthesized in the browser with the Web Audio API; no audio files are bundled.
- Fonts: Fredoka, Nunito and Caveat from Google Fonts (SIL Open Font License).
- **Your own media:** only use photos, music and video you own or are licensed to share publicly. Most commercial songs are not licensed for publishing on a website, so prefer royalty-free music with a licence that permits web use, and keep the licence/attribution.

## Project structure

```text
src/
  config/        birthdayConfig.ts (edit me), defaults, resolveConfig (validation + fallbacks)
  state/         experienceReducer (all navigation & completion rules), constants, context
  hooks/         useSceneNavigation, useAudio, useReducedMotion, useSettings, useTimeouts
  components/    layout, navigation, progress stars, audio toggle, Magic settings,
                 SVG illustrations, FairyAmbience (butterflies, fireflies, petals, moon), fallbacks
  scenes/        one file per chapter (the letter scene is the finale)
  utils/         interpolateMessage, confetti, synthesized sfx
tests/           Playwright e2e specs
```

## Accessibility and motion

- Semantic landmarks and buttons throughout (no clickable `div`s), visible focus rings and 44 px+ targets.
- Focus moves to each new chapter heading — and to the letter itself when it opens — the page title updates with the chapter, and `aria-live` announces revealed messages and progress.
- Reduced motion (OS setting, the in-app toggle, or `?motion=reduce`) removes bobbing, particles, confetti and large movement. Every chapter still completes, with no timing-dependent steps.
- Escape closes open message cards and the settings panel; focus is never trapped.
